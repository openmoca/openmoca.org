// /llms-full.txt: the full Markdown of the pages that explain OpenMOCA and how to use it (the Start, Learn and Guides
// groups), for AI assistants that read a whole site at once. Language tabs become labelled blocks again.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import sources from '../../sources.json';
import { SITE, SUMMARY } from './llms.txt';

const GROUPS = ['Start', 'Learn', 'Guides'];

function plain(body: string) {
  return body
    .replace(/^import .*$/gm, '')
    .replace(/<Tabs[^>]*>\n?/g, '')
    .replace(/<\/Tabs>\n?/g, '')
    .replace(/<TabItem label="([^"]+)">/g, '**$1:**')
    .replace(/<\/TabItem>\n?/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const GET: APIRoute = async () => {
  const docs = await getCollection('docs');
  const byId = new Map(docs.map((d) => [d.id.replace(/\/index$/, ''), d]));
  const parts = [`# OpenMOCA\n\n> ${SUMMARY}`];
  for (const p of sources.pages.filter((p) => GROUPS.includes(p.group) && byId.has(p.route))) {
    const d = byId.get(p.route)!;
    parts.push(`# ${d.data.title}\n\nSource: ${SITE}/${p.route}/\n\n${plain(d.body ?? '')}`);
  }
  return new Response(parts.join('\n\n---\n\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
