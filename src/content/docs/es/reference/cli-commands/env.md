---
title: "Env"
---

`catalyst env`
==============

Encrypt/decrypt environment files with SOPS

* [`catalyst env decrypt`](#catalyst-env-decrypt)
* [`catalyst env encrypt`](#catalyst-env-encrypt)

## `catalyst env decrypt`

Decrypt .env.{env}.enc files using SOPS (age). Reads environments from aurora.yaml.

```
USAGE
  $ catalyst env decrypt [-c <value>] [--env <value>] [--key-file <value>]

FLAGS
  -c, --config=<value>    [default: ./aurora.yaml] Path to aurora.yaml config file
      --env=<value>       Decrypt only this environment (e.g. dev, qa, prod)
      --key-file=<value>  [default: .keys/age.txt, env: SOPS_AGE_KEY_FILE] Path to age key file

DESCRIPTION
  Decrypt .env.{env}.enc files using SOPS (age). Reads environments from aurora.yaml.

EXAMPLES
  $ catalyst env decrypt

  $ catalyst env decrypt --env prod

  $ catalyst env decrypt --key-file .keys/custom.txt
```

_See code: [src/commands/env/decrypt.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v1.0.0/src/commands/env/decrypt.ts)_

## `catalyst env encrypt`

Encrypt .env.{env} files using SOPS (age). Reads environments from aurora.yaml.

```
USAGE
  $ catalyst env encrypt [-c <value>] [--env <value>] [--key-file <value>]

FLAGS
  -c, --config=<value>    [default: ./aurora.yaml] Path to aurora.yaml config file
      --env=<value>       Encrypt only this environment (e.g. dev, qa, prod)
      --key-file=<value>  [default: .keys/age.txt, env: SOPS_AGE_KEY_FILE] Path to age key file

DESCRIPTION
  Encrypt .env.{env} files using SOPS (age). Reads environments from aurora.yaml.

EXAMPLES
  $ catalyst env encrypt

  $ catalyst env encrypt --env dev

  $ catalyst env encrypt --key-file .keys/custom.txt
```

_See code: [src/commands/env/encrypt.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v1.0.0/src/commands/env/encrypt.ts)_
