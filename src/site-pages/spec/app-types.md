---
title: App types
description: "Well-known app types for a MOCA package's apps hint: the tokens a publisher can use to say what kind of application a package is made for."
editUrl: false
---

A package's `apps` list says where the publisher suggests it is opened,
beyond conversation
([package spec §4.9](/spec/package/#49-apps)). Each entry is a specific app,
named by an `https:` address, or an **app type**: a short token for a kind of
application.

```json
"apps": ["https://apps.example.com/legal-review", "legal"]
```

This page lists well-known app types, so that publishers and applications use
the same words. It is informative: the list is not part of the specification,
and anyone may use a token that is not here.

## Well-known types

| Type | For applications that |
| --- | --- |
| `tutoring` | Teach from the package: lessons, exercises and feedback, step by step. |
| `legal` | Review or draft contracts and other legal documents against the package's clauses. |
| `support-desk` | Help support agents answer customer questions from the package. |
| `field-service` | Guide work on site, such as maintenance or installation, step by step. |
| `compliance` | Check work or documents against the policies and regulations in the package. |

## Rules for every type

- A token is lower-case ASCII letters, digits and hyphens, starts with a
  letter, and is at most 64 characters.
- **Conversation is never a type.** Every package can be read, searched and
  asked about with the open Readers and the MCP server, so a type such as
  `chat` adds nothing.
- **A type is a hint.** Listing one does not make a package suitable for that
  kind of application, and not listing one does not stop an application from
  opening the package. The application checks for itself.
- A type names a kind of application only. It never names an agent, a model,
  a prompt or a tool.

## Add a type

Open a pull request to the
[openmoca.org repository](https://github.com/openmoca/openmoca.org) that adds
a row to the table above, with a line on what the type means. A type joins
this list by a pull request to the site, not by a change to the
specification.
