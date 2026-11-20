---
title: About OpenMOCA
description: "Knowledge that travels with its context. OpenMOCA in one line, 30 seconds and two minutes; who maintains it, how it is governed, talks, and how to take part. An open standard under Apache-2.0."
template: splash
editUrl: false
---

**Knowledge that travels with its context.** OpenMOCA is the open standard
for portable, attributable and trustworthy knowledge. It keeps the creator
with their work, in any app, with or without AI. Anyone can read it,
implement it and build on it.

## OpenMOCA in one line

OpenMOCA keeps the creator with their work (their credits, sources and terms)
in any app, with or without AI.

## In 30 seconds

Apps now answer, summarise and chat using people's work, and the true creator
is getting lost. OpenMOCA is an open standard that keeps them with the work:
their name, the people who helped, the sources, and what they've ruled out.
Any app can read it, with or without AI. The audience can see who made
something, open the original, and choose apps that respect the creator. It
works for any kind of digital work, and it's free for anyone to use.

## In two minutes

Apps now answer, summarise and chat using people's work: a podcast, a book, a
course, a piece of research. And the true creator is getting lost.

The content may still be there, but important things go missing. The
creator's name. The people who contributed. The original sources. And the
creator's wishes about how the work may be used.

The audience has a problem too. They get an answer, a summary or a clip, but it
can be hard to see who made it, check the original or know what the creator
asked.

OpenMOCA is an open standard designed to address this.

It puts digital work into portable packages that carry the content alongside
its credits, sources, evidence and the creator's declared terms. Any app can
read them, with or without AI: a player, a reader, a search, a course, an
assistant.

Those terms let the creator rule things out: sending the work to third-party
AI providers, machine translation, or export. Training is never allowed by
default. They also carry audience ratings and rights.

The package is sealed and can be signed, so compatible software can check it
is unchanged and see who signed it. Citations can take people back to the
exact passage or moment in the original source.

Any developer can build software that reads or creates these packages.
OpenMOCA already has @@release.readers@@, backed by @@release.suite@@.

And we are being clear about the limits: terms are labels, not locks. The
standard cannot force an application to obey them. That's why we also have
the OpenMOCA Commitment: a company's signed, public promise that a named
application and version will honour creators' rules and people's own choices.

OpenMOCA is open for anyone to implement. We want it to work everywhere, not
just in one product or platform.

Our belief is simple: your work should keep its identity, its sources and its
terms wherever it goes.

## What the project is

The [Open Knowledge Format](https://github.com/GoogleCloudPlatform/open-knowledge-format)
(OKF) shapes knowledge for AI; MOCA is for the people who make and own it.
MOCA stands for Modular Ontology, Content & Attestation. A MOCA package wraps
an OKF bundle in a manifest that says who made the work, who owns it and on
what terms it may be used, with the original sources it came from, sealed by
one digest and optionally signed. A signature shows who said so, and no more.

- **The specification**: the package format, the Reader contract and
  interface, attestations and sidecar indexes, with a conformance corpus every
  Reader must pass.
- **Open Readers** that reach the same conclusions about every package.
- **Tools** to convert, check, sign and index packages, and an MCP server.
- **This site** and its examples, and [Try OpenMOCA](https://try.openmoca.org),
  a live demo.

Everything is open source under Apache-2.0 and developed in the open on
[GitHub](https://github.com/openmoca). For developers, [how OpenMOCA works](/docs/how-openmoca-works/)
is the place to start.

## Who maintains it

OpenMOCA is maintained by
**[PI & Mash Solutions Ltd](https://piandmash.com)**, a company registered in England and
Wales (number 17429224). PI & Mash holds the OpenMOCA trade mark on behalf of
the project. The standard does not depend on any product: anyone can implement a
Reader, and any Reader that passes the conformance corpus reads packages the
same way.

## How it is governed

Today one maintainer has the final say, with decisions recorded as public
decision records. The project plans to add co-maintainers and a lightweight
proposal process as it grows, and to work towards a 1.0 standard once the
format has settled and is used beyond its maintainer. See
[governance](/project/governance/) and the [roadmap](/project/roadmap/).

## Status

@@release.status@@ See the [release notes](/releases/).

## Talks

### Introduction to OpenMOCA, autumn 2026

Portable grounding for AI. Why knowledge for AI is often locked in one
pipeline and hard to check, and how OpenMOCA packages the knowledge, not the
pipeline: what a package is, what a Reader gives you, where search runs, and
the citation record behind every answer. Two live demos:
[Try OpenMOCA](https://try.openmoca.org) in the browser, and your own
assistant over MCP in Claude Desktop. Then where it works today, and how to
make your own package.

[Open the slides](/talks/introduction-to-openmoca/). Use the arrow keys, or
tap the right or left of a slide. Press **S** for the speaker notes, **O** for
every slide at once, and **F** for full screen.

## Take part

Ask a question or share a use case in
[Discussions](https://github.com/openmoca/moca-spec/discussions), propose a
change through [contributing](/project/contributing/), or
[get in touch](/contact/).
