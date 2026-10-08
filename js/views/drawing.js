/* ============================================================
   views/drawing.js — station 10's picture: a biological drawing, and its faults one at a time.

   The cell is REAL: one cell from the cervix (Mikael Häggström's photograph, CC0), its outline traced from the
   photograph by computer and its nucleus set on the darker oval in it, for this lab. It is shown as a pupil's
   pencil drawing beside the photograph it was drawn from. "The good drawing" follows the syllabus's rules and
   Daniel's checklist; "Next fault" shows the same drawing with ONE rule broken, and "Show me" rings the fault and
   names the rule. Never onion epidermis (memory never-do-the-assessment): the rules, not the report.

   spec: { kind:'drawing', photo, outline:[[x,y]…] (photo px), nucleus:{cx,cy,rx,ry,rot}, faults:[{ id, name, rule }] }
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

  /* a closed smooth path through the traced points (Catmull–Rom as cubic Béziers) */
  function smooth(pts) {
    var n = pts.length, d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' +
           (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d + 'Z';
  }
  /* the same outline drawn the way a hurried pupil draws it: many short strokes that do not join */
  function sketchy(pts) {
    var d = '', n = pts.length, seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 - 0.5; }
    for (var i = 0; i < n; i++) {
      var a = pts[i], b = pts[(i + 1) % n];
      for (var s = 0; s < 2; s++) d += 'M' + (a[0] + rnd() * 10).toFixed(1) + ' ' + (a[1] + rnd() * 10).toFixed(1) + 'L' + (b[0] + rnd() * 10).toFixed(1) + ' ' + (b[1] + rnd() * 10).toFixed(1);
    }
    return d;
  }

  function make(spec, ctx) {
    var root = h('div', 'drw');
    var bar = h('div', 'vbar');
    var goodB = h('button', 'cellv__mode', 'The good drawing'); goodB.type = 'button';
    var nextB = h('button', 'cellv__mode', 'Next fault ▸'); nextB.type = 'button';
    var showB = h('button', 'vbtn drw__show', 'Show me the fault'); showB.type = 'button';
    bar.appendChild(goodB); bar.appendChild(nextB); bar.appendChild(showB);
    var row = h('div', 'drw__row');
    var photo = h('figure', 'drw__photo');
    var pim = new Image(); pim.src = 'assets/photos/' + spec.photo; pim.alt = 'The photograph the drawing was made from: one flat cell from the cervix, stained blue, with its nucleus.';
    photo.appendChild(pim); photo.appendChild(h('figcaption', null, 'The photograph'));
    var svg = el('svg', { class: 'drw__svg', viewBox: '0 0 760 640', role: 'img' });
    /* the sheet takes the column's width; the photograph sits in its empty top right corner (8 Oct 2026: side by side,
       both were small) */
    var paper = h('div', 'drw__paper');
    paper.appendChild(svg); paper.appendChild(photo); row.appendChild(paper);
    var say = h('p', 'drw__say'); say.setAttribute('aria-live', 'polite');
    root.appendChild(bar); root.appendChild(row); root.appendChild(say);

    var ON = spec.outline, NU = spec.nucleus;
    var k = -1, shown = false, order = spec.faults.map(function (f, i) { return i; });
    function paint() {
      var f = k < 0 ? null : spec.faults[order[k]], id = f ? f.id : '';
      goodB.setAttribute('aria-pressed', k < 0 ? 'true' : 'false');
      nextB.setAttribute('aria-pressed', k < 0 ? 'false' : 'true');   /* a fault is showing: say which mode is on */
      showB.hidden = k < 0;
      svg.innerHTML = '';
      /* the drawing: the traced cell, scaled into the drawing space (small for the "too small" fault) */
      var narrow0 = !!(global.matchMedia && global.matchMedia('(max-width: 620px)').matches);
      var s = id === 'small' ? 0.5 : narrow0 ? 1.25 : 1.45, ox = id === 'small' ? 150 : 40, oy = id === 'small' ? 200 : narrow0 ? 60 : 30;
      var g = el('g', { transform: 'translate(' + ox + ' ' + oy + ') scale(' + s + ') translate(-90 -60)', class: 'drw__pencil' }, svg);
      if (id === 'sketchy') el('path', { d: sketchy(ON), class: 'drw__line drw__line--sketch' }, g);
      else el('path', { d: smooth(ON), class: 'drw__line' + (id === 'shading' ? ' drw__line--shade' : '') }, g);
      if (id === 'shading') {
        /* the hatching in the drawing's own (photograph) units, clipped to the outline in the same units: drawn and
           clipped once, so it stays inside the cell (8 Oct 2026: the clip was scaled twice and the lines ran outside) */
        var hatch = el('g', { class: 'drw__hatch', 'clip-path': 'url(#drwclip)' }, g);
        var cp = el('clipPath', { id: 'drwclip' }, el('defs', {}, svg)); el('path', { d: smooth(ON) }, cp);
        for (var x = 60; x < 600; x += 8) el('line', { x1: x, y1: 50, x2: x - 190, y2: 460, class: 'drw__hatchl' }, hatch);
      }
      el('ellipse', { cx: NU.cx, cy: NU.cy, rx: NU.rx, ry: NU.ry, transform: 'rotate(' + NU.rot + ' ' + NU.cx + ' ' + NU.cy + ')', class: 'drw__line' + (id === 'shading' ? ' drw__nuc--shade' : '') }, g);
      /* the labels: ruled, level, touching their part, outside the drawing (unless the fault says otherwise) */
      function P(x, y) { return [ox + s * (x - 90), oy + s * (y - 60)]; }
      var parts = [['cell membrane', P(399, 262)], ['nucleus', P(NU.cx + NU.rx * 0.6, NU.cy)], ['cytoplasm', P(330, 340)]];
      /* the small drawing breaks ONE rule: its three points are far enough apart for level label lines, as in the good drawing */
      if (id === 'small') parts = [['cell membrane', P(276, 127.1)], ['nucleus', P(NU.cx + NU.rx * 0.6, NU.cy)], ['cytoplasm', P(250, 410)]];
      var narrow = !!(global.matchMedia && global.matchMedia('(max-width: 620px)').matches);   /* larger words on a phone */
      svg.setAttribute('viewBox', narrow ? '0 0 800 640' : '0 0 760 640');   /* room for the larger words */
      var LX = id === 'small' ? 345 : narrow ? 470 : 560;   /* the small drawing's labels stay clear of the photograph in the corner */
      parts.forEach(function (pt, i) {
        var tx = LX, ty = pt[1][1], x0 = pt[1][0];
        if (id === 'cross' && i < 2) { ty = parts[1 - i][1][1]; }               /* two lines swapped: they cross */
        if (id === 'inside') { el('text', { x: x0 - 20, y: pt[1][1] - 8, class: 'drw__lab', 'text-anchor': 'end' }, svg).textContent = pt[0]; return; }
        var endX = id === 'short' && i === 0 ? x0 + 34 : x0;                       /* a line that stops short of its part */
        el('line', { x1: endX, y1: pt[1][1], x2: tx - 8, y2: ty, class: 'drw__lead' }, svg);
        if (id === 'arrows') el('path', { d: 'M' + endX + ' ' + pt[1][1] + 'l14 -6v12z', class: 'drw__arrow' }, svg);
        el('text', { x: tx, y: ty + 5, class: 'drw__lab' }, svg).textContent = pt[0];
      });
      if (id !== 'nomag') el('text', { x: id === 'small' ? 150 : 40, y: 625, class: 'drw__mag' }, svg).textContent = 'magnification ×500';
      /* the ring round the fault, once asked for */
      if (f && shown && f.ring) {
        /* the rings are written for the laptop drawing (scale 1.45, top 30); on a phone the cell is drawn at 1.25 from 60,
           so a ring on the cell moves with it. The crossing ring is placed where the two lines really cross. */
        var rg = f.ring.slice();
        if (narrow0 && id !== 'nomag' && id !== 'small') {
          var q = 1.25 / 1.45;
          rg = [40 + (rg[0] - 40) * q, 60 + (rg[1] - 30) * q, rg[2] * q, rg[3] * q];
        }
        if (id === 'cross') {
          var a0 = parts[0][1], b0 = parts[1][1], ax = LX - 8, ay = b0[1], bx = LX - 8, by = a0[1];
          var d = (a0[0] - ax) * (b0[1] - by) - (a0[1] - ay) * (b0[0] - bx);
          if (Math.abs(d) > 1e-6) {
            var u = ((a0[0] - b0[0]) * (b0[1] - by) - (a0[1] - b0[1]) * (b0[0] - bx)) / d;
            rg = [a0[0] + u * (ax - a0[0]), a0[1] + u * (ay - a0[1]), rg[2], rg[3]];
          }
        }
        el('ellipse', { cx: rg[0], cy: rg[1], rx: rg[2], ry: rg[3], class: 'drw__ring' }, svg);
      }
      var which = k < 0 ? '' : 'Fault ' + (k + 1) + ' of ' + order.length + ': ';
      say.innerHTML = k < 0 ? '<b>The good drawing.</b> ' + spec.good : shown ? '<b>' + which + f.name + '.</b> ' + f.rule : '<b>' + which.replace(/: $/, '.') + '</b> What is wrong with this drawing? Look first, then press "Show me the fault".';
      api.say = k < 0 ? 'A good biological drawing of one cell, traced from the photograph beside it' : 'The same drawing with one rule broken';
      ctx.caption();
    }
    goodB.addEventListener('click', function () { k = -1; shown = false; paint(); });
    nextB.addEventListener('click', function () { k = (k + 1) % order.length; shown = false; paint(); });
    showB.addEventListener('click', function () { shown = true; paint(); });
    var api = { el: root, say: '', credit: spec.credit, labels: {}, focus: function () {}, stop: function () {} };
    if (global.matchMedia) { var mq = global.matchMedia('(max-width: 620px)'); if (mq.addEventListener) mq.addEventListener('change', function () { paint(); }); }
    paint();
    return api;
  }
  global.Views.add('drawing', make);
})(window);
