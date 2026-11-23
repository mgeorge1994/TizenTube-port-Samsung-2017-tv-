/* Views: home, search, settings.
   Layout mirrors the real 10-foot client: header row, left navigation rail,
   then shelves laid out two tiles per line on the content grid. */

var VIEW = {};

var ICON = {
  home: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.1 2.8 10.6a1 1 0 0 0 .62 1.79H5v7.5a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-7.5h1.58a1 1 0 0 0 .62-1.79L12 3.1z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="6.4"/><path d="M16 16.2 20.4 20.6" stroke-linecap="round"/></svg>',
  gear: '<svg viewBox="2 0 24 24" fill="currentColor"><path d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8zm8.6 3.4c0-.55-.06-1.09-.16-1.6l2.02-1.5-2.02-3.42-2.36.95a8.7 8.7 0 0 0-1.39-.8L16.3 3h-4.6l-.39 2.63c-.5.22-.97.49-1.4.8l-2.35-.95-2.02 3.42 2.02 1.5c-.1.51-.16 1.05-.16 1.6s.06 1.09.16 1.6l-2.02 1.5 2.02 3.42 2.36-.95c.42.31.89.58 1.39.8L11.7 21h4.6l.39-2.63c.5-.22.97-.49 1.39-.8l2.36.95 2.02-3.42-2.02-1.5c.1-.51.16-1.05.16-1.6z"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 15.2a3.1 3.1 0 0 0 3.1-3.1V5.6a3.1 3.1 0 0 0-6.2 0v6.5a3.1 3.1 0 0 0 3.1 3.1zm5.4-3.1a5.4 5.4 0 0 1-10.8 0H4.4a7.6 7.6 0 0 0 6.4 7.5V22h2.4v-2.4a7.6 7.6 0 0 0 6.4-7.5h-2.2z"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.4v13.2L19 12z"/></svg>',
  account: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12.2a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2zm0 2c-4.2 0-7.6 2.3-7.6 5.2v.9h15.2v-.9c0-2.9-3.4-5.2-7.6-5.2z"/></svg>',
  library: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14a2 2 0 0 0 2 2h14v-2H4V6zm16-4H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/></svg>',
  news: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 4H3a1 1 0 0 0-1 1v14a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2V5a1 1 0 0 0-1-1zM8 17H5v-3h3v3zm0-5H5V9h3v3zm0-5H5V5h3v2zm9 10h-7v-2h7v2zm0-4h-7v-2h7v2zm0-4h-7V7h7v2z"/></svg>',
  music: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.5a3.6 3.6 0 1 0 2 3.2V7.3h5V3h-7z"/></svg>',
  playlist: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h13v2H3V6zm0 5h13v2H3v-2zm0 5h8v2H3v-2zm11-1.2v6.4L19 15l-5-3.2z"/></svg>'
};

/* ---------- chrome: left rail, header search, account ---------- */
VIEW.chrome = function (active) {
  var railEl = document.getElementById('rail');
  var searchMode = active === 'search' || active === 'musicSearch';
  U.clear(railEl);

  var accountState = U.store.get('account', null);
  var signedIn = !!(accountState && (accountState.avatar || accountState.name));

  var defs = [
    { k: 'account', circle: true, label: 'Account', go: function () { App.go('account'); } },
    { k: 'search', ico: ICON.search, label: 'Search', go: function () { App.go('search'); } },
    { k: 'home', ico: ICON.home, label: 'Home', go: function () { App.go('home'); } },
    { k: 'library', ico: ICON.library, label: 'Library', go: function () { App.go('library'); } }
  ];
  if (signedIn) {
    defs.push({ k: 'playlists', ico: ICON.playlist, label: 'Playlists', go: function () { App.go('playlists'); } });
  }
  defs.push(
    { k: 'music', ico: ICON.music, label: 'Music', go: function () { App.go('music'); } },
    { k: 'podcasts', ico: ICON.mic, label: 'Podcasts', go: function () { App.go('podcasts'); } },
    { k: 'news', ico: ICON.news, label: 'News', go: function () { App.go('news'); } },
    { k: 'settings', ico: ICON.gear, label: 'Settings', go: function () { App.go('settings'); } }
  );

  /* Account stays pinned at the top; the rest of the rail is one vertically
     centred block so it still feels balanced on a 10-foot screen. */
  var railMain = document.createElement('div');
  railMain.className = 'railmain';

  var items = [];
  defs.forEach(function (d) {
    var el = document.createElement('div');
    var acc = d.circle ? accountState : null;
    var isActive = d.k === active || (active === 'musicSearch' && d.k === 'music');
    el.className = 'railitem' + (isActive ? ' active' : '') +
      (d.circle ? ' railaccount' : '') +
      (d.circle ? (signedIn ? ' signedin' : ' signedout') : '');
    if (d.circle) {
      var inside;
      if (acc && acc.avatar) inside = '<img src="' + U.esc(acc.avatar) + '" alt="">';
      else if (acc && acc.name) inside = U.esc(String(acc.name).charAt(0).toUpperCase());
      else inside = ICON.account;
      el.innerHTML = '<div class="box">' + inside + '</div>';
    } else {
      el.innerHTML = '<div class="box">' + d.ico + '</div><div class="lbl">' + d.label + '</div>';
    }
    el._nav = d.go;
    if (d.circle) railEl.appendChild(el);
    else railMain.appendChild(el);
    items.push(el);
  });
  railEl.appendChild(railMain);

  var pill = document.getElementById('searchpill');
  pill.style.display = (searchMode || active === 'account') ? 'none' : 'flex';
  /* Music uses the header search field as its own YouTube Music search; the
     old in-content search card is gone. The placeholder follows the section. */
  var pillText = pill.querySelector('span');
  if (pillText) pillText.textContent = active === 'music' ? 'Search YouTube Music' : 'Search';
  pill._nav = function () {
    App.go(active === 'music' || active === 'musicBrowse' ? 'musicSearch' : 'search');
  };

  /* The live search field only belongs in the header while Search is open. */
  var topbar = document.querySelector('.topbar');
  var liveBox = topbar ? topbar.querySelector('.searchbox') : null;
  if (!searchMode && liveBox && liveBox.parentNode) liveBox.parentNode.removeChild(liveBox);
  if (topbar) {
    if (searchMode) topbar.classList.add('search-mode');
    else topbar.classList.remove('search-mode');
  }

  return { rail: items, top: [pill] };
};

/* Update just the rail circle after the bridge resolves a real profile. The
   Nav rows keep pointing at the same elements, so focus is not disturbed. */
VIEW.syncAccount = function () {
  var a = U.store.get('account', null);
  var signed = !!(a && (a.avatar || a.name));
  var el = document.querySelector('#rail .railaccount');
  if (!el) return;
  var box = el.querySelector('.box');
  if (!box) return;
  var inside;
  if (a && a.avatar) inside = '<img src="' + U.esc(a.avatar) + '" alt="">';
  else if (a && a.name) inside = U.esc(String(a.name).charAt(0).toUpperCase());
  else inside = ICON.account;
  box.innerHTML = inside;
  if (signed) { el.classList.remove('signedout'); el.classList.add('signedin'); }
  else { el.classList.remove('signedin'); el.classList.add('signedout'); }
};

/* Async shelves must never repaint a screen the user already left. */
function liveView(screen, view, host) {
  return !!window.App && App.screen === screen && !!view.parentNode &&
    (!host || view.contains(host));
}

/* navigation rows, in screen order: header -> rail -> content */
VIEW.rows = function (chrome, content, withTop) {
  var rows = [];
  if (withTop !== false) {
    rows.push({ kind: 'top', items: chrome.top, block: document.querySelector('.topbar') });
  }
  rows.push({ vertical: true, items: chrome.rail, block: document.getElementById('rail') });
  if (VIEW.applyBranding) VIEW.applyBranding();
  return rows.concat(content || []);
};

/* ---------- tile ---------- */
VIEW.tile = function (item, opts) {
  opts = opts || {};
  var t = document.createElement('div');
  t.className = 'tile' + (item.progress > 0.02 ? ' watched' : '');
  t._id = item.id;
  t._item = item;

  var th = document.createElement('div');
  th.className = 'thumb';
  var img = new Image();
  img.src = item.thumb || U.thumb(item.id);
  img.onerror = function () { img.src = 'img/placeholder.svg'; };
  th.appendChild(img);
  t._img = img;
  t._origThumb = img.src;
  t._origTitle = item.title;

  if (item.duration) {
    var d = document.createElement('div');
    d.className = 'dur';
    d.textContent = U.dur(item.duration);
    th.appendChild(d);
  }
  if (item.progress > 0.02) {
    var p = document.createElement('div');
    p.className = 'progress';
    var i = document.createElement('i');
    i.style.width = Math.round(item.progress * 100) + '%';
    p.appendChild(i);
    th.appendChild(p);
  }
  t.appendChild(th);

  var txt = document.createElement('div');
  txt.className = 'txt';
  var nm = document.createElement('div');
  nm.className = 'name';
  nm.textContent = item.title;
  txt.appendChild(nm);
  t._name = nm;

  var bits = [];
  if (item.channel) bits.push(item.channel);
  if (item.progress > 0.02) bits.push('Watched ' + Math.round(item.progress * 100) + '%');
  else {
    if (item.views) bits.push(U.views(item.views));
    if (item.published) bits.push(U.ago(item.published));
  }
  var sub = bits.join(' · ');
  if (sub) {
    var s = document.createElement('div');
    s.className = 'sub';
    s.textContent = sub;
    txt.appendChild(s);
  }
  t.appendChild(txt);

  t._nav = item.go ? item.go : function () { App.open(item.id, item); };
  /* Remote OK is resolved on keyup by bindKeys(); a pointer click still needs
     to open the same video in the browser / simulator. */
  t.onclick = function (e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (typeof t._nav === 'function') t._nav();
  };
  return t;
};

