/* ============================================================
   views/scope.js — ONE microscope for the lab's microscope stations, drawn for this lab (25 Oct 2026).

   It is the school's own kind of microscope (Daniel, 25 Oct 2026, with a photograph of a very similar model): a white
   body; a sloping body tube with the eyepiece lens at its top; a lamp (an LED) in the base, directly under the stage,
   turned on with a light switch on the base, and no mirror; and ONE double adjustment knob low on the arm, its wide
   part (next to the arm) the coarse adjustment knob and its small part (at the end) the fine adjustment knob. The
   knob moves the stage, with the condenser under it, up and down; the head stays still. Its fifteen named parts are
   those of Daniel's Year 9 sheet, with the sheet's mirror replaced by the lamp and the light switch: the eyepiece
   lens, the body tube, the nosepiece, a low-power and a high-power objective lens, the clips, the stage, the condenser,
   the iris diaphragm, the lamp, the light switch, the coarse and fine adjustment knobs, the arm and the base. (The
   sheet's own picture is not ours to publish; this one is drawn from the numbers below.)

   It is drawn to scale, 2.74 drawing units to a millimetre: the objectives are parfocal (45 mm from the shoulder to
   the specimen), with working distances of 17 mm (×4), 7 mm (×10) and 0.6 mm (×40), so the ×40 lens nearly touches
   the slide when the cells are in focus, as on a real microscope.

   Three things use it:
     'scopeparts'   station "Parts of the microscope": every part named on the picture, on a level line that ends ON
                    the part (memory label-lines-never-cross). Press a part: its card opens. On the Practise tab the
                    names are hidden (html[data-lab-tab="do"], set by app.js), or the picture would answer the quiz.
     'scopeuse'     station "Using the microscope": the microscope from the side, a lens on the gap between the
                    objective and the slide, and the view through the eyepiece. The light switch, the nosepiece, both
                    parts of the knob and the slide (moved by hand) work, and the step to do next stands at the top of
                    the picture (memory name-it-on-the-picture), in Daniel's order. It refuses his pupils' mistakes,
                    starting above the lowest power and the coarse knob at high power, with a red blinking banner and
                    three beeps. "Follow the light" draws the light's path on it (api.light).
     the diagrams   'scope#bare' (a hotspot's picture) and 'scope#letters' (parts lettered A to O), for the questions.

   The specimen is a leaf of Canadian pondweed (js/views/pondweed.js), never onion (memory never-do-the-assessment).
   ============================================================ */
