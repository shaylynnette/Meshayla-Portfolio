/* Kemp Advisory Group — catalog search & card rendering.
   You should not need to edit this file. Edit kag-catalog.js instead. */
(function () {
  "use strict";
  var DATA = (window.KAG_CATALOG || []).slice();

  var TYPES = [
    { key: "all", label: "All types" },
    { key: "book", label: "Books" },
    { key: "learning", label: "Learning products" },
    { key: "service", label: "Services" },
    { key: "case-study", label: "Case studies" },
    { key: "website", label: "Websites" }
  ];
  var AUD = [
    { key: "all", label: "Everything" },
    { key: "educators", label: "Educators & K-12" },
    { key: "organizations", label: "Organizations & Government" },
    { key: "business", label: "Small Business & Careers" }
  ];
  var TYPE_NAME = { book: "Book", learning: "Learning product", service: "Service", "case-study": "Case study", website: "Website" };
  var TYPE_ORDER = { book: 0, learning: 1, "case-study": 2, website: 3, service: 4 };
  var SYN = {
    resume: ["resume", "cv"], cv: ["resume"], website: ["website", "web"], web: ["website", "web"],
    ai: ["ai", "artificial intelligence"], pd: ["professional development", "pd"], gov: ["government", "gov"],
    kids: ["kids", "children"], children: ["children", "kids"], free: ["free"], sam: ["sam"], ocm: ["ocm", "change management"],
    elearning: ["elearning", "e-learning"], homeschool: ["homeschool", "home school"], k12: ["k-12", "k12"], "k-12": ["k-12", "k12"]
  };

  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function isExternal(url) { return /^https?:\/\//.test(url) && url.indexOf("kempadvisory.com") === -1; }

  /* ---------- search ---------- */
  function score(item, tokens) {
    if (!tokens.length) return 1;
    var t = norm(item.title), sub = norm((item.subtitle || "") + " " + item.category + " " + (item.domain || "") + " " + (TYPE_NAME[item.type] || "")),
        tags = norm((item.tags || []).join(" ")), sum = norm(item.summary), total = 0;
    for (var i = 0; i < tokens.length; i++) {
      var alts = SYN[tokens[i]] || [tokens[i]], best = 0;
      for (var j = 0; j < alts.length; j++) {
        var a = norm(alts[j]);
        var has = a.length <= 3
          ? (function (re) { return function (s) { return re.test(s); }; })(new RegExp("(^|[^a-z0-9])" + a.replace(/[.\-]/g, "\\$&") + "([^a-z0-9]|$)"))
          : function (s) { return s.indexOf(a) > -1; };
        if (has(t)) best = Math.max(best, 5);
        else if (has(tags)) best = Math.max(best, 3);
        else if (has(sub)) best = Math.max(best, 2);
        else if (has(sum)) best = Math.max(best, 1);
      }
      if (!best) return 0;
      total += best;
    }
    return total;
  }
  function tokenize(q) { return norm(q).replace(/[^a-z0-9.\- ]/g, " ").split(/\s+/).filter(function (w) { return w.length > 1 || /\d/.test(w); }); }

  /* ---------- cards ---------- */
  function cover(item) {
    var label = '<span class="cover-type">' + esc(TYPE_NAME[item.type] || "") + "</span>";
    if (item.thumb && item.type !== "book") {
      return '<div class="cover shot">' + label + '<img src="' + esc(item.thumb) + '" alt="" width="640" height="400" loading="lazy" decoding="async"></div>';
    }
    if (item.type === "case-study" && /%$/.test(item.metric || "")) {
      var pv = Math.min(100, parseFloat(item.metric)) || 0, C = 2 * Math.PI * 34;
      return '<div class="cover case-study">' + label + '<svg class="ring" viewBox="0 0 80 80" role="img" aria-label="' + esc(item.metric + " " + (item.metricLabel || "")) + '"><circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="7"/><circle class="arc" cx="40" cy="40" r="34" fill="none" stroke="#E8C06A" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + (C * pv / 100).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 40 40)"/><text x="40" y="46" text-anchor="middle" font-size="19" fill="#fff" font-family="Cormorant Garamond,serif">' + esc(item.metric) + '</text></svg><span class="metric-label">' + esc(item.metricLabel || "") + "</span></div>";
    }
    switch (item.type) {
      case "book":
        return '<div class="cover book">' + label + '<div class="mini-book" aria-hidden="true"><b>' + esc(item.title) + "</b><i>Meshayla Kemp</i></div></div>";
      case "case-study":
        return '<div class="cover case-study">' + label + '<span class="metric">' + esc(item.metric || "") + '</span><span class="metric-label">' + esc(item.metricLabel || "") + "</span></div>";
      case "website":
        return '<div class="cover website">' + label + '<div class="browser" aria-hidden="true"><div class="browser-bar"><i></i><i></i><i></i><span>' + esc(item.domain || "") +
          '</span></div><div class="browser-body"><b>' + esc(item.title) + "</b><em></em><em></em></div></div></div>";
      case "learning":
        return '<div class="cover learning">' + label + '<span class="glyph">' + esc(item.cover || item.price || "") + "</span></div>";
      default:
        return '<div class="cover service">' + label + svcIcon(item) + '<span class="glyph">' + esc(item.price || "") + "</span></div>";
    }
  }
  function svcIcon(item) {
    var k = (item.id + " " + (item.tags || []).join(" ")).toLowerCase(), p;
    if (/website|web/.test(k)) p = '<rect x="4" y="8" width="40" height="30" rx="3"/><path d="M4 16h40"/><circle cx="9" cy="12" r="1"/>';
    else if (/resume|capability|document|sam-/.test(k)) p = '<path d="M12 4h18l8 8v32H12z"/><path d="M30 4v8h8M18 22h14M18 29h14M18 36h9"/>';
    else if (/change|readiness/.test(k)) p = '<path d="M8 30l10-10 8 8 14-16"/><path d="M32 12h8v8"/>';
    else if (/procure|sourcing/.test(k)) p = '<path d="M6 16l18-10 18 10v20L24 46 6 36z"/><path d="M6 16l18 10 18-10M24 26v20"/>';
    else if (/email|phone|digital/.test(k)) p = '<rect x="5" y="10" width="38" height="28" rx="3"/><path d="M5 14l19 14 19-14"/>';
    else if (/course|elearning|lms|curriculum/.test(k)) p = '<path d="M4 14l20-8 20 8-20 8z"/><path d="M12 19v12c0 3 6 6 12 6s12-3 12-6V19"/>';
    else p = '<circle cx="24" cy="14" r="6"/><path d="M10 40c0-8 6-14 14-14s14 6 14 14"/>';
    return '<svg class="sico" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="#C9993A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
  }
  function card(item) {
    var acts = (item.actions || []).filter(function (a) { return a && a.url; });
    var badges = "";
    if (item.price && item.type !== "service" && item.status !== "coming-soon" && item.price !== "Free") badges += '<span class="price">' + esc(item.price) + "</span>";
    if (item.status === "free" || item.price === "Free") badges += '<span class="badge free">Free</span>';
    if (item.status === "coming-soon") badges += '<span class="badge soon">Coming soon</span>';
    if (item.status === "ongoing") badges += '<span class="badge live">Ongoing</span>';
    if (item.type === "website") badges += '<span class="badge live">Live site</span>';
    if (item.assist) badges += '<span class="badge assist" title="Financial assistance may be available through Cornerstone Clay CDC">Assistance eligible</span>';
    var buttons = acts.map(function (a, i) {
      var ext = isExternal(a.url);
      return '<a class="btn ' + (i === 0 ? "btn-navy" : "btn-line") + '" href="' + esc(a.url) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" +
        esc(a.label) + (ext ? '<span class="sr-only"> (opens in a new tab)</span> ↗' : "") + "</a>";
    }).join("");
    return '<article class="card" id="item-' + esc(item.id) + '">' + cover(item) +
      '<div class="card-body"><div class="card-cat">' + esc(item.category) + "</div>" +
      "<h3>" + esc(item.title) + (item.subtitle ? "<small>" + esc(item.subtitle) + "</small>" : "") + "</h3>" +
      "<p>" + esc(item.summary) + "</p>" +
      '<div class="card-foot">' + (badges ? '<div class="meta">' + badges + "</div>" : "") +
      (buttons ? '<div class="card-actions">' + buttons + "</div>" : "") + "</div></div></article>";
  }

  /* ---------- simple lists (audience pages, Our Work) ---------- */
  function renderLists() {
    document.querySelectorAll("[data-kag-list]").forEach(function (el) {
      var aud = el.getAttribute("data-audience"), types = (el.getAttribute("data-type") || "").split(",").filter(Boolean),
          feat = el.getAttribute("data-featured"), ids = (el.getAttribute("data-ids") || "").split(",").filter(Boolean),
          limit = parseInt(el.getAttribute("data-limit") || "0", 10);
      var items = ids.length ? ids.map(function (id) { return DATA.filter(function (d) { return d.id === id; })[0]; }).filter(Boolean)
        : DATA.filter(function (d) {
            if (aud && d.audiences.indexOf(aud) === -1) return false;
            if (types.length && types.indexOf(d.type) === -1) return false;
            if (feat && (d.featured || []).indexOf(feat) === -1) return false;
            return true;
          });
      if (limit) items = items.slice(0, limit);
      el.setAttribute("data-count", items.length);
      el.innerHTML = items.map(card).join("");
    });
    document.querySelectorAll("[data-kag-count]").forEach(function (el) {
      var aud = el.getAttribute("data-kag-count");
      el.textContent = DATA.filter(function (d) { return aud === "all" || d.audiences.indexOf(aud) > -1; }).length;
    });
  }

  /* ---------- full catalog ---------- */
  function initCatalog() {
    var root = document.getElementById("catalog");
    if (!root) return;
    var grid = document.getElementById("cat-grid"), input = document.getElementById("cat-q"),
        segEl = document.getElementById("cat-aud"), chipEl = document.getElementById("cat-types"),
        sortEl = document.getElementById("cat-sort"), countEl = document.getElementById("cat-count"),
        ctxEl = document.getElementById("cat-context"), clearEl = document.getElementById("cat-clear");
    var state = { q: "", aud: "all", type: "all", sort: "featured" };
    try {
      var p = new URLSearchParams(location.search);
      state.q = p.get("q") || ""; state.aud = p.get("for") || "all"; state.type = p.get("type") || "all"; state.sort = p.get("sort") || "featured";
      if (!AUD.some(function (a) { return a.key === state.aud; })) state.aud = "all";
      if (!TYPES.some(function (a) { return a.key === state.type; })) state.type = "all";
    } catch (e) {}
    input.value = state.q; sortEl.value = state.sort;

    segEl.innerHTML = AUD.map(function (a) { return '<button type="button" data-aud="' + a.key + '">' + esc(a.label) + "</button>"; }).join("");
    segEl.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { state.aud = b.getAttribute("data-aud"); update(); } });
    chipEl.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { state.type = b.getAttribute("data-type"); update(); } });
    var t; input.addEventListener("input", function () { clearTimeout(t); t = setTimeout(function () { state.q = input.value; update(); }, 120); });
    document.getElementById("cat-form").addEventListener("submit", function (e) { e.preventDefault(); state.q = input.value; update(); grid.scrollIntoView({ block: "start" }); });
    sortEl.addEventListener("change", function () { state.sort = sortEl.value; update(); });
    clearEl.addEventListener("click", function () { state = { q: "", aud: "all", type: "all", sort: "featured" }; input.value = ""; sortEl.value = "featured"; update(); input.focus(); });
    document.querySelectorAll("[data-try]").forEach(function (b) { b.addEventListener("click", function () { input.value = b.getAttribute("data-try"); state.q = input.value; update(); }); });
    root.addEventListener("click", function (e) {
      var b = e.target.closest("[data-reset]"); if (!b) return;
      var k = b.getAttribute("data-reset"); if (k === "q") { state.q = ""; input.value = ""; } else state[k] = "all"; update();
    });

    function update() {
      var tokens = tokenize(state.q);
      var base = DATA.map(function (d) { return { d: d, s: score(d, tokens) }; }).filter(function (x) {
        return x.s > 0 && (state.aud === "all" || x.d.audiences.indexOf(state.aud) > -1);
      });
      if (state.type !== "all" && !base.some(function (x) { return x.d.type === state.type; })) state.type = "all";
      // type chips with live counts
      chipEl.innerHTML = TYPES.map(function (ty) {
        var n = ty.key === "all" ? base.length : base.filter(function (x) { return x.d.type === ty.key; }).length;
        if (ty.key !== "all" && !n && state.type !== ty.key) return "";
        return '<button type="button" class="chip" data-type="' + ty.key + '" aria-pressed="' + (state.type === ty.key) + '">' + esc(ty.label) + '<span class="n">' + n + "</span></button>";
      }).join("");
      segEl.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-aud") === state.aud); });

      var list = base.filter(function (x) { return state.type === "all" || x.d.type === state.type; });
      var featKey = state.aud === "all" ? null : state.aud;
      list.sort(function (a, b) {
        if (state.sort === "price-asc" || state.sort === "price-desc") {
          var pa = a.d.priceValue, pb = b.d.priceValue;
          if (pa == null && pb == null) return 0; if (pa == null) return 1; if (pb == null) return -1;
          return state.sort === "price-asc" ? pa - pb : pb - pa;
        }
        if (state.sort === "az") return a.d.title.localeCompare(b.d.title);
        if (tokens.length && b.s !== a.s) return b.s - a.s;
        var fa = featKey ? (a.d.featured || []).indexOf(featKey) > -1 : (a.d.featured || []).length > 0;
        var fb = featKey ? (b.d.featured || []).indexOf(featKey) > -1 : (b.d.featured || []).length > 0;
        if (fa !== fb) return fa ? -1 : 1;
        return TYPE_ORDER[a.d.type] - TYPE_ORDER[b.d.type];
      });

      countEl.textContent = list.length;
      var bits = [];
      if (state.q) bits.push('matching “' + esc(state.q) + '” <button type="button" class="clear-btn" data-reset="q" aria-label="Clear search">×</button>');
      if (state.aud !== "all") bits.push("for " + esc(AUD.filter(function (a) { return a.key === state.aud; })[0].label));
      if (state.type !== "all") bits.push("in " + esc(TYPES.filter(function (a) { return a.key === state.type; })[0].label));
      ctxEl.innerHTML = bits.join(" · ");
      clearEl.hidden = !(state.q || state.aud !== "all" || state.type !== "all" || state.sort !== "featured");

      grid.innerHTML = list.length ? list.map(function (x) { return card(x.d); }).join("") :
        '<div class="empty"><h3>Nothing matches that yet</h3><p>Try a broader word like “training”, “website”, or “resume”, or tell us what you need and we will point you to the right fit.</p>' +
        '<div class="card-actions" style="justify-content:center"><button type="button" class="btn btn-line" data-reset="q">Clear search</button><a class="btn btn-navy" href="/services/request-quote/">Ask for a custom quote</a></div></div>';

      try {
        var qs = new URLSearchParams();
        if (state.q) qs.set("q", state.q); if (state.aud !== "all") qs.set("for", state.aud);
        if (state.type !== "all") qs.set("type", state.type); if (state.sort !== "featured") qs.set("sort", state.sort);
        var s = qs.toString(); history.replaceState(null, "", location.pathname + (s ? "?" + s : "") + location.hash);
      } catch (e) {}
    }
    update();
  }

  /* ---------- nav ---------- */
  function initNav() {
    var t = document.getElementById("kagNavToggle"), l = document.getElementById("kagNavLinks");
    if (t && l) t.addEventListener("click", function () {
      var open = l.classList.toggle("open");
      t.setAttribute("aria-expanded", open ? "true" : "false");
      t.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  function boot() { initNav(); renderLists(); initCatalog(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
