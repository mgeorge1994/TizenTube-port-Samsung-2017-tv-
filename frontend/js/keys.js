/* Remote-key navigation.
   Rows of focusable elements; arrows move, Enter activates, Back pops the stack. */
var KEY = {
  LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, BACK: 8,
  TIZEN_BACK: 10009, TIZEN_EXIT: 10182,
  PLAY: 415, PAUSE: 19, PLAY_PAUSE: 179, STOP: 413,
  FF: 417, REW: 412, INFO: 457,
  RED: 403, GREEN: 404, YELLOW: 405, BLUE: 406,
  CHUP: 427, CHDOWN: 428, VOLUP: 447, VOLDOWN: 448, MUTE: 449,
  ZERO: 48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57
};

var Nav = {
  rows: [],
  r: 0,
  c: 0,
  view: null,
  railRow: -1,
  gridStart: 0,
  lastGrid: 0,
  railIdx: 0,
  _lastPrefetch: null,

  /* rows come in three kinds: the header (search + account), the vertical
     rail, and the content grid. Everything after the rail is a grid row. */
  set: function (rows, r, c, viewEl) {
    this.blur();
    this.rows = rows || [];
    this.view = viewEl || document.getElementById('view');

    this.railRow = -1;
    this.gridStart = 0;
    for (var i = 0; i < this.rows.length; i++) {
      if (this.rows[i].vertical) this.railRow = i;
      else if (this.rows[i].kind !== 'top' && this.gridStart === 0) this.gridStart = i;
    }
    if (!this.gridStart) this.gridStart = Math.max(0, this.rows.length - 1);

    var start = (r === null || r === undefined) ? this.gridStart : r;
    this.r = Math.min(start, Math.max(0, this.rows.length - 1));
    this.c = Math.max(0, Math.min(c || 0, (this.rows[this.r] || { items: [] }).items.length - 1));
    this.lastGrid = this.gridStart;
    this.refresh();
  },

  blur: function () {
    var f = document.querySelectorAll('.focused');
    for (var i = 0; i < f.length; i++) f[i].classList.remove('focused');
  },

  cur: function () {
    var row = this.rows[this.r];
    return row && row.items[this.c] ? row.items[this.c] : null;
  },

  refresh: function () {
    this.blur();
    var row = this.rows[this.r];
    var el = this.cur();
    if (!el || !row) return;
    el.classList.add('focused');

    /* Focusing a video starts its stream job immediately and plays a silent
       ambient preview inside the thumbnail. */
    if (el.classList && el.classList.contains('tile')) {
      if (window.Preview && U.store.get('previews', false)) Preview.show(el, el._id);
      else if (window.Preview) Preview.hide();
      if (el._id && el._id !== this._lastPrefetch) {
        this._lastPrefetch = el._id;
        API.prefetch(el._id, U.store.get('quality', 720));
      }
    } else if (window.Preview) {
      Preview.hide();
    }

    if (row.horizontal && row.block) U.revealCol(row.block, el);

    if (row.vertical) return;
    if (row.kind === 'top') return;
    if (row.block) U.revealRow(this.view, row.block, 210);
  },

  step: function (d) {
    var row = this.rows[this.r];
    var n = this.c + d;
    if (n >= 0 && n < row.items.length) { this.c = n; this.refresh(); }
  },

  toRail: function () {
    if (this.railRow < 0) return;
    this.lastGrid = Math.max(this.lastGrid, this.gridStart);
    this.r = this.railRow;
    this.c = Math.max(0, Math.min(this.railIdx || 0, this.rows[this.r].items.length - 1));
    this.refresh();
  },

  /* The account circle is pinned at the top of the rail. LEFT from either
     search field jumps straight to it instead of the last-used rail icon. */
  toRailAccount: function () {
    if (this.railRow < 0) return false;
    var row = this.rows[this.railRow];
    for (var i = 0; i < row.items.length; i++) {
      var el = row.items[i];
      if (el && el.classList && el.classList.contains('railaccount')) {
        this.lastGrid = Math.max(this.lastGrid, this.gridStart);
        this.r = this.railRow;
        this.c = i;
        this.railIdx = i;
        this.refresh();
        return true;
      }
    }
    return false;
  },

  /* RIGHT from the pinned account circle returns to the search field — the
     header pill on browse pages, the live field while Search is open. */
  toSearch: function () {
    for (var i = 0; i < this.rows.length; i++) {
      var items = this.rows[i].items;
      for (var j = 0; j < items.length; j++) {
        var el = items[j];
        if (!el || !el.classList) continue;
        var search = el.classList.contains('searchpill') || el.classList.contains('searchbox');
        if (!search || !el.offsetParent) continue;
        this.lastGrid = Math.max(this.lastGrid, this.gridStart);
        this.r = i; this.c = j;
        this.refresh();
        return true;
      }
    }
    return false;
  },

  toContent: function (fromHeader) {
    var r = fromHeader ? this.gridStart : this.lastGrid;
    if (r <= this.railRow) r = this.gridStart;
    if (r >= this.rows.length) r = this.rows.length - 1;
    this.r = r;
    this.c = Math.max(0, Math.min(this.c, this.rows[r].items.length - 1));
    this.refresh();
  },

  move: function (dr, dc) {
    if (!this.rows.length) return;
    var row = this.rows[this.r];

    /* The search field sits above the suggestions and results. RIGHT jumps
       into the on-screen keyboard. Exits from the keyboard are deliberate:
       UP only from the first keyboard row to the search field, DOWN only from
       the SPACE/CLEAR/SEARCH row to results, LEFT only from column 0 to the
       suggestions. */
    var first = row.items[0];
    var isBox = first && first.classList && first.classList.contains('searchbox');
    var isKey = first && first.classList && first.classList.contains('key');
    var keyRow = -1, lastKeyRow = -1, boxRow = -1, firstSuggestion = -1, firstResult = -1;
    for (var i = 0; i < this.rows.length; i++) {
      var f = this.rows[i].items[0];
      if (f && f.classList) {
        if (f.classList.contains('key')) {
          if (keyRow < 0) keyRow = i;
          lastKeyRow = i;
        }
        if (f.classList.contains('searchbox') && boxRow < 0) boxRow = i;
        if (f.classList.contains('suggestitem') && firstSuggestion < 0) firstSuggestion = i;
        if (f.classList.contains('tile') && firstResult < 0) firstResult = i;
      }
    }
    var isSuggestion = first && first.classList && first.classList.contains('suggestitem');
    if ((isBox || isSuggestion) && dc > 0 && keyRow >= 0) {
      this.r = keyRow; this.c = 0; this.lastGrid = keyRow; this.refresh();
      return;
    }
    if (isKey && this.r >= keyRow && this.r <= lastKeyRow) {
      if (dr < 0 && this.r === keyRow) {
        var up = boxRow >= 0 ? boxRow : firstSuggestion;
        if (up >= 0) {
          this.r = up; this.c = 0; this.lastGrid = up; this.refresh();
          return;
        }
      }
      /* Land on the FIRST suggestion so DOWN walks the whole list. */
      if (dc < 0 && this.c === 0 && firstSuggestion >= 0) {
        this.r = firstSuggestion; this.c = 0; this.lastGrid = firstSuggestion; this.refresh();
        return;
      }
      /* Only the bottom SPACE / CLEAR / SEARCH row drops down to results;
         letter rows keep normal vertical keyboard navigation. */
      if (dr > 0 && this.r === lastKeyRow && firstResult >= 0) {
        this.r = firstResult; this.c = 0; this.lastGrid = firstResult; this.refresh();
        return;
      }
    }

    /* LEFT from the live search field goes to the pinned account circle. */
    if (isBox && dc < 0 && this.c === 0 && this.toRailAccount()) return;

    /* rail: up/down wrap around inside it, right hands focus back to the grid */
    if (row.vertical) {
      if (dr) {
        var n = this.c + dr;
        if (n < 0) n = row.items.length - 1;
        else if (n >= row.items.length) n = 0;
        this.c = n; this.railIdx = n; this.refresh();
        return;
      }
      if (dc > 0) {
        var cur = this.cur();
        if (cur && cur.classList && cur.classList.contains('railaccount') &&
            this.toSearch()) return;
        this.toContent();
        return;
      }
      return;
    }

    /* header: search pill (the account circle is pinned above the rail) */
    if (row.kind === 'top') {
      if (dc < 0) {
        if (this.c === 0 && this.toRailAccount()) return;
        this.step(dc); return;
      }
      if (dc > 0) { this.step(dc); return; }
      if (dr > 0) this.toContent(true);
      return;
    }

    /* History is a fixed grid: Up/Down walk rows, Right does nothing, and
       Left always returns to the navigation rail. */
    if (row.verticalOnly) {
      if (dc < 0) { this.toRail(); return; }
      if (dc > 0) return;
    }

    /* content grid */
    if (dc < 0) {
      if (this.c === 0) this.toRail();
      else { this.c -= 1; this.refresh(); }
      return;
    }
    if (dc > 0) { this.step(1); return; }

    if (dr < 0) {
      if (this.r <= this.gridStart) {
        if (this.railRow > 0) { this.r = 0; this.c = 0; this.refresh(); }
        else this.toRail();
        return;
      }
      this.r -= 1;
      this.lastGrid = this.r;
      this.c = Math.max(0, Math.min(this.c, this.rows[this.r].items.length - 1));
      this.refresh();
      return;
    }

    if (dr > 0) {
      var nr = this.r + 1;
      if (nr >= this.rows.length) return;
      this.r = nr;
      this.lastGrid = nr;
      this.c = Math.max(0, Math.min(this.c, this.rows[nr].items.length - 1));
      this.refresh();
    }
  },

  activate: function () {
    var el = this.cur();
    if (!el) return false;
    if (typeof el._nav === 'function') { el._nav(); return true; }
    el.click();
    return true;
  },

  onKey: function (e) {
    var k = e.keyCode;
    if (k === KEY.LEFT) { this.move(0, -1); return true; }
    if (k === KEY.RIGHT) { this.move(0, 1); return true; }
    if (k === KEY.UP) { this.move(-1, 0); return true; }
    if (k === KEY.DOWN) { this.move(1, 0); return true; }
    if (k === KEY.ENTER) { this.activate(); return true; }
    return false;
  }
};

