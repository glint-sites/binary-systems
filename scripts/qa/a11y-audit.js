// In-page WCAG 2.1 AA checks. Evaluated via CDP; returns a JSON summary of problems.
(() => {
  const out = { contrast: [], names: [], labels: [], ids: [], headings: [], landmarks: [], targets: [], images: [], lang: document.documentElement.lang };
  const st = document.createElement("style");
  st.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
  document.head.appendChild(st);
  document.querySelectorAll(".reveal,.reveal-stagger").forEach((e) => e.classList.add("is-in"));
  const overHero = (el) => document.documentElement.classList.contains("header-on-dark") && el.closest(".site-header") && !el.closest(".site-header.is-scrolled") && !el.closest(".mega");
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const visible = (el) => { const cs = getComputedStyle(el); if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const hiddenFromAT = (el) => !!el.closest('[aria-hidden="true"], .sr-only, [hidden]');
  // Effective background: walk up, blending translucent layers; images/gradients make it "complex".
  function background(el) {
    if (overHero(el)) return { r: 21, g: 14, b: 36, a: 1 };
    const layers = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== "none" && !/radial-gradient\(circle/.test(cs.backgroundImage)) {
        const grads = cs.backgroundImage.match(/rgba?\([^)]+\)/g);
        if (grads && grads.length) { const c = parse(grads[0]); layers.push({ ...c, a: Math.max(c.a, 0.99) }); break; }
        return null;
      }
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; }
    }
    let bg = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = layers.length - 1; i >= 0; i--) bg = blend(layers[i], bg);
    return bg;
  }
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (t) => (t.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
  while (walker.nextNode()) {
    const el = walker.currentNode.parentElement;
    if (!el || seen.has(el) || ["SCRIPT", "STYLE", "NOSCRIPT", "OPTION", "TITLE"].includes(el.tagName)) continue;
    seen.add(el);
    if (!visible(el) || hiddenFromAT(el)) continue;
    const cs = getComputedStyle(el);
    if (el.matches("input,textarea") || el.closest(".plate")) continue;
    const fg = parse(cs.color);
    const bg = background(el);
    if (!fg || !bg) continue;
    let o = 1;
    for (let n = el; n; n = n.parentElement) o *= +getComputedStyle(n).opacity;
    const r = ratio(blend({ ...fg, a: fg.a * o }, bg), bg);
    const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
    const large = size >= 24 || (bold && size >= 18.66);
    const need = large ? 3 : 4.5;
    if (r < need) out.contrast.push({ text: walker.currentNode.nodeValue.trim().slice(0, 40), sel: el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : ""), ratio: +r.toFixed(2), need, fg: cs.color, size });
  }
  // Accessible names for links and buttons.
  const name = (el) => (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") && document.getElementById(el.getAttribute("aria-labelledby"))?.textContent || el.textContent || [...el.querySelectorAll("img[alt]")].map((i) => i.alt).join(" ") || el.title || "").trim();
  document.querySelectorAll("a[href], button, [role=button], summary").forEach((el) => { if (visible(el) && !hiddenFromAT(el) && !name(el)) out.names.push(el.outerHTML.slice(0, 100)); });
  // Form controls need a label.
  document.querySelectorAll("input:not([type=hidden]), select, textarea").forEach((el) => {
    if (el.closest(".hp") || el.closest("altcha-widget")) return;
    const lab = (el.id && document.querySelector(`label[for="${el.id}"]`)) || el.closest("label") || el.getAttribute("aria-label");
    if (!lab) out.labels.push(el.outerHTML.slice(0, 100));
  });
  // Duplicate ids.
  const ids = {}; document.querySelectorAll("[id]").forEach((e) => (ids[e.id] = (ids[e.id] || 0) + 1));
  out.ids = Object.entries(ids).filter(([, n]) => n > 1).map(([k]) => k);
  // Heading order (no skipped levels going down).
  let last = 0;
  document.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((h) => { if (!visible(h) || hiddenFromAT(h)) return; const lv = +h.tagName[1]; if (last && lv > last + 1) out.headings.push(`h${last}→h${lv}: ${h.textContent.trim().slice(0, 40)}`); last = lv; });
  // Landmarks.
  for (const sel of ["header", "nav", "main", "footer"]) if (!document.querySelector(sel)) out.landmarks.push(`missing <${sel}>`);
  if (document.querySelectorAll("main").length !== 1) out.landmarks.push("main count " + document.querySelectorAll("main").length);
  // Target sizes (WCAG 2.5.5 AAA wants 44px; 2.5.8 AA in 2.2 wants 24px). Inline text links are exempt.
  document.querySelectorAll("a[href], button, select, input:not([type=hidden]), summary").forEach((el) => {
    if (!visible(el) || hiddenFromAT(el) || el.closest(".hp")) return;
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    const inline = cs.display === "inline" && el.closest("p, li, .footer__bottom-links, .crumbs, .form__legal");
    if (inline) return;
    if (r.width < 24 || r.height < 24) out.targets.push({ el: el.tagName.toLowerCase() + "." + (el.className || "").toString().split(" ")[0], w: Math.round(r.width), h: Math.round(r.height), level: "below 24 (AA 2.2)" });
    else if ((r.width < 44 || r.height < 44) && innerWidth < 600) out.targets.push({ el: el.tagName.toLowerCase() + "." + (el.className || "").toString().split(" ")[0], w: Math.round(r.width), h: Math.round(r.height), level: "below 44" });
  });
  document.querySelectorAll("img").forEach((i) => { if (!i.hasAttribute("alt")) out.images.push(i.src); });
  // Compress target list to unique selector/size pairs.
  const uniq = {}; out.targets.forEach((t) => { const k = `${t.el} ${t.w}x${t.h} ${t.level}`; uniq[k] = (uniq[k] || 0) + 1; });
  out.targets = Object.entries(uniq).map(([k, n]) => `${k} ×${n}`);
  const cu = {}; out.contrast.forEach((c) => { const k = `${c.sel} ${c.ratio}/${c.need} ${c.fg} "${c.text}"`; cu[k] = 1; });
  out.contrast = Object.keys(cu);
  return out;
})()
