/* Player: plays a muxed, ad-free file served by the bridge.
   The overlay mirrors the stock TV player: title block, seek bar with elapsed
   and total time, then a row of round controls. Focus lives either on the seek
   bar or on the button row, so the remote's arrows do the expected thing. */

var PICON = {
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.2v13.6L19 12z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 5h4.2v14H6.6zM13.2 5h4.2v14h-4.2z"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 5.2 8.8 12 18 18.8zM5 5h2v14H5z"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5.2 15.2 12 6 18.8zM17 5h2v14h-2z"/></svg>',
  gear: '<svg viewBox="2 0 24 24" fill="currentColor"><path d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8zm8.6 3.4c0-.55-.06-1.09-.16-1.6l2.02-1.5-2.02-3.42-2.36.95a8.7 8.7 0 0 0-1.39-.8L16.3 3h-4.6l-.39 2.63c-.5.22-.97.49-1.4.8l-2.35-.95-2.02 3.42 2.02 1.5c-.1.51-.16 1.05-.16 1.6s.06 1.09.16 1.6l-2.02 1.5 2.02 3.42 2.36-.95c.42.31.89.58 1.39.8L11.7 21h4.6l.39-2.63c.5-.22.97-.49 1.39-.8l2.36.95 2.02-3.42-2.02-1.5c.1-.51.16-1.05.16-1.6z"/></svg>',
  desc: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4.5h16v2.2H4zM4 9h16v2.2H4zM4 13.5h11v2.2H4zM4 18h8v2.2H4z"/></svg>',
  comments: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 3.5h16a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5H9.2L4.5 21v-3.1A1.5 1.5 0 0 1 3 16.5V5A1.5 1.5 0 0 1 4.5 3.5zM7 8.2h10v1.9H7zm0 4h7v1.9H7z"/></svg>',
  like: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M2.5 20.5h4V10h-4v10.5zm17.6-10.2c.1-.3.2-.6.2-.9V8.6c0-1-.8-1.8-1.8-1.8h-5.5l.8-3.8v-.4c0-.4-.2-.8-.5-1.1L12.8.7 6.7 6.8c-.4.4-.6.9-.6 1.5v10c0 1 .8 1.8 1.8 1.8h8.5c.8 0 1.5-.5 1.7-1.3l3-7c.1-.2.1-.4.1-.6v-1.9z"/></svg>',
  likeOn: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 21h4V10H2v11zm19.2-10.8c.1-.3.2-.6.2-.9V8.5c0-1-.8-1.8-1.8-1.8h-5.5l.8-3.8v-.4c0-.4-.2-.8-.5-1.1L13.8.5 6.7 7.6c-.4.4-.6.9-.6 1.5v10c0 1 .8 1.8 1.8 1.8h8.5c.8 0 1.5-.5 1.7-1.3l3-7c.1-.2.1-.4.1-.6v-1.9z"/></svg>',
  dislike: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M2.5 3.5h4V14h-4V3.5zm17.6 10.2c.1.3.2.6.2.9v1.8c0 1-.8 1.8-1.8 1.8h-5.5l.8 3.8v.4c0 .4-.2.8-.5 1.1L12.8 23.3 6.7 17.2c-.4-.4-.6-.9-.6-1.5v-10c0-1 .8-1.8 1.8-1.8h8.5c.8 0 1.5.5 1.7 1.3l3 7c.1.2.1.4.1.6v1.9z"/></svg>',
  dislikeOn: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 3h4v11H2V3zm19.2 10.8c.1.3.2.6.2.9v1.6c0 1-.8 1.8-1.8 1.8h-5.5l.8 3.8v.4c0 .4-.2.8-.5 1.1L13.8 23.5 6.7 16.4c-.4-.4-.6-.9-.6-1.5V5c0-1 .8-1.8 1.8-1.8h8.5c.8 0 1.5.5 1.7 1.3l3 7c.1.2.1.4.1.6v1.9z"/></svg>',
  save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 3.5h12a1 1 0 0 1 1 1v16l-7-4.4L5 20.5v-16a1 1 0 0 1 1-1z"/></svg>',
  saveOn: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2.5h12a1.5 1.5 0 0 1 1.5 1.5v17L12 16.9 4.5 21V4A1.5 1.5 0 0 1 6 2.5z"/></svg>',
  mini: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2.5" y="4.5" width="19" height="15" rx="1.6"/><rect x="12" y="12" width="8" height="6" rx=".8" fill="currentColor" stroke="none"/></svg>',
  channel: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5.5h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2zm14.5 3.7L21 7.1v9.8l-2.5-2.1zM9.5 8.6v6.8L15 12z"/></svg>'
};

var SEGMENT_CATEGORIES = [
  { key: 'sponsor', label: 'Sponsor' },
  { key: 'intro', label: 'Intro' },
  { key: 'outro', label: 'Outro' },
  { key: 'selfpromo', label: 'Self promotion' },
  { key: 'interaction', label: 'Interaction reminders' },
  { key: 'preview', label: 'Preview / recap' },
  { key: 'music_offtopic', label: 'Music off-topic' }
];

/* Compact like count for the 10-foot control row. U.views() appends "views",
   so the player needs its own number-only formatter. */
