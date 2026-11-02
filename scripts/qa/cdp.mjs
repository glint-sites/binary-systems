// Minimal headless-Chrome driver over the DevTools Protocol (Node 22+, no dependencies).
// Usage: node cdp.mjs <jobs.json>
// jobs: [{ url, width=1440, height=900, mobile=false, full=true, out?, wait=1200, eval?, scrollTo?, maxHeight=9000 }]
// Prints one JSON line per job: { url, width, out, result }.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = Number(process.env.CDP_PORT) || 9333; // CDP_PORT lets two runs share a machine
const jobs = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const prof = fs.mkdtempSync(path.join(os.tmpdir(), "bsm-cdp-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`, "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "--force-color-profile=srgb", "about:blank"], { stdio: "ignore" });
let UA = "";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function version() {
  for (let i = 0; i < 50; i++) {
    try { return await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); } catch { await sleep(200); }
  }
  throw new Error("chrome did not start");
}

class Session {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.listeners = []; ws.onmessage = (m) => this.on(JSON.parse(m.data)); }
  on(msg) {
    if (msg.id && this.pending.has(msg.id)) { const { res, rej } = this.pending.get(msg.id); this.pending.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result); }
    else for (const l of this.listeners) l(msg);
  }
  send(method, params = {}) { const id = ++this.id; this.ws.send(JSON.stringify({ id, method, params })); return new Promise((res, rej) => this.pending.set(id, { res, rej })); }
  once(method, timeout = 15000) {
    return new Promise((res) => {
      const t = setTimeout(() => res(null), timeout);
      const l = (m) => { if (m.method === method) { clearTimeout(t); this.listeners = this.listeners.filter((x) => x !== l); res(m.params); } };
      this.listeners.push(l);
    });
  }
}

try {
  const ver = await version();
  UA = ver["User-Agent"].replace("HeadlessChrome", "Chrome");
  const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  const s = new Session(ws);
  await s.send("Page.enable");
  await s.send("Runtime.enable");
  await s.send("Page.addScriptToEvaluateOnNewDocument", { source: "window.__csp=[];document.addEventListener('securitypolicyviolation',e=>window.__csp.push(e.violatedDirective+' '+(e.blockedURI||'inline')+' '+(e.sample||'').slice(0,40)));" });
  for (const j of jobs) {
    const width = j.width || 1440, height = j.height || 900;
    await s.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: !!j.mobile });
    await s.send("Emulation.setTouchEmulationEnabled", (j.mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false }));
    await s.send("Emulation.setEmitTouchEventsForMouse", { enabled: !!j.mobile, configuration: "mobile" }).catch(() => {});
    if (j.acceptLanguage) await s.send("Emulation.setUserAgentOverride", { userAgent: UA, acceptLanguage: j.acceptLanguage });
    if (j.reducedMotion) await s.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    if (j.url) {
      const loaded = s.once("Page.loadEventFired");
      await s.send("Page.navigate", { url: j.url });
      await loaded;
    }
    await sleep(j.wait ?? 1200);
    // Multi-step flows: [{ eval, waitNav?, wait? }] — results collected in order.
    const steps = [];
    for (const st of j.steps || []) {
      if (st.keys) {
        // Press keys; after each, record what has focus and whether a focus ring is drawn.
        const log = [];
        const codes = { Tab: 9, Enter: 13, Escape: 27, " ": 32, ArrowDown: 40 };
        for (const key of st.keys) {
          const shift = key.startsWith("Shift+"), k = shift ? key.slice(6) : key;
          const base = { key: k, code: k === " " ? "Space" : k, windowsVirtualKeyCode: codes[k], modifiers: shift ? 8 : 0 };
          await s.send("Input.dispatchKeyEvent", { type: "rawKeyDown", ...base });
          if (k === "Enter" || k === " ") await s.send("Input.dispatchKeyEvent", { type: "char", text: k === "Enter" ? "\r" : " ", ...base });
          await s.send("Input.dispatchKeyEvent", { type: "keyUp", ...base });
          await sleep(st.gap ?? 120);
          const { result } = await s.send("Runtime.evaluate", { returnByValue: true, expression: `(()=>{const e=document.activeElement;if(!e||e===document.body)return '${key} → body';const cs=getComputedStyle(e);const r=e.getBoundingClientRect();const ring=(cs.outlineStyle!=='none'&&parseFloat(cs.outlineWidth)>0)||cs.boxShadow!=='none';return '${key} → '+e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:'')+' "'+(e.getAttribute('aria-label')||e.textContent||'').trim().replace(/\\s+/g,' ').slice(0,28)+'"'+(ring?'':' [NO RING]')+(r.width===0?' [INVISIBLE]':'')+(e.getAttribute('aria-expanded')?' expanded='+e.getAttribute('aria-expanded'):'')})()` });
          log.push(result.value);
        }
        steps.push(log);
        continue;
      }
      if (st.hover || st.click) {
        const sel = JSON.stringify(st.hover || st.click);
        const { result: rr } = await s.send("Runtime.evaluate", { expression: `(()=>{const r=document.querySelector(${sel}).getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()`, returnByValue: true });
        const [x, y] = rr.value;
        await s.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
        if (st.click) {
          const nav = st.waitNav ? s.once("Page.frameNavigated", 10000) : null;
          await s.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
          await s.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
          if (nav) await nav;
        }
        await sleep(st.wait ?? 600);
        steps.push(st.click ? "clicked" : "hovered");
        continue;
      }
      const nav = st.waitNav ? s.once("Page.frameNavigated", 10000) : null;
      const r = await s.send("Runtime.evaluate", { expression: st.eval, awaitPromise: true, returnByValue: true });
      if (nav) await nav;
      await sleep(st.wait ?? 600);
      steps.push(r.exceptionDetails ? { error: r.exceptionDetails.exception?.description || r.exceptionDetails.text } : r.result.value);
    }
    let result = steps.length ? steps : null;
    if (j.eval) {
      const r = await s.send("Runtime.evaluate", { expression: j.eval, awaitPromise: true, returnByValue: true });
      const v = r.exceptionDetails ? { error: r.exceptionDetails.exception?.description || r.exceptionDetails.text } : r.result.value;
      result = steps.length ? [...steps, v] : v;
    }
    if (j.out) {
      if (j.scrollTo != null) { await s.send("Runtime.evaluate", { expression: `window.scrollTo(0, ${j.scrollTo})` }); await sleep(700); }
      let clip;
      if (j.full !== false) {
        // Reveal everything so below-the-fold sections are captured in their final state.
        await s.send("Runtime.evaluate", { expression: "document.querySelectorAll('.is-pending').forEach(e=>e.classList.remove('is-pending'))" });
        const { result: h } = await s.send("Runtime.evaluate", { expression: "Math.min(document.documentElement.scrollHeight, " + (j.maxHeight || 9000) + ")", returnByValue: true });
        await s.send("Emulation.setDeviceMetricsOverride", { width, height: h.value, deviceScaleFactor: 1, mobile: !!j.mobile });
        await sleep(600);
        clip = { x: 0, y: 0, width, height: h.value, scale: j.scale || 1 };
      }
      const shot = await s.send("Page.captureScreenshot", { format: "jpeg", quality: 82 }); // viewport already resized to the full page (clip misplaces RTL pages)
      fs.writeFileSync(j.out, Buffer.from(shot.data, "base64"));
    }
    console.log(JSON.stringify({ url: j.url, width, out: j.out, result }));
  }
  ws.close();
} finally {
  chrome.kill();
}
