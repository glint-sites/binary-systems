// Contact + quotation form handler for Binary System Medical (binarysys.net).
// Verifies an ALTCHA proof-of-work token, applies a honeypot, a per-IP rate limit and a
// same-origin check, then forwards a sanitised lead to the configured destination.
//
// Env vars (Cloudflare Pages → Settings → Environment variables):
//   ALTCHA_HMAC_KEY      (secret)  64-char hex; must match functions/api/altcha/challenge.js
//   --- ONE lead destination is required ---
//   CONTACT_WEBHOOK_URL  (secret)  https:// endpoint the lead is POSTed to as JSON (Zapier / Make / n8n / custom)
//   WEB3FORMS_ACCESS_KEY (secret)  emails the lead via web3forms.com (no DNS setup)
// Without a destination the form shows a "please call or email us" error: a lead is never silently dropped.

const PHONE = "+966 11 474 9490";
const EMAIL = "info@binarysys.net";

const MAX_BODY = 64 * 1024; // the largest legitimate submission is a few KB

// Per-IP rate limit and spent ALTCHA tokens, kept in isolate memory (best-effort, no storage needed).
// Both maps are pruned so a long-lived isolate does not grow without bound.
const RATE = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const SPENT = new Map(); // ALTCHA signature -> expiry (ms)

function prune(now) {
  if (RATE.size > 500) for (const [ip, arr] of RATE) if (!arr.some((t) => now - t < WINDOW_MS)) RATE.delete(ip);
  if (SPENT.size > 500) for (const [sig, exp] of SPENT) if (exp < now) SPENT.delete(sig);
}

