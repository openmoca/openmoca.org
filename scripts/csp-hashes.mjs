#!/usr/bin/env node
// Hashes every inline <script> in dist/ for the content security policy that worker/index.js sends, so no page needs
// 'unsafe-inline'. Run last in a build, after anything that changes the HTML. Writes worker/generated/csp.json
// (generated, never committed):
//
//   scripts  the hashes of the scripts that run (the theme script, Starlight's and the site's own), allowed on every
//            page: one list, the same everywhere
//   pages    for each page, the hashes of its data blocks (the JSON-LD), which differ on every page
//
// A browser never runs a data block, so the policy would not block it; its hash is listed all the same, so the policy
// names everything inline on the page.
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(site, 'dist');
const out = join(site, 'worker', 'generated', 'csp.json');

const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
const sha256 = (text) => `sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}`;
// The types a browser runs (the HTML standard's JavaScript MIME types, and modules); anything else is data.
const RUNS = /^(|module|(text|application)\/(x-)?(java|ecma)script)$/i;

// The page's route, as the Worker sees the request: dist/a/b/index.html is /a/b/; any other file is its own path.
export const routeOf = (file) => `/${relative(dist, file).split('\\').join('/')}`.replace(/(^|\/)index\.html$/, '$1');

// The inline scripts in a page: [{ hash, runs }].
export function inlineScripts(html) {
  const found = [];
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/i.test(attrs)) continue;
    const type = attrs.match(/\btype\s*=\s*["']?([^"'\s>]*)/i)?.[1] ?? '';
    found.push({ hash: sha256(body), runs: RUNS.test(type.trim()) });
  }
  return found;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const scripts = new Set();
  const pages = {};
  let count = 0;
  for (const file of walk(dist).filter((f) => f.endsWith('.html'))) {
    const found = inlineScripts(readFileSync(file, 'utf8'));
    for (const s of found.filter((s) => s.runs)) scripts.add(s.hash);
    const data = [...new Set(found.filter((s) => !s.runs).map((s) => s.hash))];
    if (data.length) pages[routeOf(file)] = data;
    count++;
  }
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify({ scripts: [...scripts].sort(), pages }, null, 1)}\n`);
  console.log(`Hashed the inline scripts on ${count} pages: ${scripts.size} that run, and data blocks on ${Object.keys(pages).length} pages.`);
}
