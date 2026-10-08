/* ============================================================
   views/compare.js — station 8's picture: the three cells side by side.

   Two ways to look:
     the parts     the three drawings (the same artist, CC BY 4.0, ribosomes added), about the same size. Choose a
                   part and it keeps its colours in every cell that has it while everything else greys; under each
                   cell, ✓ or ✗. The comparison table is read off the picture instead of learnt by heart.
                   The drawings are read into the page (not shown as pictures) so that a part can be lit EXACTLY, every
                   one of it: the wall and the membrane are different lines (8 Oct 2026 review: a soft glow lit both in
                   the same spot). Each part is found by its colour in the drawing (ROLE below).
     true sizes    the three real cells drawn to their typical sizes against one 10 µm bar: a plant cell about
                   0.1 mm long, a cheek cell about 0.06 mm across, a bacterium about 0.002 mm long — a speck.
     real cells    three light micrographs, each about 60 µm across, so they share one scale and one 10 µm bar
                   (Daniel, 8 Oct 2026: "compare the three real images"). A chosen part is ringed where the light
                   microscope shows it; "has it, not seen here" says why when it does not (`unseen`).

   spec: { kind:'compare', parts:[…], cells:[{ id, name, svg, box:[x,y,w,h], pts:{ part:[x,y] } }],
           has:{ part:{ cellId: true|'why not' } }, sizes:[{ id, name, img, w, h, um, say }] }
   ============================================================ */