/* ---------- shelf: heading + 5-up grid, one nav row per visual line ---------- */
VIEW.shelf = function (row) {
  var shelf = document.createElement('div');
  shelf.className = 'shelf hrow';

  var head = document.createElement('div');
  head.className = 'head';
  var title = document.createElement('div');
  title.className = 'title';
  title.textContent = row.title;
  head.appendChild(title);
  shelf.appendChild(head);

  /* Every video shelf is one remote-scrollable row: 2.5 cards are visible at
     load, and Right keeps scrolling until the last card is fully on screen. */
  var scroll = document.createElement('div');
  scroll.className = 'hscroll';
  var track = document.createElement('div');
  track.className = 'htrack';
  scroll.appendChild(track);
  shelf.appendChild(scroll);

  var items = [];
  row.items.forEach(function (it) {
    var t = VIEW.tile(it);
    track.appendChild(t);
    items.push(t);
  });

  return { el: shelf, rows: [{ items: items, block: scroll, horizontal: true }] };
};

/* Continue watching uses the same row geometry as every other shelf. */
VIEW.hrow = VIEW.shelf;

/* Fixed grid used by History: three cards per line, vertical navigation only. */
VIEW.grid = function (row, perRow) {
  perRow = perRow || 3;
  var shelf = document.createElement('div');
  shelf.className = 'shelf grid';

  var head = document.createElement('div');
  head.className = 'head';
  var title = document.createElement('div');
  title.className = 'title';
  title.textContent = row.title;
  head.appendChild(title);
  shelf.appendChild(head);

  var rows = [];
  var line = null;
  row.items.forEach(function (it, i) {
    if (i % perRow === 0) {
      line = document.createElement('div');
      line.className = 'grow';
      shelf.appendChild(line);
      rows.push({ items: [], block: line, verticalOnly: true });
    }
    var t = VIEW.tile(it);
    line.appendChild(t);
    rows[rows.length - 1].items.push(t);
  });

  return { el: shelf, rows: rows };
};

/* Loading shelves use the exact same heading and card geometry as real
   shelves, so a page title never jumps when the video cards arrive. */
VIEW.skeleton = function (row) {
  var shelf = document.createElement('div');
  shelf.className = 'shelf loading';

  var head = document.createElement('div');
  head.className = 'head';
  var title = document.createElement('div');
  title.className = 'title';
  /* The heading gets the same shimmer as the cards, so Recommended, Continue
     watching and Playlists all load as one piece instead of snapping in. */
  var skTitle = document.createElement('div');
  skTitle.className = 'sktitle';
  var guess = Math.max(28, Math.min(78, String(row.title || '').length * 1.35));
  skTitle.style.width = guess + '%';
  title.appendChild(skTitle);
  head.appendChild(title);
  shelf.appendChild(head);

  var count = row.count || 5;
  function skcard() {
    var card = document.createElement('div');
    card.className = 'tile skcard';
    card.innerHTML = '<div class="thumb skthumb"></div>' +
      '<div class="txt"><div class="skline"></div>' +
      '<div class="skline short"></div></div>';
    return card;
  }

  /* History's loader is the same three-column grid as the real cards. */
  if (row.grid) {
    shelf.className = 'shelf loading grid';
    var grow = null;
    for (var g = 0; g < count; g++) {
      if (g % 3 === 0) {
        grow = document.createElement('div');
        grow.className = 'grow';
        shelf.appendChild(grow);
      }
      grow.appendChild(skcard());
    }
    return { el: shelf, rows: [] };
  }

  /* Loader cards use the exact same horizontal track and 2.5-card geometry as
     real shelves, so nothing jumps when the videos arrive. */
  shelf.className = 'shelf loading hrow';
  var scroll = document.createElement('div');
  scroll.className = 'hscroll';
  var track = document.createElement('div');
  track.className = 'htrack';
  scroll.appendChild(track);
  shelf.appendChild(scroll);
  for (var k = 0; k < count; k++) track.appendChild(skcard());
  return { el: shelf, rows: [] };
};

/* ---------- home ---------- */
VIEW.home = function () {
  var view = document.getElementById('view');
  U.clear(view);

  var host = document.createElement('div');
  view.appendChild(host);

  var chrome = VIEW.chrome('home');
  Nav.set(VIEW.rows(chrome, []), null, 0, view);

  host.appendChild(VIEW.skeleton({ title: 'Continue watching', count: 5, horizontal: true }).el);
  host.appendChild(VIEW.skeleton({ title: 'Recommended for you', count: 6 }).el);

  Payload.home().then(function (data) {
    if (!liveView('home', view, host)) return;
    U.clear(host);
    var content = [];
    data.rows.forEach(function (row) {
      if (!row.items || !row.items.length) return;
      var s = row.horizontal ? VIEW.hrow(row) : VIEW.shelf(row);
      host.appendChild(s.el);
      content = content.concat(s.rows);
    });
    if (content.length) Nav.set(VIEW.rows(chrome, content), null, 0, view);
    else VIEW.empty(host);
  }).catch(function (err) {
    if (!liveView('home', view, host)) return;
    VIEW.error(host, err);
  });
};

VIEW.empty = function (host) {
  var s = document.createElement('div');
  s.className = 'state';
  s.innerHTML = '<h2>Nothing to show yet</h2><p>The service returned no shelves.</p>';
  host.appendChild(s);
};

VIEW.error = function (host, err) {
  var s = document.createElement('div');
  s.className = 'state';
  s.innerHTML = '<h2>Can\'t reach the YouTube service</h2>' +
    '<p>' + U.esc(String((err && err.message) || err)) + '<br>' +
    'Start it on the Mac with <b>npm start</b> in the bridge folder, then reopen the app.</p>';
  host.appendChild(s);
};

