/* ============================================================
   sw.template.js — the offline worker every engine lab shares.

   tools/build.mjs fills in the four placeholders below — the lab's name, this build's
   version, the list of stamped files, and a hash per picture — and writes the result to that
   lab's repo root as sw.js. Its scope is therefore exactly /<lab>/ on Pages:
   the most a worker gets by default, this lab and nothing above it. Never edit sw.js.

   ---------------------------------------------------------------------------
   THE ONE DECISION THAT MATTERS: the HTML document is fetched NETWORK-FIRST.

   A service worker on GitHub Pages is the one change that cannot be undone by pushing a fix,
   because we cannot set response headers. The way that goes wrong is always the same: the
   worker serves a cached index.html forever, and every later deploy is invisible. The usual
   defence is a version banner and a kill switch, and the usual result is that a class sits on
   a stale page for a lesson while someone works out why.

   So this worker never prefers the cache for the document while the network is reachable. It
   asks the network first, with a short timeout, and only falls back to what it holds when
   that fails. Online, a student sees exactly what they see today. Offline, they get the lab.

   Everything else IS cache-first, and safely so, because every other URL is immutable by
   construction: index.html carries a ?v= stamp on every script and stylesheet, and the stamp
   changes whenever the file does, so a cached ?v=1 file can never stand in for ?v=2. Pictures
   are keyed by a hash of their own bytes for the same reason.

   The cost is one small document fetch per online load (15–20 KB; the Classification Lab's is
   about 230 KB, with its silhouettes inlined, and less over gzip). That is the price of making the
   unrecoverable failure impossible, and it is worth paying.
   ---------------------------------------------------------------------------

   Cache names are prefixed with the lab, because every lab — and the hubs, and the other
   sites — share the origin nlcsbiology.com and therefore share one CacheStorage.
   ============================================================ */
