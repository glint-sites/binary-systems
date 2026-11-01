// Uploads the committed site to a Cloudflare Pages *preview* deployment (never production).
// Usage: npm run deploy:preview   (CLOUDFLARE_ACCOUNT_ID=… when your login has several accounts;
// PAGES_PROJECT / PREVIEW_BRANCH override the defaults below).
// It deploys a fresh clone of HEAD, so local-only files (.dev.vars, .wrangler, QA screenshots) never
// upload, and it refuses to run with uncommitted changes so every preview matches a commit.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT = process.env.PAGES_PROJECT || "binary-system";
const BRANCH = process.env.PREVIEW_BRANCH || "preview";
const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();

if (git("status", "--porcelain")) {
  console.error("Uncommitted changes: commit first, the preview is built from HEAD.");
  process.exit(1);
}
const dir = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "bsm-preview-")), "site");
git("clone", "--quiet", ROOT, dir);
try {
  // Wrangler skips .git when uploading and reads the commit hash and message from it.
  execFileSync("npx", ["--yes", "wrangler@4", "pages", "deploy", ".", "--project-name", PROJECT, "--branch", BRANCH],
    { cwd: dir, stdio: "inherit", shell: process.platform === "win32" });
} finally {
  fs.rmSync(path.dirname(dir), { recursive: true, force: true });
}
