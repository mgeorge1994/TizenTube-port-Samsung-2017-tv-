/* MSE/DASH playback, the way the stock YouTube TV app plays.
   The bridge returns, per track, the init byte range, the codec string and the
   sidx segment index (/api/dash). We append the init segments, then keep a
   short window of segments ahead of currentTime in each SourceBuffer. A seek
   is a plain currentTime write: the `seeking` event aborts in-flight requests
   and the pump fetches the segment that contains the new position.
   Chromium 56 / Tizen 3.0: ES5 only, XHR arraybuffer, no fetch streams. */
var Dash = {
  supported: function () {
    try {
      return !!(window.MediaSource && MediaSource.isTypeSupported &&
        MediaSource.isTypeSupported('video/mp4; codecs="avc1.4d401f"') &&
        MediaSource.isTypeSupported('audio/mp4; codecs="mp4a.40.2"'));
    } catch (e) { return false; }
  },

  create: function (video, info, base, hooks) {
    return new DashSession(video, info, base, hooks || {});
  }
};

function DashSession(video, info, base, hooks) {
  this.v = video;
  this.info = info;
  this.base = base || '';
  this.hooks = hooks;
  this.dead = false;
  this.ready = false;
  this.tracks = [];
  this.ms = new MediaSource();
  var self = this;
  this._onOpen = function () { self.open(); };
  this._onSeeking = function () { self.onSeeking(); };
  this.ms.addEventListener('sourceopen', this._onOpen);
  video.addEventListener('seeking', this._onSeeking);
  this.objUrl = URL.createObjectURL(this.ms);
  video.src = this.objUrl;
}

