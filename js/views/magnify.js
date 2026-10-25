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

   spec.card (25 Oct 2026, the Year 9 practice): a second picture, "Measure a micrograph", a printed page first drawn
   for the Year 12 microscopy practical (practicals/A22-microscopy-skills-pract/js/scope.js): Figure 1, a Paramecium
   88 mm long with a 50 µm scale bar 20 mm long (so ×400 and 220 µm), and a clear ruler to drag and turn. The page is
   drawn 4 units to the millimetre, so what the ruler reads is what the questions expect. Nothing is calculated on it:
   the questions ask for that.
   The same evening (Daniel: "ask features in the cell, structures in the cell that cannot be measured with just 90
   degrees or 0 degrees"): the Paramecium lies at an angle and its large nucleus at another, so each length needs the
   ruler turned its own way; the ruler turns freely about its 0 mark (its round handle, or ↺ ↻ a degree at a time) and
   the buttons repeat while held. tools/measure-check.mjs measures what is drawn here against the master's answers.
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

  /* ---------- the printed micrograph (first drawn for the Year 12 practical's js/scope.js) ---------- */
  /* turn: the body's angle on the page; nuc: the large nucleus's angle, turned from the body. What the ruler should read:
     the bar 20 mm; the body 88 mm long and 25.5 mm wide at its widest (not 29 mm: the oral groove and the tapering
     narrow it); the large nucleus 17 mm long (rx 34). Along the body the nucleus reads about 15 mm, level about 12 mm. */
  var MM = 4, PARA = { cx: 300, cy: 246, L: 88 * MM, W: 29 * MM, bar: 20 * MM, turn: -27, nuc: -23 };
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
    /* food vacuoles clear of the nucleus, its two ends and the label line */
    [[-60, -10, 10], [52, 14, 8], [88, 14, 6], [-30, -36, 7], [-95, 14, 7], [60, -28, 7]].forEach(function (v) { g += '<circle class="pm__fv" cx="' + (cx + v[0]) + '" cy="' + (cy + v[1]) + '" r="' + v[2] + '"/>'; });
    /* the large nucleus, turned from the body, and the small nucleus in its side, where it adds nothing to the length */
    var nx = cx + 4, ny = cy - 4, na = PARA.nuc * Math.PI / 180;
    g += '<ellipse class="pm__mn" data-m="nucleus" cx="' + nx + '" cy="' + ny + '" rx="34" ry="21" transform="rotate(' + PARA.nuc + ' ' + nx + ' ' + ny + ')"/>' +
      '<circle class="pm__mi" cx="' + f2(nx + 6 * Math.cos(na) - 25 * Math.sin(na)) + '" cy="' + f2(ny + 6 * Math.sin(na) + 25 * Math.cos(na)) + '" r="5"/>';
    [[cx + 118, cy - 14], [cx - 124, cy - 10]].forEach(function (v) {
      var rays = '', x0 = v[0], y0 = v[1];
      for (var q = 0; q < 7; q++) { var a2 = 2 * Math.PI * q / 7; rays += 'M' + f2(x0 + 8 * Math.cos(a2)) + ' ' + f2(y0 + 8 * Math.sin(a2)) + 'l' + f2(13 * Math.cos(a2)) + ' ' + f2(13 * Math.sin(a2)); }
      g += '<path class="pm__cv" d="' + rays + '"/><circle class="pm__cvc" cx="' + x0 + '" cy="' + y0 + '" r="8"/>';
    });
    g += '<path class="pm__og" d="M' + (cx + 70) + ' ' + (cy + 30) + ' Q' + (cx + 20) + ' ' + (cy + 46) + ' ' + (cx - 30) + ' ' + (cy + 26) + '"/>';
    /* the label: a level line from the left that ends ON the nucleus, at the side of it (memory label-lines-never-cross) */
    var tb = PARA.turn * Math.PI / 180, px = cx + 4 * Math.cos(tb) + 4 * Math.sin(tb), py = cy + 4 * Math.sin(tb) - 4 * Math.cos(tb);
    var ta = (PARA.turn + PARA.nuc) * Math.PI / 180, half = 1 / Math.sqrt(Math.pow(Math.cos(ta) / 34, 2) + Math.pow(Math.sin(ta) / 21, 2));
    return '<g data-m="body" transform="rotate(' + PARA.turn + ' ' + cx + ' ' + cy + ')">' + g + '</g>' +
      '<path class="mc-ll" d="M152 ' + f2(py) + ' H' + f2(px - half + 1) + '"/><text class="mc-l" x="148" y="' + f2(py + 4) + '">large nucleus</text>';
  }
  function rulerG(st) {
    var len = 120, wid = 16, t = '', n = '', ox = 10;   /* the 0 mark sits 10 units (2.5 mm) in from the ruler's end, as on a real ruler */
    for (var mm = 0; mm <= len; mm++) {
      var x = mm * MM, l = mm % 10 === 0 ? 15 : mm % 5 === 0 ? 10 : 6;
      t += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + l + '"/>';
      if (mm % 10 === 0) n += '<text x="' + x + '" y="27">' + (mm / 10) + '</text>';
    }
    /* the round handle turns the ruler about its 0 mark; it sits under the 7 cm mark, so it stays on the page */
    var hx = 70 * MM, hy = 45, hr = 8;
    return '<g class="mc-ruler" transform="translate(' + f2(st.rx) + ' ' + f2(st.ry) + ') rotate(' + f2(st.rot) + ')">' +
      '<g data-drag="ruler"><rect x="' + (-ox) + '" y="-2" width="' + (len * MM + 2 * ox) + '" height="' + (wid * MM) + '" rx="4"/>' + t + n +
      '<text class="mc-ruler__u" x="' + (len * MM - 2) + '" y="' + (wid * MM - 12) + '">cm</text></g>' +
      '<g class="mc-turn" data-drag="turn"><circle class="mc-turn__hit" cx="' + hx + '" cy="' + hy + '" r="32"/><circle class="mc-turn__c" cx="' + hx + '" cy="' + hy + '" r="16"/>' +
      '<path class="mc-turn__a" d="M' + (hx - hr) + ' ' + hy + ' A' + hr + ' ' + hr + ' 0 1 1 ' + hx + ' ' + (hy + hr) + '"/>' +
      '<path class="mc-turn__h" d="M' + (hx - 4.5) + ' ' + (hy + hr) + ' L' + (hx + 1) + ' ' + (hy + hr - 4) + ' L' + (hx + 1) + ' ' + (hy + hr + 4) + ' Z M' + (hx - hr) + ' ' + (hy + 4.5) + ' L' + (hx - hr - 4) + ' ' + (hy - 1) + ' L' + (hx - hr + 4) + ' ' + (hy - 1) + ' Z"/></g></g>';
  }
  /* an angle kept between -180 and 180, to a tenth of a degree */
  function norm(a) { a = a % 360; if (a > 180) a -= 360; if (a <= -180) a += 360; return Math.round(a * 10) / 10; }
  function cardSvg(st) {
    /* the paper reaches below the caption, so the clear ruler starts on white paper in the dark version too */
    var x = 18, y = 40, w = 564, hh = 544, mh = 354, bx = 406, by = 418;
    return '<rect width="600" height="600" class="mc-desk"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" class="mc-paper"/>' +
      '<text class="mc-t" x="' + (x + 18) + '" y="' + (y + 30) + '">Figure 1</text>' +
      '<rect x="' + (x + 18) + '" y="' + (y + 44) + '" width="' + (w - 36) + '" height="' + mh + '" class="mc-mg"/>' +
      '<g>' + paramecium() + '</g>' +
      '<rect x="' + bx + '" y="' + by + '" width="' + PARA.bar + '" height="6" class="mc-sbar"/><text class="mc-sbar__t" x="' + (bx + PARA.bar / 2) + '" y="' + (by - 8) + '">50 µm</text>' +
      '<text class="mc-s" x="' + (x + 18) + '" y="' + (y + 44 + mh + 32) + '">A single-celled organism, Paramecium, seen with a light microscope.</text>' +
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
    var mode = 'cell', card = null, cst = { rx: 40, ry: 500, rot: 0 }, csvg = null, cctl = null;
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
      card.innerHTML = '<div class="mc__box"><svg class="mc__svg" viewBox="0 0 600 600" role="img" aria-label="Figure 1, a micrograph of a Paramecium lying at an angle, with its large nucleus labelled and a 50 µm scale bar, printed as on an exam page, and a clear ruler in millimetres that you can drag and turn."></svg></div>' +
        '<div class="vbar mc__ctl"><span class="mc__k">Ruler</span>' +
        '<button type="button" class="suse__b" data-rx="-0.5" data-hold aria-label="Move the ruler half a millimetre to the left">◀</button>' +
        '<button type="button" class="suse__b" data-rx="0.5" data-hold aria-label="Move the ruler half a millimetre to the right">▶</button>' +
        '<button type="button" class="suse__b" data-ry="-0.5" data-hold aria-label="Move the ruler half a millimetre up">▲</button>' +
        '<button type="button" class="suse__b" data-ry="0.5" data-hold aria-label="Move the ruler half a millimetre down">▼</button>' +
        '<button type="button" class="suse__b" data-turn="-1" data-hold aria-label="Turn the ruler 1 degree anticlockwise">↺</button>' +
        '<button type="button" class="suse__b" data-turn="1" data-hold aria-label="Turn the ruler 1 degree clockwise">↻</button>' +
        '<button type="button" class="suse__b" data-turn="90">Turn 90°</button></div>' +
        '<p class="mc__say">Drag the ruler to move it, and drag its round handle to turn it, or hold a button. Read from its 0 mark: the numbers are centimetres, and each small division is 1 mm.</p>';
      root.appendChild(card);
      csvg = card.querySelector('svg'); cctl = card.querySelector('.mc__ctl');
      var drawCard = function () { csvg.innerHTML = cardSvg(cst); };
      var cpt = function (ev) { var p = csvg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(csvg.getScreenCTM().inverse()); };
      var cdrag = null;
      var keep = function () { cst.rx = Math.max(-300, Math.min(580, cst.rx)); cst.ry = Math.max(-60, Math.min(600, cst.ry)); };
      /* dragging the ruler moves it; dragging its round handle turns it about its 0 mark */
      csvg.addEventListener('pointerdown', function (ev) {
        var t = ev.target.closest ? ev.target.closest('[data-drag]') : null; if (!t) return;
        var p = cpt(ev);
        cdrag = t.getAttribute('data-drag') === 'turn' ? { turn: true, a: Math.atan2(p.y - cst.ry, p.x - cst.rx), rot: cst.rot } : { p: p, rx: cst.rx, ry: cst.ry };
        try { csvg.setPointerCapture(ev.pointerId); } catch (e) {} ev.preventDefault();
      });
      csvg.addEventListener('pointermove', function (ev) {
        if (!cdrag) return; var q = cpt(ev);
        if (cdrag.turn) cst.rot = norm(cdrag.rot + (Math.atan2(q.y - cst.ry, q.x - cst.rx) - cdrag.a) * 180 / Math.PI);
        else { cst.rx = cdrag.rx + q.x - cdrag.p.x; cst.ry = cdrag.ry + q.y - cdrag.p.y; keep(); }
        drawCard();
      });
      var cend = function () { cdrag = null; };
      csvg.addEventListener('pointerup', cend); csvg.addEventListener('pointercancel', cend);
      /* each button moves or turns the ruler once; held down (data-hold), it goes on until it is let go */
      Array.prototype.forEach.call(cctl.querySelectorAll('[data-rx],[data-ry],[data-turn]'), function (b) {
        var step = function () {
          cst.rx += (+b.getAttribute('data-rx') || 0) * MM; cst.ry += (+b.getAttribute('data-ry') || 0) * MM; keep();
          cst.rot = norm(cst.rot + (+b.getAttribute('data-turn') || 0)); drawCard();
        };
        var held = null, stop = function () { if (held) { clearTimeout(held.t); clearInterval(held.i); held = null; } };
        b.addEventListener('pointerdown', function (ev) {
          if (ev.pointerType === 'mouse' && ev.button !== 0) return;
          stop(); step();
          if (b.hasAttribute('data-hold')) { var h = held = { t: 0, i: 0 }; h.t = setTimeout(function () { h.i = setInterval(step, 70); }, 400); }
        });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (e) { b.addEventListener(e, stop); });
        b.addEventListener('click', function (ev) { if (ev.detail === 0) step(); });   /* Enter or Space: a click with no pointer */
      });
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
