import fs from "node:fs";
import path from "node:path";
import { esc, normalizePath, rng, formatDate, readMinutes, readTime, techCount } from "./util.mjs";
import { icon } from "./icons.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../..");

// Intrinsic size of a WebP or PNG, so every <img> carries width/height (no layout shift).
const sizeCache = new Map();
export function imageSize(webPath) {
  if (sizeCache.has(webPath)) return sizeCache.get(webPath);
  const buf = fs.readFileSync(path.join(ROOT, webPath));
  let w, h;
  if (webPath.endsWith(".svg")) {
    const svg = buf.toString("utf8");
    const vb = svg.match(/viewBox="[\d.\-]+[ ,]+[\d.\-]+[ ,]+([\d.]+)[ ,]+([\d.]+)"/);
    w = Math.round(parseFloat(vb[1]));
    h = Math.round(parseFloat(vb[2]));
  } else if (buf.toString("ascii", 0, 4) === "RIFF") {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8X") { w = 1 + buf.readUIntLE(24, 3); h = 1 + buf.readUIntLE(27, 3); }
    else if (chunk === "VP8L") { const b = buf.readUInt32LE(21); w = 1 + (b & 0x3fff); h = 1 + ((b >> 14) & 0x3fff); }
    else { w = buf.readUInt16LE(26) & 0x3fff; h = buf.readUInt16LE(28) & 0x3fff; }
  } else if (buf.readUInt32BE(0) === 0x89504e47) { w = buf.readUInt32BE(16); h = buf.readUInt32BE(20); }
  else throw new Error(`Unsupported image: ${webPath}`);
  const s = { w, h };
  sizeCache.set(webPath, s);
  return s;
}
export function img(src, alt, { cls = "", lazy = true, sizes = "", priority = false, srcset = null } = {}) {
  const { w, h } = imageSize(src);
  const uniq = srcset ? srcset.filter((e, i, a) => a.findIndex((x) => x[1] === e[1]) === i) : null;
  const set = uniq && uniq.length > 1 ? ` srcset="${uniq.map(([p, pw]) => `${p} ${pw}w`).join(", ")}"${sizes ? ` sizes="${sizes}"` : ""}` : "";
  return `<img${cls ? ` class="${cls}"` : ""} src="${src}"${set} alt="${esc(alt)}" width="${w}" height="${h}"${lazy && !priority ? ' loading="lazy" decoding="async"' : ""}${priority ? ' fetchpriority="high"' : ""}>`;
}

// Responsive sources for the generated variants (scripts/image-variants.py).
export const productSet = (slug) => [[`/images/products/${slug}-xs.webp`, 440], [`/images/products/${slug}-sm.webp`, 720]];
export const productHeroSet = (slug) => [[`/images/products/${slug}-sm.webp`, 720], [`/images/products/${slug}.webp`, imageSize(`/images/products/${slug}.webp`).w]];
const insightSet = (name) => [[`/images/insights/${name}-xs.webp`, 440], [`/images/insights/${name}-sm.webp`, imageSize(`/images/insights/${name}-sm.webp`).w]];
const photoSet = (src) => [[src.replace(".webp", "-md.webp"), imageSize(src.replace(".webp", "-md.webp")).w], [src, imageSize(src).w]];
export const CARD_SIZES = "(max-width: 640px) 80vw, (max-width: 1000px) 45vw, 300px";

export function eyebrow(label) {
  return label ? `<p class="eyebrow">${label}</p>` : "";
}

export function sectionHead({ eyebrowText = "", title, lede, side = "", center = false, h = "h2" }) {
  return `<div class="section-head${center ? " section-head--center" : ""}">
  <div>${eyebrow(eyebrowText)}<${h} class="h2">${title}</${h}>${lede ? `<p class="lede">${lede}</p>` : ""}</div>
  ${side}
</div>`;
}

