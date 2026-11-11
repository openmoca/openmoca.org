---
title: About OpenMOCA
description: What OpenMOCA is, who maintains it, how it is governed, and how to take part. An open standard for portable grounding for AI, under Apache-2.0.
editUrl: false
---

**OpenMOCA is an open standard for portable grounding for AI.** MOCA stands for
Modular Ontology, Content & Attestation. A MOCA package carries the knowledge an
AI system answers from, how it is organised, and the original sources it came
from, sealed by one digest and optionally signed. Open Readers in TypeScript,
.NET and Python read, verify, search and cite it the same way, on a server or
offline. See [why MOCA](/docs/why-moca/) for the problem it solves.

## What the project is

- **The specification**: the package format, the Reader contract and interface,
  attestations and sidecar indexes, with a conformance corpus every Reader
  must pass.
- **Three Readers**, in TypeScript, .NET and Python, that reach the same
  conclusions about every package.
- **Tools** to convert, check, sign and index packages, and an MCP server.
- **This site** and its examples, and [Try OpenMOCA](https://try.openmoca.org),
  a live demo.

Everything is open source under Apache-2.0 and developed in the open on
[GitHub](https://github.com/openmoca).

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

## Take part

Ask a question or share a use case in
[Discussions](https://github.com/openmoca/moca-spec/discussions), propose a
change through [contributing](/project/contributing/), or
[get in touch](/contact/).
