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
  SCOPE  (back|front) Scope where the command will act.

FLAGS
  -f, --force    Overwrite files that already exist (default: skip existing files).
  -v, --verbose  Report all steps on screen.

DESCRIPTION
  Add an Aurora package to an existing project.

EXAMPLES
  $ catalyst add back

  $ catalyst add front

  $ catalyst add back --force
```

_See code: [src/commands/add/index.ts](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/commands/add/index.ts)_
