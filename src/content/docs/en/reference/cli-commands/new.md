---
title: "New"
---

`catalyst new`
==============

Create a new Aurora monorepo project.

* [`catalyst new NAME`](#catalyst-new-name)

## `catalyst new NAME`

Create a new Aurora monorepo project.

```
USAGE
  $ catalyst new NAME [-f]

ARGUMENTS
  NAME  Name of the project to create.

FLAGS
  -f, --force  Overwrite existing directory.

DESCRIPTION
  Create a new Aurora monorepo project.

EXAMPLES
  $ catalyst new my-project

  $ catalyst new my-project --force
```

_See code: [src/commands/new/index.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v1.0.0/src/commands/new/index.ts)_