const LAB        = 'cells-lab';
const VERSION    = '1792847481';
const SHELL      = LAB + '-shell-v' + VERSION;
const MEDIA      = LAB + '-media';
const PRECACHE   = ["./css/app.css?v=1792847481","./css/cells.css?v=1792847481","./js/config.js?v=1792847481","./js/data/glossary.js?v=1792847481","./js/data/syllabus.js?v=1792847481","./js/data/stations.js?v=1792847481","./js/data/photos.js?v=1792847481","./js/terms.js?v=1792847481","./js/marking.js?v=1792847481","./js/sync.js?v=1792847481","./js/signin.js?v=1792847481","./js/homework.js?v=1792847481","./js/engine.js?v=1792847481","./js/syllabus.js?v=1792847481","./js/widgets.js?v=1792847481","./js/learn.js?v=1792847481","./js/w-common.js?v=1792847481","./js/engine-ext.js?v=1792847481","./js/plate.js?v=1792847481","./js/views/microscope.js?v=1792847481","./js/views/magnify.js?v=1792847481","./js/views/levels.js?v=1792847481","./js/views/units.js?v=1792847481","./js/views/cell.js?v=1792847481","./js/views/compare.js?v=1792847481","./js/views/specialised.js?v=1792847481","./js/views/drawing.js?v=1792847481","./js/views/measure.js?v=1792847481","./js/app.js?v=1792847481"];      /* every stamped .js and .css, taken from the HTML the build just stamped */
const MEDIA_REV  = {"photos/bacillus-lm.jpg":"496500f1","photos/bacillus-section-900.jpg":"4ddf2451","photos/bacillus-section-900.webp":"be6dc0d5","photos/cell-animal.svg":"b6bbe7cd","photos/cell-bacterium.svg":"d9c0845c","photos/cell-plant.svg":"bead2fac","photos/cervix-cell-lm.jpg":"011def09","photos/cheek-cell.jpg":"fea76d7d","photos/cheek-cell.webp":"8fc3c837","photos/cheek-cells-900.jpg":"6dd32f5e","photos/cheek-cells-900.webp":"ae27bbdf","photos/ciliated-cells-900.jpg":"a36df991","photos/ciliated-cells-900.webp":"582b625b","photos/connective-tissue-900.jpg":"75814fee","photos/connective-tissue-900.webp":"4f84f1c3","photos/drawn-cell-photo.jpg":"9b96504b","photos/ecoli-900.jpg":"db38befe","photos/ecoli-900.webp":"193d8d8d","photos/egg-cell-900.jpg":"d294ebe1","photos/egg-cell-900.webp":"a18ac9ef","photos/elodea-900.jpg":"c1a84747","photos/elodea-900.webp":"c1f78aa0","photos/elodea-cells.jpg":"1e74ef34","photos/hela-em.jpg":"a67c356c","photos/hela-em.webp":"e24b9007","photos/level-cell-900.jpg":"7056e580","photos/level-cell-900.webp":"955bc1d9","photos/level-organ-900.jpg":"a6a3fd8a","photos/level-organ-900.webp":"2afca879","photos/level-organism-900.jpg":"4bfb2739","photos/level-organism-900.webp":"78b5c81e","photos/level-system-900.jpg":"caac2af5","photos/level-system-900.webp":"48906372","photos/level-tissue-900.jpg":"f598edb4","photos/level-tissue-900.webp":"17f43d19","photos/microscope-900.jpg":"058a09ab","photos/microscope-900.webp":"119bf86e","photos/neurone-x100-900.jpg":"9ea03f16","photos/neurone-x100-900.webp":"9932c3ad","photos/neurone-x40-900.jpg":"5f627cdd","photos/neurone-x40-900.webp":"2b43f2d8","photos/neurone-x400-900.jpg":"3b919326","photos/neurone-x400-900.webp":"8fedf502","photos/palisade-cells-900.jpg":"58339eb2","photos/palisade-cells-900.webp":"47ac489f","photos/plant-leaf-900.jpg":"0525cd4a","photos/plant-leaf-900.webp":"3dab0c53","photos/plant-leaf-section-900.jpg":"99170ee6","photos/plant-leaf-section-900.webp":"7e200657","photos/plant-seedling-900.jpg":"bb54476b","photos/plant-seedling-900.webp":"0f7a8fd9","photos/real-animal.jpg":"653ee1fc","photos/real-bacteria.jpg":"f6b505b7","photos/real-plant.jpg":"e05660df","photos/red-blood-cells-900.jpg":"08ace178","photos/red-blood-cells-900.webp":"297b01b5","photos/rhoeo-water-wide.jpg":"aa5c71a4","photos/rhoeo-water.jpg":"445ca459","photos/root-hair-900.jpg":"8fc43dba","photos/root-hair-900.webp":"427dd2b1","photos/size-animal.svg":"f9146377","photos/size-bacterium.svg":"ed69b399","photos/size-plant.svg":"f2694c6a","photos/sperm-drawing-900.jpg":"7700d0fa","photos/sperm-drawing-900.webp":"c84519ae"};     /* 'photos/x.jpg' -> a short hash of its bytes */
const DOC_TIMEOUT = 3000;

/* ---------- install: take a complete, self-consistent copy ---------- */
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const c = await caches.open(SHELL);
    /* cache:'reload' is not optional. A Request built from a plain string uses the default
       cache mode, so './' would come from the browser's own HTTP cache — which Pages lets it
       hold for ten minutes — while the never-before-seen ?v= urls come from the network. That
       pairs an old document with new files, which is the exact failure this worker exists to
       avoid. */
    const doc = await fetch('./', { cache: 'reload' });
    if (!doc.ok) throw new Error('index responded ' + doc.status);
    await c.put('./', doc.clone());
    await c.addAll(PRECACHE);
    /* And then check what is ACTUALLY in the cache, not what the server said. If the document
       we hold does not name this worker's own version, throw: a failed install simply never
       activates, and the lab goes on behaving exactly as it does without a worker. */
    const held = await (await c.match('./')).text();
    const m = held.match(/stations\.js\?v=(\d+)/);
    if (!m || m[1] !== VERSION) {
      await caches.delete(SHELL);
      throw new Error('cached index is v' + (m && m[1]) + ' but this worker is v' + VERSION);
    }
  })());
});

