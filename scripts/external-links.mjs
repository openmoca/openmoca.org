#!/usr/bin/env node
// Every link to another site opens in a new tab, and says so (WCAG: warn before opening a new window). Run after
// `astro build`, over every built page, so it covers Markdown, MDX, Starlight's cards and buttons, the top bar and
// the footer alike. A link within openmoca.org stays in the same tab; try.openmoca.org and every other host count as
// another site.
//
// Each external link gets target="_blank", rel="noopener noreferrer", a small icon (hidden from screen readers) and
// visually hidden text, "(opens in a new tab)". A link that is only an icon (such as GitHub in the docs' header)
// gets the text, not a second icon. The talk slides (dist/talks/) are left as they are.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(site, 'dist');
const OWN = new Set(['openmoca.org', 'www.openmoca.org']);

const ICON = '<svg class="ext-icon" aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="12" height="12">'
  + '<path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" '
  + 'd="M9 3h4v4M13 3 7.5 8.5M11.5 9.5V13H3V4.5h3.5"/></svg>';
const SR = '<span class="ext-sr"> (opens in a new tab)</span>';

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const external = (href) => {
  try {
    const url = new URL(href);
    return (url.protocol === 'https:' || url.protocol === 'http:') && !OWN.has(url.hostname);
  } catch {
    return false;
  }
};

let links = 0;
let pages = 0;
for (const file of walk(dist).filter((f) => f.endsWith('.html'))) {
  if (relative(dist, file).startsWith('talks/')) continue;
  const html = readFileSync(file, 'utf8');
  const done = html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/g, (whole, attrs, inner) => {
    const href = attrs.match(/\bhref="([^"]*)"/)?.[1];
    if (!href || !external(href) || /\btarget=/.test(attrs)) return whole;
    links++;
    const rel = /\brel="[^"]*"/.test(attrs)
      ? attrs.replace(/\brel="[^"]*"/, 'rel="noopener noreferrer"')
      : `${attrs} rel="noopener noreferrer"`;
    const iconOnly = /^\s*<svg\b[\s\S]*<\/svg>\s*(<span[^>]*>[^<]*<\/span>\s*)?$/.test(inner);
    return `<a${rel} target="_blank">${inner}${iconOnly ? '' : ICON}${SR}</a>`;
  });
  if (done !== html) {
    writeFileSync(file, done);
    pages++;
  }
}
console.log(`External links: ${links} on ${pages} pages open in a new tab, and say so.`);
