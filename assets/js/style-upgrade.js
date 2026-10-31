/* Marks the page for scroll reveals and reveals items as they enter view. No dependencies. */
(function () {
  'use strict';
  var items = [].slice.call(document.querySelectorAll('.rv-up'));
  if (!items.length || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js-rv');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  items.forEach(function (n, i) { n.style.setProperty('--d', ((i % 4) * 0.08) + 's'); io.observe(n); });
})();

/* Big play button on the intro video */
(function () {
  'use strict';
  var btn = document.querySelector('.hv-play'), v = btn && btn.parentNode.querySelector('video');
  if (!btn || !v) return;
  btn.addEventListener('click', function () { btn.hidden = true; var p = v.play(); if (p && p.catch) p.catch(function () { btn.hidden = false; }); });
  v.addEventListener('play', function () { btn.hidden = true; });
  v.addEventListener('ended', function () { btn.hidden = false; });
})();
