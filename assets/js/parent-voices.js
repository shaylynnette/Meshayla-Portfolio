/* Parent video reviews (vanilla ES6). Renders approved reviews from /assets/data/parent-reviews.json
   into the sideways carousel. The section stays hidden unless at least one review has written consent,
   a video file and a captions file, so nothing unfinished is ever shown. Text is inserted with
   textContent, never as HTML. */
(function () {
  'use strict';
  var sec = document.getElementById('parent-voices');
  if (!sec) return;
  var rail = sec.querySelector('.pv-rail'), prev = sec.querySelector('.pv-prev'), next = sec.querySelector('.pv-next'), cnt = sec.querySelector('.pv-count');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }
  function safePath(p) { return typeof p === 'string' && /^\/assets\/[A-Za-z0-9._\/-]+$/.test(p) && p.indexOf('..') === -1; }
  function initials(name) { var w = String(name).trim().split(/\s+/); return ((w[0] || '')[0] || '').toUpperCase() + ((w[1] || '')[0] || '').toUpperCase(); }

  fetch('/assets/data/parent-reviews.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : { reviews: [] }; }).then(function (data) {
    var list = (data.reviews || []).filter(function (r) { return r && r.consent === true && r.name && safePath(r.video) && safePath(r.captions); });
    if (!list.length) return;
    list.forEach(function (r) {
      var fig = el('figure', 'pv-card');
      var vid = el('div', 'pv-vid'), v = document.createElement('video');
      v.controls = true; v.preload = 'none'; v.setAttribute('playsinline', '');
      v.setAttribute('aria-label', 'Video review from ' + r.name);
      if (safePath(r.poster)) v.poster = r.poster;
      var s = document.createElement('source'); s.src = r.video; s.type = 'video/mp4'; v.appendChild(s);
      var t = document.createElement('track'); t.kind = 'captions'; t.src = r.captions; t.srclang = 'en'; t.label = 'English'; t.default = true; v.appendChild(t);
      vid.appendChild(v); fig.appendChild(vid);
      var body = el('div', 'pv-body');
      if (r.academy) body.appendChild(el('span', 'pv-tag', r.academy));
      if (r.quote) { var bq = document.createElement('blockquote'); bq.appendChild(el('p', '', r.quote)); body.appendChild(bq); }
      var cap = document.createElement('figcaption'), ring = el('span', 'cl-ring'); ring.setAttribute('aria-hidden', 'true'); ring.appendChild(el('b', '', initials(r.name)));
      var who = document.createElement('div'); who.appendChild(el('strong', '', r.name)); if (r.role) who.appendChild(el('span', '', r.role));
      cap.appendChild(ring); cap.appendChild(who); body.appendChild(cap); fig.appendChild(body); rail.appendChild(fig);
    });
    sec.hidden = false;
    var cards = [].slice.call(rail.querySelectorAll('.pv-card'));
    var step = function () { return cards[0].getBoundingClientRect().width + 18; };
    function sync() {
      var max = rail.scrollWidth - rail.clientWidth - 4; prev.disabled = rail.scrollLeft <= 4; next.disabled = rail.scrollLeft >= max;
      var rr = rail.getBoundingClientRect(), first = 0, last = 0;
      cards.forEach(function (c, i) { var b = c.getBoundingClientRect(); if (b.left >= rr.left - 8 && b.right <= rr.right + 8) { if (!first) first = i + 1; last = i + 1; } });
      if (first) cnt.textContent = (first === last ? first : first + '–' + last) + ' of ' + cards.length;
    }
    prev.addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { rail.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    rail.addEventListener('scroll', function () { requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener('resize', sync); sync();
  }).catch(function () { /* no data file or offline: the section simply stays hidden */ });
})();
