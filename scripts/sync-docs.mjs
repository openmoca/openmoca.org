#!/usr/bin/env node
// Builds src/content/docs/ from the other OpenMOCA repositories. Every page the
// site shows is listed in sources.json; the repositories stay the only source,
// and nothing here is committed.
//
// Usage:
//   node scripts/sync-docs.mjs            read the sibling checkouts as they are
//   node scripts/sync-docs.mjs --pinned   read each sibling at its pin (git archive)
//
// Pins come from .github/workflows/build.yml (MOCA_*_REF), each a full commit SHA. In CI the siblings
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
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { asContent, safeUrl } from './as-content.mjs';

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
  // A tag or a branch can move; a full commit SHA can't.
  if (!/^[0-9a-f]{40}$/.test(ref)) throw new Error(`MOCA_${name}_REF in build.yml is ${ref}: pin a full commit SHA`);
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
      list: (d) => readdirSync(join(dir, d)),
    };
  } else {
    const ref = refOf(repo);
    const list = execFileSync('git', ['-C', dir, 'ls-tree', '-r', '-t', '--name-only', ref], { encoding: 'utf8' }).split('\n');
    const files = new Set(list.filter(Boolean));
    const trees = new Set(execFileSync('git', ['-C', dir, 'ls-tree', '-r', '-d', '--name-only', ref], { encoding: 'utf8' }).split('\n').filter(Boolean));
    readers[repo] = {
      read: (p) => execFileSync('git', ['-C', dir, 'show', `${ref}:${p}`], { encoding: 'utf8', maxBuffer: 64 << 20 }),
      kind: (p) => (p === '' || trees.has(p) ? 'tree' : files.has(p) ? 'blob' : null),
      // The names directly inside a directory at the pin, not in the working tree, which may be on another branch.
      list: (d) => [...files].filter((f) => posix.dirname(f) === d).map((f) => posix.basename(f)),
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
  if (/^[a-z][\w+.-]*:/i.test(path)) {
    // A link to another site goes to the web or to an email address, nothing else.
    if (!safeUrl(path)) problems.push(`${page.repo}/${page.path}: a link to ${path.split(':')[0]}: is not a web or site link`);
    return target; // external
  }
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
      // A label is plain words: it goes into the tab's attribute.
      if (!/^[\w .+#/()-]+$/.test(parts[i].trim())) problems.push(`${page.repo}/${page.path}: tab label "${parts[i].trim()}" is not plain words`);
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
const DOWNLOADS = 'https://github.com/openmoca/moca-spec/releases/latest/download/';
function tryItSection({ online, files = [], trustRoot, model, ask }) {
  const out = ['', '## Try it', ''];
  if (online) out.push(online, '');
  if (files.length) {
    const links = files.map((f) => `[\`${f}\`](${DOWNLOADS}${f})`);
    const list = links.length === 1 ? links[0] : `${links.slice(0, -1).join(', ')} and ${links.at(-1)}`;
    const one = files.filter((f) => f.endsWith('.moca')).length === 1; // an index beside a package is not another package
    const args = ['--library', '.', ...(trustRoot ? ['--trust-root', 'example-trust-root.json'] : [])].join(' ');
    out.push(
      `To try ${one ? 'it' : 'them'} with your AI assistant, use our [MCP server](/tools/mcp/). Download ${list}${trustRoot ? `, and the [trust root](${DOWNLOADS}example-trust-root.json) that verifies ${one ? 'its signature' : 'their signatures'},` : ''} into one folder, and serve the folder:`,
      '',
      '```sh',
      ...(model ? [`moca-mcp models add ${model}`] : []),
      `moca-mcp ${args}`,
      '```',
      '',
      ...(model ? [`The index lets it search by meaning as well as by words; \`models add\` installs the [standard model](/spec/sidecar-index/#51-embedders-the-moca-tools-support-informative) it was built with, once.`, ''] : []),
      // The example trust root checks the examples' signatures and nothing else.
      ...(trustRoot ? ['`example-trust-root.json` is for these examples only: never use it to check any other package.', ''] : []),
      'One download with nothing to install, for Windows, macOS or Linux: [get moca-mcp](/tools/mcp/#install).',
      '',
      `Connect it to Claude Desktop, Claude Code, VS Code or Cursor, with full paths, as in [Got a .moca file?](/docs/guides/open-a-package/#connect-it)${ask ? `. Then ask: "${ask}"` : '.'}`,
      '',
    );
  }
  return out.join('\n');
}

let commitmentSource = null; // COMMITMENT.md, links rewritten, for the Directory's pages
for (const page of sources.pages) {
  const files = repoFiles(page.repo);
  if (!files.kind(page.path)) {
    problems.push(`${page.repo}/${page.path}: listed in sources.json but not found`);
    continue;
  }
  let body = files.read(page.path).replace(/\r\n/g, '\n');
  // A plain-text file (format "text"), such as LICENSE: each block of lines becomes a paragraph, with Markdown's
  // special characters escaped, and any `append` files after it under their own heading. The title comes from
  // sources.json, and the page ends with its `outro`.
  if (page.format === 'text') {
    const toMarkdown = (text) => text.split(/\n\s*\n/).map((block) => block.split('\n').map((l) => l.trim()).join(' ').trim())
      .filter(Boolean).map((p) => p.replace(/([\\`*_[\]<>#|])/g, '\\$1')).join('\n\n');
    const appended = (page.append ?? []).map((a) => `## ${a.heading}\n\n${toMarkdown(files.read(a.path).replace(/\r\n/g, '\n'))}`);
    body = [`# ${page.title}`, toMarkdown(body), ...appended].join('\n\n');
  }
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
    // A page of the main site (zones.json) is full width, with no sidebar.
    ...(page.template ? [`template: ${page.template}`] : []),
    // No "Edit page" link on any page (owner, 2026-11-20).
    'editUrl: false',
    '---',
    '',
  ].join('\n');
  let text = asContent(unlinkHidden(rewriteLinks(body, page)), page, problems);
  // The outro is added after links are rewritten: its link to the repository's own file must stay on GitHub.
  if (page.outro) text = `${text.trimEnd()}\n\n${page.outro}\n`;
  // A longer outro, the site's own Markdown (such as a listing under the Commitment), from a file in this repository.
  if (page.outroFile) text = `${text.trimEnd()}\n\n${readFileSync(join(site, page.outroFile), 'utf8').trim()}\n`;
  const tabbed = TABS.test(text);
  if (tabbed) text = toTabs(text, page);
  // An example's "Try it" section is generated (below), so it reads the same on every example page; it needs MDX.
  const mdx = tabbed || Boolean(page.tryIt);
  if (page.tryIt && !tabbed) text = text.replace(/<!--[\s\S]*?-->\n?/g, '');
  // The MCP Registry's ownership line (moca-mcp-dotnet's README) is for the registry, not readers.
  text = text.replace(/^<!-- mcp-name: .*-->\n+/m, '');
  // MDX reads <https://…> as a tag: make autolinks plain links, outside fenced code.
  if (mdx) text = text.split(/(^```[\s\S]*?^```$)/m).map((part, i) => (i % 2 ? part : part.replace(/<(https?:\/\/[^>\s]+)>/g, '[$1]($1)'))).join('');
  // A page the site builds from this source itself (the Commitment: the Directory's pages, below).
  if (page.render === 'commitment') {
    commitmentSource = text;
    continue;
  }
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

// The site's own pages (landing page, language chooser) are copied in, with the release state written in.
cpSync(join(site, 'src', 'site-pages'), out, { recursive: true });

// The release state, from release.json: one setting, so release day is a one-line change (RELEASE-DAY.md). Until the
// release is out, the pages name the previous one as current and give no counts the release has not confirmed.
const release = JSON.parse(readFileSync(join(site, 'release.json'), 'utf8'));
const RELEASE = {
  version: release.version,
  current: release.released ? release.version : release.previous,
  status: release.released
    ? `**OpenMOCA ${release.version}** is the current release.`
    : `**OpenMOCA ${release.previous}** is the current release. **${release.version}** is in review, and these pages describe it ahead of its release.`,
  // Plain words: these appear on the main site, where "Reader" and "conformance corpus" are not used.
  suite: release.released ? `${release.corpusCases} public tests` : 'a public test suite',
  readers: release.released ? 'free libraries in TypeScript, .NET and Python' : 'free libraries in several programming languages',
};
const sitePageFiles = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory()
  ? sitePageFiles(join(dir, n)).map((f) => join(n, f)) : [n]));
for (const rel of sitePageFiles(join(site, 'src', 'site-pages'))) {
  const file = join(out, rel);
  const text = readFileSync(file, 'utf8');
  const done = text.replace(/@@release\.(\w+)@@/g, (token, name) => {
    if (!(name in RELEASE)) problems.push(`src/site-pages/${rel}: unknown ${token}`);
    return RELEASE[name] ?? token;
  });
  if (done !== text) writeFileSync(file, done);
}

// About is on the main site (/about/) and in the docs' Project group (/project/about/), from one source. The docs copy
// has the docs layout, says /about/ is the canonical page, and stays out of search and the sitemap
// (astro.config.mjs), so search engines and people see one page.
{
  const about = readFileSync(join(out, 'about.md'), 'utf8');
  const docsCopy = about
    .replace(/^template: splash\n/m, '')
    .replace(/^editUrl: false$/m, [
      'editUrl: false',
      'pagefind: false',
      'sidebar:',
      '  label: About',
      'head:',
      '  - tag: link',
      '    attrs:',
      '      rel: canonical',
      '      href: https://openmoca.org/about/',
    ].join('\n'));
  mkdirSync(join(out, 'project'), { recursive: true });
  writeFileSync(join(out, 'project', 'about.md'), docsCopy);
}

// The Directory's lists (src/directory/*.json): the one source for its pages and for other apps. Each is checked
// against its JSON Schema (an invalid entry stops the build), and both are published, with their schemas, at
// /directory/<name>.json.
const DIRECTORY = ['commitment', 'conformant'];
const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);
const lists = {};
mkdirSync(join(site, 'public', 'directory'), { recursive: true });
for (const name of DIRECTORY) {
  const schemaFile = join(site, 'src', 'directory', `${name}.schema.json`);
  const dataFile = join(site, 'src', 'directory', `${name}.json`);
  const validate = ajv.compile(JSON.parse(readFileSync(schemaFile, 'utf8')));
  const data = JSON.parse(readFileSync(dataFile, 'utf8'));
  if (!validate(data)) for (const e of validate.errors) problems.push(`src/directory/${name}.json${e.instancePath}: ${e.message}`);
  const ids = data.entries.map((e) => e.id);
  for (const id of ids.filter((id, i) => ids.indexOf(id) !== i)) problems.push(`src/directory/${name}.json: id ${id} appears twice`);
  lists[name] = data;
  cpSync(schemaFile, join(site, 'public', 'directory', `${name}.schema.json`));
  cpSync(dataFile, join(site, 'public', 'directory', `${name}.json`));
}
// A conformance result names the release's corpus: its count must be the one release.json states.
for (const e of lists.conformant.entries) {
  if (e.suite.cases !== release.corpusCases) problems.push(`src/directory/conformant.json: ${e.id} names ${e.suite.cases} cases; release.json says ${release.corpusCases}`);
}

// The Commitment's pages, from COMMITMENT.md and commitment.json: /directory/commitment/ (what it means for you, the
// list with its search, what a company commits to, how to make it) and one page per entry, with the entry and the
// company's commitments in full.
if (commitmentSource) {
  const sections = {};
  for (const part of commitmentSource.split(/^(?=## )/m)) {
    const m = part.match(/^## (.+)\n/);
    if (m) sections[m[1].trim()] = part.slice(m[0].length).trim();
  }
  const forYou = sections['For people: what the Commitment means for you'];
  const forCompanies = sections['For companies: what you commit to'];
  if (!forYou || !forCompanies) problems.push('COMMITMENT.md: expected its "For people" and "For companies" sections');
  const how = readFileSync(join(site, 'src', 'site-fragments', 'commitment-how.md'), 'utf8').trim();
  const page = sources.pages.find((p) => p.render === 'commitment');
  writeFileSync(join(out, 'directory', 'commitment.mdx'), [
    '---',
    `title: ${yaml('The OpenMOCA Commitment')}`,
    `description: ${yaml(page.description)}`,
    'template: splash',
    'editUrl: false',
    'head:',
    '  - tag: title',
    `    content: ${yaml(`${page.seoTitle} | OpenMOCA`)}`,
    '---',
    '',
    "import CommitmentList from '../../../components/CommitmentList.astro';",
    '',
    page.intro.trim(),
    '',
    '## What it means for you',
    '',
    forYou,
    '',
    '## Apps that have made the Commitment',
    '',
    '<CommitmentList status="made" search />',
    '',
    '## Pending: statement published, signature to follow',
    '',
    'These apps have published their statement; their signed statement is to follow. Until it is signed and listed',
    'above, they may not show the Commitment mark. PI & Mash maintains OpenMOCA, and is listed under the same rules',
    'as anyone else.',
    '',
    '<CommitmentList status="pending" />',
    '',
    '[This list as data](https://openmoca.org/directory/commitment.json) (JSON, free to reuse under CC0), and its',
    '[schema](https://openmoca.org/directory/commitment.schema.json).',
    '',
    '## For companies: what you commit to',
    '',
    forCompanies,
    '',
    how,
    '',
  ].join('\n'));
  const when = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const WHERE = { device: "on the person's own device", host: "on the app's own servers", provider: "with another company's AI provider" };
  for (const e of lists.commitment.entries) {
    const models = e.modelsAndDestinations.map((m) => `  - ${m.use}: ${[m.model, m.provider].filter(Boolean).join(', ')}, ${WHERE[m.destination]}`);
    const statement = e.statement.url
      ? `[${e.company.name}'s signed statement](${e.statement.url})${e.statement.signed ? '' : ' (not yet signed)'}`
      : 'signed record to follow';
    const file = join(out, 'directory', 'commitment', `${e.id}.md`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, [
      '---',
      `title: ${yaml(e.app.name)}`,
      `description: ${yaml(`${e.app.name}, by ${e.company.name}, ${e.status === 'made' ? 'has made' : 'is pending for'} the OpenMOCA Commitment for version ${e.version}: the AI models it uses, where your work goes, the set-ups covered, and how to challenge it.`)}`,
      'template: splash',
      'editUrl: false',
      '---',
      '',
      e.status === 'made'
        ? `${e.app.name}, by ${e.company.name}, has made the [OpenMOCA Commitment](/directory/commitment/).`
        : `**Pending: statement published, signature to follow.** ${e.company.name} has published its statement for ${e.app.name}; the signed statement is to follow. Until it is signed and listed, the app may not show the [OpenMOCA Commitment](/directory/commitment/) mark.`,
      '',
      '## The entry',
      '',
      `- **The app:** [${e.app.name}](${e.app.url}), ${e.app.kind}.`,
      `- **The company:** [${e.company.name}](${e.company.url}).`,
      `- **Version covered:** ${e.version}.`,
      `- **Listed:** ${when(e.date)}.`,
      '- **AI models, and where your work goes:**',
      ...models,
      `- **Set-ups covered:** ${e.setupsCovered.join(' ')}`,
      ...(e.setupsNotCovered ? [`- **Not covered:** ${e.setupsNotCovered.join(' ')}`] : []),
      `- **Contact for challenges:** [${e.contact.replace(/^mailto:/, '')}](${e.contact}).`,
      `- **Status:** ${e.status === 'made' ? 'made: signed and listed' : 'pending: statement published, signature to follow'}.`,
      `- **Statement:** ${statement}.`,
      `- **Commitment version:** OpenMOCA ${e.commitmentVersion}.`,
      '',
      '## What it commits to',
      '',
      forCompanies,
      '',
      'This entry, as data, is in [the list](https://openmoca.org/directory/commitment.json).',
      '',
    ].join('\n'));
  }
}

// The specification version the pages document, for the footer.
const specVersion = JSON.parse(repoFiles('moca-spec').read('package.json')).version;
writeFileSync(join(site, 'src', 'generated.json'), `${JSON.stringify({ specVersion }, null, 2)}\n`);

// moca-spec's JSON Schemas, byte for byte, at the paths their $id names under https://w3id.org/moca/, which redirects
// to this site: /schemas/v1/ and /profiles/ontology/v1/. Served as application/schema+json (worker/index.js).
for (const [from, to] of [
  ...repoFiles('moca-spec').list('schemas/v1').filter((n) => n.endsWith('.schema.json')).map((n) => [`schemas/v1/${n}`, `schemas/v1/${n}`]),
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
