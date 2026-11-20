// /llms-full.txt: the full Markdown of the pages that explain OpenMOCA and how to use it (the Start, Learn and Guides
// groups), for AI assistants that read a whole site at once. Language tabs become labelled blocks again.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import sources from '../../sources.json';
import audiences from '../audiences.json';
import commitment from '../directory/commitment.json';
import conformant from '../directory/conformant.json';
import { MAIN_PAGES, SITE, SUMMARY } from './llms.txt';

// The main site's pages first (zones.json), then the Learn and Guides groups of the docs (Get started is in Guides).
const GROUPS = ['Learn', 'Guides'];

function plain(body: string) {
  return body
    .replace(/^import .*$/gm, '')
    .replace(/<Tabs[^>]*>\n?/g, '')
    .replace(/<\/Tabs>\n?/g, '')
    .replace(/<TabItem label="([^"]+)">/g, '**$1:**')
    .replace(/<\/TabItem>\n?/g, '')
    .replace(/<\/?CardGrid[^>]*>\n?/g, '')
    .replace(/<LinkCard\b[^>]*\/>/g, (t) => `- [${t.match(/title="([^"]*)"/)?.[1] ?? ''}](${t.match(/href="([^"]*)"/)?.[1] ?? ''}): ${t.match(/description="([^"]*)"/)?.[1] ?? ''}`)
    .replace(/<(PackageLayers|WorkTravels)\b[^>]*\/>\n?/g, '')
    .replace(/<LinkButton\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/LinkButton>/g, (_, href, text) => `[${text.trim()}](${href})`)
    .replace(/<CommitmentList\s*\/>/g, commitment.entries.map((e) => `- [${e.app.name}](https://openmoca.org/directory/commitment/${e.id}/), by ${e.company.name}: ${e.app.kind}, version ${e.version}.`).join('\n'))
    .replace(/<ConformantList\s*\/>/g, conformant.entries.map((e) => `- [${e.name}](${e.repository})${e.package ? ` (\`${e.package}\`)` : ''}: ${e.kind}, ${e.standing}, version ${e.version}, OpenMOCA ${e.specVersion}, ${e.suite.passed} of ${e.suite.cases} tests passed ([test run](${e.testRun})).`).join('\n'))
    .replace(/<AudienceCards\s*\/>/g, audiences.map((c) => `- **[${c.name}](${c.href})**: ${c.title} ${c.strapline}. ${c.line}`).join('\n'))
    .replace(/<div class="lead">\n\n([\s\S]*?)\n\n<\/div>/g, '$1')
    .replace(/<p class="section-strapline">([^<]*)<\/p>/g, '**$1**')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const GET: APIRoute = async () => {
  const docs = await getCollection('docs');
  const byId = new Map(docs.map((d) => [d.id.replace(/\/index$/, ''), d]));
  const parts = [`# OpenMOCA\n\n> ${SUMMARY}`];
  for (const id of MAIN_PAGES) {
    const d = byId.get(id) ?? (id === '' ? byId.get('index') : undefined);
    if (d) parts.push(`# ${d.data.title}\n\nSource: ${SITE}/${id}${id ? '/' : ''}\n\n${plain(d.body ?? '')}`);
  }
  for (const p of sources.pages.filter((p) => GROUPS.includes(p.group) && byId.has(p.route))) {
    const d = byId.get(p.route)!;
    parts.push(`# ${d.data.title}\n\nSource: ${SITE}/${p.route}/\n\n${plain(d.body ?? '')}`);
  }
  return new Response(parts.join('\n\n---\n\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
