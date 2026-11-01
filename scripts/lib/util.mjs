// Shared helpers for the static site generator.

export const LANGS = ["en", "ar"];
export const ORIGIN = "https://binarysys.net";

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (ch) => ESC[ch]);

// Localised URL for a site path ("/about" → "/ar/about" in Arabic). Paths stay extensionless.
export function localPath(lang, path) {
  if (lang === "en") return path;
  return path === "/" ? "/ar/" : `/ar${path}`;
}

// Output file for a site path: "/" → index.html, "/products/" → products/index.html, "/about" → about.html.
export function outFile(lang, path) {
  let f = path.endsWith("/") ? `${path}index.html` : `${path}.html`;
  f = f.replace(/^\//, "");
  return lang === "en" ? f : `ar/${f}`;
}

// Build the per-page context: c.t("English", "العربية") picks the active language.
export function context(lang, path, data) {
  return {
    lang,
    dir: lang === "ar" ? "rtl" : "ltr",
    path,
    data,
    t: (en, ar) => (lang === "ar" ? ar : en),
    tx: (obj) => (obj ? obj[lang] ?? obj.en : ""),
    u: (p) => localPath(lang, p),
    other: lang === "ar" ? "en" : "ar",
  };
}

const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MON_EN = MONTHS_EN.map((m) => m.slice(0, 3));

export function formatDate(iso, lang) {
  const [y, m, d] = iso.split("-").map(Number);
  return lang === "ar" ? `${d} ${MONTHS_AR[m - 1]} ${y}` : `${MONTHS_EN[m - 1]} ${d}, ${y}`;
}
export function dateParts(iso, lang) {
  const [, m, d] = iso.split("-").map(Number);
  return { day: d, mon: lang === "ar" ? MONTHS_AR[m - 1] : MON_EN[m - 1] };
}

// "1 technology" / "2 technologies"; Arabic avoids number agreement with a label ("التقنيات: 3").
export const techCount = (c, n) => c.t(`${n} ${n === 1 ? "technology" : "technologies"}`, `التقنيات: ${n}`);

// Reading time with correct Arabic number agreement (دقيقة واحدة / دقيقتان / 3–10 دقائق / 11+ دقيقة).
export function readTime(c, minutes) {
  if (c.lang !== "ar") return `${minutes} min read`;
  const m = minutes === 1 ? "دقيقة واحدة" : minutes === 2 ? "دقيقتان" : minutes <= 10 ? `${minutes} دقائق` : `${minutes} دقيقة`;
  return `مدة القراءة: ${m}`;
}

export function readMinutes(blocks) {
  const words = blocks.map((b) => [b.h2, b.p, ...(b.ul || [])].filter(Boolean).join(" ")).join(" ").split(/\s+/).length;
  return Math.max(2, Math.round(words / 200));
}

// Rescale an absolute SVG path (M/L/H/V/C/Z only) into the 0–1 box for clipPathUnits="objectBoundingBox".
export function normalizePath(d, box) {
  const [x0, y0, w, h] = box;
  const tokens = d.match(/[MLHVCZ]|-?\d*\.?\d+(?:e-?\d+)?/gi);
  let out = [], cmd = null, i = 0, coordIdx = 0;
  const fx = (v) => ((v - x0) / w).toFixed(4);
  const fy = (v) => ((v - y0) / h).toFixed(4);
  while (i < tokens.length) {
    const tok = tokens[i];
    if (/[MLHVCZ]/i.test(tok)) { cmd = tok.toUpperCase(); out.push(cmd); coordIdx = 0; i++; continue; }
    const v = parseFloat(tok);
    if (cmd === "H") out.push(fx(v));
    else if (cmd === "V") out.push(fy(v));
    else { out.push(coordIdx % 2 === 0 ? fx(v) : fy(v)); coordIdx++; }
    i++;
  }
  return out.join(" ").replace(/ ([MLHVCZ])/g, "$1").replace(/([MLHVCZ]) /g, "$1");
}

// Deterministic pseudo-random numbers (mulberry32) so the plate renders identically every build.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Arabic pages: a Latin name that ends in ™, ® or + (VitaPCR™, Hyperoil®, PyloPLUS+) sits next to
// Arabic text, and the bidi algorithm moves that trailing symbol to the wrong side. A left-to-right
// mark after it keeps it with its name. Applied to text between tags only (not scripts/attributes).
export function fixArabicBidi(html) {
  return html.replace(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>)|([^<]+)/g, (m, tag, text) =>
    // Also dotted abbreviations such as "RI.MOS." (not a sentence-final period after a Latin word).
    tag ? tag : text.replace(/([A-Za-z0-9][A-Za-z0-9.\-!]*[™®+]|\b[A-Z]{2,}\.[A-Z]{2,}\.)(?!‎)/g, "$1‎"));
}

export const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
