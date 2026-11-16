---
title: Node types
description: "Suggested node types for MOCA packages: the words a publisher can put in a node's type so that applications group and show content the same way."
editUrl: false
---

Every node in a package has a `type`, the Open Knowledge Format's free-text
field ([package spec §5.1](/spec/package/#51-an-okf-bundle)). Readers accept
any value and never reject a node for its type.

```yaml
---
type: PodcastEpisode
title: Episode 12, the harbour
---
```

This page suggests types, so that publishers and applications use the same
words. It is informative: the list is not part of the specification, and
anyone may use a type that is not here. Where schema.org has a matching type,
the name follows it.

## Suggested types

| Type | For a node that is |
| --- | --- |
| `Document` | A general document, when no other type fits. |
| `Article` | An article, a post or a chapter meant to be read on its own. |
| `Guide` | A how-to or an explanation for a reader working something out. |
| `Procedure` | Steps to follow in order. |
| `Policy` | A rule an organisation follows, with its scope and conditions. |
| `Troubleshooting` | A problem, its causes and how to fix it. |
| `FAQ` | Questions and their answers. |
| `Glossary` | Terms and what they mean. |
| `Lesson` | One unit of a course. |
| `Note` | A short note, such as show notes or a comment on other content. |
| `Notice` | An announcement or a notice, often dated. |
| `PodcastEpisode` | One episode of a podcast: its show notes, and its transcript in the body. |
| `PodcastSeries` | A podcast as a whole: what it is about and how it is organised. |
| `VideoEpisode` | One episode of a video series. |
| `Video` | A single video that is not part of a series. |
| `Clip` | A short part of a longer recording. |
| `Transcript` | A transcript or captions, when the node is the text of a recording. |

## Rules for every type

- A type is a word or a few words in `UpperCamelCase`, with no spaces.
- **A type describes; it never configures.** A Reader treats every type the
  same way, and an application decides for itself what to do with one.
- Audio and video stay where they are hosted. Describe them in the node's
  `moca.media` ([package spec §5.7](/spec/package/#57-media)), and put the
  transcript text in the body so that search finds it.

## Add a type

Open a pull request to the
[openmoca.org repository](https://github.com/openmoca/openmoca.org) that adds
a row to the table above, with a line on what the type means. A type joins
this list by a pull request to the site, not by a change to the
specification.