/* ---------- search: live suggestions + history, then results ---------- */
VIEW.search = function (initial, mode) {
  var view = document.getElementById('view');
  var music = mode === 'music';
  var screenName = music ? 'musicSearch' : 'search';
  var searchApi = music ? function (q) { return API.musicSearch(q); }
    : function (q) { return API.search(q); };
  var suggestApi = music ? function (q) { return API.musicSuggest(q); }
    : function (q) { return API.suggest(q); };
  U.clear(view);
  view.className = 'search';

  var wrap = U.el('div', 'searchwrap');
  var box = U.el('div', 'searchbox');
  box.innerHTML = ICON.search;
  var input = document.createElement('input');
  input.type = 'text';
  input.placeholder = music ? 'Search YouTube Music' : 'Search';
  input.value = initial || '';
  /* Never focus a real text field: on Samsung TVs that opens the system
     keyboard. All typing happens through the on-screen keyboard below. */
  input.readOnly = true;
  input.setAttribute('readonly', 'readonly');
  input.setAttribute('inputmode', 'none');
  input.setAttribute('autocapitalize', 'off');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('autocorrect', 'off');
  input.spellcheck = false;
  box.appendChild(input);
  var mic = U.el('div', 'mic', ICON.mic);
  box.appendChild(mic);
  box._nav = function () { /* focus stays on the app's own search field */ };
  /* the live field is the first thing in the header, starting at the same
     left edge as the browse content, with the wordmark to its right */
  var topbar = document.querySelector('.topbar');
  topbar.insertBefore(box, topbar.firstChild);

  var suggestHost = U.el('div', 'suggestlist');
  var kbd = U.el('div', 'kbd');
  var resultsHost = U.el('div', 'results');
  wrap.appendChild(suggestHost);
  wrap.appendChild(resultsHost);
  wrap.appendChild(kbd);
  view.appendChild(wrap);

  var state = {
    q: input.value, caret: (initial || '').length,
    keyRows: [], suggestRows: [], resultRows: [],
    rows: [], chrome: null, timer: null, sugTimer: null, sugApiTimer: null,
    seq: 0, searchSeq: 0
  };
  var boxRow = { items: [box], block: box };

  function remembered() { return U.store.get('searches', []); }
  function remember(q) {
    q = String(q || '').trim();
    if (!q) return;
    var all = remembered().filter(function (x) { return x !== q; });
    all.unshift(q);
    U.store.set('searches', all.slice(0, 20));
  }

  function rebuild(row, force) {
    if (!liveView(screenName, view)) return;
    var active = Nav.cur ? Nav.cur() : null;
    var activeText = active ? String(active.textContent || '').trim() : '';
    var wasKey = !!(active && active.classList && active.classList.contains('key'));
    var wasSuggestion = active && active.classList && active.classList.contains('suggestitem');
    state.rows = VIEW.rows(state.chrome,
      [boxRow].concat(state.suggestRows).concat(state.resultRows).concat(state.keyRows), false);

    /* Live rebuilds happen on every keystroke, so keep focus on the *element*
       the user was on instead of its old row number — otherwise a growing
       suggestion list silently moves focus onto a video tile. An explicit
       SEARCH / suggestion selection passes force=true and deliberately moves
       focus to the results. */
    var r = -1, c = 0;
    if (!force && row == null) {
      for (var i = 0; i < state.rows.length && r < 0; i++) {
        var items = state.rows[i].items;
        for (var j = 0; j < items.length; j++) {
          if (items[j] === active) { r = i; c = j; break; }
        }
      }
    }
    /* The suggestion list is repainted when remote completions arrive, so the
       original element is gone. Match by text to keep the same suggestion. */
    /* A typed key must keep focus on the keyboard. Matching it by text would
       jump onto the suggestion with the same letter and stop the user typing. */
    if (r < 0 && activeText && !wasKey) {
      for (var a = 0; a < state.rows.length && r < 0; a++) {
        var ai = state.rows[a].items;
        for (var b = 0; b < ai.length; b++) {
          if (String(ai[b].textContent || '').trim() === activeText) { r = a; c = b; break; }
        }
      }
    }
    if (r < 0 && wasKey && activeText) {
      for (var ka = 0; ka < state.rows.length && r < 0; ka++) {
        var ki = state.rows[ka].items;
        for (var kb = 0; kb < ki.length; kb++) {
          if (ki[kb].classList && ki[kb].classList.contains('key') &&
              String(ki[kb].textContent || '').trim() === activeText) { r = ka; c = kb; break; }
        }
      }
    }
    if (r < 0) {
      if (!force && wasSuggestion && state.suggestRows.length) r = state.rows.indexOf(state.suggestRows[0]);
      else r = row == null ? Nav.r : row;
      c = 0;
    }
    if (r < 1) r = 1;
    if (r >= state.rows.length) r = state.rows.length - 1;
    var items2 = state.rows[r].items;
    c = Math.max(0, Math.min(c, items2.length - 1));

    Nav.rows = state.rows;
    Nav.r = r; Nav.c = c; Nav.view = view;
    Nav.refresh();
  }

  /* suggestions: recent searches first, then the live YouTube completions */
  function suggestions() {
    var seq = ++state.seq;
    var q = state.q.trim();
    var low = q.toLowerCase();
    var recent = remembered();
    var list = [];

    function has(text) {
      var t = String(text).toLowerCase();
      for (var i = 0; i < list.length; i++) {
        if (String(list[i]).toLowerCase() === t) return true;
      }
      return false;
    }

    if (!low) {
      /* YouTube calls these "Recent searches"; show them instead of live
         completions while the field is empty. */
      list = recent.slice(0, 5);
    } else {
      recent.forEach(function (x) {
        if (x.toLowerCase().indexOf(low) >= 0 && !has(x)) list.push(x);
      });
      /* Paint the typed phrase immediately: keyboard -> suggestions must work
         even before the bridge returns completions. */
      if (!has(q)) list.unshift(q);
    }
    U.clear(suggestHost);
    state.suggestRows = [];

    function paint() {
      if (seq !== state.seq) return;
      U.clear(suggestHost);
      state.suggestRows = [];
      if (list.length) {
        var lbl = U.el('div', 'sectlbl', low ? 'Suggestions' : 'Recent searches');
        suggestHost.appendChild(lbl);
        list.slice(0, 5).forEach(function (text) {
          var el = U.el('div', 'suggestitem');
          el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">' +
            '<circle cx="11" cy="11" r="6.4"/><path d="M16 16.2 20.4 20.6" stroke-linecap="round"/></svg>' +
            '<span>' + U.esc(text) + '</span>';
          el._nav = function () {
            input.value = text;
            state.q = text;
            state.caret = text.length;
            run(text, true, true);
          };
          suggestHost.appendChild(el);
          state.suggestRows.push({ items: [el], block: suggestHost });
        });
      }
      rebuild();
    }

    /* Local suggestions are instant; remote completions are fetched right
       away too (stale replies are dropped) so DOWN has multiple rows to walk
       before the user can physically press a remote button. */
    paint();
    if (!low) return;
    function lastSearches() {
      recent.slice(0, 5).forEach(function (x) { if (!has(x)) list.push(x); });
    }
    suggestApi(q).then(function (r) {
      if (seq !== state.seq) return;
      var added = 0;
      (r.items || []).forEach(function (x) {
        var t = typeof x === 'string' ? x : (x.text || x.title || x.query || '');
        if (t && !has(t) && added < 4) { list.push(t); added++; }
      });
      /* No completions for this fragment: last searches keep the list useful. */
      if (!added) lastSearches();
      paint();
    }).catch(function () {
      if (seq !== state.seq) return;
      lastSearches();
      paint();
    });
  }

  /* results. A short query is often a prefix, so fall back to the first
     completion when YouTube returns nothing useful for the typed fragment. */
  function run(q, focusResults, save) {
    clearTimeout(state.timer);
    q = String(q || '').trim();
    var target = 2 + state.suggestRows.length;
    if (!q) {
      U.clear(resultsHost);
      state.resultRows = [];
      rebuild(target, !!focusResults);
      return;
    }
    /* Live queries must not pollute recent searches with every prefix; only
       an explicit SEARCH, Enter or suggestion pick is saved. */
    if (save) remember(q);
    var seq = ++state.searchSeq;
    searchApi(q).then(function (r) {
      if ((!r.items || !r.items.length) && q.length < 5) {
        return suggestApi(q).then(function (s) {
          var t = (s.items || [])[0];
          return searchApi(typeof t === 'string' ? t : (t && (t.text || t.title || t.query)) || q);
        });
      }
      return r;
    }).then(function (r) {
      /* a slower response for an older query must never replace the newest
         results — that made typing look like it did nothing */
      if (seq !== state.searchSeq) return;
      U.clear(resultsHost);
      state.resultRows = [];
      if (r.items && r.items.length) {
        var sh = VIEW.shelf({ title: 'Results for “' + q + '”', items: r.items });
        resultsHost.appendChild(sh.el);
        state.resultRows = sh.rows;
      } else {
        /* A query with no matches should still offer the last searches. */
        var recent = remembered();
        if (recent.length) {
          var recItems = recent.slice(0, 5).map(function (text) {
            return {
              id: '', title: text,
              go: function () { setText(text); run(text, true, true); }
            };
          });
          var recShelf = VIEW.shelf({ title: 'Recent searches', items: recItems });
          resultsHost.appendChild(recShelf.el);
          state.resultRows = recShelf.rows;
        } else {
          resultsHost.appendChild(U.el('div', 'state', '<h2>No results</h2><p>Try a different search.</p>'));
        }
      }
      rebuild(focusResults ? 2 + state.suggestRows.length : null, !!focusResults);
    }).catch(function (err) {
      if (seq !== state.searchSeq) return;
      U.clear(resultsHost);
      resultsHost.appendChild(U.el('div', 'state', '<h2>Search failed</h2><p>' + U.esc(String(err && err.message || err)) + '</p>'));
    });
  }

  function changed() {
    clearTimeout(state.sugTimer);
    clearTimeout(state.timer);
    /* Suggestions must exist immediately so LEFT/UP from the keyboard has a
       target. Remote completions are debounced inside suggestions(). */
    suggestions();
    /* Query on every keystroke, including on-screen keyboard keys. The stale
       response guard in run() keeps only the newest query's results. */
    run(state.q, false, false);
  }

  function setText(v) {
    input.value = v;
    state.q = v;
    state.caret = v.length;
    changed();
  }

  /* The stock TV keyboard: seven letters per row, then a function column.
     Geometry and ordering taken from the live ytlr-keyboard DOM. */
  var maps = {
    letters: [
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'backspace'],
      ['h', 'i', 'j', 'k', 'l', 'm', 'n', 'numbers'],
      ['o', 'p', 'q', 'r', 's', 't', 'u', 'language'],
      ['v', 'w', 'x', 'y', 'z', '-', "'"]
    ],
    numbers: [
      ['1', '2', '3', '4', '5', '6', '7', 'backspace'],
      ['8', '9', '0', '-', '=', '+', '*', 'letters'],
      [',', '.', '?', '!', ':', ';', '/', 'language'],
      ['@', '#', '$', '%', '^', '_', '&']
    ]
  };
  state.keymap = 'letters';

  function caret() {
    var at = Math.max(0, Math.min(state.caret, input.value.length));
    return [at, at];
  }
  function insert(text) {
    var p = caret();
    input.value = input.value.slice(0, p[0]) + text + input.value.slice(p[1]);
    state.caret = p[0] + text.length;
    state.q = input.value;
    changed();
  }
  function erase() {
    var p = caret();
    if (p[0] > 0) input.value = input.value.slice(0, p[0] - 1) + input.value.slice(p[1]);
    state.caret = Math.max(0, p[0] - 1);
    state.q = input.value;
    changed();
  }

  var ICON_BACK = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.1 4.5 2 11.1a1.2 1.2 0 0 0 0 1.7l6.1 6.7c.3.3.7.5 1.1.5h9.3c.9 0 1.5-.7 1.5-1.5v-13c0-.8-.6-1.5-1.5-1.5H9.2c-.4 0-.8.2-1.1.5zm3.6 3.6L14.3 11h5.2v2h-5.2l-2.6 2.9-1.5-1.3L15 12l-5.8-2.6z"/></svg>';
  var ICON_LANG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.5 3.9 5.5 3.9 9s-1.3 6.5-3.9 9c-2.6-2.5-3.9-5.5-3.9-9S9.4 5.5 12 3z"/></svg>';

  function keyEl(label) {
    var k = U.el('div', 'key');
    if (label === 'backspace') { k.className = 'key fn'; k.innerHTML = ICON_BACK; }
    else if (label === 'language') { k.className = 'key fn'; k.innerHTML = ICON_LANG; }
    else if (label === 'numbers' || label === 'letters') {
      k.className = 'key fn mode';
      k.textContent = label === 'numbers' ? '&123' : 'ABC';
    } else k.textContent = label;

    k._nav = function () {
      if (label === 'backspace') erase();
      else if (label === 'language') U.toast('Language: English');
      else if (label === 'numbers' || label === 'letters') {
        state.keymap = label;
        buildKeyboard();
      } else insert(label);
    };
    return k;
  }

  function buildKeyboard() {
    U.clear(kbd);
    state.keyRows = [];
    maps[state.keymap].forEach(function (line) {
      var r = U.el('div', 'krow');
      var items = [];
      line.forEach(function (label) {
        var k = keyEl(label);
        r.appendChild(k); items.push(k);
      });
      kbd.appendChild(r);
      state.keyRows.push({ items: items, block: r });
    });

    var last = U.el('div', 'krow bottom');
    var specials = [
      ['SPACE', function () { insert(' '); }, 'wide'],
      ['CLEAR', function () { clearTimeout(state.timer); U.clear(resultsHost); state.resultRows = []; setText(''); }, 'wide'],
      ['SEARCH', function () { clearTimeout(state.timer); run(input.value, true, true); }, 'wide search']
    ];
    var items = [];
    specials.forEach(function (s) {
      var k = U.el('div', 'key ' + s[2], s[0]);
      k._nav = s[1];
      last.appendChild(k); items.push(k);
    });
    kbd.appendChild(last);
    state.keyRows.push({ items: items, block: last });
    if (state.chrome && Nav.rows.length) rebuild();
  }

  state.chrome = VIEW.chrome(screenName);
  buildKeyboard();
  state.rows = VIEW.rows(state.chrome, [boxRow].concat(state.keyRows), false);
  Nav.set(state.rows, 1, 0, view);

  input.addEventListener('keydown', function (e) {
    if (e.keyCode === 13 && Nav.r <= 1) {
      clearTimeout(state.timer); run(input.value, true, true);
      e.stopPropagation(); e.preventDefault();
    }
  });
  input.addEventListener('input', function () { state.q = input.value; changed(); });

  suggestions();
  if (state.q) run(state.q, false, false);
};

