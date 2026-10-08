/* ============================================================
   views/levels.js — station 1's picture: from a body down to one cell, one level at a time.

   The Foundations shelf's own zoom, as still pictures of the same woman (the HuBMAP body, her reproductive
   system, her uterus cut open, the lining of her cervix, one cell), and a plant the same way. Each picture
   carries a box round the thing its level names (the whole body at Organism, the whole reproductive system at Organ
   system, the uterus at Organ, the lining at Tissue, one cell at Cell: Daniel, 8 Oct 2026); "Zoom in" goes to the next
   level, "Zoom out" comes back.
   The ladder of level names on the left says where you are, how wide the view is, and lets you jump.
   It teaches the words AND the idea: each level is made of the one below it.

   Each picture also names its parts (`labels`, Daniel 8 Oct 2026: the uterus, its muscle tissue, its lining and the
   connective tissue were words with nothing to look at). The labels sit in margins beside the picture, never over
   it, on level lines that end on their part and never cross (memory label-lines-never-cross), about 13 px on any screen.

   spec: { kind:'levels', parts:['organism','system','organ','tissue','cell'], ladders:[{ id, name, steps:[{ level,
           img, w, h, box:[x0,y0,x1,y1] round what the level names, labels:[{ t, x, y, side:'L'|'R' }], wide, say, credit }] }] }
   ============================================================ */
