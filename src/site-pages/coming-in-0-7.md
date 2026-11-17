---
title: Coming in 0.7.0
description: What is in review for OpenMOCA 0.7.0, not released yet. Credits for everyone who made a work, the creator's terms for AI use, rating and rights, and one rule for how values are written.
editUrl: false
---

**Not released yet.** Everything on this page is in review for OpenMOCA
0.7.0 and may still change. The current release is 0.6.0. Read the pull
requests below, and tell us what you think in
[the specification's discussions](https://github.com/openmoca/moca-spec/discussions).

OpenMOCA 0.7.0 is about the people who make and own a work. A package
already carries the knowledge and its sources. In 0.7.0 its signed manifest
can also say who made the work, who owns it and on what terms.

## Credits for everyone involved

- **Who publishes it.** `publisher` becomes a small record: a name, and
  optionally a web page, a description, a picture and links to the same
  publisher elsewhere. It is no longer a plain string, so 0.6 packages
  need a small change.
- **Who made it.** `contributors` lists the people and organisations
  behind the work, for the whole package and for each part of it: the host
  of a show and its guests, an author, a narrator, a translator. Each
  contributor has one or more roles from the Library of Congress list of
  relator codes, the codes libraries already use, so a host is `hst` and a
  narrator `nrt`.
- **Where to find it.** `url` gives the work's own web page.
- **Labels, not proof.** Credits are what the signer says. Readers show
  them as written; they do not prove that a listed person took part.
- Credits map to schema.org, Dublin Core, ONIX and the roles in a
  podcast feed, so a producer can fill them in from what is already
  published.

## The creator's terms

One `terms` block in the manifest says what the creator accepts. It travels
with the work, inside the signed package.

- **Where an AI may answer from the work:** on the person's own device, in
  the app's own service, or with another company's model, each allowed or
  not. A creator can also say that answers must come from the work alone,
  without the model's general knowledge, and that another company's model
  must not train on or keep what it is sent.
- **Training:** whether the work may be used to train a model. Not allowed
  by default.
- **Machine translation:** whether the work may be translated by a machine.
- **Rating:** whether the work is explicit, a rating under a named scheme,
  and the age range it is meant for, for the whole work or one part of it,
  such as a single episode.
- **Rights:** who holds the rights, on what basis the package was made, how
  to get in touch, and whether others may repackage the work.

**Stricter always wins.** A part of a package, a collection it belongs to,
or the app showing it can only make the terms stricter, never looser. In
0.7.0 no package can loosen the defaults at all. Letting the rights holder
loosen them, for example to allow training, needs a way to check that a
package really comes from the rights holder. That comes in a later version.

## Signed packages show who signed

A signature shows who signed a package. It does not show that what they
wrote is true, or that they own the work. Readers work out who stated the
terms from the signatures alone, never from the names written in the
manifest.

## Labels, not locks

Terms state what the creator accepts; they cannot force an app to follow
them. Readers show the terms exactly as written, and when an app asks, a
Reader leaves out what the terms exclude before anything reaches a model.

Apps that do follow them will be able to say so: **"honours creators'
ratings and AI-use rules"**, backed by a public set of tests that anyone
can run. The tests feed an app marked content and check that nothing
reaches a model the terms rule out. The claim is self-certified, and an app
that makes it publishes its test results. The tests are not written yet;
they will be published with the conformance tests.

## One rule for values

Every new field follows the same rules, so every value has one fixed
shape:

- a yes-or-no answer is `true` or `false`, never a word such as `"allow"`;
- a field that is not set is left out;
- `null` is allowed only where the specification says what it means;
- a choice is one key from a fixed list;
- an object takes only the members it lists.

## Read the changes

The specification, with the conformance tests every Reader must pass:

- [Credits](https://github.com/openmoca/moca-spec/pull/13), accepted into
  the 0.7.0 branch
- [The creator's terms and the value rules](https://github.com/openmoca/moca-spec/pull/15),
  in review

The Readers:

- TypeScript: [credits](https://github.com/openmoca/moca-reader-typescript/pull/14)
  and [terms](https://github.com/openmoca/moca-reader-typescript/pull/15)
- .NET: [credits](https://github.com/openmoca/moca-reader-dotnet/pull/10)
- Python: [credits](https://github.com/openmoca/moca-reader-python/pull/12)

Questions and ideas are welcome in
[the discussions](https://github.com/openmoca/moca-spec/discussions), or
[get in touch](/contact/).
