---
title: Short answers
description: "Short answers about OpenMOCA: what it is, what a MOCA package is, how a creator's terms travel, the OpenMOCA Commitment, checking where an answer came from, and machine-made content."
template: splash
editUrl: false
head:
  - tag: title
    content: "OpenMOCA: short answers for creators and people | OpenMOCA"
---

Questions developers ask, about RAG, vector stores, OKF and MCP, are in the
[technical FAQ](/docs/faq/).

## What is OpenMOCA?

OpenMOCA is an open standard that keeps the creator with their work (their
credits, sources and terms) in any app, with or without AI. Audiences can see
who made something, open the original, and choose apps that respect the
creator.

## What is a MOCA package?

A MOCA package holds a piece of digital work with its credits, its sources and
the creator's terms, sealed so that any change shows. It can be signed, to
show who stands behind it. It travels as one `.moca` file.

## Why does OpenMOCA exist?

So that work can move between apps without losing who made it, where it came
from and what its creator asked. It gives creators, people and software one
shared way to carry that.

## Who is OpenMOCA for?

Creators who want their credits, sources and terms to travel with their work;
audiences who want to know who made something and go to the source;
developers who make apps and tools that read it; and organisations whose
knowledge needs to be checked ([developers](/developers/),
[organisations](/organisations/)).

## What kinds of work can be in a MOCA package?

Any kind of digital work: podcasts, books, courses, video, research, guides
and documentation. OpenMOCA is not tied to one industry.

## How do a creator's terms travel with their work?

Inside the package, as part of what is signed, so every copy carries them. A
Reader shows them exactly as written, says who signed them, and applies them
when an app asks ([the creator's terms](/docs/guides/creators-terms/)).

## What can creators say about AI use?

Creators can rule out uses: sending the work to third-party AI providers,
machine translation, or export, and, if they want, AI in the app's own service
or on the person's device. Training is never allowed by default. In this
version a package can only make the defaults stricter.

## Can creators set different terms for different parts of a work?

Yes. Terms can be set for the whole work and for parts of it. When an app
asks, the strictest applicable answer wins; where nothing is set, the
platform default applies; and the Reader records which level decided: the
platform, the package, the part, a package that contains it, or the app.

## Can OpenMOCA stop an app ignoring a creator's terms?

No. Terms are labels, not locks. OpenMOCA keeps them attached to the work so
apps can read them, and helps apps apply them. An app that ignores them can
still break them. Apps that make the OpenMOCA Commitment promise publicly not
to.

## What is the OpenMOCA Commitment?

A company's signed, public promise that a named app and version honours
creators' terms and people's own choices. OpenMOCA lists it; it does not test
it. Anyone can hold the company to it
([the OpenMOCA Commitment](/commitment/)).

## What is OpenMOCA Conformant?

A listing for software, such as a Reader, that passes the OpenMOCA test suite
for what it is, for a named version. It is a test result, not a promise about
an app ([OpenMOCA Conformant](/conformant/)).

## How can I check where an AI answer came from?

In an app that reads MOCA packages, each answer cites the work it used. Where
the package carries what it needs, the citation opens the original at the
passage or the moment.

## How does OpenMOCA mark machine-made content?

A package can say which parts a machine made, with the model's name and
version, and which parts a person checked. These are declarations by whoever
made the package; OpenMOCA does not detect machine-made content
([machine-made content](/docs/guides/machine-made/)).

## Does OpenMOCA change a creator's original files?

No. Packaging never changes the creator's original files. A package carries
the work, or points to the original, beside them.

## Does OpenMOCA need AI?

No. Any app can read a package: a podcast player, an e-book reader, a search,
a course. AI is why it matters now, because apps answer, summarise and chat
using people's work, and the true creator is getting lost.

## Is OpenMOCA free and open?

Yes. The specification and the project's own Readers and tools are open
source under Apache-2.0, and anyone can implement the standard without asking.
There are @@release.readers@@, and @@release.suite@@ anyone can run. Other
people's apps and tools have their own licences
([the specification](/spec/), [GitHub](https://github.com/openmoca)).
