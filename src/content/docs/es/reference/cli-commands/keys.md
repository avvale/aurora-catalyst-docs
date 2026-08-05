---
title: "Keys"
---

`catalyst keys`
===============

Generate RSA private key and public key (defaults to ./backend/.keys)

* [`catalyst keys`](#catalyst-keys)

## `catalyst keys`

Generate RSA private key and public key (defaults to ./backend/.keys)

```
USAGE
  $ catalyst keys [-o <value>]

FLAGS
  -o, --out=<value>  Output directory for the key files (default: backend/.keys)

DESCRIPTION
  Generate RSA private key and public key (defaults to ./backend/.keys)

EXAMPLES
  $ catalyst keys

  $ catalyst keys --out ./keys
```

_See code: [src/commands/keys/index.ts](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/commands/keys/index.ts)_