/* ---------- activate: drop this lab's old shells, and only this lab's ---------- */
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const k of await caches.keys())
      if (k.indexOf(LAB + '-shell-v') === 0 && k !== SHELL) await caches.delete(k);
    /* forget pictures that are no longer in the build */
    const media = await caches.open(MEDIA);
    const want = new Set(Object.keys(MEDIA_REV).map(p => p + '?r=' + MEDIA_REV[p]));
    for (const req of await media.keys()) {
      const u = new URL(req.url);
      const rel = u.pathname.split('/assets/')[1];
      if (rel && !want.has(rel + u.search)) await media.delete(req);
    }
    /* clients.matchAll is scoped to the ORIGIN, not to this worker: every lab lives on
       nlcsbiology.com, so an unfiltered broadcast would pop a "newer version" banner in
       ANOTHER lab's tab, whose Reload button would then do nothing for ever. */
    const cs = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    for (const c of cs)
      if (c.url.indexOf(self.registration.scope) === 0)
        c.postMessage({ type: 'VERSION', lab: LAB, version: VERSION });
  })());
});

self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });

/* ---------- fetch ---------- */
function inScope(url) { return url.href.indexOf(self.registration.scope) === 0; }

async function fromNetworkFirst(request) {
  /* the document. Online it is always the live one; offline it is the last one we held. */
  const cache = await caches.open(SHELL);
  try {
    const net = await Promise.race([
      fetch(request, { cache: 'no-store' }),
      new Promise((_, no) => setTimeout(() => no(new Error('slow')), DOC_TIMEOUT))
    ]);
    if (net && net.ok) { cache.put('./', net.clone()); return net; }
    throw new Error('document responded ' + (net && net.status));
  } catch (e) {
    const held = await cache.match('./');
    if (held) return held;
    throw e;
  }
}

async function cacheFirst(request, cacheName) {
  /* Anything unexpected in here — CacheStorage refused in a private window, quota, a bug —
     must end in an ordinary network fetch. A respondWith that rejects does not fall back to
     the network: it fails the request outright, which would be a blank lab. */
  try {
    const cache = await caches.open(cacheName);
    const hit = await cache.match(request);
    if (hit) return hit;
    const net = await fetch(request);
    if (net && net.ok && net.type === 'basic') cache.put(request, net.clone());
    return net;
  } catch (e) {
    return fetch(request);
  }
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  /* A Range request is how Safari on iOS plays and scrubs a video. Answering one from a whole
     cached body breaks playback silently on exactly that browser, so never touch them. */
  if (req.headers.has('range')) return;
  const url = new URL(req.url);
  /* cross-origin — the Google sign-in client, the font stylesheet — is never this worker's
     business. Letting it through untouched is what keeps sign-in working. */
  if (url.origin !== location.origin || !inScope(url)) return;

  if (req.mode === 'navigate') { event.respondWith(fromNetworkFirst(req)); return; }

  const rel = url.pathname.slice(new URL(self.registration.scope).pathname.length);

  /* stamped code: the url changes whenever the file does, so the cache can never be stale */
  if (url.search.indexOf('v=') >= 0 && /\.(js|css)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(req, SHELL)); return;
  }
  /* pictures, video posters, silhouettes: keyed by a hash of their own bytes */
  if (rel.indexOf('assets/') === 0) {
    const key = rel.slice('assets/'.length);
    const rev = MEDIA_REV[key];
    if (rev) {
      const keyed = new Request(url.origin + url.pathname + '?r=' + rev, { mode: 'same-origin' });
      event.respondWith((async () => {
        try {
          const cache = await caches.open(MEDIA);
          const hit = await cache.match(keyed);
          if (hit) return hit;
          const net = await fetch(req);
          /* the put has to be held open by the event: mobile Chrome and iOS Safari stop the
             worker the moment respondWith settles, so a detached put is dropped on exactly
             the devices this is for, while working every time on a Mac. */
          if (net && net.ok && net.type === 'basic') event.waitUntil(cache.put(keyed, net.clone()));
          return net;
        } catch (e) { return fetch(req); }
      })());
      return;
    }
  }
  /* version.txt above all: it is how the page learns a deploy has happened */
  /* everything else goes straight to the network */
});