(function (global) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(e);
    return e;
  }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  var NAMES = { membrane: 'cell membrane', wall: 'cell wall', nucleus: 'nucleus', cytoplasm: 'cytoplasm', mitochondria: 'mitochondria',
    ribosomes: 'ribosomes', chloroplast: 'chloroplasts', vacuole: 'large permanent vacuole', dna: 'circular DNA', plasmid: 'plasmids' };
  /* each part of the three drawings, by its colour there (the cytoplasm's shape also carries the membrane, as its edge) */
  var ROLE = [['rect[fill="#fea"]', 'capsule'], ['rect[fill="#fc0"]', 'wall'], ['[fill="#eff9f9"]', 'cyto'], ['[fill="#d88ebf"]', 'mitochondria'],
    ['[fill="#5fd38d"]', 'chloroplast'], ['[fill="#1c818a"]', 'nucleus'], ['[fill="#cfe2c6"]', 'vacuole'], ['.ribosomes', 'ribosomes'],
    ['[stroke="#2ad4ff"]', 'dna'], ['[fill="#ff2a2a"]', 'plasmid'], ['[stroke="#6c5700"]', 'flagellum']];

  function make(spec, ctx) {
    var root = h('div', 'cmp');
    var bar = h('div', 'vbar');
    var modeB = [['parts', 'The parts'], ['sizes', 'True sizes'], ['real', 'Real cells']].filter(function (m) { return m[0] !== 'real' || (spec.real || []).length; }).map(function (m) {
      var b = h('button', 'cellv__mode', m[1]); b.type = 'button';
      b.addEventListener('click', function () { mode = m[0]; paint(); });
      bar.appendChild(b); return [m[0], b];
    });
    var chips = h('div', 'cmp__chips');
    chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', 'Choose a part');
    var stage = h('div', 'cmp__stage');
    var sizes = h('div', 'cmp__sizes');
    var realBox = h('div', 'cmp__real');
    var verdict = h('p', 'cmp__verdict'); verdict.setAttribute('aria-live', 'polite');
    root.appendChild(bar); root.appendChild(chips); root.appendChild(stage); root.appendChild(sizes); root.appendChild(realBox); root.appendChild(verdict);

    var mode = 'parts', lit = null;
    var cells = spec.cells.map(function (c) {
      var col = h('figure', 'cmp__cell');
      /* the drawings sit on one line, just above their names */
      var svg = el('svg', { viewBox: c.box.join(' '), class: 'cmp__svg', role: 'img', 'aria-label': 'A drawing of ' + c.name, preserveAspectRatio: 'xMidYMax meet' });
      var g = el('g', { class: 'cmp__draw' }, svg);
      /* the drawing itself, read in so its parts can be lit; until it arrives (or if it cannot), the picture */
      var pic = el('image', { href: 'assets/photos/' + c.svg, x: c.vb[0], y: c.vb[1], width: c.vb[2], height: c.vb[3] }, g);
      if (global.fetch && global.DOMParser) {
        global.fetch('assets/photos/' + c.svg).then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); }).then(function (txt) {
          var doc = new global.DOMParser().parseFromString(txt, 'image/svg+xml'), src = doc.documentElement;
          if (!src || src.nodeName !== 'svg') return;
          Array.prototype.forEach.call(src.querySelectorAll('defs,marker,text'), function (x) { x.parentNode.removeChild(x); });
          var holder = el('g', {});
          Array.prototype.slice.call(src.childNodes).forEach(function (n) { holder.appendChild(document.importNode(n, true)); });
          ROLE.forEach(function (r) { Array.prototype.forEach.call(holder.querySelectorAll(r[0]), function (x) { if (!x.hasAttribute('data-p')) x.setAttribute('data-p', r[1]); }); });
          g.replaceChild(holder, pic);
        }).catch(function () { /* the picture stays: the ✓ and ✗ still answer */ });
      }
      col.appendChild(svg);
      var cap = h('figcaption', 'cmp__cap', '<span class="cmp__name">' + c.name + '</span><span class="cmp__mark"></span>');
      col.appendChild(cap);
      stage.appendChild(col);
      return { c: c, svg: svg, mark: cap.querySelector('.cmp__mark'), col: col };
    });
    var chipB = (spec.parts || []).filter(function (p) { return p !== 'sizes' && p !== 'real'; }).map(function (p) {   /* 'sizes' and 'real' are switches, not parts */
      var b = h('button', 'cmp__chip', NAMES[p] || p); b.type = 'button';
      b.addEventListener('click', function () { lit = lit === p ? null : p; paint(); if (lit) ctx.pick(p, { stay: true }); });
      chips.appendChild(b); return [p, b];
    });
    /* true sizes: the drawings, each at its typical size against one scale bar. Each drawing's width is a share of ITS
       column, so the bar is drawn in a column too, the widest cell's: one scale for all (8 Oct 2026 review: the bar was a
       share of the whole row, three times too long). Pictures on one line, names on the next, the bar under them. */
    (function () {
      var maxUm = Math.max.apply(null, spec.sizes.map(function (s) { return s.um; }));
      var grid = h('div', 'cmp__sgrid');
      spec.sizes.forEach(function (s) {
        var cell = h('div', 'cmp__scell');
        var im = new Image(); im.src = 'assets/photos/' + s.img; im.alt = s.alt || s.name; im.className = 'cmp__simg';
        im.style.width = (s.um / maxUm * 100) + '%';
        cell.appendChild(im);
        grid.appendChild(cell);
      });
      spec.sizes.forEach(function (s) { grid.appendChild(h('p', 'cmp__scap', '<b>' + s.name + '</b> about ' + s.say)); });
      grid.appendChild(h('div', 'cmp__bar', '<span class="cmp__barline" style="width:' + (10 / maxUm * 100).toFixed(2) + '%"></span><span class="cmp__barlab">10 µm</span>'));
      sizes.appendChild(grid);
    })();
    /* real cells: the photographs at one scale (each `um` across), names and sizes under them, one 10 µm bar */
    var realCells = [];
    if ((spec.real || []).length) (function () {
      var maxUm = Math.max.apply(null, spec.real.map(function (s) { return s.um; }));
      var grid = h('div', 'cmp__sgrid');
      spec.real.forEach(function (s) {
        var cell = h('div', 'cmp__scell');
        var svg = el('svg', { viewBox: '0 0 ' + s.w + ' ' + s.h, class: 'cmp__rsvg', role: 'img', 'aria-label': s.alt || s.name });
        svg.style.width = (s.um / maxUm * 100) + '%';
        el('image', { href: 'assets/photos/' + s.img, x: 0, y: 0, width: s.w, height: s.h, preserveAspectRatio: 'none' }, svg);
        var ringG = el('g', {}, svg);
        cell.appendChild(svg); grid.appendChild(cell);
        realCells.push({ s: s, ringG: ringG });
      });
      spec.real.forEach(function (s, i) {
        var cap = h('p', 'cmp__scap', '<b>' + s.name + '</b> ' + s.size + '<span class="cmp__mark"></span>');
        realCells[i].mark = cap.querySelector('.cmp__mark');
        grid.appendChild(cap);
      });
      grid.appendChild(h('div', 'cmp__bar', '<span class="cmp__barline" style="width:' + (10 / maxUm * 100).toFixed(2) + '%"></span><span class="cmp__barlab">10 µm</span>'));
      realBox.appendChild(grid);
    })();
    function list(names) { return names.length < 3 ? names.join(' and ') : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1]; }
    function joinSays(says) { return says.map(function (s) { return list(s.names) + ': ' + s.text; }).join(' '); }
    function addSay(says, name, text) {
      var same = says.filter(function (s) { return s.text === text; })[0];
      if (same) same.names.push(name.toLowerCase()); else says.push({ names: [name], text: text });
    }

    function paint() {
      modeB.forEach(function (m) { m[1].setAttribute('aria-pressed', m[0] === mode ? 'true' : 'false'); });
      chips.hidden = mode === 'sizes';
      stage.hidden = mode !== 'parts';
      sizes.hidden = mode !== 'sizes';
      realBox.hidden = mode !== 'real';
      chipB.forEach(function (c) { c[1].setAttribute('aria-pressed', c[0] === lit ? 'true' : 'false'); });
      var says = [];   /* one sentence per reason, the cells that share it named together */
      cells.forEach(function (C) {
        var has = lit ? (spec.has[lit] || {})[C.c.id] : null;
        if (lit) C.svg.setAttribute('data-lit', has === true ? lit : 'none'); else C.svg.removeAttribute('data-lit');
        C.mark.textContent = !lit ? '' : has === true ? '✓ has it' : '✗ none';
        C.mark.className = 'cmp__mark' + (!lit ? '' : has === true ? ' is-yes' : ' is-no');
        C.col.classList.toggle('is-none', !!lit && has !== true);
        if (lit && has !== true && typeof has === 'string') {
          var same = says.filter(function (s) { return s.text === has; })[0];
          if (same) same.names.push(C.c.name.toLowerCase()); else says.push({ names: [C.c.name], text: has });
        }
      });
      /* real cells: a ring where the light microscope shows the part; otherwise why not */
      var rsays = [];
      realCells.forEach(function (R) {
        var id = R.s.id, has = lit ? (spec.has[lit] || {})[id] : null, pt = lit && has === true ? (R.s.pts || {})[lit] : null;
        var r = R.s.w * 0.09;
        R.ringG.innerHTML = pt ? '<circle class="cmp__ringh" cx="' + pt[0] + '" cy="' + pt[1] + '" r="' + r.toFixed(1) + '"/><circle class="cmp__ring" cx="' + pt[0] + '" cy="' + pt[1] + '" r="' + r.toFixed(1) + '"/>' : '';
        R.mark.textContent = !lit ? '' : has === true ? (pt ? '✓ seen here' : 'has it, not seen here') : '✗ none';
        R.mark.className = 'cmp__mark' + (!lit ? '' : has === true ? (pt ? ' is-yes' : ' is-hid') : ' is-no');
        var why = !lit ? null : has === true ? (pt ? null : ((spec.unseen || {})[lit] || {})[id] || null) : (typeof has === 'string' ? has : null);
        if (why) addSay(rsays, R.s.name, why);
      });
      verdict.textContent = mode === 'sizes' ? spec.sizesNote || '' : mode === 'real' ? (!lit ? spec.realNote || '' : joinSays(rsays)) :
        !lit ? 'Choose a part: it is highlighted in every cell that has it.' : joinSays(says);
      api.say = mode === 'sizes' ? 'Three kinds of cell, drawn at their typical sizes, against one 10 µm bar' :
        mode === 'real' ? 'Three real cells, photographed with a light microscope, at one scale' : 'An animal cell, a plant cell and a bacterium, drawn about the same size (not to scale)';
      api.credit = mode === 'sizes' ? spec.sizesCredit : mode === 'real' ? spec.realCredit : spec.credit;
      ctx.caption();
    }
    var api = {
      el: root, say: '', credit: '',
      labels: (function () { var o = {}; (spec.parts || []).forEach(function (p) { o[p] = NAMES[p] || p; }); o.sizes = 'their sizes'; o.real = 'real cells'; return o; })(),
      /* a part's card keeps "Real cells" if it is showing: the photographs answer the question too */
      focus: function (part) { if (part === 'sizes' || part === 'real') { mode = part; } else if (part && spec.has[part]) { if (mode !== 'real') mode = 'parts'; lit = part; } else if (!part) { lit = null; } paint(); },
      stop: function () {}
    };
    paint();
    return api;
  }
  global.Views.add('compare', make);
})(window);
