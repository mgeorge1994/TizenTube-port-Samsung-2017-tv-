/* Bridge client.
   The TV talks to a small LAN service (bridge/server.mjs) that owns all YouTube
   I/O: feed + search metadata, and muxed, ad-free stream files. Nothing here
   ever loads youtube.com/tv, so there is no ad surface at all. */
var API = {
  base: (function () {
    /* `?bridge=http://host:8787` wins for local QA. The widget itself uses
       window.YT_BRIDGE from config.js (the home LAN address). */
    var q = /[?&]bridge=([^&]+)/.exec(location.search);
    if (q) {
      try { return decodeURIComponent(q[1]); } catch (e) { return q[1]; }
    }
    var stored = U.store.get('bridge', null);
    if (stored) return stored;
    if (window.YT_BRIDGE) return window.YT_BRIDGE;
    if (location.protocol === 'file:' || location.protocol === 'http:') {
      return 'http://' + location.hostname + ':8787';
    }
    return 'http://127.0.0.1:8787';
  })(),

  mock: /(\?|&)mock=1/.test(location.search),

  url: function (path) { return this.base + path; },

  /* The configured LAN address can change (DHCP, laptop on another network).
     Try the local bridge as well so the TV app and desktop QA both keep working
     even when config.js still carries the old address. */
  fallbacks: function () {
    var host = location.hostname;
    var list = [];
    if (host) list.push('http://' + host + ':8787');
    list.push('http://127.0.0.1:8787');
    if (host !== 'localhost') list.push('http://localhost:8787');
    var self = this;
    return list.filter(function (u, i) {
      return u !== self.base && list.indexOf(u) === i;
    });
  },

  _probe: null,

  resolveBridge: function () {
    if (this._probe) return this._probe;
    var self = this;
    var candidates = [this.base].concat(this.fallbacks());
    this._probe = new Promise(function (resolve) {
      var i = 0;
      function next() {
        if (i >= candidates.length) {
          self._probe = null;
          resolve(self.base);
          return;
        }
        var base = candidates[i++];
        self.raw(base, 'GET', '/api/ping', 1500).then(function (r) {
          if (r && r.ok) {
            self.base = base;
            resolve(base);
          } else next();
        }).catch(next);
      }
      next();
    });
    return this._probe;
  },

  raw: function (base, method, path, timeout, body) {
    return new Promise(function (resolve, reject) {
      var x = new XMLHttpRequest();
      x.open(method, base + path, true);
      x.timeout = timeout || 12000;
      x.onload = function () {
        if (x.status >= 200 && x.status < 300) {
          try { resolve(JSON.parse(x.responseText)); }
          catch (e) { reject(new Error('bad json')); }
        } else {
          reject(new Error('HTTP ' + x.status));
        }
      };
      x.onerror = function () { reject(new Error('network')); };
      x.ontimeout = function () { reject(new Error('timeout')); };
      if (body !== undefined && body !== null) {
        x.setRequestHeader('content-type', 'application/json');
        try { x.send(JSON.stringify(body)); }
        catch (e) { reject(e); }
      } else {
        x.send();
      }
    });
  },

  get: function (path, timeout) {
    return this.request('GET', path, timeout);
  },

  post: function (path, timeout, body) {
    return this.request('POST', path, timeout, body);
  },

  request: function (method, path, timeout, body) {
    var self = this;
    return this.resolveBridge().then(function () {
      return self.raw(self.base, method, path, timeout, body);
    });
  },

  ping: function () {
    if (this.mock) return Promise.resolve({ ok: true, mock: true, adblock: true, version: 'mock' });
    return this.get('/api/ping', 4000);
  },

  /* Fire-and-forget diagnostics for TV-only playback/key issues. */
  log: function (event, data) {
    if (this.mock) return;
    try {
      var body = Object.assign({ event: event }, data || {});
      this.raw(this.base, 'POST', '/api/log', 1500, body).catch(function () {});
    } catch (e) {}
  },

  authStart: function () {
    if (this.mock) return Promise.resolve({ status: 'error', message: 'Sign-in needs the bridge' });
    return this.get('/api/auth/start', 30000);
  },
  authStatus: function () {
    if (this.mock) return Promise.resolve({ status: 'idle' });
    return this.get('/api/auth/status', 10000);
  },
  profile: function () {
    if (this.mock) return Promise.resolve({ status: 'signed_out' });
    return this.get('/api/profile', 10000);
  },
  signOut: function () {
    if (this.mock) return Promise.resolve({ status: 'signed_out' });
    return this.get('/api/auth/signout', 10000);
  },

  accounts: function () {
    if (this.mock) return Promise.resolve({
      activeId: 'acc_mock',
      accounts: [{ id: 'acc_mock', name: 'YouTube account', handle: '@you', avatar: '' }]
    });
    return this.get('/api/accounts', 10000);
  },

  activateAccount: function (id) {
    if (this.mock) return Promise.resolve({ status: 'ok' });
    return this.get('/api/accounts/activate/' + encodeURIComponent(id), 10000);
  },

  removeAccount: function (id) {
    if (this.mock) return Promise.resolve({ status: 'ok', accounts: { accounts: [], activeId: null } });
    return this.get('/api/accounts/remove/' + encodeURIComponent(id), 10000);
  },

  home: function () {
    if (this.mock) return Promise.resolve(MOCK.home());
    return this.get('/api/home', 25000);
  },

  /* Personal shelves come from the bridge's OAuth-backed TV session. */
  history: function () {
    if (this.mock) return Promise.resolve({ items: U.store.get('history', []) });
    return this.get('/api/history', 60000)
      .then(function (r) { return r; })
      .catch(function () { return { items: U.store.get('history', []) }; });
  },

  historyState: function () {
    if (this.mock) return Promise.resolve({ paused: false });
    return this.get('/api/history/state', 30000)
      .catch(function () { return { paused: false }; });
  },

  historyPause: function (pause) {
    if (this.mock) return Promise.resolve({ ok: true, paused: !!pause });
    return this.post('/api/history/pause', 30000, { pause: !!pause });
  },

  /* YouTube Music catalog, resolved by the bridge's public YTMUSIC client. */
  musicHome: function () {
    if (this.mock) return Promise.resolve({ rows: [] });
    return this.get('/api/music/home', 30000).catch(function () { return { rows: [] }; });
  },
  musicSearch: function (q) {
    if (this.mock) return Promise.resolve({ items: [] });
    return this.get('/api/music/search?q=' + encodeURIComponent(q), 30000)
      .catch(function () { return { items: [] }; });
  },
  musicSuggest: function (q) {
    if (this.mock) return Promise.resolve({ items: [] });
    return this.get('/api/music/suggest?q=' + encodeURIComponent(q), 15000)
      .catch(function () { return { items: [] }; });
  },
  musicBrowse: function (id) {
    if (this.mock) return Promise.resolve({ items: [], title: 'Music' });
    return this.get('/api/music/browse/' + encodeURIComponent(id), 30000);
  },
  musicLyrics: function (id) {
    if (this.mock) return Promise.resolve({ lyrics: '' });
    return this.get('/api/music/lyrics/' + encodeURIComponent(id), 30000);
  },
  musicQueue: function (id) {
    if (this.mock) return Promise.resolve({ items: [] });
    return this.get('/api/music/queue/' + encodeURIComponent(id), 30000);
  },
  /* Signed-in library composed from the account's real playlists/history.
     YTMUSIC itself cannot accept the TV OAuth token, so the bridge builds
     these shelves from the authenticated TV session. */
  musicPersonal: function () {
    if (this.mock) return Promise.resolve({ rows: [] });
    return this.get('/api/music/personal', 30000)
      .catch(function () { return { rows: [] }; });
  },
  captions: function (id, lang, ai) {
    if (this.mock) return Promise.resolve({ track: null, cues: [] });
    var q = '?lang=' + encodeURIComponent(lang || 'en') + '&ai=' + (ai === false ? 0 : 1);
    return this.get('/api/captions/' + encodeURIComponent(id) + q, 30000)
      .catch(function () { return { track: null, cues: [] }; });
  },
  storyboard: function (id) {
    if (this.mock) return Promise.resolve({ storyboard: null });
    return this.get('/api/storyboard/' + encodeURIComponent(id), 20000)
      .catch(function () { return { storyboard: null }; });
  },
  ryd: function (id) {
    if (this.mock) return Promise.resolve({ dislikes: 0 });
    return this.get('/api/ryd/' + encodeURIComponent(id), 15000)
      .catch(function () { return { dislikes: 0 }; });
  },

  recommendations: function () {
    if (this.mock) return Promise.resolve({ rows: [] });
    return this.get('/api/recommendations', 30000)
      .then(function (r) { return r; })
      .catch(function () { return { rows: [] }; });
  },

  /* Real playlists from the signed-in account, including Liked videos. */
  playlists: function () {
    if (this.mock) return Promise.resolve({ items: [], liked: [], saved: [] });
    return this.get('/api/playlists', 30000)
      .then(function (r) { return r; })
      .catch(function () { return { items: [], liked: [], saved: [] }; });
  },

  playlist: function (p) {
    if (this.mock) return Promise.resolve({ items: [], title: p.title || 'Playlist' });
    var url = '/api/playlist/' + encodeURIComponent(p.id || p.playlistId);
    if (p.title) url += '?title=' + encodeURIComponent(p.title);
    return this.get(url, 60000)
      .then(function (r) { return r; })
      .catch(function () { return { items: [], title: p.title || 'Playlist' }; });
  },

  search: function (q) {
    if (this.mock) return Promise.resolve(MOCK.search(q));
    return this.get('/api/search?q=' + encodeURIComponent(q), 25000);
  },

  suggest: function (q) {
    if (this.mock) return Promise.resolve(MOCK.suggest(q));
    return this.get('/api/suggest?q=' + encodeURIComponent(q), 6000)
      .then(function (r) { return r; })
      .catch(function () { return { items: [] }; });
  },

  video: function (id) {
    if (this.mock) return Promise.resolve(MOCK.video(id));
    return this.get('/api/video/' + id, 20000);
  },

  /* Real account like, not a local-only collection. */
  like: function (id, liked) {
    return this.rating(id, liked ? 'like' : 'remove');
  },

  rating: function (id, mode) {
    if (this.mock) return Promise.resolve({ ok: true, liked: mode === 'like', disliked: mode === 'dislike' });
    return this.post('/api/like/' + encodeURIComponent(id) + '?mode=' + mode, 15000);
  },

  channel: function (id) {
    if (this.mock) return Promise.resolve(MOCK.channel(id));
    return this.get('/api/channel/' + encodeURIComponent(id), 25000);
  },

  subscribeState: function (id) {
    if (this.mock) return Promise.resolve({ subscribed: false });
    return this.get('/api/subscribe/' + encodeURIComponent(id), 20000)
      .catch(function () { return { subscribed: false }; });
  },
  subscribe: function (id, on) {
    if (this.mock) return Promise.resolve({ ok: true, subscribed: !!on });
    return this.post('/api/subscribe/' + encodeURIComponent(id), 20000, { subscribe: !!on });
  },

  /* The exact actions YouTube TV shows when a video tile is held down. */
  menu: function (id) {
    if (this.mock) return Promise.resolve(MOCK.menu(id));
    return this.get('/api/menu/' + encodeURIComponent(id), 25000);
  },

  menuAction: function (path, payload) {
    if (this.mock) return Promise.resolve({ ok: true });
    return this.post('/api/action', 15000, { path: path, payload: payload });
  },

  save: function (id, playlistId) {
    if (this.mock) return Promise.resolve({ ok: true });
    return this.post('/api/save', 15000, { id: id, playlistId: playlistId });
  },

  comments: function (id) {
    if (this.mock) return Promise.resolve(MOCK.comments(id));
    return this.get('/api/comments/' + encodeURIComponent(id), 20000);
  },

  branding: function (id) {
    if (this.mock) return Promise.resolve({ title: null, thumbnail: null });
    return this.get('/api/branding/' + encodeURIComponent(id), 10000);
  },

  /* kicks off the mux job; resolves with {state, pct} */
  prepare: function (id, quality) {
    if (this.mock) return Promise.resolve({ state: 'ready', pct: 100 });
    return this.get('/api/prepare/' + id + '?q=' + quality, 15000);
  },

  /* Starts (or reuses) a job without waiting for a response. Focus calls this
     so the ~12s URL resolve overlaps the time the user spends looking at a tile. */
  prefetch: function (id, quality) {
    if (this.mock) return Promise.resolve({ ok: true });
    return this.get('/api/prefetch/' + encodeURIComponent(id) + '?q=' + quality, 4000)
      .catch(function () { return { ok: false }; });
  },

  /* Bump STREAM_REV whenever the bridge's mux format changes. It forces the TV
     to drop any cached copy of an older, truncated MP4. */
  STREAM_REV: 5,

  streamUrl: function (id, quality, nonce) {
    var u = '/media/' + id + '.mp4?q=' +
      (this.mock ? 720 : quality) + '&v=' + this.STREAM_REV;
    if (nonce) u += '&nc=' + nonce;
    return this.url(u);
  },

  thumb: function (id) { return U.thumb(id); }
};