function rateLimited(ip) {
  const now = Date.now();
  prune(now);
  const arr = (RATE.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  RATE.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

const escHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Constant-time comparison for hex digests.
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function sameOrigin(request) {
  const host = request.headers.get("Host");
  const origin = request.headers.get("Origin");
  const referer = request.headers.get("Referer");
  try {
    if (origin) return new URL(origin).host === host;
    if (referer) return new URL(referer).host === host;
  } catch (_) {}
  return false;
}

// Single-line fields lose newlines; the message and item list keep them.
function clean(v, { multiline = false, max = 500 } = {}) {
  let s = String(v == null ? "" : v).replace(/[<>]/g, "").trim();
  s = multiline ? s.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n") : s.replace(/[\r\n]+/g, " ");
  return s.slice(0, max);
}

async function sha256Hex(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacHex(key, msg) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Validate the base64 ALTCHA payload produced by the widget after it solves the PoW.
export async function verifyAltcha(payloadB64, hmacKey) {
  if (!payloadB64) return false;
  let data;
  try {
    data = JSON.parse(atob(payloadB64));
  } catch (_) {
    return false;
  }
  const { algorithm, challenge, number, salt, signature } = data;
  if (algorithm !== "SHA-256" || !challenge || !salt || signature == null || number == null) return false;
  const expires = Number(new URLSearchParams(String(salt).split("?")[1] || "").get("expires"));
  if (!expires || Date.now() > expires) return false;
  if (!safeEqual(await sha256Hex(salt + number), String(challenge))) return false;
  if (!safeEqual(await hmacHex(hmacKey, String(challenge)), String(signature))) return false;
  // Each solved challenge is single-use: a replayed token is refused until it expires.
  if (SPENT.has(signature)) return false;
  SPENT.set(signature, expires);
  return true;
}

const LABELS = {
  first_name: "First name",
  last_name: "Last name",
  email: "Email",
  phone: "Phone",
  organization: "Organisation",
  job_title: "Job title",
  facility: "Facility type",
  city: "City",
  topic: "Topic",
  items: "Quote list",
  message: "Message",
  lang: "Language",
  page: "Page",
};

export async function handleContactPost(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const wantsJson = (request.headers.get("Accept") || "").includes("application/json");
  let lang = "en";

  const respond = (ok, message, status) => {
    if (wantsJson) {
      return new Response(JSON.stringify(ok ? { ok: true } : { ok: false, error: message, message }), {
        status,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }
    // No-JS fallback: a real page either way.
    if (ok) return Response.redirect(new URL(lang === "ar" ? "/ar/thank-you" : "/thank-you", request.url).toString(), 303);
    return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Message not sent</title><body style="font-family:system-ui;max-width:560px;margin:80px auto;padding:0 20px;line-height:1.6"><h1>We couldn't send your message</h1><p>${escHtml(message)}</p><p><a href="javascript:history.back()">Go back</a></p>`, {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  };
  const contactLine = (ar) => (ar ? `يرجى الاتصال بنا على ⁦${PHONE}⁩ أو مراسلتنا على ⁦${EMAIL}⁩.` : `Please call us on ${PHONE} or email ${EMAIL}.`);

  if (rateLimited(ip)) return respond(false, `We received several messages from you in a short time. Please wait a minute and try again. ${contactLine(false)}`, 429);
  if (!sameOrigin(request)) return respond(false, "Invalid request origin.", 403);
  if (Number(request.headers.get("Content-Length") || 0) > MAX_BODY) return respond(false, "The submission is too large.", 413);

  let form;
  try {
    const ct = request.headers.get("Content-Type") || "";
    form = ct.includes("application/json") ? new Map(Object.entries(await request.json())) : await request.formData();
  } catch (_) {
    return respond(false, "Could not read the form submission.", 400);
  }
  const get = (k) => form.get(k) || "";
  lang = get("lang") === "ar" ? "ar" : "en";
  const ar = lang === "ar";

  if (clean(get("_honey"))) return respond(true, "", 200);

  if (env.ALTCHA_HMAC_KEY) {
    const valid = await verifyAltcha(get("altcha"), env.ALTCHA_HMAC_KEY);
    if (!valid) return respond(false, ar ? `فشل التحقق الأمني. يرجى تحديث الصفحة والمحاولة مرة أخرى، أو ${contactLine(true)}` : `Security check failed. Please refresh the page and try again. ${contactLine(false)}`, 403);
  }

  const kind = get("form") === "quote" ? "quote" : "contact";
  const lead = {
    form: kind,
    first_name: clean(get("first_name"), { max: 100 }),
    last_name: clean(get("last_name"), { max: 100 }),
    email: clean(get("email"), { max: 200 }),
    phone: clean(get("phone"), { max: 50 }),
    organization: clean(get("organization"), { max: 200 }),
    job_title: clean(get("job_title"), { max: 200 }),
    facility: clean(get("facility"), { max: 50 }),
    city: clean(get("city"), { max: 100 }),
    topic: clean(get("topic"), { max: 50 }),
    items: clean(get("items"), { multiline: true, max: 3000 }),
    message: clean(get("message"), { multiline: true, max: 5000 }),
    lang,
    page: clean(get("_page"), { max: 300 }),
    submitted_at: new Date().toISOString(),
  };
  lead.name = `${lead.first_name} ${lead.last_name}`.trim();
  lead.subject = kind === "quote"
    ? `BSM website: quotation request from ${lead.organization || lead.name}`
    : `BSM website: ${lead.topic || "enquiry"} from ${lead.name}`;

  if (!lead.first_name || !lead.last_name || !lead.message || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) {
    return respond(false, ar ? "يرجى إدخال اسمك وبريدك الإلكتروني ورسالتك." : "Please provide your name, a valid email address and a message.", 400);
  }
  if (kind === "quote" && !lead.organization) {
    return respond(false, ar ? "يرجى إدخال اسم الجهة." : "Please provide your organisation.", 400);
  }

  const failMsg = ar ? `تعذّر إرسال طلبك الآن. ${contactLine(true)}` : `We couldn't submit your request right now. ${contactLine(false)}`;

  if (env.CONTACT_WEBHOOK_URL) {
    try {
      const r = await fetch(env.CONTACT_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) });
      if (!r.ok) throw new Error("webhook responded " + r.status);
    } catch (_) {
      return respond(false, failMsg, 502);
    }
    return respond(true, "", 200);
  }

  if (env.WEB3FORMS_ACCESS_KEY) {
    // Web3Forms emails every field; send them in a readable order with plain labels.
    const fields = {};
    for (const k of Object.keys(LABELS)) if (lead[k]) fields[LABELS[k]] = lead[k];
    try {
      const r = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: env.WEB3FORMS_ACCESS_KEY, subject: lead.subject, from_name: lead.name, replyto: lead.email, ...fields }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.success === false) throw new Error("web3forms " + r.status);
    } catch (_) {
      return respond(false, failMsg, 502);
    }
    return respond(true, "", 200);
  }

  return respond(false, failMsg, 500);
}
