---
title: "Provision"
---

`catalyst provision`
====================

Provision Aurora project infrastructure (DNS + Hosting + CI/CD)

* [`catalyst provision`](#catalyst-provision)

## `catalyst provision`

Provision Aurora project infrastructure (DNS + Hosting + CI/CD secrets).

```
USAGE
  $ catalyst provision [-c <value>] [--db-password <value>] [--env <value>] [--ftp-password <value>]
    [--plesk-ssh-user <value>] [--skip-cicd] [--skip-dns] [--skip-hosting] [--skip-ssh] [--target back|front]

FLAGS
  -c, --config=<value>          [default: ./aurora.yaml] Path to aurora.yaml config file
      --db-password=<value>     [env: DB_PASSWORD] Global DB password (fallback). Per-env: DEV_DB_PASSWORD,
                                PROD_DB_PASSWORD, etc.
      --env=<value>             Provision only this environment (e.g. dev, qa, prod)
      --ftp-password=<value>    [env: FTP_PASSWORD] Global FTP password (fallback). Per-env: DEV_FTP_PASSWORD,
                                PROD_FTP_PASSWORD, etc.
      --plesk-ssh-user=<value>  [default: root, env: PLESK_SSH_USER] SSH user for Plesk server commands
      --skip-cicd               Skip CI/CD secrets/variables setup
      --skip-dns                Skip DNS record creation
      --skip-hosting            Skip Plesk hosting setup
      --skip-ssh                Skip SSH key generation and installation
      --target=<option>         Provision only this target (back or front)
                                <options: back|front>

DESCRIPTION
  Provision Aurora project infrastructure (DNS + Hosting + CI/CD secrets).

EXAMPLES
  $ catalyst provision --ftp-password s3cret

  $ catalyst provision --env dev --target back

  $ catalyst provision --skip-dns --skip-cicd

  FTP_PASSWORD=x aurora provision          # global password for all envs

  DEV_FTP_PASSWORD=x PROD_FTP_PASSWORD=y aurora provision  # per-env passwords
```

_See code: [src/commands/provision/index.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v1.0.0/src/commands/provision/index.ts)_
