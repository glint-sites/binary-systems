// Cloudflare Workers entry (see wrangler.jsonc), used when the repo is deployed as a Worker with
// static assets rather than a Pages project. Pages, _headers, _redirects and 404s are served by the
// assets layer; only /api/* reaches this code, which reuses the Pages Functions handlers unchanged.
import { onRequestPost as contact } from "./functions/api/contact.js";
import { onRequestGet as challenge } from "./functions/api/altcha/challenge.js";

const routes = { "POST /api/contact": contact, "GET /api/altcha/challenge": challenge };

export default {
  async fetch(request, env, ctx) {
    const handler = routes[`${request.method} ${new URL(request.url).pathname}`];
    if (handler) return handler({ request, env, waitUntil: (p) => ctx.waitUntil(p) });
    return env.ASSETS.fetch(request);
  },
};
