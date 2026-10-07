/* ============================================================
   views/measure.js — station 11's picture: measure a cell by counting across a known length.

   The method of the microscopy practical, on ANOTHER specimen (Daniel, 7 Oct 2026: never onion; "you can guide
   them, but not give them the answers"): the lining of a gland in the cervix, from the Foundations shelf's
   calibrated photograph (0.46 µm a pixel at 900 px), with a line exactly 0.1 mm long drawn across a row of cells. Press each
   cell the line crosses (each has one nucleus); the working builds beside it, from YOUR count: the size of one
   cell = the length of the line ÷ the number of cells, in mm and then in µm. Cells overlap, so counts differ a
   little from person to person, and the page says so: the method is the point, not one number.

   spec: { kind:'measure', img, iw, ih, crop:[x,y,w,h], line:[x0,y,x1], mm: 0.1, say, credit }
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
  function sig(x, n) { return String(+x.toPrecision(n)); }

  function make(spec, ctx) {
    var root = h('div', 'meas');
    var c = spec.crop, L = spec.line;
    var svg = el('svg', { class: 'meas__svg', viewBox: c.join(' '), role: 'img', 'aria-label': 'A row of tall cells lining a gland, with a line 0.1 mm long across them. Press each cell the line crosses.' });
    el('image', { href: 'assets/photos/' + spec.img, x: 0, y: 0, width: spec.iw, height: spec.ih, preserveAspectRatio: 'none' }, svg);
    var hit = el('rect', { x: L[0] - 6, y: L[1] - 34, width: L[2] - L[0] + 12, height: 68, class: 'meas__hit' }, svg);
    el('line', { x1: L[0], y1: L[1], x2: L[2], y2: L[1], class: 'meas__halo' }, svg);
    el('line', { x1: L[0], y1: L[1], x2: L[2], y2: L[1], class: 'meas__line' }, svg);
    [L[0], L[2]].forEach(function (x) { el('line', { x1: x, y1: L[1] - 9, x2: x, y2: L[1] + 9, class: 'meas__line' }, svg); });
    var lab = el('text', { x: (L[0] + L[2]) / 2, y: L[1] - 14, class: 'meas__lab', 'text-anchor': 'middle' }, svg); lab.textContent = spec.mm + ' mm';
    var dots = el('g', {}, svg);
    var row = h('div', 'vbar meas__bar');
    var undo = h('button', 'vbtn', '↶ Take back the last one'); undo.type = 'button';
    var again = h('button', 'vbtn', '↺ Count again'); again.type = 'button';
    row.appendChild(undo); row.appendChild(again);
    var work = h('div', 'meas__work'); work.setAttribute('aria-live', 'polite');
    root.appendChild(svg); root.appendChild(row); root.appendChild(work);

    var marks = [];
    function toUser(ev) {
      var p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY;
      return p.matrixTransform(svg.getScreenCTM().inverse());
    }
    hit.addEventListener('click', function (ev) {
      var q = toUser(ev); var x = Math.max(L[0], Math.min(L[2], q.x));
      if (marks.some(function (m) { return Math.abs(m - x) < 4; })) return;
      marks.push(x); paint();
    });
    undo.addEventListener('click', function () { marks.pop(); paint(); });
    again.addEventListener('click', function () { marks = []; paint(); });
    function paint() {
      dots.innerHTML = '';
      marks.slice().sort(function (a, b) { return a - b; }).forEach(function (x, i) {
        el('circle', { cx: x, cy: L[1], r: 7, class: 'meas__dot' }, dots);
        var t = el('text', { x: x, y: L[1] + 26, class: 'meas__n', 'text-anchor': 'middle' }, dots); t.textContent = i + 1;
      });
      var n = marks.length;
      undo.disabled = again.disabled = !n;
      if (!n) { work.innerHTML = '<p>Press each cell the line crosses: each one has one nucleus (the dark shape). Count along the whole line.</p>'; return; }
      var mm = spec.mm / n, um = mm * 1000;
      work.innerHTML = '<p><b>' + n + '</b> cell' + (n === 1 ? '' : 's') + ' across ' + spec.mm + ' mm</p>' +
        '<p class="meas__eq">size of one cell = length of the line ÷ number of cells<br>= ' + spec.mm + ' mm ÷ ' + n + ' = <b>' + sig(mm, 2) + ' mm</b> = <b>' + sig(um, 2) + ' µm</b></p>' +
        '<p class="meas__note">Cells overlap, so two people may count one or two differently. Use your own count, and show it in your working.</p>';
    }
    var api = { el: root, say: spec.say, credit: spec.credit, labels: {}, focus: function () {}, stop: function () {} };
    paint();
    return api;
  }
  global.Views.add('measure', make);
})(window);
