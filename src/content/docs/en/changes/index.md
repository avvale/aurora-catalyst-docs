---
title: Change history
description: Developer-facing changelog across the Aurora Catalyst repos, filtered to user-visible changes.
---

Curated list of user-facing changes across the Aurora Catalyst ecosystem — new public APIs, new flows, breaking changes, and deprecations. Internal refactors, performance tweaks, and bug fixes are intentionally omitted to keep this section scannable for developers learning or upgrading.

Each entry is drafted from the original openspec proposal in the source repo and links back to the archive, so you can always drill into the full decision context when you need it.

## By source repo

- [**Aurora Catalyst CLI**](./cli/) — the code generator, `packages/cli` inside the `aurora-catalyst` monorepo since it was consolidated there (the standalone `aurora-catalyst-cli` repo is now frozen, historical only).
- [**Aurora Catalyst Framework**](./catalyst/) — `aurora-catalyst`, the Angular + NestJS framework scaffolded by the CLI.

Entries are grouped by the semver version that ships them. Changes archived after the latest release appear under **Unreleased** until a new version is tagged.
