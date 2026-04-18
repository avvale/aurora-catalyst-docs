---
title: "Add"
---

`catalyst add`
==============

Add an Aurora package to an existing project.

* [`catalyst add SCOPE`](#catalyst-add-scope)

## `catalyst add SCOPE`

Add an Aurora package to an existing project.

```
USAGE
  $ catalyst add SCOPE [-f] [-v]

ARGUMENTS
  SCOPE  (backend|frontend) Scope where the command will act.

FLAGS
  -f, --force    Overwrite existing files.
  -v, --verbose  Report all steps on screen.

DESCRIPTION
  Add an Aurora package to an existing project.

EXAMPLES
  $ catalyst add back

  $ catalyst add front

  $ catalyst add back --force
```

_See code: [src/commands/add/index.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v1.0.0/src/commands/add/index.ts)_
