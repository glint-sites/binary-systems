import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { esc, localPath, ORIGIN, jsonLd } from "./util.mjs";
import { icon } from "./icons.mjs";

// /css and /js are served as immutable, so the cache-busting version is a hash of their content.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const ASSET_V = crypto.createHash("sha1")
  .update(fs.readFileSync(path.join(ROOT, "css/site.css")))
  .update(fs.readFileSync(path.join(ROOT, "js/site.js")))
  .digest("hex").slice(0, 10);

function head(c, page) {
  const { site } = c.data;
  const title = page.title;
  const desc = page.description;
  const canonical = ORIGIN + c.u(page.path);
  const og = ORIGIN + (page.ogImage || `/images/og/og-${c.lang}.png`);
  const alt = (l) => ORIGIN + localPath(l, page.path);
  const fonts = c.lang === "ar"
    ? `<link rel="preload" href="/fonts/IBMPlexSansArabic-normal-400-arabic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/IBMPlexSansArabic-normal-700-arabic.woff2" as="font" type="font/woff2" crossorigin>`
    : `<link rel="preload" href="/fonts/Archivo-normal-100-900-latin.woff2" as="font" type="font/woff2" crossorigin>`;
  return `<!doctype html>
<html lang="${c.lang}" dir="${c.dir}" class="no-js${page.headerOnDark ? " header-on-dark" : ""}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="${alt("en")}">
<link rel="alternate" hreflang="ar" href="${alt("ar")}">
<link rel="alternate" hreflang="x-default" href="${alt("en")}">
${page.noindex ? '<meta name="robots" content="noindex">\n' : ""}<meta name="theme-color" content="#150e24">
<meta name="format-detection" content="telephone=no">
<meta property="og:type" content="${page.ogType || "website"}">
<meta property="og:site_name" content="${esc(c.t("Binary System Medical", "باينري سيستم الطبية"))}">
<meta property="og:title" content="${esc(page.ogTitle || title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
${page.ogImage ? "" : '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'}<meta property="og:locale" content="${c.lang === "ar" ? "ar_SA" : "en_US"}">
<meta property="og:locale:alternate" content="${c.lang === "ar" ? "en_US" : "ar_SA"}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/images/brand/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
${fonts}
<link rel="stylesheet" href="/css/site.min.css?v=${ASSET_V}">
<script>document.documentElement.classList.replace("no-js","js");${LANG_ARRIVAL}</script>
${speculationRules()}
${(page.jsonld || []).map(jsonLd).join("\n")}
</head>`;
}

// Runs in <head> so it is registered before the first frame: when this page is the target of a
// language switch, tag the view transition "lang" and scroll to the section the reader was on
// (saved by js/site.js). Only then is a parser-inserted rel=expect written, so the first frame
// waits for the full DOM; ordinary page loads keep progressive rendering.
const LANG_ARRIVAL = `(function(){var K="bsm-lang-pos";function pos(){try{var p=JSON.parse(localStorage.getItem(K));if(p&&p.to===location.pathname&&Date.now()-p.t<20000)return p}catch(e){}return null}if(pos()){document.documentElement.classList.add("lang-arrival");if(!document.prerendering)document.write('<link rel="expect" href="#page-end" blocking="render">')}function restore(){var p=pos();if(!p)return;try{localStorage.removeItem(K)}catch(e){}var m=document.getElementById("main");if(!m||!(p.i>0||p.r>0))return;var b=[].filter.call(m.children,function(x){return x.offsetHeight>0})[p.i];if(!b)return;var h=document.querySelector("[data-header]");window.scrollTo({top:Math.max(0,b.getBoundingClientRect().top+window.scrollY+p.r*b.offsetHeight-(h?h.offsetHeight:0)),behavior:"instant"})}if("onpagereveal" in window)addEventListener("pagereveal",function(e){if(pos()&&e.viewTransition&&e.viewTransition.types)e.viewTransition.types.add("lang");restore()});else addEventListener("DOMContentLoaded",restore)})();`;

// Prerender the other-language version of the page so the language switch is instant, and
// prefetch any internal link on hover. Browsers without the Speculation Rules API ignore this.
function speculationRules() {
  const rules = {
    prerender: [{ where: { selector_matches: "[data-lang-switch]" }, eagerness: "eager" }],
    prefetch: [{ where: { and: [{ href_matches: "/*" }, { not: { href_matches: "/api/*" } }, { not: { selector_matches: "[data-lang-switch]" } }] }, eagerness: "moderate" }],
  };
  return `<script type="speculationrules">${JSON.stringify(rules)}</script>`;
}

