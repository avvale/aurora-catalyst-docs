---
title: "Generate"
---

`catalyst generate`
===================

Generate a module's source code from its YAML definition.

* [`catalyst generate SCOPE ELEMENT`](#catalyst-generate-scope-element)

## `catalyst generate SCOPE ELEMENT`

Generate a module's source code from its YAML definition.

```
USAGE
  $ catalyst generate SCOPE ELEMENT -n <value> [-f] [-g] [--noReview] [-w] [--target <value>] [-t] [-v]

ARGUMENTS
  SCOPE    (back|front) Scope where the command will act.
  ELEMENT  (module) Type of element to generate.

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
  Generate a module's source code from its YAML definition.

EXAMPLES
  $ catalyst generate back module --name=iam/account

  $ catalyst generate front module --name=iam/account

  $ catalyst generate back module --name=iam/account --tests --force

  $ catalyst generate back module --name=iam/account --target=api
```

_See code: [src/commands/generate/index.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v2.0.0/src/commands/generate/index.ts)_
