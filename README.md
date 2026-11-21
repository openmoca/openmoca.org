# openmoca.org

The OpenMOCA website: the landing page, the specification, getting-started
guides for each Reader, and links to every OpenMOCA repository and tool.

The site holds almost no content of its own. Every page comes from another
OpenMOCA repository, read at a pinned commit, so the docs live beside the code
they describe ([ADR-0001](docs/adr/0001-astro-starlight-built-from-pinned-repos.md)).

## How it is built

- [`sources.json`](sources.json) lists every page: which repository, which
  file, and where it goes on the site. A file that is not listed is not on the
  site; links to it go to GitHub instead.
- [`scripts/sync-docs.mjs`](scripts/sync-docs.mjs) copies those files into
  `src/content/docs/` (generated, never committed). It takes each page's first
  heading as its title and rewrites links: to another listed page, the site's
  route; to any other file, GitHub at the pinned commit.
- Decision records and working plans are never on the site, nor linked from
  it: they belong in the repositories. `sources.json` lists them under
  `hidden`, and the sync removes links to them (a citation such as
  "(ADR-0008)" goes; other links become plain text).
- The pins are the `MOCA_*_REF` values at the top of
  [`.github/workflows/build.yml`](.github/workflows/build.yml): full commit
  SHAs, with the release tag in a comment. The sync refuses a tag or a branch.
- Pages from other repositories are content, never code
  ([`scripts/as-content.mjs`](scripts/as-content.mjs)): their HTML is cut down
  to a short list of tags and attributes, links go only to the web, email or
  this site, and anything MDX would run is escaped.
- The site's own pages are in `src/site-pages/`. The site has two zones, set in
  [`zones.json`](zones.json): the main site (home, creators, audience,
  developers, organisations, FAQs, the Commitment and Conformant, about, ways
  to try), full width with a top navigation bar (`src/components/Header.astro`),
  and the docs, with the sidebar. Both share the theme, the head and one
  footer. Pages that moved are in `zones.json` too: the Worker answers them
  with a permanent redirect, and the build writes a redirect page for each.
- The Directory's two lists, the OpenMOCA Commitment and OpenMOCA Conformant,
  are data: `src/directory/commitment.json` and `conformant.json`, each with a
  JSON Schema beside it. The sync checks them (an invalid entry stops the
  build), publishes them at `/directory/<name>.json`, and the pages are built
  from them.
- The release state is one setting, `released` in [`release.json`](release.json):
  the sync writes it into the site's own pages. [RELEASE-DAY.md](RELEASE-DAY.md)
  lists everything that changes on release day.
- [Astro](https://astro.build) and [Starlight](https://starlight.astro.build)
  build static files into `dist/`. Then
  [`scripts/external-links.mjs`](scripts/external-links.mjs) makes every link
  to another site open in a new tab, and say so. The build fails on a broken internal link,
  on any link to or name of a private repository, and on anything loaded from
  another host.

The look is the OpenMOCA brand kit: the logos and icons in `public/brand/`,
the colour tokens in `src/styles/`, mapped onto Starlight in
`src/styles/starlight-theme.css`. The site starts light; dark is offered.

## Develop

You need Node.js 22 or later, and the other OpenMOCA repositories checked out
beside this one: moca-spec, moca-reader-typescript, moca-reader-dotnet,
moca-tools, moca-mcp-dotnet, moca-convert and moca-examples.

```sh
npm install
npm run dev           # the siblings as they are, live at http://localhost:4321
npm run build:local   # a production build from the siblings as they are
npm run build         # a production build from the pinned commits, as CI does
npm run preview       # serve dist/ through the Worker, at http://localhost:8787
npm test              # the sync's rules for pages from other repositories
npm run check:site    # against the preview: headers and policy on every kind of page
```

`npm run check:site` also opens each kind of page in a browser, and reports
any policy violation or script error, when Playwright is installed:
`npm i --no-save playwright && npx playwright install chromium`.

A build ends by checking that the site names no private project. The names are
not kept here: set `MOCA_PRIVATE_NAMES` (comma-separated) or keep them in a
git-ignored `.private-names` file, one per line. Without either, the build
stops.

`npm run dev` reads your sibling checkouts as they are, so you can edit a
repository's docs and see them on the site. CI builds from the pins.

## Deploy

The site runs on Cloudflare as static assets on Workers
([ADR-0002](docs/adr/0002-cloudflare-workers-static-assets.md)), with a small
Worker in front ([`worker/index.js`](worker/index.js)): Markdown for agents,
redirects, and the security headers. Each page's content security policy names
its inline scripts by hash; the build writes the hashes
(`scripts/csp-hashes.mjs`), so no page needs `'unsafe-inline'` for scripts.
`wrangler.jsonc` says what to serve: `dist/`, the site's own 404 page, and
URLs with a trailing slash. With the other repositories checked out at their
pins and `wrangler login` done:

```sh
npm run deploy   # builds from the pinned commits, then uploads dist/
```

Until the repositories are public, deploys run from a maintainer's machine; a
GitHub Actions deploy job follows at release.

## How it is made

Built with the help of AI assistants; every change is reviewed and accepted by the maintainer.

## Licence

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

OpenMOCA™ is a trade mark of PI & Mash Solutions Ltd. The licence covers the
code, not the name: see the
[trade mark policy](https://github.com/openmoca/moca-spec/blob/main/TRADEMARKS.md).
