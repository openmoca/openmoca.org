#!/usr/bin/env node
// Builds src/content/docs/ from the other OpenMOCA repositories. Every page the
// site shows is listed in sources.json; the repositories stay the only source,
// and nothing here is committed.
//
// Usage:
//   node scripts/sync-docs.mjs            read the sibling checkouts as they are
//   node scripts/sync-docs.mjs --pinned   read each sibling at its pin (git archive)
//
// Pins come from .github/workflows/build.yml (MOCA_*_REF). In CI the siblings
// are checked out at those pins, so the default mode reads pinned content there.
//
// For each page it takes the first "# " heading as the title, and rewrites
// links: to another listed page, the site route; to anything else in a MOCA
// repository, GitHub at the pinned commit; anything external, unchanged.
//
// Language tabs: a page marks the same task in several languages with
// <!-- tabs --> and <!-- /tabs -->, each block under a bold label line on its
// own (**TypeScript:**). On GitHub they read as labelled blocks; here they become
// Starlight tabs, synced by label across the site, and the page becomes MDX.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const siblings = dirname(site);
const out = join(site, 'src', 'content', 'docs');
const pinned = process.argv.includes('--pinned');
const ORG = 'openmoca';

const sources = JSON.parse(readFileSync(join(site, 'sources.json'), 'utf8'));

// Pins: MOCA_<REPO>_REF from the workflow's env block.
const pins = {};
for (const [, name, ref] of readFileSync(join(site, '.github', 'workflows', 'build.yml'), 'utf8')
  .matchAll(/^\s+MOCA_(\w+)_REF:\s*(\S+)/gm)) {
  pins[`moca-${name.toLowerCase().replace(/_/g, '-')}`] = ref;
}
const refOf = (repo) => {
  if (!pins[repo]) throw new Error(`No pin for ${repo}: add MOCA_${repo.slice(5).toUpperCase().replace(/-/g, '_')}_REF to build.yml`);
  return pins[repo];
};

// Reading a file from a repository, as checked out or at its pin.
const readers = {};
function repoFiles(repo) {
  if (readers[repo]) return readers[repo];
  const dir = join(siblings, repo);
  if (!existsSync(dir)) throw new Error(`Cannot find ${repo} beside this repository`);
  if (!pinned) {
    readers[repo] = {
      read: (p) => readFileSync(join(dir, p), 'utf8'),
      kind: (p) => (existsSync(join(dir, p)) ? (statSync(join(dir, p)).isDirectory() ? 'tree' : 'blob') : null),
    };
  } else {
    const ref = refOf(repo);
    const list = execFileSync('git', ['-C', dir, 'ls-tree', '-r', '-t', '--name-only', ref], { encoding: 'utf8' }).split('\n');
    const files = new Set(list.filter(Boolean));
    const trees = new Set(execFileSync('git', ['-C', dir, 'ls-tree', '-r', '-d', '--name-only', ref], { encoding: 'utf8' }).split('\n').filter(Boolean));
    readers[repo] = {
      read: (p) => execFileSync('git', ['-C', dir, 'show', `${ref}:${p}`], { encoding: 'utf8', maxBuffer: 64 << 20 }),
      kind: (p) => (p === '' || trees.has(p) ? 'tree' : files.has(p) ? 'blob' : null),
    };
  }
  return readers[repo];
}

// (repo, path) -> route, and a repository's root -> its README page.
const routes = new Map(sources.pages.map((p) => [`${p.repo}:${p.path}`, `/${p.route}/`]));
const routeFor = (repo, path) => routes.get(`${repo}:${path}`)
  ?? routes.get(`${repo}:${posix.join(path, 'README.md')}`);
// Paths the site never shows or links to (sources.json "hidden"): links to them are removed from pages.
const HIDDEN = '\u0000hidden\u0000';
const hidden = Object.entries(sources.hidden ?? {}).filter(([k]) => !k.startsWith('$'));
const isHidden = (repo, path) => hidden.some(([r, prefixes]) => (r === '*' || r === repo) && prefixes.some((pre) => path === pre.replace(/\/$/, '') || path.startsWith(pre)));

