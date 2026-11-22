# Release day: OpenMOCA 0.7.0

This version of the site is written as released (owner, 2026-11-20):
`release.json` has `"released": true`, so every page says 0.7.0 is the current
release. It only goes live when `release-0.7.0` merges to `main`, so nothing
is published early. This file lists what to confirm on the day, and every
place the release state touches.

## Confirm on the day

- [ ] **The test count.** `corpusCases` in [`release.json`](release.json) is
  486, the cases in `conformance/cases.json` in moca-spec at `release-0.7.0`
  (`bdb68a3`, with ADR-0041), and each Reader's 0.7.0 test run passes all
  486. Check it
  against the released corpus (`conformance/cases.json` at `v0.7.0`).
- [ ] **The three libraries.** The pages say there are free libraries (Readers)
  in TypeScript, .NET and Python. Check that all three pass every 0.7.0 case:
  the .NET and Python Readers were still being brought to 0.7.0 when this was
  written.
- [ ] **The demo.** Before publishing, check try.openmoca.org shows 0.7.0, the
  welcome panel and the tour (session E). Every "Try it" button on the home
  page and the top bar goes straight there.
- [ ] **The Commitment list** (`src/directory/commitment.json`): the demo is
  listed as `"status": "pending"` (statement published, signature to follow),
  under its own heading and without the Commitment mark. When PI & Mash's
  statement is signed and published, and the demo honours the rules
  (session E), set `"status": "made"`, add the statement's `url`, set
  `"signed": true`, remove `"toFollow"`, and raise the list's `version`.
- [ ] **The Conformant list** (`src/directory/conformant.json`): confirm green on
  the day, each at 0.7.0 against the 0.7.0 tests, and remove any that is not:
  - [ ] the TypeScript Reader (`@openmoca/moca-core`)
  - [ ] the .NET Reader (`OpenMoca.Reader`)
  - [ ] the Python Reader (`moca-reader`)

  Each entry's `suite` says 486 of 486 (list version 1.1.0, 2026-11-21): the
  TypeScript Reader at `81188bc` in moca-spec's CI at `bdb68a3`, the .NET
  Reader at `786ff2f` in its own CI, and the Python Reader at `7f8d583`, run
  against `bdb68a3`. Confirm again against `v0.7.0`.
- [ ] **The lists' dates.** Set `released`, `updated` and each entry's `date` in
  both files to the release day, with an offset. Raise a list's `version` on
  every later change. The build checks both files against their schemas.
- [ ] **The pins.** Every `MOCA_*_REF` in
  [`.github/workflows/build.yml`](.github/workflows/build.yml) becomes the
  commit its `v0.7.0` tag points to (below).
- [ ] **The site check.** Build, serve it (`npm run preview`) and run
  `npm run check:site`; after the deploy, run
  `node scripts/check-site.mjs https://openmoca.org`.

If either count is not right on the day, change `corpusCases`, or the
`readers` line in `scripts/sync-docs.mjs`, before merging.

## The release switch

`scripts/sync-docs.mjs` writes the release state into the site's own pages
wherever they say `@@release.<name>@@`. `"released": false` brings back the
in-review wording, if the release slips:

| Token | `"released": true` (now) | `"released": false` |
| --- | --- | --- |
| `@@release.status@@` | "OpenMOCA 0.7.0 is the current release." | "OpenMOCA 0.6.0 is the current release. 0.7.0 is in review, and these pages describe it ahead of its release." |
| `@@release.suite@@` | "486 public tests" (`corpusCases`) | "a public test suite" |
| `@@release.readers@@` | "free libraries in TypeScript, .NET and Python" | "free libraries in several programming languages" |
| `@@release.version@@`, `@@release.current@@` | 0.7.0, 0.7.0 | 0.7.0, 0.6.0 |

The pages that use the tokens:

- `src/site-pages/index.mdx`: the status, under "Open and honest"
- `src/site-pages/developers.mdx`: what you get
- `src/site-pages/answers.md`: "Is OpenMOCA free and open?"
- `src/site-pages/releases.md`: the status line
- `src/site-pages/spec/index.mdx`: the conformance corpus

## The pins

In [`.github/workflows/build.yml`](.github/workflows/build.yml), every
`MOCA_*_REF` becomes the full commit SHA its `v0.7.0` tag points to, with the
tag in a comment: a tag can move, a commit can't, and the sync refuses
anything else. `MOCA_MCP_DOTNET_REF` points at the head of moca-mcp-dotnet's
`draft/0.7.0-terms-gate-coverage` (pull request #13) while it is in review,
so the MCP page says what the server hands an assistant and withholds; move it
to the `release-0.7.0` merge, then to `v0.7.0`. `MOCA_EXAMPLES_REF` stays at the commit
of `v0.6.0` unless moca-examples releases 0.7.0. To find a tag's commit:
`git rev-parse 'v0.7.0^{commit}'`.

## True from the moment v0.7.0 is tagged

These come from the other repositories at their pins, already written for the
release. They need no change, but they only work once the tags and release
files exist:

- The getting-started guides (`start/typescript`, `start/dotnet`,
  `start/python`): downloads from `releases/download/v0.7.0/` and
  `git clone --branch v0.7.0`.
- The walkthrough and the conformance page: `git clone --branch v0.7.0`, and
  the link to the `v0.7.0` release.
- The FAQ ("It is at 0.7.0") and Why MOCA ("MOCA is at 0.7.0").
- Each specification page's "Specification version: `0.7.0`", and each
  Reader's "Contract version 0.7.0".

## Leave as they are

- The Directory lists only what is confirmed: nothing says "coming soon".
- The talk slides (`public/talks/`) already say "Updated for OpenMOCA 0.7.0".
- Guides that say their output "was run with the 0.6.0 tools" (the
  walkthrough, authoring, signing and review, structure, search and indexes)
  record when the output was captured; they change in moca-spec when the
  output is re-run with the 0.7.0 tools.
- History stays: the release notes, the changelog and the migration notes name
  0.6.0 where they describe what changed since it.
