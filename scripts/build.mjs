// Static site generator for binarysys.net.
// Usage: npm run build   (node scripts/build.mjs)
// Rebuilds every English and Arabic page from content/*.json + site.config.json, then
// writes sitemap.xml and checks that every internal link and image resolves.
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LANGS, ORIGIN, context, outFile, localPath, fixArabicBidi } from "./lib/util.mjs";
import { layout } from "./lib/layout.mjs";
import { home } from "./pages/home.mjs";
import { about, partners, contact } from "./pages/company.mjs";
import { catalog, division, product } from "./pages/catalog.mjs";
import { insightsIndex, article, quote, privacy, thanks, notFound } from "./pages/misc.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8"));

const data = {
  site: read("site.config.json"),
  taxonomy: read("content/taxonomy.json"),
  brands: read("content/brands.json"),
  products: read("content/products.json"),
  insights: read("content/insights.json"),
};

// ---- Data checks: fail the build rather than ship a broken page. ----
const errors = [];
for (const p of data.products) {
  if (!data.brands.find((b) => b.slug === p.brand)) errors.push(`product ${p.slug}: unknown brand ${p.brand}`);
  if (!data.taxonomy.disciplines.find((d) => d.id === p.discipline && d.division === p.division)) errors.push(`product ${p.slug}: bad division/discipline`);
  for (const l of LANGS) if (!p[l]?.name || !p[l]?.summary) errors.push(`product ${p.slug}: missing ${l} name/summary`);
  for (const f of [`images/products/${p.slug}.webp`, `images/products/${p.slug}-sm.webp`]) if (!fs.existsSync(path.join(ROOT, f))) errors.push(`missing ${f}`);
}
for (const b of data.brands) {
  if (b.logo && !fs.existsSync(path.join(ROOT, "images/partners", b.logo))) errors.push(`brand ${b.slug}: missing logo ${b.logo}`);
  for (const l of LANGS) if (!b[l]?.about) errors.push(`brand ${b.slug}: missing ${l} about`);
}
for (const i of data.insights) for (const s of i.related) if (!data.products.find((p) => p.slug === s)) errors.push(`insight ${i.slug}: unknown related product ${s}`);
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }

// ---- Render ----
const pageFns = [
  home, about, partners, contact, catalog, insightsIndex, quote, privacy, thanks, notFound,
  ...data.taxonomy.divisions.map((d) => (c) => division(c, d)),
  ...data.products.map((p) => (c) => product(c, p)),
  ...data.insights.map((post) => (c) => article(c, post)),
];

const written = [];
const sitemap = [];
for (const lang of LANGS) {
  for (const fn of pageFns) {
    const c = context(lang, null, data);
    const page = fn(c);
    const html = lang === "ar" ? fixArabicBidi(layout(c, page)) : layout(c, page);
    const file = outFile(lang, page.path);
    fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, file), html);
    written.push(file);
    if (lang === "en" && !page.noindex) sitemap.push(page.path);
  }
}

// ---- sitemap.xml with hreflang alternates ----
const today = new Date().toISOString().slice(0, 10);
const urls = sitemap.flatMap((p) => LANGS.map((l) => `  <url>
    <loc>${ORIGIN}${localPath(l, p)}</loc>
    <lastmod>${today}</lastmod>
${LANGS.map((a) => `    <xhtml:link rel="alternate" hreflang="${a}" href="${ORIGIN}${localPath(a, p)}"/>`).join("\n")}
    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}${p}"/>
  </url>`));
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`);

// ---- css/site.min.css: comments and layout whitespace stripped (quoted strings untouched) ----
const cssSrc = fs.readFileSync(path.join(ROOT, "css/site.css"), "utf8");
const cssMin = cssSrc
  .split(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/)
  .map((part, i) => (i % 2 ? part : part.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{};,])\s*/g, "$1").replace(/;}/g, "}")))
  .join("")
  .trim();
fs.writeFileSync(path.join(ROOT, "css/site.min.css"), cssMin + "\n");

// ---- CSP: allow exactly the inline scripts we ship (by hash) instead of 'unsafe-inline' ----
// Data blocks (application/json, ld+json) never execute, so only classic and speculation-rules scripts count.
const inline = new Set();
for (const file of written) {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  for (const m of html.matchAll(/<script(\s+type="(speculationrules|module)")?>([\s\S]*?)<\/script>/g)) inline.add(m[3]);
}
const hashes = [...inline].map((src) => `'sha256-${crypto.createHash("sha256").update(src, "utf8").digest("base64")}'`);
const headersFile = path.join(ROOT, "_headers");
const headers = fs.readFileSync(headersFile, "utf8").replace(/script-src [^;]*;/, `script-src 'self' ${hashes.join(" ")} https://static.cloudflareinsights.com;`);
fs.writeFileSync(headersFile, headers);

// ---- Link + asset check over everything we just wrote ----
const exists = (urlPath) => {
  const clean = decodeURI(urlPath.split(/[?#]/)[0]);
  if (clean.startsWith("/api/")) return true;
  const candidates = clean.endsWith("/") ? [`${clean}index.html`] : [clean, `${clean}.html`];
  return candidates.some((f) => fs.existsSync(path.join(ROOT, f)) && fs.statSync(path.join(ROOT, f)).isFile());
};
const broken = new Set();
for (const file of written) {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  for (const m of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    if (m[1].includes(".html")) broken.add(`${file}: .html in link ${m[1]}`);
    else if (!exists(m[1])) broken.add(`${file}: ${m[1]}`);
  }
  for (const m of html.matchAll(/href="#([^"]+)"/g)) {
    if (!html.includes(`id="${m[1]}"`)) broken.add(`${file}: missing anchor #${m[1]}`);
  }
}
if (broken.size) { console.error(`Broken references:\n${[...broken].join("\n")}`); process.exit(1); }
console.log(`Built ${written.length} pages (${LANGS.join(" + ")}), sitemap with ${sitemap.length * LANGS.length} URLs. All links resolve.`);