export const discOf = (c, id) => c.data.taxonomy.disciplines.find((d) => d.id === id);
export const divOf = (c, id) => c.data.taxonomy.divisions.find((d) => d.id === id);
export const brandOf = (c, slug) => c.data.brands.find((b) => b.slug === slug);

export function productCard(c, p, { headingLevel = 3, wide = false } = {}) {
  const b = brandOf(c, p.brand);
  const t = c.tx(p);
  const disc = discOf(c, p.discipline);
  const search = [t.name, b.name, c.tx(disc).name, t.summary, ...(t.applications || []), p.en.name, b.slug].join(" ").toLowerCase();
  const h = `h${headingLevel}`;
  return `<article class="p-card" data-division="${p.division}" data-discipline="${p.discipline}" data-brand="${p.brand}" data-search="${esc(search)}">
  <div class="p-card__media${p.fit === "cover" ? " is-cover" : ""}">${img(`/images/products/${p.slug}-sm.webp`, `${t.name} — ${b.name}`, { srcset: productSet(p.slug), sizes: CARD_SIZES })}<span class="chip p-card__disc">${esc(c.tx(disc).short || c.tx(disc).name)}</span></div>
  <div class="p-card__body">
    <span class="p-card__brand">${esc(b.name)}</span>
    <${h} class="p-card__title"><a href="${c.u(`/products/${p.slug}`)}">${esc(t.name)}</a></${h}>
    <p class="p-card__text">${esc(t.teaser || t.summary)}</p>
    ${wide && t.highlights ? `<ul class="p-card__points">${t.highlights.slice(0, 3).map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
    <div class="p-card__foot">
      <span class="p-card__more">${c.t("Details", "التفاصيل")} ${icon("arrow")}</span>
      ${addQuoteButton(c, p)}
    </div>
  </div>
</article>`;
}

// The three divisions as image cards (home "What we supply", About "Our divisions").
export function divisionCards(c) {
  const { taxonomy, products } = c.data;
  return taxonomy.divisions.map((d) => {
    const t = c.tx(d);
    const n = products.filter((p) => p.division === d.id).length;
    const list = d.disciplines.map((id) => esc(c.tx(discOf(c, id)).name)).join(c.t(" · ", "، "));
    return `<a class="division" href="${c.u(`/solutions/${d.slug}`)}">
      <div class="division__media"><span class="division__code">${d.code}</span>${img(`/images/products/${d.image}-sm.webp`, "", { srcset: productSet(d.image), sizes: "(max-width: 980px) 92vw, 400px" })}</div>
      <div class="division__body">
        <h3>${esc(t.name)}</h3>
        <p>${esc(t.tagline)}</p>
        <p class="division__list">${list}</p>
        <div class="division__foot"><span>${techCount(c, n)}</span>${icon("arrow")}</div>
      </div>
    </a>`;
  }).join("");
}

export function addQuoteButton(c, p, large = false) {
  return `<button class="add-quote${large ? " add-quote--lg" : ""}" type="button" data-add-quote="${p.slug}" data-name="${esc(c.tx(p).name)}" aria-pressed="false">
        <span class="when-idle">${icon("plus")}${c.t("Add to quote", "أضف إلى عرض السعر")}</span><span class="when-added">${icon("check")}${c.t("Added", "تمت الإضافة")}</span><span class="sr-only"> — ${esc(c.tx(p).name)}</span>
      </button>`;
}

export function postCard(c, post, h = 3) {
  const t = c.tx(post);
  return `<article class="post-card">
  <div class="post-card__media">${img(`/images/insights/${post.image}-sm.webp`, "", { srcset: insightSet(post.image), sizes: "(max-width: 640px) 92vw, (max-width: 980px) 46vw, 400px" })}</div>
  <div class="post-card__meta"><span class="post-card__topic">${esc(t.topic)}</span><time datetime="${post.date}">${formatDate(post.date, c.lang)}</time><span>${readTime(c, readMinutes(c.tx(post).body))}</span></div>
  <h${h}><a href="${c.u(`/insights/${post.slug}`)}">${esc(t.title)}</a></h${h}>
  <p>${esc(t.teaser || t.excerpt)}</p>
</article>`;
}

export function crumbs(c, items) {
  return `<nav aria-label="${c.t("Breadcrumb", "مسار التنقل")}"><ol class="crumbs">${items.map((it, i) => (i === items.length - 1 ? `<li aria-current="page">${esc(it.name)}</li>` : `<li><a href="${it.href}">${esc(it.name)}</a></li>`)).join("")}</ol></nav>`;
}
export function crumbsLd(c, items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `https://binarysys.net${it.href}` })),
  };
}