/* ---------- settings ----------
   The stock 10-foot settings tree, plus an Extras tree that exposes the same
   feature switches ReVanced offers on Android. Everything is persisted in
   localStorage so the TV keeps the choices across restarts. */
VIEW._setStack = [];
VIEW._setSection = 'root';
VIEW._brandDone = null;
VIEW._brandTimer = null;

VIEW.settings = function () {
  VIEW._setStack = [];
  VIEW.renderSettings('root');
};

VIEW.settingsOpen = function (id) {
  VIEW._setStack.push(VIEW._setSection);
  VIEW.renderSettings(id);
};

VIEW.settingsBack = function () {
  if (VIEW._setSection === 'root' || !VIEW._setStack.length) return false;
  VIEW.renderSettings(VIEW._setStack.pop());
  return true;
};

/* DeArrow: replace a tile's thumbnail/title with the community submission
   when the matching Extras toggles are on. Requests are deduped per video. */
VIEW.applyBranding = function () {
  clearTimeout(VIEW._brandTimer);
  VIEW._brandTimer = setTimeout(function () { VIEW._applyBrandingNow(); }, 250);
};

VIEW.restoreBranding = function () {
  var tiles = document.querySelectorAll('.tile');
  for (var i = 0; i < tiles.length; i++) {
    var t = tiles[i];
    if (!t._item) continue;
    if (t._img && t._origThumb) t._img.src = t._origThumb;
    if (t._name) t._name.textContent = t._origTitle || t._item.title;
    if (t._item) t._item.title = t._origTitle || t._item.title;
    t._brandRequested = false;
  }
};

VIEW._applyBrandingNow = function () {
  var withThumb = U.store.get('dearrow', false);
  var withTitle = U.store.get('dearrowTitle', false);
  if (!withThumb && !withTitle) return;
  var tiles = document.querySelectorAll('.tile');
  for (var i = 0; i < tiles.length && i < 60; i++) {
    var t = tiles[i];
    if (!t._id || t._brandRequested) continue;
    t._brandRequested = true;
    (function (tile) {
      API.branding(tile._id).then(function (b) {
        if (!b) return;
        if (withThumb && b.thumbnail && tile._img) tile._img.src = b.thumbnail;
        if (withTitle && b.title && tile._name) {
          tile._name.textContent = b.title;
          if (tile._item) tile._item.title = b.title;
        }
      }).catch(function () {});
    })(t);
  }
};