function topbar(c) {
  const { company } = c.data.site;
  return `<div class="topbar">
  <div class="container">
    <div class="topbar__group">
      <span class="topbar__item">${icon("shield")}${c.t("SFDA-certified medical technology company", "شركة تقنيات طبية معتمدة من الهيئة العامة للغذاء والدواء")}</span>
      <span class="topbar__item topbar__group--secondary">${icon("pin")}${c.t("Riyadh, Saudi Arabia", "الرياض، المملكة العربية السعودية")}</span>
    </div>
    <div class="topbar__group">
      <a class="topbar__item" href="tel:${company.phone_tel}">${icon("phone")}<span class="ltr">${esc(company.phone)}</span></a>
      <a class="topbar__item topbar__group--secondary" href="mailto:${company.email}">${icon("mail")}${esc(company.email)}</a>
    </div>
  </div>
</div>`;
}

function megaMenu(c) {
  const { taxonomy, products } = c.data;
  const count = (fn) => products.filter(fn).length;
  const cols = taxonomy.divisions.map((d) => {
    const items = d.disciplines.map((id) => {
      const disc = taxonomy.disciplines.find((x) => x.id === id);
      return `<li><a href="${c.u(`/solutions/${d.slug}`)}#${id}"><span>${esc(c.tx(disc).name)}</span><span class="count">${count((p) => p.discipline === id)}</span></a></li>`;
    }).join("");
    return `<div class="mega__col">
      <a class="mega__title" href="${c.u(`/solutions/${d.slug}`)}"><span class="mega__code">${d.code}</span>${esc(c.tx(d).name)}</a>
      <p class="mega__desc">${esc(c.tx(d).tagline)}</p>
      <ul class="mega__list">${items}</ul>
    </div>`;
  }).join("");
  return `<div class="mega" id="mega-solutions" data-mega inert>
  <div class="container mega__inner">
    ${cols}
    <a class="mega__feature" href="${c.u("/products/")}">
      <div><strong>${c.t("Browse every technology in one catalogue", "تصفّح جميع التقنيات في دليل واحد")}</strong><span>${c.t(`${products.length} technologies · filter by discipline or brand`, `${products.length} تقنية · تصفية حسب التخصص أو العلامة التجارية`)}</span></div>
      <span class="link-arrow">${c.t("All products", "جميع المنتجات")} ${icon("arrow")}</span>
      <img src="/images/products/vivalytic-xs.webp" alt="" width="440" height="309" loading="lazy">
    </a>
  </div>
</div>`;
}

const NAV = [
  { key: "products", path: "/products/", en: "Products", ar: "المنتجات" },
  { key: "partners", path: "/partners", en: "Partners", ar: "الشركاء" },
  { key: "about", path: "/about", en: "About", ar: "من نحن" },
  { key: "insights", path: "/insights/", en: "Insights", ar: "المقالات" },
  { key: "contact", path: "/contact", en: "Contact", ar: "تواصل معنا" },
];

function langLink(c, page, cls) {
  const target = localPath(c.other, page.path);
  const label = c.lang === "ar" ? `<span lang="en">English</span>` : `<span lang="ar">العربية</span>`;
  const title = c.lang === "ar" ? ` title="View this page in English"` : ` title="عرض هذه الصفحة باللغة العربية"`;
  return `<a class="${cls}" href="${target}" hreflang="${c.other}" lang="${c.other}"${title} data-lang-switch>${icon("globe")}${label}</a>`;
}

