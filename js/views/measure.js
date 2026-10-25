/* ============================================================
   views/measure.js — station 12's picture: a clear ruler on the slide at ×100, and the cells counted across 1 mm
   (25 Oct 2026, the method of Daniel's Year 9 sheet).

   The view down the microscope at ×100 (the ×10 objective lens): the pondweed leaf of js/views/pondweed.js, never
   onion (memory never-do-the-assessment), with a clear plastic ruler lying on the slide over one row of its cells.
   Drag the ruler (or use the arrows) until two millimetre marks sit on cell walls: a mark that comes within 10 µm of a
   wall settles on it. Then press each cell in the row between the two marks: the count is numbered on the cells.
   In that row (Pondweed.ROW) eight cells fill the millimetre from 0 to 1000 µm exactly; the ruler starts off it.
   The working (1000 µm ÷ the count) is written under the picture on the Learn tab only: on the Practise tab
   (html[data-lab-tab="do"]) it would answer the question.
   ============================================================ */
(function (global) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function f2(v) { return Math.round(v * 100) / 100; }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function make(spec, ctx) {
    /* the slide sits 500 µm to the left, so the millimetre from 0 to 1000 µm of the row fits in the 1.8 mm circle */
    var PW = global.Pondweed, MAG = 10, s = PW.scale(MAG), ROW = PW.ROW, walls = PW.ROWS[ROW], DX = -500;
    var y0 = PW.rowY(ROW) - PW.CELL.H / 2, y1 = y0 + PW.CELL.H;     /* the counted row, µm */
    var root = h('div', 'meas2');
    var box = h('div', 'meas2__box');
    root.appendChild(box);
    var bar = h('div', 'vbar meas2__bar',
      '<span class="meas2__k">Ruler</span>' +
      '<button type="button" class="suse__b" data-mv="-50" aria-label="Move the ruler left">◀◀</button>' +
      '<button type="button" class="suse__b" data-mv="-5" aria-label="Move the ruler a little left">◀</button>' +
      '<button type="button" class="suse__b" data-mv="5" aria-label="Move the ruler a little right">▶</button>' +
      '<button type="button" class="suse__b" data-mv="50" aria-label="Move the ruler right">▶▶</button>' +
      '<button type="button" class="vbtn meas2__undo">Undo the last cell</button><button type="button" class="vbtn meas2__again">↺ Count again</button>');
    root.appendChild(bar);
    var work = h('div', 'meas2__work'); work.setAttribute('aria-live', 'polite');
    root.appendChild(work);

    /* the ruler: x of its 0 mark, in µm on the slide (the view's middle is 0) */
    var rx = -430, picked = [];
    function X(x) { return 300 + (x + DX) * s; }
    function Y(y) { return 300 + y * s; }
    function marks() { var m = []; for (var k = -2; k <= 3; k++) m.push(rx + k * 1000); return m; }
    function onWall(x) { return walls.some(function (w) { return Math.abs(w - x) < 0.5; }); }
    function settle(near) {
      /* a mark close to a wall of the row settles on it: within 10 µm after a drag, within 3 µm after an arrow (the arrows
         move 5 µm, so they can always leave a wall again, and always reach one) */
      var best = null;
      marks().forEach(function (m) { walls.forEach(function (w) { var d = w - m; if (Math.abs(d) <= near && (best === null || Math.abs(d) < Math.abs(best))) best = d; }); });
      if (best !== null) rx += best;
    }
    function aligned() {
      /* two neighbouring marks, both on walls, both in view */
      var m = marks(), half = PW.FIELD[MAG] / 2 - 20;
      for (var i = 0; i + 1 < m.length; i++) if (onWall(m[i]) && onWall(m[i + 1]) && Math.abs(m[i] + DX) < half && Math.abs(m[i + 1] + DX) < half) return [m[i], m[i + 1]];
      return null;
    }
    function rulerSvg() {
      var top = Y(y0) - 2, bot = Y(y1 + 120), out = '';
      out += '<rect class="meas2__ruler" x="-40" y="' + f2(top) + '" width="680" height="' + f2(bot - top) + '"/>' +
        '<line class="meas2__edge" x1="-40" y1="' + f2(top) + '" x2="640" y2="' + f2(top) + '"/><line class="meas2__edge" x1="-40" y1="' + f2(bot) + '" x2="640" y2="' + f2(bot) + '"/>' +
        '<text class="meas2__name" x="300" y="' + f2(bot - 12) + '" text-anchor="middle">clear plastic ruler: drag it</text>';
      for (var k = -20; k <= 30; k++) {
        var x = X(rx + k * 100); if (x < -20 || x > 620) continue;
        var long = k % 10 === 0, mid = k % 5 === 0;
        if (!long) continue;                                  /* at ×100 the tenths are not on a ruler: only the mm marks show */
        out += '<rect class="meas2__mark" x="' + f2(x - 4) + '" y="' + f2(top) + '" width="8" height="' + f2(long ? (y1 - y0) * s + 26 : mid ? 18 : 12) + '"/>';
      }
      var a = aligned();
      if (a) {
        var ya = top - 16;
        out += '<path class="meas2__mm" d="M' + f2(X(a[0])) + ' ' + f2(ya + 8) + 'V' + f2(ya) + 'H' + f2(X(a[1])) + 'V' + f2(ya + 8) + '"/>' +
          '<text class="meas2__mmt" x="' + f2((X(a[0]) + X(a[1])) / 2) + '" y="' + f2(ya - 8) + '" text-anchor="middle">1 mm = 1000 µm</text>';
      }
      return '<g class="meas2__rg" data-drag="ruler">' + out + '</g>';
    }
    function pickSvg() {
      var out = '<rect class="meas2__row" x="' + f2(X(-3000)) + '" y="' + f2(Y(y0)) + '" width="' + f2(6000 * s) + '" height="' + f2((y1 - y0) * s) + '"/>';
      picked.slice().sort(function (a, b) { return a - b; }).forEach(function (cx, i) {
        out += '<circle class="meas__dot" cx="' + f2(X(cx)) + '" cy="' + f2(Y((y0 + y1) / 2)) + '" r="9"/>' +
          '<text class="meas2__n" x="' + f2(X(cx)) + '" y="' + f2(Y((y0 + y1) / 2) + 5) + '" text-anchor="middle">' + (i + 1) + '</text>';
      });
      return out;
    }
    function paint() {
      box.innerHTML = '<svg class="meas2__svg" viewBox="0 0 600 600" role="img" aria-label="A pondweed leaf at ×100, with a clear ruler on the slide. Drag the ruler, then press each cell in the row between two millimetre marks.">' +
        PW.view(MAG, { round: true, dx: DX, over: pickSvg() + rulerSvg() }) + '</svg>';
      var a = aligned(), n = picked.length;
      var lines = [];
      var one = marks().some(onWall);
      lines.push(a ? '<b>Two millimetre marks sit on cell walls.</b> Press each cell in the row between them.' :
        one ? 'One mark sits on a cell wall. Move the ruler on until the next mark sits on a wall too.' : 'Drag the ruler, or use the arrows, until two millimetre marks sit on cell walls.');
      lines.push('<span class="meas2__count"><b>' + n + '</b> cell' + (n === 1 ? '' : 's') + ' counted</span>');
      if (n && a) lines.push('<span class="meas2__eq">size of one cell = 1000 µm ÷ ' + n + ' = <b>' + (Math.round(1000 / n * 10) / 10) + ' µm</b></span>');
      work.innerHTML = lines.map(function (l) { return '<p>' + l + '</p>'; }).join('');
      bar.querySelector('.meas2__undo').disabled = bar.querySelector('.meas2__again').disabled = !n;
    }
    function pt(ev) { var svg = box.querySelector('svg'), p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
    var drag = null;
    box.addEventListener('pointerdown', function (ev) {
      var q = pt(ev), xs = (q.x - 300) / s - DX, ys = (q.y - 300) / s;
      if (ev.target.closest && ev.target.closest('[data-drag]') && !(ys >= y0 && ys <= y1)) {
        drag = { x: q.x, rx: rx }; try { box.setPointerCapture(ev.pointerId); } catch (e) {} ev.preventDefault(); return;
      }
      if (ys >= y0 && ys <= y1) {
        /* a press in the row: one cell, the one between the walls round the press */
        for (var i = 0; i + 1 < walls.length; i++) if (xs > walls[i] && xs < walls[i + 1]) {
          var mid = (walls[i] + walls[i + 1]) / 2, at = picked.indexOf(mid);
          if (at >= 0) picked.splice(at, 1); else picked.push(mid);
          paint(); return;
        }
      }
    });
    box.addEventListener('pointermove', function (ev) {
      if (!drag) return;
      var q = pt(ev); rx = Math.max(-1400, Math.min(1400, drag.rx + (q.x - drag.x) / s)); paint();
    });
    function end() { if (!drag) return; drag = null; settle(10); paint(); }
    box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
    Array.prototype.forEach.call(bar.querySelectorAll('[data-mv]'), function (b) {
      b.addEventListener('click', function () { rx += +b.getAttribute('data-mv'); settle(3); paint(); });
    });
    bar.querySelector('.meas2__undo').addEventListener('click', function () { picked.pop(); paint(); });
    bar.querySelector('.meas2__again').addEventListener('click', function () { picked = []; paint(); });

    var api = {
      el: root, say: 'A pondweed leaf at ×100, with a clear ruler on the slide over one row of cells',
      credit: 'Drawing: made for this lab · one millimetre between two marks of the ruler',
      labels: { ruler: 'the ruler on the slide', count: 'the cells across 1 mm' },
      focus: function () {}, stop: function () { drag = null; }
    };
    paint();
    return api;
  }
  global.Views.add('measure', make);
})(window);
