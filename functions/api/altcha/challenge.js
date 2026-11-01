// GET /api/altcha/challenge
// Issues a signed ALTCHA proof-of-work challenge. The widget brute-forces `number`
// until sha256(salt + number) === challenge, then posts the solution; the server
// re-verifies in functions/_shared/contact-handler.js using the same ALTCHA_HMAC_KEY.

async function sha256Hex(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacHex(key, msg) {
  const k = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randHex(bytes) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function onRequestGet(context) {
  const { env } = context;
  const hmacKey = env.ALTCHA_HMAC_KEY || "dev-insecure-key-set-ALTCHA_HMAC_KEY";
  const maxnumber = 50000;
  const expires = Date.now() + 5 * 60 * 1000; // 5-minute TTL
  const salt = randHex(12) + "?expires=" + expires;
  const number = Math.floor(Math.random() * maxnumber);
  const challenge = await sha256Hex(salt + number);
  const signature = await hmacHex(hmacKey, challenge);

  return new Response(
    JSON.stringify({ algorithm: "SHA-256", challenge, maxnumber, salt, signature }),
    { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
  );
}