function header(c, page) {
  const cur = page.nav;
  const links = NAV.map((n) => `<a class="nav__link" href="${c.u(n.path)}"${cur === n.key ? ' aria-current="page"' : ""}>${c.t(n.en, n.ar)}</a>`).join("");
  return `${topbar(c)}
<header class="site-header" data-header>
  <div class="container">
    <a class="brand" href="${c.u("/")}" aria-label="${esc(c.t("Binary System Medical — home", "باينري سيستم الطبية — الرئيسية"))}">
      <img class="logo-dark" src="/images/brand/bsm-logo.svg" alt="Binary System Medical" width="137" height="56">
      <img class="logo-light" src="/images/brand/bsm-logo-white.svg" alt="" width="137" height="56">
    </a>
    <nav class="nav" aria-label="${c.t("Main", "القائمة الرئيسية")}">
      <button class="nav__trigger${cur === "solutions" ? " is-current" : ""}" type="button" aria-expanded="false" aria-controls="mega-solutions" data-mega-toggle>${c.t("Solutions", "الحلول")} ${icon("chevronDown")}</button>
      ${megaMenu(c)}
      ${links}
    </nav>
    <div class="header-actions">
      ${langLink(c, page, "lang-switch")}
      <a class="quote-pill" href="${c.u("/quote")}" data-quote-link>${icon("clipboard")}<span class="sr-only">${c.t("Quote list", "قائمة عرض السعر")}</span><span class="quote-count" data-quote-count>0</span></a>
      <a class="btn btn--sm btn--header" href="${c.u("/quote")}">${c.t("Request a quotation", "اطلب عرض سعر")}</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="drawer" data-drawer-open aria-label="${esc(c.t("Open menu", "فتح القائمة"))}">${icon("menu")}</button>
    </div>
  </div>
</header>
${drawer(c, page)}`;
}

function drawer(c, page) {
  const { taxonomy } = c.data;
  const { company } = c.data.site;
  const sub = taxonomy.divisions.map((d) => {
    const items = d.disciplines.map((id) => {
      const disc = taxonomy.disciplines.find((x) => x.id === id);
      return `<a href="${c.u(`/solutions/${d.slug}`)}#${id}">${esc(c.tx(disc).name)}</a>`;
    }).join("");
    return `<a class="drawer__sub-head" href="${c.u(`/solutions/${d.slug}`)}">${esc(c.tx(d).name)} (${d.code})</a>${items}`;
  }).join("");
  return `<div class="drawer" id="drawer" data-drawer aria-hidden="true">
  <div class="drawer__backdrop" data-drawer-close></div>
  <div class="drawer__panel" role="dialog" aria-modal="true" aria-label="${esc(c.t("Menu", "القائمة"))}">
    <div class="drawer__head">
      <img src="/images/brand/bsm-logo.svg" alt="Binary System Medical" width="137" height="56">
      <button class="drawer__close" type="button" data-drawer-close aria-label="${esc(c.t("Close menu", "إغلاق القائمة"))}">${icon("x")}</button>
    </div>
    <nav class="drawer__nav" aria-label="${c.t("Mobile", "قائمة الجوال")}">
      <details><summary>${c.t("Solutions", "الحلول")} ${icon("chevronDown")}</summary><div class="drawer__sub">${sub}</div></details>
      ${NAV.map((n) => `<a href="${c.u(n.path)}"${page.nav === n.key ? ' aria-current="page"' : ""}>${c.t(n.en, n.ar)}</a>`).join("")}
      ${langLink(c, page, "")}
    </nav>
    <div class="drawer__foot">
      <a class="btn btn--block" href="${c.u("/quote")}">${c.t("Request a quotation", "اطلب عرض سعر")} ${icon("arrow")}</a>
      <a class="btn btn--ghost btn--block" href="tel:${company.phone_tel}">${icon("phone")}<span class="ltr">${esc(company.phone)}</span></a>
      <div class="drawer__contact"><a href="mailto:${company.email}">${esc(company.email)}</a><span>${esc(c.t(`${company.street}, ${company.city}`, `${company.street_ar}، ${company.city_ar}`))}</span></div>
    </div>
  </div>
</div>`;
}