(function (global) {
  'use strict';
  var NAME = { organism: 'Organism', system: 'Organ system', organ: 'Organ', tissue: 'Tissue', cell: 'Cell' };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(e);
    return e;
  }
  function still() { return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches); }

  function make(spec, ctx) {
    var root = h('div', 'lev');
    var bar = h('div', 'vbar');
    bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Which organism');
    var main = h('div', 'lev__main');
    var ladder = h('ol', 'lev__ladder');
    ladder.setAttribute('aria-label', 'The levels');
    var frame = h('div', 'lev__frame');
    /* one drawing: the picture, a veil outside the box, the box, and the labels in the margins */
    var svg = el('svg', { class: 'lev__img lev__svg', role: 'img' });
    var pic = el('image', { x: 0, y: 0, preserveAspectRatio: 'none' }, svg);
    var veil = el('path', { class: 'lev__dim', 'fill-rule': 'evenodd' }, svg);
    var halo = el('rect', { class: 'lev__boxhalo', rx: 6, ry: 6 }, svg);
    var box = el('rect', { class: 'lev__boxr', rx: 6, ry: 6 }, svg);
    var labG = el('g', { class: 'lev__labs', 'aria-hidden': 'true' }, svg);
    frame.appendChild(svg);
    main.appendChild(ladder); main.appendChild(frame);
    var nav = h('div', 'lev__nav');
    var outB = h('button', 'vbtn lev__out', '◂ Zoom out'); outB.type = 'button';
    var inB = h('button', 'vbtn lev__in', ''); inB.type = 'button';
    var where = h('p', 'lev__where'); where.setAttribute('aria-live', 'polite');
    nav.appendChild(outB); nav.appendChild(where); nav.appendChild(inB);
    root.appendChild(bar); root.appendChild(main); root.appendChild(nav);

    var L = 0, k = 0;
    var ladBtns = spec.ladders.map(function (lad, j) {
      var b = h('button', 'cellv__mode', lad.name); b.type = 'button';
      b.addEventListener('click', function () { L = j; k = 0; paint(); });
      bar.appendChild(b);
      return b;
    });
    function steps() { return spec.ladders[L].steps; }
    function paint(fromPick) {
      var st = steps()[k], all = steps();
      ladBtns.forEach(function (b, j) { b.setAttribute('aria-pressed', j === L ? 'true' : 'false'); });
      ladder.innerHTML = '';
      all.forEach(function (s, j) {
        var li = h('li', 'lev__rung' + (j === k ? ' is-on' : '') + (j < k ? ' is-above' : ''));
        var b = h('button', 'lev__rb', '<span class="lev__rn">' + NAME[s.level] + '</span><span class="lev__rw">' + s.wide + '</span>');
        b.type = 'button'; b.setAttribute('aria-current', j === k ? 'step' : 'false');
        b.addEventListener('click', function () { go(j, true); });
        li.appendChild(b); ladder.appendChild(li);
      });
      pic.setAttribute('href', 'assets/photos/' + st.img);
      svg.setAttribute('aria-label', st.alt || st.say);
      draw();
      outB.disabled = k === 0;
      inB.hidden = k === all.length - 1;   /* the bottom of the ladder: nothing to zoom into (8 Oct 2026 review: a faded button read as broken) */
      inB.innerHTML = k < all.length - 1 ? 'Zoom in: ' + NAME[all[k + 1].level].toLowerCase() + ' ▸' : '';
      where.innerHTML = '<b>' + NAME[st.level] + '</b> · ' + st.wide;
      api.say = st.say; api.credit = st.credit;
      ctx.caption();
      if (!fromPick) { /* nothing */ }
    }
    /* the drawing in the picture's own pixels: the viewBox adds a margin on each side that has labels, sized so the
       words come out at about 13 px on this screen (the same fit as the cell stations' views) */
    function draw() {
      var st = steps()[k], b = st.box, labs = st.labels || [];
      var r = frame.getBoundingClientRect(); if (!r.width || !r.height) return;
      var WRAP = labs.reduce(function (n, l) { return Math.max(n, String(l.t).split(' ').reduce(function (m, w) { return Math.max(m, w.length); }, 0)); }, 11);
      var widest = function (side) { return labs.filter(function (l) { return l.side === side; }).reduce(function (n, l) { return Math.max(n, Math.min(WRAP, String(l.t).length)); }, 0); };
      var wl = widest('L'), wr = widest('R'), pad = 8, f = 30;
      for (var n = 0; n < 4; n++) {
        var Lm = wl ? f * 0.56 * wl + 26 : 0, Rm = wr ? f * 0.56 * wr + 26 : 0;
        var ppu = Math.min(r.width / (st.w + Lm + Rm + 2 * pad), r.height / (st.h + 2 * pad));
        f = 13 / ppu;
      }
      var L0 = wl ? f * 0.56 * wl + 26 : 0, R0 = wr ? f * 0.56 * wr + 26 : 0;
      svg.setAttribute('viewBox', (-L0 - pad).toFixed(1) + ' ' + (-pad) + ' ' + (st.w + L0 + R0 + 2 * pad).toFixed(1) + ' ' + (st.h + 2 * pad));
      pic.setAttribute('width', st.w); pic.setAttribute('height', st.h);
      if (b) {
        veil.setAttribute('d', 'M0 0H' + st.w + 'V' + st.h + 'H0Z M' + b[0] + ' ' + b[1] + 'V' + b[3] + 'H' + b[2] + 'V' + b[1] + 'Z');
        [halo, box].forEach(function (x) { x.setAttribute('x', b[0]); x.setAttribute('y', b[1]); x.setAttribute('width', b[2] - b[0]); x.setAttribute('height', b[3] - b[1]); });
      }
      veil.style.display = halo.style.display = box.style.display = b ? '' : 'none';
      var items = labs.map(function (l, i) { return { id: 'l' + i, text: l.t, x: l.x, y: l.y, side: l.side }; });
      labG.innerHTML = items.length ? global.CircLearn.labels({ items: items, left: -6, right: st.w + 6, font: f, top: 0, bottom: st.h,
        gap: f * 0.6, width: f * 0.56 * WRAP }) : '';   /* two-line labels stay clearly apart (8 Oct 2026 review) */
    }
    if (global.ResizeObserver) new global.ResizeObserver(function () { draw(); }).observe(frame);
    function go(j, user) {
      if (j < 0 || j >= steps().length || j === k) return;
      var into = j > k;
      k = j;
      if (!still()) { frame.classList.remove('is-in', 'is-out'); void frame.offsetWidth; frame.classList.add(into ? 'is-in' : 'is-out'); }
      paint();
      if (user) ctx.pick(steps()[k].level, { stay: true });
    }
    outB.addEventListener('click', function () { go(k - 1, true); });
    inB.addEventListener('click', function () { go(k + 1, true); });

    var api = {
      el: root, say: '', credit: '',
      labels: { organism: 'organism', system: 'organ system', organ: 'organ', tissue: 'tissue', cell: 'cell' },
      focus: function (part) {
        if (!part) return;
        var j = steps().map(function (s) { return s.level; }).indexOf(part);
        if (j < 0) { /* the plant ladder has no organ-system step: the woman's has */ L = 0; j = steps().map(function (s) { return s.level; }).indexOf(part); }
        if (j >= 0 && j !== k) { k = j; paint(); } else paint();
      },
      stop: function () {}
    };
    paint();
    return api;
  }
  global.Views.add('levels', make);
})(window);
