---
title: "Local-provider token issuance"
description: "Catalyst can now issue its own OAuth2 tokens — RFC 6749 Password and Refresh grants at POST /api/o-auth/token, RS256 signing, and a JWKS endpoint — becoming an identity authority."
date: 2026-05-26
version: "Unreleased"
classification: feature
source_commit: "d09a8aad9c17a69371d181ee41f89b1a11289662"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/d09a8aad9c17a69371d181ee41f89b1a11289662/openspec/changes/archive/2026-05-26-add-local-provider-oauth2-password-grant/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- Catalyst can now **issue** its own tokens via the `local-provider` strategy (`OAUTH_STRATEGY=local-provider`): a new `POST /api/o-auth/token` endpoint supporting the RFC 6749 Password grant (§4.3) and Refresh Token grant (§6), form-urlencoded with HTTP Basic client auth.
- Adds RS256 JWT signing with a local key, a `GET /.well-known/jwks.json` endpoint so other instances (in `aurora-hub` mode) can verify the tokens, an `OAuthCredential` aggregate logging every issuance, per-IP rate limiting, and a daily retention purge.

## Why it matters

Until now a catalyst install could only **consume** tokens from an external hub — it needed a separate identity authority alongside it. With `local-provider`, a single install authenticates its own users and becomes the identity authority for satellites. Refresh tokens are opaque random strings validated against the database, and access tokens carry only the minimal `aci` claim.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/d09a8aad9c17a69371d181ee41f89b1a11289662/openspec/changes/archive/2026-05-26-add-local-provider-oauth2-password-grant/)
