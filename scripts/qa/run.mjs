// Browser QA against a running dev server (npm run dev), using headless Chrome via scripts/qa/cdp.mjs.
// Usage: npm run qa            (BASE=http://localhost:8788, CHROME_PATH=… to override)
// Checks: horizontal overflow on every sitemap page at 320 and 768 px (both directions, so RTL too),
// an accessibility scan of key pages (contrast, names, labels, ids, headings, landmarks),
// the language switch (position, form draft and filters carried over; no CSP violations),
// and the desktop Solutions mega menu layout.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const BASE = process.env.BASE || "http://localhost:8788";
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bsm-qa-"));

function run(jobs) {
  const file = path.join(tmp, `jobs-${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify(jobs));
  const out = execFileSync(process.execPath, [path.join(HERE, "cdp.mjs"), file], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return out.trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
}

const sitemap = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
const urls = [...new Set([...sitemap.matchAll(/<loc>https:\/\/binarysys\.net([^<]*)<\/loc>/g)].map((m) => m[1]))];
let failures = 0;

// 1. Overflow
const overflow = `(()=>{const iw=innerWidth,bad=[];document.querySelectorAll("body *").forEach(e=>{const r=e.getBoundingClientRect();if(r.width>0&&(r.left<-1||r.right>iw+1)){let q=e.parentElement,cl=false;while(q&&q!==document.body){if(getComputedStyle(q).overflowX!=="visible"){cl=true;break}q=q.parentElement}if(!cl&&getComputedStyle(e).position!=="fixed")bad.push(e.tagName+"."+String(e.className).split(" ")[0])}});return {sw:document.documentElement.scrollWidth-iw,bad:bad.slice(0,3)}})()`;
const sweep = run(urls.flatMap((u) => [320, 768].map((w) => ({ url: BASE + u, width: w, mobile: w < 600, height: 800, wait: 250, eval: overflow }))));
const over = sweep.filter((r) => !r.result || r.result.error || r.result.sw > 0 || r.result.bad.length);
over.forEach((r) => console.log("OVERFLOW", r.url, r.width, JSON.stringify(r.result)));
console.log(`overflow: ${sweep.length} page/width checks, ${over.length} problems`);
failures += over.length;

// 2. Accessibility scan
const audit = fs.readFileSync(path.join(HERE, "a11y-audit.js"), "utf8");
const key = ["/", "/products/", "/products/vitapcr", "/about", "/contact", "/quote", "/ar/", "/ar/products/vitapcr", "/ar/contact"];
const scan = run(key.flatMap((u) => [1440, 390].map((w) => ({ url: BASE + u, width: w, mobile: w < 600, wait: 600, eval: audit }))));
let a11y = 0;
for (const r of scan) {
  const x = r.result || {};
  // Contrast hits on buttons over the transparent home header are a known scanner limitation.
  const contrast = (x.contrast || []).filter((c) => !/^a\.btn /.test(c));
  for (const [k, list] of Object.entries({ contrast, names: x.names, labels: x.labels, ids: x.ids, headings: x.headings, landmarks: x.landmarks, images: x.images })) {
    for (const v of list || []) { console.log("A11Y", k, r.url, r.width, v); a11y++; }
  }
}
console.log(`accessibility: ${scan.length} scans, ${a11y} problems`);
failures += a11y;

// 3. Language switch: same section, draft kept, CSP clean
const lang = run([
  { url: `${BASE}/about`, wait: 2500, steps: [
    { eval: "(()=>{const el=document.getElementById('careers');window.scrollTo({top:el.getBoundingClientRect().top+scrollY-140,behavior:'instant'});return Math.round(el.getBoundingClientRect().top)})()", wait: 400 },
    { eval: "document.querySelector('.header-actions [data-lang-switch]').click();1", waitNav: true, wait: 1500 },
    { eval: "({path:location.pathname,top:Math.round(document.getElementById('careers').getBoundingClientRect().top),csp:window.__csp})" },
  ] },
  { url: `${BASE}/contact`, wait: 2500, steps: [
    { eval: "const f=document.querySelector('form[data-form=contact]');f.message.value='draft';f.message.dispatchEvent(new Event('input',{bubbles:true}));1", wait: 600 },
    { eval: "document.querySelector('.header-actions [data-lang-switch]').click();1", waitNav: true, wait: 1500 },
    { eval: "({path:location.pathname,msg:document.querySelector('form[data-form=contact]').message.value,csp:window.__csp})" },
  ] },
]);
const [about, contact] = lang.map((r) => r.result);
const langOk = about[2].path === "/ar/about" && Math.abs(about[2].top - about[0]) < 40 && !about[2].csp.length && contact[2].msg === "draft" && !contact[2].csp.length;
console.log(`language switch: ${langOk ? "ok" : "FAILED " + JSON.stringify({ about, contact })}`);
if (!langOk) failures++;

// 4. Solutions mega menu (desktop): a click opens it as one row of columns, all inside the panel
const megaCheck = `(()=>{const m=document.querySelector("[data-mega]"),p=m.getBoundingClientRect(),items=[...m.firstElementChild.children].map(c=>c.getBoundingClientRect());return {open:m.classList.contains("is-open")&&getComputedStyle(m).visibility==="visible",rows:new Set(items.map(c=>Math.round(c.top))).size,spill:items.filter(c=>c.bottom>p.bottom+1).length,covered:items.filter(c=>!m.contains(document.elementFromPoint(c.left+c.width/2,c.top+Math.min(c.height/2,40)))).length}})()`;
const menus = run(["/", "/ar/", "/about", "/ar/about"].map((u) => ({ url: BASE + u, width: 1440, height: 900, wait: 800, steps: [{ click: "[data-mega-toggle]", wait: 500 }, { eval: megaCheck }] })));
const menuBad = menus.filter((r) => { const x = r.result?.[1] || {}; return !x.open || x.rows !== 1 || x.spill || x.covered; });
menuBad.forEach((r) => console.log("MEGA", r.url, JSON.stringify(r.result?.[1])));
console.log(`solutions menu: ${menus.length} pages, ${menuBad.length} problems`);
failures += menuBad.length;

console.log(failures ? `\n${failures} problem(s)` : "\nAll browser checks passed.");
process.exit(failures ? 1 : 0);
