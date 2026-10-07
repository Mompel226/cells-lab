/* ============================================================
   views/microscope.js — station 2's picture: a real light microscope, and what you see down it.

   Two states, one picture:
     the microscope   GcG's public-domain photograph of a Nikon Alphaphot (its orange numbers painted out
                      for this lab), every part named in the margins on a ruled level line that ends ON
                      the part (memories label-lines-never-cross, no dots). Press a part: its card opens
                      on the right. Open a card: its part is lit and the rest steps back.
     down the eyepiece   a round field of view holding one real motor neurone from the spinal cord,
                      photographed by the Berkshire Community College Bioscience Image Library (CC0) at
                      ×40, ×100 and ×400 — the same cell, the same slide. Three objective lenses to turn
                      to, and the fine focusing knob: a new objective leaves the image a little out of
                      focus, as a real one does. The total magnification is worked out beside it.
   The light's path (lamp → condenser → specimen → objective → eyepiece) is drawn by light(t), driven
   by the "Follow the light" widget in the Learn tab (js/views/microscope.js registers it), so the
   drawing stays on the left and its buttons on the right (memory animations-beside-their-buttons).

   spec: { kind:'microscope', parts:[…], img:'microscope', views:[{ obj, img, say }], eyepiece: 10 }
   ============================================================ */
