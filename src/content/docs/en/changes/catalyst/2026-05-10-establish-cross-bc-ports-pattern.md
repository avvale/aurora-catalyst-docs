---
title: "Cross-BC ports pattern"
description: "New architectural convention: every cross-bounded-context dependency uses a port + adapter + bridge entry, wired through a global `BridgesModule` composition root."
date: 2026-05-10
version: "Unreleased"
classification: breaking
source_commit: "b9e2580ad11e2388bd4cdecc55ca79cf4a9b51a9"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/b9e2580ad11e2388bd4cdecc55ca79cf4a9b51a9/openspec/changes/archive/2026-05-10-establish-cross-bc-ports-pattern/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- BREAKING (architectural convention) — every cross-bounded-context dependency MUST now follow Ports & Adapters: a port interface + Symbol token under `@app/<consumer>/shared/ports/`, an adapter under `@api/<supplier>/<module>/infrastructure/adapters/`, and a bridge entry under `@bridges/`. Importing another BC's module from your own is no longer allowed.
- New global composition root `BridgesModule` (`backend/src/@bridges/bridges.module.ts`, decorated `@Global()`) imports the supplier modules, registers adapters as providers, and exports only tokens — never the adapter classes or the supplier's services.
- `SharedModule` is promoted to `@Global()` for coherence with the `CacheModule` / `ConfigModule` already declared global inside it. Redundant `imports: [SharedModule]` in BC modules are kept intact (deprecating them is CLI codegen work).
- The recently-shipped `iam → o-auth` integration is refactored as the canonical example: new `IClientReader` port + `CLIENT_READER` token, an `IamClientReaderAdapter` on the o-auth side, and a bridge entry. `OAuthModule.exports = [...OAuthServices]` and `IamModule.imports = [OAuthModule]` are reverted.

## Why it matters

The previous cross-BC integration coupled `IamModule` to `OAuthModule` directly and exposed the full `OAuthServices` catalog. Its own design.md flagged it as conscious tech debt ("PARCHE consciente — no copiar"). Left as-is, future integrations (iam↔message, iam↔whatsapp, message↔notification, …) would have replicated the pattern and catalyst's module graph would have converged to a tangle of cross-BC imports with no curation of what each BC exposes. The new pattern replaces the legacy `QueryBus` (which catalyst deliberately removed) with compile-time-typed Ports & Adapters: each BC owns the contract it consumes, each supplier owns the translation to that contract, and the audit surface is one folder — `@bridges/`. A new skill (`catalyst-cross-bc-ports`) documents the convention plus the antipatterns. Any handler that needs to read across BC boundaries must be migrated to inject by token.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/b9e2580ad11e2388bd4cdecc55ca79cf4a9b51a9/openspec/changes/archive/2026-05-10-establish-cross-bc-ports-pattern/)
