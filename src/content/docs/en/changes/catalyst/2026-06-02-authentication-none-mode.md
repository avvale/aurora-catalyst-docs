---
title: "Authentication none mode"
description: "OAUTH_STRATEGY gains a none mode for keyless bootstrap, and its default changes from aurora-hub to none — a breaking change for deployments relying on the implicit default."
date: 2026-06-02
version: "Unreleased"
classification: breaking
source_commit: "eea7ce68b8e9d26500fe7263b3987bb0d4046ff0"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/eea7ce68b8e9d26500fe7263b3987bb0d4046ff0/openspec/changes/archive/2026-06-02-authentication-none-mode/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- **Breaking:** the default `OAUTH_STRATEGY` changes from `aurora-hub` to **`none`**. A deployment that relied on the implicit `aurora-hub` default will boot with authentication disabled after upgrading unless it sets `OAUTH_STRATEGY=aurora-hub` explicitly.
- Adds `none` as a third strategy: requests arrive as an anonymous account with no permissions, endpoints without a declared permission become public, and the backend boots without OAuth keys. A prominent warning is logged at boot while `none` is active.

## Why it matters

A clean clone could not boot before — the JWT signer reads a private key at construction with fail-fast, so without keys (or a full provider) the app died at startup. `none` is a deliberate, transient bootstrap state: the app comes up usable and you switch to `local-provider` or `aurora-hub` once identity is configured. To migrate, set `OAUTH_STRATEGY` explicitly to your real strategy. `@Auth('permission')` endpoints still return 403 under `none`.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/eea7ce68b8e9d26500fe7263b3987bb0d4046ff0/openspec/changes/archive/2026-06-02-authentication-none-mode/)
