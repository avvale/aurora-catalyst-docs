---
title: "Origin"
---

`catalyst origin`
=================

Manage `.origin` files emitted by `catalyst generate`

* [`catalyst origin accept`](#catalyst-origin-accept)
* [`catalyst origin diff`](#catalyst-origin-diff)
* [`catalyst origin ignore`](#catalyst-origin-ignore)
* [`catalyst origin list`](#catalyst-origin-list)
* [`catalyst origin reject`](#catalyst-origin-reject)
* [`catalyst origin review`](#catalyst-origin-review)

## `catalyst origin accept`

Adopt the codegen proposal: replace current with `.origin` and delete `.origin`.

```
USAGE
  $ catalyst origin accept [PATHSPEC] [--json]

ARGUMENTS
  PATHSPEC  Optional file or directory. Defaults to recursive cwd scan.

FLAGS
  --json  Emit machine-readable JSON instead of human text.

DESCRIPTION
  Adopt the codegen proposal: replace current with `.origin` and delete `.origin`.

EXAMPLES
  $ catalyst origin accept

  $ catalyst origin accept backend/foo.ts

  $ catalyst origin accept backend/iam/

  $ catalyst origin accept --json
```

_See code: [src/commands/origin/accept.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v3.0.0/src/commands/origin/accept.ts)_

## `catalyst origin diff`

Print a unified diff of each `.origin` proposal against its current file.

```
USAGE
  $ catalyst origin diff [PATHSPEC] [--json]

ARGUMENTS
  PATHSPEC  Optional file or directory. Defaults to recursive cwd scan.

FLAGS
  --json  Emit machine-readable JSON instead of human text.

DESCRIPTION
  Print a unified diff of each `.origin` proposal against its current file.

EXAMPLES
  $ catalyst origin diff

  $ catalyst origin diff backend/foo.ts

  $ catalyst origin diff --json
```

_See code: [src/commands/origin/diff.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v3.0.0/src/commands/origin/diff.ts)_

## `catalyst origin ignore`

Reject the proposal AND mark the current file as ignored on future regens.

```
USAGE
  $ catalyst origin ignore [PATHSPEC] [--json]

ARGUMENTS
  PATHSPEC  Optional file or directory. Defaults to recursive cwd scan.

FLAGS
  --json  Emit machine-readable JSON instead of human text.

DESCRIPTION
  Reject the proposal AND mark the current file as ignored on future regens.

EXAMPLES
  $ catalyst origin ignore

  $ catalyst origin ignore backend/foo.ts

  $ catalyst origin ignore backend/iam/

  $ catalyst origin ignore --json
```

_See code: [src/commands/origin/ignore.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v3.0.0/src/commands/origin/ignore.ts)_

## `catalyst origin list`

List `.origin` files emitted by `catalyst generate`.

```
USAGE
  $ catalyst origin list [PATHSPEC] [--json]

ARGUMENTS
  PATHSPEC  Optional file or directory. Defaults to recursive cwd scan.

FLAGS
  --json  Emit machine-readable JSON instead of human text.

DESCRIPTION
  List `.origin` files emitted by `catalyst generate`.

EXAMPLES
  $ catalyst origin list

  $ catalyst origin list backend/

  $ catalyst origin list backend/foo.ts

  $ catalyst origin list --json
```

_See code: [src/commands/origin/list.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v3.0.0/src/commands/origin/list.ts)_

## `catalyst origin reject`

Reject the codegen proposal: delete `.origin` and keep the current file as-is.

```
USAGE
  $ catalyst origin reject [PATHSPEC] [--json]

ARGUMENTS
  PATHSPEC  Optional file or directory. Defaults to recursive cwd scan.

FLAGS
  --json  Emit machine-readable JSON instead of human text.

DESCRIPTION
  Reject the codegen proposal: delete `.origin` and keep the current file as-is.

EXAMPLES
  $ catalyst origin reject

  $ catalyst origin reject backend/foo.ts

  $ catalyst origin reject backend/iam/

  $ catalyst origin reject --json
```

_See code: [src/commands/origin/reject.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v3.0.0/src/commands/origin/reject.ts)_

## `catalyst origin review`

Interactive walk-through of pending `.origin` files (inquirer + VS Code diff).

```
USAGE
  $ catalyst origin review

DESCRIPTION
  Interactive walk-through of pending `.origin` files (inquirer + VS Code diff).

EXAMPLES
  $ catalyst origin review
```

_See code: [src/commands/origin/review.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v3.0.0/src/commands/origin/review.ts)_