DashSession.prototype = {
  AHEAD_VIDEO: 30,
  AHEAD_AUDIO: 45,
  BEHIND: 20,

  log: function (ev, data) { if (this.hooks.log) this.hooks.log(ev, data); },

  open: function () {
    if (this.dead || this.tracks.length) return;
    var self = this;
    try { this.ms.duration = this.info.duration; } catch (e) {}
    var defs = [this.info.video, this.info.audio];
    for (var i = 0; i < defs.length; i++) {
      var d = defs[i];
      var sb;
      try { sb = this.ms.addSourceBuffer(d.mime); }
      catch (e) { this.fail('addSourceBuffer ' + d.mime + ': ' + e.message); return; }
      var tr = { kind: d.kind, def: d, sb: sb, xhr: null, pending: null,
        last: -1, done: false, inited: false, errors: 0 };
      sb.addEventListener('updateend', (function (t) {
        return function () { self.onUpdateEnd(t); };
      })(tr));
      this.tracks.push(tr);
    }
    for (var j = 0; j < this.tracks.length; j++) this.fetchInit(this.tracks[j]);
    this._pumpT = setInterval(function () { self.pump(); }, 250);
  },

  fetchInit: function (t) {
    var self = this;
    this.get(t, t.def.init[0], t.def.init[1], function (buf) {
      t.inited = true;
      self.append(t, buf, -1);
    });
  },

  /* One XHR per track. Range travels as ?r= so no CORS preflight is needed. */
  get: function (t, a, b, done) {
    var self = this;
    var x = new XMLHttpRequest();
    t.xhr = x;
    x.open('GET', this.base + t.def.url + '?r=' + a + '-' + b, true);
    x.responseType = 'arraybuffer';
    x.timeout = 20000;
    x.onload = function () {
      if (t.xhr !== x || self.dead) return;
      t.xhr = null;
      if ((x.status === 200 || x.status === 206) && x.response && x.response.byteLength) {
        t.errors = 0;
        done(x.response);
      } else {
        self.retry(t, 'http ' + x.status);
      }
    };
    x.onerror = x.ontimeout = function () {
      if (t.xhr !== x || self.dead) return;
      t.xhr = null;
      self.retry(t, 'network');
    };
    x.send();
  },

  retry: function (t, why) {
    t.errors++;
    this.log('dash.retry', { kind: t.kind, why: why, n: t.errors });
    if (t.errors > 8) { this.fail(t.kind + ' fetch failed: ' + why); return; }
    var self = this;
    t.backoff = Date.now() + Math.min(4000, 400 * t.errors);
    if (!t.inited) setTimeout(function () { if (!self.dead) self.fetchInit(t); }, 500 * t.errors);
  },

  append: function (t, buf, idx) {
    if (this.dead) return;
    if (t.sb.updating || t.pending) { t.pending = { buf: buf, idx: idx }; return; }
    try {
      t.sb.appendBuffer(buf);
      if (idx >= 0) t.last = idx;
    } catch (e) {
      /* QuotaExceeded: drop what is behind the playhead, retry after updateend. */
      t.pending = { buf: buf, idx: idx };
      this.log('dash.quota', { kind: t.kind, err: e.name });
      this.evict(t, 5);
    }
  },

  onUpdateEnd: function (t) {
    if (this.dead) return;
    if (t.pending && !t.sb.updating) {
      var p = t.pending;
      t.pending = null;
      this.append(t, p.buf, p.idx);
      return;
    }
    if (!this.ready && this.tracks.length === 2 &&
        this.tracks[0].inited && this.tracks[1].inited &&
        this.v.readyState >= 1) {
      this.ready = true;
      if (this.hooks.ready) this.hooks.ready();
    }
    this.pump();
  },

  /* End of the buffered range that contains time `ct`, or `ct` if none. */
  bufEnd: function (sb, ct) {
    var b;
    try { b = sb.buffered; } catch (e) { return ct; }
    for (var i = 0; i < b.length; i++) {
      if (ct >= b.start(i) - 0.3 && ct <= b.end(i) + 0.3) return b.end(i);
    }
    return ct;
  },

  segAt: function (segs, t) {
    var lo = 0, hi = segs.length - 1, ans = 0;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1;
      if (segs[mid][0] <= t + 0.01) { ans = mid; lo = mid + 1; } else hi = mid - 1;
    }
    return ans;
  },

  evict: function (t, keepBehind) {
    if (t.sb.updating) return;
    var ct = this.v.currentTime;
    var b;
    try { b = t.sb.buffered; } catch (e) { return; }
    if (!b.length) return;
    var cut = ct - keepBehind;
    if (b.start(0) < cut - 1) {
      try { t.sb.remove(0, cut); } catch (e) {}
      return;
    }
    /* Ranges left far ahead by an earlier seek. */
    var last = b.length - 1;
    if (b.start(last) > ct + this.AHEAD_AUDIO + 10) {
      try { t.sb.remove(b.start(last), b.end(last)); } catch (e) {}
    }
  },

  pump: function () {
    if (this.dead || !this.tracks.length) return;
    var ct = this.v.currentTime;
    var allDone = true;
    for (var i = 0; i < this.tracks.length; i++) {
      var t = this.tracks[i];
      if (!t.inited || t.xhr || t.pending || t.sb.updating) { allDone = false; continue; }
      if (t.backoff && Date.now() < t.backoff) { allDone = false; continue; }
      var segs = t.def.segs;
      var end = this.bufEnd(t.sb, ct);
      var ahead = t.kind === 'video' ? this.AHEAD_VIDEO : this.AHEAD_AUDIO;
      var total = segs[segs.length - 1][0] + segs[segs.length - 1][1];
      if (end >= total - 0.2) { t.done = true; continue; }
      t.done = false;
      allDone = false;
      if (end - ct > ahead) {
        this.evict(t, this.BEHIND);
        continue;
      }
      var idx = this.segAt(segs, end);
      /* The buffered end can stop a few ms short of the segment boundary. */
      if (idx === t.last && end > ct + 0.5) idx++;
      if (idx >= segs.length) { t.done = true; continue; }
      this.fetchSeg(t, idx);
    }
    if (allDone && this.ms.readyState === 'open') {
      var busy = false;
      for (var k = 0; k < this.tracks.length; k++) if (this.tracks[k].sb.updating) busy = true;
      if (!busy) { try { this.ms.endOfStream(); } catch (e) {} }
    }
  },

  fetchSeg: function (t, idx) {
    var self = this;
    var s = t.def.segs[idx];
    /* Small audio segments: fetch two at once to halve the request count. */
    var lastIdx = idx;
    if (t.kind === 'audio' && idx + 1 < t.def.segs.length) lastIdx = idx + 1;
    var e = t.def.segs[lastIdx];
    this.get(t, s[2], e[3], function (buf) { self.append(t, buf, lastIdx); });
  },

  onSeeking: function () {
    if (this.dead) return;
    var ct = this.v.currentTime;
    for (var i = 0; i < this.tracks.length; i++) {
      var t = this.tracks[i];
      if (!t.inited) continue;
      if (t.xhr) { try { t.xhr.abort(); } catch (e) {} t.xhr = null; }
      if (t.pending && t.pending.idx >= 0) t.pending = null;
      t.last = -1;
      t.done = false;
      t.backoff = 0;
    }
    this.log('dash.seeking', { at: ct });
    this.pump();
  },

  fail: function (why) {
    if (this.dead) return;
    this.log('dash.error', { why: why });
    if (this.hooks.error) this.hooks.error(why);
  },

  destroy: function () {
    if (this.dead) return;
    this.dead = true;
    clearInterval(this._pumpT);
    this.v.removeEventListener('seeking', this._onSeeking);
    this.ms.removeEventListener('sourceopen', this._onOpen);
    for (var i = 0; i < this.tracks.length; i++) {
      var t = this.tracks[i];
      if (t.xhr) { try { t.xhr.abort(); } catch (e) {} }
    }
    try { URL.revokeObjectURL(this.objUrl); } catch (e) {}
  }
};
