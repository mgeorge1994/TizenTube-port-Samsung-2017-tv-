/* App shell: routing, back stack, service status. */
var App = {
  stack: [],
  screen: 'home',
  service: null,
  _tvPoll: null,
  _tvBusy: false,

  boot: function () {
    var self = this;
    bindKeys(function () { self.back(); });
    document.body.classList.toggle('highcontrast', U.store.get('highcontrast', false));

    /* The TV can be switched off without a clean Back/close. Persist the last
       position whenever the page is hidden or unloaded. */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && Player.active()) Player.save();
    });
    window.addEventListener('pagehide', function () {
      if (Player.active()) Player.save();
    });

    API.ping().then(function (r) {
      App.service = r;
    }).catch(function () {
      App.service = { offline: true };
    });

    /* Keep the rail avatar/name honest even if the bridge got a better
       profile after sign-in (the device-code flow can finish asynchronously). */
    API.profile().then(function (r) {
      if (r && r.status === 'signed_in' && r.profile) {
        U.store.set('account', r.profile);
        if (window.VIEW && VIEW.syncAccount) VIEW.syncAccount();
      }
    }).catch(function () {});

    this.go('home', true);

    // keep the clock honest across long sessions
    setInterval(function () {
      if (self.screen === 'home' && !Player.active()) {
        // no timer UI, but refresh relative dates when the view is idle
      }
    }, 60000);

    // Receive "Watch on TV" commands sent by the phone to the bridge.
    this._tvPoll = setInterval(function () { self.pollRemotePlay(); }, 2000);
    setTimeout(function () { self.pollRemotePlay(); }, 500);
  },

  pollRemotePlay: function () {
    var self = this;
    if (this._tvBusy || !window.API || !API.get) return;
    this._tvBusy = true;
    API.get('/api/tv/pending', 3500).then(function (r) {
      if (!r || !r.pending || !r.id) return;
      var item = { id: r.id, title: r.title || '', channel: r.channel || '' };
      var pos = Math.max(0, Number(r.position) || 0);
      U.toast('Playing on TV');
      if (Player.active() && Player._id === r.id && pos > 0) {
        // Same video already open: jump to requested position.
        Player._resume = pos;
        Player.waitReady(r.id).catch(function () {});
      } else {
        Player.open(r.id, item, true, pos);
      }
    }).catch(function () {
      // bridge offline/unreachable: ignore silently
    }).then(function () { self._tvBusy = false; }, function () { self._tvBusy = false; });
  },

  go: function (screen, replace, data) {
    /* The mini player keeps the browse screen mounted underneath, so routing
       is only locked while the full-screen player is on top. */
    if (Player.active() && !Player._mini) return;
    if (!replace && this.screen !== screen) this.stack.push(this.screen);
    this.screen = screen;
    if (window.Preview) Preview.hide();
    var v = document.getElementById('view');
    v.className = '';
    v.scrollTop = 0;

    /* the search screen moves its field into the topbar; take it back out
       when leaving so the normal header pill is the only affordance */
    var tb = document.querySelector('.topbar');
    var live = tb.querySelector('.searchbox');
    if (live && screen !== 'search' && screen !== 'musicSearch') tb.removeChild(live);

    if (screen === 'home') VIEW.home();
    else if (screen === 'search') VIEW.search('');
    else if (screen === 'library') VIEW.library();
    else if (screen === 'playlists') VIEW.playlists();
    else if (screen === 'playlist') {
      if (data) this.playlistData = data;
      VIEW.playlist(this.playlistData || { title: 'Playlist' });
    }
    else if (screen === 'channel') {
      if (data) this.channelData = data;
      VIEW.channel(this.channelData || {});
    }
    else if (screen === 'saved') VIEW.collection('saved', 'Watch later');
    else if (screen === 'liked') VIEW.collection('liked', 'Liked videos');
    else if (screen === 'music') VIEW.music();
    else if (screen === 'musicSearch') VIEW.search('', 'music');
    else if (screen === 'musicBrowse') {
      if (data) this.musicData = data;
      VIEW.musicBrowse(this.musicData || {});
    }
    else if (screen === 'podcasts') VIEW.topic('podcasts', 'Podcasts', 'podcasts');
    else if (screen === 'news') VIEW.topic('news', 'News', 'news');
    else if (screen === 'settings') VIEW.settings();
    else if (screen === 'account') VIEW.account();
  },

  open: function (id, item) {
    /* Continue watching / history tiles carry the exact saved position, or a
       progress fraction of the real duration. Resume there instead of 0:00. */
    function positionOf(src) {
      if (!src) return 0;
      if (Number(src.position) > 0) return Number(src.position);
      var d = Number(src.duration) || 0;
      var p = Number(src.progress) || 0;
      /* YouTube's percent can be slightly stale; only ignore a near-finished
         video, not a normal partially watched one. */
      return (d > 0 && p > 0.01 && p < 0.995) ? Math.round(d * p) : 0;
    }
    /* Always prefer our own last saved position over YouTube's progress: the
       local value is written every two seconds and survives remote opens. */
    var at = 0;
    var found = false;
    var hist = U.store.get('history', []);
    for (var i = 0; i < hist.length; i++) {
      if (hist[i] && hist[i].id === id) { at = positionOf(hist[i]); found = true; break; }
    }
    if (!at) at = positionOf(item);
    API.log('app.open', { id: id, resume: at, history: hist.length, found: found,
      itemPosition: item && item.position, itemProgress: item && item.progress,
      itemDuration: item && item.duration });
    Player.open(id, item, false, at);
  },

  afterPlayer: function () {
    // returning from the player: keep the cursor where it was, refresh progress bars
    if (this.screen === 'home') {
      var r = Nav.r, c = Nav.c;
      VIEW.home();
      setTimeout(function () {
        Nav.r = Math.min(r, Nav.rows.length - 1);
        Nav.c = Math.min(c, Nav.rows[Nav.r].items.length - 1);
        Nav.refresh();
      }, 400);
    } else if (this.screen === 'playlist' && this.playlistData) {
      VIEW.playlist(this.playlistData);
    } else if (this.screen === 'channel' && this.channelData) {
      VIEW.channel(this.channelData);
    }
  },

  back: function () {
    if (Player.active()) { Player.close(); return; }
    if (this.screen === 'settings' && VIEW.settingsBack && VIEW.settingsBack()) return;
    if (this.stack.length) {
      var prev = this.stack.pop();
      this.screen = prev;
      this.go(prev, true, prev === 'playlist' ? this.playlistData :
        prev === 'channel' ? this.channelData : null);
      return;
    }
    if (this.screen !== 'home') { this.go('home', true); return; }
    this.exit();
  },

  exit: function () {
    try {
      if (window.tizen && tizen.application) {
        tizen.application.getCurrentApplication().exit();
        return;
      }
    } catch (e) {}
    document.body.innerHTML = '<div class="state"><h2>yourTube</h2><p>Closed.</p></div>';
  }
};

window.addEventListener('load', function () { App.boot(); });
