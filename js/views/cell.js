/* ============================================================
   views/cell.js — the picture of stations 5, 6 and 7: one kind of cell, seen several ways.

   A row of buttons switches between the ways of seeing it (the drawing, the light microscope, the electron
   microscope; or the outside and a cut through a bacterium). Each way names only the parts that can really be
   seen in it, on ruled level lines that end ON the part (memory label-lines-never-cross, no dots). Opening a
   card on the right shows its part: if this way of seeing cannot show it (mitochondria under the light
   microscope), the picture changes to one that can, and says why: that is the station's lesson.

   spec: { kind:'cell', parts:[…], modes:[{ id, name, img | svg, w, h, pts:{ part:[x, y] }, say, credit,
           cannot:{ part: 'why it cannot be seen here' } }] }
   Points are in the picture's own pixels; a drawing (svg) uses its own viewBox units.
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
    ribosomes: 'ribosomes', chloroplast: 'chloroplast', vacuole: 'vacuole', dna: 'circular DNA', plasmid: 'plasmid',
    capsule: 'capsule (beyond 0610)', flagellum: 'flagellum (beyond 0610)', shrunk: 'cytoplasm, shrunk away from the wall' };

  function make(spec, ctx) {
    var root = h('div', 'cellv');
    var bar = h('div', 'vbar cellv__bar');
    bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'How you see this cell');
    var note = h('p', 'cellv__note');
    note.setAttribute('aria-live', 'polite'); note.hidden = true;
    var stage = h('div', 'cellv__stage');
    root.appendChild(bar); root.appendChild(stage); root.appendChild(note);
    var uid = 'cv' + Math.random().toString(36).slice(2, 7);

    var modes = spec.modes.map(function (m, k) {
      var b = h('button', 'cellv__mode', m.name); b.type = 'button';
      b.setAttribute('aria-pressed', k === 0 ? 'true' : 'false');
      b.addEventListener('click', function () { show(k, null); });
      bar.appendChild(b);
      var svg = el('svg', { class: 'cellv__svg', role: 'img', 'aria-label': m.alt || m.name });
      var defs = el('defs', {}, svg);
      var f = el('filter', { id: uid + 'f' + k, x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
      el('feGaussianBlur', { stdDeviation: String(Math.max(m.w, m.h) / 40) }, f);
      var mask = el('mask', { id: uid + 'm' + k, maskUnits: 'userSpaceOnUse', x: m.x0 || 0, y: m.y0 || 0, width: m.w, height: m.h }, defs);
      el('rect', { x: m.x0 || 0, y: m.y0 || 0, width: m.w, height: m.h, fill: '#fff' }, mask);
      var hole = el('ellipse', { cx: 0, cy: 0, rx: 0, ry: 0, fill: '#000', filter: 'url(#' + uid + 'f' + k + ')' }, mask);
      /* the picture at its full size; the view is cropped to x0, y0, w, h (a drawing's own viewBox units) */
      el('image', { href: 'assets/photos/' + (m.svg || m.img), x: 0, y: 0, width: m.iw || m.w, height: m.ih || m.h, preserveAspectRatio: 'none' }, svg);
      var veil = el('rect', { x: m.x0 || 0, y: m.y0 || 0, width: m.w, height: m.h, class: 'cellv__veil', mask: 'url(#' + uid + 'm' + k + ')' }, svg);
      var labG = el('g', {}, svg);
      svg.style.display = k === 0 ? '' : 'none';
      stage.appendChild(svg);
      return { spec: m, btn: b, svg: svg, labG: labG, hole: hole, veil: veil, font: 0 };
    });

    var cur = 0, lit = null;
    /* labels at about 14 px on any screen: the font, and the margins it needs, in the picture's own units */
    function fit(M) {
      var r = M.svg.getBoundingClientRect(); if (!r.width || !r.height) return;
      var m = M.spec, f = 40;
      /* labels wrap at about ten letters (never inside a word), so a wide photograph keeps most of the width */
      var nameOf = function (p) { return (m.names && m.names[p]) || NAMES[p] || p; };
      var WRAP = Object.keys(m.pts).reduce(function (n, p) { return Math.max(n, nameOf(p).split(' ').reduce(function (k, w) { return Math.max(k, w.length); }, 0)); }, 10);
      M.wrap = WRAP;
      var widest = function (side) { return Object.keys(m.pts).filter(function (p) { return sideOf(M, p) === side; })
        .reduce(function (n, p) { return Math.max(n, Math.min(WRAP, nameOf(p).length)); }, 0); };
      var wl = widest('L'), wr = widest('R');
      for (var n = 0; n < 4; n++) {
        var L = wl ? f * 0.56 * wl + 30 : 10, R = wr ? f * 0.56 * wr + 30 : 10;
        var ppu = Math.min(r.width / (m.w + L + R), r.height / (m.h + 20));
        f = Math.max(12, Math.min(m.w / 6, 14 / ppu));
      }
      var L0 = wl ? f * 0.56 * wl + 30 : 10, R0 = wr ? f * 0.56 * wr + 30 : 10;
      M.svg.setAttribute('viewBox', ((m.x0 || 0) - L0).toFixed(1) + ' ' + ((m.y0 || 0) - 10) + ' ' + (m.w + L0 + R0).toFixed(1) + ' ' + (m.h + 20));
      M.font = f;
    }
    function sideOf(M, p) { var pt = M.spec.pts[p]; return pt[2] || (pt[0] < (M.spec.x0 || 0) + M.spec.w / 2 ? 'L' : 'R'); }
    function draw(M) {
      fit(M);
      var m = M.spec, f = M.font || 40;
      var items = Object.keys(m.pts).map(function (p) {
        return { id: p, text: (m.names && m.names[p]) || NAMES[p] || p, x: m.pts[p][0], y: m.pts[p][1], side: sideOf(M, p), cls: lit === p ? 'is-lit' : (lit ? 'is-dim' : '') };
      });
      var opt = { left: (m.x0 || 0) - 8, right: (m.x0 || 0) + m.w + 8, font: f, top: m.y0 || 0, bottom: (m.y0 || 0) + m.h, gap: f * 0.3, width: f * 0.56 * (M.wrap || 15) };
      M.labG.innerHTML = global.CircLearn.labels(Object.assign({}, opt, { items: items }));
      Array.prototype.forEach.call(M.labG.querySelectorAll('.lb'), function (g) {
        var k = g.getAttribute('data-lab');
        g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0');
        g.setAttribute('aria-label', items.filter(function (i) { return i.id === k; })[0].text + ': open its card');
        g.addEventListener('click', function () { ctx.pick(k); });
        g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ctx.pick(k); } });
      });
      var pt = lit && m.pts[lit];
      if (pt) {
        var rad = pt[3] || Math.max(m.w, m.h) / 9;
        M.hole.setAttribute('cx', pt[0]); M.hole.setAttribute('cy', pt[1]); M.hole.setAttribute('rx', rad); M.hole.setAttribute('ry', rad);
        M.veil.classList.add('is-on');
      } else M.veil.classList.remove('is-on');
    }
    function show(k, why) {
      cur = k;
      modes.forEach(function (M, j) { M.svg.style.display = j === k ? '' : 'none'; M.btn.setAttribute('aria-pressed', j === k ? 'true' : 'false'); });
      draw(modes[k]);
      note.hidden = !why; note.textContent = why || '';
      api.say = modes[k].spec.say; api.credit = modes[k].spec.credit;
      ctx.caption();
    }
    if (global.ResizeObserver) new global.ResizeObserver(function () { draw(modes[cur]); }).observe(stage);

    var api = {
      el: root, say: modes[0].spec.say, credit: modes[0].spec.credit,
      labels: (function () { var o = {}; (spec.parts || []).forEach(function (p) { o[p] = NAMES[p] || p; }); return o; })(),
      focus: function (part) {
        lit = part || null;
        var M = modes[cur];
        if (!part || M.spec.pts[part]) { show(cur, null); return; }
        /* this way of seeing cannot show it: change to the first that can, and say why */
        var why = (M.spec.cannot || {})[part] || '';
        for (var k = 0; k < modes.length; k++) if (modes[k].spec.pts[part]) { show(k, why ? why + ' Here it is in the ' + modes[k].spec.name.toLowerCase() + '.' : null); return; }
        show(cur, why || null);
      },
      stop: function () {}
    };
    show(0, null);
    return api;
  }
  global.Views.add('cell', make);

  /* the three drawings, for a question's hotspot ('cell#animal', 'cell#plant', 'cell#bacterium'): the whole drawing,
     so a region's x and y are percentages of its own viewBox */
  var DRAWN = { animal: [730.39, 560.42], plant: [778.05, 573.36], bacterium: [702.64, 622.77] };
  global.CircLearn.diagram('cell', function (v) {
    var d = DRAWN[v]; if (!d) return '';
    return '<svg viewBox="0 0 ' + d[0] + ' ' + d[1] + '" role="img" aria-label="A drawing of ' + (v === 'animal' ? 'an animal cell' : v === 'plant' ? 'a plant cell' : 'a bacterium') + '">' +
      '<image href="assets/photos/cell-' + v + '.svg" x="0" y="0" width="' + d[0] + '" height="' + d[1] + '"/></svg>';
  });
})(window);
