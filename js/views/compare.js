/* ============================================================
   views/compare.js — station 8's picture: the three cells side by side.

   Two ways to look:
     the parts     the three drawings (the same artist, CC BY 4.0, ribosomes added) the same height. Choose a
                   part and it is lit in every cell that has it; under each cell, ✓ or ✗. The comparison table
                   is read off the picture instead of learnt by heart.
     true sizes    the three real cells drawn to their typical sizes against one 10 µm bar: a plant cell about
                   0.1 mm long, a cheek cell about 0.06 mm across, a bacterium about 0.002 mm long — a speck.

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

  function make(spec, ctx) {
    var root = h('div', 'cmp');
    var bar = h('div', 'vbar');
    var modeB = [['parts', 'The parts'], ['sizes', 'True sizes']].map(function (m) {
      var b = h('button', 'cellv__mode', m[1]); b.type = 'button';
      b.addEventListener('click', function () { mode = m[0]; paint(); });
      bar.appendChild(b); return [m[0], b];
    });
    var chips = h('div', 'cmp__chips');
    chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', 'Choose a part');
    var stage = h('div', 'cmp__stage');
    var sizes = h('div', 'cmp__sizes');
    var verdict = h('p', 'cmp__verdict'); verdict.setAttribute('aria-live', 'polite');
    root.appendChild(bar); root.appendChild(chips); root.appendChild(stage); root.appendChild(sizes); root.appendChild(verdict);

    var mode = 'parts', lit = null;
    var uid = 'cm' + Math.random().toString(36).slice(2, 7);
    var cells = spec.cells.map(function (c, k) {
      var col = h('figure', 'cmp__cell');
      var b = c.box;
      var svg = el('svg', { viewBox: b.join(' '), class: 'cmp__svg', role: 'img', 'aria-label': 'A drawing of ' + c.name });
      var defs = el('defs', {}, svg);
      var f = el('filter', { id: uid + 'f' + k, x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
      el('feGaussianBlur', { stdDeviation: String(b[2] / 24) }, f);
      var mask = el('mask', { id: uid + 'm' + k, maskUnits: 'userSpaceOnUse', x: b[0], y: b[1], width: b[2], height: b[3] }, defs);
      el('rect', { x: b[0], y: b[1], width: b[2], height: b[3], fill: '#fff' }, mask);
      var hole = el('ellipse', { rx: 0, ry: 0, fill: '#000', filter: 'url(#' + uid + 'f' + k + ')' }, mask);
      el('image', { href: 'assets/photos/' + c.svg, x: c.vb[0], y: c.vb[1], width: c.vb[2], height: c.vb[3] }, svg);
      var veil = el('rect', { x: b[0], y: b[1], width: b[2], height: b[3], class: 'cellv__veil', mask: 'url(#' + uid + 'm' + k + ')' }, svg);
      col.appendChild(svg);
      var cap = h('figcaption', 'cmp__cap', '<span class="cmp__name">' + c.name + '</span><span class="cmp__mark"></span>');
      col.appendChild(cap);
      stage.appendChild(col);
      return { c: c, hole: hole, veil: veil, mark: cap.querySelector('.cmp__mark'), col: col };
    });
    var chipB = (spec.parts || []).filter(function (p) { return p !== 'sizes'; }).map(function (p) {   /* 'sizes' is the True sizes switch, not a part */
      var b = h('button', 'cmp__chip', NAMES[p] || p); b.type = 'button';
      b.addEventListener('click', function () { lit = lit === p ? null : p; paint(); if (lit) ctx.pick(p, { stay: true }); });
      chips.appendChild(b); return [p, b];
    });
    /* true sizes: the photographs, each at its typical size against one scale bar */
    (function () {
      var maxUm = Math.max.apply(null, spec.sizes.map(function (s) { return s.um; }));
      var row = h('div', 'cmp__srow');
      spec.sizes.forEach(function (s) {
        var fig = h('figure', 'cmp__sfig');
        var im = new Image(); im.src = 'assets/photos/' + s.img; im.alt = s.alt || s.name; im.className = 'cmp__simg';
        im.style.width = (s.um / maxUm * 100) + '%';
        fig.appendChild(im);
        fig.appendChild(h('figcaption', 'cmp__scap', '<b>' + s.name + '</b> about ' + s.say));
        row.appendChild(fig);
      });
      sizes.appendChild(row);
      sizes.appendChild(h('div', 'cmp__bar', '<span class="cmp__barline" style="width:' + (10 / maxUm * 100).toFixed(2) + '%"></span><span class="cmp__barlab">10 µm</span>'));
    })();

    function paint() {
      modeB.forEach(function (m) { m[1].setAttribute('aria-pressed', m[0] === mode ? 'true' : 'false'); });
      chips.hidden = stage.hidden = mode !== 'parts';
      sizes.hidden = mode !== 'sizes';
      chipB.forEach(function (c) { c[1].setAttribute('aria-pressed', c[0] === lit ? 'true' : 'false'); });
      var says = [];
      cells.forEach(function (C) {
        var has = lit ? (spec.has[lit] || {})[C.c.id] : null;
        var pt = lit && has === true ? C.c.pts[lit] : null;
        if (pt) { var r = C.c.box[2] / 6.5; C.hole.setAttribute('cx', pt[0]); C.hole.setAttribute('cy', pt[1]); C.hole.setAttribute('rx', r); C.hole.setAttribute('ry', r); C.veil.classList.add('is-on'); }
        else if (lit) { C.hole.setAttribute('rx', 0); C.hole.setAttribute('ry', 0); C.veil.classList.add('is-on'); }
        else C.veil.classList.remove('is-on');
        C.mark.textContent = !lit ? '' : has === true ? '✓ has it' : '✗ none';
        C.mark.className = 'cmp__mark' + (!lit ? '' : has === true ? ' is-yes' : ' is-no');
        C.col.classList.toggle('is-none', !!lit && has !== true);
        if (lit && has !== true && typeof has === 'string') says.push(C.c.name + ': ' + has);
      });
      verdict.textContent = mode === 'sizes' ? spec.sizesNote || '' : !lit ? 'Choose a part: it lights in every cell that has it.' : says.join(' ');
      api.say = mode === 'sizes' ? 'Three kinds of cell, drawn at their typical sizes, against one 10 µm bar' : 'An animal cell, a plant cell and a bacterium, drawn the same height';
      api.credit = mode === 'sizes' ? spec.sizesCredit : spec.credit;
      ctx.caption();
    }
    var api = {
      el: root, say: '', credit: '',
      labels: (function () { var o = {}; (spec.parts || []).forEach(function (p) { o[p] = NAMES[p] || p; }); o.sizes = 'their sizes'; return o; })(),
      focus: function (part) { if (part === 'sizes') { mode = 'sizes'; } else if (part && spec.has[part]) { mode = 'parts'; lit = part; } else if (!part) { lit = null; } paint(); },
      stop: function () {}
    };
    paint();
    return api;
  }
  global.Views.add('compare', make);
})(window);
