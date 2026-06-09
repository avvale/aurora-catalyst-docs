---
title: Install the Aurora Catalyst CLI
description: Install the aurora-catalyst-cli globally so the `catalyst` command is available before you scaffold anything.
sidebar:
  order: 1
---

Everything in this walkthrough runs through the **Aurora Catalyst CLI** — the `catalyst` command that scaffolds projects, installs packages, and generates code. Install it once, globally, before anything else.

## 1. Install the CLI globally

```bash
npm install -g @aurorajs.dev/catalyst-cli
```

This pulls [`@aurorajs.dev/catalyst-cli`](https://www.npmjs.com/package/@aurorajs.dev/catalyst-cli) from npm and puts a `catalyst` executable on your `PATH`, so you can run it from any directory.

:::note
The CLI requires **Node.js ≥ 18**. If you prefer another package manager, the global-install equivalents work too — `pnpm add -g @aurorajs.dev/catalyst-cli` or `yarn global add @aurorajs.dev/catalyst-cli`.
:::

## 2. Verify the install

```bash
catalyst --version
```

This prints the installed version. To see every available command, run:

```bash
catalyst --help
```

For the full list, see the [CLI commands reference](/aurora-catalyst-docs/en/reference/cli-commands/).

## Next

The CLI is ready. Next, [install Aurora Catalyst](/aurora-catalyst-docs/en/tutorials/getting-started/install-aurora/) to scaffold your hub.
