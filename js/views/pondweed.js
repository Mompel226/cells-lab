/* ============================================================
   views/pondweed.js — the specimen of the lab's microscope stations: a leaf of Canadian pondweed (Elodea), drawn
   for this lab (25 Oct 2026), never onion (memory never-do-the-assessment).

   One leaf, in micrometres: 1.9 mm wide, its long cells in rows along it, 125 µm long and 40 µm wide (eight in each
   millimetre of a row), with chloroplasts along their walls; a midrib of narrower cells down the middle; a margin of
   small teeth. Seen through a ×10 eyepiece the circle of view is 4.5 mm across with the ×4 objective, 1.8 mm with the
   ×10 and 0.45 mm with the ×40, so the same leaf is drawn at three scales and every length on it is true.

   Pondweed.field(mag, o) returns the inside of a round field of view, 600 × 600 units: o.dx, o.dy (µm) move the
   slide; o.blur blurs it (out of focus). Pondweed.FIELD gives each field's width in µm, Pondweed.ROW the row of cells
   the Measuring station counts along, and Pondweed.CELL a cell's size.
   ============================================================ */
(function (global) {
  'use strict';
  function f2(v) { return Math.round(v * 100) / 100; }
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  var CELL = { L: 125, H: 40 };            /* µm: one leaf cell */
  var LEAF = { half: 950, mid: 1 };        /* µm: half the leaf's width; the midrib is the 3 rows in the middle */
  var FIELD = { 4: 4500, 10: 1800, 40: 450 };
  var R = 282;                              /* the circle of light, in the field's units */
  /* the row the Measuring station counts along: row 6, below the midrib, where a cell wall stands at x = 0 µm, so
     eight cells fill the millimetre from 0 to 1000 µm exactly (their lengths differ a little, as real cells do) */
  var ROW = 6;
  var ROWS = {};                            /* row index → the x of each wall in it (µm), from −3000 to +3000 */
  (function build() {
    var r = rng(29);
    for (var k = -26; k <= 26; k++) {
      var walls = [], mid = Math.abs(k) <= LEAF.mid, L = mid ? 170 : CELL.L;
      if (k === ROW) {
        /* eight cells across the millimetre, each within 12 µm of 125, summing to 1000 */
        var lens = [118, 131, 124, 129, 120, 127, 122, 129];
        var x = 0; walls.push(0);
        lens.forEach(function (l) { x += l; walls.push(x); });
        for (x = 0; x > -3200;) { x -= L * (0.9 + r() * 0.2); walls.unshift(Math.round(x)); }
        for (x = 1000; x < 3200;) { x += L * (0.9 + r() * 0.2); walls.push(Math.round(x)); }
      } else {
        var x0 = -3200 + r() * L;
        for (var x2 = x0; x2 < 3200; x2 += L * (0.86 + r() * 0.28)) walls.push(Math.round(x2));
      }
      ROWS[k] = walls;
    }
  })();
  function rowY(k) { return k * CELL.H; }           /* the middle of row k, µm (rows along the leaf, which lies across the view) */
  function edgeAt(x, side) {                         /* the leaf's margin, with a small tooth every 160 µm */
    var t = ((x % 160) + 160) % 160;
    var tooth = t < 40 ? t / 40 * 14 : t < 56 ? 14 * (1 - (t - 40) / 16) : 0;
    return side * (LEAF.half + tooth);
  }

  /* the inside of a field of view, 600 × 600 units, the slide moved by o.dx, o.dy µm (kept: each view is drawn once) */
  var KEPT = {};
  function field(mag, o) {
    o = o || {};
    var key = mag + ':' + (o.dx || 0) + ':' + (o.dy || 0);
    if (!KEPT[key]) KEPT[key] = drawField(mag, o);
    return KEPT[key];
  }
  function drawField(mag, o) {
    var s = (2 * R) / FIELD[mag], dx = o.dx || 0, dy = o.dy || 0;
    var X = function (x) { return 300 + (x + dx) * s; }, Y = function (y) { return 300 + (y + dy) * s; };
    var half = FIELD[mag] / 2 + 200;                  /* µm that can show, with room for a cell that pokes in */
    var lo = -half - dx, hi = half - dx, out = '';
    var walls = '', fills = '', chl = '', nucs = '';
    var kLo = Math.max(-26, Math.floor((-half - dy) / CELL.H) - 1), kHi = Math.min(26, Math.ceil((half - dy) / CELL.H) + 1);
    var r = rng(7 + mag);
    /* the leaf blade: one pale green shape, its toothed margins drawn as one path each side */
    var T = [], B = [];
    for (var x = lo - 40; x <= hi + 40; x += mag === 40 ? 4 : 10) {
      T.push(f2(X(x)) + ' ' + f2(Y(edgeAt(x, -1))));
      B.push(f2(X(x)) + ' ' + f2(Y(edgeAt(x, 1))));
    }
    var top = 'M' + T.join('L'), bot = 'M' + B.join('L');
    out += '<path class="pw-blade" d="M' + T.join('L') + 'L' + B.slice().reverse().join('L') + 'Z"/>';
    for (var k = kLo; k <= kHi; k++) {
      var y0 = rowY(k) - CELL.H / 2, y1 = y0 + CELL.H, mid = Math.abs(k) <= LEAF.mid;
      if (Math.abs(y0) > LEAF.half || Math.abs(y1) > LEAF.half + 4) continue;
      var w = ROWS[k];
      /* the row's two long walls */
      walls += 'M' + f2(X(lo)) + ' ' + f2(Y(y0)) + 'H' + f2(X(hi)) + 'M' + f2(X(lo)) + ' ' + f2(Y(y1)) + 'H' + f2(X(hi));
      for (var i = 0; i < w.length; i++) {
        if (w[i] < lo - 200 || w[i] > hi + 200) continue;
        walls += 'M' + f2(X(w[i])) + ' ' + f2(Y(y0)) + 'V' + f2(Y(y1));
        var nx = w[i + 1]; if (nx == null) continue;
        if (mag === 4) continue;
        /* the chloroplasts: small ovals along both long walls, and a few along the cross walls */
        var a = w[i] + 4, b = nx - 4, cl = 6.4, ch = 3.8;
        if (mag === 10) {
          /* at ×100 they are dots too small to draw one by one: a dashed line inside each long wall */
          chl += 'M' + f2(X(a)) + ' ' + f2(Y(y0 + 4)) + 'H' + f2(X(b)) + 'M' + f2(X(a)) + ' ' + f2(Y(y1 - 4)) + 'H' + f2(X(b));
        } else {
          for (var c = a + 2 + r() * 4; c < b - 3; c += 7 + r() * 3) {
            chl += '<ellipse cx="' + f2(X(c)) + '" cy="' + f2(Y(y0 + 4 + r() * 2.5)) + '" rx="' + f2(cl / 2 * s) + '" ry="' + f2(ch / 2 * s) + '"/>';
            chl += '<ellipse cx="' + f2(X(c + 3)) + '" cy="' + f2(Y(y1 - 4 - r() * 2.5)) + '" rx="' + f2(cl / 2 * s) + '" ry="' + f2(ch / 2 * s) + '"/>';
          }
          if (r() < 0.35) nucs += '<ellipse class="pw-nuc" cx="' + f2(X((a + b) / 2 + (r() - 0.5) * 40)) + '" cy="' + f2(Y(rowY(k) + (r() - 0.5) * 10)) + '" rx="' + f2(7 * s) + '" ry="' + f2(5.5 * s) + '"/>';
        }
      }
      if (mid) fills += '<rect class="pw-mid" x="' + f2(X(lo)) + '" y="' + f2(Y(y0)) + '" width="' + f2((hi - lo) * s) + '" height="' + f2(CELL.H * s) + '"/>';
    }
    out += fills;
    out += '<path class="pw-wall pw-wall--' + mag + '" d="' + walls + '"/>';
    if (mag === 10) out += '<path class="pw-chl10" d="' + chl + '" stroke-width="' + f2(3.4 * s) + '"/>';
    else if (mag === 40) out += '<g class="pw-chl">' + chl + '</g>' + nucs;
    var edges = '<path class="pw-edge" d="' + top + '"/><path class="pw-edge" d="' + bot + '"/>';
    return '<g class="pw">' + out + edges + '</g>';
  }

  /* the whole round view: the dark of the eyepiece, the circle of light, the leaf, and a soft edge */
  var uidN = 0;
  function view(mag, o) {
    o = o || {};
    var id = 'pw' + (++uidN) + Math.random().toString(36).slice(2, 5);
    var blur = Math.max(0, Math.min(14, o.blur || 0));
    return '<defs><clipPath id="' + id + 'c"><circle cx="300" cy="300" r="' + R + '"/></clipPath>' +
      '<radialGradient id="' + id + 'l" cx="50%" cy="46%" r="58%"><stop offset="0" stop-color="#FFFEF8"/><stop offset=".72" stop-color="#F4F3EA"/><stop offset="1" stop-color="#DCDACB"/></radialGradient>' +
      '<radialGradient id="' + id + 'v" cx="50%" cy="50%" r="50%"><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></radialGradient>' +
      (blur ? '<filter id="' + id + 'b" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="' + f2(blur) + '"/></filter>' : '') + '</defs>' +
      (o.round ? '<circle cx="300" cy="300" r="' + (R + 10) + '" class="pw-dark"/>' : '<rect width="600" height="600" class="pw-dark"/>') +
      '<g clip-path="url(#' + id + 'c)"><circle cx="300" cy="300" r="' + R + '" fill="url(#' + id + 'l)"/>' +
      '<g class="pw-spec"' + (blur ? ' filter="url(#' + id + 'b)"' : '') + '>' + field(mag, o) + '</g>' + (o.over || '') +
      '<circle cx="300" cy="300" r="' + R + '" fill="url(#' + id + 'v)" pointer-events="none"/></g>' +
      '<circle cx="300" cy="300" r="' + R + '" class="pw-rim" pointer-events="none"/>';
  }

  global.Pondweed = { field: field, view: view, FIELD: FIELD, ROW: ROW, ROWS: ROWS, CELL: CELL, LEAF: LEAF, R: R, rowY: rowY,
                      scale: function (mag) { return (2 * R) / FIELD[mag]; } };
})(window);
