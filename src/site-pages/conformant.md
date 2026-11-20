---
title: OpenMOCA Conformant
description: "OpenMOCA Conformant: a public listing of software that passes the OpenMOCA test suite for what it is, a Reader, a Producer or a linter, with its standing: Official, Verified or Self-tested."
template: splash
editUrl: false
head:
  - tag: title
    content: "OpenMOCA Conformant: software that passes the test suite | OpenMOCA"
---

**For software.** Anyone can build software that reads or makes MOCA packages,
without asking. OpenMOCA Conformant is a public listing on openmoca.org of the
software that passes the OpenMOCA test suite, so people choosing a Reader, a
packaging tool or a linter can see what it has shown. For apps people use,
there is a different listing: [the OpenMOCA Commitment](/commitment/).

**Listings are coming soon.** They follow the 0.7.0 release. Until then, no
software is listed.

## What it means

The standard is only useful if every Reader reads a package the same way.
Software may say it is OpenMOCA Conformant when it passes the OpenMOCA test
suite for what it is: a **Reader**, a **Producer**, a **linter**, or another
kind once a suite exists for it. The claim names the kind and the
specification version, for example "OpenMOCA 0.7 Conformant Reader".

Each listing names the software, its version, the specification version and
the suite it passed, and has one of three standings:

| Standing | Means |
| --- | --- |
| **Official** | The project's own software, such as its Readers and tools |
| **Verified** | The project has re-run the suite against that version itself |
| **Self-tested** | The maker ran the public suite and published a signed result |

**How it is earned.** Run the suite yourself; the
[conformance corpus](/spec/conformance/) is public. There is no fee and no
application. Publish the signed result and ask for it to be listed. A result
covers one version: if a later release of the software fails the suite, the
claim is updated or removed. An entry that fails when re-run is removed.

## Conformant and the Commitment, side by side

| Question | OpenMOCA Conformant | The OpenMOCA Commitment |
| --- | --- | --- |
| **For** | Software: a Reader, a Producer (a tool that makes packages), a linter | Apps people use |
| **Answers** | Does this software read, make or check packages exactly as the specification says? | Will this app honour what the creator asked, and what I asked? |
| **Rests on** | A test suite anyone can run | The company's own signed promise |
| **Who checks** | The maker runs the suite (Self-tested); the project re-runs it (Verified) | Nobody tests it. OpenMOCA lists the promise, and anyone can hold the company to it |
| **Covers** | One version of the software, one version of the specification | One named product and version |

### Why two marks?

Software can read a package correctly and still do something the creator
ruled out with what it read. An app can promise to honour creators' terms
while using a Reader someone else built. So the two marks say different
things:

- **OpenMOCA Conformant** is a test result for software.
- **The OpenMOCA Commitment** is a company's public promise about an app.

Neither is a certification or an endorsement, and neither is a registered
trade mark. Neither means content cannot be copied or misused, that a
package's statements are true, or that whoever signed a package owns the work.

How the OpenMOCA name may be used with both is in the
[trade mark policy](https://github.com/openmoca/moca-spec/blob/main/TRADEMARKS.md).
