---
title: OpenMOCA Conformant and the OpenMOCA Commitment
description: "Two public listings on openmoca.org: OpenMOCA Conformant, for software that passes the test suite, and the OpenMOCA Commitment, a company's signed promise that an app honours creators' terms and people's choices."
editUrl: false
sidebar:
  label: Conformant and the Commitment
---

Anyone can build software that reads or makes MOCA packages, without asking.
Two public listings on openmoca.org help people see what a piece of software
has shown, and what an app's makers have promised. They answer two different
questions, for two different people.

| Question | OpenMOCA Conformant | The OpenMOCA Commitment |
| --- | --- | --- |
| **For** | Software: a Reader, a Producer (a tool that makes packages), a linter | Apps people use |
| **Answers** | Does this software read, make or check packages exactly as the specification says? | Will this app honour what the creator asked, and what I asked? |
| **Rests on** | A test suite anyone can run | The company's own signed promise |
| **Who checks** | The maker runs the suite (Self-tested); the project re-runs it (Verified) | Nobody tests it. OpenMOCA lists the promise, and anyone can hold the company to it |
| **Covers** | One version of the software, one version of the specification | One named product and version |

**Listings are coming soon.** They follow the 0.7.0 release. Until then, no
software is listed and no app can show the Commitment mark.

## OpenMOCA Conformant: for software

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

## The OpenMOCA Commitment: for apps

An app that makes the OpenMOCA Commitment promises to honour what creators
ask and what people ask, as the OpenMOCA specification sets out. The company
behind the app signs that promise, for a named product and version, and it is
listed on openmoca.org.

**For people, it means:**

- If a creator says their work may not be used by a certain kind of AI, the
  app does not send it there.
- If a creator's work is never to be used for training AI, it is not.
- If work is rated for older audiences, it is not shown to younger profiles.
- If a creator says their work may not be exported, the app does not let you
  export it.
- The creator's name, licence and copyright stay with their work, and every
  answer shows where it came from.
- Your own settings are always applied, and the app never overrides them with
  a looser setting of its own.
- What you bring into the app or keep private stays yours.
- When something is left out, the app tells you why.

The full text, for people and for companies, is
[the OpenMOCA Commitment](/commitment/).

**How it is made.** The company publishes a signed statement naming the
company, the product, the versions covered, the date, the models and
destinations the product uses, the set-ups the Commitment covers, and a
contact for challenges. It is signed with the same attestation format packages
use, and listed on openmoca.org. A new version of the product needs a new
statement.

**What OpenMOCA does.** It publishes the rules, lists signed statements,
offers the Commitment mark for listed products, and removes a listing that is
withdrawn or shown to be untrue. It does not test, audit or guarantee any
product. The promise is the company's own, and anyone can hold the company to
it: if you think an app breaks it, report it to the company and to
[OpenMOCA](/contact/), and the signed promise is your evidence.

## Why two marks?

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