export function pageHero(c, { crumbsItems, title, lede, extra = "", cls = "" }) {
  return `<section class="page-hero dark${cls ? ` ${cls}` : ""}">
  <div class="container">
    ${crumbsItems ? crumbs(c, crumbsItems) : ""}
    <h1>${title}</h1>
    ${lede ? `<p class="lede">${lede}</p>` : ""}
    ${extra}
  </div>
</section>`;
}

/* ---------- Microplate ----------
   12 columns × 8 rows = 12 bytes. Read top (A, most significant bit) to bottom (H):
   the columns spell B-I-N-A-R-Y-S-Y-S-T-E-M in ASCII. */
export function plate(c) {
  const word = "BINARYSYSTEM";
  const rows = "ABCDEFGH";
  const r = rng(2015);
  const od = (bit) => (bit ? 0.74 + r() * 0.26 : 0.03 + r() * 0.12);
  const cells = [];
  cells.push(`<span></span>`);
  for (let col = 1; col <= 12; col++) cells.push(`<span class="plate__label" aria-hidden="true">${col}</span>`);
  const bits = [...word].map((ch) => ch.charCodeAt(0).toString(2).padStart(8, "0"));
  for (let ri = 0; ri < 8; ri++) {
    cells.push(`<span class="plate__label plate__label--row" aria-hidden="true">${rows[ri]}</span>`);
    for (let col = 0; col < 12; col++) {
      const bit = bits[col][ri] === "1";
      const v = od(bit);
      cells.push(`<span class="well${bit ? " is-one" : ""}" style="--v:${v.toFixed(2)}" data-c="${col + 1}" data-r="${rows[ri]}" data-od="${(v * 3).toFixed(3)}"></span>`);
    }
  }
  const chars = [...word].map((ch, i) => `<span class="plate__char" data-c="${i + 1}" data-bits="${bits[i]}">${ch}</span>`).join("");
  const label = c.t(
    "A 96-well ELISA microplate. Its 12 columns are read as 8-bit binary bytes, rows A to H, spelling BINARYSYSTEM.",
    "صفيحة ELISA من 96 بئرًا، تُقرأ أعمدتها الاثنا عشر كبايتات ثنائية من 8 بتات (من الصف A إلى H) لتكوّن كلمة BINARYSYSTEM."
  );
  return `<div class="plate-wrap reveal-load">
  <figure class="plate is-done" data-plate role="img" aria-label="${esc(label)}">
    <div class="plate__head"><span class="plate__id">PLATE 01 · BSM-ELISA<span class="plate__nm"> · 450 nm</span></span><span class="plate__status"><i class="tag-dot"></i><span data-plate-status>READ COMPLETE</span></span></div>
    <div class="plate__grid" data-plate-grid>${cells.join("")}<i class="plate__scan" data-plate-scan></i></div>
    <div class="plate__readout"><span class="plate__char-label" title="ASCII">→</span>${chars}</div>
    <div class="plate__foot"><span class="plate__scale">OD 0.0 <i></i> 3.0</span><span>12 × 8 BIT</span></div>
    <span class="plate__tip" data-plate-tip></span>
  </figure>
  <p class="plate-note">${c.t("<strong>Binary, by design.</strong> This is a 96-well ELISA plate, the tray laboratories run immunoassays in. Each column is one byte: read rows A to H as bits and the lit wells spell our name.", "<strong>ثنائيّ عن قصد.</strong> هذه صفيحة ELISA من 96 بئرًا، وهي الصفيحة التي تُجرى فيها المقايسات المناعية في المختبرات. كل عمود فيها بايت واحد: اقرأ الصفوف من A إلى H كبتات، وستجد أن الآبار المضيئة تكتب اسمنا.")}</p>
</div>`;
}