(function (global) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function f2(v) { return Math.round(v * 100) / 100; }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function sv(tag, attrs) { var e = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  var uidN = 0;
  function uid() { return 'sc' + (++uidN) + Math.random().toString(36).slice(2, 5); }

  /* ---------- the microscope, in its own units ---------- */
  var MM = 2.74;              /* drawing units in one real millimetre */
  var AX = 415;               /* the optical axis: the lamp, the condenser, the objective in use */
  var SLIDE = 556;            /* the top of the slide, with the cells in focus at ×4 */
  var SHOULDER = SLIDE - 45 * MM;    /* where the objective in use meets the nosepiece */
  var OBJ = [
    { mag: 4,  len: 28,   wd: 17,  w: 34, tip: 22, ring: 'r4',  part: 'lowobj' },
    { mag: 10, len: 38,   wd: 7,   w: 33, tip: 18, ring: 'r10', part: 'midobj' },
    { mag: 40, len: 44.4, wd: 0.6, w: 31, tip: 11, ring: 'r40', part: 'highobj' }
  ];
  /* the sloping body tube: a prism inside the head turns the light from the axis into it, 30° from upright, towards the
     person at the microscope (on the right) */
  var PRISM = [AX, 318], TILT = 30;
  /* the double knob on the arm: the middle of the coarse part, the two radii, and how far each part stands out towards
     you (drawn a little from the side, so that the small fine part shows at the end of the wide coarse part) */
  var KNOB = { c: [214, 706], rc: 44, rf: 22, v: [-13, 9] };
  var SWITCH = [322, 886];    /* the light switch, on the side of the base */
  var VB = [104, 94, 470, 840];     /* the microscope's own box: x, y, width, height */
  var EDGE = [104, 572];            /* where the names' level lines leave the drawing, left and right */

  /* a point on the body tube's line, t units up it from the prism and s units across it (+ to its right) */
  function onTube(t, s) {
    var a = TILT * Math.PI / 180; s = s || 0;
    return [f2(PRISM[0] + s * Math.cos(a) + t * Math.sin(a)), f2(PRISM[1] + s * Math.sin(a) - t * Math.cos(a))];
  }

  /* one objective lens, hanging from (x, y), turned by `deg` (0 = straight down) */
  function objective(o, x, y, deg, cls) {
    var L = o.len * MM, w = o.w, t = o.tip;
    var s = '<g class="sc-part sc-obj ' + (cls || '') + '" data-part="' + o.part + '" transform="translate(' + f2(x) + ' ' + f2(y) + ') rotate(' + f2(-deg) + ')">';
    s += '<rect class="sc-metal" x="' + f2(-w / 2 + 3) + '" y="0" width="' + f2(w - 6) + '" height="8"/>';
    s += '<path class="sc-metal" d="M' + f2(-w / 2) + ' 8 H' + f2(w / 2) + ' V' + f2(L * 0.62) + ' L' + f2(t / 2) + ' ' + f2(L - 3) +
         ' Q' + f2(t / 2) + ' ' + f2(L) + ' ' + f2(t / 2 - 3) + ' ' + f2(L) + ' H' + f2(-t / 2 + 3) + ' Q' + f2(-t / 2) + ' ' + f2(L) + ' ' + f2(-t / 2) + ' ' + f2(L - 3) +
         ' L' + f2(-w / 2) + ' ' + f2(L * 0.62) + ' Z"/>';
    s += '<rect class="sc-ring ' + o.ring + '" x="' + f2(-w / 2) + '" y="' + f2(L * 0.5) + '" width="' + w + '" height="5"/>';
    s += '<text class="sc-engr" x="0" y="' + f2(L * 0.36) + '" text-anchor="middle">' + o.mag + '×</text>';
    s += '<rect class="sc-glass" x="' + f2(-t / 2 + 3) + '" y="' + f2(L - 2.5) + '" width="' + f2(t - 6) + '" height="2.5"/>';
    return s + '</g>';
  }

  /* one part of the double knob: a short cylinder standing out from (cx, cy) by v, seen a little from the side, so its
     ridged side shows; rot (degrees) turns the ridges as the knob turns */
  function knobPart(cx, cy, r, v, rot) {
    var fx = cx + v[0], fy = cy + v[1], L = Math.hypot(v[0], v[1]), nx = -v[1] / L * r, ny = v[0] / L * r, s = '';
    var side = function (a, b) { return f2(cx + a * nx) + ' ' + f2(cy + a * ny) + 'L' + f2(fx + b * nx) + ' ' + f2(fy + b * ny); };
    s += '<circle class="sc-knob" cx="' + f2(cx) + '" cy="' + f2(cy) + '" r="' + r + '"/>';
    s += '<path class="sc-knobside" d="M' + side(1, 1) + 'L' + f2(fx - nx) + ' ' + f2(fy - ny) + 'L' + f2(cx - nx) + ' ' + f2(cy - ny) + 'Z"/>';
    for (var i = 0; i < 24; i++) {
      var a = (rot + i * 15) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
      if (ca * v[0] + sa * v[1] > 0) continue;        /* on this half the ridges are behind the knob's own face */
      s += '<path class="sc-ridge" d="M' + f2(cx + r * ca) + ' ' + f2(cy + r * sa) + 'l' + f2(v[0]) + ' ' + f2(v[1]) + '"/>';
    }
    s += '<path class="sc-knobedge" d="M' + side(1, 1) + 'M' + side(-1, -1) + '"/>';
    s += '<circle class="sc-knobface" cx="' + f2(fx) + '" cy="' + f2(fy) + '" r="' + r + '"/>';
    s += '<circle class="sc-knurl" cx="' + f2(fx) + '" cy="' + f2(fy) + '" r="' + f2(r - 2.5) + '" stroke-dasharray="2.2 2.6" transform="rotate(' + f2(rot) + ' ' + f2(fx) + ' ' + f2(fy) + ')"/>';
    return s;
  }

  /* the whole microscope. o.sy moves the stage, with the slide, the clips, the condenser and the iris diaphragm, down (+)
     or up (−); o.sel is the objective in use (0 ×4, 1 ×10, 2 ×40); o.slide puts a slide on the stage; o.crack cracks it;
     o.on turns the lamp on; o.rc and o.rf turn the coarse and the fine part of the knob (degrees) */
  function art(o) {
    o = o || {};
    var sy = o.sy || 0, sel = o.sel || 0, s = '';
    function part(id, body) { return '<g class="sc-part" data-part="' + id + '">' + body + '</g>'; }
    /* a straight piece of the sloping tube, from t0 to t1 up it, hw wide on each side */
    function tube(t0, t1, hw, cls) { return '<rect class="' + cls + '" x="' + (-hw) + '" y="' + (-t1) + '" width="' + (2 * hw) + '" height="' + (t1 - t0) + '" rx="2"/>'; }
    var slope = '<g transform="translate(' + PRISM[0] + ' ' + PRISM[1] + ') rotate(' + TILT + ')">';

    /* the base, on its feet, with the light switch on its side */
    s += part('base', '<rect class="sc-dark" x="138" y="921" width="34" height="9" rx="3"/><rect class="sc-dark" x="484" y="921" width="34" height="9" rx="3"/>' +
      '<path class="sc-enamel" d="M120 924 H524 Q534 924 532 914 L522 866 Q519 852 505 852 H136 Q122 852 120 866 L116 914 Q114 924 120 924 Z"/>' +
      '<path class="sc-crease" d="M124 904 H524"/>');
    s += part('switch', '<ellipse class="sc-knob" cx="' + SWITCH[0] + '" cy="' + SWITCH[1] + '" rx="18" ry="14"/>' +
      '<path class="sc-swmark" d="M' + SWITCH[0] + ' ' + SWITCH[1] + 'v-10" transform="rotate(' + (o.on ? 50 : -50) + ' ' + SWITCH[0] + ' ' + SWITCH[1] + ')"/>');
    /* the lamp, an LED in the base, under the condenser: on, its glass glows and its light rises to the condenser */
    s += part('lamp', '<rect class="sc-dark" x="' + (AX - 34) + '" y="800" width="68" height="54" rx="4"/>' +
      '<path class="sc-rib" d="M' + (AX - 34) + ' 813h68M' + (AX - 34) + ' 826h68M' + (AX - 34) + ' 839h68"/>' +
      '<rect class="sc-dark" x="' + (AX - 27) + '" y="790" width="54" height="12" rx="3"/>' +
      '<rect class="sc-lamp' + (o.on ? ' is-on' : '') + '" x="' + (AX - 21) + '" y="785" width="42" height="6" rx="2"/>');
    /* the arm, its top reaching forward over the stage to carry the head */
    s += part('arm', '<path class="sc-enamel" d="M130 852 C114 772 110 650 130 560 C150 470 196 400 252 362 C282 342 318 336 352 336 H' + (AX + 46) +
      ' Q' + (AX + 52) + ' 336 ' + (AX + 52) + ' 342 V388 Q' + (AX + 52) + ' 394 ' + (AX + 46) + ' 394 H338 C306 396 286 414 280 450 L276 560 L275 852 Z"/>' +
      '<path class="sc-shade" d="M136 800 C124 720 124 640 140 572"/>');
    /* the body tube, sloping up out of the head, then the head over it, then the eyepiece lens at the tube's top */
    s += part('bodytube', slope + tube(30, 178, 19, 'sc-dark') + '</g>');
    s += part('head', slope + tube(0, 46, 25, 'sc-enamel') + '</g>' +
      '<path class="sc-enamel" d="M' + (AX - 48) + ' 338 V322 Q' + (AX - 48) + ' 298 ' + (AX - 20) + ' 296 H' + (AX + 14) + ' Q' + (AX + 44) + ' 298 ' + (AX + 44) + ' 322 V338 Z"/>');
    s += part('eyepiece', slope + tube(176, 186, 23, 'sc-metal') + tube(186, 228, 16, 'sc-dark') + tube(226, 238, 21, 'sc-dark') +
      '<rect class="sc-glass" x="-15" y="-240" width="30" height="3" rx="1.5"/>' +
      '<text class="sc-engr sc-engr--light" x="0" y="-203" text-anchor="middle">10×</text></g>');
    if (o.on) s += '<path class="sc-glow" d="M' + (AX - 20) + ' 786 L' + (AX - 30) + ' ' + f2(655 + sy) + ' H' + (AX + 30) + ' L' + (AX + 20) + ' 786 Z"/>';

    /* the stage, which the knob moves: the block that carries it up and down the arm, the condenser and the iris
       diaphragm under it, the slide on it and the clips */
    var st = '';
    st += part('condenser', '<rect class="sc-dark" x="' + (AX - 25) + '" y="594" width="50" height="50" rx="3"/>' +
      '<rect class="sc-metal" x="' + (AX - 27) + '" y="592" width="54" height="9" rx="2"/><path class="sc-edge" d="M' + (AX - 25) + ' 618 H' + (AX + 25) + '"/>');
    st += part('iris', '<rect class="sc-dark" x="' + (AX - 36) + '" y="646" width="72" height="9" rx="3"/>' +
      '<path class="sc-lever" d="M' + (AX + 34) + ' 652 L' + (AX + 60) + ' 662"/><circle class="sc-dark" cx="' + (AX + 67) + '" cy="666" r="10"/>');
    st += part('stage', '<rect class="sc-dark" x="266" y="588" width="72" height="74" rx="4"/><path class="sc-edge" d="M274 600 V650"/>' +
      '<rect class="sc-stage" x="282" y="560" width="284" height="30" rx="4"/><path class="sc-edge" d="M286 566 H562"/>');
    if (o.slide) {
      st += '<g class="sc-slidegrp"><rect class="sc-slide" x="336" y="' + SLIDE + '" width="168" height="4"/>' +
        '<rect class="sc-cover" x="' + (AX - 20) + '" y="' + f2(SLIDE - 1.6) + '" width="40" height="1.6"/>' +
        '<ellipse class="sc-spec" cx="' + AX + '" cy="' + f2(SLIDE + 0.6) + '" rx="13" ry="1.2"/>' +
        (o.crack ? '<path class="sc-crack" d="M' + (AX - 30) + ' ' + SLIDE + ' l14 4 l10 -4 l12 4 l9 -4 l13 4 l10 -4"/>' : '') + '</g>';
    }
    st += part('clips', '<rect class="sc-dark" x="338" y="535" width="14" height="25" rx="2"/><path class="sc-clip" d="M345 539 H382 Q391 539 392 553"/>' +
      '<rect class="sc-dark" x="479" y="535" width="14" height="25" rx="2"/><path class="sc-clip" d="M486 539 H449 Q440 539 439 553"/>');
    s += '<g class="sc-stagegrp" transform="translate(0 ' + f2(sy) + ')">' + st + '</g>';

    /* the double knob: the wide coarse part on the arm, the small fine part at its end, on the same axle */
    var K = KNOB, f1 = [K.c[0] + K.v[0], K.c[1] + K.v[1]];
    s += part('coarse', knobPart(K.c[0], K.c[1], K.rc, K.v, o.rc || 0));
    s += part('fine', knobPart(f1[0], f1[1], K.rf, K.v, o.rf || 0) +
      '<circle class="sc-metal" cx="' + f2(f1[0] + K.v[0]) + '" cy="' + f2(f1[1] + K.v[1]) + '" r="4"/>');

    /* the objective lenses and the nosepiece, under the head. The objective in use hangs straight down; of the other two,
       the next one is turned well away to the right and the last stands behind, to the left. */
    var right = (sel + 2) % 3, left = (sel + 1) % 3;
    s += '<g class="sc-objs">' + objective(OBJ[left], AX - 26, SHOULDER - 8, -33, 'is-back') + objective(OBJ[sel], AX, SHOULDER, 0, 'is-use') +
      objective(OBJ[right], AX + 40, SHOULDER - 18, 62, 'is-side') + '</g>';
    s += part('nosepiece', '<path class="sc-metal" d="M' + (AX - 46) + ' ' + f2(SHOULDER - 2) + ' L' + (AX - 40) + ' ' + f2(SHOULDER - 20) +
      ' Q' + (AX + 8) + ' ' + f2(SHOULDER - 40) + ' ' + (AX + 56) + ' ' + f2(SHOULDER - 34) + ' L' + (AX + 62) + ' ' + f2(SHOULDER - 18) +
      ' Q' + (AX + 10) + ' ' + f2(SHOULDER - 4) + ' ' + (AX - 46) + ' ' + f2(SHOULDER - 2) + ' Z"/><path class="sc-edge" d="M' + (AX - 40) + ' ' + f2(SHOULDER - 12) + ' Q' + (AX + 8) + ' ' + f2(SHOULDER - 30) + ' ' + (AX + 58) + ' ' + f2(SHOULDER - 25) + '"/>');
    return s;
  }

  /* ---------- the names: the point ON each part where its level line ends ----------
     side: the margin its name stands in. alts: other points on the same part, for when names would crowd. The objectives'
     points are those of the ×4 in use and the ×40 turned to the right. */
  var PARTS = {
    eyepiece:  { name: 'eyepiece lens',             at: [528, 146], side: 'R', alts: [[520, 160], [536, 132]] },
    bodytube:  { name: 'body tube',                 at: [480, 229], side: 'R', alts: [[465, 255], [495, 203]] },
    nosepiece: { name: 'nosepiece',                 at: [AX + 58, f2(SHOULDER - 27)], side: 'R', alts: [[AX + 40, f2(SHOULDER - 30)], [AX + 24, f2(SHOULDER - 33)]] },
    highobj:   { name: 'high-power objective lens', label: 'high-power objective', at: [553, 472], side: 'R', alts: [[536, 462], [519, 452], [503, 442]] },
    lowobj:    { name: 'low-power objective lens',  label: 'low-power objective', at: [AX + 11, 505], side: 'R', alts: [[AX + 11, 510], [AX + 13, 496], [AX + 15, 488]] },
    clips:     { name: 'clips',                     at: [491, 550], side: 'R', alts: [[486, 546], [470, 539]] },
    stage:     { name: 'stage',                     at: [562, 584], side: 'R', alts: [[562, 576], [562, 568]] },
    condenser: { name: 'condenser',                 at: [AX + 25, 628], side: 'R', alts: [[AX + 25, 608], [AX + 25, 618], [AX + 25, 638]] },
    iris:      { name: 'iris diaphragm',            at: [AX + 73, 666], side: 'R', alts: [[AX + 60, 662], [AX + 50, 657]] },
    lamp:      { name: 'lamp',                      at: [AX + 30, 826], side: 'R', alts: [[AX + 30, 814], [AX + 30, 840]] },
    base:      { name: 'base',                      at: [524, 900], side: 'R', alts: [[516, 880], [520, 912]] },
    arm:       { name: 'arm',                       at: [146, 540], side: 'L', alts: [[140, 600], [160, 480], [178, 440]] },
    coarse:    { name: 'coarse adjustment knob',    at: [201, 677], side: 'L', alts: [[207, 671], [195, 683]] },
    fine:      { name: 'fine adjustment knob',      at: [186, 740], side: 'L', alts: [[184, 734], [189, 744]] },
    switch:    { name: 'light switch',              at: [314, 886], side: 'L', alts: [[316, 880], [316, 892]] }
  };
  /* where a question's hotspot ring (and, on the Learn tab, a press) finds each part: its middle and a radius, in the same
     units. Each ring lies on its own part and on no other (Daniel, 25 Oct 2026: "land perfectly on where that object is …
     not just on another section"): fitted with tools/hotspots.mjs --fit, the largest ring wholly on the part, and proved
     by tools/hotspots.mjs. A small part (a clip, the iris diaphragm's lever, the light switch) gets a small ring round it,
     touching nothing else. The coarse ring sits on the wide part beside the fine part, never round both. */
  var HIT = {
    eyepiece: [518.5, 139.7, 15], bodytube: [468, 227, 18], nosepiece: [AX + 10, f2(SHOULDER - 21), 13], highobj: [512, 447, 14],
    lowobj: [AX, 478, 16], clips: [345, 542, 13], stage: [528, 575, 14], condenser: [AX, 619, 22], iris: [AX + 67, 666, 13],
    lamp: [AX, 820, 28], switch: [SWITCH[0], SWITCH[1], 13], base: [200, 898, 24], coarse: [224, 683, 15], fine: [188, 724, 19],
    arm: [180, 560, 30]
  };
  /* the order of the parts: the fine part of the knob after the coarse part, so its press is on top */
  var ORDER = ['eyepiece', 'bodytube', 'nosepiece', 'lowobj', 'highobj', 'clips', 'stage', 'condenser', 'iris', 'lamp', 'switch', 'coarse', 'fine', 'arm', 'base'];
  /* the letters of the questions' lettered drawing: down the right-hand names, then the left */
  var LETTER = { eyepiece: 'A', bodytube: 'B', nosepiece: 'C', highobj: 'D', lowobj: 'E', clips: 'F', stage: 'G', condenser: 'H',
                 iris: 'I', lamp: 'J', base: 'K', arm: 'L', coarse: 'M', fine: 'N', switch: 'O' };

  function defs(id) {
    return '<defs>' +
      '<linearGradient id="' + id + 'm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9AA3AB"/><stop offset=".35" stop-color="#EEF1F3"/><stop offset=".6" stop-color="#C9CFD5"/><stop offset="1" stop-color="#8A939C"/></linearGradient>' +
      '<linearGradient id="' + id + 'e" x1="0" y1="0" x2="1" y2="0"><stop offset="0" class="sc-e0"/><stop offset=".45" class="sc-e1"/><stop offset="1" class="sc-e2"/></linearGradient>' +
      '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E9F3FA"/><stop offset="1" stop-color="#9FC2DA"/></linearGradient>' +
      '<linearGradient id="' + id + 'w" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFE27A" stop-opacity=".9"/><stop offset="1" stop-color="#FFF4C2" stop-opacity=".2"/></linearGradient>' +
      '</defs>';
  }
  /* the gradients are per picture (several can be on one page), so their names go in through a style on the svg */
  function paint(id) { return '--sc-metal:url(#' + id + 'm);--sc-enamel:url(#' + id + 'e);--sc-glassfill:url(#' + id + 'g);--sc-glow:url(#' + id + 'w)'; }
  function picture(id, inner, cls, vb, label) {
    return '<svg class="sc-svg ' + (cls || '') + '" viewBox="' + vb.map(f2).join(' ') + '" style="' + paint(id) + '" role="img" aria-label="' + esc(label || 'A light microscope') + '">' + defs(id) + inner + '</svg>';
  }

  /* ---------- the names on a picture, sized to read at about 14 px ----------
     Words in the two margins on a laptop; on a phone, when words would leave the drawing under three quarters of the
     width, numbered pins beside the parts and a key under the picture (the Cells Lab's rule, js/views/cell.js). Every
     name must show (this station is the names), so a size at which the margins would leave one out is never used. */
  function wrap(t, n) {
    var out = [], cur = '';
    String(t).split(' ').forEach(function (w) { var tr = cur ? cur + ' ' + w : w; if (tr.length > n && cur) { out.push(cur); cur = w; } else cur = tr; });
    if (cur) out.push(cur);
    return out;
  }
  function longest(keys, side, n) {
    return keys.filter(function (k) { return PARTS[k].side === side; }).reduce(function (m, k) {
      return Math.max(m, wrap(PARTS[k].label || PARTS[k].name, n).reduce(function (a, l) { return Math.max(a, l.length); }, 0)); }, 0);
  }

  /* ================= station "Parts of the microscope" ================= */
  function partsView(spec, ctx) {
    var root = h('div', 'sparts');
    var id = uid();
    var stage = h('div', 'sparts__stage');
    stage.innerHTML = picture(id, '<g class="sparts__art"></g><g class="sparts__hits"></g><g class="sparts__labs"></g>', 'sparts__svg', VB,
      'A light microscope, its fifteen parts named. Press a part or its name to read what it does.');
    root.appendChild(stage);
    var svg = stage.firstChild, artG = svg.querySelector('.sparts__art'), hitG = svg.querySelector('.sparts__hits'), labG = svg.querySelector('.sparts__labs');
    var key = h('ol', 'sparts__key'); key.hidden = true; root.appendChild(key);
    root.appendChild(h('p', 'sparts__hide', 'The names are hidden while you practise. They are on the Learn tab.'));
    var keys = ORDER.slice(), lit = null;

    keys.forEach(function (k) {
      var c = HIT[k], e = sv('circle', { cx: c[0], cy: c[1], r: c[2], class: 'sparts__hit', 'data-part': k, tabindex: '-1' });
      e.addEventListener('click', function () { ctx.pick(k, { stay: true }); });
      hitG.appendChild(e);
    });
    /* a press anywhere on a part's own drawing opens its card too, so a press lands on the part under the finger; the
       circles above only make the small parts easy to hit. The unnamed head and the ×10 lens open nothing. */
    artG.addEventListener('click', function (ev) {
      if (practising()) return;
      var g = ev.target.closest && ev.target.closest('[data-part]'), k = g && g.getAttribute('data-part');
      if (k && PARTS[k]) ctx.pick(k, { stay: true });
    });

    /* The sizes to try, in order, for this box: names in words in the margins (on a laptop), then numbered pins with a
       key under the picture, then smaller pins. A phone's picture scrolls with the page at its full width
       (css/cells.css), so there only the width sizes it. */
    var WR = 20, WL = 11;
    function plans(box) {
      /* measured on the whole view, never on the picture: the key under the picture takes height from it, and a
         measure that moved with the key would swap words and pins back and forth */
      /* pins: on a laptop the key stands beside the picture (one column, 200 px), on a phone under it */
      var narrow = box.width < 520, out = [], r = { width: box.width - 16, height: box.height - 16 },
          rp = narrow ? { width: r.width, height: r.height - 150 } : { width: r.width - 210, height: r.height };
      var wl = longest(keys, 'L', WL), wr = longest(keys, 'R', WR), f = 26, L, R, ppu;
      for (var n = 0; n < 5; n++) {
        L = f * 0.56 * wl + 34; R = f * 0.56 * wr + 34;
        ppu = Math.min(r.width / (VB[2] + L + R), r.height / (VB[3] + 16));
        f = Math.max(18, Math.min(64, 14 / ppu));
      }
      /* words, at about 14 px, then a little smaller (words beside the parts teach the names best: memory
         label-lines-never-cross); the margins are sized for each size */
      if (!(narrow && VB[2] * ppu / r.width < 0.75)) [1, 0.92, 0.85].forEach(function (k) {
        var fk = f * k, Lk = fk * 0.56 * wl + 34, Rk = fk * 0.56 * wr + 34;
        out.push({ mode: 'words', F: fk, vb: [VB[0] - Lk, VB[1] - 8, VB[2] + Lk + Rk, VB[3] + 16] });
      });
      var fp = 26, pc = 0;
      for (var m = 0; m < 4; m++) {
        pc = fp * 1.6;
        var pp = narrow ? rp.width / (VB[2] + 2 * pc + 20) : Math.min(rp.width / (VB[2] + 2 * pc + 20), rp.height / (VB[3] + 16));
        fp = Math.max(16, Math.min(60, 13 / pp));
      }
      var vb = [VB[0] - pc - 10, VB[1] - 8, VB[2] + 2 * pc + 20, VB[3] + 16];
      [1, 0.9, 0.8, 0.7].forEach(function (k) { out.push({ mode: 'pins', F: fp * k, vb: vb, beside: !narrow }); });
      out.push({ mode: 'pins', F: fp * 0.7, vb: vb, beside: !narrow, noAlts: true });   /* last: no other points, a short jog keeps every name */
      return out;
    }
    function items(noAlts) {
      return keys.map(function (k) {
        var p = PARTS[k];
        return { id: k, text: p.label || p.name, x: p.at[0], y: p.at[1], side: p.side, alts: noAlts ? null : p.alts, cls: lit === k ? 'is-lit' : (lit ? 'is-dim' : '') };
      });
    }
    function wire(g, k) {
      g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0');
      g.setAttribute('aria-label', PARTS[k].name + ': open its card');
      g.addEventListener('click', function () { ctx.pick(k, { stay: true }); });
      g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ctx.pick(k, { stay: true }); } });
    }
    /* draws the names one way; returns how many it could stand */
    function render(pl) {
      var C = global.CircLearn, it = items(pl.noAlts), F = pl.F;
      var base = { font: F, top: VB[1] + 4, bottom: VB[1] + VB[3] - 4, gap: F * 0.28, left: EDGE[0], right: EDGE[1] };
      svg.setAttribute('viewBox', pl.vb.map(f2).join(' '));
      if (pl.mode === 'words') {
        labG.innerHTML = C.labels(Object.assign({}, base, { items: it.filter(function (x) { return x.side === 'L'; }), width: F * 0.56 * WL })) +
                         C.labels(Object.assign({}, base, { items: it.filter(function (x) { return x.side === 'R'; }), width: F * 0.56 * WR }));
        key.innerHTML = '';
        return labG.querySelectorAll('.lb').length;
      }
      var res = C.pinLabels(Object.assign({}, base, { items: it }));
      labG.innerHTML = res.svg;
      var byText = {}; it.forEach(function (x) { byText[x.text] = x.id; });
      key.innerHTML = res.order.map(function (o) { var k = byText[o.text]; return '<li data-lab="' + k + '" class="' + (lit === k ? 'is-lit' : '') + '"><span class="sparts__n">' + o.n + '</span>' + esc(o.text) + '</li>'; }).join('');
      return res.order.length;
    }
    function practising() { return document.documentElement.getAttribute('data-lab-tab') === 'do'; }
    function draw() {
      if (practising()) {
        svg.setAttribute('viewBox', f2(VB[0] - 8) + ' ' + f2(VB[1] - 8) + ' ' + f2(VB[2] + 16) + ' ' + f2(VB[3] + 16));
        labG.innerHTML = ''; key.innerHTML = ''; key.hidden = true; root.classList.remove('is-pins', 'is-beside'); return;
      }
      var r = root.getBoundingClientRect(); if (!r.width || !r.height) return;
      var P = plans(r), used = P[P.length - 1];
      for (var i = 0; i < P.length; i++) { if (render(P[i]) >= keys.length) { used = P[i]; break; } if (i === P.length - 1) render(P[i]); }
      key.hidden = used.mode !== 'pins';
      root.classList.toggle('is-pins', used.mode === 'pins');
      root.classList.toggle('is-beside', used.mode === 'pins' && !!used.beside);
      Array.prototype.forEach.call(labG.querySelectorAll('.lb'), function (g) { wire(g, g.getAttribute('data-lab')); });
      Array.prototype.forEach.call(key.children, function (li) { wire(li, li.getAttribute('data-lab')); });
    }
    /* the drawing, with the lamp on while the lamp's or the switch's card is open */
    function light() {
      artG.innerHTML = art({ slide: true, on: lit === 'lamp' || lit === 'switch' });
      svg.classList.toggle('is-lit', !!lit);
      Array.prototype.forEach.call(artG.querySelectorAll('.sc-part'), function (g) { g.classList.toggle('is-lit', !!lit && g.getAttribute('data-part') === lit); });
    }
    var lastW = 0, lastH = 0;
    if (global.ResizeObserver) new global.ResizeObserver(function () {
      var r = root.getBoundingClientRect();
      if (Math.abs(r.width - lastW) < 1 && Math.abs(r.height - lastH) < 1) return;
      lastW = r.width; lastH = r.height; draw();
    }).observe(root);
    if (global.MutationObserver) new global.MutationObserver(function () { draw(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lab-tab'] });
    var api = {
      el: root, say: 'A light microscope with a lamp in its base', credit: 'Drawing: made for this lab',
      labels: (function () { var o = {}; keys.forEach(function (k) { o[k] = PARTS[k].name; }); return o; })(),
      focus: function (part) {
        var parts = [].concat(part || []);
        lit = parts.length && PARTS[parts[0]] ? parts[0] : null;
        light(); draw();
      },
      start: function () { draw(); },
      stop: function () {}
    };
    light(); draw();
    return api;
  }
  global.Views.add('scopeparts', partsView);

  /* ================= station "Using the microscope" ================= */
  /* Daniel's way to focus (his Year 9 sheet, and 25 Oct 2026: "Always the lowest magnification, moving the coarse knob
     until you see whatever it is in your slide … then you use the fine knob. Then you move to a higher magnification,
     and then you only use the fine knob. You don't use the coarse knob"), on the school's microscope: its lamp must be
     turned on first ("they need to turn on the light"), and its knob moves the stage. His pupils start above the lowest
     power and turn the coarse knob all the time, so the picture REFUSES those moves: the knob or the nosepiece does not
     move, a red banner blinks and says why, and three beeps sound ("a red label, beep, beep, beep … blinking").
     The state: z is how far the stage stands below the ×4's focus, in hundredths of a millimetre; each objective is sharp
     a little lower (ZF: parfocal, but not perfectly), within its depth of focus (TOL). Within SEE of the ×4's focus the
     specimen shows as a blur of colour; further away the view is only light. The coarse knob moves the stage 2 mm a turn
     and is never level with the focus, so the fine knob always finishes the job. */
  var ZF = [0, 30, 40], TOL = [60, 15, 6], SEE = 300, COARSE = 200, FINE = 5, ZMAX = 3000, Z0 = 650, NUDGE = 300;
  var STEPS = [
    { look: 'eye',  t: 'Press the <b>light switch</b> on the base, so that the <b>lamp</b> under the stage shines.' },
    { look: 'eye',  t: 'The last class left the ×40 objective lens in place. Turn the <b>nosepiece</b> to the lowest-power objective lens, ×4. <u>Always start here.</u>' },
    { look: 'side', t: 'Look from the side, not through the eyepiece. Turn the <b>coarse adjustment knob</b> (the wide part) ▲ to raise the stage, until the slide almost touches the lens.' },
    { look: 'eye',  t: 'Look through the eyepiece. Turn the <b>coarse adjustment knob</b> ▼ slowly, to lower the stage, until you see colour. Cannot tell? Move the slide a little with your fingers: what moves is your specimen.' },
    { look: 'eye',  t: 'You can see the specimen. <u>Now turn only the</u> <b>fine adjustment knob</b> (the small part of the knob), until the cells are sharp.' },
    { look: 'eye',  t: 'Turn the <b>nosepiece</b> to ×10. Then turn <u>only the</u> <b>fine adjustment knob</b>.' },
    { look: 'eye',  t: 'Turn the <b>nosepiece</b> to ×40 (×400 in all). Then turn <u>only the</u> <b>fine adjustment knob</b>.' },
    { look: 'eye',  t: '<b>Done:</b> sharp at ×400. You lit the lamp, started at the lowest power, found the specimen with the coarse knob, and finished with the fine knob only.' }
  ];
  /* the light's path for "Follow the light", with the stage sy units down: up from the lamp, through the iris diaphragm,
     the condenser, the slide and the objective lens, into the head, where a prism turns it up the body tube */
  function beamPts(sy) {
    return [[AX, 786], [AX, f2(655 + sy)], [AX, f2(592 + sy)], [AX, f2(SLIDE + sy)], [AX, f2(SHOULDER)], PRISM, onTube(178), onTube(238)];
  }
  /* the point where each step of "Follow the light" stops: the lamp, the condenser, the specimen, the objective lens,
     the body tube, the eyepiece lens */
  var BEAM_STOP = [1, 2, 3, 4, 6, 7];

  /* three short beeps, made in the browser (a press is what starts the sound, so a browser allows it) */
  var AC = null;
  function beep() {
    try {
      var C = global.AudioContext || global.webkitAudioContext; if (!C) return;
      AC = AC || new C();
      if (AC.state === 'suspended') AC.resume();
      var t0 = AC.currentTime + 0.02;
      for (var i = 0; i < 3; i++) {
        var o = AC.createOscillator(), g = AC.createGain(), t = t0 + i * 0.17;
        o.type = 'square'; o.frequency.value = 880;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
        o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + 0.13);
      }
    } catch (e) {}
  }

  function useView(spec, ctx) {
    var root = h('div', 'suse');
    /* the red banner: a small pop-up over the pictures, below the step (Daniel, 25 Oct 2026: "It should be below … on top
       of the two circles as a pop-up smaller"), so nothing on the page moves when it shows */
    var alarm = h('div', 'suse__alarm'); alarm.setAttribute('role', 'alert');
    var step = h('div', 'suse__step'); step.setAttribute('aria-live', 'polite');
    root.appendChild(step);
    var grid = h('div', 'suse__grid');
    var scopeBox = h('div', 'suse__scope'), eyeBox = h('figure', 'suse__eye'), sideBox = h('figure', 'suse__side');
    grid.appendChild(scopeBox); grid.appendChild(eyeBox); grid.appendChild(sideBox); grid.appendChild(alarm);
    root.appendChild(grid);
    /* a wide, short space for the pictures (a laptop): the microscope, the eyepiece and the side view in one row, so the
       two round views are not squeezed one above the other (css/cells.css .suse__grid.is-wide). The grid's size comes
       from the column, never from its pictures, so the class cannot make it change size again. */
    if (global.ResizeObserver) new global.ResizeObserver(function () {
      var r = grid.getBoundingClientRect();
      if (r.width && r.height) grid.classList.toggle('is-wide', r.width > r.height * 1.45);
    }).observe(grid);
    var ctl = h('div', 'suse__ctl');
    ctl.innerHTML =
      '<span class="suse__g" data-part="switch" role="group" aria-label="The light switch"><span class="suse__k">Light switch</span><span class="suse__ks">Light</span>' +
        '<button type="button" class="suse__b suse__sw" data-light="1" aria-pressed="false">Off</button></span>' +
      '<span class="suse__g" data-part="nosepiece" role="group" aria-label="Turn the nosepiece to an objective lens"><span class="suse__k">Nosepiece</span>' +
        OBJ.map(function (o, i) { return '<button type="button" class="suse__b" data-obj="' + i + '" aria-pressed="false">×' + o.mag + '</button>'; }).join('') + '</span>' +
      '<span class="suse__g" data-part="coarse" role="group" aria-label="The coarse adjustment knob"><span class="suse__k">Coarse adjustment knob</span><span class="suse__ks">Coarse</span>' +
        '<button type="button" class="suse__b" data-knob="coarse" data-dir="1" aria-label="Coarse adjustment knob: raise the stage">▲</button>' +
        '<button type="button" class="suse__b" data-knob="coarse" data-dir="-1" aria-label="Coarse adjustment knob: lower the stage">▼</button></span>' +
      '<span class="suse__g" data-part="fine" role="group" aria-label="The fine adjustment knob"><span class="suse__k">Fine adjustment knob</span><span class="suse__ks">Fine</span>' +
        '<button type="button" class="suse__b" data-knob="fine" data-dir="1" aria-label="Fine adjustment knob: raise the stage">▲</button>' +
        '<button type="button" class="suse__b" data-knob="fine" data-dir="-1" aria-label="Fine adjustment knob: lower the stage">▼</button></span>' +
      '<span class="suse__g" data-part="stage" role="group" aria-label="Move the slide with your fingers"><span class="suse__k">Slide (your fingers)</span><span class="suse__ks">Slide</span>' +
        '<button type="button" class="suse__b" data-slide="-1" aria-label="Move the slide up a little">▲</button>' +
        '<button type="button" class="suse__b" data-slide="1" aria-label="Move the slide down a little">▼</button></span>' +
      '<button type="button" class="vbtn suse__again">↺ Start again</button>';
    root.appendChild(ctl);
    var msg = h('p', 'suse__msg'); msg.setAttribute('aria-live', 'polite');
    root.appendChild(msg);

    var st = null;
    /* the microscope as the last class left it: the light off, the ×40 objective lens in place */
    function reset() {
      st = { on: false, sel: 2, z: Z0, dy: 0, crashed: false, k: 0, rc: 0, rf: 0, beam: -1, beamPart: null, hover: null }; say(''); stopAlarm();
      Array.prototype.forEach.call(ctl.querySelectorAll('.suse__g.is-wrong'), function (g) { g.classList.remove('is-wrong'); });
    }
    function gap(sel) { return OBJ[sel].wd * 100 + st.z; }                 /* hundredths of a mm */
    function d(sel) { return Math.abs(st.z - ZF[sel]); }
    function blurOf() {
      if (st.crashed) return 8;
      var e = d(st.sel), t = TOL[st.sel];
      if (e <= t) return 0;
      if (st.sel === 0) return e <= SEE ? 2 + (e - t) / (SEE - t) * 6 : 14;
      return Math.min(14, 1.6 + (e - t) / (t * 2) * 3);
    }
    function done(k) {
      switch (k) {
        case 0: return st.on;
        case 1: return st.on && st.sel === 0;
        case 2: return st.sel === 0 && gap(0) <= 300;
        case 3: return st.sel === 0 && d(0) <= SEE;
        case 4: return st.sel === 0 && d(0) <= TOL[0];
        case 5: return st.sel === 1 && d(1) <= TOL[1];
        case 6: return st.sel === 2 && d(2) <= TOL[2];
      }
      return false;
    }
    function advance() { while (st.k < STEPS.length - 1 && done(st.k)) st.k++; }
    function say(t, cls) { msg.innerHTML = t || ''; msg.className = 'suse__msg' + (cls ? ' ' + cls : ''); }
    var alarmT = null;
    function stopAlarm() { alarm.classList.remove('is-on'); alarm.innerHTML = ''; if (alarmT) clearTimeout(alarmT); alarmT = null; }
    /* a move refused: the red banner blinks, three beeps, and the control that was pressed shakes */
    function refuse(text, part) {
      alarm.innerHTML = '<span class="suse__ai" aria-hidden="true">!</span><span>' + text + '</span>';
      alarm.classList.remove('is-on'); void alarm.offsetWidth; alarm.classList.add('is-on');
      beep(); stopRepeat();
      var g = part && ctl.querySelector('[data-part="' + part + '"]');
      if (g) { g.classList.remove('is-wrong'); void g.offsetWidth; g.classList.add('is-wrong'); }
      if (alarmT) clearTimeout(alarmT);
      alarmT = setTimeout(function () { alarm.classList.remove('is-on'); }, 9000);
    }

    var ids = { a: uid(), b: uid() };
    function paintAll() {
      var sy = st.z / 100 * MM, look = STEPS[st.k].look;
      /* while "Follow the light" plays, the lamp in the drawing glows; the view through the eyepiece shows only what the
         light switch does */
      var o = { sy: sy, sel: st.sel, slide: true, crack: st.crashed, on: st.on || st.beam > 0, rc: st.rc, rf: st.rf };
      var beam = '';
      if (st.beam > 0) {
        var P = beamPts(sy), dd = [0];
        for (var i = 1; i < P.length; i++) dd.push(dd[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
        var stops = [0].concat(BEAM_STOP.map(function (j) { return dd[j]; }));
        var k = Math.min(stops.length - 2, Math.floor(st.beam)), want = stops[k] + (stops[k + 1] - stops[k]) * Math.min(1, st.beam - k), pts = [P[0]];
        for (var j = 1; j < P.length; j++) {
          if (dd[j] <= want) { pts.push(P[j]); continue; }
          var t = (want - dd[j - 1]) / (dd[j] - dd[j - 1]);
          if (t > 0) pts.push([P[j - 1][0] + (P[j][0] - P[j - 1][0]) * t, P[j - 1][1] + (P[j][1] - P[j - 1][1]) * t]);
          break;
        }
        if (want > 0) beam = '<polyline class="suse__beam" points="' + pts.map(function (p) { return f2(p[0]) + ',' + f2(p[1]); }).join(' ') + '"/>';
      }
      var lit2 = st.beamPart || st.hover;
      /* the round lens on the gap: halfway between the end of the objective lens and the slide */
      var tip = SHOULDER + OBJ[st.sel].len * MM, cx = AX, cy = f2((tip + SLIDE + sy) / 2), lr = 70;
      scopeBox.innerHTML = picture(ids.a, '<g class="suse__art">' + art(o) + '</g>' + beam +
        '<circle class="suse__lensbox" cx="' + cx + '" cy="' + cy + '" r="' + lr + '"/>', 'suse__svg' + (lit2 ? ' is-lit' : ''), [VB[0] - 6, VB[1] - 6, VB[2] + 12, VB[3] + 12],
        'The microscope from the side. The stage moves up and down when you turn the adjustment knob.');
      if (lit2) Array.prototype.forEach.call(scopeBox.querySelectorAll('.suse__art .sc-part'), function (g) {
        g.classList.toggle('is-lit', lit2 === 'lowobj' ? g.classList.contains('is-use') : g.getAttribute('data-part') === lit2); });
      /* a round lens: the drawing clipped to a circle inside its own square, so it stays round in any box */
      var gp = gap(st.sel);
      sideBox.classList.toggle('is-watch', look === 'side');
      sideBox.innerHTML = '<div class="suse__loupe">' + picture(ids.b, '<clipPath id="' + ids.b + 'c"><circle cx="' + cx + '" cy="' + cy + '" r="' + lr + '"/></clipPath>' +
        '<circle class="suse__lbg" cx="' + cx + '" cy="' + cy + '" r="' + lr + '"/><g clip-path="url(#' + ids.b + 'c)">' + art(o) + '</g>' +
        '<circle class="suse__lring" cx="' + cx + '" cy="' + cy + '" r="' + lr + '"/>', 'suse__lsvg', [cx - lr - 4, cy - lr - 4, 2 * lr + 8, 2 * lr + 8],
        'Close up, from the side: the end of the objective lens and the slide.') + '</div>' +
        '<figcaption>' + (look === 'side' ? '<span class="suse__watch">Watch here</span> ' : '') + '<b>From the side</b> · ' + (st.crashed ? 'the slide hit the lens' : 'gap: ' + (gp >= 1000 ? Math.round(gp / 100) : (Math.round(gp / 10) / 10)) + ' mm') + '</figcaption>';
      var blur = blurOf(), on = st.on;
      eyeBox.innerHTML = '<div class="suse__fov' + (look === 'side' ? ' is-side' : '') + '"><svg viewBox="0 0 600 600" role="img" aria-label="' +
        (!on ? 'The view through the eyepiece: dark, because the light is off.' :
          st.crashed ? 'The view through the eyepiece: the slide is cracked.' : blur >= 14 ? 'The view through the eyepiece: only light, the specimen is far out of focus.' :
          blur ? 'The view through the eyepiece: a blur of green, the specimen is close to the focus.' : 'The view through the eyepiece: the cells of the pondweed leaf are sharp.') + '">' +
        /* far out of focus a real microscope shows only light: the specimen fades out as the blur reaches its most, so what
           a pupil sees is the whole clue (Daniel, 25 Oct 2026: they "decide on if you see something focus") */
        (on ? global.Pondweed.view(OBJ[st.sel].mag, { round: true, dy: st.dy, blur: blur, op: blur > 10 ? (14 - blur) / 4 : 1, over: st.crashed ? '<path class="suse__crackv" d="M60 380 L210 300 L260 340 L420 210 L540 250"/>' : '' }) :
          '<circle cx="300" cy="300" r="292" class="pw-dark"/><circle cx="300" cy="300" r="282" class="pw-rim"/>') + '</svg>' +
        '</div>' +
        '<figcaption><b>Through the eyepiece</b> · ' + (on ? 'total magnification 10 × ' + OBJ[st.sel].mag + ' = <b>×' + (10 * OBJ[st.sel].mag) + '</b>' : 'dark: the light is off') + '</figcaption>';
      step.innerHTML = '<span class="suse__n">' + (st.k < STEPS.length - 1 ? 'Step ' + (st.k + 1) + ' of ' + (STEPS.length - 1) : 'Well done') + '</span><span class="suse__t">' + STEPS[st.k].t + '</span>';
      step.classList.toggle('is-done', st.k === STEPS.length - 1);
      var sw = ctl.querySelector('[data-light]');
      sw.setAttribute('aria-pressed', st.on ? 'true' : 'false'); sw.textContent = st.on ? 'On' : 'Off';
      Array.prototype.forEach.call(ctl.querySelectorAll('[data-obj]'), function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-obj') === st.sel ? 'true' : 'false'); b.disabled = st.crashed; });
      Array.prototype.forEach.call(ctl.querySelectorAll('[data-knob],[data-slide]'), function (b) { b.disabled = st.crashed; });
    }
    /* dir: for a knob, +1 raises the stage and −1 lowers it; for the slide, the way it moves; for the nosepiece, the
       objective lens */
    function act(kind, dir) {
      if (st.crashed) return;
      var before = st.k, note = '';
      if (kind === 'light') {
        st.on = !st.on;
        if (!st.on) note = 'The light is off: through the eyepiece you see nothing.';
      } else if (kind === 'obj') {
        if (dir === st.sel) return;
        /* found = the specimen in view at ×4 now, however the pupil got there (Daniel, 25 Oct 2026: he raised the stage, saw
           the cells on the way and was refused ×10, because only the sheet's path, close from the side and then back,
           counted) */
        var found = st.k >= 4 || (st.sel === 0 && st.on && d(0) <= SEE);
        if (dir !== 0 && !found) return refuse('Not yet. First find the specimen with the lowest-power objective lens, ×4.', 'nosepiece');
        if (dir === 2 && st.sel === 0) return refuse('Change one objective lens at a time: turn to ×10 first.', 'nosepiece');
        st.sel = dir;
        /* the pupil decides when the cells look sharp (Daniel, 25 Oct 2026: "You should just basically decide on if you see
           something focus"): turning to the next lens moves the steps on, sharp or not */
        if (dir === 1 && st.k <= 4) st.k = 5;
        if (dir === 2 && st.k === 5) st.k = 6;
        if (gap(st.sel) < 0) st.crashed = true;          /* a longer lens swung over a slide that is too close */
      } else if (kind === 'slide') {
        st.dy = Math.max(-2 * NUDGE, Math.min(2 * NUDGE, st.dy + dir * NUDGE));
        var e = d(st.sel);
        note = !st.on ? 'You moved the slide, but you cannot see it: the light is off.' :
          st.sel === 0 && e > SEE ? 'You moved the slide, but nothing in the view moved: the specimen is still far out of focus.' :
          st.sel === 0 && e > TOL[0] ? 'Something green moved: that is your specimen. You are close to the focus now.' : '';
      } else {
        if (!st.on) return refuse('Stop! First light the lamp: press the light switch on the base.', 'switch');
        if (st.k < 2) return refuse('Stop! You are starting the wrong way. Always start with the lowest-power objective lens: turn the nosepiece to ×4 first.', 'nosepiece');
        if (kind === 'coarse') {
          if (st.sel !== 0) return refuse('Stop! At ×' + (10 * OBJ[st.sel].mag) + ' turn only the fine adjustment knob. The coarse knob moves the stage much too far: the slide can hit the lens and crack.', 'coarse');
          if (dir > 0 && st.k >= 3) return refuse('Stop! Looking through the eyepiece, never raise the stage: you cannot see the gap. Turn the coarse knob only to lower the stage (▼).', 'coarse');
          if (st.k >= 4) return refuse('Stop! You can see the specimen already. Now turn only the fine adjustment knob.', 'coarse');
          st.z = Math.min(ZMAX, st.z - dir * COARSE); st.rc += dir * 24;
        } else {
          st.z = Math.min(ZMAX, st.z - dir * FINE); st.rf += dir * 24;
          if (st.sel === 0 && d(0) > SEE) note = 'The fine knob moves the stage only a tiny distance. First find the specimen with the coarse knob.';
        }
        if (gap(st.sel) < 0) st.crashed = true;
      }
      stopAlarm();
      Array.prototype.forEach.call(ctl.querySelectorAll('.suse__g.is-wrong'), function (g) { g.classList.remove('is-wrong'); });
      if (st.crashed) {
        stopRepeat();
        say('The slide hit the lens and cracked. A real slide breaks, and the lens can be scratched. Press <b>Start again</b>, and raise the stage only while you look from the side.', 'is-warn');
      } else {
        advance();
        /* a new step: a knob held down stops, so the next move is the pupil's own */
        if (st.k !== before) stopRepeat();
        if (note) say(note);
        else if (st.k === 2 && kind === 'coarse') say('The slide is ' + (Math.round(gap(0) / 10) / 10) + ' mm from the lens.');
        else if (st.k !== before) say('');
      }
      paintAll();
    }
    /* press and hold a knob: it keeps turning (a refused move or a new step stops it) */
    var rep = null, repT = null;
    function stopRepeat() { if (rep) clearInterval(rep); if (repT) clearTimeout(repT); rep = repT = null; }
    Array.prototype.forEach.call(ctl.querySelectorAll('[data-knob]'), function (b) {
      var go = function () { act(b.getAttribute('data-knob'), +b.getAttribute('data-dir')); };
      b.addEventListener('pointerdown', function (ev) { if (ev.button) return; ev.preventDefault(); stopRepeat(); var k0 = st.k; go(); if (alarm.classList.contains('is-on') || st.k !== k0) return; repT = setTimeout(function () { rep = setInterval(go, 140); }, 380); });
      ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(function (e) { b.addEventListener(e, stopRepeat); });
      b.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(); } });
    });
    ctl.querySelector('[data-light]').addEventListener('click', function () { act('light'); });
    Array.prototype.forEach.call(ctl.querySelectorAll('[data-obj]'), function (b) { b.addEventListener('click', function () { act('obj', +b.getAttribute('data-obj')); }); });
    Array.prototype.forEach.call(ctl.querySelectorAll('[data-slide]'), function (b) { b.addEventListener('click', function () { act('slide', +b.getAttribute('data-slide')); }); });
    /* a control lights its own part on the drawing while the pointer is on it (memory few-choices-for-students: a control
       and what it acts on belong together) */
    Array.prototype.forEach.call(ctl.querySelectorAll('.suse__g'), function (g) {
      var part = g.getAttribute('data-part');
      g.addEventListener('pointerenter', function () { st.hover = part; paintAll(); });
      g.addEventListener('pointerleave', function () { st.hover = null; paintAll(); });
    });
    ctl.querySelector('.suse__again').addEventListener('click', function () { stopRepeat(); reset(); paintAll(); });

    reset(); paintAll();
    var api = {
      el: root, say: 'A light microscope from the side, the gap under the objective lens, and the view through the eyepiece',
      credit: 'Drawings: made for this lab · the specimen: a leaf of Canadian pondweed',
      labels: {},
      focus: function () {},
      /* the light's path, for "Follow the light": s steps of it shown (0 to 6, a fraction part way; 0 = not started), the
         part reached lit */
      light: function (s, part) { st.beam = s; st.beamPart = part || null; paintAll(); },
      stop: function () { stopRepeat(); if (st.beam >= 0) { st.beam = -1; st.beamPart = null; paintAll(); } }
    };
    return api;
  }
  global.Views.add('scopeuse', useView);

  /* ================= the drawings for the questions ================= */
  global.CircLearn.diagram('scope', function (v) {
    var id = uid();
    if (v === 'letters') {
      var its = ORDER.map(function (k) { var p = PARTS[k]; return { id: k, text: LETTER[k], x: p.at[0], y: p.at[1], side: p.side, alts: p.alts }; });
      /* every letter must show: the largest size at which none is left out */
      var labs = '', F;
      for (F = 26; F >= 14; F -= 2) {
        labs = global.CircLearn.labels({ items: its, font: F, top: VB[1] + 4, bottom: VB[1] + VB[3] - 4, gap: F * 0.25, left: EDGE[0], right: EDGE[1], width: F * 2 });
        if ((labs.match(/class="lb /g) || []).length >= its.length) break;
      }
      return picture(id, art({ slide: true }) + '<g class="sc-letters">' + labs + '</g>', 'hs__fig sc-fig', [EDGE[0] - 40, VB[1] - 8, EDGE[1] - EDGE[0] + 80, VB[3] + 16],
        'A light microscope with fifteen parts lettered A to O.');
    }
    return picture(id, art({ slide: true }), 'hs__fig sc-fig', VB, 'A light microscope.');
  });

  /* ---------- Follow the light: the steps on the right, the light on the picture on the left ---------- */
  var L = global.CircLearn;
  if (L && L.add) L.add('lightpath', function (spec) {
    var box = L.h('div', 'widget lp');
    box.appendChild(L.head(spec.title || 'Follow the light', spec.ask || 'Press Play. Each step stops until you press Next step.'));
    var S = (spec.steps || []).map(function (s, i) { return { t: i * 4, h: s.h, p: s.p, part: s.part }; });
    var END = S.length * 4;
    function view() { var v = global.Plate && global.Plate.current && global.Plate.current(); return v && v.light ? v : null; }
    var sp = L.stepper({
      steps: S, end: END,
      render: function (t) {
        var v = view(); if (!v) return;
        if (t <= 0) { v.light(0, null); return; }
        var k = Math.min(S.length - 1, Math.floor(t / 4)), within = Math.min(1, (t - k * 4) / 2.4);
        v.light(k + within, S[k].part);
      }
    });
    box.appendChild(sp.bar);
    box.appendChild(sp.list);
    box.appendChild(sp.now);
    sp.paint(0);
    box.__seek = sp.seek;
    return box;
  });

  global.ScopeArt = { art: art, PARTS: PARTS, HIT: HIT, ORDER: ORDER, LETTER: LETTER, OBJ: OBJ, VB: VB, EDGE: EDGE, MM: MM, AX: AX, SLIDE: SLIDE,
                      SHOULDER: SHOULDER, PRISM: PRISM, onTube: onTube, defs: defs, paint: paint, picture: picture, uid: uid };
})(window);
