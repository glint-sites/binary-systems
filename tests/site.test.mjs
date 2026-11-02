// Built-site checks over every generated page: node --test tests/  (run `npm run build` first)
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.join(dir, e.name);
    if (e.isDirectory() && !/^(node_modules|\.|scripts|tests|functions|content|images|fonts|css|js)/.test(e.name)) walk(rel);
    else if (e.isFile() && e.name.endsWith(".html")) pages.push(rel.replace(/\\/g, "/"));
  }
})("");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

test("there are English and Arabic versions of every page", () => {
  const en = pages.filter((p) => !p.startsWith("ar/"));
  const ar = pages.filter((p) => p.startsWith("ar/"));
  assert.ok(en.length >= 39, `expected 39+ English pages, got ${en.length}`);
  for (const p of en) assert.ok(ar.includes(`ar/${p}`), `missing Arabic page for ${p}`);
});

for (const p of pages) {
  test(`page basics: ${p}`, () => {
    const html = read(p);
    const ar = p.startsWith("ar/");
    assert.match(html, ar ? /<html lang="ar" dir="rtl"/ : /<html lang="en" dir="ltr"/);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1] || "";
    assert.ok(title.length > 10 && title.length < 120, `title length ${title.length}`);
    const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || "";
    assert.ok(desc.length > 30, "meta description");
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, "exactly one h1");
    assert.match(html, /<link rel="canonical" href="https:\/\/binarysys\.net\//);
    assert.match(html, /hreflang="ar"/);
    assert.match(html, /hreflang="x-default"/);
    for (const m of html.matchAll(/<img\b[^>]*>/g)) {
      assert.match(m[0], /\salt="/, `img without alt: ${m[0].slice(0, 80)}`);
      assert.match(m[0], /\swidth="\d+"/, `img without width: ${m[0].slice(0, 80)}`);
    }
    assert.doesNotMatch(html, /href="\/[^"]*\.html"/, "internal links are extensionless");
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
    if (ar) {
      const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, " ");
      assert.ok(/[؀-ۿ]{20,}|[؀-ۿ]+(\s+[؀-ۿ]+){5,}/.test(text), "Arabic page has Arabic body text");
    }
  });
}

test("hreflang alternates are reciprocal and point at real pages", () => {
  const fileFor = (url) => {
    const p = new URL(url).pathname;
    return (p.endsWith("/") ? `${p}index.html` : `${p}.html`).slice(1);
  };
  for (const p of pages.filter((x) => !/404|thank-you/.test(x))) {
    const html = read(p);
    const en = html.match(/hreflang="en" href="([^"]+)"/)[1];
    const ar = html.match(/hreflang="ar" href="([^"]+)"/)[1];
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)[1];
    assert.equal(canonical, p.startsWith("ar/") ? ar : en, `${p}: canonical is the page's own language`);
    for (const alt of [en, ar]) {
      assert.ok(pages.includes(fileFor(alt)), `${p}: alternate ${alt} has no page`);
      assert.match(read(fileFor(alt)), new RegExp(`rel="canonical" href="${alt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`), `${alt} canonical`);
    }
  }
});

test("language switch plumbing is on every page", () => {
  for (const p of pages) {
    const html = read(p);
    assert.match(html, /<script type="speculationrules">/, `${p}: speculation rules`);
    assert.ok(html.includes(`document.write('<link rel="expect" href="#page-end" blocking="render">')`), `${p}: conditional render-blocking for language arrivals`);
    assert.doesNotMatch(html, /^<link rel="expect"/m, `${p}: ordinary loads are not render-blocked`);
    assert.match(html, /<span id="page-end" hidden><\/span>/, `${p}: end-of-page marker`);
    assert.match(html, /data-lang-switch/, `${p}: language switch link`);
    JSON.parse(html.match(/<script type="speculationrules">([^<]+)<\/script>/)[1]);
  }
});