/* ---------- Standard curve (home hero background) ----------
   What a lab does with a plate read: OD against log concentration, a four-parameter logistic fit
   through calibrators with error bars. Drawn faintly behind the hero, stretched over the grid
   (preserveAspectRatio="none"; strokes stay 1px and the points are round line caps), so it keeps
   its place against the copy at every desktop width: flat under the buttons, rising in the gap,
   levelling off past the plate. The facts rule below carries the matching log ticks (CSS). */
export function standardCurve() {
  const low = 930, high = 40, mid = 570, decade = 270, hill = 2;
  const od = (x) => low + (high - low) / (1 + 10 ** (-hill * (x - mid) / decade));
  const fit = [];
  for (let x = 0; x <= 1000; x += 5) fit.push(`${x ? "L" : "M"}${x} ${od(x).toFixed(1)}`);
  // Calibrators half a decade apart where the copy leaves room, plus one past the plate,
  // each scattered a little off the fit: [x, offset, error].
  const cal = [[30, 4, 10], [165, -6, 14], [300, 5, 11], [435, -4, 16], [975, 6, 12]];
  const at = cal.map(([x, d, e]) => [x, +(od(x) + d).toFixed(1), e]);
  const bars = at.map(([x, y, e]) => `M${x} ${y - e}V${y + e}M${x - 4} ${y - e}H${x + 4}M${x - 4} ${y + e}H${x + 4}`).join("");
  const dots = at.map(([x, y]) => `M${x} ${y}h0`).join("");
  return `<svg class="hero__curve" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path class="hero__curve-fit" d="${fit.join("")}"/><path class="hero__curve-err" d="${bars}"/><path class="hero__curve-pt" d="${dots}"/><path class="hero__curve-hole" d="${dots}"/>
  </svg>`;
}

/* ---------- B-mark photo composition ----------
   The two lobes of the BSM "B" (logo paths), normalised to objectBoundingBox clip paths. */
const LOBE_BOTTOM = "M33.6883 41.2939L0.0594788 41.0793L14.8933 19.1872L34.1223 19.2048C40.2461 19.2119 44.9633 24.3543 44.9213 30.2881C44.8793 36.4048 39.9907 41.3431 33.6883 41.2939Z";
const LOBE_TOP = "M36.4704 17.1331L15.5792 16.9854L27.183 0H36.3969C41.156 -0.00702513 44.8968 3.85153 44.9213 8.52962C44.9458 13.0952 41.3345 17.1648 36.4739 17.1296Z";
export const LOBE_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<clipPath id="lobe-bottom" clipPathUnits="objectBoundingBox"><path d="${normalizePath(LOBE_BOTTOM, [0.0595, 19.1872, 44.904, 22.1559])}"/></clipPath>
<clipPath id="lobe-top" clipPathUnits="objectBoundingBox"><path d="${normalizePath(LOBE_TOP, [15.5792, -0.0071, 29.3666, 17.1719])}"/></clipPath>
</defs></svg>`;

export function bmark(c, { top, bottom }) {
  return `<div class="bmark">
  ${LOBE_DEFS}
  <figure class="bmark__lobe bmark__lobe--top">${img(top.src, top.alt, { srcset: photoSet(top.src), sizes: "(max-width: 900px) 60vw, 400px" })}</figure>
  <figure class="bmark__lobe bmark__lobe--bottom">${img(bottom.src, bottom.alt, { srcset: photoSet(bottom.src), sizes: "(max-width: 900px) 92vw, 600px" })}</figure>
