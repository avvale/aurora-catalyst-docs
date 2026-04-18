---
title: "Deploy"
---

`catalyst deploy`
=================

Deploy Aurora projects

* [`catalyst deploy`](#catalyst-deploy)

## `catalyst deploy`

Trigger deploy by pushing source branches to environments/{env}.

```
USAGE
  $ catalyst deploy [-c <value>] [--dry-run] [--env <value>]

FLAGS
  -c, --config=<value>  [default: ./aurora.yaml] Path to aurora.yaml config file
      --dry-run         Show what would be pushed without executing
      --env=<value>     Deploy only this environment (e.g. dev, qa, prod)

DESCRIPTION
  Trigger deploy by pushing source branches to environments/{env}.

EXAMPLES
  $ catalyst deploy

  $ catalyst deploy --env dev

  $ catalyst deploy --dry-run

  $ catalyst deploy --env prod -c ../aurora.yaml
```

_See code: [src/commands/deploy/index.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v1.0.0/src/commands/deploy/index.ts)_
