---
title: Release notes
description: "What is new in OpenMOCA 0.7.0: the creator's terms, credits, machine-made content, encrypted packages, composite packages, media, and OpenMOCA Conformant and the OpenMOCA Commitment."
editUrl: false
---

@@release.status@@ The full list of changes is in the
[changelog](/project/changelog/), and what to change when you upgrade is in
[migrations](/project/migrations/).

## OpenMOCA 0.7.0

### In short

A creator's credits, sources and terms now travel with their work. A package
can say who made the work, what AI use the creator rules out, how suitable it
is, and who holds the rights. A Reader carries all of it to every answer, and
applies the terms when an app asks. Apps that honour them can say so, publicly,
with the OpenMOCA Commitment.

### For creators

- **The creator's terms.** A package can rule out AI on the device, in the
  app's own service or with third-party providers, and machine translation and
  export. Training is never allowed by default. Terms can differ for parts of
  a work, and a part can only be stricter. Terms cover everything an app
  hands to a model, not only the passages it quotes. Terms are labels, not
  locks ([the creator's terms](/docs/guides/creators-terms/),
  [package specification §4.14](/spec/package/#414-terms)).
- **Hiding a closed work from a model.** By default, a model the creator ruled
  out may still be told a work's title and publisher, so it can say why it
  cannot answer from it. `ai.allowed.mention: false` tells apps not to mention
  the work to that model at all. It cannot stop a model that already knows
  the work, and it never changes what an app shows people
  ([the creator's terms](/docs/guides/creators-terms/#ai-use-ai)).
- **Credits.** The publisher and the contributors, with their roles; a part
  can credit its own, such as an episode's guest
  ([credits and dates](/docs/guides/credits-and-dates/),
  [package specification §4.13](/spec/package/#413-credits)).
- **Licence and copyright for each part**, and the creator's own message
  beside the work (`rights.notice`).
- **Dates.** When the work was first published (`datePublished`), and when
  this version of the package was made (`datePackaged`)
  ([package specification §4.12](/spec/package/#412-publication-and-packaging-dates)).
- **Machine-made content.** A package can say which parts a machine made,
  with which model, and which parts a person checked
  ([machine-made content](/docs/guides/machine-made/)).
- **Protected sources.** Package them sealed, for the people you choose, or as
  references that only point to the original
  ([protected sources](/docs/guides/protected-sources/)).

### For the audience and apps

- **Answers that say who decided.** When an app asks a Reader to apply terms,
  each answer records which level decided each term: the platform default,
  the package, the part, a composing package or the app
  ([Reader contract §15](/spec/reader-contract/#15-creators-terms)).
- **One rule for everything a model receives.** The terms gate covers
  records, structure labels and definitions, text sent for embedding, and
  what a model is told about each package
  ([Reader contract §15.4](/spec/reader-contract/#154-the-terms-gate)).
- **Showing terms honestly.** Apps keep apart what the creator declared, who
  signed it, what the app enforces and what the app says about itself
  ([showing terms honestly](/docs/guides/showing-terms/)).
- **OpenMOCA Conformant and the OpenMOCA Commitment.** Two public listings:
  software that passes the test suite for what it is, and apps whose makers
  sign a public promise to honour creators' terms and people's own choices.
  Both are listed in [the Directory](/directory/)
  ([OpenMOCA Conformant](/directory/conformant/),
  [the OpenMOCA Commitment](/directory/commitment/)).

### For developers

- **Distribution tiers.** A publisher states, and signs, whether a package is
  meant to travel open, only encrypted or only through a service
  ([package specification §4.1](/spec/package/#41-properties)).
- **Encrypted packages.** A signed package in an age envelope, `.mocae`, with
  a readable outline ([encrypted packages](/spec/encrypted-package/),
  [guide](/docs/guides/encryption/)).
- **Issued copies.** A licensee's marked copy keeps the publisher's
  signatures, binds the publisher's index, and matches a composite package's
  pins ([attestations §7.1](/spec/attestations/#71-issued-copies-two-passes)).
- **Composite packages.** A package whose members are packages: a podcast of
  seasons and episodes, a book series, a course of sections and lessons. It
  files its parts under its own topics, and limits search to "up to this
  episode" or "up to this lesson"
  ([package specification §7.3](/spec/package/#73-composite-packages)).
- **Hosted and alternate media.** Audio and video described, never fetched,
  with their length and transcript; audio and video versions lined up stretch
  by stretch, ads and all ([package specification §5.7](/spec/package/#57-media)).
- **Refined time ranges.** A time range can name the words spoken in it; a
  Reader checks them against the captions and returns the exact moment
  ([Reader contract §7](/spec/reader-contract/#7-citation-records)).
- **Terms on everything handed to a model.** A package is **closed** for a
  terms request when its package-level terms fail the `ai` gate for the
  destination; a closed package with `ai.allowed.mention: false` is
  **hidden**. `Library.catalogue` names a closed package with exactly `id`,
  `version`, `title`, the publisher's name, `signed` and `closedBy`, and a
  hidden one not at all (`catalogue-entry.schema.json`). `Library.structureFor`
  builds structure only from packages open for the request, and ingest takes a
  terms request, so closed text is never embedded or stored. `U004` gains
  `excluded` and `hidden` counts
  ([Reader contract §15.4](/spec/reader-contract/#154-the-terms-gate),
  [Reader interface](/spec/reader-interface/)).
- **Filters before the limit.** A search returns the best records among all
  that pass its filters, however far down the unfiltered ranking they are
  ([Reader contract §9.2](/spec/reader-contract/#92-the-pipeline-and-the-gate)).
- **Images, translated titles and tags**, and an **apps** hint
  ([package specification §4.6 to §4.9](/spec/package/#46-images)).
- **Media types.** `.moca`, `.mocae` and `.mocai`, each with its own media type
  ([package specification §12.1](/spec/package/#121-media-types)).

### Breaking changes

- `publisher` is an object with a `name`, not a string. The string form fails
  the schema ([migrations](/project/migrations/)).
- Content a store embedded before 0.7.0 may include text a creator closed to
  the embedder's destination. Ingest again with a terms request, or remove
  the closed packages' records ([migrations](/project/migrations/)).
- `.mocae` replaces `.moca.enc`, and `.mocai` replaces `.moca.idx.zip`. Files
  with the old names still read, because Readers go by content.

Every Reader that passes the conformance corpus reaches the same conclusions
about every package. The corpus is
[published with the specification](/spec/conformance/).