function likeText(n) {
  n = Number(n) || 0;
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

var Player = {
  _on: false,
  _meta: null,
  _id: null,
  _hideT: null,
  _saveT: null,
  _poll: null,
  _zone: 'seek',      /* 'seek' | 'btns' */
  _panel: null,       /* null | 'desc' | 'comments' */
  _settings: false,   /* right-side video settings drawer */
  _setScreen: 'root',
  _setStack: [],
  _setItems: [],
  _setIdx: 0,
  _bi: 1,             /* focused button index */
  _btns: [],
  _prevStack: [],
  _resume: 0,
  _seekAt: null,      /* accumulated target while the remote is held */
  _seekRetry: 0,
  _seekWrites: 0,
  _seekStarted: 0,
  _seekLastWrite: 0,
  _seekConfirmed: false,
  _seekClearT: null,
  _tickT: null,
  /* Tizen can freeze video.currentTime while hardware decoding continues. The
     bar follows a wall clock instead, re-synced whenever currentTime moves. */
  _dispTime: 0,
  _dispT: null,
  _lastRaw: null,
  _resumeAt: null,
  _resumeRetry: 0,
  _resumeLastWrite: 0,
  _resumeConfirmed: false,
  _resumeT: null,
  _scrubPaused: false,
  _seekCheckT: null,
  /* The icon follows the user's intent, not transient decoder events. */
  _wantPlaying: false,
  _liking: false,
  _rating: false,
  _mini: false,
  _autoT: null,
  _captions: [],
  _capTrack: null,
  _storyboard: null,
  _ryd: 0,
  _rydLikes: 0,
  _previewT: null,
  /* Mini-player gestures: Back tap = restore, double Back = play/pause,
     hold Down = close. A short Down is passed to the browse screen on keyup,
     so holding it can never scroll the screen underneath. */
  _backTapT: null,
  _backDown: false,
  _backArmed: false,
  _backIgnoreUp: false,
  _downHoldT: null,
  _downHeld: false,

  /* A cached/truncated MP4 reports a short element duration. One forced reload
     with a fresh query string defeats TV-side media caching. */
  _cacheBusted: false,

  active: function () { return this._on; },

  clearBackGestures: function () {
    if (this._backTapT) { clearTimeout(this._backTapT); this._backTapT = null; }
    if (this._downHoldT) { clearTimeout(this._downHoldT); this._downHoldT = null; }
    this._backDown = false;
    this._backArmed = false;
    this._backIgnoreUp = false;
    this._downHeld = false;
  },

  el: function () { return document.getElementById('watch'); },

  /* The bridge serves a fragmented MP4 so playback can start before the whole
     file is written. Chromium reports only the first fragment (~3s) as the
     duration, so the real length from metadata is authoritative for the bar. */
  /* Position on the real timeline. After an offset seek the element plays a
     stream that starts at `_off`, so its currentTime is relative to that. */
  pos: function () {
    var v = document.getElementById('video');
    var ct = (v && isFinite(v.currentTime)) ? v.currentTime : 0;
    return ct + (this._off || 0);
  },

  duration: function () {
    var md = (this._meta && this._meta.duration) || 0;
    var v = document.getElementById('video');
    var vd = v && isFinite(v.duration) ? v.duration + (this._off || 0) : 0;
    /* YouTube's metadata is authoritative. Chromium 56 can report only the
       buffered part of an MP4 (it used to show 1:04 for a 20-minute video),
       which made the seek bar, skip keys and resume all clamp to one minute. */
    return md > 3 ? md : vd;
  },

  /* A TV can keep serving a cached, truncated file even after the bridge is
     fixed. Its <video>.duration is then far shorter than YouTube's metadata and
     every seek/resume past that point is silently refused by Chromium 56. */
  staleFile: function () {
    /* An offset stream is fragmented and shorter by design; MSE has no file. */
    if (this._off || this._mse) return false;
    var v = document.getElementById('video');
    var vd = v && isFinite(v.duration) ? v.duration : 0;
    var md = (this._meta && this._meta.duration) || 0;
    return md > 5 && vd > 0 && md > vd + 5;
  },

  /* Fetch the same file under a new URL exactly once per open. The bridge
     serves it from disk immediately, so this costs one short reload and cures
     the stale-cache case without touching the visible UI. */
  reloadFresh: function () {
    if (this._cacheBusted || !this._id) return false;
    this._cacheBusted = true;
    var v = document.getElementById('video');
    v.src = API.streamUrl(this._id, U.store.get('quality', 720), Date.now());
    v.load();
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
    return true;
  },

  open: function (id, hint, auto, resumeAt) {
    var self = this;
    if (window.Preview) Preview.hide();
    this.clearBackGestures();
    this.closePanel();
    this.closeSettings(false);
    if (!auto && this._id && this._id !== id) this._prevStack.push(this._id);
    if (this._prevStack.length > 30) this._prevStack.shift();
    this._on = true;
    this._mini = false;
    this.cancelAutoplay();
    this._id = id;
    this._item = hint || { id: id, title: '', channel: '' };
    this._resume = Math.max(0, Number(resumeAt) || 0);
    this._seekAt = null;
    this._seekRetry = 0;
    this._seekWrites = 0;
    this._seekConfirmed = false;
    this._seekPhase = null;
    this._off = 0;
    this._seekToken = 0;
    clearTimeout(this._seekGoT); this._seekGoT = null;
    this._resumeAt = null;
    this._resumeRetry = 0;
    this._resumeLastWrite = 0;
    this._resumeConfirmed = false;
    this._scrubPaused = false;
    this._cacheBusted = false;
    this._wantPlaying = true;
    clearTimeout(this._seekCheckT);
    this._seekCheckT = null;
    clearInterval(this._resumeT);
    this._dispTime = this._resume;
    this._dispT = Date.now();
    this._lastRaw = null;
    if (this._seekClearT) { clearTimeout(this._seekClearT); this._seekClearT = null; }
    this._zone = 'seek';
    this._meta = null;
    this._segments = [];
    this._related = [];

    var w = this.el();
    w.className = 'on ui zseek';
    document.getElementById('prep').style.display = 'flex';
    this.prepText('Loading');
    document.getElementById('next').className = 'next';
    document.getElementById('wtitle').textContent = (hint && hint.title) || '';
    document.getElementById('wmeta').textContent = '';
    document.getElementById('wdesc').textContent = '';
    document.getElementById('tcur').textContent = '0:00';
    document.getElementById('tdur').textContent = '0:00';
    document.getElementById('pos').style.width = '0%';
    document.getElementById('knob').style.left = '0%';
    document.getElementById('buf').style.width = '0%';
    var segsEl = document.getElementById('segs');
    if (segsEl) U.clear(segsEl);
    this.build();
    this.showNextBtn(false);
    this.applyAmbient();
    var mini = document.getElementById('minibar');
    if (mini) mini.className = 'minibar';

    var v = document.getElementById('video');
    /* The bridge muxes the uploader's original audio; never start muted or let
       the element pick a translated/dubbed track from its own language list. */
    v.muted = false;
    v.volume = 1;
    if (this._dashS) { this._dashS.destroy(); this._dashS = null; }
    this._dash = null;
    this._mse = false;
    this._dashP = null;
    v.pause();
    v.removeAttribute('src');
    v.load();
    /* Resolve the DASH tracks while the metadata loads: playback can start as
       soon as both answer, with nothing downloaded or muxed up front. */
    this.dashFetch(id, U.store.get('quality', 720));

    API.video(id).then(function (meta) {
      self._meta = meta;
      self.refreshBtns();
      document.getElementById('wtitle').textContent = meta.title || '';
      var bits = [];
      if (meta.channel) bits.push(meta.channel);
      if (meta.views) bits.push(U.views(meta.views));
      if (meta.published) bits.push(U.ago(meta.published));
      document.getElementById('wmeta').textContent = bits.join('  ·  ');
      document.getElementById('wdesc').textContent = meta.description || '';
      self._segments = meta.segments || [];
      self.paintSegments();
      self.loadExtras(id);
      self.applyAmbient();
      self._related = meta.related || [];
      if (self._related.length) {
        var n = self._related[0];
        document.getElementById('nextimg').src = U.thumb(n.id);
        document.getElementById('nexttitle').textContent = n.title;
        document.getElementById('next').className = 'next on';
      }
      self.showNextBtn(self._related.length > 0);
      return self.waitReady(id);
    }).catch(function (e) {
      self.prepText('Could not load video', String(e && e.message || e));
      U.toast('Could not load video: ' + String(e && e.message || e));
    });
  },

  /* ---------- control row ---------- */
  build: function () {
    var center = document.getElementById('pgrp');
    var right = document.getElementById('pright');
    if (center.firstChild) { this.refreshBtns(); return; }
    this._btns = [];

    var self = this;
    function add(host, d) {
      var b = document.createElement('div');
      b.className = 'pbtn';
      b.innerHTML = d.html;
      b.act = d.act;
      b.title = d.title || d.act;
      b._nav = function () { self.hit(d.act); };
      host.appendChild(b);
      self._btns.push(b);
      return b;
    }

    add(center, { act: 'prev', title: 'Previous', html: '<div class="ico">' + PICON.prev + '</div>' });
    add(center, { act: 'pp', title: 'Play / pause', html: '<div class="ico">' + PICON.pause + '</div>' });
    add(center, { act: 'next', title: 'Next', html: '<div class="ico">' + PICON.next + '</div>' });

    /* YouTube TV's right-hand control cluster. Description/Comments are
       reachable here as well; Next stays hidden until there is an up-next. */
    add(right, {
      act: 'like', title: 'Like',
      html: '<div class="ico">' + PICON.like + '</div><div class="num"></div>'
    });
    add(right, {
      act: 'dislike', title: 'Dislike',
      html: '<div class="ico">' + PICON.dislike + '</div><div class="num"></div>'
    });
    add(right, { act: 'save', title: 'Save to Watch later', html: '<div class="ico">' + PICON.save + '</div>' });
    if (!U.store.get('hideComments', false)) {
      add(right, { act: 'comments', title: 'Comments', html: '<div class="ico">' + PICON.comments + '</div>' });
    }
    add(right, { act: 'desc', title: 'Description', html: '<div class="ico">' + PICON.desc + '</div>' });
    add(right, { act: 'channel', title: 'Go to channel', html: '<div class="ico">' + PICON.channel + '</div>' });
    add(right, { act: 'settings', title: 'Settings', html: '<div class="ico">' + PICON.gear + '</div>' });
    add(right, { act: 'mini', title: 'Minimize player', html: '<div class="ico">' + PICON.mini + '</div>' });

    this.refreshBtns();
    this.paint();
    document.querySelector('#watch .times').style.display =
      U.store.get('timestamp', true) ? '' : 'none';
  },

  showNextBtn: function (on) {
    var showNext = U.store.get('showNext', true) && !U.store.get('hideRelated', false);
    for (var i = 0; i < this._btns.length; i++) {
      var a = this._btns[i].act;
      if (a === 'next') this._btns[i].style.display = (on && showNext) ? 'flex' : 'none';
      if (a === 'prev') this._btns[i].style.display = this._prevStack.length ? 'flex' : 'none';
    }
    if (this._zone === 'btns' && this._btns[this._bi] &&
        this._btns[this._bi].style.display === 'none') this.focusBtn(this._bi);
  },

  refreshBtns: function () {
    var v = document.getElementById('video');
    for (var i = 0; i < this._btns.length; i++) {
      var b = this._btns[i];
      if (b.act === 'pp') {
        /* During a fragment-boundary recovery the element toggles paused many
           times; the icon must stay on the user's chosen state. */
        var playing = this._wantPlaying && this._on;
        b.innerHTML = '<div class="ico">' + (playing ? PICON.pause : PICON.play) + '</div>';
      } else if (b.act === 'settings') {
        b.innerHTML = '<div class="ico">' + PICON.gear + '</div>';
      } else if (b.act === 'like') {
        var m = this._meta || {};
        var liked = !!m.liked;
        var useRyd = U.store.get('ryd', false);
        var count = useRyd && this._rydLikes ? this._rydLikes
          : (typeof m.likes === 'number' ? m.likes : null);
        b.className = 'pbtn' + (liked ? ' liked' : '');
        b.title = liked ? 'Unlike' : 'Like';
        b.innerHTML = '<div class="ico">' + (liked ? PICON.likeOn : PICON.like) + '</div>' +
          '<div class="num">' + (count == null ? '' : likeText(count)) + '</div>';
      } else if (b.act === 'dislike') {
        var dm = this._meta || {};
        var disliked = !!dm.disliked;
        var dcount = U.store.get('ryd', false) && this._ryd ? likeText(this._ryd) : '';
        b.className = 'pbtn' + (disliked ? ' disliked' : '');
        b.title = disliked ? 'Remove dislike' : 'Dislike';
        b.innerHTML = '<div class="ico">' + (disliked ? PICON.dislikeOn : PICON.dislike) + '</div>' +
          '<div class="num">' + dcount + '</div>';
      } else if (b.act === 'save') {
        var saved = this.inCollection('saved');
        b.className = 'pbtn' + (saved ? ' saved' : '');
        b.title = saved ? 'Remove from Watch later' : 'Save to Watch later';
        b.innerHTML = '<div class="ico">' + (saved ? PICON.saveOn : PICON.save) + '</div>';
      }
    }
    this.paint();
  },

  paint: function () {
    for (var i = 0; i < this._btns.length; i++) {
      if (this._zone === 'btns' && i === this._bi) this._btns[i].classList.add('focused');
      else this._btns[i].classList.remove('focused');
    }
    var w = this.el();
    if (this._zone === 'seek' && w.className.indexOf('ui') > -1) {
      if (w.className.indexOf('zseek') < 0) w.className += ' zseek';
    } else {
      w.className = w.className.replace(/\s*zseek/, '');
    }
  },

  hit: function (act) {
    if (act === 'pp') this.toggle();
    else if (act === 'prev') this.prev();
    else if (act === 'next') this.next();
    else if (act === 'settings') { this.openSettings(); return; }
    else if (act === 'quality') this.cycleQuality();
    else if (act === 'desc') { this.showPanel('desc'); return; }
    else if (act === 'comments') { this.showPanel('comments'); return; }
    else if (act === 'like') { this.like(); return; }
    else if (act === 'dislike') { this.dislike(); return; }
    else if (act === 'save') { this.toggleCollection('saved'); this.refreshBtns(); this.showUI(); return; }
    else if (act === 'mini') { this.minimize(); return; }
    else if (act === 'channel') { this.goChannel(); return; }
    this.showUI();
  },

  /* Full description / comments panel, opened from the player's right-hand
     control row. Back or Enter returns to the player. */
  showPanel: function (kind) {
    var self = this;
    var panel = document.getElementById('pinfopanel');
    var list = document.getElementById('pinfolist');
    var title = document.getElementById('pinfotitle');
    this._panel = kind;
    document.getElementById('pctl').style.opacity = '0';
    panel.className = 'pinfopanel on';

    if (kind === 'desc') {
      title.textContent = 'Description';
      var m = this._meta || {};
      var head = [m.channel, m.views ? U.views(m.views) : '',
        typeof m.likes === 'number' ? likeText(m.likes) + ' likes' : '',
        m.published ? U.ago(m.published) : ''].filter(Boolean).join('  ·  ');
      list.innerHTML = (head ? '<p>' + U.esc(head) + '</p><br>' : '') +
        U.esc(m.description || 'No description available.');
    } else if (kind === 'lyrics') {
      title.textContent = 'Lyrics';
      list.innerHTML = '<p>Loading lyrics…</p>';
      API.musicLyrics(this._id).then(function (r) {
        if (self._panel !== 'lyrics') return;
        var text = (r && r.lyrics) || '';
        list.innerHTML = text ? U.esc(text) : '<p>Lyrics are not available for this song.</p>';
      }).catch(function () {
        if (self._panel === 'lyrics') list.innerHTML = '<p>Lyrics are not available for this song.</p>';
      });
    } else {
      title.textContent = 'Comments';
      list.innerHTML = '<p>Loading comments…</p>';
      API.comments(this._id).then(function (r) {
        if (self._panel !== 'comments') return;
        var items = (r && r.items) || [];
        if (!items.length) {
          list.innerHTML = '<p>' + U.esc((r && r.error) || 'No comments available.') + '</p>';
          return;
        }
        var html = '';
        for (var i = 0; i < items.length; i++) {
          var c = items[i];
          var meta = [c.author, c.published, c.likes ? c.likes + ' likes' : '',
            c.replies].filter(Boolean).join('  ·  ');
          html += '<div class="cmt"><h4>' + U.esc(c.author || '') + '</h4>' +
            '<div class="cmeta">' + U.esc(meta) + '</div><p>' + U.esc(c.text || '') + '</p></div>';
        }
        list.innerHTML = html;
      }).catch(function (e) {
        if (self._panel === 'comments') {
          list.innerHTML = '<p>Could not load comments: ' + U.esc((e && e.message) || e) + '</p>';
        }
      });
    }
    list.scrollTop = 0;
  },

  closePanel: function () {
    if (!this._panel) return;
    this._panel = null;
    var panel = document.getElementById('pinfopanel');
    if (panel) panel.className = 'pinfopanel';
    var pctl = document.getElementById('pctl');
    if (pctl) pctl.style.opacity = '';
  },

  /* ---------- right-side video settings drawer ---------- */
  openSettings: function () {
    if (!this._on) return;
    this.closePanel();
    this._settings = true;
    this._setScreen = 'root';
    this._setStack = [];
    this._setIdx = 0;
    clearTimeout(this._hideT);
    document.getElementById('pctl').style.opacity = '0.28';
    document.getElementById('psettings').className = 'psettings on';
    this.renderSettings();
  },

  closeSettings: function (refocus) {
    if (!this._settings) return;
    this._settings = false;
    document.getElementById('psettings').className = 'psettings';
    document.getElementById('pctl').style.opacity = '';
    if (refocus !== false) {
      for (var i = 0; i < this._btns.length; i++) {
        if (this._btns[i].act === 'settings') this.focusBtn(i);
      }
    }
    this.showUI();
  },

  settingsOpenScreen: function (id) {
    this._setStack.push(this._setScreen);
    this._setScreen = id;
    this._setIdx = 0;
    this.renderSettings();
  },

  settingsBack: function () {
    if (!this._settings) return false;
    if (!this._setStack.length) { this.closeSettings(); return false; }
    this._setScreen = this._setStack.pop();
    this._setIdx = 0;
    this.renderSettings();
    return true;
  },

  paintSettings: function () {
    var focus = null;
    for (var i = 0; i < this._setItems.length; i++) {
      if (i === this._setIdx) {
        this._setItems[i].classList.add('focused');
        focus = this._setItems[i];
      } else this._setItems[i].classList.remove('focused');
    }
    var back = document.getElementById('psback');
    if (back) back.className = this._setIdx === -1 ? 'psback focused' : 'psback';

    /* Keep the focused row inside the visible list. Manual math instead of
       scrollIntoView options keeps this working on Chromium 56. */
    var list = document.getElementById('pslist');
    if (focus && list) {
      var lr = list.getBoundingClientRect();
      var rr = focus.getBoundingClientRect();
      if (rr.top < lr.top) list.scrollTop -= (lr.top - rr.top) + 8;
      else if (rr.bottom > lr.bottom) list.scrollTop += (rr.bottom - lr.bottom) + 8;
    }
  },

  renderSettings: function () {
    var self = this;
    var list = document.getElementById('pslist');
    U.clear(list);
    list.scrollTop = 0;
    var names = {
      root: 'Settings', speed: 'Playback speed', quality: 'Quality',
      captions: 'Captions', capLang: 'Caption language',
      capSize: 'Caption size', capColor: 'Caption text',
      segments: 'Skipped segments', queue: 'Up next', lyrics: 'Lyrics'
    };
    document.getElementById('pstitle').textContent = names[this._setScreen] || 'Settings';
    var back = document.getElementById('psback');
    back.className = this._setStack.length ? 'psback focused' : 'psback';
    back.onclick = function () { self.settingsBack(); };
    this._setItems = [];

    function row(label, value, onAct, picked) {
      var r = document.createElement('div');
      r.className = 'psrow' + (picked ? ' picked' : '');
      r.innerHTML = '<div class="lbl">' + U.esc(label) + '</div>' +
        '<div class="val">' + U.esc(value == null ? '' : value) + '</div>';
      r._nav = onAct;
      list.appendChild(r);
      self._setItems.push(r);
      return r;
    }
    function sub(label, target, value) {
      return row(label, value || '›', function () { self.settingsOpenScreen(target); });
    }
    function toggle(label, key, def, after) {
      var v = U.store.get(key, def);
      var r = row(label, v ? 'On' : 'Off', function () {
        v = !v;
        U.store.set(key, v);
        r.querySelector('.val').textContent = v ? 'On' : 'Off';
        self.applySetting(key, v);
        if (after) after(v);
      });
      return r;
    }
    function options(key, opts, fmt, def, after, values) {
      var cur = U.store.get(key, def);
      for (var i = 0; i < opts.length; i++) {
        (function (o, val) {
          var on = String(val) === String(cur);
          row(fmt(o), on ? '✓' : '', function () {
            U.store.set(key, val);
            if (after) after(val);
            self.settingsBack();
          }, on);
        })(opts[i], values ? values[i] : opts[i]);
      }
    }
    function collectionToggle(label, key) {
      var r = row(label, self.inCollection(key) ? 'On' : 'Off', function () {
        var on = self.toggleCollection(key);
        r.querySelector('.val').textContent = on ? 'On' : 'Off';
      });
      return r;
    }
    function likeToggle() {
      var r = row('Like video', self._meta && self._meta.liked ? 'On' : 'Off', function () {
        self.like().then(function () {
          r.querySelector('.val').textContent = self._meta && self._meta.liked ? 'On' : 'Off';
        });
      });
      return r;
    }

    if (this._setScreen === 'root') {
      sub('Playback speed', 'speed');
      sub('Quality', 'quality');
      sub('Captions', 'captions');
      toggle('Autoplay next video', 'autoplay', false);
      toggle('Loop video', 'loop', false);
      sub('Skipped segments', 'segments');
      toggle('Up next', 'showNext', true);
      toggle('Show timestamp', 'timestamp', true);
      toggle('Ambient mode', 'ambient', false);
      toggle('Minimize player on Back', 'minimizePlayer', true);
      if (this._item && this._item.kind === 'song') {
        sub('Up next queue', 'queue', '›');
        row('Lyrics', '›', function () {
          self.closeSettings(false);
          self.showPanel('lyrics');
        });
      }
      collectionToggle('Save to Watch later', 'saved');
      likeToggle();
    } else if (this._setScreen === 'speed') {
      options('speed', [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2], function (s) {
        return s === 1 ? 'Normal' : s + 'x';
      }, 1, function (s) {
        var v = document.getElementById('video');
        if (v) v.playbackRate = s;
        U.toast('Speed ' + (s === 1 ? 'Normal' : s + 'x'));
      });
    } else if (this._setScreen === 'quality') {
      options('quality', [360, 480, 720, 1080], function (q) { return q + 'p'; }, 720, function (q) {
        self.closeSettings();
        self.reload(q);
        U.toast('Quality ' + q + 'p');
      });
    } else if (this._setScreen === 'captions') {
      toggle('Subtitles / CC', 'captions', false, function (v) {
        U.toast(v ? 'Captions on' : 'Captions off');
      });
      toggle('AI-generated captions', 'aiCaptions', true, function (v) {
        U.toast(v ? 'AI captions on' : 'AI captions off');
      });
      sub('Caption language', 'capLang', this._capTrack && this._capTrack.label);
      sub('Caption size', 'capSize');
      toggle('Caption background', 'capBg', true);
      sub('Caption text', 'capColor');
    } else if (this._setScreen === 'capLang') {
      var labels = [];
      var codes = [];
      var seenLangs = {};
      var tracks = (this._meta && this._meta.captions) || [];
      for (var li = 0; li < tracks.length; li++) {
        var tr = tracks[li];
        if (!tr.code || seenLangs[tr.code]) continue;
        seenLangs[tr.code] = 1;
        labels.push(tr.label || tr.code);
        codes.push(tr.code);
      }
      if (!labels.length) {
        labels = ['English', 'Español', 'Deutsch', 'Français'];
        codes = ['en', 'es', 'de', 'fr'];
      }
      options('capLang', labels, function (s) { return s; }, 'en', function (code) {
        if (self._id && self._on) self.loadExtras(self._id);
        U.toast('Caption language: ' + code);
      }, codes);
    } else if (this._setScreen === 'capSize') {
      options('capSize', ['Small', 'Medium', 'Large'], function (s) { return s; }, 'Medium');
    } else if (this._setScreen === 'capColor') {
      options('capColor', ['White', 'Yellow', 'Cyan'], function (s) { return s; }, 'White');
    } else if (this._setScreen === 'queue') {
      list.innerHTML = '<div class="psrow"><div class="lbl">Loading queue…</div></div>';
      API.musicQueue(this._id).then(function (d) {
        if (!self._settings || self._setScreen !== 'queue') return;
        U.clear(list);
        self._setItems = [];
        var items = (d && d.items) || [];
        if (!items.length) row('Queue is unavailable', '', function () {});
        for (var qi = 0; qi < items.length; qi++) {
          (function (song) {
            row(song.title, song.channel || '', function () {
              self.closeSettings(false);
              self.open(song.id, song, true);
            });
          })(items[qi]);
        }
        self._setIdx = items.length ? 0 : -1;
        self.paintSettings();
      }).catch(function () {
        if (!self._settings || self._setScreen !== 'queue') return;
        U.clear(list);
        self._setItems = [];
        row('Queue is unavailable', '', function () {});
        self.paintSettings();
      });
    } else if (this._setScreen === 'segments') {
      toggle('Skip sponsored segments', 'sponsorblock', true, function () {
        self.paintSegments();
      });
      for (var si = 0; si < SEGMENT_CATEGORIES.length; si++) {
        (function (cat) {
          toggle(cat.label, 'sb_' + cat.key, true, function () { self.paintSegments(); });
        })(SEGMENT_CATEGORIES[si]);
      }
    }

    /* The header arrow is the only Back control. -1 means it has focus. */
    if (this._setIdx !== -1) {
      this._setIdx = Math.max(0, Math.min(this._setIdx, this._setItems.length - 1));
    }
    this.paintSettings();
  },

  settingActivate: function () {
    var item = this._setItems[this._setIdx];
    if (item && typeof item._nav === 'function') item._nav();
  },

  focusZone: function (z) {
    this._zone = z;
    if (z === 'btns') {
      /* Coming down from the seek bar must always land on Play / Pause,
         never on whichever button happened to be focused last. */
      var pp = -1;
      for (var i = 0; i < this._btns.length; i++) {
        if (this._btns[i].act === 'pp') { pp = i; break; }
      }
      this._bi = pp >= 0 ? pp : 1;
    }
    this.paint();
  },

  focusBtn: function (i) {
    var n = this._btns.length;
    if (!n) return;
    this._zone = 'btns';

    /* Build the list of controls that are actually on screen. Hidden slots
       (Next / Previous) stay in _btns but must not be focusable. */
    var visible = [];
    for (var v = 0; v < n; v++) {
      if (this._btns[v].style.display !== 'none') visible.push(v);
    }
    if (!visible.length) return;
    var len = visible.length;

    var curPos = 0;
    for (var p = 0; p < len; p++) {
      if (visible[p] === this._bi) { curPos = p; break; }
    }

    if (i === this._bi + 1) {
      /* Right from the last button wraps back to the first. */
      this._bi = visible[(curPos + 1) % len];
    } else if (i === this._bi - 1) {
      /* Left from the first button wraps to the last. */
      this._bi = visible[(curPos - 1 + len) % len];
    } else {
      /* Direct focus (e.g. closing Settings) keeps the old behaviour: land on
         the requested control, or the first visible one at/after it. */
      var wrapped = ((i % n) + n) % n;
      var pos = 0;
      for (var q = 0; q < len; q++) {
        if (visible[q] >= wrapped) { pos = q; break; }
      }
      this._bi = visible[pos];
    }
    this.paint();
  },

  prev: function () {
    if (!this._prevStack.length) { U.toast('No previous video'); return; }
    var id = this._prevStack.pop();
    this.open(id, null, true);
  },

  next: function () {
    var r = this._related && this._related[0];
    if (r) this.open(r.id, r, true);
    else U.toast('No next video');
  },

  /* Like state comes from the signed-in bridge session. The count is updated
     optimistically so the number changes on the same remote press. */
  like: function () {
    return this.rate('like');
  },

  /* Like and dislike are mutually exclusive on YouTube. The optimistic state
     flips both icons on the same remote press, then the bridge confirms with
     the signed-in account's real rating. */
  dislike: function () {
    return this.rate('dislike');
  },

  rate: function (mode) {
    var self = this;
    var m = this._meta;
    if (!m || !this._id) {
      U.toast('Video details are still loading');
      return Promise.resolve();
    }
    if (this._rating) return Promise.resolve();
    var old = { liked: !!m.liked, disliked: !!m.disliked, likes: m.likes };
    var wantLike = mode === 'like' ? !old.liked : false;
    var wantDislike = mode === 'dislike' ? !old.disliked : false;
    var send = mode === 'remove' || (mode === 'like' && !wantLike) || (mode === 'dislike' && !wantDislike)
      ? 'remove' : mode;
    this._rating = true;
    m.liked = wantLike;
    m.disliked = wantDislike;
    if (typeof m.likes === 'number') {
      var delta = 0;
      if (send === 'like' && !old.liked) delta = 1;
      else if ((send === 'remove' || send === 'dislike') && old.liked) delta = -1;
      m.likes = Math.max(0, m.likes + delta);
    }
    this.refreshBtns();
    this.showUI();
    U.toast(send === 'remove' ? 'Rating removed' : send === 'like' ? 'Liked' : 'Disliked');

    function done() {
      self._rating = false;
      self.refreshBtns();
      self.showUI();
    }
    return API.rating(this._id, send).then(function (r) {
      if (!r || r.ok === false) throw new Error((r && r.error) || 'Could not update rating');
      if (typeof r.liked === 'boolean') m.liked = r.liked;
      if (typeof r.disliked === 'boolean') m.disliked = r.disliked;
      if (typeof r.likeCount === 'number' && r.likeCount > 0) m.likes = r.likeCount;
      done();
    }).catch(function (e) {
      m.liked = old.liked;
      m.disliked = old.disliked;
      m.likes = old.likes;
      done();
      U.toast('Could not update rating: ' + ((e && e.message) || e));
    });
  },

  goChannel: function () {
    var m = this._meta || {};
    if (!m.channelId) { U.toast('Channel unavailable for this video'); this.showUI(); return; }
    var data = { id: m.channelId, title: m.channel || '', channel: m.channel || '' };
    this.close();
    App.go('channel', false, data);
  },

  cycleQuality: function () {
    var opts = [360, 480, 720, 1080];
    var q = U.store.get('quality', 720);
    var nq = opts[(opts.indexOf(q) + 1) % opts.length];
    U.store.set('quality', nq);
    this.refreshBtns();
    U.toast('Quality ' + nq + 'p');
    this.reload(nq);
  },

  /* quality is baked into the served file, so a switch re-prepares and resumes */
  reload: function (q) {
    var self = this;
    var v = document.getElementById('video');
    var at = this.pos();
    var wasPlaying = !v.paused;
    this._resume = at;
    document.getElementById('prep').style.display = 'flex';
    this.prepText('Preparing ' + q + 'p');
    this.waitReady(this._id).then(function () {
      if (!wasPlaying) {
        document.getElementById('video').pause();
        self.refreshBtns();
      }
    }).catch(function () {});
  },

  dashFetch: function (id, q) {
    if (!(window.Dash && Dash.supported()) || U.store.get('noMse', false)) {
      this._dashP = null;
      return null;
    }
    if (this._dashP && this._dashKey === id + ':' + q) return this._dashP;
    this._dashKey = id + ':' + q;
    this._dashP = API.get('/api/dash?id=' + encodeURIComponent(id) + '&q=' + q, 30000)
      .then(function (r) { return r; },
            function (e) { return { ok: false, error: String(e && e.message || e) }; });
    return this._dashP;
  },

  waitReady: function (id) {
    var self = this;
    var q = U.store.get('quality', 720);
    var dp = this.dashFetch(id, q);
    if (!dp) return this.waitMux(id);
    clearInterval(this._poll);
    return dp.then(function (info) {
      if (!self._on || self._id !== id) return;
      if (info && info.ok) {
        API.log('dash.info', { id: id, q: q, video: info.video.mime, audio: info.audio.mime,
          vsegs: info.video.segs.length, asegs: info.audio.segs.length, duration: info.duration });
        self._dash = info;
        self.play(id, q);
        return;
      }
      API.log('dash.fallback', { id: id, error: info && info.error });
      self._dash = null;
      return self.waitMux(id);
    });
  },

  /* Progressive fallback: the bridge downloads and muxes one MP4 first. */
  waitMux: function (id) {
    var self = this;
    var q = U.store.get('quality', 720);
    clearInterval(this._poll);
    return new Promise(function (resolve, reject) {
      var tries = 0;
      function tick() {
        API.prepare(id, q).then(function (s) {
          if (s.state === 'ready') {
            clearInterval(self._poll);
            resolve(s);
            return;
          }
          if (s.state === 'error') {
            clearInterval(self._poll);
            reject(new Error(s.message || 'stream error'));
            return;
          }
          self.prepText('Preparing ' + q + 'p', (s.pct || 0) + '%');
          if (++tries > 240) { clearInterval(self._poll); reject(new Error('timeout')); }
        }).catch(function () { if (++tries > 240) { clearInterval(self._poll); reject(new Error('timeout')); } });
      }
      tick();
      self._poll = setInterval(tick, 350);
    }).then(function () {
      self.play(id, q);
    });
  },

  play: function (id, q) {
    var self = this;
    var v = document.getElementById('video');
    this._q = q;
    var resumeAt = this._resume > 0 ? this._resume : 0;
    this._resume = 0;
    this._off = 0;
    if (this._dashS) { this._dashS.destroy(); this._dashS = null; }
    this._mse = !!this._dash;
    if (this._mse) {
      var info = this._dash;
      this._dashS = Dash.create(v, info, API.url(''), {
        log: function (e, d) { d = d || {}; d.id = id; API.log(e, d); },
        error: function (why) {
          if (!self._on || self._id !== id) return;
          /* MSE failed on this video: fall back to the progressive file. */
          API.log('dash.fallback', { id: id, error: why });
          if (self._dashS) { self._dashS.destroy(); self._dashS = null; }
          self._dash = null;
          self._mse = false;
          self._dashP = null;
          var at = self.pos();
          self._resume = at > 1 ? at : resumeAt;
          self._resumeAt = null; self._seekAt = null; self._seekPhase = null;
          v.removeAttribute('src');
          v.load();
          document.getElementById('prep').style.display = 'flex';
          self.waitMux(id);
        }
      });
    } else {
      if (!resumeAt) v.src = API.streamUrl(id, q);
    }
    v.playbackRate = U.store.get('speed', 1);
    if (!resumeAt && !this._mse) v.load();

    var hidePrep = function () { document.getElementById('prep').style.display = 'none'; };
    /* Retry the saved position from metadata, canplay, playing and a timer. If
       the element reports a much shorter file than YouTube's metadata, the TV
       is replaying a cached truncated MP4, so force one fresh URL first. */
    /* Resume and the reload fallback of seek share one path: seekReady() runs
       on every readiness event and lands the pending target before play(). */
    var applyResume = function () { self.seekReady(); return true; };
    v.onloadstart = function () {};
    var onMeta = function () {
      API.log('video.meta', { id: self._id, duration: self.duration(),
        element: v.duration, ready: v.readyState, stale: self.staleFile(),
        src: v.currentSrc || v.src });
      if (self.staleFile() && self.reloadFresh()) return;
      hidePrep();
      applyResume();
    };
    v.onloadeddata = hidePrep;
    v.onloadedmetadata = onMeta;
    v.oncanplay = function () {
      if (self.staleFile() && self.reloadFresh()) return;
      hidePrep();
      applyResume();
    };
    v.onplaying = function () {
      if (self.staleFile() && self.reloadFresh()) return;
      hidePrep();
      applyResume();
      self.refreshBtns();
    };
    if (v.readyState >= 2) setTimeout(hidePrep, 0);

    this._wantPlaying = true;
    if (resumeAt) {
      this._resumeAt = resumeAt;
      this._seekAt = resumeAt;
      this._seekKind = 'resume';
      this._resumeWritten = false;
      this._dispTime = resumeAt; this._dispT = Date.now(); this._lastRaw = null;
      /* MSE: write currentTime as soon as the init segments give metadata,
         before play(), so nothing is heard from 0:00. */
      if (this._mse) { if (v.readyState >= 1) this.seekReady(); }
      else this.offsetSeek(resumeAt);
    } else {
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    }

    v.onerror = function () {
      document.getElementById('prep').style.display = 'flex';
      self.prepText('Playback error', 'code ' + (v.error && v.error.code));
      U.toast('Playback error: code ' + (v.error && v.error.code));
    };
    /* `seeked` is the only reliable proof on Tizen that the decoder actually
       moved. currentTime can read the target immediately even when the picture
       is still at the old position, so never confirm a seek from that alone. */
    v.onseeked = function () {
      hidePrep();
      API.log('video.seeked', { id: self._id, at: v.currentTime, phase: self._seekPhase,
        target: self._seekTarget, paused: v.paused, seeking: v.seeking });
      self.onSeeked();
    };
    v.ontimeupdate = function () { self.tick(); };
    v.onprogress = function () { self.buffer(); };
    /* No icon handlers here: the Play/Pause button follows _wantPlaying, so a
       decoder stop cannot make it flicker between the two icons. */
    v.onended = function () {
      /* The bridge now serves one complete +faststart MP4, so this only fires
         at the real end of the video. A pending seek or the user's pause wins. */
      if (self._scrubPaused || self._seekAt != null || self._resumeAt != null) return;
      if (!self._wantPlaying) return;

      self.save(1);
      if (U.store.get('loop', false)) {
        if (self._off) { self.seekTo(0); self.showUI(); return; }
        v.currentTime = 0;
        var again = v.play();
        if (again && again.catch) again.catch(function () {});
        self.showUI();
        return;
      }
      if (!U.store.get('autoplay', false)) {
        self._wantPlaying = false;
        self.refreshBtns();
        self.setUI(true);
        return;
      }
      var r = self._related && self._related[0];
      if (r && !U.store.get('hideRelated', false)) self.startAutoplay();
      else self.close();
    };

    document.getElementById('tdur').textContent = U.dur(this.duration());
    this.paintSegments();
    this.refreshBtns();
    this.showUI();
    clearInterval(this._saveT);
    this._saveT = setInterval(function () { self.save(); }, 2000);
    /* Tizen's fragmented-MP4 playback does not fire timeupdate reliably, which
       used to freeze the green progress bar. Keep the bar live independently. */
    clearInterval(this._tickT);
    this._tickT = setInterval(function () { if (self._on && !self._mini) self.tick(); }, 500);

    /* Click/tap the seek bar to jump straight to that point. */
    var bar = document.getElementById('bar');
    if (bar && !bar._seekBound) {
      bar._seekBound = true;
      bar.addEventListener('click', function (e) {
        var dd = self.duration();
        var rect = bar.getBoundingClientRect();
        if (!dd || !rect.width) return;
        var frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        var target = frac * dd;
        self.seekTo(target);
      });
    }
  },

  /* Keep the bar moving when Tizen stops advancing video.currentTime. Real
     currentTime wins whenever it moves; otherwise a wall clock fills the gap
     until the next fragment arrives. */
  displayTime: function () {
    var v = document.getElementById('video');
    var now = Date.now();
    var ct = this.pos();
    if (this._dispT == null) {
      this._dispT = now; this._dispTime = ct; this._lastRaw = ct;
      return ct;
    }
    /* Compare currentTime with its own last sample. Comparing it with the
       estimate would snap the bar back every time the platform freezes it. */
    var moved = this._lastRaw == null || Math.abs(ct - this._lastRaw) > 0.15;
    if (v && !v.paused && moved) {
      this._dispTime = ct;
      this._dispT = now;
    } else if (v && !v.paused) {
      this._dispTime += Math.max(0, now - this._dispT) / 1000;
      this._dispT = now;
    } else {
      /* On close/save Tizen can report a stale currentTime. Keep the last live
         estimate unless the element's clock has caught up with it. */
      if (this._lastRaw == null || ct >= this._dispTime - 0.5) this._dispTime = ct;
      this._dispT = now;
    }
    this._lastRaw = ct;
    var d = this.duration();
    if (d > 0 && this._dispTime > d) this._dispTime = d;
    return this._dispTime;
  },

  tick: function () {
    var d = this.duration();
    var t = this.displayTime();
    var pct = d ? (t / d) * 100 : 0;
    if (pct > 100) pct = 100;
    document.getElementById('pos').style.width = pct + '%';
    document.getElementById('knob').style.left = pct + '%';
    document.getElementById('tcur').textContent = U.dur(t);
    document.getElementById('tdur').textContent = U.dur(d);
    this.paintCaptions(t);
    this.skipSegments(t);
  },

  buffer: function () {
    var v = document.getElementById('video');
    var d = this.duration();
    if (!v.buffered || !v.buffered.length || !d) return;
    var end = v.buffered.end(v.buffered.length - 1) + (this._off || 0);
    var pct = (end / d) * 100;
    if (pct > 100) pct = 100;
    document.getElementById('buf').style.width = pct + '%';
  },

  /* Draw the SponsorBlock ranges as green marks on the seek bar. Each category
     can be hidden independently from the in-player settings drawer. */
  /* Captions, storyboard frames and Return YouTube Dislike are loaded beside
     the video metadata. None of them can block playback if the bridge fails. */
  loadExtras: function (id) {
    var self = this;
    this._captions = [];
    this._capTrack = null;
    this._storyboard = null;
    this._ryd = 0;
    this._rydLikes = 0;
    this.paintCaptions(0);
    this.hidePreview();

    API.captions(id, U.store.get('capLang', 'en'), U.store.get('aiCaptions', true))
      .then(function (d) {
        if (self._id !== id) return;
        self._captions = (d && d.cues) || [];
        self._capTrack = (d && d.track) || null;
        self.paintCaptions(self.pos());
      }).catch(function () {});

    API.storyboard(id).then(function (d) {
      if (self._id === id) self._storyboard = (d && d.storyboard) || null;
    }).catch(function () {});

    if (U.store.get('ryd', false)) {
      API.ryd(id).then(function (d) {
        if (self._id !== id) return;
        self._ryd = Number(d && d.dislikes) || 0;
        self._rydLikes = Number(d && d.likes) || 0;
        self.refreshBtns();
      }).catch(function () {});
    }
  },

  paintCaptions: function (t) {
    var el = document.getElementById('captions');
    if (!el) return;
    var text = '';
    if (U.store.get('captions', false) && this._captions.length) {
      var lo = 0, hi = this._captions.length - 1, idx = -1;
      while (lo <= hi) {
        var mid = (lo + hi) >> 1;
        var c = this._captions[mid];
        if (t < c.s) hi = mid - 1;
        else if (t > c.e) lo = mid + 1;
        else { idx = mid; break; }
      }
      if (idx >= 0) text = this._captions[idx].t;
    }
    var size = U.store.get('capSize', 'Normal');
    el.style.fontSize = size === 'Small' ? '1.2rem' : size === 'Large' ? '1.9rem' : '1.55rem';
    var colour = U.store.get('capColor', 'White');
    el.style.color = colour === 'Yellow' ? '#ffe033' : colour === 'Cyan' ? '#5ee7ff' : '#fff';
    el.className = 'captions' + (U.store.get('capBg', true) ? ' box' : '') + (text ? ' on' : '');
    U.clear(el);
    if (text) el.appendChild(document.createTextNode(text));
  },

  /* The seek tooltip is intentionally gone: the bar and the time readout are
     the only feedback while scrubbing. */
  showPreview: function () { this.hidePreview(); },

  hidePreview: function () {
    if (this._previewT) { clearTimeout(this._previewT); this._previewT = null; }
    var el = document.getElementById('seekpreview');
    if (el) el.className = 'seekpreview';
  },

  paintSegments: function () {
    var host = document.getElementById('segs');
    if (!host) return;
    U.clear(host);
    if (!U.store.get('sponsorblock', true)) return;
    var d = this.duration();
    var segs = this._segments || [];
    if (!d || !segs.length) return;
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i];
      var cat = String(s.category || '').toLowerCase().replace(/[^a-z_]/g, '');
      if (!U.store.get('sb_' + cat, true)) continue;
      var left = (s.start / d) * 100;
      var width = ((s.end - s.start) / d) * 100;
      if (!isFinite(left) || !isFinite(width) || width <= 0) continue;
      var el = document.createElement('div');
      el.className = 'seg cat-' + cat;
      el.style.left = Math.max(0, left) + '%';
      el.style.width = Math.min(100 - Math.max(0, left), width) + '%';
      el.title = cat;
      host.appendChild(el);
    }
  },

  skipSegments: function (t) {
    if (!U.store.get('sponsorblock', true)) return;
    if (this._seekPhase || this._seekAt != null) return;
    var segs = this._segments || [];
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i];
      var cat = String(s.category || '').toLowerCase().replace(/[^a-z_]/g, '');
      if (!U.store.get('sb_' + cat, true)) continue;
      if (t >= s.start && t < s.end - 0.3) {
        var v = document.getElementById('video');
        this.seekTo(s.end + 0.1);
        U.toast('Skipped ' + (s.category || 'segment'));
        break;
      }
    }
  },

  /* Local signed-in collections used by the Library screen. */
  _collectionRec: function () {
    var m = this._meta || {};
    var item = this._item || {};
    return {
      id: this._id,
      title: m.title || item.title || '',
      channel: m.channel || item.channel || '',
      duration: Math.round(this.duration()) || m.duration || 0,
      thumb: U.thumb(this._id),
      at: Date.now()
    };
  },

  inCollection: function (key) {
    var arr = U.store.get(key, []);
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].id === this._id) return true;
    }
    return false;
  },

  toggleCollection: function (key) {
    var arr = U.store.get(key, []);
    var idx = -1;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].id === this._id) { idx = i; break; }
    }
    if (idx >= 0) arr.splice(idx, 1);
    else arr.unshift(this._collectionRec());
    U.store.set(key, arr.slice(0, 60));
    U.toast(idx >= 0 ? 'Removed from ' + key : 'Added to ' + key);
    return idx < 0;
  },

  save: function (force) {
    if (!this._meta) return;
    /* Never overwrite a saved position before the restore has actually landed. */
    if (this._resumeAt != null) return;
    var d = this.duration();
    if (!d) return;
    var t = this.displayTime();
    var hist = U.store.get('history', []);
    var rec = {
      id: this._meta.id,
      title: this._meta.title,
      channel: this._meta.channel,
      duration: Math.round(d),
      thumb: U.thumb(this._meta.id),
      progress: force ? 1 : Math.min(0.99, t / d),
      position: Math.round(t),
      at: Date.now()
    };
    hist = hist.filter(function (h) { return h.id !== rec.id; });
    if (rec.progress > 0.001 && rec.progress < 0.97) hist.unshift(rec);
    U.store.set('history', hist.slice(0, 30));
  },

  /* The loader is icon-only by design. Text nodes are optional so errors can
     still be surfaced through a toast without putting copy under the spinner. */
  prepText: function (msg, pct) {
    var m = document.getElementById('prepmsg');
    var p = document.getElementById('preppct');
    if (m) m.textContent = msg || '';
    if (p) p.textContent = pct || '';
  },

  /* Ambient mode washes the wall behind a slightly inset video with the
     video's own artwork, like YouTube TV on an Ambilight-style setup. */
  applyAmbient: function () {
    var w = this.el();
    if (!w) return;
    var on = !!U.store.get('ambient', false);
    w.className = w.className.replace(/\s*ambient/, '');
    if (!on) { w.style.backgroundImage = ''; return; }
    var item = this._item || {};
    var m = this._meta || {};
    var url = m.thumb || item.thumb || U.thumb(this._id);
    if (url) w.style.backgroundImage = 'url("' + url + '")';
    w.className += ' ambient';
  },

  /* Minimizing keeps the same <video> element and its playback position. The
     previous browse screen stays mounted underneath; only the overlay changes. */
  minimize: function () {
    if (!this._on || this._mini) return;
    this.clearBackGestures();
    this.closePanel();
    this.closeSettings(false);
    this.cancelAutoplay();
    this._mini = true;
    var w = this.el();
    w.className = 'on mini';
    if (U.store.get('ambient', false)) w.className += ' ambient';
    var bar = document.getElementById('minibar');
    if (bar) {
      bar.className = 'minibar on';
      var t = document.getElementById('minititle');
      if (t) t.textContent = (this._meta && this._meta.title) ||
        (this._item && this._item.title) || '';
    }
    document.getElementById('prep').style.display = 'none';
    U.toast('Player minimized');
  },

  restore: function () {
    if (!this._mini) return;
    this.clearBackGestures();
    this._mini = false;
    var bar = document.getElementById('minibar');
    if (bar) bar.className = 'minibar';
    this.showUI();
  },

  cancelAutoplay: function () {
    if (this._autoT) { clearInterval(this._autoT); this._autoT = null; }
  },

  startAutoplay: function () {
    var self = this;
    this.cancelAutoplay();
    var left = 6;
    var card = document.getElementById('next');
    var label = card && card.querySelector('.lbl');
    var tick = function () {
      card = document.getElementById('next');
      label = card && card.querySelector('.lbl');
      if (label) label.textContent = 'UP NEXT IN ' + left + 'S';
      if (--left < 0) {
        self.cancelAutoplay();
        var r = self._related && self._related[0];
        if (r) self.open(r.id, r, true);
        else self.close();
      }
    };
    tick();
    this._autoT = setInterval(tick, 1000);
  },

  /* App-level settings write the same localStorage keys the player reads.
     Apply immediately when a video is open so defaults take effect at once. */
  applySetting: function (key, value) {
    if (key === 'speed') {
      var v = document.getElementById('video');
      if (v) v.playbackRate = Number(value) || 1;
    } else if (key === 'quality') {
      if (this._on && !this._mini) this.reload(Number(value) || 720);
    } else if (key === 'ambient') {
      this.applyAmbient();
    } else if (key === 'timestamp') {
      var times = document.querySelector('#watch .times');
      if (times) times.style.display = value ? '' : 'none';
    } else if (key === 'showNext') {
      this.showNextBtn(!!(this._related && this._related.length));
    } else if (key === 'autoplay' && !value) {
      this.cancelAutoplay();
    } else if (key === 'captions' || key === 'capBg' || key === 'capSize' || key === 'capColor') {
      this.paintCaptions(this.pos());
    } else if (key === 'aiCaptions') {
      if (this._id && this._on) this.loadExtras(this._id);
    } else if (key === 'ryd') {
      if (value && this._id && this._on && !this._ryd) {
        var self = this;
        var id = this._id;
        API.ryd(id).then(function (d) {
          if (self._id !== id || !U.store.get('ryd', false)) return;
          self._ryd = Number(d && d.dislikes) || 0;
          self._rydLikes = Number(d && d.likes) || 0;
          self.refreshBtns();
        }).catch(function () {});
      } else {
        this.refreshBtns();
      }
    }
  },

  setUI: function (on) {
    var w = this.el();
    if (!w) return;
    if (this._mini) {
      w.className = 'on mini' + (U.store.get('ambient', false) ? ' ambient' : '');
      return;
    }
    w.className = on ? 'on ui' : 'on';
    if (on && this._zone === 'seek') w.className += ' zseek';
    if (U.store.get('ambient', false)) w.className += ' ambient';
  },

  showUI: function () {
    var wasHidden = this.el().className.indexOf('ui') < 0;
    if (wasHidden) { this._zone = 'seek'; this._bi = 1; }
    this.setUI(true);
    this.paint();
    /* Paint the live position the instant the controls come back, so a hidden
       bar can never appear frozen at the time it disappeared. */
    this.tick();
    clearTimeout(this._hideT);
    var self = this;
    this._hideT = setTimeout(function () {
      var v = document.getElementById('video');
      if (v && !v.paused) self.setUI(false);
    }, 7000);
  },

  hideUI: function () {
    clearTimeout(this._hideT);
    this.setUI(false);
  },

  toggle: function () {
    var v = document.getElementById('video');
    this._wantPlaying = !this._wantPlaying;
    if (this._wantPlaying) {
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
      this.showUI();
    } else {
      v.pause();
      clearTimeout(this._hideT);
      this.setUI(true);
    }
    /* The icon changes once, from the user's intent, not from decoder events. */
    this.refreshBtns();
  },

  /* YouTube's TV remote behaviour: LEFT/RIGHT always jump 10 seconds, whether
     the controls are hidden or the seek bar is the active zone. Playback keeps
     running — pausing during a scrub is what made the audio disappear on Tizen. */
  seek: function (delta) {
    var d = this.duration();
    /* The pending target is the source of truth, so repeated presses add up. */
    var base = this._seekAt != null ? this._seekAt : this.displayTime();
    /* Holding the arrow accelerates like the stock app: 10s steps, then 20s,
       then 30s. The run resets once the remote has been quiet. */
    if (Math.abs(delta) === 10) {
      this._seekRun = (this._seekGoT || this._seekPhase) ? (this._seekRun || 0) + 1 : 1;
      if (this._seekRun > 30) delta *= 3;
      else if (this._seekRun > 10) delta *= 2;
    }
    var t = Math.max(0, base + delta);
    if (d > 3) t = Math.min(t, d - 1);
    var vv = document.getElementById('video');
    API.log('seek', { id: this._id, delta: delta, base: base, target: t,
      duration: d, at: vv && vv.currentTime, ready: vv && vv.readyState,
      paused: vv && vv.paused, phase: this._seekPhase || null,
      soft: !this.softBroken() });
    this._seekAt = t;
    this._seekKind = 'seek';
    this._dispTime = t; this._dispT = Date.now(); this._lastRaw = null;
    /* Write once after the remote goes quiet. A write already in flight chains
       to the newest target when it lands (seekLanded). */
    var self = this;
    clearTimeout(this._seekGoT);
    if (!this._seekPhase) {
      this._seekGoT = setTimeout(function () { self._seekGoT = null; self.startSeek(); }, 450);
    }
    this.tick();
    this.showUI();
  },

  seekTo: function (t) {
    this._seekAt = Math.max(0, t);
    this._seekKind = 'seek';
    this._dispTime = this._seekAt; this._dispT = Date.now(); this._lastRaw = null;
    clearTimeout(this._seekGoT); this._seekGoT = null;
    if (!this._seekPhase) this.startSeek();
    this.tick(); this.showUI();
  },

  /* Remembered per TV: once a live currentTime write has been dropped, every
     later seek goes straight to the paused reload path. */
  softBroken: function () {
    return !!U.store.get('softSeekBroken', false);
  },

  startSeek: function () {
    if (this._seekAt == null || !this._on || this._seekPhase) return;
    var t = this._seekAt;
    var v = document.getElementById('video');
    if (this._mse) { this.mseSeek(t); return; }
    /* Live currentTime writes only where they are known to work (desktop) and
       only inside the stream currently loaded. */
    if (this.softBroken() || t < (this._off || 0)) { this.offsetSeek(t); return; }
    var self = this;
    this._seekPhase = 'soft';
    this._seekTarget = t;
    API.log('seek.soft', { id: this._id, target: t, at: this.pos(), ready: v.readyState });
    try { v.currentTime = t - (this._off || 0); } catch (e) {}
    clearTimeout(this._seekCheckT);
    this._seekCheckT = setTimeout(function () {
      if (self._seekPhase !== 'soft') return;
      U.store.set('softSeekBroken', true);
      API.log('seek.soft_failed', { id: self._id, why: 'timeout', at: self.pos() });
      self._seekPhase = null;
      self.offsetSeek(self._seekAt != null ? self._seekAt : t);
    }, 3000);
  },

  /* MSE seek: a plain currentTime write. The Dash session fetches the segment
     at t; playback keeps its state and no loader is shown. */
  mseSeek: function (t) {
    var v = document.getElementById('video');
    var self = this;
    this._seekPhase = 'soft';
    this._seekTarget = t;
    this._seekWrites = (this._seekWrites || 0) + 1;
    API.log('seek.mse', { id: this._id, target: t, at: v.currentTime, ready: v.readyState,
      kind: this._seekKind, n: this._seekWrites });
    try { v.currentTime = t; } catch (e) {}
    clearTimeout(this._seekCheckT);
    this._seekCheckT = setTimeout(function () {
      if (self._seekPhase === 'soft') self.seekFailed('mse-timeout');
    }, 10000);
  },

  /* Reliable path on Tizen: ask the bridge for the keyframe <= t and play a
     new stream that starts there. Element time 0 == that keyframe. */
  offsetSeek: function (t) {
    var self = this;
    var v = document.getElementById('video');
    var token = ++this._seekToken;
    this._seekPhase = 'offset';
    this._seekTarget = t;
    var q = this._q || U.store.get('quality', 720);
    API.log('seek.offset', { id: this._id, target: t, kind: this._seekKind });
    document.getElementById('prep').style.display = 'flex';
    try { v.pause(); } catch (e) {}
    clearTimeout(this._seekCheckT);
    this._seekCheckT = setTimeout(function () {
      if (self._seekPhase === 'offset' && token === self._seekToken) self.seekFailed('offset-timeout');
    }, 20000);
    API.get('/api/seekpoint?id=' + encodeURIComponent(this._id) + '&q=' + q +
      '&t=' + t.toFixed(2) + (this._seekKind === 'resume' ? '' : '&near=1'), 6000).then(function (r) {
      if (token !== self._seekToken || !self._on) return;
      var k = r && r.ok ? Number(r.start) : NaN;
      if (!isFinite(k) || k < 0) k = t;
      self.loadAt(k, q);
    }, function () {
      if (token !== self._seekToken || !self._on) return;
      self.loadAt(t, q);
    });
  },

  loadAt: function (k, q) {
    var v = document.getElementById('video');
    this._off = k;
    this._seekStart = k;
    API.log('seek.load', { id: this._id, start: k, target: this._seekTarget });
    v.src = k > 0.05 ? API.streamUrl(this._id, q) + '&start=' + k.toFixed(3)
                     : API.streamUrl(this._id, q);
    if (k <= 0.05) this._off = 0;
    v.load();
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  },

  /* Called from loadedmetadata / canplay / playing: an offset stream that has
     started playing has landed. */
  seekReady: function () {
    var v = document.getElementById('video');
    if (this._mse) {
      if (this._resumeAt != null && !this._resumeWritten && v.readyState >= 1) {
        this._resumeWritten = true;
        this._seekWrites = 0;
        this.mseSeek(this._resumeAt);
      }
      return;
    }
    if (this._seekPhase !== 'offset') return;
    if (v.src.indexOf('start=') < 0 && this._off) return;
    if (v.readyState >= 3) this.seekLanded('offset');
  },

  onSeeked: function () {
    if (this._seekPhase !== 'soft') return;
    var v = document.getElementById('video');
    if (Math.abs(this.pos() - this._seekTarget) < 3) {
      this._seekWrites = 0;
      this.seekLanded(this._mse ? 'mse' : 'soft');
      return;
    }
    if (this._mse) {
      clearTimeout(this._seekCheckT);
      this._seekPhase = null;
      if (this._seekWrites < 3) { this.mseSeek(this._seekAt != null ? this._seekAt : this._seekTarget); return; }
      this._seekWrites = 0;
      this.seekFailed('mse-rejected');
      return;
    }
    clearTimeout(this._seekCheckT);
    U.store.set('softSeekBroken', true);
    API.log('seek.soft_failed', { id: this._id, why: 'seeked-at-old-position',
      at: this.pos(), target: this._seekTarget });
    this._seekPhase = null;
    this.offsetSeek(this._seekAt != null ? this._seekAt : this._seekTarget);
  },

  seekLanded: function (how) {
    var v = document.getElementById('video');
    clearTimeout(this._seekCheckT); this._seekCheckT = null;
    var target = this._seekTarget;
    API.log(this._seekKind === 'resume' ? 'resume.ok' : 'seek.ok',
      { id: this._id, how: how, target: target, at: this.pos(), off: this._off || 0 });
    this._seekPhase = null;
    this._resumeAt = null;
    document.getElementById('prep').style.display = 'none';
    /* More presses arrived while this one was loading: land the newest. */
    if (this._seekAt != null && Math.abs(this._seekAt - target) > 1) {
      this._seekKind = 'seek';
      this.startSeek();
      return;
    }
    this._seekAt = null;
    var p = this.pos();
    this._dispTime = p; this._dispT = Date.now(); this._lastRaw = p;
    this.resumePlayback();
    this.tick();
  },

  seekFailed: function (why) {
    var v = document.getElementById('video');
    clearTimeout(this._seekCheckT); this._seekCheckT = null;
    API.log(this._seekKind === 'resume' ? 'resume.failed' : 'seek.failed',
      { id: this._id, why: why, target: this._seekTarget, at: this.pos(),
        ready: v.readyState, off: this._off || 0 });
    this._seekPhase = null;
    this._seekAt = null;
    this._resumeAt = null;
    document.getElementById('prep').style.display = 'none';
    var p = this.pos();
    this._dispTime = p; this._dispT = Date.now(); this._lastRaw = p;
    this.resumePlayback();
    this.tick();
  },

  resumePlayback: function () {
    var v = document.getElementById('video');
    if (!this._wantPlaying || !this._on || !v.paused) return;
    v.muted = false;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  },

  /* Kept as a no-op so keyup remains a single, simple code path. */
  resumeScrub: function () {},

  volume: function (delta) {
    var v = document.getElementById('video');
    if (delta > 0 && v.muted) v.muted = false;
    v.volume = Math.max(0, Math.min(1, v.volume + delta));
    U.toast(v.muted ? 'Muted' : 'Volume ' + Math.round(v.volume * 100) + '%');
    this.showUI();
  },

  close: function () {
    this.clearBackGestures();
    this.save();
    this.closePanel();
    this.closeSettings(false);
    this.cancelAutoplay();
    this._mini = false;
    this.paintCaptions(0);
    this.hidePreview();
    var bar = document.getElementById('minibar');
    if (bar) bar.className = 'minibar';
    this._on = false;
    clearInterval(this._poll);
    clearInterval(this._saveT);
    clearInterval(this._tickT);
    clearTimeout(this._hideT);
    if (this._seekClearT) { clearTimeout(this._seekClearT); this._seekClearT = null; }
    clearTimeout(this._seekCheckT);
    this._seekCheckT = null;
    clearInterval(this._resumeT);
    this._wantPlaying = false;
    this._seekAt = null;
    this._seekRetry = 0;
    this._seekWrites = 0;
    this._seekConfirmed = false;
    this._seekPhase = null;
    clearTimeout(this._seekGoT); this._seekGoT = null;
    this._downHeld = false;
    this._scrubPaused = false;
    this._resumeAt = null;
    this._resumeConfirmed = false;
    var v = document.getElementById('video');
    if (this._dashS) { this._dashS.destroy(); this._dashS = null; }
    this._mse = false;
    this._dash = null;
    v.pause();
    v.removeAttribute('src');
    v.load();
    var w = this.el();
    w.className = '';
    w.style.display = '';
    App.afterPlayer();
  },

  onKey: function (e) {
    var k = e.keyCode;
    var w = this.el();
    var visible = w.className.indexOf('ui') > -1;

    if (this._mini) {
      /* While minimized the browse screen stays usable: OK opens tiles and
         arrows keep moving focus. Back tap restores, double Back toggles
         playback. Down is special: press starts a hold timer and consumes the
         key; release scrolls the browse row unless the hold closed the popup. */
      var isBack = k === KEY.TIZEN_BACK || k === KEY.BACK;
      if (isBack) {
        if (e.repeat || this._backDown || this._backIgnoreUp) return true;
        if (this._backArmed) {
          /* Second tap inside the window: toggle playback, stay minimized. */
          this.clearBackGestures();
          this._backIgnoreUp = true;
          this.toggle();
          return true;
        }
        this._backDown = true;
        this._backArmed = true;
        return true;
      }
      if (k === KEY.DOWN) {
        if (e.repeat || this._downHoldT || this._downHeld) return true;
        API.log('mini.down', { phase: 'press' });
        this._downHeld = false;
        var selfDown = this;
        this._downHoldT = setTimeout(function () {
          selfDown._downHoldT = null;
          selfDown._downHeld = true;
          API.log('mini.down', { phase: 'hold', close: true });
          /* After close() the player is inactive, so the remote's auto-repeat
             Down presses would reach the browse screen and scroll it. Swallow
             every Down until the key is released. */
          if (window.Keys && Keys.swallow) Keys.swallow(KEY.DOWN);
          selfDown._downHeld = false;
          selfDown.close();
        }, 550);
        return true;
      }
      if (k === KEY.INFO) { this.restore(); return true; }
      if (k === KEY.STOP) { this.close(); return true; }
      if (k === KEY.PLAY_PAUSE || k === KEY.PLAY || k === KEY.PAUSE) {
        this.toggle(); return true;
      }
      return false;
    }

    if (this._autoT &&
        (k === KEY.TIZEN_BACK || k === KEY.BACK || k === KEY.LEFT || k === KEY.ENTER)) {
      this.cancelAutoplay();
      this.showUI();
      U.toast('Autoplay cancelled');
      return true;
    }

    if (this._panel) {
      if (k === KEY.TIZEN_BACK || k === KEY.BACK || k === KEY.ENTER) {
        this.closePanel(); this.showUI(); return true;
      }
      if (k === KEY.UP || k === KEY.DOWN) {
        var list = document.getElementById('pinfolist');
        list.scrollTop += (k === KEY.UP ? -1 : 1) * 160;
        return true;
      }
      return true;
    }

    if (this._settings) {
      if (k === KEY.TIZEN_BACK || k === KEY.BACK || k === KEY.LEFT) {
        this.settingsBack();
        return true;
      }
      if (k === KEY.RIGHT || k === KEY.ENTER) {
        if (this._setIdx === -1) this.settingsBack();
        else this.settingActivate();
        return true;
      }
      if (k === KEY.UP || k === KEY.DOWN) {
        /* -1 is the header arrow; rows are 0..n-1. Wrap through the arrow. */
        var total = this._setItems.length + 1;
        var pos = this._setIdx === -1 ? 0 : this._setIdx + 1;
        pos = (pos + (k === KEY.UP ? -1 : 1) + total) % total;
        this._setIdx = pos === 0 ? -1 : pos - 1;
        this.paintSettings();
        return true;
      }
      return true;
    }

    if (k === KEY.TIZEN_BACK || k === KEY.BACK) {
      if (U.store.get('minimizePlayer', true)) this.minimize();
      else this.close();
      return true;
    }
    if (k === KEY.STOP) { this.close(); return true; }

    if (k === KEY.MUTE) {
      var mv = document.getElementById('video');
      mv.muted = !mv.muted;
      U.toast(mv.muted ? 'Muted' : 'Unmuted');
      this.showUI();
      return true;
    }
    if (k === KEY.VOLUP || k === KEY.VOLDOWN) {
      this.volume(k === KEY.VOLUP ? 0.1 : -0.1);
      return true;
    }
    if (k === KEY.PLAY_PAUSE || k === KEY.PLAY || k === KEY.PAUSE) {
      this.toggle(); return true;
    }
    if (k === KEY.ENTER) { this.activate(); return true; }

    if (k === KEY.LEFT || k === KEY.RIGHT) {
      var dir = k === KEY.RIGHT ? 1 : -1;
      if (!e.repeat) API.log('player.key', { key: k, zone: this._zone,
        visible: visible, mini: this._mini, at: document.getElementById('video').currentTime });
      /* Hidden controls and the seek bar scrub; the button row navigates. */
      if (!visible) { this.showUI(); this.seek(dir * 10); return true; }
      if (this._zone === 'seek') { this.seek(dir * 10); return true; }
      this.focusBtn(this._bi + dir);
      return true;
    }

    if (k === KEY.UP) {
      if (!visible) { this.showUI(); return true; }
      if (this._zone === 'btns') this.focusZone('seek');
      return true;
    }

    if (k === KEY.DOWN) {
      /* Pressing Down while the controls are hidden must land on Play/Pause,
         not back on the seek bar. */
      if (!visible) { this.showUI(); this.focusZone('btns'); return true; }
      if (this._zone === 'seek') this.focusZone('btns');
      else this.hideUI();
      return true;
    }

    if (k === KEY.REW) { this.seek(-30); return true; }
    if (k === KEY.FF) { this.seek(30); return true; }
    if (k === KEY.INFO) { visible ? this.hideUI() : this.showUI(); return true; }
    return false;
  },

  /* Only the mini player needs keyup: Back cannot restore on keydown because
     the same physical button may become a double tap, and Down must not scroll
     the browse screen until we know it was a short press. */
  onKeyUp: function (e) {
    var k = e.keyCode;
    if (!this._mini) return false;

    if (k === KEY.DOWN) {
      if (this._downHoldT) { clearTimeout(this._downHoldT); this._downHoldT = null; }
      if (this._downHeld) { this._downHeld = false; return true; }
      API.log('mini.down', { phase: 'release', scroll: true });
      /* Short press: scroll on release, never on press, so a hold cannot move
         focus underneath the popup. */
      if (typeof Nav !== 'undefined' && Nav.onKey) {
        Nav.onKey({ keyCode: KEY.DOWN, repeat: false });
      }
      return true;
    }

    if (k !== KEY.TIZEN_BACK && k !== KEY.BACK) return false;
    if (this._backIgnoreUp) { this._backIgnoreUp = false; return true; }
    if (!this._backDown && !this._backArmed) return false;

    this._backDown = false;
    if (!this._backArmed) return true;

    /* First tap released. Keep the restore pending briefly so a second tap can
       turn it into play/pause instead. */
    var self = this;
    if (this._backTapT) clearTimeout(this._backTapT);
    this._backTapT = setTimeout(function () {
      self._backTapT = null;
      self.restore();
    }, 380);
    return true;
  },

  activate: function () {
    if (this._zone !== 'btns') { this.toggle(); return; }
    var b = this._btns[this._bi];
    if (!b) { this.toggle(); return; }
    this.hit(b.act);
  }
};