</div>`;
}

// Key facts along the bottom edge of a dark hero (home, About).
export function facts(c) {
  const { stats } = c.data.site;
  const fact = (value, label) => `<div><dt>${value}</dt><dd>${label}</dd></div>`;
  return `<dl class="facts" aria-label="${c.t("BSM at a glance", "BSM في أرقام")}">
    ${fact(stats.years, c.t("Years in Saudi healthcare", "سنوات في القطاع الصحي السعودي"))}
    ${fact(stats.offices, c.t("Regional market offices", "مكاتب إقليمية"))}
    ${fact(stats.brands, c.t("Global diagnostic brands", "علامة تشخيصية عالمية"))}
    ${fact("SFDA", c.t("Certified for IVD and medical devices", "معتمدة للتشخيص المخبري والأجهزة الطبية"))}
  </dl>`;
}

export function brandMark(c, b, cls = "") {
  return b.logo
    ? img(`/images/partners/${b.logo}`, b.name, { cls })
    : `<span class="wordmark">${esc(b.name)}${b.wordmark_sub ? `<small>${esc(b.wordmark_sub)}</small>` : ""}</span>`;
}

export function logoWall(c) {
  return `<div class="logo-wall reveal">${c.data.brands.map((b) => `<a class="logo-cell" href="${c.u("/partners")}#${b.slug}" aria-label="${esc(b.name)}">${brandMark(c, b)}</a>`).join("")}</div>`;
}

export function ctaBand(c, { title, text, primary, secondary }) {
  const { company } = c.data.site;
  return `<div class="cta-band reveal">
  <div>
    <h2 class="h2">${title}</h2>
    <p>${text}</p>
    <div class="cta-band__actions">
      <a class="btn btn--light" href="${primary.href}">${primary.label} ${icon("arrow")}</a>
      ${secondary ? `<a class="btn btn--outline-light" href="${secondary.href}">${secondary.label}</a>` : ""}
    </div>
  </div>
  <ul class="contact-list">
    <li><a href="tel:${company.phone_tel}">${icon("phone")}<div><small>${c.t("Call", "اتصل بنا")}</small><span class="ltr">${esc(company.phone)}</span></div></a></li>
    <li><a href="mailto:${company.email}">${icon("mail")}<div><small>${c.t("Email", "البريد الإلكتروني")}</small><span>${esc(company.email)}</span></div></a></li>
    <li><a href="${esc(company.maps_url)}" rel="noopener" target="_blank">${icon("pin")}<div><small>${c.t("Visit", "زرنا")}</small><span>${esc(c.t(`${company.street}, ${company.city}`, `${company.street_ar}، ${company.city_ar}`))}</span></div></a></li>
  </ul>
