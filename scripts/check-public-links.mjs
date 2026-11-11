#!/usr/bin/env node
// Checks the built site (dist/) before it can go anywhere:
// - it never links to, or names, a private repository or product (Rule 4: public repositories,
//   including openmoca.org, never link to a private one);
// - it loads nothing from another host: no remote scripts, stylesheets, fonts or images.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
// The private names are not kept in this public repository: they come from MOCA_PRIVATE_NAMES (a CI secret, so the
// public logs mask it) or a git-ignored .private-names file, one name per line. Without either, the check stops the build rather than pass
// unchecked.
const listFile = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.private-names');
const names = (process.env.MOCA_PRIVATE_NAMES ?? (existsSync(listFile) ? readFileSync(listFile, 'utf8') : ''))
  .split(/[\n,]/).map((n) => n.trim()).filter((n) => n && !n.startsWith('#'));
if (names.length === 0) {
  console.error('check-public-links: no private names to check against: set MOCA_PRIVATE_NAMES or create .private-names');
  process.exit(1);
}
const escape = (n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PRIVATE = new RegExp(`\\b(${names.map(escape).join('|')})\\b`, 'i');
// The one allowed mention: the maintainer's public website, in the footer and on the contact page.
const ALLOWED = /https?:\/\/(?:www\.)?piandmash\.com\/?(?=["'\s<)]|$)/gi;
// Attributes that make the browser fetch something.
const FETCHED = /<(?:script|img|iframe|source|video|audio)\b[^>]*\bsrc="(https?:)?\/\/|<link\b(?=[^>]*\brel="(?:stylesheet|preload|modulepreload|icon|preconnect)")[^>]*\bhref="(https?:)?\/\//gi;

function walk(dir) {
  return readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
}

const problems = [];
let pages = 0;
for (const file of walk(dist).filter((f) => /\.(html|css|js|json|xml|txt|md)$/.test(f))) {
  const text = readFileSync(file, 'utf8');
  if (file.endsWith('.html')) pages++;
  const name = relative(dist, file);
  const m = text.replace(ALLOWED, '').match(PRIVATE);
  if (m) problems.push(`${name}: names "${m[0]}", which is private`);
  if (file.endsWith('.html')) for (const f of text.matchAll(FETCHED)) problems.push(`${name}: loads from another host: ${f[0].slice(0, 120)}`);
}

if (problems.length) {
  for (const p of problems) console.error(`FAIL ${p}`);
  process.exit(1);
}
console.log(`Checked ${pages} pages: no private names or links, nothing loaded from another host.`);
