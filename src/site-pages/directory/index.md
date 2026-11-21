---
title: The Directory
description: "The OpenMOCA Directory: apps that have made the OpenMOCA Commitment to respect creators' work and people's choices, and software that reads OpenMOCA correctly (OpenMOCA Conformant). How to get listed."
template: splash
editUrl: false
head:
  - tag: title
    content: "The OpenMOCA Directory: the Commitment and Conformant | OpenMOCA"
---

Anyone can build with OpenMOCA, without asking. The Directory lists two
things people want to know before they choose: which apps have promised to
respect creators' work, and which software has shown it reads OpenMOCA
correctly.

## Apps you can trust with creators' work

**The OpenMOCA Commitment.** Mainly for creators and their audience.

An app that makes the Commitment promises, publicly and in writing, to
respect how creators want their work shared, shown and used, and your own
choices too. The company behind the app signs that promise for a named app
and version. OpenMOCA lists it; it does not test it. Anyone can hold the
company to it.

**How to get listed.** Publish a statement for your app and version, signed
by your company, and ask for it to be listed.

[The OpenMOCA Commitment, and the apps that have made it](/directory/commitment/)

## Software that reads OpenMOCA correctly

**OpenMOCA Conformant.** Mainly for developers and organisations.

Software that passes the public OpenMOCA tests for what it does can say it is
OpenMOCA Conformant. The tests are public, so anyone can run them. In 0.7.0
the tests cover Readers, software that reads OpenMOCA; tests for software
that makes or checks packages follow.

**How to get listed.** Run the tests and publish the run, then ask for it to
be listed. There is no fee and no application form. For 0.7.0, a listing rests
on a public test run; signed records are required once the signing tool
ships.

[OpenMOCA Conformant, and the software that is listed](/directory/conformant/)

## Conformant and the Commitment, side by side

| Question | OpenMOCA Conformant | The OpenMOCA Commitment |
| --- | --- | --- |
| **For** | Software that reads, makes or checks packages | Apps people use |
| **Answers** | Does this software handle packages exactly as the standard says? | Will this app respect how the creator wants their work shared, shown and used, and my own choices? |
| **Rests on** | Public tests anyone can run | The company's own signed promise |
| **Who checks** | The maker runs the tests (Self-tested); the project runs them again (Verified) | Nobody tests it. OpenMOCA lists the promise, and anyone can hold the company to it |
| **Covers** | One version of the software, one version of the standard | One named app and version |

## Why two marks?

Software can read a package correctly and still do something the creator
ruled out with what it read. An app can promise to honour the creator's wishes
while using software someone else built to read packages. So the two marks say
different things:

- **OpenMOCA Conformant** is a test result for software.
- **The OpenMOCA Commitment** is a company's public promise about an app.

Neither is a certification or an endorsement, and neither is a registered
trade mark; the name OpenMOCA itself has a pending UK trade mark application
(UK00004468246). Neither means content cannot be copied or misused, that a
package's statements are true, or that whoever signed a package owns the work.

How the OpenMOCA name may be used with both is in the
[trade mark policy](https://github.com/openmoca/moca-spec/blob/main/TRADEMARKS.md).

## The lists as data

Both lists are published as data, free for anyone to reuse under CC0, with a
JSON Schema for each:

- The OpenMOCA Commitment:
  [commitment.json](https://openmoca.org/directory/commitment.json), and its
  [schema](https://openmoca.org/directory/commitment.schema.json).
- OpenMOCA Conformant:
  [conformant.json](https://openmoca.org/directory/conformant.json), and its
  [schema](https://openmoca.org/directory/conformant.schema.json).