VIEW.renderSettings = function (section) {
  var view = document.getElementById('view');
  U.clear(view);
  VIEW._setSection = section;

  var names = {
    root: 'Settings', general: 'General', player: 'Player', captions: 'Captions',
    account: 'Account', history: 'History & data', devices: 'Devices & casting',
    help: 'Help & about', extras: 'Extras',
    extras_blocking: 'Blocking & privacy', extras_metadata: 'Metadata',
    extras_playback: 'Playback', extras_layout: 'Layout',
    extras_downloads: 'Downloads & player', extras_links: 'Links & misc',
    extras_categories: 'SponsorBlock categories'
  };
  var panel = document.createElement('div');
  panel.className = 'panel';
  panel.innerHTML = '<h1>' + U.esc(names[section] || 'Settings') + '</h1>' +
    (section === 'root' ? '' : '<p class="backhint">Back returns to the previous menu.</p>');
  view.appendChild(panel);

  function row(label, sub, value, onAct) {
    var r = document.createElement('div');
    r.className = 'setrow';
    var l = document.createElement('div');
    l.className = 'lbl';
    l.innerHTML = '<b>' + U.esc(label) + '</b><span>' + U.esc(sub) + '</span>';
    r.appendChild(l);
    var v = document.createElement('div');
    v.className = 'val';
    v.textContent = value;
    r.appendChild(v);
    r._nav = onAct || function () { U.toast(value); };
    panel.appendChild(r);
    return { el: r, val: v };
  }
  function toggle(label, sub, key, def, after) {
    var v = U.store.get(key, def);
    var r = row(label, sub, v ? 'On' : 'Off', function () {
      v = !v;
      U.store.set(key, v);
      r.val.textContent = v ? 'On' : 'Off';
      if (window.Player && Player.applySetting) Player.applySetting(key, v);
      if (after) after(v);
    });
    return r;
  }
  function choice(label, sub, key, opts, def, after) {
    var v = U.store.get(key, def);
    function text(x) { return typeof x === 'boolean' ? (x ? 'On' : 'Off') : String(x); }
    var r = row(label, sub, text(v), function () {
      var i = opts.indexOf(v);
      v = opts[(i + 1) % opts.length];
      U.store.set(key, v);
      r.val.textContent = text(v);
      if (window.Player && Player.applySetting) Player.applySetting(key, v);
      if (after) after(v);
    });
    return r;
  }
  function sub(label, desc, target) {
    var r = row(label, desc, '›', function () { VIEW.settingsOpen(target); });
    r.el.classList.add('subrow');
    return r;
  }

  if (section === 'root') {
    sub('General', 'Autoplay, sound, language and restricted mode', 'general');
    sub('Player', 'Quality, speed, autoplay and ambient mode', 'player');
    sub('Captions', 'Subtitles, language, size and style', 'captions');
    sub('Account', 'Profiles, sign in and account lock', 'account');
    sub('History & data', 'Watch and search activity on this TV', 'history');
    sub('Devices & casting', 'Companion devices and bridge service', 'devices');
    sub('Help & about', 'Version and information', 'help');
    sub('Extras', 'Ad blocking, SponsorBlock, DeArrow and more', 'extras');
  } else if (section === 'general') {
    toggle('Autoplay next video', 'Start the suggested video when one ends', 'autoplay', false);
    toggle('Ambient previews', 'Play a silent preview while a tile has focus', 'previews', false);
    choice('Sound', 'Volume normalization between videos', 'sound', ['Auto', 'Offline', 'Disabled'], 'Auto');
    toggle('High contrast', 'Brighter text and control borders', 'highcontrast', false, function (v) {
      document.body.classList.toggle('highcontrast', v);
    });
    toggle('Restricted Mode', 'Filter potentially mature results on this TV', 'restricted', false);
    choice('Language', 'Interface language', 'language', ['English', 'Español', 'Deutsch', 'Français'], 'English');
    row('Premium', 'Membership status for this account', U.store.get('premium', false) ? 'Member' : 'Not a member', function () {
      App.go('account');
    });
  } else if (section === 'player') {
    choice('Video quality', 'Higher costs bandwidth over your LAN', 'quality', [360, 480, 720, 1080], 720, function (q) {
      U.toast('Quality ' + q + 'p');
    });
    choice('Playback speed', 'Default speed for every video', 'speed', [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2], 1, function (s) {
      U.toast('Speed ' + s + 'x');
    });
    toggle('Autoplay', 'Play the next video automatically', 'autoplay', false);
    toggle('Loop video', 'Replay the current video when it ends', 'loop', false);
    toggle('Captions', 'Show subtitles by default', 'captions', false);
    toggle('Ambient mode', 'Subtle colour around the video on compatible screens', 'ambient', false);
    toggle('Minimize player on Back', 'Back shrinks the player instead of closing it', 'minimizePlayer', true);
    toggle('Show timestamp', 'Elapsed and remaining time under the seek bar', 'timestamp', true);
    toggle('Show next video', 'Up-next card above the control row', 'showNext', true);
  } else if (section === 'captions') {
    toggle('Subtitles / CC', 'Turn captions on for playback', 'captions', false);
    choice('Caption language', 'Preferred subtitle language', 'capLang', ['English', 'Español', 'Deutsch', 'Français'], 'English');
    choice('Caption size', 'Text size for subtitles', 'capSize', ['Small', 'Medium', 'Large'], 'Medium');
    toggle('Caption background', 'Dark box behind caption text', 'capBg', true);
    choice('Caption text', 'Caption text colour', 'capColor', ['White', 'Yellow', 'Cyan'], 'White');
    toggle('Disable auto captions', 'Do not turn captions on automatically', 'disableAutoCaptions', false);
  } else if (section === 'account') {
    var signed = row('Signed in', 'Account used by this TV', 'Checking…', function () { App.go('account'); });
    API.authStatus().then(function (r) {
      signed.val.textContent = (r && r.status === 'signed_in') ? (r.name || r.email || 'Signed in') : 'Not signed in';
    }).catch(function () { signed.val.textContent = 'Not signed in'; });
    row('Switch account', 'Choose another household profile', '›', function () { App.go('account'); });
    row('Watch as guest', 'Browse without an account', '›', function () { App.go('account'); });
    row('Family profiles', 'Show family profiles on the Who’s watching screen', 'On', function () { U.toast('Family profiles are on'); });
    toggle('Account lock', 'Require a code before using this profile', 'accountLock', false);
    row('Parent code', 'Restrict signed-out and adult profiles', 'Set', function () { U.toast('Parent code is managed on the TV'); });
    row('Premium membership', 'Membership and purchases', U.store.get('premium', false) ? 'Active' : 'None', function () {
      U.toast('Premium benefits are unavailable on this build');
    });
  } else if (section === 'history') {
    row('Clear watch history', 'Resets continue-watching on this TV', 'Clear', function () {
      U.store.set('history', []);
      U.toast('Watch history cleared');
    });
    row('Clear search history', 'Deletes recent searches made on this TV', 'Clear', function () {
      U.store.set('searches', []);
      U.toast('Search history cleared');
    });
    var pauseRow = row('Pause watch history', 'Real YouTube setting for this account', '…', function () {
      var want = pauseRow.val.textContent !== 'On';
      pauseRow.val.textContent = want ? 'On' : 'Off';
      U.toast(want ? 'Watch history paused' : 'Watch history turned on');
      API.historyPause(want).then(function (r) {
        if (r && r.ok === false) {
          pauseRow.val.textContent = want ? 'Off' : 'On';
          U.toast('Could not update watch history');
        }
      }).catch(function () {
        pauseRow.val.textContent = want ? 'Off' : 'On';
      });
    });
    API.historyState().then(function (r) {
      if (pauseRow && pauseRow.val) pauseRow.val.textContent = r.paused ? 'On' : 'Off';
    }).catch(function () {});
    toggle('Pause search history', 'Stop saving searches', 'pauseSearch', false);
    toggle('Ad personalization', 'Ad interests (no ads are shown in this build)', 'adPersonalization', false);
    row('Manage activity', 'Open activity controls on the web', '›', function () {
      U.toast('Activity controls are managed on youtube.com');
    });
  } else if (section === 'devices') {
    row('Add a device', 'Link a phone to this TV', '›', function () { App.go('account'); });
    row('Linked devices', 'Phones connected to this TV', '0', function () { U.toast('No linked devices'); });
    row('Unlink all devices', 'Remove every phone from this TV', 'Unlink', function () { U.toast('No linked devices'); });
    var svc = App.service || {};
    row('Bridge service', 'LAN metadata and stream service', API.base.replace(/^https?:\/\//, ''), function () {
      U.toast(API.base);
    });
    row('Service status', 'Bridge health', svc.offline ? 'Offline' : ('Online · ' + (svc.version || 'ready')), function () {
      U.toast(svc.offline ? 'Bridge is offline' : 'Bridge is online');
    });
  } else if (section === 'help') {
    row('Send feedback', 'Report a problem with this TV app', 'Unavailable', function () {
      U.toast('Feedback is disabled in this build');
    });
    row('Terms of service', 'YouTube terms', '›', function () { U.toast('Terms are available on youtube.com'); });
    row('Privacy policy', 'Google privacy policy', '›', function () { U.toast('Privacy policy is available on youtube.com'); });
    row('Version', 'YouTube 0.2 · 10-foot client', '0.2.4', function () { U.toast('YouTube 0.2.4'); });
  } else if (section === 'extras') {
    sub('Blocking & privacy', 'Ads, SponsorBlock, Shorts, Gaming', 'extras_blocking');
    sub('Metadata', 'DeArrow, dislikes, theme and branding', 'extras_metadata');
    sub('Playback', 'Speed, quality, codecs and seekbar', 'extras_playback');
    sub('Layout', 'Hide shelves and player clutter', 'extras_layout');
    sub('Downloads & player', 'Offline, background and miniplayer', 'extras_downloads');
    sub('Links & misc', 'Sharing links and diagnostics', 'extras_links');
    toggle('Ad blocking', 'No ad surface is ever requested', 'adblock', true, function (v) {
      U.toast(v ? 'Ad blocking on' : 'Off — no ads are requested in this build');
    });
    toggle('SponsorBlock', 'Skip crowdsourced sponsored segments', 'sponsorblock', true);
    toggle('DeArrow thumbnails', 'Community replacement thumbnails', 'dearrow', false, function (v) {
      if (v) VIEW.applyBranding();
      else if (!U.store.get('dearrow', false) && !U.store.get('dearrowTitle', false)) VIEW.restoreBranding();
    });
    toggle('DeArrow titles', 'Community replacement titles', 'dearrowTitle', false, function (v) {
      if (v) VIEW.applyBranding();
      else if (!U.store.get('dearrow', false) && !U.store.get('dearrowTitle', false)) VIEW.restoreBranding();
    });
  } else if (section === 'extras_blocking') {
    toggle('Hide ads', 'Hide general ads in feeds and search', 'adblock', true);
    toggle('Video ads', 'Skip pre-roll and mid-roll ads', 'adblockVideo', true);
    toggle('SponsorBlock', 'Skip marked sponsor segments', 'sponsorblock', true);
    sub('SponsorBlock categories', 'Choose which segment types to skip', 'extras_categories');
    toggle('Return YouTube Dislike', 'Show community dislike counts', 'ryd', false);
    toggle('Hide Shorts components', 'Shorts shelves, tabs and player', 'hideShorts', true);
    toggle('Hide Gaming section', 'Gaming shelf from the interface', 'hideGaming', true);
    toggle('Hide Sport section', 'Sport shelf from the interface', 'hideSport', true);
  } else if (section === 'extras_categories') {
    var cats = [
      ['sponsor', 'Paid promotions and product mentions'],
      ['intro', 'Video introductions'], ['outro', 'End cards and credits'],
      ['selfpromo', 'Self promotion and merch'], ['interaction', 'Subscribe and like reminders'],
      ['chapters', 'Non-interesting chapters'], ['music_offtopic', 'Non-music parts of videos'],
      ['preview', 'Recaps and previews']
    ];
    for (var ci = 0; ci < cats.length; ci++) {
      toggle(cats[ci][0].replace(/_/g, ' '), cats[ci][1], 'sb_' + cats[ci][0], true);
    }
  } else if (section === 'extras_metadata') {
    toggle('Alternative thumbnails', 'DeArrow community thumbnails', 'dearrow', false, function (v) {
      if (v) VIEW.applyBranding();
      else if (!U.store.get('dearrow', false) && !U.store.get('dearrowTitle', false)) VIEW.restoreBranding();
    });
    toggle('Alternative titles', 'DeArrow community titles', 'dearrowTitle', false, function (v) {
      if (v) VIEW.applyBranding();
      else if (!U.store.get('dearrow', false) && !U.store.get('dearrowTitle', false)) VIEW.restoreBranding();
    });
    toggle('Return YouTube Dislike', 'Community dislike counts next to likes', 'ryd', false);
    toggle('Custom branding', 'App name and launcher icon', 'customBranding', true);
    toggle('Change header', 'YouTube wordmark with green play button', 'changeHeader', true);
    toggle('AMOLED dark theme', 'Pure black backgrounds', 'amoled', true);
    toggle('Announcements', 'Show ReVanced notices at startup', 'announcements', false);
    toggle('Custom overlay opacity', 'Adjust player control transparency', 'overlayOpacity', false);
  } else if (section === 'extras_playback') {
    toggle('Playback speed', 'Custom speed menu and button', 'speedEnabled', true);
    choice('Default playback speed', 'Applied to every video', 'speed', [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2], 1);
    toggle('Remember playback speed', 'Keep the last speed you used', 'rememberSpeed', true);
    toggle('Video quality', 'Default resolution and advanced menu', 'qualityEnabled', true);
    choice('Default quality', 'Preferred stream resolution', 'quality', [360, 480, 720, 1080], 720);
    toggle('Force original audio', 'Use the original audio track', 'originalAudio', false);
    toggle('Disable video codecs', 'Turn off HDR or VP9 when playback breaks', 'disableCodecs', false);
    toggle('Spoof video streams', 'Request a compatible stream client', 'spoofStreams', true);
    toggle('Spoof app version', 'Report an older client version', 'spoofVersion', true);
    toggle('Spoof device dimensions', 'Report a larger screen for higher quality', 'spoofDimensions', true);
    toggle('Pause on audio interrupt', 'Pause when another app plays sound', 'pauseAudioInterrupt', true);
    toggle('Loop video', 'Replay the video when it ends', 'loop', false);
    toggle('Seekbar', 'Show the seek bar in the player', 'seekbar', true);
    toggle('Precise seeking', 'Frame-accurate seek bar', 'preciseSeek', true);
    toggle('Double tap to seek', 'Tap the sides of the player to skip', 'doubleTapSeek', true);
    toggle('Swipe controls', 'Volume and brightness gestures', 'swipeControls', false);
    toggle('Hide overlay buttons', 'Hide Cast, Autoplay, Captions, Prev/Next', 'hideOverlayButtons', false);
    toggle('Hide timestamp', 'Hide elapsed and remaining time', 'timestamp', true);
    toggle('Disable double tap actions', 'No seeking from double taps', 'doubleTapActions', false);
    toggle('Disable haptic feedback', 'No remote vibration on seek or zoom', 'haptics', false);
    toggle('Disable rolling numbers', 'Static view, like and upload counts', 'rollingNumbers', false);
  } else if (section === 'extras_layout') {
    toggle('Hide Shorts components', 'Shorts shelves and tabs', 'hideShorts', true);
    toggle('Hide Gaming', 'Gaming section on Home', 'hideGaming', true);
    toggle('Hide Sport', 'Sport section on Home', 'hideSport', true);
    toggle('Hide News', 'News shelf on Home', 'hideNews', false);
    toggle('Hide Comments button', 'Remove Comments from the player row', 'hideComments', false);
    toggle('Hide related videos', 'Up-next suggestions', 'hideRelated', false);
    toggle('Hide end screen cards', 'Suggested cards near the end', 'hideEndCards', false);
    toggle('Hide info cards', 'Creator cards inside the video', 'hideInfoCards', false);
    toggle('Hide video action buttons', 'Buttons below a video', 'hideActionButtons', false);
    toggle('Hide flyout menu items', 'Items in the player gear menu', 'hideFlyout', false);
    toggle('Skip viewer discretion dialog', 'Auto-accept age warnings', 'skipViewerDialog', true);
    choice('Start page', 'Screen opened at launch', 'startPage', ['Home', 'Trending', 'Library'], 'Home');
  } else if (section === 'extras_downloads') {
    toggle('Downloads', 'Download button for offline viewing', 'downloads', false);
    toggle('Save to device', 'Store downloads as ordinary files', 'saveToDevice', false);
    toggle('Download Shorts', 'Download button on Shorts', 'downloadShorts', false);
    toggle('External downloader', 'Hand downloads to another app', 'externalDownloader', false);
    toggle('Background playback', 'Keep audio playing when the screen turns off', 'backgroundPlayback', false);
    toggle('Miniplayer', 'Floating player while browsing', 'miniplayer', false);
    toggle('Open videos fullscreen', 'Start playback fullscreen', 'openFullscreen', true);
    toggle('Exit fullscreen on end', 'Leave fullscreen when a video ends', 'exitFullscreen', false);
  } else if (section === 'extras_links') {
    toggle('Sanitize sharing links', 'Remove tracking parameters', 'cleanLinks', true);
    toggle('Bypass URL redirects', 'Open original URLs directly', 'bypassRedirects', true);
    toggle('Open links externally', 'Use a browser for outside links', 'openLinksExternal', false);
    toggle('Copy video URL', 'Clean and timestamped link buttons', 'copyUrl', true);
    toggle('Disable sign-in TV popup', 'Suppress the phone sign-in prompt', 'disableTvPopup', true);
    toggle('GmsCore support', 'Sign in through microG instead of Play Services', 'gmscore', false);
    toggle('Enable debugging', 'Export diagnostic logs', 'debugLogging', false);
  }

  var chrome = VIEW.chrome('settings');
  var content = [];
  var all = panel.querySelectorAll('.setrow');
  for (var i = 0; i < all.length; i++) content.push({ items: [all[i]], block: all[i] });
  Nav.set(VIEW.rows(chrome, content), null, 0, view);
};

