#!/usr/bin/env node
// Checks a running openmoca.org: every kind of response carries the security headers (worker/index.js), and every
// inline script on each kind of page is allowed by its content security policy, by hash. With Playwright installed
// (`npm i --no-save playwright && npx playwright install chromium`), it also opens each page in a browser and reports
// any policy violation or script error.
//
//   npm run build && npm run preview          (the Worker and dist/, at http://localhost:8787)
//   npm run check:site                        (or: node scripts/check-site.mjs https://openmoca.org)
//
// It only reads.
import { createHash } from 'node:crypto';

const base = (process.argv[2] ?? 'http://localhost:8787').replace(/\/+$/, '');

// One of each kind of page, and the other kinds of response the Worker gives.
const PAGES = {
  home: '/',
  'main site': '/creators/',
  docs: '/docs/',
  specification: '/spec/reader-contract/',
  example: '/examples/support-kb/',
  talk: '/talks/introduction-to-openmoca/',
  'Directory: the Commitment': '/directory/commitment/',
  'Directory: Conformant': '/directory/conformant/',
  'not found': '/no-such-page/',
};
const OTHERS = {
  'Directory data': ['/directory/commitment.json'],
  schema: ['/schemas/v1/manifest.schema.json'],
  'Markdown for agents': ['/docs/', { Accept: 'text/markdown' }],
  'a moved page': ['/project/contact/'],
  'a stylesheet or script': null, // found on the home page
};

const HEADERS = {
  'strict-transport-security': (v) => /max-age=\d{7,}/.test(v),
  'x-content-type-options': (v) => v === 'nosniff',
  'referrer-policy': (v) => v === 'strict-origin-when-cross-origin',
  'permissions-policy': (v) => v.includes('camera=()') && v.includes('microphone=()') && v.includes('geolocation=()'),
};
const DIRECTIVES = ["default-src 'self'", "frame-ancestors 'self'", "object-src 'none'", "base-uri 'self'"];

const failures = [];
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failures.push(what);
};
const sha256 = (text) => `sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}`;
const get = (path, headers = {}) => fetch(base + path, { headers, redirect: 'manual' });

function checkHeaders(kind, res) {
  const missing = Object.entries(HEADERS).filter(([name, ok]) => !ok(res.headers.get(name) ?? '')).map(([name]) => name);
  check(missing.length === 0, `${kind} (${res.status}): the security headers${missing.length ? `; missing or wrong: ${missing.join(', ')}` : ''}`);
}

const pageUrls = [];
let assetPath = null;
for (const [kind, path] of Object.entries(PAGES)) {
  const res = await get(path);
  const html = await res.text();
  check(kind === 'not found' ? res.status === 404 : res.ok, `${kind} ${path} answers ${res.status}`);
  checkHeaders(kind, res);
  const policy = res.headers.get('content-security-policy') ?? '';
  const scriptSrc = policy.split(';').map((d) => d.trim()).find((d) => d.startsWith('script-src')) ?? '';
  check(DIRECTIVES.every((d) => policy.includes(d)) && scriptSrc && !scriptSrc.includes("'unsafe-inline'") && !scriptSrc.includes("'unsafe-eval'"),
    `${kind}: a content security policy, with no inline script allowed except by hash`);
  const inline = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(([, attrs]) => !/\bsrc\s*=/i.test(attrs));
  const unlisted = inline.filter(([, , body]) => !scriptSrc.includes(`'${sha256(body)}'`));
  check(unlisted.length === 0, `${kind}: all ${inline.length} inline scripts are allowed by hash${unlisted.length ? `; ${unlisted.length} are not` : ''}`);
  assetPath ??= html.match(/(?:src|href)="(\/_astro\/[^"]+)"/)?.[1] ?? null;
  pageUrls.push([kind, path]);
}

for (const [kind, spec] of Object.entries(OTHERS)) {
  const [path, headers] = spec ?? [assetPath];
  if (!path) {
    check(false, `${kind}: none found`);
    continue;
  }
  const res = await get(path, headers);
  check(res.status < 400, `${kind} ${path} answers ${res.status}`);
  checkHeaders(kind, res);
}

// In a browser, when Playwright is installed: each page loads with no policy violation and no script error, and the
// talk's speaker view can frame its own slides.
let playwright = null;
try {
  playwright = await import('playwright');
} catch {
  console.log('skip the browser check: Playwright is not installed (npm i --no-save playwright)');
}
if (playwright) {
  const engine = playwright[process.env.CHECK_BROWSER ?? 'chromium'];
  const browser = await engine.launch({ headless: true, ...(process.env.CHECK_CHANNEL ? { channel: process.env.CHECK_CHANNEL } : {}) });
  const tab = await browser.newPage();
  let problems = [];
  tab.on('console', (m) => {
    if (m.type() === 'error' || /Content.Security.Policy|Refused to/i.test(m.text())) problems.push(m.text().slice(0, 200));
  });
  tab.on('pageerror', (e) => problems.push(e.message));
  const open = async (kind, path, act) => {
    problems = [];
    await tab.goto(base + path, { waitUntil: 'networkidle' });
    if (act) await act();
    // A 404 page logs the failed request; nothing else may.
    const real = problems.filter((p) => !(kind === 'not found' && /404/.test(p)));
    check(real.length === 0, `${kind} in ${engine.name()}: no policy violation or script error${real.length ? `:\n       ${real.join('\n       ')}` : ''}`);
  };
  for (const [kind, path] of pageUrls) await open(kind, path);
  // The parts that run more script: search (WebAssembly), the theme switch, a diagram, the speaker view.
  await open('search', '/docs/', async () => {
    await tab.locator('button[data-open-modal]').first().click();
    await tab.keyboard.type('signature');
    await tab.locator('.pagefind-ui__result').first().waitFor({ timeout: 10_000 });
  });
  await open('theme', '/', async () => {
    const select = tab.locator('starlight-theme-select select').first();
    if (await select.count()) await select.selectOption('dark');
  });
  await open('diagram', '/docs/architecture/', async () => {
    await tab.locator('.mermaid svg').first().waitFor({ timeout: 15_000 });
  });
  // The speaker view shows this slide and the next in frames of the talk itself.
  await open('speaker view', '/talks/introduction-to-openmoca/?speaker', async () => {
    await tab.frameLocator('iframe.next').locator('body').waitFor({ timeout: 10_000 });
  });
  await browser.close();
}

console.log(failures.length ? `\n${failures.length} check(s) failed.` : '\nAll checks passed.');
process.exit(failures.length ? 1 : 0);
