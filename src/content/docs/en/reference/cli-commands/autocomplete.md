---
title: "Autocomplete"
---

`catalyst autocomplete`
=======================

Display autocomplete installation instructions.

* [`catalyst autocomplete [SHELL]`](#catalyst-autocomplete-shell)

## `catalyst autocomplete [SHELL]`

Display autocomplete installation instructions.

```
USAGE
  $ catalyst autocomplete [SHELL] [-r]

ARGUMENTS
  [SHELL]  (zsh|bash|powershell) Shell type

FLAGS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

DESCRIPTION
  Display autocomplete installation instructions.

EXAMPLES
  $ catalyst autocomplete

  $ catalyst autocomplete bash

  $ catalyst autocomplete zsh

  $ catalyst autocomplete powershell

  $ catalyst autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v3.2.40/src/commands/autocomplete/index.ts)_
