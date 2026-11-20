---
title: Short answers
description: "Short answers about OpenMOCA: what it is, what a MOCA package is, how a creator's wishes travel, the OpenMOCA Commitment, checking where an answer came from, and machine-made content."
template: splash
editUrl: false
head:
  - tag: title
    content: "OpenMOCA: short answers for creators and their audience | OpenMOCA"
---

<div class="lead">

Short, plain answers about OpenMOCA, for creators, their audience and anyone
meeting it for the first time.

</div>

Technical questions, about AI search, MCP and the formats OpenMOCA builds on,
are in the [technical FAQ](/docs/faq/).

## What is OpenMOCA?

OpenMOCA is an open standard that keeps the creator with their work (their
credits, sources and wishes) in any app, with or without AI. The audience can
see who made something, open the original, and choose apps that respect the
creator.

## What is a MOCA package?

A MOCA package is the file OpenMOCA keeps a work in: one piece of digital work
with its credits, its sources and the creator's wishes. It is sealed, so any change shows. It can be signed, to
show who stands behind it. It travels as one `.moca` file.

## Why does OpenMOCA exist?

So that work can move between apps without losing who made it, where it came
from and how its creator wants it shared, shown and used. It gives creators, their audience and app
makers one shared way to carry that.

## Who is OpenMOCA for?

Creators who want their credits, sources and wishes to travel with their work.
The audience, who want to know who made something and go to the source.
Developers who make apps and tools. And organisations whose knowledge needs to
be checked ([Creators](/creators/), [Audience](/audience/),
[Developers](/developers/), [Organisations](/organisations/)).

## What kinds of work does OpenMOCA work with?

Any kind of digital work: podcasts, books, courses, video, research, guides
and documentation. OpenMOCA is not tied to one industry.

## How do a creator's wishes travel with their work?

They are sealed in with the work, so every copy carries them. Any app can show them exactly as the creator wrote them, show who signed
them, and follow them ([the creator's terms](/docs/guides/creators-terms/)).

## What can creators say about AI use?

Creators can rule things out: sending the work to AI from other companies,
machine translation, or copying the text out of the app. If they want, they
can rule out AI in the app itself, or on the person's own device. Training AI
on the work is never allowed by default. In this version, creators can only
make the defaults stricter.

## Can creators set different wishes for different parts of a work?

Yes. Wishes can be set for the whole work and for parts of it. When the work,
a part of it and the app disagree, the strictest answer wins. Where nothing
is set, the standard default applies. The app can show which one decided.

## Does OpenMOCA replace AI opt-outs on my website?

No, it sits beside them. You may already tell AI crawlers what they may do,
on your own website, with the TDM Reservation Protocol, the IETF AI
preferences vocabulary or RSL. Those stay on your website. OpenMOCA keeps your
wishes with the work itself, so they are still there when it is copied. You
can state the same wishes in both places
([the creator's terms](/docs/guides/creators-terms/#beside-what-you-already-use)).

## Can OpenMOCA stop an app ignoring a creator's wishes?

No. It is a label, not a lock. OpenMOCA keeps the creator's wishes attached to
the work, so apps can read them and follow them. An app that ignores them can
still break them, and nothing can take back a copy once it is made. What
OpenMOCA does is make the wishes visible, so people can check them and choose
apps that respect them. Apps that make the OpenMOCA Commitment promise
publicly to do so ([trust and provenance](/docs/trust-and-provenance/)).

## What is the OpenMOCA Commitment?

A company's signed, public promise that a named app, in a named version,
respects how creators want their work shared, shown and used, and people's
own choices. OpenMOCA lists it; it does not
test it. Anyone can hold the company to it
([the OpenMOCA Commitment](/commitment/)).

## What is OpenMOCA Conformant?

A listing for software, such as a library that reads OpenMOCA, that passes
the public OpenMOCA tests. It is a test result, not a promise about an app
([OpenMOCA Conformant](/conformant/)).

## How can I check where an AI answer came from?

In an app that reads OpenMOCA, each answer names the work it used. Where the
creator has included the original, a link opens it at the passage or the
moment.

## How does OpenMOCA mark what a machine made?

A creator can say which parts a machine made, with the name and version of
the AI model, and which parts a person checked. These are statements by
whoever made them. OpenMOCA does not detect machine-made content
([machine-made content](/docs/guides/machine-made/)).

## Does OpenMOCA change a creator's original files?

No. OpenMOCA never changes the creator's original files. It carries the work,
or points to the original, beside them.

## Does OpenMOCA need AI?

No. Any app can read OpenMOCA: a podcast player, an e-book reader, a search,
a course. AI is why it matters now, because apps answer, summarise and chat
using people's work, and the true creator is getting lost.

## Is OpenMOCA free and open?

Yes. The specification and the project's own libraries and tools are open
source under Apache-2.0. Anyone can build on the standard without asking.
There are @@release.readers@@, and @@release.suite@@ anyone can run. Other
people's apps and tools have their own licences
([the specification](/spec/), [GitHub](https://github.com/openmoca)).
