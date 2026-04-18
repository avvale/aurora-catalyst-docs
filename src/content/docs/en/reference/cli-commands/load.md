---
title: "Load"
---

`catalyst load`
===============

Load a module from its YAML definition and generate code.

* [`catalyst load SCOPE ELEMENT`](#catalyst-load-scope-element)

## `catalyst load SCOPE ELEMENT`

Load a module from its YAML definition and generate code.

```
USAGE
  $ catalyst load SCOPE ELEMENT -n <value> [-f] [-g] [--noReview] [-w] [--target <value>] [-t] [-v]

ARGUMENTS
  SCOPE    (back|front) Scope where the command will act.
  ELEMENT  (module) Type of element to load.

FLAGS
  -f, --force               Overwrite existing files.
  -g, --noGraphQLTypes      Skip GraphQL type generation.
  -n, --name=<value>        (required) Bounded context and module (e.g. "iam/account").
  -t, --tests               Generate e2e test files.
  -v, --verbose             Report all steps on screen.
  -w, --overwriteInterface  Overwrite front-end interfaces.
      --noReview            Skip interactive origin file review.
      --target=<value>      Output subdirectory (default: "backend" for back, "frontend" for front).

DESCRIPTION
  Load a module from its YAML definition and generate code.

EXAMPLES
  $ catalyst load back module --name=iam/account

  $ catalyst load front module --name=iam/account

  $ catalyst load back module --name=iam/account --tests --force

  $ catalyst load back module --name=iam/account --target=api
```

_See code: [src/commands/load/index.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v1.0.0/src/commands/load/index.ts)_
