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
  [`.github/workflows/build.yml`](.github/workflows/build.yml): release tags,
  or commits, never a branch.
- The site's own pages (the landing page) are in `src/site-pages/`.
- [Astro](https://astro.build) and [Starlight](https://starlight.astro.build)
  build static files into `dist/`. The build fails on a broken internal link,
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
npm run preview       # serve dist/
```

A build ends by checking that the site names no private project. The names are
not kept here: set `MOCA_PRIVATE_NAMES` (comma-separated) or keep them in a
git-ignored `.private-names` file, one per line. Without either, the build
stops.

`npm run dev` reads your sibling checkouts as they are, so you can edit a
repository's docs and see them on the site. CI builds from the pins.

## Deploy

The site runs on Cloudflare as static assets on Workers, with no Worker code
([ADR-0002](docs/adr/0002-cloudflare-workers-static-assets.md)).
`wrangler.jsonc` says what to serve: `dist/`, the site's own 404 page, and
URLs with a trailing slash. With the other repositories checked out at their
pins and `wrangler login` done:

```sh
npm run deploy   # builds from the pinned commits, then uploads dist/
```

Until the repositories are public, deploys run from a maintainer's machine; a
GitHub Actions deploy job follows at release.

## Licence

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

OpenMOCA™ is a trade mark of PI & Mash Solutions Ltd. The licence covers the
code, not the name: see the
[trade mark policy](https://github.com/openmoca/moca-spec/blob/main/TRADEMARKS.md).
