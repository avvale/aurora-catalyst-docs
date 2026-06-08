---
title: "Logout and token revocation"
description: "A new revoke-token flow (POST /api/o-auth/revoke, RFC 7009, plus a GraphQL twin) ends a local-provider session server-side instead of only clearing local storage."
date: 2026-05-27
version: "Unreleased"
classification: feature
source_commit: "1447bcf2114d4076395f7fc237d6464c7d1728cf"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/1447bcf2114d4076395f7fc237d6464c7d1728cf/openspec/changes/archive/2026-05-27-add-local-provider-logout/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- Adds a revoke-token flow: `POST /api/o-auth/revoke` (RFC 7009) and the GraphQL twin `oAuthRevokeToken`. The presented refresh token and its paired access token are marked revoked, so any later refresh collapses to `invalid_grant`.
- Client authentication is HTTP Basic; revocation is idempotent and non-enumerable (unknown or already-revoked tokens return success) and is rate-limited at parity with token issuance. The frontend logout is wired to trigger it.

## Why it matters

Local-provider login worked, but there was no logout — a "logged out" user's opaque refresh token stayed valid in the database until natural expiry, so a captured token kept minting access tokens after the session supposedly ended. Logout now ends the session server-side, not just by clearing local storage.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/1447bcf2114d4076395f7fc237d6464c7d1728cf/openspec/changes/archive/2026-05-27-add-local-provider-logout/)
