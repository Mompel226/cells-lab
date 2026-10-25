/* ============================================================
   views/magnify.js — station 4's picture: one cheek cell, many sizes.

   The cheek cell is one of those stained in station 3's photograph (Daliasalloum's photograph, methylene
   blue, CC BY 4.0; turned so that its length P–Q lies level, and cut out for this lab). A clear ruler lies
   along P–Q. The slider enlarges the PICTURE; the ruler does not change, because a millimetre is a
   millimetre. So the image size grows, the actual size stays the same, and the magnification, worked out
   live, grows with the image. Three buttons rearrange the formula for each of its three quantities.

   The ruler is drawn in the picture's own units (10 units = 1 mm on this ruler), so every screen, a
   phone or a laptop, reads the same length: the numbers a pupil reads off it are the numbers in the
   formula. Nothing here claims to be a measurement of this particular cell: a cheek cell is ABOUT
   0.06 mm long (spec.actual), and the view says so.

   spec: { kind:'magnify', img:'cheek-cell.jpg', w, h, P:[x,y], Q:[x,y], actual: 0.06, from: 24, to: 96, step: 3, start: 60, card }

   spec.card (25 Oct 2026, the Year 9 practice): a second picture, "Measure a micrograph", the Year 12 microscopy
   practical's printed page (practicals/A22-microscopy-skills-pract/js/scope.js, ported here): Figure 1, a Paramecium
   88 mm long with a 50 µm scale bar 20 mm long (so ×400 and 220 µm), and a clear ruler to drag, or to move and turn
   with the buttons. The page is drawn 4 units to the millimetre, so what the ruler reads is what the questions expect.
   Nothing is calculated on it: the questions ask for that.
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

  /* ---------- the printed micrograph (from the Year 12 practical's js/scope.js) ---------- */
  var MM = 4, PARA = { cx: 300, cy: 250, L: 88 * MM, W: 29 * MM, bar: 20 * MM };
  function f2(x) { return (Math.round(x * 100) / 100).toString(); }
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function pathOf(pts) { return 'M' + pts.map(function (p) { return f2(p[0]) + ' ' + f2(p[1]); }).join(' L') + ' Z'; }
  function paramecium() {
    var cx = PARA.cx, cy = PARA.cy, L = PARA.L, W = PARA.W, P = [], k;
    for (k = 0; k < 180; k++) {
      var t = 2 * Math.PI * k / 180, c = Math.cos(t), sn = Math.sin(t);
      var y = (W / 2) * sn * (1 + 0.16 * c) * (1 - 0.1 * Math.abs(sn));
      if (sn > 0) y -= 16 * Math.exp(-Math.pow((c + 0.05) / 0.28, 2));      /* the oral groove */
      P.push([cx + (L / 2) * c, cy + y]);
    }
    var r = rng(4), g = '', cil = '';
    P.forEach(function (p, i) { if (i % 2) return; var q = P[(i + 1) % P.length], dx = q[0] - p[0], dy = q[1] - p[1], m = Math.hypot(dx, dy) || 1; cil += 'M' + f2(p[0]) + ' ' + f2(p[1]) + 'l' + f2(dy / m * 7) + ' ' + f2(-dx / m * 7); });
    g += '<path class="pm__cil" d="' + cil + '"/><path class="pm" d="' + pathOf(P) + '"/>';
    for (k = 0; k < 70; k++) { var x = cx + (r() - 0.5) * L * 0.86, yy = cy + (r() - 0.5) * W * 0.62; if (Math.pow((x - cx) / (L / 2), 2) + Math.pow((yy - cy) / (W / 2), 2) < 0.7) g += '<circle class="pm__gr" cx="' + f2(x) + '" cy="' + f2(yy) + '" r="' + f2(1 + r() * 1.6) + '"/>'; }
    [[-60, -10, 10], [-20, 22, 8], [30, -16, 9], [70, 12, 7], [100, -6, 6], [-95, 14, 7]].forEach(function (v) { g += '<circle class="pm__fv" cx="' + (cx + v[0]) + '" cy="' + (cy + v[1]) + '" r="' + v[2] + '"/>'; });
    g += '<ellipse class="pm__mn" cx="' + (cx + 4) + '" cy="' + (cy - 4) + '" rx="34" ry="21" transform="rotate(-8 ' + (cx + 4) + ' ' + (cy - 4) + ')"/><circle class="pm__mi" cx="' + (cx + 42) + '" cy="' + (cy + 8) + '" r="5"/>';
    [[cx + 118, cy - 14], [cx - 124, cy - 10]].forEach(function (v) {
      var rays = '', x0 = v[0], y0 = v[1];
      for (var q = 0; q < 7; q++) { var a2 = 2 * Math.PI * q / 7; rays += 'M' + f2(x0 + 8 * Math.cos(a2)) + ' ' + f2(y0 + 8 * Math.sin(a2)) + 'l' + f2(13 * Math.cos(a2)) + ' ' + f2(13 * Math.sin(a2)); }
      g += '<path class="pm__cv" d="' + rays + '"/><circle class="pm__cvc" cx="' + x0 + '" cy="' + y0 + '" r="8"/>';
    });
    return g + '<path class="pm__og" d="M' + (cx + 70) + ' ' + (cy + 30) + ' Q' + (cx + 20) + ' ' + (cy + 46) + ' ' + (cx - 30) + ' ' + (cy + 26) + '"/>';
  }
  function rulerG(st) {
    var len = 120, wid = 16, t = '', n = '', ox = 10;   /* the 0 mark sits 10 units (2.5 mm) in from the ruler's end, as on a real ruler */
    for (var mm = 0; mm <= len; mm++) {
      var x = mm * MM, l = mm % 10 === 0 ? 15 : mm % 5 === 0 ? 10 : 6;
      t += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + l + '"/>';
      if (mm % 10 === 0) n += '<text x="' + x + '" y="27">' + (mm / 10) + '</text>';
    }
    return '<g class="mc-ruler" data-drag="ruler" transform="translate(' + f2(st.rx) + ' ' + f2(st.ry) + ') rotate(' + st.rot + ')">' +
      '<rect x="' + (-ox) + '" y="-2" width="' + (len * MM + 2 * ox) + '" height="' + (wid * MM) + '" rx="4"/>' + t + n +
      '<text class="mc-ruler__u" x="' + (len * MM - 2) + '" y="' + (wid * MM - 12) + '">cm</text></g>';
  }
  function cardSvg(st) {
    var x = 18, y = 40, w = 564, hh = 452, bx = 406, by = 418;
    return '<rect width="600" height="600" class="mc-desk"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" class="mc-paper"/>' +
      '<text class="mc-t" x="' + (x + 18) + '" y="' + (y + 30) + '">Figure 1</text>' +
      '<rect x="' + (x + 18) + '" y="' + (y + 44) + '" width="' + (w - 36) + '" height="' + (hh - 98) + '" class="mc-mg"/>' +
      '<g>' + paramecium() + '</g>' +
      '<rect x="' + bx + '" y="' + by + '" width="' + PARA.bar + '" height="6" class="mc-sbar"/><text class="mc-sbar__t" x="' + (bx + PARA.bar / 2) + '" y="' + (by - 8) + '">50 µm</text>' +
      '<text class="mc-s" x="' + (x + 18) + '" y="' + (y + hh - 22) + '">A single-celled organism, Paramecium, seen with a light microscope.</text>' +
      rulerG(st);
  }

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

    /* the second picture: a printed micrograph and a ruler (spec.card) */
    var mode = 'cell', card = null, cst = { rx: 40, ry: 520, rot: 0 }, csvg = null, cctl = null;
    var modes = null;
    if (spec.card) {
      modes = h('div', 'mag__modes');
      modes.setAttribute('role', 'group'); modes.setAttribute('aria-label', 'Choose a picture');
      [['cell', 'Enlarge a cell'], ['card', 'Measure a micrograph']].forEach(function (m) {
        var b = h('button', 'cellv__mode', m[1]); b.type = 'button'; b.setAttribute('data-mode', m[0]);
        b.addEventListener('click', function () { setMode(m[0]); });
        modes.appendChild(b);
      });
      root.insertBefore(modes, root.firstChild);
      card = h('div', 'mc');
      card.innerHTML = '<div class="mc__box"><svg class="mc__svg" viewBox="0 0 600 600" role="img" aria-label="Figure 1, a micrograph of a Paramecium with a 50 µm scale bar, printed as on an exam page, and a clear ruler in millimetres that you can drag."></svg></div>' +
        '<div class="vbar mc__ctl"><span class="mc__k">Ruler</span>' +
        '<button type="button" class="suse__b" data-rx="-1" aria-label="Move the ruler 1 mm to the left">◀</button>' +
        '<button type="button" class="suse__b" data-rx="1" aria-label="Move the ruler 1 mm to the right">▶</button>' +
        '<button type="button" class="suse__b" data-ry="-1" aria-label="Move the ruler 1 mm up">▲</button>' +
        '<button type="button" class="suse__b" data-ry="1" aria-label="Move the ruler 1 mm down">▼</button>' +
        '<button type="button" class="suse__b mc__turn">Turn 90°</button></div>' +
        '<p class="mc__say">Drag the ruler onto what you measure. Read from its 0 mark: 10 small divisions are 1 cm, so each small division is 1 mm.</p>';
      root.appendChild(card);
      csvg = card.querySelector('svg'); cctl = card.querySelector('.mc__ctl');
      var drawCard = function () { csvg.innerHTML = cardSvg(cst); };
      var cpt = function (ev) { var p = csvg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(csvg.getScreenCTM().inverse()); };
      var cdrag = null;
      csvg.addEventListener('pointerdown', function (ev) {
        var t = ev.target.closest ? ev.target.closest('[data-drag]') : null; if (!t) return;
        cdrag = { p: cpt(ev), rx: cst.rx, ry: cst.ry }; try { csvg.setPointerCapture(ev.pointerId); } catch (e) {} ev.preventDefault();
      });
      csvg.addEventListener('pointermove', function (ev) {
        if (!cdrag) return; var q = cpt(ev);
        cst.rx = Math.max(-300, Math.min(580, cdrag.rx + q.x - cdrag.p.x)); cst.ry = Math.max(-60, Math.min(600, cdrag.ry + q.y - cdrag.p.y)); drawCard();
      });
      var cend = function () { cdrag = null; };
      csvg.addEventListener('pointerup', cend); csvg.addEventListener('pointercancel', cend);
      Array.prototype.forEach.call(cctl.querySelectorAll('[data-rx],[data-ry]'), function (b) {
        b.addEventListener('click', function () { cst.rx += (+b.getAttribute('data-rx') || 0) * MM; cst.ry += (+b.getAttribute('data-ry') || 0) * MM; drawCard(); });
      });
      cctl.querySelector('.mc__turn').addEventListener('click', function () { cst.rot = cst.rot ? 0 : 90; drawCard(); });
      drawCard();
    }
    function setMode(m) {
      mode = m;
      if (!card) return;
      root.classList.toggle('is-card', m === 'card');   /* css/cells.css shows one picture or the other */
      Array.prototype.forEach.call(modes.children, function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-mode') === m ? 'true' : 'false'); });
      api.say = m === 'card' ? 'A micrograph as printed on an exam page, and a clear ruler in millimetres' : 'One cheek cell, and a clear ruler laid along it from P to Q';
      api.credit = m === 'card' ? 'Drawing: made for the Year 12 microscopy practical, a Paramecium' : 'Photograph: Daliasalloum, Wikimedia Commons, CC BY 4.0 (turned and cut out for this lab)';
      ctx.caption();
    }

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
      labels: { image: 'the image size', actual: 'the actual size', mag: 'the magnification', bar: 'the scale bar' },
      focus: function (part) {
        var p = [].concat(part || [])[0];
        if (p === 'bar') { setMode('card'); return; }
        if (p && rows[p]) { if (mode !== 'cell') setMode('cell'); find = p; }
        paint();
      },
      stop: function () {}
    };
    paint();
    if (modes) setMode('cell');
    return api;
  }

  global.Views.add('magnify', make);
})(window);
