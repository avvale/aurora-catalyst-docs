---
title: "Authenticated account query"
description: "A new iamMeAccount query (REST + GraphQL) returns the logged-in account from request context — strategy-agnostic and authenticated-only, no permission gate."
date: 2026-05-27
version: "Unreleased"
classification: feature
source_commit: "1447bcf2114d4076395f7fc237d6464c7d1728cf"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/1447bcf2114d4076395f7fc237d6464c7d1728cf/openspec/changes/archive/2026-05-27-add-iam-me-account/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- Adds the `iamMeAccount` query (REST + GraphQL) that returns the single authenticated account from request context — name, email, roles, permissions and tenants — without a database re-fetch.
- It is authenticated-only (valid JWT, no `iam.account.get` permission gate), so reading your own profile never requires account-admin rights, and it is strategy-agnostic: the same contract works under `local-provider` and `aurora-hub`.

## Why it matters

The access token only carries `aci` (the account id), and there was no working "my account" read — the admin sidebar showed a hardcoded user. The frontend now resolves the real logged-in user through one query, regardless of `OAUTH_STRATEGY`. Satellites in hub mode call the same `iamMeAccount` query against the hub to hydrate the account.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/1447bcf2114d4076395f7fc237d6464c7d1728cf/openspec/changes/archive/2026-05-27-add-iam-me-account/)