const github = (repo, kind, path) => `https://github.com/${ORG}/${repo}/${kind}/${refOf(repo)}/${path}`;

const problems = [];

function rewrite(target, page) {
  if (/^(mailto:|#)/.test(target)) return target;
  const [path, anchor] = target.split(/(?=#)/);
  // #readme is GitHub's anchor for a README; on the site the page itself is the README.
  const hash = anchor === '#readme' ? '' : anchor ?? '';
  // A link into an OpenMOCA repository on GitHub.
  const gh = path.match(/^https:\/\/github\.com\/openmoca\/([\w.-]+)(?:\/(?:blob|tree)\/[^/]+\/(.*))?\/?$/);
  if (gh) {
    if (isHidden(gh[1], (gh[2] ?? '').replace(/\/$/, ''))) return HIDDEN;
    const route = routeFor(gh[1], (gh[2] ?? '').replace(/\/$/, ''));
    return route ? route + hash : target;
  }
  if (/^[a-z][\w+.-]*:/i.test(path)) return target; // external
  const repoPath = posix.normalize(posix.join(posix.dirname(page.path), decodeURI(path))).replace(/\/$/, '');
  if (repoPath.startsWith('..')) {
    problems.push(`${page.repo}/${page.path}: ${target} leaves the repository`);
    return target;
  }
  if (isHidden(page.repo, repoPath)) return HIDDEN;
  const route = routeFor(page.repo, repoPath === '.' ? '' : repoPath);
  if (route) return route + hash;
  const kind = repoFiles(page.repo).kind(repoPath === '.' ? '' : repoPath);
  if (!kind) {
    problems.push(`${page.repo}/${page.path}: ${target} does not exist`);
    return target;
  }
  return github(page.repo, kind, repoPath === '.' ? '' : repoPath) + hash;
}

// Rewrites ](target) links outside code: fenced blocks and inline code spans are left alone.
function rewriteLinks(markdown, page) {
  let fence = null;
  return markdown.split('\n').map((line) => {
    const f = line.match(/^\s*(`{3,}|~{3,})/);
    if (f) {
      if (!fence) fence = f[1];
      else if (line.trim().startsWith(fence)) fence = null;
      return line;
    }
    if (fence) return line;
    return line.split(/(`[^`]*`)/).map((part, i) => (i % 2 === 1 ? part
      : part.replace(/\]\(([^)\s]+)\)/g, (_, t) => `](${rewrite(t, page)})`))).join('');
  }).filter((line) => !(line.trimStart().startsWith('|') && line.includes(HIDDEN))).join('\n');
}

// Removes links to hidden paths from a page: a citation in brackets goes with its brackets, one item of a list
// in brackets goes with its comma, a "See [...]." sentence goes, and any other such link becomes its plain text.
// Runs over the whole page, since a source may break a line inside a citation.
function unlinkHidden(markdown) {
  const link = `\\[([^\\]]*)\\]\\(${HIDDEN}\\)`;
  return markdown
    .replace(new RegExp(`[ \\t]*\\n?[ \\t]*\\((?:see\\s+)?${link}\\)`, 'gi'), '')
    .replace(new RegExp(`,\\s*${link}`, 'g'), '')
    .replace(new RegExp(`${link},\\s*`, 'g'), '')
    .replace(new RegExp(`\\s*\\bSee\\s+(?:also\\s+)?${link}\\.?`, 'g'), '')
    .replace(new RegExp(link, 'g'), '$1');
}

const yaml = (s) => JSON.stringify(s); // a JSON string is a valid YAML scalar

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const TABS = /^<!-- tabs -->\n([\s\S]*?)^<!-- \/tabs -->$/m;
// One <Tabs> per marked group. The rest of the page becomes MDX too, so any other HTML comment is removed.
function toTabs(text, page) {
  const groups = text.replace(new RegExp(TABS.source, 'gm'), (_, inner) => {
    const parts = inner.split(/^\*\*([^*\n]+?):?\*\*\n/m);
    if (parts.length < 3 || parts[0].trim()) {
      problems.push(`${page.repo}/${page.path}: a tabs group must start with a **Label** line`);
      return inner;
    }
    const items = [];
    for (let i = 1; i < parts.length; i += 2) {
      items.push(`<TabItem label="${parts[i].trim()}">\n\n${parts[i + 1].trim()}\n\n</TabItem>`);
    }
    // Tabs choosing an MCP server share their choice with each other, not with the language tabs.
    const key = parts[1].trim().startsWith('MCP server') ? 'mcp-server' : 'language';
    return `<Tabs syncKey="${key}">\n${items.join('\n')}\n</Tabs>\n`;
  });
  return groups.replace(/<!--[\s\S]*?-->\n?/g, '');
}

// "Try it" for an example page, from its tryIt entry in sources.json: where Try OpenMOCA has the package (or one like
// it), a sentence linking to it; then how to try the released .moca files in an AI assistant with the MCP server,
// the download first and npm second.
//   tryIt: { online?: Markdown sentence, files?: [names], trustRoot?: bool, model?: standard model a file needs, ask? }
const RELEASE = 'https://github.com/openmoca/moca-spec/releases/latest/download/';
function tryItSection({ online, files = [], trustRoot, model, ask }) {
  const out = ['', '## Try it', ''];
  if (online) out.push(online, '');
  if (files.length) {
    const links = files.map((f) => `[\`${f}\`](${RELEASE}${f})`);
    const list = links.length === 1 ? links[0] : `${links.slice(0, -1).join(', ')} and ${links.at(-1)}`;
    const one = files.filter((f) => f.endsWith('.moca')).length === 1; // an index beside a package is not another package
    const args = ['--library', '.', ...(trustRoot ? ['--trust-root', 'example-trust-root.json'] : [])].join(' ');
    out.push(
      `To try ${one ? 'it' : 'them'} with your AI assistant, use our [MCP server](/tools/mcp/). Download ${list}${trustRoot ? `, and the [trust root](${RELEASE}example-trust-root.json) that verifies ${one ? 'its signature' : 'their signatures'},` : ''} into one folder, and serve the folder:`,
      '',
      '```sh',
      ...(model ? [`moca-mcp models add ${model}`] : []),
      `moca-mcp ${args}`,
      '```',
      '',
      ...(model ? [`The index lets it search by meaning as well as by words; \`models add\` installs the [standard model](/spec/sidecar-index/#51-embedders-the-moca-tools-support-informative) it was built with, once.`, ''] : []),
      'One download with nothing to install, for Windows, macOS or Linux: [get moca-mcp](/tools/mcp/#install).',
      '',
      `Connect it to Claude Desktop, Claude Code, VS Code or Cursor, with full paths, as in [Got a .moca file?](/start/open-a-package/#connect-it)${ask ? `. Then ask: "${ask}"` : '.'}`,
      '',
    );
  }
  return out.join('\n');
}

for (const page of sources.pages) {
  const files = repoFiles(page.repo);
  if (!files.kind(page.path)) {
    problems.push(`${page.repo}/${page.path}: listed in sources.json but not found`);
    continue;
  }
  let body = files.read(page.path).replace(/\r\n/g, '\n');
  const h1 = body.match(/^# (.+)$/m);
  if (!h1) {
    problems.push(`${page.repo}/${page.path}: no "# " heading to use as the title`);
    continue;
  }
  body = body.replace(h1[0], '').replace(/^\n+/, '');
  const front = [
    '---',
    // sources.json can give a title, so the page and the sidebar say the same thing; the source keeps its own heading
    // (an npm README's heading is its package name).
    `title: ${yaml(page.title ?? h1[1].trim())}`,
    // Each page's own description and, when the heading alone says little to a searcher, a fuller title for search
    // results and AI answers. The heading and sidebar keep the short title.
    ...(page.description ? [`description: ${yaml(page.description)}`] : []),
    ...(page.seoTitle ? [`head:`, `  - tag: title`, `    content: ${yaml(`${page.seoTitle} | OpenMOCA`)}`] : []),
    ...(page.label ? [`sidebar:`, `  label: ${yaml(page.label)}`] : []),
    `editUrl: ${yaml(`https://github.com/${ORG}/${page.repo}/edit/main/${page.path}`)}`,
    '---',
    '',
  ].join('\n');
  let text = unlinkHidden(rewriteLinks(body, page));
  const tabbed = TABS.test(text);
  if (tabbed) text = toTabs(text, page);
  // An example's "Try it" section is generated (below), so it reads the same on every example page; it needs MDX.
  const mdx = tabbed || Boolean(page.tryIt);
  if (page.tryIt && !tabbed) text = text.replace(/<!--[\s\S]*?-->\n?/g, '');
  // The MCP Registry's ownership line (moca-mcp-dotnet's README) is for the registry, not readers.
  text = text.replace(/^<!-- mcp-name: .*-->\n+/m, '');
  // MDX reads <https://…> as a tag: make autolinks plain links, outside fenced code.
  if (mdx) text = text.split(/(^```[\s\S]*?^```$)/m).map((part, i) => (i % 2 ? part : part.replace(/<(https?:\/\/[^>\s]+)>/g, '[$1]($1)'))).join('');
  const file = join(out, page.route, mdx ? 'index.mdx' : 'index.md');
  mkdirSync(dirname(file), { recursive: true });
  // A page's optional intro is Markdown the site puts above the body, for what the source file cannot carry: the
  // README inside an example package is covered by that package's digest, so a download link goes here instead.
  const intro = page.intro ? `${page.intro.trim()}\n\n` : '';
  const imports = mdx
    ? "import { Tabs, TabItem } from '@astrojs/starlight/components';\n\n"
    : '';
  writeFileSync(file, front + imports + intro + text.trimEnd() + '\n' + (page.tryIt ? tryItSection(page.tryIt) : ''));
}

// The site's own pages (landing page, language chooser) are copied in as they are.
cpSync(join(site, 'src', 'site-pages'), out, { recursive: true });

// The specification version the pages document, for the footer.
const specVersion = JSON.parse(repoFiles('moca-spec').read('package.json')).version;
writeFileSync(join(site, 'src', 'generated.json'), `${JSON.stringify({ specVersion }, null, 2)}\n`);

// moca-spec's JSON Schemas, byte for byte, at the paths their $id names under https://w3id.org/moca/, which redirects
// to this site: /schemas/v1/ and /profiles/ontology/v1/. Served as application/schema+json (worker/index.js).
for (const [from, to] of [
  ...readdirSync(join(siblings, 'moca-spec', 'schemas', 'v1')).filter((n) => n.endsWith('.schema.json')).map((n) => [`schemas/v1/${n}`, `schemas/v1/${n}`]),
  ['profiles/ontology/profile.schema.json', 'profiles/ontology/v1/profile.schema.json'],
]) {
  const file = join(site, 'public', to);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, repoFiles('moca-spec').read(from));
}

// moca-spec's agent skills, served under /.well-known/agent-skills/ (src/pages/.well-known/agent-skills/).
const SKILLS = ['openmoca'];
rmSync(join(site, 'src', 'generated', 'agent-skills'), { recursive: true, force: true });
for (const name of SKILLS) {
  const file = join(site, 'src', 'generated', 'agent-skills', name, 'SKILL.md');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, repoFiles('moca-spec').read(`agent-skills/${name}/SKILL.md`));
}

if (problems.length) {
  for (const p of problems) console.error(`FAIL ${p}`);
  process.exit(1);
}
console.log(`Synced ${sources.pages.length} pages from ${new Set(sources.pages.map((p) => p.repo)).size} repositories${pinned ? ' at their pins' : ''}.`);
