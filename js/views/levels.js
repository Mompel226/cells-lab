/* ============================================================
   views/levels.js — station 1's picture: from a body down to one cell, one level at a time.

   The Foundations shelf's own zoom, as still pictures of the same woman (the HuBMAP body, her reproductive
   system, her uterus cut open, the lining of her cervix, one cell), and a plant the same way. Each picture
   carries a box round the thing its level names (the whole body at Organism, the whole reproductive system at Organ
   system, the uterus at Organ, the lining at Tissue, one cell at Cell: Daniel, 8 Oct 2026); "Zoom in" goes to the next
   level, "Zoom out" comes back.
   The ladder of level names on the left says where you are, how wide the view is, and lets you jump.
   It teaches the words AND the idea: each level is made of the one below it.

   spec: { kind:'levels', parts:['organism','system','organ','tissue','cell'], ladders:[{ id, name, steps:[{ level,
           img, w, h, box:[x0,y0,x1,y1] round what the level names, wide, say, credit }] }] }
   ============================================================ */
(function (global) {
  'use strict';
  var NAME = { organism: 'Organism', system: 'Organ system', organ: 'Organ', tissue: 'Tissue', cell: 'Cell' };
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function still() { return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches); }

  function make(spec, ctx) {
    var root = h('div', 'lev');
    var bar = h('div', 'vbar');
    bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Which organism');
    var main = h('div', 'lev__main');
    var ladder = h('ol', 'lev__ladder');
    ladder.setAttribute('aria-label', 'The levels');
    var frame = h('div', 'lev__frame');
    var img = new Image(); img.className = 'lev__img'; img.decoding = 'async'; img.alt = '';
    var box = h('div', 'lev__box'); box.setAttribute('aria-hidden', 'true');
    frame.appendChild(img); frame.appendChild(box);
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
      img.src = 'assets/photos/' + st.img;
      img.alt = st.alt || st.say;
      frame.style.aspectRatio = st.w + ' / ' + st.h;
      placeBox();
      outB.disabled = k === 0;
      inB.disabled = k === all.length - 1;
      inB.innerHTML = k < all.length - 1 ? 'Zoom in: ' + NAME[all[k + 1].level].toLowerCase() + ' ▸' : 'One cell: the bottom of the ladder';
      where.innerHTML = '<b>' + NAME[st.level] + '</b> · ' + st.wide;
      api.say = st.say; api.credit = st.credit;
      ctx.caption();
      if (!fromPick) { /* nothing */ }
    }
    /* the box in pixels, on the picture as it is drawn: the picture is contained in its frame (object-fit), so it can
       sit with bands above and below, or at the sides, and a box placed against the frame would miss its part */
    function placeBox() {
      var st = steps()[k], b = st.box;
      if (!b) { box.hidden = true; return; }
      var fw = frame.clientWidth, fh = frame.clientHeight;
      if (!fw || !fh) { box.hidden = true; return; }
      var s = Math.min(fw / st.w, fh / st.h), ox = (fw - st.w * s) / 2, oy = (fh - st.h * s) / 2;
      box.style.left = (ox + b[0] * s) + 'px'; box.style.top = (oy + b[1] * s) + 'px';
      box.style.width = ((b[2] - b[0]) * s) + 'px'; box.style.height = ((b[3] - b[1]) * s) + 'px';
      box.hidden = false;
    }
    if (global.ResizeObserver) new global.ResizeObserver(placeBox).observe(frame);
    img.addEventListener('load', placeBox);
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
