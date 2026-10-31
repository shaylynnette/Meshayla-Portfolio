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
