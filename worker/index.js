// openmoca.org's Worker, in front of the static assets (wrangler.jsonc). It does three small things:
//
// 1. Markdown for agents. A request that prefers `text/markdown` in its Accept header gets the page's Markdown
//    (dist/<route>/index.md, written by scripts/write-markdown.mjs) instead of its HTML.
// 2. `Vary: Accept` on both versions, so a cache never hands HTML to an agent that asked for Markdown, or the reverse.
// 3. Permanent redirects for pages that moved.
// 4. Identifiers to their documents: a profile URI (w3id.org/moca/... redirects here) opens the profile's page.
//
// Everything else is the static site, unchanged.

const MOVED = {
  '/project/contact/': '/contact/',
  '/tools/mcp-dotnet/': '/tools/mcp/',
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const identifier = IDENTIFIERS[url.pathname] ?? IDENTIFIERS[url.pathname.replace(/\/$/, '')] ?? IDENTIFIERS[`${url.pathname}/`];
    if (identifier) return Response.redirect(new URL(identifier, url).href, 303);

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
    const type = response.headers.get('Content-Type') ?? '';
    return isPage || type.startsWith('text/html') ? varyOnAccept(response) : response;
  },
};
