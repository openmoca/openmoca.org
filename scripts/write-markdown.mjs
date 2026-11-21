#!/usr/bin/env node
// Writes each page's Markdown beside its HTML, as dist/<route>/index.md, for AI agents: worker/index.js serves it to
// requests that ask for `Accept: text/markdown`, and every page links to it (<link rel="alternate">). Run after
// `astro build`; it reads the pages the sync wrote to src/content/docs.
//
// MDX components become plain Markdown: language tabs become labelled blocks, cards become list items.
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import audiences from '../src/audiences.json' with { type: 'json' };
import commitment from '../src/directory/commitment.json' with { type: 'json' };
import conformant from '../src/directory/conformant.json' with { type: 'json' };

const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docs = join(site, 'src', 'content', 'docs');
const dist = join(site, 'dist');
const SITE = 'https://openmoca.org';

function walk(dir) {
  return readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
}

const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1] ?? '';

// The sync escapes what MDX would read as code in another repository's pages (scripts/sync-docs.mjs, asContent).
// Agents get the Markdown as written: the escapes are undone outside fenced code.
function unescaped(markdown) {
  let fence = null;
  return markdown.split('\n').map((line) => {
    const f = line.match(/^\s*(`{3,}|~{3,})/);
    if (f) {
      if (!fence) fence = f[1];
      else if (line.trim().startsWith(fence)) fence = null;
      return line;
    }
    if (fence) return line;
    return line.replace(/^([ \t]*)&#(101|105);(xport|mport)\b/, (_, indent, code, rest) => `${indent}${String.fromCharCode(code)}${rest}`)
      .split(/(`+[^`]*`+)/).map((part, i) => (i % 2 ? part : part.replace(/&lt;/g, '<').replace(/\\([{}])/g, '$1'))).join('');
  }).join('\n');
}

function plain(body) {
  return unescaped(body)
    .replace(/^import .*$/gm, '')
    .replace(/<Tabs[^>]*>\n?/g, '')
    .replace(/<\/Tabs>\n?/g, '')
    .replace(/<TabItem label="([^"]+)">/g, '**$1:**')
    .replace(/<\/TabItem>\n?/g, '')
    .replace(/<\/?CardGrid[^>]*>\n?/g, '')
    .replace(/<LinkCard\b[^>]*\/>/g, (t) => `- [${attr(t, 'title')}](${attr(t, 'href')}): ${attr(t, 'description')}`)
    .replace(/<Card\b[^>]*>([\s\S]*?)<\/Card>/g, (t, inner) => `**${attr(t, 'title')}.** ${inner.replace(/\s+/g, ' ').trim()}`)
    .replace(/<LinkButton\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/LinkButton>/g, (_, href, text) => `[${text.trim()}](${href})`)
    .replace(/<CommitmentList status="(\w+)"[^>]*\/>/g, (_, status) => commitment.entries.filter((e) => e.status === status).map((e) => `- [${e.app.name}](https://openmoca.org/directory/commitment/${e.id}/), by ${e.company.name}: ${e.app.kind}, version ${e.version}.`).join('\n') || (status === 'made' ? 'No app has made the Commitment yet.' : 'None at the moment.'))
    .replace(/<ConformantList\s*\/>/g, conformant.entries.map((e) => `- [${e.name}](${e.repository})${e.package ? ` (\`${e.package}\`)` : ''}: ${e.kind}, ${e.standing}, version ${e.version}, OpenMOCA ${e.specVersion}, ${e.suite.passed} of ${e.suite.cases} tests passed ([test run](${e.testRun})).`).join('\n'))
    .replace(/<AudienceCards\s*\/>/g, audiences.map((c) => `- **[${c.title}](${c.href})** ${c.name}. ${c.line}`).join('\n'))
    .replace(/<div class="lead">\n\n([\s\S]*?)\n\n<\/div>/g, '$1')
    .replace(/<p class="section-strapline">([^<]*)<\/p>/g, '**$1**')
    .replace(/<PackageLayers\b[^>]*\/>\n?/g, '')
    .replace(/<WorkTravels\s*\/>/g, [
      'How a creator\'s work travels:',
      '',
      '1. **The creator** makes the work: a podcast, a book, a course, a video, research, a guide.',
      '2. **Your work, kept together**: the work, its credits, its sources and the creator\'s terms, with a check for changes and a signature that shows who signed it.',
      '3. **Any app** opens the work, shows who made it, and follows the creator\'s wishes.',
      '4. **People** get answers that show where they came from, and open the original at the passage or the moment.',
    ].join('\n'))
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
  const raw = m[1].match(/^ {2}tagline: (.*)$/m)?.[1]?.trim();
  const tagline = raw?.startsWith('"') ? JSON.parse(raw) : raw;
  return { data: { title: field('title'), strapline: field('strapline'), description: field('description'), tagline }, body: text.slice(m[0].length) };
}

let written = 0;
for (const file of walk(docs).filter((f) => /\.mdx?$/.test(f))) {
  let route = relative(docs, file).replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '');
  if (route === '404') continue;
  const { data, body } = frontmatter(readFileSync(file, 'utf8'));
  const url = `${SITE}/${route ? `${route}/` : ''}`;
  const head = [`# ${data.title ?? 'OpenMOCA'}`, ''];
  // An audience page's strapline sits directly beneath its title, as on the page.
  if (data.strapline) head.push(`**${data.strapline}**`, '');
  if (data.tagline || data.description) head.push(`> ${data.tagline ?? data.description}`, '');
  head.push(`Source: ${url}`, '');
  const out = join(dist, route, 'index.md');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${head.join('\n')}\n${plain(body)}\n`);
  written++;
}
console.log(`Wrote ${written} Markdown pages beside their HTML.`);
