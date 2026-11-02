/* Binary System Medical — site behaviour.
 * Progressive enhancement only: every page works without this file.
 * Header state, mega menu + drawer, scroll reveals, the microplate "read",
 * product rail, quote list (localStorage), catalogue filters, forms. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var isRTL = doc.dir === "rtl";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var i18n = {};
  try { i18n = JSON.parse(document.getElementById("i18n").textContent); } catch (_) {}
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Header ---------- */
  var header = $("[data-header]");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mega menu ---------- */
  var megaBtn = $("[data-mega-toggle]");
  var mega = $("[data-mega]");
  function setMega(open) {
    if (!megaBtn || !mega) return;
    megaBtn.setAttribute("aria-expanded", String(open));
    mega.classList.toggle("is-open", open);
    mega.inert = !open; // closed (or closing) panel takes no focus
    if (header && open) header.classList.add("is-scrolled");
    else onScroll();
  }
  if (megaBtn && mega) {
    megaBtn.addEventListener("click", function () { setMega(megaBtn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("click", function (e) { if (!mega.contains(e.target) && e.target !== megaBtn && !megaBtn.contains(e.target)) setMega(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && mega.classList.contains("is-open")) { setMega(false); megaBtn.focus(); } });
    mega.addEventListener("focusout", function (e) { if (!mega.contains(e.relatedTarget) && e.relatedTarget !== megaBtn) setMega(false); });
  }

  /* ---------- Drawer ---------- */
  var drawer = $("[data-drawer]");
  var drawerBtn = $("[data-drawer-open]");
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("no-scroll", open);
    if (drawerBtn) drawerBtn.setAttribute("aria-expanded", String(open));
    if (open) { var f = $(".drawer__close", drawer); if (f) f.focus(); }
    else if (drawerBtn) drawerBtn.focus();
  }
  if (drawer) {
    if (drawerBtn) drawerBtn.addEventListener("click", function () { setDrawer(true); });
    $$("[data-drawer-close]", drawer).forEach(function (b) { b.addEventListener("click", function () { setDrawer(false); }); });
    $$("a", drawer).forEach(function (a) { a.addEventListener("click", function () { if (a.hash && a.pathname === location.pathname) setDrawer(false); }); });
    document.addEventListener("keydown", function (e) {
      if (!drawer.classList.contains("is-open")) return;
      if (e.key === "Escape") setDrawer(false);
      if (e.key === "Tab") {
        var items = $$("a[href], button, summary", drawer).filter(function (el) { return el.offsetParent !== null; });
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Language switching ----------
   * Both languages are built from the same templates, so the Nth block inside <main> is the same
   * section in English and Arabic. The switch remembers which block (and how far into it) the
   * reader was at, plus the catalogue query and any half-typed form, and the other-language page
   * restores them when it is revealed — including when it was prerendered (speculation rules).
   * localStorage, not sessionStorage: a prerendered page reads it live at activation. */
  var ls = {
    get: function (k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (_) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (_) {} },
  };
  var LANG_KEY = "bsm-lang", POS_KEY = "bsm-lang-pos", HINT_KEY = "bsm-lang-hint";
  var headerBottom = function () { return header ? Math.max(0, header.getBoundingClientRect().bottom) : 0; };
  var blocks = function () {
    var m = document.getElementById("main");
    return m ? Array.prototype.filter.call(m.children, function (el) { return el.offsetHeight > 0; }) : [];
  };
  function savePosition(href) {
    var list = blocks(), top = headerBottom(), i = 0, r = 0;
    if (window.scrollY > 4) {
      for (var k = 0; k < list.length; k++) {
        var rc = list[k].getBoundingClientRect();
        if (rc.bottom > top + 1) { i = k; r = Math.max(0, (top - rc.top) / rc.height); break; }
      }
    }
    ls.set(POS_KEY, JSON.stringify({ to: new URL(href, location.href).pathname, i: i, r: r, t: Date.now() }));
  }
  // The arriving page restores the position in an inline <head> script (layout.mjs: langArrival),
  // so it runs at "pagereveal", before the first frame, even when the page was prerendered.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-lang-switch]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    ls.set(LANG_KEY, a.getAttribute("hreflang"));
    ls.set(HINT_KEY, "1");
    savePosition(a.href);
    // Keep catalogue filters; leave the URL untouched otherwise so the prerendered page is used.
    if (location.search) a.href = a.getAttribute("href").split(/[?#]/)[0] + location.search;
  });
  // Tag the view transition so the language swap gets its own animation (see css: :active-view-transition-type(lang)).
  window.addEventListener("pageswap", function (e) {
    if (!e.viewTransition || !e.activation || !e.viewTransition.types) return;
    try {
      var p = JSON.parse(ls.get(POS_KEY));
      if (p && new URL(e.activation.entry.url).pathname === p.to) e.viewTransition.types.add("lang");
    } catch (_) {}
  });
  // A prerendered page ran this script long before it was shown: refresh drafts when it is revealed.
  if (document.prerendering) window.addEventListener("pagereveal", function () { restoreDrafts(); list = load(); syncQuoteUI(false); });

  // Suggest the other language once to visitors whose browser prefers it (never a forced redirect).
  function languageHint() {
    var h = i18n.hint;
    if (!h || ls.get(LANG_KEY) || ls.get(HINT_KEY) || document.prerendering) return;
    var prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    var first = null;
    for (var i = 0; i < prefs.length; i++) { var l = String(prefs[i]).slice(0, 2).toLowerCase(); if (l === "en" || l === "ar") { first = l; break; } }
    if (first !== h.lang) return;
    var src = $("[data-lang-switch]");
    if (!src) return;
    var box = document.createElement("div");
    box.className = "lang-hint";
    box.setAttribute("lang", h.lang);
    box.setAttribute("dir", h.dir);
    box.setAttribute("role", "region");
    box.setAttribute("aria-label", h.cta);
    box.innerHTML = '<span class="lang-hint__text"></span><a class="lang-hint__cta" data-lang-switch></a><button class="lang-hint__close" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>';
    $(".lang-hint__text", box).textContent = h.text;
    var cta = $(".lang-hint__cta", box);
    cta.textContent = h.cta;
    cta.href = src.getAttribute("href");
    cta.setAttribute("hreflang", h.lang);
    var close = $(".lang-hint__close", box);
    close.setAttribute("aria-label", h.close);
    close.addEventListener("click", function () { ls.set(HINT_KEY, "1"); box.classList.remove("is-on"); setTimeout(function () { box.remove(); }, 400); });
    document.body.appendChild(box);
    requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add("is-on"); }); });
  }
  if (document.prerendering) document.addEventListener("prerenderingchange", function () { setTimeout(languageHint, 1500); }, { once: true });
  else setTimeout(languageHint, 1500);

  /* ---------- Reveal on scroll ---------- */
  // Animate only for a visible tab; background tabs, crawlers, preview renderers and prerendered
  // pages get content as-is. Arriving from the language switch, the reader has just seen the page in
  // the other language: show it settled (no reveals, no plate read).
  var animate = !reduce && document.visibilityState === "visible" && !doc.classList.contains("lang-arrival");
  if ("IntersectionObserver" in window && animate) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        el.classList.add("is-revealing");
        el.classList.remove("is-pending");
        setTimeout(function () { el.classList.remove("is-revealing"); }, 1100);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    // Hide only what starts below the fold; anything already on screen stays put.
    var fold = window.innerHeight;
    $$(".reveal, .reveal-stagger").forEach(function (el) {
      if (el.getBoundingClientRect().top < fold) return;
      el.classList.add("is-pending");
      io.observe(el);
    });
  }

  /* ---------- Microplate: read the plate column by column ---------- */
  var plate = $("[data-plate]");
  if (plate) {
    var grid = $("[data-plate-grid]", plate);
    var scan = $("[data-plate-scan]", plate);
    var status = $("[data-plate-status]", plate);
    var tip = $("[data-plate-tip]", plate);
    var wells = $$(".well", plate);
    var chars = $$(".plate__char", plate);
    var colWells = function (c) { return wells.filter(function (w) { return w.getAttribute("data-c") === String(c); }); };
    var read = function (force) {
      if (reduce || document.visibilityState !== "visible" || (!animate && force !== true)) return;
      plate.classList.remove("is-done");
      plate.classList.add("is-reading");
      wells.forEach(function (w) { w.classList.remove("col-read"); });
      chars.forEach(function (ch) { ch.classList.remove("is-read"); });
      var col = 0;
      status.textContent = "READING…";
      (function next() {
        col++;
        if (col > 12) {
          setTimeout(function () {
            plate.classList.remove("is-reading");
            plate.classList.add("is-done");
            status.textContent = "READ COMPLETE";
          }, 450);
          return;
        }
        var first = colWells(col)[0];
        if (first && scan) scan.style.transform = "translateX(" + (first.offsetLeft + first.offsetWidth / 2) + "px)"; // transform: no layout shift
        colWells(col).forEach(function (w) { w.classList.add("col-read"); });
        var ch = chars[col - 1];
        if (ch) ch.classList.add("is-read");
        status.textContent = "READING " + String(col).padStart(2, "0") + "/12";
        setTimeout(next, 170);
      })();
    };
    // The read plays once per visit; coming back to the home page shows the plate already read.
    var READ_KEY = "bsm-plate-read", seen = null;
    try { seen = sessionStorage.getItem(READ_KEY); } catch (_) {}
    if ("IntersectionObserver" in window && !seen) {
      var pio = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        pio.disconnect();
        setTimeout(function () {
          read();
          if (plate.classList.contains("is-reading")) try { sessionStorage.setItem(READ_KEY, "1"); } catch (_) {}
        }, 500);
      }, { threshold: 0.4 });
      pio.observe(plate);
    }
    // Hover a well: show its OD, its column's byte and the letter it decodes to.
    var hl = function (c, on) {
      colWells(c).forEach(function (w) { w.classList.toggle("col-hl", on); });
      var ch = chars[c - 1]; if (ch) ch.classList.toggle("col-hl", on);
    };
    var lastCol = null;
    grid.addEventListener("mouseover", function (e) {
      var w = e.target.closest(".well");
      if (!w) return;
      var c = w.getAttribute("data-c");
      if (lastCol && lastCol !== c) hl(lastCol, false);
      lastCol = c; hl(c, true);
      var ch = chars[c - 1];
      tip.innerHTML = "<b>" + w.getAttribute("data-r") + c + "</b> · OD " + w.getAttribute("data-od") + "<br>COL " + c + " · " + ch.getAttribute("data-bits") + " → <b>" + ch.textContent + "</b>";
      var pr = plate.getBoundingClientRect(), wr = w.getBoundingClientRect();
      tip.style.left = (wr.left - pr.left + wr.width / 2) + "px";
      tip.style.top = (wr.top - pr.top) + "px";
      tip.classList.add("is-on");
    });
    grid.addEventListener("mouseleave", function () { tip.classList.remove("is-on"); if (lastCol) hl(lastCol, false); lastCol = null; });
    plate.addEventListener("dblclick", function () { read(true); });
  }

  /* ---------- Product page: sticky actions on phones once the hero buttons scroll away ---------- */
  var pdBar = $("[data-pd-bar]"), pdActions = $(".pd__actions");
  if (pdBar && pdActions && "IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      var show = !en[0].isIntersecting && en[0].boundingClientRect.top < 0;
      pdBar.classList.toggle("is-on", show);
      pdBar.inert = !show;
      document.body.classList.toggle("has-pd-bar", show);
    }).observe(pdActions);
  }

  /* ---------- Product rail ---------- */
  var rail = $("[data-rail]");
  if (rail) {
    var by = function (dir) {
      var card = rail.firstElementChild;
      var w = card ? card.getBoundingClientRect().width + 20 : 300;
      rail.scrollBy({ left: dir * w * (isRTL ? -1 : 1), behavior: reduce ? "auto" : "smooth" });
    };
    var prev = $("[data-rail-prev]"), nextB = $("[data-rail-next]");
    if (prev) prev.addEventListener("click", function () { by(-1); });
    if (nextB) nextB.addEventListener("click", function () { by(1); });
  }

  /* ---------- Quote list ---------- */
  var KEY = "bsm-quote-v1";
  var load = function () { try { var v = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(v) ? v : []; } catch (_) { return []; } };
  var save = function (list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (_) {} };
  var list = load();
  var toastEl = $("[data-toast]"), toastTimer;
  function toast(text) {
    if (!toastEl) return;
    $("[data-toast-text]", toastEl).textContent = text;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 3200);
  }
  function syncQuoteUI(bump) {
    $$("[data-quote-count]").forEach(function (el) {
      el.textContent = String(list.length);
      el.classList.toggle("has-items", list.length > 0);
      if (bump) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
    });
    $$("[data-add-quote]").forEach(function (b) { b.setAttribute("aria-pressed", String(list.indexOf(b.getAttribute("data-add-quote")) > -1)); });
    renderQuoteList();
  }
  function toggleItem(slug, name) {
    var i = list.indexOf(slug);
    // First-strong isolates keep a Latin product name (with its ™/®) intact inside Arabic text.
    var n = "⁨" + name + "⁩";
    if (i > -1) { list.splice(i, 1); toast(n + " " + (i18n.removed || "removed")); }
    else { list.push(slug); toast(n + " " + (i18n.added || "added")); }
    save(list); syncQuoteUI(true);
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-add-quote]");
    if (b) { e.preventDefault(); toggleItem(b.getAttribute("data-add-quote"), b.getAttribute("data-name") || ""); }
    var q = e.target.closest("[data-quote-now]");
    if (q) { var s = q.getAttribute("data-quote-now"); if (list.indexOf(s) < 0) { list.push(s); save(list); } }
    var r = e.target.closest("[data-remove-quote]");
    if (r) { var idx = list.indexOf(r.getAttribute("data-remove-quote")); if (idx > -1) { list.splice(idx, 1); save(list); syncQuoteUI(false); } }
  });
  window.addEventListener("storage", function (e) { if (e.key === KEY) { list = load(); syncQuoteUI(false); } });

  var catalogData = null;
  try { catalogData = JSON.parse(document.getElementById("catalog-data").textContent); } catch (_) {}
  // ?add=slug (from "Request a quotation" on a product page, also without JS on that page).
  if (catalogData) {
    var add = new URLSearchParams(location.search).get("add");
    if (add && catalogData[add] && list.indexOf(add) < 0) { list.push(add); save(list); }
  }
  function renderQuoteList() {
    var ul = $("[data-quote-list]");
    if (!ul || !catalogData) return;
    var items = list.filter(function (s) { return catalogData[s]; });
    ul.innerHTML = items.map(function (s) {
      var p = catalogData[s];
      return '<li class="qitem"><img src="' + p.i + '" alt="" width="64" height="52" loading="lazy"><div><div class="qitem__brand">' + esc(p.b) + '</div><div class="qitem__name"><a href="' + p.u + '">' + esc(p.n) + '</a></div></div><button class="qitem__remove" type="button" data-remove-quote="' + s + '" aria-label="Remove ' + esc(p.n) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button></li>';
    }).join("");
    var empty = $("[data-quote-empty]");
    if (empty) empty.style.display = items.length ? "none" : "";
    var hidden = $("[data-quote-items]");
    if (hidden) hidden.value = items.map(function (s) { return catalogData[s].b + " — " + catalogData[s].n; }).join("\n");
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  syncQuoteUI(false);

  /* ---------- Catalogue filters ---------- */
  var cat = $("[data-catalog]");
  if (cat) {
    var cards = $$(".p-card", cat);
    var facets = $$("[data-facet]", cat);
    var search = $("[data-filter-search]", cat);
    var brandSel = $("[data-filter-brand]", cat);
    var countEl = $("[data-catalog-count]", cat);
    var emptyEl = $("[data-catalog-empty]", cat);
    var state = { division: "", discipline: "", brand: "", q: "" };
    var countTpl = countEl ? countEl.textContent : "";
    var total = cards.length;
    var params = new URLSearchParams(location.search);
    state.division = params.get("division") || "";
    state.discipline = params.get("discipline") || "";
    state.brand = params.get("brand") || "";
    state.q = params.get("q") || "";
    if (search) search.value = state.q;
    if (brandSel) brandSel.value = state.brand;
    function apply(push) {
      var q = state.q.trim().toLowerCase(), shown = 0;
      cards.forEach(function (card) {
        var ok = (!state.division || card.getAttribute("data-division") === state.division) &&
          (!state.discipline || card.getAttribute("data-discipline") === state.discipline) &&
          (!state.brand || card.getAttribute("data-brand") === state.brand) &&
          (!q || card.getAttribute("data-search").indexOf(q) > -1);
        card.hidden = !ok;
        if (ok) shown++;
      });
      facets.forEach(function (f) {
        var k = f.getAttribute("data-facet"), v = f.getAttribute("data-value");
        var on = k === "all" ? !state.division && !state.discipline : k === "division" ? state.division === v && !state.discipline : state.discipline === v;
        f.setAttribute("aria-pressed", String(on));
      });
      if (countEl) {
        var nums = countTpl.match(/\d+/g) || [];
        countEl.textContent = nums.length >= 2 ? countTpl.replace(nums[0], String(shown)) : countTpl;
      }
      if (emptyEl) emptyEl.classList.toggle("is-on", shown === 0);
      if (push) {
        var p = new URLSearchParams();
        ["division", "discipline", "brand", "q"].forEach(function (k) { if (state[k]) p.set(k, state[k]); });
        history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : ""));
      }
    }
    facets.forEach(function (f) {
      f.addEventListener("click", function () {
        var k = f.getAttribute("data-facet"), v = f.getAttribute("data-value");
        if (k === "all") { state.division = ""; state.discipline = ""; }
        else if (k === "division") { state.division = v; state.discipline = ""; }
        else { state.discipline = v; state.division = ""; }
        apply(true);
      });
    });
    if (search) search.addEventListener("input", function () { state.q = search.value; apply(true); });
    if (brandSel) brandSel.addEventListener("change", function () { state.brand = brandSel.value; apply(true); });
    var reset = $("[data-filter-reset]", cat);
    if (reset) reset.addEventListener("click", function () { state = { division: "", discipline: "", brand: "", q: "" }; if (search) search.value = ""; if (brandSel) brandSel.value = ""; apply(true); });
    var ft = $("[data-filter-toggle]", cat), fl = $("[data-filters]", cat);
    if (ft && fl) ft.addEventListener("click", function () { var o = !fl.classList.contains("is-open"); fl.classList.toggle("is-open", o); ft.setAttribute("aria-expanded", String(o)); });
    apply(false);
    void total;
  }

  /* ---------- Forms ---------- */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function within(p, ms) {
    return new Promise(function (res, rej) { var t = setTimeout(rej, ms); p.then(function (v) { clearTimeout(t); res(v); }, function (e) { clearTimeout(t); rej(e); }); });
  }
  // Drafts survive a language switch or an accidental navigation: kept 12 hours, deleted on send.
  var DRAFT_SKIP = { form: 1, lang: 1, _page: 1, _honey: 1, altcha: 1, items: 1 };
  function draftKey(form) { return "bsm-draft-" + form.getAttribute("data-form"); }
  function saveDraft(form) {
    var data = {}, any = false;
    Array.prototype.forEach.call(form.elements, function (el) {
      if (el.name && !DRAFT_SKIP[el.name] && el.type !== "hidden" && el.value) { data[el.name] = el.value; if (el.tagName !== "SELECT") any = true; }
    });
    if (any) ls.set(draftKey(form), JSON.stringify({ t: Date.now(), d: data }));
    else ls.del(draftKey(form));
  }
  function restoreDrafts() {
    $$("form[data-form]").forEach(function (form) {
      var raw = null;
      try { raw = JSON.parse(ls.get(draftKey(form))); } catch (_) {}
      if (!raw || !raw.d || Date.now() - raw.t > 12 * 3600 * 1000) return;
      Object.keys(raw.d).forEach(function (k) {
        var el = form.elements[k];
        if (el && el.type !== "hidden" && (!el.value || el.tagName === "SELECT")) el.value = raw.d[k];
      });
    });
  }
  restoreDrafts();
  $$("form[data-form]").forEach(function (form) {
    var statusEl = $("[data-form-status]", form);
    var btn = $('[type="submit"]', form);
    var widget = $("altcha-widget", form);
    var success = $("[data-form-success]", form);
    var sending = false, sent = false;
    var ar = doc.lang === "ar";
    var msg = {
      fail: ar ? "تعذّر إرسال رسالتك. يرجى المحاولة مرة أخرى أو الاتصال بنا على ⁦+966 11 474 9490⁩." : "We couldn't send your message. Please try again, or call us on +966 11 474 9490.",
      net: ar ? "تعذّر الاتصال بالخادم. تحقق من اتصالك وحاول مرة أخرى." : "We couldn't reach the server. Please check your connection and try again.",
      check: ar ? "تعذّر إكمال التحقق الأمني. يرجى تحديث الصفحة والمحاولة مرة أخرى." : "We couldn't complete the security check. Please refresh the page and try again.",
    };
    var topic = new URLSearchParams(location.search).get("topic");
    if (topic && form.topic) { for (var i = 0; i < form.topic.options.length; i++) if (form.topic.options[i].value === topic) form.topic.value = topic; }
    var draftTimer;
    form.addEventListener("input", function () { clearTimeout(draftTimer); draftTimer = setTimeout(function () { if (!sent) saveDraft(form); }, 250); });
    form.addEventListener("change", function () { if (!sent) saveDraft(form); });

    function showError(t) { if (statusEl) { statusEl.textContent = t; statusEl.className = "form__status is-error"; } }
    function clearError() { if (statusEl) { statusEl.textContent = ""; statusEl.className = "form__status"; } }
    function validate() {
      var firstBad = null;
      $$("[required]", form).forEach(function (el) {
        var f = el.closest(".field");
        var bad = !el.value.trim() || (el.type === "email" && !EMAIL.test(el.value.trim()));
        if (f) f.classList.toggle("is-invalid", bad);
        el.setAttribute("aria-invalid", String(bad));
        if (bad && !firstBad) firstBad = el;
      });
      if (firstBad) firstBad.focus();
      return !firstBad;
    }
    $$("[required]", form).forEach(function (el) {
      el.addEventListener("input", function () { var f = el.closest(".field"); if (f && f.classList.contains("is-invalid") && el.value.trim()) { f.classList.remove("is-invalid"); el.setAttribute("aria-invalid", "false"); } });
    });
    if (widget) widget.addEventListener("statechange", function (e) { if (e.detail && e.detail.state === "error") { showError(msg.check); sending = false; } });

    // Capture phase: runs before ALTCHA's own submit handling so validation happens first;
    // once ALTCHA has solved and re-submitted (token present), this sends the form.
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending || sent) { e.stopImmediatePropagation(); return; }
      if (!validate()) { e.stopImmediatePropagation(); return; }
      clearError();
      var fd = new FormData(form);
      if (widget && !fd.get("altcha")) {
        if (window.customElements && window.customElements.get("altcha-widget")) {
          btn.setAttribute("aria-busy", "true");
          return; // ALTCHA verifies, then re-submits the form.
        }
        e.stopImmediatePropagation();
        within(window.customElements ? window.customElements.whenDefined("altcha-widget") : Promise.reject(), 8000).then(function () { form.requestSubmit ? form.requestSubmit() : form.submit(); }, function () { showError(msg.check); });
        return;
      }
      e.stopImmediatePropagation();
      sending = true;
      fd.set("_page", location.pathname);
      btn.disabled = true; btn.setAttribute("aria-busy", "true");
      var label = btn.innerHTML; btn.textContent = btn.getAttribute("data-busy");
      fetch(form.action, { method: "POST", body: fd, headers: { Accept: "application/json" } })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && j.ok === true, message: j.message || j.error }; }); }, function () { return { ok: false, message: msg.net }; })
        .then(function (res) {
          sending = false;
          btn.disabled = false; btn.removeAttribute("aria-busy"); btn.innerHTML = label;
          if (res.ok) {
            sent = true;
            form.classList.add("is-sent");
            if (success) success.focus();
            if (form.getAttribute("data-form") === "quote") { list = []; save(list); syncQuoteUI(false); }
            clearTimeout(draftTimer);
            ls.del(draftKey(form));
            form.reset();
          } else {
            showError(res.message || msg.fail);
            if (widget && typeof widget.reset === "function") try { widget.reset(); } catch (_) {}
          }
        });
    }, true);
  });
})();