/* ---------- offline fixtures, used by ?mock=1 for UI work in a desktop browser ---------- */
var MOCK = {
  /* IDs with real muxed files already in bridge/cache — never a rickroll ID */
  ids: ['p6GKKdwufOk', 'tcAC5W6nxCU', 'yrx1OB6apO4'],
  seed: function (query) {
    var names = ['Deep Field', 'Signal & Noise', 'The Long Take', 'Атлас', 'Slow Motion',
      'Night Shift', 'Paper Planes', 'Analog Days', 'Blue Hour', 'Field Notes'];
    var chans = ['Veritasium', 'Kurzgesagt', 'NileRed', 'Tom Scott', 'Primer',
      'Practical Engineering', '3Blue1Brown', 'Steve Mould'];
    var q = String(query || '').trim();
    var out = [];
    for (var i = 0; i < 14; i++) {
      var id = this.ids[i % this.ids.length];
      out.push({
        id: id,
        title: (q ? '“' + q + '” — ' : '') + names[i % names.length] + ' — a study in ' + (i + 3) + ' parts',
        channel: chans[i % chans.length],
        duration: 240 + i * 137,
        views: 12000 + i * 98431,
        published: '2026-0' + (1 + (i % 8)) + '-12T10:00:00Z',
        thumb: 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'
      });
    }
    return out;
  },
  home: function () {
    var v = this.seed();
    return {
      rows: [
        { title: 'Continue watching', items: v.slice(0, 5) },
        { title: 'Music', items: v.slice(2, 10) },
        { title: 'Documentary', items: v.slice(4, 12) },
        { title: 'Technology', items: v.slice(0, 8) }
      ],
      hero: v[0]
    };
  },
  search: function (q) { return { items: this.seed(q) }; },
  suggest: function (q) {
    var low = String(q || '').toLowerCase();
    if (!low) return { items: [] };
    var words = ['ver', 'veritasium', 'verity', 'verity song', 'verity trailer',
      'verzuz', 'verified', 'video', 'vlog', 'verification'];
    var out = words.filter(function (w) { return w.indexOf(low) === 0; });
    if (!out.length) out = words.filter(function (w) { return w.indexOf(low) >= 0; });
    return { items: out.slice(0, 3) };
  },
  video: function (id) {
    var all = this.seed();
    var v = null;
    for (var i = 0; i < all.length; i++) if (all[i].id === id) { v = all[i]; break; }
    if (!v) v = all[0];
    return {
      id: id, title: v.title, channel: v.channel, channelId: 'UCmock0000000000000000',
      duration: 212, likes: 4821, liked: false,
      views: v.views, published: v.published, description: 'A mock description for layout work.',
      related: all.slice(1, 9), segments: []
    };
  },
  channel: function (id) {
    return {
      id: id || 'UCmock0000000000000000', title: 'Mock Channel', handle: '@mockchannel',
      subscribers: '1.2M subscribers', videoCount: '48 videos', avatar: '',
      items: MOCK.seed('channel').slice(0, 9)
    };
  },
  comments: function (id) {
    return {
      items: [
        { author: '@mockviewer', text: 'Mock comment one for layout work.', likes: '1.2K', published: '2 days ago' },
        { author: '@tvuser', text: 'Mock comment two.', likes: '843', published: '1 week ago' }
      ]
    };
  },
  menu: function (id) {
    return {
      id: id, title: (this.video(id).title || ''), subtitle: '', thumbnail: '',
      items: [
        { label: 'Save to Watch later', kind: 'endpoint', path: '/browse/edit_playlist', payload: {} },
        { label: 'Save to playlist', value: '›', kind: 'playlists' },
        { label: 'Go to channel', kind: 'browse', browseId: 'UCmock0000000000000000' }
      ]
    };
  }
};
