/* Small helpers shared by every view. ES5 only: the TV runs Chromium 56. */
var U = {
  el: function (tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  },
  clear: function (node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
  },
  esc: function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },
  dur: function (sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    var mm = (h && m < 10 ? '0' : '') + m;
    var ss = (s < 10 ? '0' : '') + s;
    return (h ? h + ':' : '') + mm + ':' + ss;
  },
  views: function (n) {
    if (!n && n !== 0) return '';
    if (n >= 1e9) return (n / 1e9).toFixed(1).replace('.0', '') + 'B views';
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.0', '') + 'M views';
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace('.0', '') + 'K views';
    return n + ' views';
  },
  ago: function (iso) {
    if (!iso) return '';
    var t = Date.parse(iso);
    // search results hand back relative text ("2 days ago") instead of a date
    if (!t) return /^\d{4}-/.test(String(iso)) ? '' : String(iso);
    var d = Math.floor((Date.now() - t) / 864e5);
    if (d < 1) return 'today';
    if (d < 7) return d + (d === 1 ? ' day ago' : ' days ago');
    if (d < 30) return Math.floor(d / 7) + ' wk ago';
    if (d < 365) return Math.floor(d / 30) + ' mo ago';
    return Math.floor(d / 365) + ' yr ago';
  },
  thumb: function (id, big) {
    return 'https://i.ytimg.com/vi/' + id + '/' + (big ? 'maxresdefault' : 'hqdefault') + '.jpg';
  },
  store: {
    get: function (k, d) {
      try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); }
      catch (e) { return d; }
    },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  },
  toast: function (msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'on';
    clearTimeout(U._tt);
    U._tt = setTimeout(function () { t.className = ''; }, 2200);
  },
  /* horizontal + vertical scrolling that does not rely on scrollIntoView(options),
     which Chromium 56 does not support. */
  revealCol: function (strip, tile) {
    if (!strip) return;
    var pad = 60, w = tile.offsetWidth;
    var left = tile.offsetLeft, right = left + w;
    var viewL = strip.scrollLeft, viewR = viewL + strip.clientWidth;
    if (left - pad < viewL) strip.scrollLeft = left - pad;
    else if (right + pad > viewR) strip.scrollLeft = right + pad - strip.clientWidth;
  },
  revealRow: function (view, row, topBar) {
    if (!view || !row) return;
    var bar = topBar == null ? 96 : topBar;
    var top = row.offsetTop, bottom = top + row.offsetHeight;
    var vTop = view.scrollTop, vBottom = vTop + view.clientHeight;
    if (top - 40 < vTop + bar) view.scrollTop = top - bar - 24;
    else if (bottom + 20 > vBottom) view.scrollTop = bottom + 20 - view.clientHeight;
  }
};
