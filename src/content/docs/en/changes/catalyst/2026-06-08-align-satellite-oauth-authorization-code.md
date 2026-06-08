---
title: "Satellite BFF realigned to PKCE"
description: "Breaking: the satellite BFF now uses the hub's PKCE /token contract; the legacy /credentials JSON exchange and UUID client_id are removed."
date: 2026-06-08
version: "Unreleased"
classification: breaking
source_commit: "f7c1e260443c9310e7e7da7677eb370f1ded29c8"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/f7c1e260443c9310e7e7da7677eb370f1ded29c8/openspec/changes/archive/2026-06-08-align-satellite-oauth-authorization-code/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- **Breaking:** the code exchange moves from `POST {hub}/api/o-auth/credentials` (JSON) to `POST {hub}/api/o-auth/token` (form-urlencoded, HTTP Basic) with `grant_type=authorization_code`. The legacy `/credentials` call is removed.
- `/auth/login` now adds PKCE (`code_challenge` + `code_challenge_method=S256`) and sends `client_id` as the `OAuthApplication.code` (e.g. `aurora`), not the `OAuthClient` UUID. The `code_verifier` is stored server-side keyed by `state` and never reaches the browser.
- `/auth/refresh` moves to the `/token` refresh grant; the client secret stays backend-only (read from `OAUTH_APPLICATION_SECRET`) and is never shipped in the frontend bundle.

## Why it matters

Satellites built for the old `/credentials` + UUID `client_id` contract now fail against the updated hub with `invalid_request` (missing PKCE). To migrate: re-pull the `authorization-code` package (`catalyst add --force`), set `OAUTH_APPLICATION_CODE` to the application code (`aurora` — renamed from `OAUTH_CLIENT_ID`) and `OAUTH_APPLICATION_SECRET` to its secret, and make sure the hub client's registered redirect matches your callback exactly. The browser-facing `/auth/login`, `/auth/token` and `/callback` surface is unchanged, so the frontend round-trip needs no edits.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/f7c1e260443c9310e7e7da7677eb370f1ded29c8/openspec/changes/archive/2026-06-08-align-satellite-oauth-authorization-code/)
