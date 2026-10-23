/* Shared interaction layer for meshayla.com (vanilla ES6, no dependencies).
   Everything degrades gracefully: without JS the page is fully readable. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* 1. Nav depth on scroll + back-to-top visibility (one passive listener) */
  var nav = document.querySelector('nav');
  var topBtn = document.createElement('button');
  topBtn.type = 'button';
  topBtn.className = 'to-top';
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.textContent = '↑ Top';
  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
  document.body.appendChild(topBtn);
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (nav) nav.classList.toggle('scrolled', y > 40);
      topBtn.classList.toggle('show', y > 700);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 2. Scroll reveal (IntersectionObserver replaces jQuery Waypoints) */
  if (hasIO && !reduce) {
    var targets = $$('[data-reveal], .card, .proj, .row, .stat, .s-pill, .s-h2, .s-body');
    var seen = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        /* reveal when visible, or when already scrolled past (fast jumps and anchor links) */
        if (e.isIntersecting || e.boundingClientRect.top < 0) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el, i) {
      if (seen.has(el)) return; seen.add(el);
      el.classList.add('js-reveal');
      el.style.setProperty('--d', ((i % 4) * 0.06) + 's');
      io.observe(el);
    });
  }

  /* 3. Scroll-spy: highlight the nav link for the section in view (hash links only) */
  var spyLinks = $$('nav .nav-links a[href^="#"]').filter(function (a) { return a.getAttribute('href').length > 1; });
  if (hasIO && spyLinks.length) {
    var map = {};
    spyLinks.forEach(function (a) {
      var t = document.getElementById(a.getAttribute('href').slice(1));
      if (t) map[t.id] = a;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || !map[e.target.id]) return;
        spyLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
        map[e.target.id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    Object.keys(map).forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  /* 4. Count-up stats: [data-count] keeps its final value in the HTML */
  function fmt(n, el) { return (el.dataset.prefix || '') + Math.round(n) + (el.dataset.suffix || ''); }
  var counters = $$('[data-count]');
  if (counters.length) {
    if (!hasIO || reduce) {
      counters.forEach(function (el) { el.textContent = fmt(+el.dataset.count, el); });
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target, end = +el.dataset.count, start = performance.now(), dur = 1200;
          cio.unobserve(el);
          (function step(now) {
            var p = Math.min((now - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = fmt(end * eased, el);
            if (p < 1) requestAnimationFrame(step);
          })(start);
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { el.textContent = fmt(0, el); cio.observe(el); });
    }
  }

  /* 5. Build filter: buttons toggle cards by data-status */
  var fwrap = document.querySelector('[data-filters]');
  if (fwrap) {
    var cards = $$('[data-fitem]');
    var counter = fwrap.querySelector('.fcount');
    var btns = $$('.fbtn[data-filter]', fwrap);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.dataset.filter, shown = 0;
        btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        cards.forEach(function (c) {
          var have = c.dataset.status.split(' ');
          var ok = f === 'all' || f.split(',').some(function (w) { return have.indexOf(w) > -1; });
          c.hidden = !ok; if (ok) { shown++; c.classList.add('in'); }
        });
        if (counter) counter.textContent = 'Showing ' + shown + ' of ' + cards.length + ' projects';
      });
    });
  }

  /* 5b. Project detail dialogs, sub-nav spy, skills accordion on small screens */
  $$('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () {
      var d = document.getElementById(b.dataset.open);
      if (d && d.showModal) { d.showModal(); document.body.classList.add('dlg-open'); }
    });
  });
  $$('dialog.pdialog').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    d.addEventListener('close', function () { document.body.classList.remove('dlg-open'); });
    var x = d.querySelector('[data-close]'); if (x) x.addEventListener('click', function () { d.close(); });
  });
  if (window.matchMedia('(max-width:960px)').matches) $$('.srow').forEach(function (d) { d.open = false; });
  var snLinks = $$('.subnav a[href^="#"]');
  if (hasIO && snLinks.length) {
    var snMap = {};
    snLinks.forEach(function (a) { snMap[a.getAttribute('href').slice(1)] = a; });
    var snIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { snLinks.forEach(function (a) { a.classList.remove('on'); }); snMap[e.target.id].classList.add('on'); }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(snMap).forEach(function (id) { var el = document.getElementById(id); if (el) snIO.observe(el); });
  }

  /* 6. Clickable architecture diagrams: select a node to see what it does */
  $$('.diagram').forEach(function (fig) {
    var nodes = $$('.node', fig);
    if (!nodes.length) return;
    var info = document.createElement('p');
    info.className = 'dinfo';
    info.setAttribute('role', 'status');
    info.textContent = 'Select any box in the diagram to see what it does.';
    var cap = fig.querySelector('figcaption');
    fig.insertBefore(info, cap);
    function pick(n) {
      nodes.forEach(function (x) { x.classList.toggle('active', x === n); });
      info.innerHTML = '';
      var s = document.createElement('strong');
      s.textContent = n.getAttribute('aria-label') + ': ';
      info.appendChild(s);
      info.appendChild(document.createTextNode(n.dataset.info));
    }
    nodes.forEach(function (n) {
      n.addEventListener('click', function () { pick(n); });
      n.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(n); }
      });
    });
  });

  /* 7. Screenshot viewer (native <dialog>) and expand/collapse all project details */
  var lb = document.getElementById('lightbox');
  if (lb && lb.showModal) {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.lb-cap');
    $$('.shot-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        lbImg.src = b.dataset.full; lbImg.alt = b.dataset.alt || ''; lbCap.textContent = b.dataset.alt || '';
        lb.showModal();
      });
    });
    lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  }
  var tog = document.getElementById('toggle-details');
  if (tog) {
    tog.addEventListener('click', function () {
      var open = tog.getAttribute('aria-pressed') !== 'true';
      $$('.proj details.more').forEach(function (d) { d.open = open; });
      tog.setAttribute('aria-pressed', String(open));
      tog.textContent = open ? 'Collapse all details' : 'Expand all details';
    });
  }
})();
