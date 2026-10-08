/* ============================================================
   views/magnify.js — station 3's picture: one cheek cell, many sizes.

   The cheek cell is the one a pupil makes on a slide in station 2 (Daliasalloum's photograph, methylene
   blue, CC BY 4.0; turned so that its length P–Q lies level, and cut out for this lab). A clear ruler lies
   along P–Q. The slider enlarges the PICTURE; the ruler does not change, because a millimetre is a
   millimetre. So the image size grows, the actual size stays the same, and the magnification, worked out
   live, grows with the image. Three buttons rearrange the formula for each of its three quantities.

   The ruler is drawn in the picture's own units (10 units = 1 mm on this ruler), so every screen, a
   phone or a laptop, reads the same length: the numbers a pupil reads off it are the numbers in the
   formula. Nothing here claims to be a measurement of this particular cell: a cheek cell is ABOUT
   0.06 mm long (spec.actual), and the view says so.

   spec: { kind:'magnify', img:'cheek-cell.jpg', w, h, P:[x,y], Q:[x,y], actual: 0.06, from: 24, to: 96, step: 3, start: 60 }
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
  /* a number as an exam answer writes it: no trailing zeros, no float noise */
  function num(x) { return String(+x.toPrecision(10)); }

  function make(spec, ctx) {
    var VW = 1260, VH = 840, PX = 80, PY = 400, RULER = 110;   /* ruler length in mm */
    /* a phone shows this drawing at about a quarter of its size: the ruler's words are drawn larger there (8 Oct 2026) */
    var NARROW = !!(global.matchMedia && global.matchMedia('(max-width: 620px)').matches);
    var len = Math.hypot(spec.Q[0] - spec.P[0], spec.Q[1] - spec.P[1]);
    var actual = spec.actual || 0.06;
    var L = spec.start || 60, find = 'mag';

    var root = h('div', 'mag');
    var svg = el('svg', { viewBox: '0 0 ' + VW + ' ' + VH, class: 'mag__svg', role: 'img',
      'aria-label': 'A cheek cell under the microscope, lying along the line P to Q, with a clear ruler laid along P to Q. The slider below makes the picture larger or smaller; the ruler stays the same.' });
    var pic = el('g', { class: 'mag__pic' }, svg);
    /* the photograph's edges fade into the page, so it reads as a view down the microscope, not a pasted card
       (8 Oct 2026 review) */
    var mid = 'mf' + Math.random().toString(36).slice(2, 7), defs = el('defs', {}, svg);
    var soft = el('filter', { id: mid + 'b', x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
    el('feGaussianBlur', { stdDeviation: (Math.min(spec.w, spec.h) * 0.03).toFixed(1) }, soft);
    var feather = el('mask', { id: mid, maskUnits: 'userSpaceOnUse', maskContentUnits: 'userSpaceOnUse', x: 0, y: 0, width: spec.w, height: spec.h }, defs);
    el('rect', { x: spec.w * 0.05, y: spec.h * 0.06, width: spec.w * 0.9, height: spec.h * 0.88, fill: '#fff', filter: 'url(#' + mid + 'b)' }, feather);
    var img = el('image', { href: 'assets/photos/' + spec.img, x: 0, y: 0, width: spec.w, height: spec.h, preserveAspectRatio: 'none', mask: 'url(#' + mid + ')' }, pic);
    var pq = el('g', { class: 'mag__pq' }, svg);
    var pqHalo = el('line', { class: 'mag__pqhalo' }, pq);
    var pqLine = el('line', { class: 'mag__pqline' }, pq);
    var tP = el('text', { class: 'mag__pt' }, pq); tP.textContent = 'P';
    var tQ = el('text', { class: 'mag__pt' }, pq); tQ.textContent = 'Q';

    /* the ruler: clear plastic, its top edge on P–Q, 0 at P */
    var ruler = el('g', { class: 'mag__ruler', transform: 'translate(' + PX + ',' + PY + ')' }, svg);
    el('rect', { x: -26, y: 0, width: RULER * 10 + 52, height: 92, rx: 6, class: 'mag__rbody' }, ruler);
    for (var mm = 0; mm <= RULER; mm++) {
      var tall = mm % 10 === 0 ? 30 : mm % 5 === 0 ? 21 : 13;
      el('line', { x1: mm * 10, y1: 0, x2: mm * 10, y2: tall, class: 'mag__tick' + (mm % 10 === 0 ? ' mag__tick--cm' : '') }, ruler);
      /* a phone: a number every 20 mm, or the numbers touch */
      if (mm % 10 === 0 && (!NARROW || mm % 20 === 0)) { var t = el('text', { x: mm * 10, y: NARROW ? 82 : 58, class: 'mag__rnum' }, ruler); t.textContent = mm; }
    }
    var mmLab = el('text', { x: RULER * 10 + 4, y: NARROW ? 40 : 84, class: 'mag__runit' }, ruler); mmLab.textContent = 'mm';   /* a phone: above the end of the ruler, clear of its last number */
    var span = el('rect', { x: 0, y: 0, width: 0, height: 8, class: 'mag__span' }, ruler);

    root.appendChild(svg);

    /* the slider and the sums */
    var row = h('div', 'mag__row');
    var lab = h('label', 'mag__sl', '<span class="mag__slh">Enlarge the picture</span>');
    var range = document.createElement('input');
    range.type = 'range'; range.min = spec.from || 24; range.max = spec.to || 96; range.step = spec.step || 3; range.value = L;
    range.className = 'mag__in'; range.setAttribute('aria-label', 'Enlarge the picture');
    lab.appendChild(range);
    row.appendChild(lab);
    root.appendChild(row);

    var sums = h('div', 'mag__sums');
    var rows = {
      image: h('button', 'mag__q', ''), actual: h('button', 'mag__q', ''), mag: h('button', 'mag__q', '')
    };
    Object.keys(rows).forEach(function (k) { rows[k].type = 'button'; rows[k].setAttribute('data-part', k); rows[k].addEventListener('click', function () { ctx.pick(k); }); sums.appendChild(rows[k]); });
    root.appendChild(sums);

    var findRow = h('div', 'mag__find', '<span class="mag__findh">Calculate</span>');
    findRow.setAttribute('role', 'group'); findRow.setAttribute('aria-label', 'Rearrange the formula to calculate one quantity');
    var FIND = [['mag', 'the magnification'], ['actual', 'the actual size'], ['image', 'the image size']];
    var findBtns = FIND.map(function (f) {
      var b = h('button', 'mag__fb', f[1]); b.type = 'button';
      b.addEventListener('click', function () { find = f[0]; paint(); });
      findRow.appendChild(b);
      return b;
    });
    root.appendChild(findRow);
    var work = h('p', 'mag__work');
    work.setAttribute('aria-live', 'polite');
    root.appendChild(work);

    /* the box lit is always the quantity being calculated (8 Oct 2026 review: the pills and the boxes disagreed) */
    function paint() {
      var k = L * 10 / len;                                   /* picture units per photo pixel */
      var ox = PX - spec.P[0] * k, oy = PY - spec.P[1] * k;    /* P stays at the ruler's 0 */
      pic.setAttribute('transform', 'translate(' + ox.toFixed(2) + ',' + oy.toFixed(2) + ') scale(' + k.toFixed(4) + ')');
      var qx = PX + L * 10;
      [pqHalo, pqLine].forEach(function (ln) { ln.setAttribute('x1', PX); ln.setAttribute('y1', PY); ln.setAttribute('x2', qx); ln.setAttribute('y2', PY); });
      tP.setAttribute('x', PX - 34); tP.setAttribute('y', PY - 14);
      tQ.setAttribute('x', qx + 12); tQ.setAttribute('y', PY - 14);
      span.setAttribute('width', L * 10);
      var m = L / actual;
      rows.image.innerHTML = '<span class="mag__k">Image size</span><span class="mag__v"><span class="mag__w">P to Q on the ruler: </span><b>' + L + ' mm</b></span>';
      rows.actual.innerHTML = '<span class="mag__k">Actual size</span><span class="mag__v"><span class="mag__w">a cheek cell is about </span><b>' + num(actual) + ' mm</b><span class="mag__w"> long</span></span>';
      rows.mag.innerHTML = '<span class="mag__k">Magnification</span><span class="mag__v"><b>×' + num(m) + '</b></span>';
      Object.keys(rows).forEach(function (r) { rows[r].classList.toggle('is-lit', find === r); });
      findBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', FIND[i][0] === find ? 'true' : 'false'); });
      var w;
      if (find === 'mag') w = 'magnification = image size ÷ actual size<br>= ' + L + ' mm ÷ ' + num(actual) + ' mm = <b>×' + num(m) + '</b> <span class="mag__note">(mm ÷ mm: the units cancel, so a magnification has no unit)</span>';
      else if (find === 'actual') w = 'actual size = image size ÷ magnification<br>= ' + L + ' mm ÷ ' + num(m) + ' = <b>' + num(actual) + ' mm</b>';
      else w = 'image size = actual size × magnification<br>= ' + num(actual) + ' mm × ' + num(m) + ' = <b>' + L + ' mm</b>';
      work.innerHTML = w;
      span.classList.toggle('is-lit', find === 'image');
    }
    range.addEventListener('input', function () { L = +range.value; paint(); });

    var api = {
      el: root,
      say: 'One cheek cell, and a clear ruler laid along it from P to Q',
      credit: 'Photograph: Daliasalloum, Wikimedia Commons, CC BY 4.0 (turned and cut out for this lab)',
      labels: { image: 'the image size', actual: 'the actual size', mag: 'the magnification' },
      focus: function (part) { if (rows[part]) find = part; paint(); },
      stop: function () {}
    };
    paint();
    return api;
  }

  global.Views.add('magnify', make);
})(window);