/* ---------- account: the stock sign-in / QR screen ---------- */
VIEW.account = function () {
  var view = document.getElementById('view');
  U.clear(view);
  view.className = 'account';

  var wrap = document.createElement('div');
  wrap.className = 'acctwrap';
  view.appendChild(wrap);

  var chrome = VIEW.chrome('account');

  /* left: YouTube-style account switcher with green circles */
  var menu = document.createElement('div');
  menu.className = 'acctmenu';
  wrap.appendChild(menu);

  /* right: live device-code QR, only shown while adding an account */
  var qr = document.createElement('div');
  qr.className = 'acctqr';
  qr.style.display = 'none';
  qr.innerHTML =
    '<div class="qrimg"><img id="acctqrimg" src="img/signin-qr.png" alt="QR code"></div>' +
    '<div class="qrcopy">' +
      '<div class="qrlbl">Scan QR code or go to</div>' +
      '<div class="qrurl" id="accturl">yt.be/activate</div>' +
      '<div class="qrlbl code-lbl">Enter the code</div>' +
      '<div class="qrcode" id="acctcode">Loading…</div>' +
      '<div class="qrlbl" id="acctstatus"></div>' +
    '</div>';
  wrap.appendChild(qr);
  var img = qr.querySelector('#acctqrimg');
  var codeEl = qr.querySelector('#acctcode');
  var statusEl = qr.querySelector('#acctstatus');

  clearInterval(VIEW._authPoll);
  var lastAccountsState = null;

  function signedIn(profile, goHome) {
    clearInterval(VIEW._authPoll);
    var name = (profile && profile.name) || 'YouTube account';
    U.store.set('account', profile || { name: name });
    VIEW.syncAccount();
    codeEl.textContent = 'Signed in';
    statusEl.textContent = name;
    U.toast('Signed in as ' + name);
    if (goHome) setTimeout(function () { if (document.body.contains(qr)) App.go('account', true); }, 1400);
  }

  function poll() {
    clearInterval(VIEW._authPoll);
    VIEW._authPoll = setInterval(function () {
      if (!document.body.contains(qr)) { clearInterval(VIEW._authPoll); return; }
      API.authStatus().then(function (s) {
        if (s.status === 'signed_in') { signedIn(s.profile, true); VIEW.reloadAccounts(); }
        else if (s.status === 'denied' || s.status === 'expired') {
          clearInterval(VIEW._authPoll);
          statusEl.textContent = s.status === 'denied' ? 'Access denied — retrying' : 'Code expired — refreshing';
          startAuth();
        }
      }).catch(function () {});
    }, 2500);
  }

  function requestCode(attempt) {
    attempt = attempt || 0;
    codeEl.textContent = attempt ? 'Retrying…' : 'Loading…';
    return API.authStart().then(function (r) {
      if (r.status === 'error') {
        if (attempt < 2) {
          statusEl.textContent = (r.message || 'Bridge error') + ' — retrying';
          return new Promise(function (ok) { setTimeout(ok, 1500); })
            .then(function () { return requestCode(attempt + 1); });
        }
        codeEl.textContent = 'Unavailable';
        statusEl.textContent = (r.message || 'Bridge error') + ' — press OK to retry';
        return;
      }
      if (!r.user_code) {
        codeEl.textContent = 'Unavailable';
        statusEl.textContent = 'No code returned — press OK to retry';
        return;
      }
      img.src = r.qr;
      qr.querySelector('#accturl').textContent = r.display_url || 'yt.be/activate';
      codeEl.textContent = r.user_code;
      statusEl.textContent = 'Waiting for activation…';
      poll();
    });
  }

  function startAuth(force) {
    clearInterval(VIEW._authPoll);
    qr.style.display = '';
    codeEl.textContent = 'Loading…';
    statusEl.textContent = '';
    /* Put the QR panel into the remote-focus rows immediately so OK retries. */
    if (lastAccountsState) render(lastAccountsState);
    if (force) { requestCode().catch(showAuthError); return; }
    API.authStatus().then(function (s) {
      if (s.status === 'signed_in') { signedIn(s.profile, false); return; }
      return requestCode();
    }).catch(showAuthError);
  }

  function showAuthError(e) {
    codeEl.textContent = 'Unavailable';
    statusEl.textContent = String(e && e.message || e) + ' — press OK to retry';
  }

  function action(label, glyph, fn, gap) {
    var el = document.createElement('div');
    el.className = 'acctitem' + (gap ? ' gap' : '');
    el.innerHTML = '<div class="glyph">' + glyph + '</div><div>' + U.esc(label) + '</div>';
    el._nav = fn;
    menu.appendChild(el);
    return { items: [el], block: menu };
  }

  VIEW._accountStartAuth = startAuth;

  function render(state) {
    lastAccountsState = state;
    U.clear(menu);
    var accounts = (state && state.accounts) || [];
    var activeId = state && state.activeId;
    var active = accounts.filter(function (a) { return a.id === activeId; })[0] || accounts[0];
    if (active && (active.avatar || active.name)) {
      U.store.set('account', {
        id: active.id, name: active.name, handle: active.handle, avatar: active.avatar
      });
      VIEW.syncAccount();
    }
    var rows = [];

    var head = document.createElement('div');
    head.className = 'accthead';
    head.textContent = accounts.length ? 'Choose an account' : 'Sign in to YouTube';
    menu.appendChild(head);

    if (accounts.length) {
      var circles = document.createElement('div');
      circles.className = 'acctcircles';
      menu.appendChild(circles);
      var circleItems = [];
      accounts.forEach(function (a) {
        var el = document.createElement('div');
        el.className = 'acctcircle' + (a.id === activeId ? ' active' : '');
        var letter = (a.name || 'Y').trim().charAt(0).toUpperCase();
        var dot = document.createElement('div');
        dot.className = 'dot';
        if (a.avatar) {
          var av = new Image();
          av.src = a.avatar;
          av.onerror = function () { dot.textContent = letter; };
          dot.appendChild(av);
        } else {
          dot.textContent = letter;
        }
        el.appendChild(dot);
        var nm = document.createElement('div');
        nm.className = 'circle-name';
        nm.textContent = a.name || 'YouTube account';
        el.appendChild(nm);
        el._nav = function () {
          API.activateAccount(a.id).then(function () {
            U.store.set('account', { id: a.id, name: a.name, handle: a.handle, avatar: a.avatar });
            VIEW.syncAccount();
            U.toast('Switched to ' + a.name);
            App.go('home', true);
          }).catch(function (e) { U.toast('Could not switch account'); });
        };
        circles.appendChild(el);
        circleItems.push(el);
      });
      rows.push({ items: circleItems, block: menu });
    }

    rows.push(action('Sign in with your phone', '+', function () { startAuth(true); }, !accounts.length));
    rows.push(action('Add another account', '+', function () { startAuth(true); }));
    rows.push(action('Watch as guest', '◎', function () {
      U.toast('Watching as guest');
      App.go('home', true);
    }));
    if (accounts.length > 1) {
      rows.push(action('Remove active account', '−', function () {
        var current = accounts.filter(function (a) { return a.id === activeId; })[0] || accounts[0];
        API.removeAccount(current.id).then(function () {
          U.toast('Removed ' + current.name);
          VIEW.reloadAccounts();
        });
      }));
    }

    var terms = document.createElement('div');
    terms.className = 'acctterms';
    terms.textContent = 'Terms & Privacy';
    terms._nav = function () { U.toast('Terms & Privacy'); };
    menu.appendChild(terms);

    qr._nav = function () { startAuth(true); };
    var navRows = rows.slice();
    if (qr.style.display !== 'none') navRows.push({ items: [qr], block: qr });
    Nav.set(VIEW.rows(chrome, navRows), null, 0, view);
  }

  VIEW.reloadAccounts = function () {
    if (!document.body.contains(menu)) return;
    API.accounts().then(render).catch(function () { render({ accounts: [], activeId: null }); });
  };

  Nav.set(VIEW.rows(chrome, [{ items: [qr], block: qr }]), null, 0, view);
  VIEW.reloadAccounts();
  if (!API.mock) API.authStatus().then(function (s) {
    if (s.status === 'signed_in' && (s.profile || s.accounts)) VIEW.reloadAccounts();
  }).catch(function () {});
};

/* ---------- library: personal shelves when signed in ---------- */
function signedInNow() {
  var a = U.store.get('account', null);
  return !!(a && (a.avatar || a.name));
}

/* Personal rows come from the bridge's OAuth-backed home feed. They are the
   user's real YouTube recommendations, not a search seeded from local history. */
