---
title: "Add GraphQL Fetchers"
description: "Seven new queryX / mutateX fetchers expose pure one-shot GraphQL calls — resolvers no longer need to stand up a composable to pre-load data."
date: 2026-04-22
version: "Unreleased"
classification: feature
source_commit: "7a17c6e1add03d4b6b5bce810df80723f7199204"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/7a17c6e1add03d4b6b5bce810df80723f7199204/openspec/changes/archive/2026-04-22-query-mutate-layer-separation/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- Seven new fetchers under `@aurora/modules/graphql/fetchers/`: `queryPaginate`, `queryFindById`, `queryFind`, `queryGet`, `mutateCreate`, `mutateUpdate`, `mutateDeleteById`. Each returns a plain `Observable<T>` with no signals and no dependency on a component execution context.
- New composable `useGraphqlGet` for unpaginated multi-record reads — mirrors the generated `getQuery` / `objects:` shape.
- `useGraphqlFind` realigned to single-record semantics (`T | null`) to match `findQuery` / `object:`. Plural reads now live in `useGraphqlGet`; no previously released composable changes its public shape.

## Why it matters

Resolvers can now call GraphQL without standing up a composable. Destructure `queryPagination`, `paginationKey`, and `fields` from your generated `*_LIST_CONFIG`, invoke `queryPaginate(...)`, and return the observable — no dead signals, no component-lifecycle contract leaking into the router. Every previously released `useGraphqlX` keeps the same public API, so existing components keep compiling without a single import change. The fetcher/composable split leaves a clean seam for future additions in either layer.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/7a17c6e1add03d4b6b5bce810df80723f7199204/openspec/changes/archive/2026-04-22-query-mutate-layer-separation/)
