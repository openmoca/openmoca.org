# 0002 — Host on Cloudflare Workers static assets

- **Status:** Accepted
- **Date:** 2026-10-30 (updated 2026-11-21: the Worker in front, one hostname)
- **Deciders:** MOCA maintainer

## Context

[ADR-0001](0001-astro-starlight-built-from-pinned-repos.md) builds the site as
static files for Cloudflare Pages. Cloudflare has since folded Pages into
Workers: new projects are created as Workers with static assets, and
`wrangler pages project create` now delegates to that. The site has no server
code, and the Phase 2 in-browser tools and public developer tools run on
Workers too.

## Options

1. Workers with static assets.
2. Force a classic Pages project.

## Decision

Option 1. `wrangler.jsonc` serves `dist/`, the site's own `404.html` for
unknown paths, and trailing-slash URLs. `npm run deploy` builds from the
pinned commits and uploads. ADR-0001 stands except that it says Pages.

A small Worker runs in front of the static files
([`worker/index.js`](../../worker/index.js), `run_worker_first`). It holds no
content and no state; it only:

- serves each page's Markdown to agents that ask for `text/markdown`;
- redirects moved pages (`zones.json`) and profile identifiers to their pages;
- sets the security headers on every response, and on each page a content
  security policy that allows its inline scripts by hash. The build writes the
  hashes (`scripts/csp-hashes.mjs`); `npm run check:site` checks every kind of
  page.

The site is served only at its custom domain, openmoca.org:
`workers_dev: false` and `preview_urls: false`, so no other hostname serves a
copy of it.

## Consequences

- Custom domains, Cloudflare Access and email routing work as they would with
  Pages.
- Deploys run from a maintainer's machine today. A CI deploy job is ready in
  `.github/workflows/deploy.yml`, off until the maintainer turns it on.
- The Worker is code on every request, so it stays small, has tests through
  `npm run check:site`, and changes like any other code.
- No preview URL for a branch: a change is checked locally, through the
  Worker (`npm run preview`), before it merges.

## What would change this decision

The site needing per-branch preview deployments. Workers can give them, on
another hostname, but that would be a second public copy of the site, so it
would be a new decision.

## Updates

- **2026-11-21.** The decision said "no Worker script". The site has since
  gained the Worker in front (Markdown for agents, redirects, security
  headers), and turned off its workers.dev address and preview URLs.