</div>`;
}

export function processSteps(c) {
  const steps = [
    ["message", c.t("Consult", "الاستشارة"), c.t("We start with your workflow, test volumes and clinical goals, then advise on the technologies that fit.", "نبدأ بفهم سير العمل لديك وحجم الفحوصات وأهدافك السريرية، ثم نقترح التقنيات الأنسب.")],
    ["listChecks", c.t("Select", "الاختيار"), c.t("We help you compare platforms and choose the right system for your laboratory, budget and regulatory needs.", "نساعدك على مقارنة المنصات واختيار النظام المناسب لمختبرك وميزانيتك ومتطلباتك التنظيمية.")],
    ["wrench", c.t("Install & train", "التركيب والتدريب"), c.t("Our technical team and application specialists support installation and hands-on training for your staff.", "يدعم فريقنا الفني وأخصائيو التطبيقات عملية التركيب والتدريب العملي لفريقك.")],
    ["headset", c.t("Support", "الدعم"), c.t("Responsive technical service and after-sales support keep your systems running and your results reliable.", "خدمة فنية سريعة ودعم ما بعد البيع يحافظان على تشغيل أنظمتك وموثوقية نتائجك.")],
  ];
  return `<ol class="process reveal-stagger">${steps.map(([, h, p], i) => `<li class="process__step"><span class="process__num" aria-hidden="true">${i + 1}</span><h3>${h}</h3><p>${p}</p></li>`).join("")}</ol>`;
}

export function sectors(c) {
  const list = [
    ["hospital", c.t("Hospitals", "المستشفيات"), c.t("Analysers, point-of-care tests and medical devices for hospital laboratories and wards.", "أجهزة تحليل وفحوصات نقطة الرعاية وأجهزة طبية لمختبرات المستشفيات وأقسامها.")],
    ["flask", c.t("Laboratories", "المختبرات"), c.t("Automation, molecular and immunoassay systems for clinical and reference laboratories.", "أنظمة أتمتة وتشخيص جزيئي ومقايسات مناعية للمختبرات السريرية والمرجعية.")],
    ["graduation", c.t("Universities", "الجامعات"), c.t("Teaching and research tools for medical, pathology and life-science programmes.", "أدوات تعليمية وبحثية لبرامج الطب وعلم الأمراض وعلوم الحياة.")],
    ["microscope", c.t("Research centres", "مراكز الأبحاث"), c.t("Instruments, purification kits and reagents for discovery and translational work.", "أجهزة وأطقم تنقية وكواشف لأبحاث الاكتشاف والأبحاث الانتقالية.")],
  ];
  return `<ul class="sectors reveal-stagger">${list.map(([, h, p]) => `<li class="sector"><h3>${h}</h3><p>${p}</p></li>`).join("")}</ul>`;
}

export function assurance(c) {
  return `<div class="assurance">
  <div><h3>${c.t("Expert consultation", "استشارة متخصصة")}</h3><p>${c.t("Guidance on system selection based on your workflow, volumes and goals.", "توجيه في اختيار النظام بناءً على سير عملك وحجم الفحوصات وأهدافك.")}</p></div>
  <div><h3>${c.t("Installation & training", "التركيب والتدريب")}</h3><p>${c.t("Application specialists who help your team get the most from every system.", "أخصائيو تطبيقات يساعدون فريقك على الاستفادة القصوى من كل نظام.")}</p></div>
  <div><h3>${c.t("Long-term support", "دعم طويل الأمد")}</h3><p>${c.t("Responsive technical service and after-sales support.", "خدمة فنية سريعة ودعم ما بعد البيع.")}</p></div>
