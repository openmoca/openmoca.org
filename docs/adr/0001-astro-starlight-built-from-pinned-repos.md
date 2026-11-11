# 0001 — Astro and Starlight, built from the other repositories at pinned commits

- **Status:** Accepted
- **Date:** 2026-10-30
- **Deciders:** MOCA maintainer

## Context

openmoca.org is the front door to OpenMOCA: a landing page, the
specification, getting-started guides for each Reader, and links to every
repository and tool. The docs already live in the repositories they describe
(moca-spec's `spec/` and `docs/`, each Reader's and tool's README), and should
stay there, next to the code, versioned with it. Every repository's CI pins the
others to release tags or commits, never a branch.

The site is static and will be hosted on Cloudflare Pages. Later it gains
in-browser tools (validate, inspect and search a package with the TypeScript
Reader), so the stack must host interactive components. It is TypeScript, like
the reference Reader and the tools.

## Options

1. Astro with Starlight, its documentation theme.
2. VitePress.
3. Docusaurus.
4. Copy the docs into this repository.

## Decision

Astro with Starlight. It is Markdown-first; has static search (Pagefind, no
service), light and dark themes, a link validator, and a fully custom landing
page; and Astro islands give the in-browser tools a home in any framework.

The docs are **not** copied in. `sources.json` lists every page and where it
comes from; `scripts/sync-docs.mjs` reads each repository at the pin in
`.github/workflows/build.yml` and writes `src/content/docs/`, which is never
committed. Links to another listed page become site routes; links to any other
file in a repository go to GitHub at the pinned commit, so they match the text
shown.

The build fails on a broken internal link, a link to or name of a private
repository, and anything loaded from another host. Fonts are self-hosted.

## Consequences

- A docs change lands in its own repository, then reaches the site when the
  pin moves. The site always shows a known commit of every repository.
- Building the site needs the other repositories checked out beside it. In CI
  they are checked out at their pins; deploying to Cloudflare Pages will run
  from GitHub Actions for the same reason.
- Pages must start with a level-one heading, which becomes the title. GitHub's
  `#readme` anchors are dropped, since the page is the README.

## What would change this decision

A need for several documented versions side by side, which Starlight does not
do on its own; or a framework the in-browser tools cannot run in.
