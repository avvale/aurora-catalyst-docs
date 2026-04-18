---
title: "Sheets"
---

`catalyst sheets`
=================

Bidirectional sync between Aurora YAML schemas and Google Sheets

* [`catalyst sheets diff`](#catalyst-sheets-diff)
* [`catalyst sheets list`](#catalyst-sheets-list)
* [`catalyst sheets pull`](#catalyst-sheets-pull)
* [`catalyst sheets push`](#catalyst-sheets-push)
* [`catalyst sheets validate`](#catalyst-sheets-validate)

## `catalyst sheets diff`

Show differences between Aurora YAML schemas and Google Sheets.

```
USAGE
  $ catalyst sheets diff [--all | --bc <value>] [-c <value>] [--summary]

FLAGS
  -c, --config=<value>  [default: ./aurora.yaml] Path to aurora.yaml config file
      --all             Diff all bounded contexts
      --bc=<value>      Bounded context name
      --summary         Show only summary

DESCRIPTION
  Show differences between Aurora YAML schemas and Google Sheets.

EXAMPLES
  $ catalyst sheets diff --bc iam

  $ catalyst sheets diff --all

  $ catalyst sheets diff --all --summary
```

_See code: [src/commands/sheets/diff.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v1.0.0/src/commands/sheets/diff.ts)_

## `catalyst sheets list`

List configured bounded contexts for Google Sheets sync.

```
USAGE
  $ catalyst sheets list [-c <value>]

FLAGS
  -c, --config=<value>  [default: ./aurora.yaml] Path to aurora.yaml config file

DESCRIPTION
  List configured bounded contexts for Google Sheets sync.

EXAMPLES
  $ catalyst sheets list
```

_See code: [src/commands/sheets/list.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v1.0.0/src/commands/sheets/list.ts)_

## `catalyst sheets pull`

Pull schemas from Google Sheets to Aurora YAML files.

```
USAGE
  $ catalyst sheets pull [--all | --bc <value>] [-c <value>] [--dry-run] [--no-backup] [-v]

FLAGS
  -c, --config=<value>  [default: ./aurora.yaml] Path to aurora.yaml config file
  -v, --verbose         Show detailed output
      --all             Pull all bounded contexts
      --bc=<value>      Bounded context name
      --dry-run         Preview without making changes
      --no-backup       Skip creating backup before pull

DESCRIPTION
  Pull schemas from Google Sheets to Aurora YAML files.

EXAMPLES
  $ catalyst sheets pull --bc iam

  $ catalyst sheets pull --all

  $ catalyst sheets pull --all --no-backup

  $ catalyst sheets pull --bc iam --dry-run
```

_See code: [src/commands/sheets/pull.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v1.0.0/src/commands/sheets/pull.ts)_

## `catalyst sheets push`

Push Aurora YAML schemas to Google Sheets.

```
USAGE
  $ catalyst sheets push [--all | --bc <value>] [-c <value>] [--dry-run] [-v]

FLAGS
  -c, --config=<value>  [default: ./aurora.yaml] Path to aurora.yaml config file
  -v, --verbose         Show detailed output
      --all             Push all bounded contexts
      --bc=<value>      Bounded context name
      --dry-run         Preview without making changes

DESCRIPTION
  Push Aurora YAML schemas to Google Sheets.

EXAMPLES
  $ catalyst sheets push

  $ catalyst sheets push --bc iam

  $ catalyst sheets push --all

  $ catalyst sheets push --bc iam --dry-run
```

_See code: [src/commands/sheets/push.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v1.0.0/src/commands/sheets/push.ts)_

## `catalyst sheets validate`

Validate connection and format of a Google Sheet.

```
USAGE
  $ catalyst sheets validate [--bc <value>] [-c <value>]

FLAGS
  -c, --config=<value>  [default: ./aurora.yaml] Path to aurora.yaml config file
      --bc=<value>      Bounded context name

DESCRIPTION
  Validate connection and format of a Google Sheet.

EXAMPLES
  $ catalyst sheets validate --bc iam
```

_See code: [src/commands/sheets/validate.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v1.0.0/src/commands/sheets/validate.ts)_