function personalRows() {
  if (!signedInNow()) return Promise.resolve([]);
  return API.recommendations().then(function (r) { return (r && r.rows) || []; })
    .catch(function () { return []; });
}

/* A playlist renders like a video tile, but Enter opens its video list. */
function playlistTile(p) {
  return {
    id: p.id,
    playlistId: p.playlistId,
    title: p.title,
    channel: p.countText || (p.count ? p.count + (p.count === 1 ? ' video' : ' videos') : p.privacy),
    thumb: p.thumb || U.thumb(p.id),
    go: function () { App.go('playlist', false, p); }
  };
}

/* ---------- Playlists rail screen ---------- */
VIEW.playlists = function () {
  var view = document.getElementById('view');
  U.clear(view);
  var host = document.createElement('div');
  view.appendChild(host);
  var chrome = VIEW.chrome('playlists');

  if (!signedInNow()) {
    emptyCollection(host, 'Playlists', 'Sign in to see your YouTube playlists.');
    Nav.set(VIEW.rows(chrome, []), null, 0, view);
    return;
  }

  host.appendChild(VIEW.skeleton({ title: 'Playlists', count: 6 }).el);
  host.appendChild(VIEW.skeleton({ title: 'Liked playlists', count: 3 }).el);
  Nav.set(VIEW.rows(chrome, []), null, 0, view);

  API.playlists().then(function (data) {
    if (!liveView('playlists', view, host)) return;
    U.clear(host);
    var rows = [];
    var mine = (data.items || []).map(playlistTile);
    if (mine.length) {
      var s = VIEW.shelf({ title: 'Playlists', items: mine });
      host.appendChild(s.el);
      rows = rows.concat(s.rows);
    } else emptyCollection(host, 'Playlists', 'No playlists on this account yet.');

    var liked = (data.liked || []).map(playlistTile);
    if (liked.length) {
      var ls = VIEW.shelf({ title: 'Liked playlists', items: liked });
      host.appendChild(ls.el);
      rows = rows.concat(ls.rows);
    } else emptyCollection(host, 'Liked playlists', 'No liked videos yet.');

    Nav.set(VIEW.rows(chrome, rows), null, 0, view);
  }).catch(function () {
    if (!liveView('playlists', view, host)) return;
    U.clear(host);
    emptyCollection(host, 'Playlists', 'Could not load playlists.');
    Nav.set(VIEW.rows(chrome, []), null, 0, view);
  });
};

/* ---------- One account playlist, opened from the Playlists shelves ---------- */
VIEW.playlist = function (p) {
  var view = document.getElementById('view');
  U.clear(view);
  var host = document.createElement('div');
  view.appendChild(host);
  var chrome = VIEW.chrome('playlists');
  var title = (p && p.title) || 'Playlist';

  host.appendChild(VIEW.skeleton({ title: title, count: 6 }).el);
  Nav.set(VIEW.rows(chrome, []), null, 0, view);

  API.playlist(p || {}).then(function (data) {
    if (!liveView('playlist', view, host)) return;
    U.clear(host);
    var items = data.items || [];
    if (!items.length) {
      emptyCollection(host, data.title || title, 'This playlist is empty.');
      Nav.set(VIEW.rows(chrome, []), null, 0, view);
      return;
    }
    var s = VIEW.shelf({ title: data.title || title, items: items });
    host.appendChild(s.el);
    Nav.set(VIEW.rows(chrome, s.rows), null, 0, view);
  }).catch(function () {
    if (!liveView('playlist', view, host)) return;
    U.clear(host);
    emptyCollection(host, title, 'Could not load this playlist.');
    Nav.set(VIEW.rows(chrome, []), null, 0, view);
  });
};

/* ---------- channel page, opened from the player's Go to channel button ---------- */
VIEW.channel = function (data) {
  var view = document.getElementById('view');
  U.clear(view);
  var host = document.createElement('div');
  view.appendChild(host);
  var chrome = VIEW.chrome('');
  var id = data && data.id;
  var title = (data && (data.title || data.channel)) || 'Channel';

  host.appendChild(VIEW.skeleton({ title: 'Videos', count: 6 }).el);
  Nav.set(VIEW.rows(chrome, []), null, 0, view);

  if (!id) {
    U.clear(host);
    emptyCollection(host, title, 'Channel unavailable for this video.');
    Nav.set(VIEW.rows(chrome, []), null, 0, view);
    return;
  }

  API.channel(id).then(function (info) {
    if (!liveView('channel', view, host)) return;
    U.clear(host);

    var head = document.createElement('div');
    head.className = 'channelhead';
    if (info.avatar) {
      var img = new Image();
      img.src = info.avatar;
      img.alt = '';
      head.appendChild(img);
    }
    var meta = document.createElement('div');
    meta.className = 'cmeta';
    var h1 = document.createElement('h1');
    h1.textContent = info.title || title;
    meta.appendChild(h1);
    var sub = document.createElement('div');
    sub.className = 'sub';
    sub.textContent = [info.handle, info.subscribers, info.videoCount]
      .filter(Boolean).join(' · ');
    if (sub.textContent) meta.appendChild(sub);
    head.appendChild(meta);

    /* Real subscribe / unsubscribe state comes from the signed-in TV account.
       The button is a normal nav row so OK toggles it like any YouTube TV tile. */
    var subBtn = U.el('button', 'subbtn', 'Subscribe');
    subBtn.type = 'button';
    var subscribed = false;
    var subBusy = false;
    function paintSub() {
      subBtn.textContent = subscribed ? 'Unsubscribe' : 'Subscribe';
      subBtn.className = 'subbtn' + (subscribed ? ' subscribed' : '');
    }
    subBtn._nav = function () {
      if (subBusy) return;
      subBusy = true;
      var next = !subscribed;
      subBtn.textContent = next ? 'Subscribing…' : 'Unsubscribing…';
      API.subscribe(id, next).then(function (r) {
        if (!r || r.ok === false) throw new Error((r && r.error) || 'Could not update subscription');
        subscribed = typeof r.subscribed === 'boolean' ? r.subscribed : next;
        paintSub();
        U.toast(subscribed ? 'Subscribed' : 'Unsubscribed');
      }).catch(function (e) {
        paintSub();
        U.toast('Could not update subscription: ' + ((e && e.message) || e));
      }).then(function () { subBusy = false; });
    };
    subBtn.onclick = function (e) {
      if (e && e.stopPropagation) e.stopPropagation();
      subBtn._nav();
    };
    head.appendChild(subBtn);
    host.appendChild(head);
    var subRow = { items: [subBtn], block: head };

    var items = (info && info.items) || [];
    var rows = [subRow];
    if (items.length) {
      var shelf = VIEW.shelf({ title: 'Videos', items: items });
      host.appendChild(shelf.el);
      rows = rows.concat(shelf.rows);
    } else {
      emptyCollection(host, 'Videos', (info && info.error) || 'No videos found on this channel.');
    }
    Nav.set(VIEW.rows(chrome, rows), null, 0, view);
    API.subscribeState(id).then(function (r) {
      if (!liveView('channel', view, host) || subBusy) return;
      subscribed = !!(r && r.subscribed);
      paintSub();
    }).catch(function () {});
  }).catch(function (e) {
    if (!liveView('channel', view, host)) return;
    U.clear(host);
    emptyCollection(host, title, 'Could not load this channel: ' + ((e && e.message) || e));
    Nav.set(VIEW.rows(chrome, []), null, 0, view);
  });
};

/* YouTube TV puts the real pause-watch-history switch at the top of History.
   The value comes from the signed-in account, not localStorage. */
function historyPauseCard() {
  var el = document.createElement('div');
  el.className = 'hpcard';
  el.innerHTML =
    '<div class="hpicon"></div>' +
    '<div class="hptxt"><div class="hptitle">Pause watch history</div>' +
    '<div class="hpsub">Pause this account’s watch history on all devices</div></div>' +
    '<div class="hpval">Off</div>' +
    '<div class="hpswitch"><i></i></div>';
  var icon = el.querySelector('.hpicon');
  var val = el.querySelector('.hpval');
  var sub = el.querySelector('.hpsub');
  var sw = el.querySelector('.hpswitch');
  var paused = false;
  var busy = false;

  var PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 5h4.2v14H6.6zM13.2 5h4.2v14h-4.2z"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.2v13.6L19 12z"/></svg>';

  function paint() {
    icon.innerHTML = paused ? PLAY : PAUSE;
    val.textContent = paused ? 'On' : 'Off';
    sub.textContent = paused
      ? 'Watch history is paused on all devices'
      : 'Pause this account’s watch history on all devices';
    sw.className = 'hpswitch' + (paused ? ' on' : '');
    el.className = 'hpcard' + (paused ? ' paused' : '');
  }
  paint();

  API.historyState().then(function (r) {
    paused = !!r.paused;
    paint();
  }).catch(function () {});

  el._nav = function () {
    if (busy) return Promise.resolve();
    busy = true;
    var want = !paused;
    paused = want;
    paint();
    U.toast(want ? 'Watch history paused' : 'Watch history turned on');
    return API.historyPause(want).then(function (r) {
      busy = false;
      if (r && r.ok === false) throw new Error(r.error || 'Could not update watch history');
      return r;
    }).catch(function (e) {
      busy = false;
      /* Never trust the optimistic paint after a failed request: read the
         account's real state back so the switch cannot drift out of sync. */
      return API.historyState().then(function (r) {
        paused = !!r.paused;
        paint();
      }).catch(function () {
        paused = !want;
        paint();
      }).then(function () {
        U.toast('Could not update watch history');
      });
    });
  };
  return { el: el, rows: [{ items: [el], block: el }] };
}