function footer(c, page) {
  const { site, taxonomy } = c.data;
  const { company, social } = site;
  const year = new Date().getFullYear();
  const socials = Object.entries(social).filter(([, v]) => v);
  const socialIcon = { linkedin: "linkedin", x: "xSocial", instagram: "instagram", facebook: "facebook" };
  return `<footer class="site-footer">
  <div class="footer__bin" aria-hidden="true">01000010 01010011 01001101
01001001 01010110 01000100
01001101 01000100 00100000
01010010 01010101 01001111</div>
  <div class="container">
    <div class="footer__grid">
      <div class="footer__brand">
        <img src="/images/brand/bsm-logo-white.svg" alt="Binary System Medical" width="137" height="56" loading="lazy">
        <p>${c.t("Your trusted partner for IVD and medical device solutions in Saudi Arabia — a subsidiary of Saudi Mais Co.", "شريكك الموثوق لحلول التشخيص المخبري والأجهزة الطبية في المملكة العربية السعودية — إحدى الشركات التابعة لشركة ميس السعودية.")}</p>
        <div class="footer__badges">
          <span class="footer__badge">${icon("shield")}${c.t("SFDA-certified", "معتمدة من هيئة الغذاء والدواء")}</span>
          <span class="footer__badge">${icon("calendar")}${c.t("Since 2015", "منذ 2015")}</span>
        </div>
        ${socials.length ? `<div class="footer__badges">${socials.map(([k, v]) => `<a class="footer__badge" href="${esc(v)}" rel="noopener" target="_blank" aria-label="${k}">${icon(socialIcon[k])}</a>`).join("")}</div>` : ""}
      </div>
      <div class="footer__col">
        <h2>${c.t("Solutions", "الحلول")}</h2>
        <ul>
          ${taxonomy.divisions.map((d) => `<li><a href="${c.u(`/solutions/${d.slug}`)}">${esc(c.tx(d).name)} (${d.code})</a></li>`).join("")}
          <li><a href="${c.u("/products/")}">${c.t("All products", "جميع المنتجات")}</a></li>
        </ul>
      </div>
      <div class="footer__col">
        <h2>${c.t("Company", "الشركة")}</h2>
        <ul>
          <li><a href="${c.u("/about")}">${c.t("About BSM", "من نحن")}</a></li>
          <li><a href="${c.u("/partners")}">${c.t("Partners", "الشركاء")}</a></li>
          <li><a href="${c.u("/insights/")}">${c.t("Insights", "المقالات")}</a></li>
          <li><a href="${c.u("/about")}#careers">${c.t("Careers", "الوظائف")}</a></li>
          <li><a href="${c.u("/quote")}">${c.t("Request a quotation", "اطلب عرض سعر")}</a></li>
        </ul>
      </div>
      <div class="footer__col footer__contact">
        <h2>${c.t("Get in touch", "تواصل معنا")}</h2>
        <ul>
          <li>${icon("phone")}<a href="tel:${company.phone_tel}" class="ltr">${esc(company.phone)}</a></li>
          <li>${icon("mail")}<a href="mailto:${company.email}">${esc(company.email)}</a></li>
          <li>${icon("pin")}<a href="${esc(company.maps_url)}" rel="noopener" target="_blank">${esc(c.t(`${company.street}, ${company.city} ${company.postal_code}, Saudi Arabia`, `${company.street_ar}، ${company.city_ar} ${company.postal_code}، المملكة العربية السعودية`))}</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__bottom">
      <span>© ${year} ${esc(c.t(company.name, company.name_ar))} ${c.t("All rights reserved.", "جميع الحقوق محفوظة.")}</span>
      <div class="footer__bottom-links">
        <a href="${c.u("/privacy-policy")}">${c.t("Privacy policy", "سياسة الخصوصية")}</a>
        <a href="${c.u("/contact")}">${c.t("Contact", "تواصل معنا")}</a>
        ${langLink(c, page, "")}
      </div>
    </div>
  </div>
</footer>`;
}

export function layout(c, page) {
  const toast = `<div class="toast" role="status" aria-live="polite" data-toast>${icon("checkCircle")}<span data-toast-text></span><a href="${c.u("/quote")}">${c.t("View list", "عرض القائمة")}</a></div>`;
  // The language hint is written in the *other* language: it speaks to visitors whose browser prefers it.
  const i18n = {
    added: c.t("added to your quote list", "— تمت الإضافة إلى قائمة عرض السعر"),
    removed: c.t("removed from your quote list", "— تمت الإزالة من قائمة عرض السعر"),
    hint: c.lang === "en"
      ? { lang: "ar", dir: "rtl", text: "هذا الموقع متاح أيضًا باللغة العربية.", cta: "عرض بالعربية", close: "إغلاق" }
      : { lang: "en", dir: "ltr", text: "This website is also available in English.", cta: "View in English", close: "Dismiss" },
  };
  return `${head(c, page)}
<body class="${page.bodyClass || ""}">
<a class="skip-link" href="#main">${c.t("Skip to content", "انتقل إلى المحتوى")}</a>
${header(c, page)}
<main id="main">
${page.main}
</main>
${footer(c, page)}
${toast}
<script type="application/json" id="i18n">${JSON.stringify(i18n)}</script>
<span id="page-end" hidden></span>
<script src="/js/site.js?v=${ASSET_V}" defer></script>
${page.scripts || ""}
</body>
</html>
`;
}
