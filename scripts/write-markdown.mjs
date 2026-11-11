#!/usr/bin/env node
// Writes each page's Markdown beside its HTML, as dist/<route>/index.md, for AI agents: worker/index.js serves it to
// requests that ask for `Accept: text/markdown`, and every page links to it (<link rel="alternate">). Run after
// `astro build`; it reads the pages the sync wrote to src/content/docs.
//
// MDX components become plain Markdown: language tabs become labelled blocks, cards become list items.
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docs = join(site, 'src', 'content', 'docs');
const dist = join(site, 'dist');
const SITE = 'https://openmoca.org';

function walk(dir) {
  return readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
}

const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? '';

function plain(body) {
  return body
    .replace(/^import .*$/gm, '')
    .replace(/<Tabs[^>]*>\n?/g, '')
    .replace(/<\/Tabs>\n?/g, '')
    .replace(/<TabItem label="([^"]+)">/g, '**$1:**')
    .replace(/<\/TabItem>\n?/g, '')
    .replace(/<\/?CardGrid[^>]*>\n?/g, '')
    .replace(/<LinkCard\b[^>]*\/>/g, (t) => `- [${attr(t, 'title')}](${attr(t, 'href')}): ${attr(t, 'description')}`)
    .replace(/<Card\b[^>]*>([\s\S]*?)<\/Card>/g, (t, inner) => `**${attr(t, 'title')}.** ${inner.replace(/\s+/g, ' ').trim()}`)
    .replace(/<McpDownload\s*\/>/g, '[Download moca-mcp](https://github.com/openmoca/moca-mcp-dotnet/releases/latest)')
    .replace(/<a class="moca-download-chip" href="([^"]+)"[^>]*>([^<]*)<\/a>/g, '[$2]($1)')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { data: {}, body: text };
  const field = (k) => {
    const v = m[1].match(new RegExp(`^${k}: (.*)$`, 'm'))?.[1]?.trim();
    if (!v) return undefined;
    return v.startsWith('"') ? JSON.parse(v) : v;
  };
  // The home page keeps its summary in the hero's tagline.
  const tagline = m[1].match(/^ {2}tagline: (.*)$/m)?.[1]?.trim();
  return { data: { title: field('title'), description: field('description'), tagline }, body: text.slice(m[0].length) };
}

let written = 0;
for (const file of walk(docs).filter((f) => /\.mdx?$/.test(f))) {
  let route = relative(docs, file).replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '');
  if (route === '404') continue;
  const { data, body } = frontmatter(readFileSync(file, 'utf8'));
  const url = `${SITE}/${route ? `${route}/` : ''}`;
  const head = [`# ${data.title ?? 'OpenMOCA'}`, ''];
  if (data.tagline || data.description) head.push(`> ${data.tagline ?? data.description}`, '');
  head.push(`Source: ${url}`, '');
  const out = join(dist, route, 'index.md');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${head.join('\n')}\n${plain(body)}\n`);
  written++;
}
console.log(`Wrote ${written} Markdown pages beside their HTML.`);
