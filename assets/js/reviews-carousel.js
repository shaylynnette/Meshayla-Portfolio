/* Approved reviews carousel (vanilla ES6). Reads /api/reviews. The section stays hidden until at least
   one review is approved. All text is inserted with textContent, never as HTML. */
(function () {
  'use strict';
  var sec = document.getElementById('reviews'); if (!sec) return;
  var rail = sec.querySelector('.pv-rail'), prev = sec.querySelector('.pv-prev'), next = sec.querySelector('.pv-next'), cnt = sec.querySelector('.pv-count');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function el(tag, cls, t) { var n = document.createElement(tag); if (cls) n.className = cls; if (t != null) n.textContent = t; return n; }
  function initials(n) { var w = String(n).trim().split(/\s+/); return ((w[0] || '')[0] || '').toUpperCase() + ((w[1] || '')[0] || '').toUpperCase(); }
  function safe(p) { return /^\/api\/review-photo\/[a-z0-9]+\/[1-3]$/.test(p); }

  var lb = document.createElement('dialog'); lb.className = 'rv-lb'; lb.setAttribute('aria-label', 'Photo');
  var lbImg = document.createElement('img'), lbX = el('button', '', '×'); lbX.type = 'button'; lbX.setAttribute('aria-label', 'Close photo');
  lbX.addEventListener('click', function () { lb.close(); }); lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  lb.appendChild(lbImg); lb.appendChild(lbX); document.body.appendChild(lb);

  fetch('/api/reviews').then(function (r) { return r.ok ? r.json() : { reviews: [] }; }).then(function (d) {
    var list = d.reviews || []; if (!list.length) return;
    list.forEach(function (r) {
      var fig = el('figure', 'pv-card'), body = el('div', 'pv-body');
      body.appendChild(el('span', 'pv-tag', r.what));
      if (r.rating) { var s = el('div', 'rv-stars-out'); s.setAttribute('role', 'img'); s.setAttribute('aria-label', r.rating + ' out of 5 stars'); s.textContent = '★'.repeat(r.rating); if (r.rating < 5) s.appendChild(el('span', '', '★'.repeat(5 - r.rating))); body.appendChild(s); }
      var bq = document.createElement('blockquote'); bq.appendChild(el('p', 'rv-text', r.text)); body.appendChild(bq);
      var pics = (r.photos || []).filter(safe);
      if (pics.length) {
        var row = el('div', 'rv-pics');
        pics.forEach(function (u, i) {
          var b = el('button'); b.type = 'button'; b.setAttribute('aria-label', 'Open photo ' + (i + 1) + ' from ' + r.name);
          var im = el('img'); im.src = u; im.alt = ''; im.loading = 'lazy'; b.appendChild(im);
          b.addEventListener('click', function () { lbImg.src = u; lbImg.alt = 'Photo shared by ' + r.name; if (lb.showModal) lb.showModal(); else window.open(u, '_blank', 'noopener'); });
          row.appendChild(b);
        });
        body.appendChild(row);
      }
      if (r.reply && r.reply.text) { var rp = el('div', 'rv-reply'); rp.appendChild(el('b', '', 'Reply from Meshayla')); rp.appendChild(el('p', '', r.reply.text)); body.appendChild(rp); }
      var cap = document.createElement('figcaption'), ring = el('span', 'cl-ring'); ring.setAttribute('aria-hidden', 'true'); ring.appendChild(el('b', '', initials(r.name)));
      var who = el('div'); who.appendChild(el('strong', '', r.name)); who.appendChild(el('span', '', r.date));
      cap.appendChild(ring); cap.appendChild(who); body.appendChild(cap); fig.appendChild(body); rail.appendChild(fig);
    });
    sec.hidden = false;
    var cards = [].slice.call(rail.querySelectorAll('.pv-card')), step = function () { return cards[0].getBoundingClientRect().width + 18; };
    function sync() {
      var max = rail.scrollWidth - rail.clientWidth - 4; prev.disabled = rail.scrollLeft <= 4; next.disabled = rail.scrollLeft >= max;
      var rr = rail.getBoundingClientRect(), a = 0, z = 0;
      cards.forEach(function (c, i) { var b = c.getBoundingClientRect(); if (b.left >= rr.left - 8 && b.right <= rr.right + 8) { if (!a) a = i + 1; z = i + 1; } });
      if (a) cnt.textContent = (a === z ? a : a + '–' + z) + ' of ' + cards.length;
    }
    prev.addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { rail.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    rail.addEventListener('scroll', function () { requestAnimationFrame(sync); }, { passive: true }); window.addEventListener('resize', sync); sync();
  }).catch(function () { /* API unavailable (for example a local preview): the section stays hidden */ });
})();
