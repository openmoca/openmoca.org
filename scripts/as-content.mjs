// Pages from other repositories are content, never code (scripts/sync-docs.mjs). Their raw HTML is cut down to a
// short list of tags and attributes, with links only to the web, email or this site; anything else that starts like a
// tag is shown as text. What MDX would read as code ({…}, a line starting `import` or `export`) is escaped, and
// autolinks become plain links, so a page reads the same whether the site writes it as Markdown or MDX. Code (fenced
// blocks and inline code spans) is left as it is: both formats show it as text. Comments stay, for the tabs.
// scripts/write-markdown.mjs undoes the escapes in the Markdown it writes for agents.
const HTML_TAGS = new Set(['a', 'abbr', 'b', 'blockquote', 'br', 'code', 'dd', 'del', 'details', 'div', 'dl', 'dt', 'em',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'ins', 'kbd', 'li', 'ol', 'p', 'picture', 'pre', 'q', 's', 'samp',
  'small', 'source', 'span', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr',
  'u', 'ul', 'var']);
const VOID_TAGS = new Set(['br', 'hr', 'img', 'source']);
const HTML_ATTRIBUTES = new Set(['align', 'alt', 'colspan', 'dir', 'height', 'href', 'id', 'lang', 'media', 'name', 'open',
  'rowspan', 'src', 'srcset', 'title', 'type', 'width']);
// A link may go to the web, to an email address, or within this site; nothing else (a link with no scheme is relative).
// It is checked as a browser reads it, after Markdown escapes and character references.
const codePoint = (n) => (n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '\ufffd');
const asRead = (url) => url
  .replace(/\\([!-/:-@[-`{-~])/g, '$1')
  .replace(/&#x([0-9a-f]+);?/gi, (_, h) => codePoint(parseInt(h, 16)))
  .replace(/&#(\d+);?/g, (_, d) => codePoint(Number(d)))
  .replace(/&(colon|tab|newline);/gi, (_, n) => ({ colon: ':', tab: '\t', newline: '\n' })[n.toLowerCase()])
  .trim();
export const safeUrl = (raw) => {
  const url = asRead(raw);
  return /^(https?:|mailto:)/i.test(url) || !/^[^/?#]*:/.test(url);
};
const escapeText = (s) => s.replace(/[<{}]/g, (c) => (c === '<' ? '&lt;' : `\\${c}`));

function sanitiseTag(tag, page, problems) {
  const m = tag.match(/^<(\/?)([A-Za-z][\w-]*)([\s\S]*?)\s*(\/?)>$/);
  const name = m?.[2].toLowerCase();
  if (!m || !HTML_TAGS.has(name)) return `&lt;${escapeText(tag.slice(1))}`;
  if (m[1]) return `</${name}>`;
  const attributes = [];
  for (const [, key, , value = ''] of m[3].matchAll(/([\w:-]+)(\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g)) {
    const k = key.toLowerCase();
    if (!HTML_ATTRIBUTES.has(k)) continue;
    const urls = k === 'srcset' ? value.split(',').map((s) => s.trim().split(/\s+/)[0]) : k === 'href' || k === 'src' ? [value] : [];
    if (urls.some((u) => !safeUrl(u))) {
      problems.push(`${page.repo}/${page.path}: a ${name} ${k} that is not a web or site link`);
      continue;
    }
    attributes.push(value || k === 'alt' ? `${k}="${value.replace(/[&"{}<]/g, (c) => `&#${c.charCodeAt(0)};`)}"` : k);
  }
  return `<${name}${attributes.map((a) => ` ${a}`).join('')}${VOID_TAGS.has(name) ? ' /' : ''}>`;
}

const PROSE_TOKENS = /\\[^\n]|(`+)[\s\S]*?(?<!`)\1(?!`)|<!--[\s\S]*?-->|<((?:https?:\/\/|mailto:)[^>\s]+)>|<\/?[A-Za-z][\w-]*(?:\s+[\w:-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*\s*\/?>|[<{}]/g;

// Each problem found is added to `problems`, which stops the build.
export function asContent(markdown, page, problems) {
  const prose = (text) => {
    // Inline links and images: the same rule.
    for (const [, url] of text.matchAll(/\]\(\s*<?([^\s)>]*)/g)) {
      if (!safeUrl(url)) problems.push(`${page.repo}/${page.path}: a link to ${url.split(':')[0]}: is not a web or site link`);
    }
    return escaped(text);
  };
  const escaped = (text) => text
    .replace(/^([ \t]*)(import|export)\b/gm, (_, indent, word) => `${indent}&#${word.charCodeAt(0)};${word.slice(1)}`)
    .replace(PROSE_TOKENS, (token, ticks, autolink) => {
      if (ticks || token.startsWith('\\') || token.startsWith('<!--')) return token;
      if (autolink) return `[${autolink.replace(/^mailto:/, '')}](${autolink})`;
      if (token.length > 1) return sanitiseTag(token, page, problems);
      return escapeText(token);
    });
  // Fenced code is copied as it is; everything between fences is prose.
  const parts = [];
  let fence = null;
  let chunk = [];
  const flush = () => {
    if (chunk.length) parts.push(prose(chunk.join('\n')));
    chunk = [];
  };
  for (const line of markdown.split('\n')) {
    const f = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      parts.push(line);
      if (f && line.trim().startsWith(fence)) fence = null;
    } else if (f) {
      flush();
      fence = f[1];
      parts.push(line);
    } else chunk.push(line);
  }
  flush();
  // Reference-style link definitions: the same rule as inline links (rewrite).
  for (const [, url] of markdown.matchAll(/^ {0,3}\[[^\]\n]+\]:\s*<?([^\s>]+)/gm)) {
    if (!safeUrl(url)) problems.push(`${page.repo}/${page.path}: a link to ${url.split(':')[0]}: is not a web or site link`);
  }
  return parts.join('\n');
}
