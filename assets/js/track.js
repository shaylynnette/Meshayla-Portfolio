/* Click tracking for meshayla.com. Any element with [data-track="name"] reports a click to every
   analytics provider installed on the page (Umami, Plausible or a dataLayer). With none installed it
   does nothing, and it never changes what the click does, so links and downloads behave normally. */
(function () {
  'use strict';
  function track(name) {
    try {
      if (window.umami && typeof window.umami.track === 'function') window.umami.track(name);
      if (typeof window.plausible === 'function') window.plausible(name);
      if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: name });
    } catch (err) { /* analytics must never break navigation */ }
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-track]');
    if (t) track(t.getAttribute('data-track'));
  });
})();
