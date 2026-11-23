/* Ambient focus previews.
   A single muted <video> is moved into the thumbnail of the focused tile. The
   bridge job is started by Nav.refresh() at the same moment, so by the time the
   stream is playable the preview appears without blocking navigation. */
var Preview = {
  el: null,
  tile: null,
  id: null,
  q: 720,
  src: null,
  token: 0,
  timer: null,
  poll: null,

  init: function () {
    if (this.el) return;
    var v = document.createElement('video');
    v.id = 'prevvideo';
    v.className = 'tilepreview';
    v.muted = true;
    v.loop = true;
    v.autoplay = false;
    v.preload = 'none';
    v.volume = 0;
    v.setAttribute('muted', 'muted');
    v.setAttribute('playsinline', 'playsinline');
    v.setAttribute('webkit-playsinline', 'webkit-playsinline');
    this.el = v;
    document.getElementById('shell').appendChild(v);
  },

  show: function (tile, id) {
    this.init();
    if (Player.active()) return;
    if (!tile || !id || !tile.querySelector('.thumb')) return;
    if (this.tile === tile && this.id === id) return;

    this.hide();
    var self = this;
    var tok = ++this.token;
    this.tile = tile;
    this.id = id;
    this.q = U.store.get('quality', 720);
    tile.querySelector('.thumb').appendChild(this.el);

    /* A fast remote pass over the grid should not launch previews for tiles
       the user never stops on. */
    this.timer = setTimeout(function () {
      if (tok === self.token) self.load(tok);
    }, 450);
  },

  load: function (tok) {
    var self = this;
    var tries = 0;

    function check() {
      if (tok !== self.token || !self.tile || Player.active()) return;
      API.prepare(self.id, self.q).then(function (s) {
        if (tok !== self.token) return;
        if (s.state === 'ready') { self.play(tok); return; }
        if (s.state === 'error') { self.hide(); return; }
        if (++tries < 180) self.poll = setTimeout(check, 400);
      }).catch(function () {
        if (tok === self.token && ++tries < 180) self.poll = setTimeout(check, 600);
      });
    }
    check();
  },

  play: function (tok) {
    var self = this;
    var v = this.el;
    var url = API.streamUrl(this.id, this.q);
    if (!v || !this.tile || tok !== this.token) return;

    function start() {
      if (tok !== self.token || !self.tile || Player.active()) return;
      v.muted = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
      v.classList.add('on');
    }

    v.oncanplay = start;
    v.onloadeddata = start;
    v.onerror = function () { if (tok === self.token) self.hide(); };
    this.src = url;
    v.src = url;
    v.load();
    if (v.readyState >= 2) setTimeout(start, 0);
  },

  hide: function () {
    this.token++;
    clearTimeout(this.timer);
    clearTimeout(this.poll);
    this.timer = null;
    this.poll = null;

    var v = this.el;
    if (v) {
      v.pause();
      v.classList.remove('on');
      v.oncanplay = null;
      v.onloadeddata = null;
      v.onerror = null;
      v.removeAttribute('src');
      v.load();
      if (v.parentNode) v.parentNode.removeChild(v);
    }
    this.src = null;
    this.tile = null;
    this.id = null;
  }
};

window.Preview = Preview;
