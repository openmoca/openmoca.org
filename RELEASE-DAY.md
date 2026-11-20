# Release day: switching the site to 0.7.0

Until 0.7.0 is released, the site describes it ahead of its release and names
0.6.0 as the current release. This file lists every place that changes on
release day.

## The one-line change

In [`release.json`](release.json), set `"released": true`.

`scripts/sync-docs.mjs` writes the release state into the site's own pages
wherever they say `@@release.<name>@@`:

| Token | Before release | After release |
| --- | --- | --- |
| `@@release.status@@` | "OpenMOCA 0.6.0 is the current release. 0.7.0 is in review, and these pages describe it ahead of its release." | "OpenMOCA 0.7.0 is the current release." |
| `@@release.suite@@` | "a public conformance suite" | "411 public conformance tests" (`corpusCases`) |
| `@@release.readers@@` | "open Readers in several languages" | "Readers in TypeScript, .NET and Python" |
| `@@release.version@@`, `@@release.current@@` | 0.7.0, 0.6.0 | 0.7.0, 0.7.0 |

Before switching, confirm `corpusCases` against the released corpus
(`conformance/cases.json` at `v0.7.0`), and that all three Readers pass it.

The pages that use the tokens:

- `src/site-pages/index.mdx`: the status and the "built in the open" section
- `src/site-pages/about.md`: the status and the pitch
- `src/site-pages/releases.md`: the status line
- `src/site-pages/spec/index.mdx`: the conformance corpus

## The pins

In [`.github/workflows/build.yml`](.github/workflows/build.yml), every
`MOCA_*_REF` becomes its `v0.7.0` tag. `MOCA_SPEC_REF` points at the
`draft/0.7.0-site-docs` commit while that pull request is in review.
`MOCA_EXAMPLES_REF` stays at `v0.6.0` unless moca-examples releases 0.7.0.

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

- `src/site-pages/marks.md`: "Listings are coming soon". It stays until the
  listings exist.
- The talk slides (`public/talks/`) already say "Updated for OpenMOCA 0.7.0".
- Guides that say their output "was run with the 0.6.0 tools" record when the
  output was captured; they change in moca-spec when the output is re-run.
