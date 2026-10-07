/* ============================================================
   views/specialised.js — station 9's picture: seven specialised cells, each doing its job.

   One cell at a time, large, as a real micrograph (the sperm cell is the one drawing: no free photograph of one
   was good enough, and it says so). One ruled label points at the feature that does the job, and under the
   picture is the job in the syllabus's own words. A strip of the seven along the bottom; pressing one opens its
   card on the right, and opening a card shows its cell.

   spec: { kind:'specialised', parts:[…], cells:[{ id, name, img, w, h, pin:[x,y], pinText, job, where, credit }] }
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

  function make(spec, ctx) {
    var root = h('div', 'spc');
    var svg = el('svg', { class: 'spc__svg', role: 'img' });
    var img = el('image', { preserveAspectRatio: 'none' }, svg);
    var labG = el('g', {}, svg);
    var job = h('p', 'spc__job'); job.setAttribute('aria-live', 'polite');
    var strip = h('div', 'spc__strip');
    strip.setAttribute('role', 'group'); strip.setAttribute('aria-label', 'The seven specialised cells');
    root.appendChild(svg); root.appendChild(job); root.appendChild(strip);
    var k = 0;
    var thumbs = spec.cells.map(function (c, j) {
      var b = h('button', 'spc__t'); b.type = 'button';
      var im = new Image(); im.src = 'assets/photos/' + c.img; im.alt = ''; im.loading = 'lazy'; im.decoding = 'async';
      b.appendChild(im); b.appendChild(h('span', 'spc__tn', c.name));
      b.addEventListener('click', function () { k = j; paint(); ctx.pick(c.id, { stay: true }); });
      strip.appendChild(b); return b;
    });
    function paint() {
      var c = spec.cells[k];
      thumbs.forEach(function (b, j) { b.setAttribute('aria-pressed', j === k ? 'true' : 'false'); });
      var r = svg.getBoundingClientRect();
      /* the label in the picture's own units, at about 14 px; its margin on the side away from the pin */
      var ppu = r.width ? Math.min(r.width / (c.w * 1.55), r.height / c.h) : 0.6;
      var f = Math.max(14, Math.min(c.w / 8, 14 / (ppu || 0.6)));
      var right = c.pin[0] > c.w / 2;
      var margin = f * 0.56 * Math.min(18, c.pinText.length) + 30;
      svg.setAttribute('viewBox', (right ? 0 : -margin).toFixed(1) + ' 0 ' + (c.w + margin).toFixed(1) + ' ' + c.h);
      svg.setAttribute('aria-label', c.alt || c.name);
      img.setAttribute('href', 'assets/photos/' + c.img); img.setAttribute('width', c.w); img.setAttribute('height', c.h);
      labG.innerHTML = global.CircLearn.labels({ items: [{ id: c.id, text: c.pinText, x: c.pin[0], y: c.pin[1], side: right ? 'R' : 'L', cls: 'is-lit' }],
        left: -8, right: c.w + 8, font: f, width: f * 0.56 * 18, top: 0, bottom: c.h, gap: 4 });
      job.innerHTML = '<b>' + c.name + '</b> · ' + c.job + (c.where ? '<span class="spc__where">' + c.where + '</span>' : '');
      api.say = c.say || c.name; api.credit = c.credit; ctx.caption();
    }
    if (global.ResizeObserver) new global.ResizeObserver(function () { paint(); }).observe(root);
    var api = {
      el: root, say: '', credit: '',
      labels: (function () { var o = {}; spec.cells.forEach(function (c) { o[c.id] = c.name; }); return o; })(),
      focus: function (part) { var j = spec.cells.map(function (c) { return c.id; }).indexOf(part); if (j >= 0) k = j; paint(); },
      stop: function () {}
    };
    paint();
    return api;
  }
  global.Views.add('specialised', make);
})(window);
