/* ============================================================
   views/drawing.js — station 11's picture: four pencil drawings of pondweed leaf cells at ×400 (25 Oct 2026).

   Drawing D follows every rule of Daniel's Year 9 rubric and of the 0610 schemes: several cells, each touching the
   cells next to it; one clear, unbroken line for each edge, no shading; each cell wall drawn as two lines (a band);
   ruled, level label lines that touch their parts, outside the drawing, no arrowheads, never crossing; four labels;
   "Magnification used: ×400" under it, with the actual length of one cell and a scale bar. Drawings A, B and C each
   break three rules (the Practise tab asks which):
     A  sketchy lines with gaps · shading · arrowheads on the label lines
     B  cells drawn apart, with gaps · two cells drawn over each other · each wall one thin line
     C  two label lines that cross · a label line that stops short · no magnification
   Never onion (memory never-do-the-assessment): these are pondweed cells, and nothing here is the Year 9 product.
   The view shows D, and a sentence opened in the text rings the part of D it is about. The questions show A, B and C
   themselves ('pencil#A' …), so a phone shows the drawing beside its question.

   One cell is drawn 1.6 units to the micrometre: the long ones are 240 units, 150 µm; the 100 µm scale bar is 160.
   ============================================================ */
(function (global) {
  'use strict';
  function f2(v) { return Math.round(v * 100) / 100; }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  var K = 1.6, T = 3.6;                       /* units per µm; half the thickness of a wall */
  var Y0 = 96, RH = 64;                        /* the top of the group; the height of a row (40 µm) */
  /* the group: each row's walls, left to right (x of the middle of each wall) */
  var ROWS = [[78, 292, 398], [56, 166, 406], [88, 334, 382], [62, 222, 402], [74, 260, 392], [58, 138, 378]];
  var NUC = [[1, 1, 0.3], [3, 0, 0.62]];       /* [row, cell, where along it]: the cells whose nucleus can be seen */

  function rr(x, y, w, hh, r) {               /* a rounded rectangle as a path */
    r = Math.min(r, w / 2, hh / 2);
    return 'M' + f2(x + r) + ' ' + f2(y) + 'H' + f2(x + w - r) + 'Q' + f2(x + w) + ' ' + f2(y) + ' ' + f2(x + w) + ' ' + f2(y + r) +
      'V' + f2(y + hh - r) + 'Q' + f2(x + w) + ' ' + f2(y + hh) + ' ' + f2(x + w - r) + ' ' + f2(y + hh) + 'H' + f2(x + r) +
      'Q' + f2(x) + ' ' + f2(y + hh) + ' ' + f2(x) + ' ' + f2(y + hh - r) + 'V' + f2(y + r) + 'Q' + f2(x) + ' ' + f2(y) + ' ' + f2(x + r) + ' ' + f2(y) + 'Z';
  }
  /* every cell: its inner outline (the wall's inner edge), as x, y, width, height */
  function cells(inset) {
    var out = [];
    ROWS.forEach(function (w, r) {
      for (var i = 0; i + 1 < w.length; i++) out.push({ r: r, i: i, x: w[i] + inset, y: Y0 + r * RH + inset, w: w[i + 1] - w[i] - 2 * inset, h: RH - 2 * inset });
    });
    return out;
  }
  /* the outer edge of the group's walls: a stepped outline round the rows, T outside their outer walls */
  function groupOutline() {
    var L = [], R = [];
    ROWS.forEach(function (w, r) { var y0 = Y0 + r * RH - T, y1 = Y0 + (r + 1) * RH + T; L.push([w[0] - T, y0, y1]); R.push([w[w.length - 1] + T, y0, y1]); });
    var d = 'M' + f2(L[0][0]) + ' ' + f2(L[0][1]) + 'H' + f2(R[0][0]);
    R.forEach(function (s, i) { d += 'V' + f2(i + 1 < R.length ? Y0 + (i + 1) * RH : s[2]); if (i + 1 < R.length) d += 'H' + f2(R[i + 1][0]); });
    d += 'H' + f2(L[L.length - 1][0]);
    for (var i = L.length - 1; i >= 0; i--) { d += 'V' + f2(i > 0 ? Y0 + i * RH : L[0][1]); if (i > 0) d += 'H' + f2(L[i - 1][0]); }
    return d + 'Z';
  }
  /* the chloroplasts along both long walls of a cell, as small ovals */
  function chloro(c, r) {
    var out = [];
    for (var x = c.x + 12 + r() * 6; x < c.x + c.w - 12; x += 17 + r() * 5) {
      out.push([x, c.y + 8 + r() * 2.5]);
      out.push([x + 6, c.y + c.h - 8 - r() * 2.5]);
    }
    return out;
  }
  function nucleusOf(c, k) { return [c.x + c.w * k, c.y + c.h / 2 + 1]; }

  var LX = 432;                                 /* where the labels stand */
  /* the parts each label touches, in D (and A, C): [text, x, y] */
  function labelPoints(cs) {
    var c0 = cs[0], c2 = cs.filter(function (c) { return c.r === 1 && c.i === 1; })[0], nC = cs.filter(function (c) { return c.r === 3 && c.i === 0; })[0], cy = cs.filter(function (c) { return c.r === 4 && c.i === 1; })[0];
    var nu = nucleusOf(nC, 0.62);
    return [
      ['cell wall', ROWS[0][2] + T, Y0 + 26],
      ['chloroplast', c2.x + c2.w - 30, c2.y + 8],
      ['nucleus', nu[0] + 13, nu[1]],
      ['cytoplasm', cy.x + cy.w - 3, cy.y + cy.h - 15]
    ];
  }

  /* one drawing, as the inside of a 600 × 640 svg */
  function drawing(which) {
    var r = rng(5), s = '', lines = '', marks = '';
    s += '<rect class="dw-paper" x="0" y="0" width="600" height="640"/><text class="dw-title" x="30" y="34">Drawing ' + which + (which === 'D' ? ' · follows every rule' : '') + '</text>';
    s += '<rect class="dw-box" x="22" y="48" width="556" height="574"/>';
    var cs = cells(which === 'B' ? 9 : T), pts = labelPoints(cells(T));
    if (which === 'B') {
      /* each cell drawn apart, one thin line each; the cell of row 2 drawn over its neighbour */
      cs.forEach(function (c) {
        var dy = (c.r === 2 && c.i === 0) ? -26 : 0, dx = (c.r === 2 && c.i === 0) ? 18 : 0;
        lines += '<path class="dw-pen" d="' + rr(c.x + dx, c.y + dy, c.w, c.h, 6) + '"/>';
      });
    } else if (which === 'A') {
      /* the same cells, each edge drawn three times, a little apart, with gaps */
      cs.forEach(function (c) {
        for (var k = 0; k < 3; k++) {
          var j = function () { return (r() - 0.5) * 4.5; };
          lines += '<path class="dw-pen dw-sketch" stroke-dasharray="' + (30 + k * 11) + ' ' + (5 + k * 3) + '" d="' + rr(c.x + j(), c.y + j(), c.w + j(), c.h + j(), 6) + '"/>';
        }
      });
      for (var k2 = 0; k2 < 2; k2++) lines += '<path class="dw-pen dw-sketch" stroke-dasharray="' + (40 + k2 * 13) + ' 7" d="' + groupOutline().replace(/(\d+\.?\d*) (\d+\.?\d*)/g, function (m, a, b) { return f2(+a + (r() - 0.5) * 3.5) + ' ' + f2(+b + (r() - 0.5) * 3.5); }) + '"/>';
    } else {
      cs.forEach(function (c) { lines += '<path class="dw-pen" d="' + rr(c.x, c.y, c.w, c.h, 6) + '"/>'; });
      lines += '<path class="dw-pen" d="' + groupOutline() + '"/>';
    }
    /* chloroplasts and nuclei */
    var rc = rng(11);
    cs.forEach(function (c) {
      var dy = (which === 'B' && c.r === 2 && c.i === 0) ? -26 : 0, dx = (which === 'B' && c.r === 2 && c.i === 0) ? 18 : 0;
      chloro(c, rc).forEach(function (p) {
        marks += '<ellipse class="dw-pen' + (which === 'A' ? ' dw-fill' : '') + '" cx="' + f2(p[0] + dx) + '" cy="' + f2(p[1] + dy) + '" rx="5.2" ry="3"/>';
      });
    });
    NUC.forEach(function (n) {
      var c = cs.filter(function (x) { return x.r === n[0] && x.i === n[1]; })[0]; if (!c) return;
      var p = nucleusOf(c, n[2]);
      marks += '<ellipse class="dw-pen' + (which === 'A' ? ' dw-fill' : '') + '" cx="' + f2(p[0]) + '" cy="' + f2(p[1]) + '" rx="13" ry="9"/>';
    });
    if (which === 'A') {
      /* shading: the cells hatched over, the pencil pressed hard */
      var hatch = '';
      for (var x = 40; x < 470; x += 9) hatch += 'M' + x + ' ' + (Y0 - 4) + 'l-70 ' + (6 * RH + 8);
      s += '<defs><clipPath id="dwA"><path d="' + groupOutline() + '"/></clipPath></defs><path class="dw-hatch" clip-path="url(#dwA)" d="' + hatch + '"/>';
    }
    s += '<g>' + lines + marks + '</g>';
    /* the labels */
    var lab = '';
    var P = which === 'B' ? [['cell wall', ROWS[0][2] - 9, Y0 + 26], ['chloroplast', pts[1][1], pts[1][2] + 1], ['nucleus', pts[2][1], pts[2][2]]] :
            which === 'C' ? pts.slice(0, 3) : pts;
    P.forEach(function (p, i) {
      var y = p[2], x0 = p[1], ty = y;
      if (which === 'C' && i < 2) ty = P[1 - i][2];                    /* two lines swapped: they cross */
      if (which === 'C' && i === 2) x0 = p[1] + 26;                      /* the nucleus line stops short */
      lab += '<line class="dw-lead"' + (which === 'A' ? ' marker-start="url(#dwArr)"' : '') + ' x1="' + f2(x0) + '" y1="' + f2(y) + '" x2="' + (LX - 6) + '" y2="' + f2(ty) + '"/>' +
        '<text class="dw-lab" x="' + LX + '" y="' + f2(ty + 6) + '">' + p[0] + '</text>';
    });
    if (which === 'A') s += '<defs><marker id="dwArr" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M10 0 L0 5 L10 10 z" class="dw-arr"/></marker></defs>';
    s += lab;
    /* under the drawing */
    if (which !== 'C') s += '<text class="dw-note" x="40" y="' + (Y0 + 6 * RH + 52) + '">Magnification used: ×400</text>';
    if (which === 'D') {
      var by = Y0 + 6 * RH + 100;
      s += '<text class="dw-note" x="40" y="' + (Y0 + 6 * RH + 84) + '">Actual length of one cell: 150 µm</text>';
      s += '<line class="dw-bar" x1="330" y1="' + by + '" x2="490" y2="' + by + '"/><line class="dw-bar" x1="330" y1="' + (by - 7) + '" x2="330" y2="' + (by + 7) + '"/><line class="dw-bar" x1="490" y1="' + (by - 7) + '" x2="490" y2="' + (by + 7) + '"/>' +
        '<text class="dw-note" x="410" y="' + (by - 14) + '" text-anchor="middle">100 µm</text>';
    }
    return s;
  }
  /* where a sentence of the text rings drawing D: [cx, cy, rx, ry] */
  var RINGS = {
    cells: [232, Y0 + 3 * RH, 210, 3 * RH + 26],
    lines: [ROWS[2][1], Y0 + 2.5 * RH, 40, 50],
    wall: [ROWS[3][1], Y0 + 3.5 * RH, 24, 36],
    labels: [LX - 20, Y0 + 2.6 * RH, 60, 2.6 * RH],
    mag: [200, Y0 + 6 * RH + 76, 190, 52]
  };

  function svgOf(which, extra, cls) {
    return '<svg class="dw-svg ' + (cls || '') + '" viewBox="0 0 600 640" role="img" aria-label="' + (which === 'D' ? 'Drawing D: a biological drawing of pondweed leaf cells that follows every rule.' :
      'Drawing ' + which + ': a drawing of pondweed leaf cells that breaks three rules.') + '">' + drawing(which) + (extra || '') + '</svg>';
  }

  function make(spec, ctx) {
    var root = h('div', 'dwv');
    var bar = h('div', 'vbar dwv__bar', '<span class="dwv__k">Drawing</span>');
    var cur = 'D', ring = null;
    var btns = ['A', 'B', 'C', 'D'].map(function (w) {
      var b = h('button', 'cellv__mode', w === 'D' ? 'D ✓' : w); b.type = 'button';
      b.setAttribute('aria-pressed', w === cur ? 'true' : 'false');
      b.addEventListener('click', function () { cur = w; ring = null; paint(); });
      bar.appendChild(b);
      return b;
    });
    var paper = h('div', 'dwv__paper');
    var say = h('p', 'dwv__say'); say.setAttribute('aria-live', 'polite');
    root.appendChild(bar); root.appendChild(paper); root.appendChild(say);
    function paint() {
      var rg = ring && cur === 'D' ? '<ellipse class="drw__ring" cx="' + RINGS[ring][0] + '" cy="' + RINGS[ring][1] + '" rx="' + RINGS[ring][2] + '" ry="' + RINGS[ring][3] + '"/>' : '';
      paper.innerHTML = svgOf(cur, rg);
      btns.forEach(function (b, i) { b.setAttribute('aria-pressed', 'ABCD'[i] === cur ? 'true' : 'false'); });
      say.innerHTML = cur === 'D' ? '<b>Drawing D follows every rule.</b> Several cells, each touching the next; one clear line for each edge; each wall a band of two lines; ruled labels; the magnification used, the actual length of one cell and a scale bar.'
        : '<b>Drawing ' + cur + ' breaks three rules.</b> Compare it with drawing D. Which three? The Practise tab asks.';
      api.say = cur === 'D' ? 'Drawing D: pondweed leaf cells drawn by every rule' : 'Drawing ' + cur + ': pondweed leaf cells, with three mistakes';
      ctx.caption();
    }
    var api = {
      el: root, say: '', credit: 'Drawings: made for this lab, of pondweed leaf cells at ×400',
      labels: { cells: 'the cells', lines: 'the lines', wall: 'the cell walls', labels: 'the labels', mag: 'the magnification' },
      focus: function (part) {
        var p = [].concat(part || [])[0];
        if (RINGS[p]) { cur = 'D'; ring = p; } else ring = null;
        paint();
      },
      stop: function () {}
    };
    paint();
    return api;
  }
  global.Views.add('drawing', make);

  /* the drawings, for a question to show beside its prompt: 'pencil#A', 'pencil#B', 'pencil#C', 'pencil#D' */
  global.CircLearn.diagram('pencil', function (v) { return /^[ABCD]$/.test(v) ? svgOf(v, '', 'dw-fig') : ''; });
})(window);