test("every form posts to the API with spam protection", () => {
  for (const p of ["contact.html", "quote.html", "ar/contact.html", "ar/quote.html"]) {
    const html = read(p);
    assert.match(html, /<form class="form" action="\/api\/contact" method="post"/);
    assert.match(html, /name="_honey"/);
    assert.match(html, /<altcha-widget challengeurl="\/api\/altcha\/challenge"/);
    assert.match(html, /src="\/js\/altcha\.min\.js"/);
  }
});

test("the microplate spells BINARYSYSTEM in ASCII", () => {
  const html = read("index.html");
  const bits = [...html.matchAll(/data-bits="([01]{8})">(\w)</g)];
  assert.equal(bits.length, 12);
  assert.equal(bits.map((b) => String.fromCharCode(parseInt(b[1], 2))).join(""), "BINARYSYSTEM");
  assert.equal(bits.map((b) => b[2]).join(""), "BINARYSYSTEM");
  const lit = (html.match(/class="well is-one"/g) || []).length;
  const expected = [..."BINARYSYSTEM"].reduce((n, ch) => n + ch.charCodeAt(0).toString(2).split("1").length - 1, 0);
  assert.equal(lit, expected, "lit wells match the 1-bits");
});

test("sitemap lists both languages with alternates", () => {
  const xml = read("sitemap.xml");
  assert.match(xml, /<loc>https:\/\/binarysys\.net\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/binarysys\.net\/ar\/<\/loc>/);
  assert.doesNotMatch(xml, /\.html</);
  assert.doesNotMatch(xml, /thank-you|\/404/);
});

test("CSP allows exactly the inline scripts the pages ship (no 'unsafe-inline' for scripts)", async () => {
  const { createHash } = await import("node:crypto");
  const csp = read("_headers").match(/script-src ([^;]*);/)[1];
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/);
  for (const p of pages) {
    for (const m of read(p).matchAll(/<script(\s+type="(speculationrules|module)")?>([\s\S]*?)<\/script>/g)) {
      const h = `'sha256-${createHash("sha256").update(m[3], "utf8").digest("base64")}'`;
      assert.ok(csp.includes(h), `${p}: inline script not allowed by CSP`);
    }
  }
});

test("preview hosts (workers.dev, pages.dev) are noindex; binarysys.net is not", () => {
  const blocks = read("_headers").split(/\n(?=\S)/).filter((b) => !b.startsWith("#"));
  const noindex = blocks.filter((b) => /X-Robots-Tag:\s*noindex/i.test(b)).map((b) => b.split("\n")[0].trim());
  assert.ok(noindex.includes("https://:worker.:subdomain.workers.dev/*"));
  assert.ok(noindex.includes("https://:project.pages.dev/*"));
  assert.ok(noindex.every((rule) => /^https:\/\/.+\.(workers|pages)\.dev\/\*$/.test(rule)), `noindex reaches production: ${noindex}`);
});

test("repo internals at the root are kept off the public site (Pages and Workers)", () => {
  const rules = read("_redirects").split("\n").map((l) => l.split(/\s+/)[0]);
  const ignored = read(".assetsignore").split("\n").filter((l) => l && !l.startsWith("#"));
  const PUBLIC = /^(ar|css|fonts|images|insights|js|products|solutions|_headers|_redirects|.+\.html|favicon\.(ico|svg)|robots\.txt|sitemap\.xml|site\.webmanifest)$/;
  const LOCAL = /^(\.git|\.wrangler|\.dev\.vars|node_modules)$/; // gitignored, so never deployed
  for (const name of fs.readdirSync(ROOT)) {
    const dir = fs.statSync(path.join(ROOT, name)).isDirectory();
    assert.ok(ignored.includes(dir ? `${name}/` : name) || (name.startsWith(".") && ignored.includes(".*")) || PUBLIC.test(name),
      `${name} is neither public nor in .assetsignore`);
    if (PUBLIC.test(name) || LOCAL.test(name)) continue;
    const rule = dir ? `/${name}/*` : `/${name}`;
    assert.ok(rules.includes(rule), `no _redirects rule hiding ${rule}`);
  }
});
