/* Long-press context menu.
   YouTube TV opens a left-side panel when Enter is held on a video. The actions
   come from YouTube's own /get_panel data via the bridge, so they match the
   account and surface (home, history, playlist) instead of being invented here. */
var Context = {
  _active: false,
  _opening: false,
  _video: null,
  _saved: null,
  _stack: [],
  _items: [],
  _title: '',
  _ignoreEnter: false,

  active: function () { return this._active || this._opening; },

  /* The Enter key is still physically held when a long press opens this panel.
     TV remotes auto-repeat it, so swallowing it until keyup prevents the first
     menu row (Play) from being activated by the same hold. */
  releaseEnter: function () { this._ignoreEnter = false; },

  open: function (item, tile, fromHold) {
    if (this._active || this._opening) return;
    var id = (item && (item.id || item._id)) || (tile && tile._id);
    if (!id) return;
    this._video = item || (tile && tile._item) || { id: id, title: '' };
    this._video.id = this._video.id || id;

    this._saved = {
      rows: Nav.rows, r: Nav.r, c: Nav.c, view: Nav.view,
      railIdx: Nav.railIdx, lastGrid: Nav.lastGrid, gridStart: Nav.gridStart
    };
    this._stack = [];
    this._active = true;
    this._opening = true;
    this._ignoreEnter = !!fromHold;
    this.el = document.getElementById('context');
    this.list = document.getElementById('contextlist');
    this.el.className = 'on';
    if (window.Preview) Preview.hide();

    var self = this;
    API.menu(id).then(function (data) {
      self._opening = false;
      if (!self._active) return;
      if (!data || !data.items || !data.items.length) {
        self.close();
        U.toast('No actions available');
        return;
      }
      self._video = {
        id: data.id || self._video.id,
        title: data.title || self._video.title || '',
        channel: data.subtitle || self._video.channel || '',
        thumb: data.thumbnail || self._video.thumb || U.thumb(self._video.id)
      };
      self.el.querySelector('#ctitle').textContent = self._video.title || '';
      self.el.querySelector('#csub').textContent = self._video.channel || '';
      var img = self.el.querySelector('#cthumb');
      if (self._video.thumb) img.src = self._video.thumb;
      self._setItems('Video options', data.items);
    }).catch(function () {
      self._opening = false;
      self.close();
      U.toast('Could not load menu');
    });
  },

  _setItems: function (title, items) {
    this._title = title || 'Video options';
    this._items = items || [];
    this.el.querySelector('#cchead').textContent = this._title;
    U.clear(this.list);

    var self = this;
    var rows = [];
    for (var i = 0; i < this._items.length; i++) {
      (function (action) {
        var row = U.el('div', 'ctxitem');
        row.innerHTML = '<div class="ctxlabel">' + U.esc(action.label) + '</div>' +
          (action.value ? '<div class="ctxvalue">' + U.esc(action.value) + '</div>' : '');
        row._nav = function () { self._act(action); };
        self.list.appendChild(row);
        rows.push(row);
      })(this._items[i]);
    }
    /* One item per row: the context panel is a vertical list, not a grid. */
    var navRows = [];
    for (var j = 0; j < rows.length; j++) navRows.push({ items: [rows[j]] });
    Nav.set(navRows, 0, 0, document.getElementById('contextpanel'));
  },

  _act: function (action) {
    if (!action || action.kind === 'none') return;
    var self = this;
    var v = this._video || {};

    if (action.kind === 'playlists') {
      this._stack.push({ title: this._title, items: this._items });
      this._setItems('Save to playlist', [{ label: 'Loading…', kind: 'none' }]);
      API.playlists().then(function (r) {
        if (!self._active) return;
        var items = ((r && r.items) || []).map(function (p) {
          return { label: p.title || 'Playlist', kind: 'save', playlistId: p.id };
        });
        if (!items.length) items = [{ label: 'No playlists yet', kind: 'none' }];
        self._setItems('Save to playlist', items);
      }).catch(function () {
        if (!self._active) return;
        self._setItems('Save to playlist', [{ label: 'Could not load playlists', kind: 'none' }]);
      });
      return;
    }

    if (action.kind === 'browse') {
      this.close();
      App.go('channel', false, { id: action.browseId, title: v.channel || '' });
      return;
    }

    if (action.kind === 'play') {
      this.close();
      App.open(v.id, v);
      return;
    }

    if (action.kind === 'save') {
      this.close();
      API.save(v.id, action.playlistId).then(function () {
        U.toast('Saved to ' + action.label);
      }).catch(function () { U.toast('Could not save video'); });
      return;
    }

    if (action.kind === 'endpoint') {
      this.close();
      API.menuAction(action.path, action.payload).then(function () {
        if (/not interested/i.test(action.label)) U.toast('Not interested — we’ll show fewer like this');
        else if (/watch later/i.test(action.label)) U.toast('Saved to Watch later');
        else U.toast(action.label + ' — done');
      }).catch(function () { U.toast('Could not complete action'); });
    }
  },

  close: function () {
    if (!this._active) return;
    this._active = false;
    this._opening = false;
    this.el.className = '';
    var s = this._saved;
    this._saved = null;
    this._stack = [];
    if (!s) return;
    Nav.railIdx = s.railIdx || 0;
    Nav.lastGrid = s.lastGrid || 0;
    Nav.gridStart = s.gridStart || 0;
    Nav.set(s.rows, s.r, s.c, s.view);
  },

  onKey: function (e) {
    if (!this._active) return false;
    var k = e.keyCode;
    if (k === KEY.LEFT || k === KEY.RIGHT || k === KEY.TIZEN_EXIT) {
      this.close();
      return true;
    }
    if (k === KEY.BACK || k === KEY.TIZEN_BACK) {
      if (this._stack.length) {
        var prev = this._stack.pop();
        this._setItems(prev.title, prev.items);
      } else {
        this.close();
      }
      return true;
    }
    if (k === KEY.UP) {
      if (Nav.r > 0) { Nav.r--; Nav.c = 0; Nav.refresh(); }
      return true;
    }
    if (k === KEY.DOWN) {
      if (Nav.r < Nav.rows.length - 1) { Nav.r++; Nav.c = 0; Nav.refresh(); }
      return true;
    }
    if (k === KEY.ENTER) {
      if (this._ignoreEnter) return true;
      Nav.activate();
      return true;
    }
    /* Swallow colour/number keys while the panel owns the remote. */
    return true;
  }
};
