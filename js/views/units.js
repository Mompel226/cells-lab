/* ============================================================
   views/units.js — station 4's picture: a ruler you zoom into.

   Four steps, each closer than the last: 1 mm, 0.1 mm, 0.01 mm, 0.005 mm. At each
   step the ruler is read twice, in millimetres above and in micrometres below, so the conversion is SEEN:
   0.1 mm and 100 µm are the same mark. Under the ruler, a real picture at its true size against that ruler:
   the lining of the cervix from the Foundations shelf (0.46 µm a pixel at 900 px), part of the HeLa cell under the
   electron microscope (16 nm a pixel), and E. coli with its own printed 2 µm scale bar (113 pixels a µm at 900 px).

   spec: { kind:'units', steps:[{ mm, img, umPerPx, crop:[x,y,w,h], say, credit, sees }] }
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
  function num(x) { return String(+x.toPrecision(10)); }

  function make(spec, ctx) {
    var root = h('div', 'units');
    var bar = h('div', 'vbar');
    bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'How close you are');
    var W = 1000, RULER_Y = 40, PIC_Y = 150;
    var svg = el('svg', { class: 'units__svg', viewBox: '0 0 1000 620', preserveAspectRatio: 'xMidYMin meet', role: 'img' });
    var rul = el('g', { class: 'units__ruler' }, svg);
    var picG = el('g', {}, svg);
    var clipId = 'uc' + Math.random().toString(36).slice(2, 7);
    var clip = el('clipPath', { id: clipId }, el('defs', {}, svg));
    var clipR = el('rect', { x: 0, y: PIC_Y, width: W, height: 450 }, clip);
    var pic = el('image', { preserveAspectRatio: 'none', 'clip-path': 'url(#' + clipId + ')' }, picG);
    var sum = h('div', 'units__sum');
    sum.setAttribute('aria-live', 'polite');
    root.appendChild(bar); root.appendChild(svg); root.appendChild(sum);

    var k = 0;
    var btns = spec.steps.map(function (s, j) {
      var b = h('button', 'cellv__mode', num(s.mm) + ' mm'); b.type = 'button';
      b.addEventListener('click', function () { k = j; paint(); ctx.pick('step' + (j + 1), { stay: true }); });
      bar.appendChild(b); return b;
    });

    function paint() {
      var s = spec.steps[k], spanUm = s.mm * 1000, upu = W / spanUm;   /* svg units per µm */
      var narrow = !!(global.matchMedia && global.matchMedia('(max-width: 620px)').matches);   /* larger words, so fewer of them and lower */
      btns.forEach(function (b, j) { b.setAttribute('aria-pressed', j === k ? 'true' : 'false'); });
      /* the ruler: ten divisions, read in mm above and in µm below */
      rul.innerHTML = '';
      el('rect', { x: 0, y: RULER_Y - 6, width: W, height: narrow ? 112 : 92, rx: 6, class: 'units__rbody' }, rul);
      for (var i = 0; i <= 10; i++) {
        var x = Math.min(W - 1.5, Math.max(1.5, i * W / 10)), big = i % 5 === 0;
        el('line', { x1: x, y1: RULER_Y + 30, x2: x, y2: RULER_Y + 30 + (big ? 26 : 16), class: 'units__tick' }, rul);
        for (var q = 1; q < 5 && i < 10; q++) { var xs = x + q * W / 50; el('line', { x1: xs, y1: RULER_Y + 30, x2: xs, y2: RULER_Y + 38, class: 'units__tick units__tick--s' }, rul); }
        if (narrow ? i % 5 === 0 : (i % 2 === 0 || k < 2)) {   /* a phone: 0, the middle and the end, with its unit */
          var anchor = i === 0 ? 'start' : i === 10 ? 'end' : 'middle';
          var t1 = el('text', { x: x, y: RULER_Y + 20, class: 'units__mm', 'text-anchor': anchor }, rul); t1.textContent = num(s.mm * i / 10) + (narrow && i === 10 ? ' mm' : '');
          var t2 = el('text', { x: x, y: RULER_Y + (narrow ? 98 : 78), class: 'units__um', 'text-anchor': anchor }, rul); t2.textContent = num(spanUm * i / 10) + (narrow && i === 10 ? ' µm' : '');
        }
      }
      var u1 = el('text', { x: W - 4, y: RULER_Y - 12, class: 'units__unit', 'text-anchor': 'end' }, rul); u1.textContent = narrow ? '' : 'mm';   /* on a phone the unit rides on the last number */
      var u2 = el('text', { x: W - 4, y: RULER_Y + 104, class: 'units__unit units__unit--um', 'text-anchor': 'end' }, rul); u2.textContent = narrow ? '' : 'µm';
      /* the picture at its true size against the ruler */
      var c = s.crop, sc = s.umPerPx * upu;
      pic.setAttribute('href', 'assets/photos/' + s.img);
      pic.setAttribute('width', (s.iw * sc).toFixed(1)); pic.setAttribute('height', (s.ih * sc).toFixed(1));
      pic.setAttribute('x', (-c[0] * sc).toFixed(1)); pic.setAttribute('y', (PIC_Y - c[1] * sc).toFixed(1));
      clipR.setAttribute('width', Math.min(W, c[2] * sc).toFixed(1)); clipR.setAttribute('height', Math.min(450, c[3] * sc).toFixed(1));
      sum.innerHTML = '<p class="units__eq"><b class="units__r">' + num(s.mm) + ' mm = ' + num(spanUm) + ' µm</b> · <span class="units__r">mm × 1000 = µm</span> · <span class="units__r">µm ÷ 1000 = mm</span></p><p class="units__sees">' + s.sees + '</p>';
      api.say = s.say; api.credit = s.credit; ctx.caption();
    }
    var api = {
      el: root, say: '', credit: '',
      labels: { step1: 'one millimetre', step2: 'a tenth of a millimetre', step3: 'a hundredth of a millimetre', step4: 'five micrometres' },
      focus: function (part) { var m = /^step(\d)$/.exec(part || ''); if (m && spec.steps[m[1] - 1]) { k = m[1] - 1; } paint(); },
      stop: function () {}
    };
    if (global.matchMedia) { var mq = global.matchMedia('(max-width: 620px)'); if (mq.addEventListener) mq.addEventListener('change', function () { paint(); }); }
    paint();
    return api;
  }
  global.Views.add('units', make);
})(window);
