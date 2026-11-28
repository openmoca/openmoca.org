// openmoca.org's Worker, in front of the static assets (wrangler.jsonc). It does three small things:
//
// 1. Markdown for agents. A request that prefers `text/markdown` in its Accept header gets the page's Markdown
//    (dist/<route>/index.md, written by scripts/write-markdown.mjs) instead of its HTML.
// 2. `Vary: Accept` on both versions, so a cache never hands HTML to an agent that asked for Markdown, or the reverse.
// 3. Permanent redirects for pages that moved.
// 4. Identifiers to their documents: a profile URI (w3id.org/moca/... redirects here) opens the profile's page, and
//    the moca: vocabulary at /ns its page or, for a client that asks for text/turtle, /ns.ttl.
// 5. Security headers on every response, and on each page a content security policy that names its inline scripts by
//    hash (worker/generated/csp.json, written by scripts/csp-hashes.mjs at the end of the build).
//
// Everything else is the static site, unchanged.

import zones from '../zones.json';
import csp from './generated/csp.json';

// Pages that moved: the older moves here, and the 0.7.0 site's from zones.json (the build makes redirect pages from
// the same list, so the moves work on any static host too).
const MOVED = {
  '/project/contact/': '/contact/',
  '/tools/mcp-dotnet/': '/tools/mcp/',
  '/coming-in-0-7/': '/releases/',
  ...zones.moved,
};

// MOCA's identifiers are https://w3id.org/moca/<path>, which w3id redirects to https://openmoca.org/<path>. Schemas
// are files at their own paths. A profile URI names a profile, not a file, so it is sent to the profile's document
// (303 See Other: the URI identifies the profile; the page describes it). Files under it, such as the profile's
// schema, are served as they are.
const IDENTIFIERS = {
  '/profiles/ontology/v1': '/spec/profiles/ontology/',
  '/profiles/': '/spec/profiles/',
  '/schemas/v1/': '/spec/#schemas',
};

const NOT_FOUND_MD = `# Page not found

There is no page at this address on openmoca.org.

- Documentation: https://openmoca.org/docs/
- Every page, with a one-line description: https://openmoca.org/llms.txt
- Site map: https://openmoca.org/sitemap-index.xml
`;

// The q-value the Accept header gives a media type, or 0 when it is not listed. `*/*` does not count as asking for
// Markdown.
function quality(accept, type) {
  for (const part of accept.split(',')) {
    const [media, ...params] = part.trim().split(';');
    if (media.trim().toLowerCase() !== type) continue;
    const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
    return q ? Number(q.slice(2)) || 0 : 1;
  }
  return 0;
}

function wantsMarkdown(request) {
  const accept = request.headers.get('Accept') ?? '';
  const markdown = quality(accept, 'text/markdown');
  return markdown > 0 && markdown >= quality(accept, 'text/html');
}

function varyOnAccept(response, extra = {}) {
  const headers = new Headers(response.headers);
  const vary = headers.get('Vary');
  if (!vary || !/\baccept\b/i.test(vary)) headers.set('Vary', vary ? `Accept, ${vary}` : 'Accept');
  for (const [k, v] of Object.entries(extra)) headers.set(k, v);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

// On every response. The site is only served over HTTPS; browsers ignore HSTS on plain HTTP (a local preview).
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
};

// The page's policy: everything from this site, and inline only what the build hashed. Styles may be inline (Starlight,
// the diagrams and the talk set them); search runs WebAssembly ('wasm-unsafe-eval'); fonts and small images may be
// data: URIs. Only this site may frame a page: the talk's speaker view shows its own slides.
export function contentSecurityPolicy(route, status) {
  const page = csp.pages[status === 404 ? '/404.html' : route] ?? [];
  const hashes = [...csp.scripts, ...page].map((h) => `'${h}'`).join(' ');
  return [
    "default-src 'self'",
    `script-src 'self' 'wasm-unsafe-eval' ${hashes}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join('; ');
}

function secured(response, url) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);
  if ((headers.get('Content-Type') ?? '').startsWith('text/html')) {
    const route = url.pathname.replace(/\/index\.html$/, '/');
    headers.set('Content-Security-Policy', contentSecurityPolicy(route, response.status));
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env) {
    return secured(await respond(request, env), new URL(request.url));
  },
};

// The response before the security headers: identifiers, moved pages, Markdown for agents, then the static site.
async function respond(request, env) {
  const url = new URL(request.url);

  const identifier = IDENTIFIERS[url.pathname] ?? IDENTIFIERS[url.pathname.replace(/\/$/, '')] ?? IDENTIFIERS[`${url.pathname}/`];
  if (identifier) return Response.redirect(new URL(identifier, url).href, 303);

  // The moca: vocabulary (https://w3id.org/moca/ns redirects to /ns): Turtle for a client that asks for it, else the
  // page. 303 See Other: the URI names the vocabulary; each is a document about it.
  if (url.pathname === '/ns' || url.pathname === '/ns/') {
    const accept = request.headers.get('Accept') ?? '';
    const turtle = quality(accept, 'text/turtle');
    if (turtle > 0 && turtle >= quality(accept, 'text/html')) return varyOnAccept(Response.redirect(new URL('/ns.ttl', url).href, 303));
    if (url.pathname === '/ns' && !wantsMarkdown(request)) return varyOnAccept(Response.redirect(new URL('/ns/', url).href, 303));
  }

  const moved = MOVED[url.pathname] ?? MOVED[`${url.pathname}/`];
  if (moved) return Response.redirect(new URL(moved + url.search, url).href, 301);

  const isPage = !/\.[a-z0-9]+$/i.test(url.pathname);
  if (isPage && (request.method === 'GET' || request.method === 'HEAD') && wantsMarkdown(request)) {
    const path = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
    const md = await env.ASSETS.fetch(new Request(new URL(`${path}index.md`, url), { method: request.method }));
    if (md.ok) return varyOnAccept(md, { 'Content-Type': 'text/markdown; charset=utf-8' });
    return new Response(request.method === 'HEAD' ? null : NOT_FOUND_MD, {
      status: 404,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8', Vary: 'Accept' },
    });
  }

  const response = await env.ASSETS.fetch(request);
  // JSON Schemas, as their media type, readable from any origin so validators can fetch them.
  if (url.pathname.endsWith('.schema.json') && response.ok) {
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'application/schema+json');
    headers.set('Access-Control-Allow-Origin', '*');
    return new Response(response.body, { status: response.status, headers });
  }
  // The moca: vocabulary as Turtle, readable from any origin.
  if (url.pathname === '/ns.ttl' && response.ok) {
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'text/turtle; charset=utf-8');
    headers.set('Access-Control-Allow-Origin', '*');
    return new Response(response.body, { status: response.status, headers });
  }
  const type = response.headers.get('Content-Type') ?? '';
  return isPage || type.startsWith('text/html') ? varyOnAccept(response) : response;
}
