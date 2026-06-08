---
title: "Backend Identity installer"
description: "catalyst add backend now installs iam + o-auth together in local-provider mode, wiring the bridges composition root and leaving a working local login."
date: 2026-06-04
version: "Unreleased"
classification: feature
source_commit: "bc7af6679d2605e11d4d231e2c3f8c05cddf7d61"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/bc7af6679d2605e11d4d231e2c3f8c05cddf7d61/openspec/changes/archive/2026-06-04-add-identity-package-installer/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- `catalyst add backend` now offers a combined **Identity (IAM + OAuth)** package that installs iam + o-auth together in local-provider mode and leaves the install working end to end.
- The installer wires the `@bridges/bridges.module.ts` composition root (Symbol tokens only), sets `OAUTH_STRATEGY=local-provider` idempotently, installs the union of both modules' runtime dependencies, and regenerates GraphQL types. The stale standalone `iam` / `o-auth` installers are removed.

## Why it matters

Before this, the only backend installer was the satellite "Authorization Code" one, and the `iam` / `o-auth` installers were written against a pre-restructure layout and crashed on first call — a fresh scaffold had no path to a real local identity. Now a single command gives you an IAM-backed, local-provider login. Identity is indivisible (the cross-BC `iam-client-reader` bridge couples the two), so there is no standalone iam or o-auth install. The installer does not touch `auth.decorator.ts` or run keys/seeders.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/bc7af6679d2605e11d4d231e2c3f8c05cddf7d61/openspec/changes/archive/2026-06-04-add-identity-package-installer/)
