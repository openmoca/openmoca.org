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
its credits, sources, evidence and the creator's declared wishes. Any app can
read them, with or without AI: a player, a reader, a search, a course, an
assistant.

Those wishes let the creator rule things out: sending the work to third-party
AI providers, machine translation, or export. Training is never allowed by
default. They also carry audience ratings and rights.

The package is sealed and can be signed, so compatible software can check it
is unchanged and see who signed it. Links can take people back to the
exact passage or moment in the original source.

Any developer can build software that reads or creates these packages.
OpenMOCA already has @@release.readers@@, backed by @@release.suite@@.

And we are being clear about the limits: it is a label, not a lock. The
standard cannot force an application to obey the creator's wishes. That's why we also have
the OpenMOCA Commitment: a company's signed, public promise that a named
application and version will honour creators' rules and people's own choices.

OpenMOCA is open for anyone to implement. We want it to work everywhere, not
just in one product or platform.

Our belief is simple: your work should keep its identity, its sources and its
terms wherever it goes.

## What the project is

OpenMOCA builds on the
[Open Knowledge Format](https://github.com/GoogleCloudPlatform/open-knowledge-format),
which shapes knowledge for AI. OpenMOCA is for the people who make and own
that knowledge. A package says who made the work, who owns it and what they
wish, with the sources it came from, sealed so that any change shows. A
signature shows who said so, and no more.

- **The specification**: the rules for a package, and for the software that
  reads one, with public tests anyone can run ([the specification](/spec/)).
- **Free libraries** that read packages the same way, whatever the app.
- **Tools** to make, check and sign packages, and a server that connects them
  to AI assistants.
- **This site**, and [Try OpenMOCA](https://try.openmoca.org), a live demo.

Everything is open source under Apache-2.0 and made in the open on
[GitHub](https://github.com/openmoca). For developers,
[how OpenMOCA works](/docs/how-openmoca-works/) is the place to start.

## Who maintains it

OpenMOCA is maintained by
**[PI & Mash Solutions Ltd](https://piandmash.com)**, a company registered in England and
Wales (number 17429224). PI & Mash holds the OpenMOCA trade mark on behalf of
the project. The standard does not depend on any product: anyone can build
software that reads packages, and any software that passes the public tests
reads them the same way.

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

Why knowledge for AI is often stuck in one system and hard to check, and how
OpenMOCA keeps it portable and checkable. Two live demos:
[Try OpenMOCA](https://try.openmoca.org) in the browser, and an AI assistant
on your own computer. Then where it works today, and how to make your own
package.

[Open the slides](/talks/introduction-to-openmoca/). Use the arrow keys, or
tap the right or left of a slide. Press **S** for the speaker notes, **O** for
every slide at once, and **F** for full screen.

## Take part

Ask a question or share a use case in
[Discussions](https://github.com/openmoca/moca-spec/discussions), propose a
change through [contributing](/project/contributing/), or
[get in touch](/contact/).
