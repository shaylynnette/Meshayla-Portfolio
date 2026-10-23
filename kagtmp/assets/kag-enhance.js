/* Kemp Advisory Group: light interactivity. No libraries; runs after the catalog renders. */
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* side-scroll rows with arrows */
  function rails() {
    $$("[data-rail]").forEach(function (el) {
      if (el.parentNode.classList.contains("railwrap")) return;
      var wrap = document.createElement("div"); wrap.className = "railwrap";
      el.parentNode.insertBefore(wrap, el); wrap.appendChild(el); el.classList.add("rail");
      el.setAttribute("tabindex", "0"); el.setAttribute("role", "region");
      el.setAttribute("aria-label", el.getAttribute("data-rail") + " (scroll sideways)");
      var sec = el.closest("section"), head = sec && sec.querySelector(".block-head");
      var ctl = document.createElement("div"); ctl.className = "railctl";
      ctl.innerHTML = '<span class="rhint">Scroll for more</span><button type="button" class="rbtn" aria-label="Scroll left">&#8592;</button><button type="button" class="rbtn" aria-label="Scroll right">&#8594;</button>';
      (head || wrap).appendChild(ctl);
      var b = ctl.querySelectorAll("button"), hint = ctl.querySelector(".rhint");
      function step() { var c = el.querySelector(".card,figure"); return c ? c.getBoundingClientRect().width + 18 : 300; }
      function upd() {
        var max = el.scrollWidth - el.clientWidth - 4;
        b[0].disabled = el.scrollLeft <= 4; b[1].disabled = el.scrollLeft >= max;
        ctl.style.display = max <= 0 ? "none" : "";
      }
      b[0].onclick = function () { el.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" }); };
      b[1].onclick = function () { el.scrollBy({ left: step(), behavior: reduce ? "auto" : "smooth" }); };
      el.addEventListener("scroll", function () { requestAnimationFrame(upd); }, { passive: true });
      window.addEventListener("resize", upd); upd();
      if (el.hasAttribute("data-dots")) {
        var d = document.createElement("div"); d.className = "dots"; var kids = $$(":scope > *", el);
        kids.forEach(function (k, i) { var x = document.createElement("button"); x.type = "button"; x.setAttribute("aria-label", "Slide " + (i + 1)); x.onclick = function () { el.scrollTo({ left: k.offsetLeft - el.offsetLeft, behavior: "smooth" }); }; d.appendChild(x); });
        wrap.appendChild(d);
        var dd = d.children;
        el.addEventListener("scroll", function () { var i = Math.round(el.scrollLeft / el.clientWidth); for (var j = 0; j < dd.length; j++) dd[j].setAttribute("aria-current", j === i); }, { passive: true });
        dd[0].setAttribute("aria-current", "true");
      }
    });
  }

  /* section nav highlights the section in view */
  function snav() {
    var links = $$(".snav a"); if (!links.length || !("IntersectionObserver" in window)) return;
    var map = {}; links.forEach(function (a) { var t = document.querySelector(a.getAttribute("href")); if (t) map[a.getAttribute("href")] = t; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { var on = map[a.getAttribute("href")] === e.target; a.setAttribute("aria-current", on); if (on && a.scrollIntoView) { var w = a.parentNode; w.scrollTo({ left: a.offsetLeft - 60, behavior: "auto" }); } }); });
    }, { rootMargin: "-30% 0px -60% 0px" });
    Object.keys(map).forEach(function (k) { io.observe(map[k]); });
  }

  /* count-up numbers and chart arcs when scrolled into view */
  function counters() {
    var els = $$("[data-count-to]"), arcs = $$("[data-arc]");
    function run(el) {
      var to = parseFloat(el.getAttribute("data-count-to")), suf = el.getAttribute("data-suffix") || "", dec = (String(to).split(".")[1] || "").length;
      var fmt = function (v) { return v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; };
      if (reduce) { el.textContent = fmt(to); return; }
      var t0 = null; function f(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(to * e); if (p < 1) requestAnimationFrame(f); } requestAnimationFrame(f);
    }
    function arc(el) { var c = parseFloat(el.getAttribute("data-c")); el.setAttribute("stroke-dasharray", (c * parseFloat(el.getAttribute("data-arc")) / 100).toFixed(1) + " " + c.toFixed(1)); }
    els.forEach(function (e) { e.textContent = (e.getAttribute("data-count-to") > 0 ? "0" : "0") + (e.getAttribute("data-suffix") || ""); });
    arcs.forEach(function (a) { a.setAttribute("stroke-dasharray", "0 " + a.getAttribute("data-c")); });
    if (!("IntersectionObserver" in window)) { els.forEach(run); arcs.forEach(arc); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; io.unobserve(e.target); if (e.target.hasAttribute("data-count-to")) run(e.target); else arc(e.target); }); }, { threshold: .4 });
    els.concat(arcs).forEach(function (e) { io.observe(e); });
  }

  /* process stepper (tabs) */
  function steppers() {
    $$("[data-stepper]").forEach(function (root) {
      var btns = $$("button", root), out = document.getElementById(root.getAttribute("data-stepper"));
      function pick(b) { btns.forEach(function (x) { x.setAttribute("aria-selected", x === b); x.tabIndex = x === b ? 0 : -1; }); out.innerHTML = "<h3>" + b.getAttribute("data-t") + "</h3><p>" + b.getAttribute("data-d") + "</p>"; }
      btns.forEach(function (b, i) {
        b.setAttribute("role", "tab"); b.onclick = function () { pick(b); };
        b.onkeydown = function (e) { var n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null; if (n != null && btns[n]) { e.preventDefault(); btns[n].focus(); pick(btns[n]); } };
      });
      root.setAttribute("role", "tablist"); out.setAttribute("role", "tabpanel"); out.setAttribute("aria-live", "polite"); pick(btns[0]);
    });
  }

  /* gentle reveal: shows anything at or above the viewport bottom, so jumps and anchors never leave blank gaps */
  function reveal() {
    var els = $$(".rv"); if (reduce) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var queued = false;
    function check() {
      queued = false; var h = window.innerHeight || 800;
      els = els.filter(function (e) { if (e.getBoundingClientRect().top < h * 0.92) { e.classList.add("in"); return false; } return true; });
      if (!els.length) { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); }
    }
    function on() { if (!queued) { queued = true; requestAnimationFrame(check); } }
    window.addEventListener("scroll", on, { passive: true }); window.addEventListener("resize", on); window.addEventListener("hashchange", on);
    check();
  }

  /* audience tabs */
  function tabs() {
    $$("[data-tabs]").forEach(function (root) {
      var btns = $$("[role=tab]", root), panels = btns.map(function (b) { return document.getElementById(b.getAttribute("aria-controls")); });
      function pick(i, focus) { btns.forEach(function (b, j) { var on = i === j; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; panels[j].hidden = !on; }); if (focus) btns[i].focus(); }
      btns.forEach(function (b, i) {
        b.onclick = function () { pick(i); };
        b.onkeydown = function (e) { var n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? btns.length - 1 : null; if (n != null && btns[n]) { e.preventDefault(); pick(n, true); } };
      });
      var h = (location.hash || "").replace("#", ""), start = 0; btns.forEach(function (b, i) { if (b.id === h) start = i; }); pick(start);
    });
  }
  function copiers() {
    $$("[data-copy]").forEach(function (b) {
      b.onclick = function () {
        var v = b.getAttribute("data-copy"), done = function () { var t = b.textContent; b.textContent = "Copied"; setTimeout(function () { b.textContent = t; }, 1400); };
        try { navigator.clipboard.writeText(v).then(done, function () {}); } catch (e) {}
      };
    });
  }

  function init() { tabs(); copiers(); rails(); snav(); counters(); steppers(); reveal(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