/* One global listener. The player owns keys while open; otherwise the context
   panel owns them. Enter on a video is deliberately resolved on keyup so a
   long hold can open YouTube's context menu instead of starting playback. */
/* A key the app has already acted on (e.g. hold Down closing the mini
   player): its remaining auto-repeats and its keyup are dropped. */
var Keys = {
  _swallow: null,
  _swallowT: null,
  swallow: function (code) {
    var self = this;
    this._swallow = code;
    clearTimeout(this._swallowT);
    /* Safety net in case the platform never delivers the keyup. */
    this._swallowT = setTimeout(function () { self._swallow = null; }, 5000);
  }
};
window.Keys = Keys;

function bindKeys(onBack) {
  var timer = null, pressed = null, fired = false, pending = false;

  function clearPress() {
    if (timer) clearTimeout(timer);
    timer = null;
    pressed = null;
    fired = false;
    pending = false;
  }

  document.addEventListener('keydown', function (e) {
    if (Keys._swallow != null && e.keyCode === Keys._swallow) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    /* letters and editing keys belong to the field; arrows still drive the
       remote so the on-screen keyboard and suggestions remain navigable */
    var tag = e.target && e.target.tagName;
    var k = e.keyCode;
    var arrow = k === KEY.LEFT || k === KEY.RIGHT || k === KEY.UP || k === KEY.DOWN;
    if ((tag === 'INPUT' || tag === 'TEXTAREA') && !arrow) {
      /* Enter still drives the remote whenever a suggestion, result or
         keyboard key is the active item; the input handles it itself when
         the search field is the active item. */
      if (k !== KEY.ENTER || !Nav || Nav.r <= 1) return;
    }
    if (Player.active()) {
      if (Player.onKey(e)) { e.preventDefault(); return; }
    }
    if (window.Context && Context.onKey(e)) { e.preventDefault(); return; }
    if (k === KEY.TIZEN_BACK || k === KEY.BACK) {
      clearPress();
      e.preventDefault();
      onBack();
      return;
    }

    var cur = Nav.cur();
    var isTile = cur && cur.classList && cur.classList.contains('tile');

    if (k === KEY.ENTER && pending) {
      /* Ignore auto-repeat while the hold is being measured. */
      e.preventDefault();
      return;
    }

    if (k === KEY.ENTER && isTile && !e.repeat && window.Context) {
      clearPress();
      pressed = cur;
      fired = false;
      pending = true;
      var tile = cur;
      timer = setTimeout(function () {
        fired = true;
        pending = false;
        timer = null;
        Context.open(tile._item || {}, tile, true);
      }, 450);
      e.preventDefault();
      return;
    }

    if (k !== KEY.ENTER) clearPress();
    if (Nav.onKey(e)) e.preventDefault();
  }, false);

  document.addEventListener('keyup', function (e) {
    if (Keys._swallow != null && e.keyCode === Keys._swallow) {
      Keys._swallow = null;
      clearTimeout(Keys._swallowT);
      API.log('mini.down', { phase: 'release-swallowed' });
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (Player.active() && Player.onKeyUp && Player.onKeyUp(e)) {
      e.preventDefault();
      return;
    }
    if (e.keyCode !== KEY.ENTER) return;
    if (window.Context && Context.releaseEnter) Context.releaseEnter();
    if (!pending) return;
    if (timer) clearTimeout(timer);
    timer = null;
    pending = false;
    var el = pressed;
    pressed = null;
    if (fired) { fired = false; return; }
    if (!el || Nav.cur() !== el) return;
    if (typeof el._nav === 'function') el._nav();
    else el.click();
  }, false);
}