VIEW.library = function () {
  var view = document.getElementById('view');
  U.clear(view);

  var host = document.createElement('div');
  view.appendChild(host);

  var chrome = VIEW.chrome('library');
  var hist = U.store.get('history', []);
  var saved = U.store.get('saved', []);

  function empty(title, msg) {
    var e = document.createElement('div');
    e.className = 'state';
    e.innerHTML = '<h2>' + U.esc(title) + '</h2><p>' + U.esc(msg) + '</p>';
    host.appendChild(e);
  }
  /* Signed out keeps the simple local history view. */
  if (!signedInNow()) {
    if (!hist.length) {
      empty('Your library is empty', 'Videos you start watching show up here so you can pick them up again.');
      Nav.set(VIEW.rows(chrome, []), null, 0, view);
      return;
    }
    var hs = VIEW.grid({ title: 'Watch history', items: hist }, 3);
    host.appendChild(hs.el);
    Nav.set(VIEW.rows(chrome, hs.rows), null, 0, view);
    return;
  }

  var savedRows = [];

  var pauseHost = document.createElement('div');
  host.appendChild(pauseHost);
  var card = historyPauseCard();
  pauseHost.appendChild(card.el);

  var histSlot = document.createElement('div');
  host.appendChild(histSlot);
  histSlot.appendChild(VIEW.skeleton({ title: 'Watch history', count: 6, grid: true }).el);

  if (saved.length) {
    var ss = VIEW.shelf({ title: 'Saved videos', items: saved });
    host.appendChild(ss.el);
    savedRows = ss.rows;
  } else empty('Saved videos', 'Use Save to Watch later in the player.');

  Nav.set(VIEW.rows(chrome, card.rows), null, 0, view);

  API.history().then(function (res) {
    if (!liveView('library', view, host)) return;
    U.clear(histSlot);

    var rows = card.rows.slice();
    var accountHist = (res && res.items) || [];
    var historyItems = accountHist.length ? accountHist : hist;
    if (historyItems.length) {
      var hs = VIEW.grid({ title: 'Watch history', items: historyItems }, 3);
      histSlot.appendChild(hs.el);
      rows = rows.concat(hs.rows);
    } else empty('Watch history', 'Nothing watched yet.');

    rows = rows.concat(savedRows);
    Nav.set(VIEW.rows(chrome, rows), null, 0, view);
  }).catch(function () {
    if (!liveView('library', view, host)) return;
    U.clear(histSlot);
    Nav.set(VIEW.rows(chrome, card.rows.concat(savedRows)), null, 0, view);
  });
};

/* A saved or liked collection, opened from the Playlists shelf. */
VIEW.collection = function (key, title) {
  var view = document.getElementById('view');
  U.clear(view);

  var host = document.createElement('div');
  view.appendChild(host);
  var chrome = VIEW.chrome('library');
  var items = U.store.get(key, []);
  var rows = [];

  if (!items.length) emptyCollection(host, title, 'Nothing here yet.');
  else {
    var s = VIEW.shelf({ title: title, items: items });
    host.appendChild(s.el);
    rows = rows.concat(s.rows);
  }

  var recSlot = document.createElement('div');
  host.appendChild(recSlot);
  Nav.set(VIEW.rows(chrome, rows), null, 0, view);

  if (!signedInNow()) return;
  recSlot.appendChild(VIEW.skeleton({ title: 'Recommended for you', count: 6 }).el);
  personalRows().then(function (recRows) {
    if (!window.App || (App.screen !== 'saved' && App.screen !== 'liked') || !view.contains(host)) return;
    U.clear(recSlot);
    if (!recRows.length) return;
    var added = [];
    recRows.slice(0, 2).forEach(function (r) {
      var rs = VIEW.shelf({ title: r.title, items: r.items });
      recSlot.appendChild(rs.el);
      added = added.concat(rs.rows);
    });
    Nav.set(VIEW.rows(chrome, rows.concat(added)), null, 0, view);
  }).catch(function () {
    if (!window.App || (App.screen !== 'saved' && App.screen !== 'liked') || !view.contains(host)) return;
    U.clear(recSlot);
  });
};

function emptyCollection(host, title, msg) {
  var e = document.createElement('div');
  e.className = 'state';
  e.innerHTML = '<h2>' + U.esc(title) + '</h2><p>' + U.esc(msg) + '</p>';
  host.appendChild(e);
}

/* ---------- YouTube Music ----------
   Catalog, search and album/playlist/artist pages come from the public YTMUSIC
   InnerTube client via the bridge. The signed-in account's own history, liked
   songs and playlists are composed by the bridge's TV session. Songs play
   through the same ad-free player. */
function musicItems(list) {
  return (list || []).map(function (it) {
    var x = {};
    for (var k in it) if (Object.prototype.hasOwnProperty.call(it, k)) x[k] = it[k];
    var id = it.browseId || it.id;
    x.go = it.kind === 'song'
      ? function () { App.open(id, x); }
      : function () { App.go('musicBrowse', false, { id: id, title: x.title, thumb: x.thumb }); };
    return x;
  });
}

VIEW.music = function () {
  var view = document.getElementById('view');
  U.clear(view);
  var host = document.createElement('div');
  view.appendChild(host);
  var chrome = VIEW.chrome('music');

  /* No in-content search card: the header field is the YouTube Music search. */
  host.appendChild(VIEW.skeleton({ title: 'Music', count: 6 }).el);
  Nav.set(VIEW.rows(chrome, []), null, 0, view);

  /* Public YTMUSIC shelves plus the signed-in account's own history, liked
     songs and playlists. The TV OAuth token cannot be attached to YTMUSIC, so
     the bridge composes the personal rows from the TV session instead. */
  Promise.all([API.musicHome(), API.musicPersonal()]).then(function (res) {
    if (!liveView('music', view, host)) return;
    U.clear(host);
    var rows = [];
    var personal = (res[1] && res[1].rows) || [];
    personal.concat((res[0] && res[0].rows) || []).forEach(function (r) {
      if (!r.items || !r.items.length) return;
      var s = VIEW.shelf({ title: r.title, items: musicItems(r.items) });
      host.appendChild(s.el);
      rows = rows.concat(s.rows);
    });
    Nav.set(VIEW.rows(chrome, rows), null, 1, view);
  }).catch(function () {});
};

VIEW.musicBrowse = function (data) {
  var view = document.getElementById('view');
  U.clear(view);
  var host = document.createElement('div');
  view.appendChild(host);
  var chrome = VIEW.chrome('music');
  var id = data.browseId || data.id;
  host.appendChild(VIEW.skeleton({ title: data.title || 'Music', count: 6 }).el);
  Nav.set(VIEW.rows(chrome, []), null, 0, view);

  API.musicBrowse(id).then(function (d) {
    if (!liveView('musicBrowse', view, host)) return;
    U.clear(host);
    var rows = [];
    var head = U.el('div', 'musichead', '<h1>' + U.esc(d.title || data.title || 'Music') + '</h1>' +
      (d.subtitle ? '<p>' + U.esc(d.subtitle) + '</p>' : ''));
    host.appendChild(head);
    if (d.items && d.items.length) {
      var s = VIEW.shelf({ title: 'Songs', items: musicItems(d.items) });
      host.appendChild(s.el);
      rows = rows.concat(s.rows);
    }
    Nav.set(VIEW.rows(chrome, rows), null, 0, view);
  }).catch(function () {});
};

/* ---------- topic screens: podcasts, news ---------- */
VIEW.topic = function (key, title, query) {
  var view = document.getElementById('view');
  U.clear(view);

  var host = document.createElement('div');
  view.appendChild(host);

  var chrome = VIEW.chrome(key);
  Nav.set(VIEW.rows(chrome, []), null, 0, view);

  host.appendChild(VIEW.skeleton({ title: title, count: 6 }).el);

  /* Signed in: every topic also gets the real personal recommendation rows. */
  Promise.all([API.search(query), personalRows()]).then(function (res) {
    if (!liveView(key, view, host)) return;
    U.clear(host);
    var r = res[0];
    if (!r.items || !r.items.length) {
      VIEW.empty(host);
      Nav.set(VIEW.rows(chrome, []), null, 0, view);
      return;
    }
    var rows = [];
    var shelf = VIEW.shelf({ title: title, items: r.items });
    host.appendChild(shelf.el);
    rows = rows.concat(shelf.rows);

    var recRows = (res[1] || []).slice(0, 3);
    recRows.forEach(function (rr) {
      var recShelf = VIEW.shelf({ title: rr.title, items: rr.items });
      host.appendChild(recShelf.el);
      rows = rows.concat(recShelf.rows);
    });
    Nav.set(VIEW.rows(chrome, rows), null, 0, view);
  }).catch(function (err) {
    if (!liveView(key, view, host)) return;
    U.clear(host);
    VIEW.error(host, err);
  });
};

/* ---------- payload ---------- */
var Payload = {
  home: function () {
    var signed = signedInNow();
    var jobs = [API.home()];
    if (signed) jobs.push(API.history().catch(function () { return { items: [] }; }));
    if (signed) jobs.push(personalRows());

    return Promise.all(jobs).then(function (res) {
      var data = res[0];
      var accountHist = signed ? (res[1] && res[1].items) || [] : [];
      var recRows = signed ? (res[2] || []) : [];
      var localHist = U.store.get('history', []);
      var hist = accountHist.length ? accountHist : localHist;
      var rows = [];

      if (hist.length) {
        rows.push({
          title: 'Continue watching',
          horizontal: true,
          items: hist.slice(0, 12).map(function (h) {
            return {
              id: h.id, title: h.title, channel: h.channel,
              duration: h.duration, thumb: h.thumb, progress: h.progress,
              position: h.position
            };
          })
        });
      }

      if (signed) {
        /* Home is one Continue watching strip and one personal recommendation
           shelf; topic shelves stay in Search so the rest of Home is the
           account's real Recommended for you feed. */
        var seen = {}, recommended = [];
        recRows.forEach(function (r) {
          (r.items || []).forEach(function (item) {
            if (!item || !item.id || seen[item.id]) return;
            seen[item.id] = 1;
            recommended.push(item);
          });
        });
        if (recommended.length) {
          rows.push({ title: 'Recommended for you', items: recommended.slice(0, 24) });
        }
      } else {
        (data.rows || []).slice(0, 4).forEach(function (r) { rows.push(r); });
      }
      return { rows: rows };
    });
  }
};