(function (global) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var W = 900, H = 1363;                       /* the photograph, as published in assets/photos */

  /* Each part: where the leader ends ON it, the lit area (an ellipse), and the margin its name goes in.
     Placed on the 900 px photograph by eye and checked on the rendered page (tools: _scope.html). */
  var PARTS = {
    eyepiece:  { name: 'eyepiece lens',  at: [772, 108], ell: [700, 112, 122, 86],  side: 'R' },
    nosepiece: { name: 'nosepiece',      at: [600, 418], ell: [516, 414, 124, 36],  side: 'R' },
    objective: { name: 'objective lens', at: [650, 534], ell: [565, 518, 126, 66],  side: 'R' },
    stage:     { name: 'stage',          at: [728, 655], ell: [420, 645, 306, 66],  side: 'R' },
    condenser: { name: 'condenser',      at: [548, 752], ell: [494, 760, 92, 60],   side: 'R' },
    lamp:      { name: 'lamp',           at: [556, 972], ell: [482, 974, 96, 96],   side: 'R' },
    focus:     { name: 'focusing knobs', at: [56, 796],  ell: [118, 800, 112, 96],  side: 'L' }
  };
  /* the light's path, bottom to top, through the middle of each part it crosses */
  var PATH = [[476, 990], [476, 800], [477, 652], [486, 560], [496, 470], [530, 370], [610, 250], [700, 150], [762, 96]];
  var LIGHT_AT = [0, 0.22, 0.42, 0.62, 0.82, 1];   /* fraction of the path at the end of each step (lamp … eyepiece) */

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(e);
    return e;
  }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function still() { return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches); }

  function make(spec, ctx) {
    var root = h('div', 'mscope');
    var uid = 'ms' + Math.random().toString(36).slice(2, 7);

    /* ---------- the microscope ---------- */
    var face = h('div', 'mscope__face');
    var svg = el('svg', { viewBox: '-260 -10 1520 1385', class: 'mscope__svg', role: 'img',
      'aria-label': 'A photograph of a light microscope, its parts named: the eyepiece lens at the top, the nosepiece and the objective lenses under it, the stage, the condenser under the stage, the lamp in the base, and the focusing knobs on the side.' });
    var defs = el('defs', {}, svg);
    var blur = el('filter', { id: uid + 'f', x: '-30%', y: '-30%', width: '160%', height: '160%' }, defs);
    el('feGaussianBlur', { stdDeviation: '26' }, blur);
    var mask = el('mask', { id: uid + 'm', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, defs);
    el('rect', { x: 0, y: 0, width: W, height: H, fill: '#fff' }, mask);
    var hole = el('ellipse', { cx: 0, cy: 0, rx: 0, ry: 0, fill: '#000', filter: 'url(#' + uid + 'f)' }, mask);
    var glow = el('linearGradient', { id: uid + 'g', x1: 0, y1: 1, x2: 0, y2: 0 }, defs);
    el('stop', { offset: '0', class: 'mscope__glow0' }, glow);
    el('stop', { offset: '1', class: 'mscope__glow1' }, glow);

    el('image', { href: 'assets/photos/' + spec.img + '-900.jpg', x: 0, y: 0, width: W, height: H, preserveAspectRatio: 'none' }, svg);
    var veil = el('rect', { x: 0, y: 0, width: W, height: H, class: 'mscope__veil', mask: 'url(#' + uid + 'm)' }, svg);
    var beam = el('polyline', { points: PATH.map(function (p) { return p.join(','); }).join(' '), class: 'mscope__beam', stroke: 'url(#' + uid + 'g)' }, svg);
    var beamLen = 0;
    for (var i = 1; i < PATH.length; i++) beamLen += Math.hypot(PATH[i][0] - PATH[i - 1][0], PATH[i][1] - PATH[i - 1][1]);
    beam.style.strokeDasharray = beamLen.toFixed(1);
    beam.style.strokeDashoffset = beamLen.toFixed(1);
    var hitG = el('g', { class: 'mscope__hits' }, svg);
    var labG = el('g', { class: 'mscope__labs' }, svg);

    var wanted = (spec.parts || []).filter(function (k) { return PARTS[k]; });
    wanted.forEach(function (k) {
      var p = PARTS[k], e = p.ell;
      var hit = el('ellipse', { cx: e[0], cy: e[1], rx: e[2], ry: e[3], class: 'mscope__hit', 'data-part': k, tabindex: '-1' }, hitG);
      hit.addEventListener('click', function () { ctx.pick(k); });
    });
    /* the labels' size in the picture's own units, so that they read at about 14 px on a laptop and on a phone */
    var FONT = 44;
    function fit() {
      var r = svg.getBoundingClientRect();
      if (!r.height || !r.width) return false;
      /* the picture is limited by whichever side runs out first: try a font, see how many px a unit is */
      var f = 44;
      for (var n = 0; n < 4; n++) {
        var left = f * 0.56 * 9 + 40, right = f * 0.56 * 14 + 40;
        var vw = W + left + right, vh = H + 20;
        var ppu = Math.min(r.width / vw, r.height / vh);
        f = Math.max(40, Math.min(110, 14 / ppu));
      }
      var L0 = f * 0.56 * 9 + 40, R0 = f * 0.56 * 14 + 40;
      svg.setAttribute('viewBox', (-L0).toFixed(0) + ' -10 ' + (W + L0 + R0).toFixed(0) + ' ' + (H + 20));
      var changed = Math.abs(f - FONT) > 1; FONT = f;
      return changed;
    }
    function drawLabels(lit) {
      fit();
      var items = wanted.map(function (k) {
        var p = PARTS[k];
        return { id: k, text: p.name, x: p.at[0], y: p.at[1], side: p.side, cls: lit === k ? 'is-lit' : (lit ? 'is-dim' : '') };
      });
      /* the left margin is narrow, so its words wrap ("focusing / knobs"); the right margin holds a line each */
      var opt = { left: -16, right: W + 16, font: FONT, top: 0, bottom: H, gap: FONT * 0.25 };
      labG.innerHTML = global.CircLearn.labels(Object.assign({}, opt, { items: items.filter(function (x) { return x.side === 'L'; }), width: FONT * 0.56 * 8.5 })) +
                       global.CircLearn.labels(Object.assign({}, opt, { items: items.filter(function (x) { return x.side === 'R'; }), width: FONT * 0.56 * 15 }));
      Array.prototype.forEach.call(labG.querySelectorAll('.lb'), function (g) {
        var k = g.getAttribute('data-lab');
        g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0');
        g.setAttribute('aria-label', PARTS[k].name + ': open its card');
        g.addEventListener('click', function () { ctx.pick(k); });
        g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ctx.pick(k); } });
      });
    }
    var bar = h('div', 'vbar');
    var lookBtn = h('button', 'vbtn mscope__go', '<span aria-hidden="true">◉</span> Look through the eyepiece');
    lookBtn.type = 'button';
    bar.appendChild(lookBtn);
    face.appendChild(bar);
    face.appendChild(svg);
    if (global.ResizeObserver) new global.ResizeObserver(function () { if (mode === 'face' && fit()) drawLabels(lit); }).observe(face);
    root.appendChild(face);

    /* ---------- down the eyepiece ---------- */
    var look = h('div', 'mscope__look');
    look.hidden = true;
    var fov = h('div', 'fov');
    var views = spec.views || [];
    var imgs = views.map(function (v, k) {
      var im = new Image();
      im.alt = v.alt || '';
      im.decoding = 'async';
      im.src = 'assets/photos/' + v.img + '-900.jpg';
      im.className = 'fov__img';
      im.hidden = k !== 0;
      fov.appendChild(im);
      return im;
    });
    look.appendChild(fov);
    var ctl = h('div', 'mscope__ctl');
    var nose = h('div', 'nose', '<span class="nose__h">Objective lens</span>');
    nose.setAttribute('role', 'group'); nose.setAttribute('aria-label', 'Turn the nosepiece to an objective lens');
    var objBtns = views.map(function (v, k) {
      var b = h('button', 'nose__b', '×' + v.obj);
      b.type = 'button'; b.setAttribute('aria-pressed', k === 0 ? 'true' : 'false');
      b.addEventListener('click', function () { choose(k); });
      nose.appendChild(b);
      return b;
    });
    ctl.appendChild(nose);
    var foc = h('label', 'focus', '<span class="focus__h">Fine focusing knob</span>');
    var slider = document.createElement('input');
    slider.type = 'range'; slider.min = '0'; slider.max = '100'; slider.value = '62'; slider.className = 'focus__in';
    slider.setAttribute('aria-label', 'Fine focusing knob');
    foc.appendChild(slider);
    ctl.appendChild(foc);
    var hint = h('p', 'mscope__hint', 'The image is out of focus. Turn the fine focusing knob until it is sharp.');
    hint.hidden = true;
    ctl.appendChild(hint);
    var sum = h('p', 'mscope__sum');
    sum.setAttribute('aria-live', 'polite');
    ctl.appendChild(sum);
    var backBtn = h('button', 'vbtn mscope__back', '← Back to the microscope');
    backBtn.type = 'button';
    ctl.appendChild(backBtn);
    look.appendChild(ctl);
    root.appendChild(look);

    /* where each objective is sharp: a new objective is a little out of focus, as on a real microscope */
    var SHARP = [62, 47, 55], cur = 0, mode = 'face';
    function sharpness() {
      var d = Math.abs(+slider.value - SHARP[cur]);
      var px = d < 3 ? 0 : Math.min(9, (d - 2) / 3.2);
      imgs.forEach(function (im) { im.style.filter = px ? 'blur(' + px.toFixed(1) + 'px)' : ''; });
      fov.classList.toggle('is-sharp', !px);
      hint.hidden = !px;
    }
    function summary() {
      var v = views[cur], ep = spec.eyepiece || 10;
      sum.innerHTML = '<span class="mscope__eq">Total magnification = eyepiece ×' + ep + ' × objective ×' + v.obj +
        ' = <b>×' + (ep * v.obj) + '</b></span><span class="mscope__say">' + (v.say || '') + '</span>';
    }
    function choose(k) {
      cur = k;
      imgs.forEach(function (im, j) { im.hidden = j !== k; });
      objBtns.forEach(function (b, j) { b.setAttribute('aria-pressed', j === k ? 'true' : 'false'); });
      /* turning the nosepiece moves nothing else: the focus stays where it was, so the new lens is a little off */
      sharpness(); summary();
    }
    slider.addEventListener('input', sharpness);

    function show(m) {
      mode = m;
      face.hidden = m !== 'face';
      look.hidden = m !== 'look';
      api.say = m === 'look'
        ? 'Through the eyepiece: one motor neurone from the spinal cord, the same cell at ×40, ×100 and ×400'
        : 'A light microscope';
      api.credit = m === 'look'
        ? 'Photographs: Berkshire Community College Bioscience Image Library, CC0'
        : 'Photograph: GcG, Wikimedia Commons, public domain (its numbers removed)';
      ctx.caption();
    }
    lookBtn.addEventListener('click', function () { show('look'); });
    backBtn.addEventListener('click', function () { show('face'); });

    function lightOn(part) {
      var p = part && PARTS[part];
      if (!p) { veil.classList.remove('is-on'); hole.setAttribute('rx', 0); hole.setAttribute('ry', 0); return; }
      var e = p.ell;
      hole.setAttribute('cx', e[0]); hole.setAttribute('cy', e[1]); hole.setAttribute('rx', e[2] * 1.15); hole.setAttribute('ry', e[3] * 1.25);
      veil.classList.add('is-on');
    }

    var lit = null;
    var api = {
      el: root, say: 'A light microscope', credit: '',
      labels: (function () { var o = {}; wanted.forEach(function (k) { o[k] = PARTS[k].name; }); o.fov = 'the view down the eyepiece'; return o; })(),
      focus: function (part) {
        if (part === 'fov') { show('look'); return; }
        if (mode !== 'face') show('face');
        lit = PARTS[part] ? part : null;
        lightOn(lit); drawLabels(lit);
      },
      /* the light's path, for the Follow the light widget: f from 0 (nothing) to 1 (at the eyepiece);
         the part the light has reached is lit */
      light: function (f, part) {
        if (mode !== 'face') show('face');
        beam.style.strokeDashoffset = (beamLen * (1 - Math.max(0, Math.min(1, f)))).toFixed(1);
        beam.classList.toggle('is-on', f > 0);
        lit = part || null; lightOn(lit); drawLabels(lit);
      },
      stop: function () {},
      theme: function () {}
    };
    drawLabels(null);
    choose(0);
    show('face');
    return api;
  }

  global.Views.add('microscope', make);

  /* ---------- Follow the light: the steps on the right, the light on the picture on the left ---------- */
  var L = global.CircLearn;
  if (L && L.add) L.add('lightpath', function (spec) {
    var box = L.h('div', 'widget lp');
    box.appendChild(L.head(spec.title || 'Follow the light', spec.ask || 'Press Play. Each step stops until you press Next step.'));
    var STEPS = (spec.steps || []).map(function (s, i) { return { t: i * 4, h: s.h, p: s.p, part: s.part }; });
    var END = STEPS.length * 4;
    function view() { var v = global.Plate && global.Plate.current && global.Plate.current(); return v && v.light ? v : null; }
    var sp = L.stepper({
      steps: STEPS, end: END,
      render: function (t) {
        var v = view(); if (!v) return;
        if (t <= 0) { v.light(0, null); return; }
        var k = Math.min(STEPS.length - 1, Math.floor(t / 4)), within = Math.min(1, (t - k * 4) / 2.4);
        var f = LIGHT_AT[k] + (LIGHT_AT[k + 1] - LIGHT_AT[k]) * within;
        v.light(f, STEPS[k].part);
      }
    });
    box.appendChild(sp.bar);
    box.appendChild(sp.list);
    box.appendChild(sp.now);
    sp.paint(0);
    box.__seek = sp.seek;
    return box;
  });
})(window);
