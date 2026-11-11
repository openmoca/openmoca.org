# 0002 — Host on Cloudflare Workers static assets

- **Status:** Accepted
- **Date:** 2026-10-30
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

Option 1. `wrangler.jsonc` serves `dist/` with no Worker script, the site's
own `404.html` for unknown paths, and trailing-slash URLs. `npm run deploy`
builds from the pinned commits and uploads. ADR-0001 stands except that it
says Pages.

## Consequences

- Custom domains, Cloudflare Access and email routing work as they would with
  Pages.
- Until the repositories are public, deploys run from a maintainer's machine,
  because the build reads the sibling repositories.

## What would change this decision

The site needing per-branch preview deployments that Workers do not provide.