</div>`;
}

/* ---------- Forms ---------- */
const field = (c, { name, label, type = "text", required = false, autocomplete = "", placeholder = "", full = false, options = null, rows = 0, value = "", dir = "", error = null }) => {
  const id = `f-${name}`;
  const req = required ? ` <span class="req" aria-hidden="true">*</span>` : ` <span class="opt">(${c.t("optional", "اختياري")})</span>`;
  const common = `id="${id}" name="${name}"${required ? " required" : ""}${autocomplete ? ` autocomplete="${autocomplete}"` : ""} aria-describedby="${id}-err"${dir ? ` dir="${dir}"` : ""}`;
  let control;
  if (options) control = `<select ${common}>${options.map(([v, l]) => `<option value="${esc(v)}"${v === value ? " selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
  else if (rows) control = `<textarea ${common} rows="${rows}"${placeholder ? ` placeholder="${esc(placeholder)}"` : ""}></textarea>`;
  else control = `<input class="input" type="${type}" ${common}${placeholder ? ` placeholder="${esc(placeholder)}"` : ""}${value ? ` value="${esc(value)}"` : ""}>`;
  const err = error || (type === "email" ? c.t("Please enter a valid email address.", "يرجى إدخال بريد إلكتروني صحيح.") : c.t("This field is required.", "هذا الحقل مطلوب."));
  return `<div class="field"${full ? ' style="grid-column:1/-1"' : ""}><label for="${id}">${label}${req}</label>${control}<span class="field__error" id="${id}-err">${err}</span></div>`;
};

function formShell(c, { kind, inner, submitLabel, successTitle, successText }) {
  const altchaStrings = c.lang === "ar"
    ? { label: "لست روبوتًا", verifying: "جارٍ التحقق…", verified: "تم التحقق", error: "تعذّر التحقق. حاول مرة أخرى.", expired: "انتهت صلاحية التحقق. حاول مرة أخرى.", waitAlert: "" }
    : { waitAlert: "" };
  return `<form class="form" action="/api/contact" method="post" novalidate data-form="${kind}">
  <input type="hidden" name="form" value="${kind}">
  <input type="hidden" name="lang" value="${c.lang}">
  <input type="hidden" name="_page" value="">
  <div class="hp" aria-hidden="true"><label>${c.t("Leave this field empty", "اترك هذا الحقل فارغًا")}<input type="text" name="_honey" tabindex="-1" autocomplete="off"></label></div>
  ${inner}
  <altcha-widget challengeurl="/api/altcha/challenge" name="altcha" auto="onsubmit" hidefooter hidelogo strings='${esc(JSON.stringify(altchaStrings))}'></altcha-widget>
  <div class="form__status" role="alert" data-form-status></div>
  <button class="btn btn--block" type="submit" data-label="${esc(submitLabel)}" data-busy="${esc(c.t("Sending…", "جارٍ الإرسال…"))}">${submitLabel} ${icon("arrow")}</button>
  <p class="form__legal">${c.t(`We use your details only to respond to your enquiry. See our <a href="${c.u("/privacy-policy")}">privacy policy</a>.`, `لا نستخدم بياناتك إلا للرد على استفسارك. اطّلع على <a href="${c.u("/privacy-policy")}">سياسة الخصوصية</a>.`)}</p>
  <div class="form__success" tabindex="-1" data-form-success>${icon("checkCircle")}<h3>${successTitle}</h3><p>${successText}</p></div>
</form>`;
}

export function contactForm(c) {
  const topics = [
    ["product", c.t("Product information", "معلومات عن منتج")],
    ["quotation", c.t("Quotation", "عرض سعر")],
    ["support", c.t("Technical support", "الدعم الفني")],
    ["partnership", c.t("Partnership / distribution", "شراكة / توزيع")],
    ["careers", c.t("Careers", "الوظائف")],
    ["other", c.t("Something else", "موضوع آخر")],
  ];
  const inner = `<div class="form__row">
    ${field(c, { name: "first_name", label: c.t("First name", "الاسم الأول"), required: true, error: c.t("Please enter your first name.", "يرجى إدخال اسمك الأول."), autocomplete: "given-name" })}
    ${field(c, { name: "last_name", label: c.t("Last name", "اسم العائلة"), required: true, error: c.t("Please enter your last name.", "يرجى إدخال اسم العائلة."), autocomplete: "family-name" })}
  </div>
  <div class="form__row">
    ${field(c, { name: "email", label: c.t("Work email", "البريد الإلكتروني للعمل"), type: "email", required: true, autocomplete: "email", placeholder: "name@hospital.sa", dir: "ltr" })}
    ${field(c, { name: "phone", label: c.t("Phone", "رقم الجوال"), type: "tel", autocomplete: "tel", placeholder: "+966", dir: "ltr" })}
  </div>
  <div class="form__row">
    ${field(c, { name: "organization", label: c.t("Organisation", "الجهة"), autocomplete: "organization" })}
    ${field(c, { name: "topic", label: c.t("Topic", "الموضوع"), required: true, options: topics, value: "product" })}
  </div>
  ${field(c, { name: "message", error: c.t("Please tell us how we can help.", "يرجى إخبارنا بكيفية مساعدتك."), label: c.t("How can we help?", "كيف يمكننا مساعدتك؟"), required: true, rows: 6, placeholder: c.t("Tell us about your laboratory, the tests you run, or the product you're interested in.", "أخبرنا عن مختبرك أو الفحوصات التي تجريها أو المنتج الذي تهتم به.") })}`;
  return formShell(c, {
    kind: "contact",
    inner,
    submitLabel: c.t("Send message", "إرسال الرسالة"),
    successTitle: c.t("Message received", "تم استلام رسالتك"),
    successText: c.t("Thank you for contacting Binary System Medical. Our team will get back to you shortly.", "شكرًا لتواصلك مع باينري سيستم الطبية. سيتواصل معك فريقنا قريبًا."),
  });
}

export function quoteForm(c) {
  const facility = [
    ["", c.t("Select…", "اختر…")],
    ["hospital", c.t("Hospital", "مستشفى")],
    ["laboratory", c.t("Clinical / reference laboratory", "مختبر سريري / مرجعي")],
    ["clinic", c.t("Clinic or check-up centre", "عيادة أو مركز فحص")],
    ["university", c.t("University", "جامعة")],
    ["research", c.t("Research centre", "مركز أبحاث")],
    ["other", c.t("Other", "أخرى")],
  ];
  const inner = `<input type="hidden" name="items" value="" data-quote-items>
  <div class="form__row">
    ${field(c, { name: "first_name", label: c.t("First name", "الاسم الأول"), required: true, error: c.t("Please enter your first name.", "يرجى إدخال اسمك الأول."), autocomplete: "given-name" })}
    ${field(c, { name: "last_name", label: c.t("Last name", "اسم العائلة"), required: true, error: c.t("Please enter your last name.", "يرجى إدخال اسم العائلة."), autocomplete: "family-name" })}
  </div>
  <div class="form__row">
    ${field(c, { name: "organization", label: c.t("Organisation", "الجهة"), required: true, error: c.t("Please enter your organisation.", "يرجى إدخال اسم الجهة."), autocomplete: "organization" })}
    ${field(c, { name: "job_title", label: c.t("Job title / department", "المسمى الوظيفي / القسم"), autocomplete: "organization-title" })}
  </div>
  <div class="form__row">
    ${field(c, { name: "email", label: c.t("Work email", "البريد الإلكتروني للعمل"), type: "email", required: true, autocomplete: "email", placeholder: "name@hospital.sa", dir: "ltr" })}
    ${field(c, { name: "phone", label: c.t("Phone", "رقم الجوال"), type: "tel", autocomplete: "tel", placeholder: "+966", dir: "ltr" })}
  </div>
  <div class="form__row">
    ${field(c, { name: "facility", label: c.t("Facility type", "نوع المنشأة"), options: facility })}
    ${field(c, { name: "city", label: c.t("City", "المدينة"), autocomplete: "address-level2" })}
  </div>
  ${field(c, { name: "message", error: c.t("Please describe what you need.", "يرجى وصف ما تحتاج إليه."), label: c.t("Requirements", "المتطلبات"), required: true, rows: 6, placeholder: c.t("Quantities, test volumes, configuration, timeline or anything else that helps us prepare your quotation.", "الكميات أو حجم الفحوصات أو الإعدادات المطلوبة أو الجدول الزمني أو أي تفاصيل تساعدنا في إعداد عرض السعر.") })}`;
  return formShell(c, {
    kind: "quote",
    inner,
    submitLabel: c.t("Send quotation request", "إرسال طلب عرض السعر"),
    successTitle: c.t("Quotation request sent", "تم إرسال طلب عرض السعر"),
    successText: c.t("Thank you. A member of our team will review your requirements and contact you shortly.", "شكرًا لك. سيراجع أحد أعضاء فريقنا متطلباتك ويتواصل معك قريبًا."),
  });
}

export { formatDate, readMinutes, readTime, techCount };
