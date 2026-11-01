// Form handler tests: node --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import { handleContactPost, verifyAltcha } from "../functions/_shared/contact-handler.js";
import { onRequestGet as challenge } from "../functions/api/altcha/challenge.js";

const KEY = "test-hmac-key";
const ORIGIN = "https://binarysys.net";

async function solve(env) {
  const c = await (await challenge({ env })).json();
  for (let n = 0; n <= c.maxnumber; n++) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(c.salt + n));
    const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
    if (hex === c.challenge) return btoa(JSON.stringify({ algorithm: c.algorithm, challenge: c.challenge, number: n, salt: c.salt, signature: c.signature }));
  }
  throw new Error("unsolved");
}

let ipCounter = 0;
function req(fields, { origin = ORIGIN, json = true } = {}) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return new Request(`${ORIGIN}/api/contact`, {
    method: "POST",
    body: fd,
    headers: { Host: "binarysys.net", Origin: origin, Accept: json ? "application/json" : "text/html", "CF-Connecting-IP": `10.0.0.${++ipCounter}` },
  });
}
const valid = { form: "contact", first_name: "Sara", last_name: "Ali", email: "sara@hospital.sa", message: "Need a quote", lang: "en" };

function mockFetch(status = 200) {
  const calls = [];
  const orig = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    return new Response(JSON.stringify({ success: status < 400 }), { status });
  };
  return { calls, restore: () => (globalThis.fetch = orig) };
}

test("ALTCHA challenge round-trips and rejects tampering", async () => {
  const payload = await solve({ ALTCHA_HMAC_KEY: KEY });
  assert.equal(await verifyAltcha(payload, KEY), true);
  assert.equal(await verifyAltcha(payload, "other-key"), false);
  const bad = JSON.parse(atob(payload));
  bad.number += 1;
  assert.equal(await verifyAltcha(btoa(JSON.stringify(bad)), KEY), false);
  assert.equal(await verifyAltcha("", KEY), false);
});

test("rejects cross-origin posts", async () => {
  const r = await handleContactPost(req(valid, { origin: "https://evil.example" }), {});
  assert.equal(r.status, 403);
});

test("requires a valid ALTCHA token when the key is set (localised error)", async () => {
  const r = await handleContactPost(req({ ...valid, lang: "ar" }), { ALTCHA_HMAC_KEY: KEY, CONTACT_WEBHOOK_URL: "https://hook.test" });
  assert.equal(r.status, 403);
  assert.match((await r.json()).message, /التحقق/);
});

test("honeypot submissions look successful but are not delivered", async () => {
  const m = mockFetch();
  try {
    const r = await handleContactPost(req({ ...valid, _honey: "bot" }), { CONTACT_WEBHOOK_URL: "https://hook.test" });
    assert.equal(r.status, 200);
    assert.equal(m.calls.length, 0);
  } finally { m.restore(); }
});

test("validates required fields", async () => {
  const r = await handleContactPost(req({ ...valid, email: "not-an-email" }), { CONTACT_WEBHOOK_URL: "https://hook.test" });
  assert.equal(r.status, 400);
  const q = await handleContactPost(req({ ...valid, form: "quote" }), { CONTACT_WEBHOOK_URL: "https://hook.test" });
  assert.equal(q.status, 400, "quote form requires an organisation");
});

test("never drops a lead silently when no destination is configured", async () => {
  const r = await handleContactPost(req(valid), {});
  assert.equal(r.status, 500);
  assert.match((await r.json()).message, /474 9490/);
});

test("delivers a verified quote request to the webhook with its item list", async () => {
  const env = { ALTCHA_HMAC_KEY: KEY, CONTACT_WEBHOOK_URL: "https://hook.test" };
  const altcha = await solve(env);
  const m = mockFetch();
  try {
    const r = await handleContactPost(req({ ...valid, form: "quote", organization: "KFMC Lab", items: "Bosch — Vivalytic\n3DHISTECH — Pannoramic", altcha }), env);
    assert.equal(r.status, 200);
    assert.equal(m.calls.length, 1);
    const lead = m.calls[0].body;
    assert.equal(lead.form, "quote");
    assert.equal(lead.items, "Bosch — Vivalytic\n3DHISTECH — Pannoramic");
    assert.match(lead.subject, /quotation request from KFMC Lab/);
  } finally { m.restore(); }
});

test("Web3Forms delivery sends labelled fields", async () => {
  const m = mockFetch();
  try {
    const r = await handleContactPost(req({ ...valid, topic: "partnership" }), { WEB3FORMS_ACCESS_KEY: "k" });
    assert.equal(r.status, 200);
    assert.equal(m.calls[0].url, "https://api.web3forms.com/submit");
    assert.equal(m.calls[0].body.Topic, "partnership");
    assert.equal(m.calls[0].body.replyto, "sara@hospital.sa");
  } finally { m.restore(); }
});

test("a failing destination returns an error, not success", async () => {
  const m = mockFetch(500);
  try {
    const r = await handleContactPost(req(valid), { CONTACT_WEBHOOK_URL: "https://hook.test" });
    assert.equal(r.status, 502);
  } finally { m.restore(); }
});

test("no-JS submissions redirect to the localised thank-you page", async () => {
  const m = mockFetch();
  try {
    const r = await handleContactPost(req({ ...valid, lang: "ar" }, { json: false }), { CONTACT_WEBHOOK_URL: "https://hook.test" });
    assert.equal(r.status, 303);
    assert.equal(new URL(r.headers.get("Location")).pathname, "/ar/thank-you");
  } finally { m.restore(); }
});

test("a solved ALTCHA token is single-use (replay refused)", async () => {
  const env = { ALTCHA_HMAC_KEY: KEY, CONTACT_WEBHOOK_URL: "https://hook.test" };
  const altcha = await solve(env);
  const m = mockFetch();
  try {
    const first = await handleContactPost(req({ ...valid, altcha }), env);
    assert.equal(first.status, 200);
    const replay = await handleContactPost(req({ ...valid, altcha }), env);
    assert.equal(replay.status, 403);
    assert.equal(m.calls.length, 1, "the replay is not delivered");
  } finally { m.restore(); }
});

test("oversized submissions are refused before parsing", async () => {
  const r = new Request(`${ORIGIN}/api/contact`, { method: "POST", body: "x".repeat(70000), headers: { Host: "binarysys.net", Origin: ORIGIN, Accept: "application/json", "Content-Length": "70000", "CF-Connecting-IP": "10.9.9.9" } });
  assert.equal((await handleContactPost(r, {})).status, 413);
});
