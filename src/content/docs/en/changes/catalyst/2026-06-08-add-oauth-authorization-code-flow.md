---
title: "Authorization Code flow with PKCE"
description: "The hub now exposes GET /api/o-auth/authorize and accepts the authorization_code grant with mandatory PKCE S256, single-use codes and a hub session cookie."
date: 2026-06-08
version: "Unreleased"
classification: feature
source_commit: "f7c1e260443c9310e7e7da7677eb370f1ded29c8"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/f7c1e260443c9310e7e7da7677eb370f1ded29c8/openspec/changes/archive/2026-06-08-add-oauth-authorization-code-flow/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- Adds `GET /api/o-auth/authorize` (RFC 6749 §4.1): it validates the client, matches `redirect_uri` against the registered client exactly, requires a non-empty `state`, mandates PKCE, and 302-redirects back with a short-lived single-use `code`.
- Extends `POST /api/o-auth/token` with a third grant — `authorization_code` — exchanged with a `code_verifier` over HTTP Basic. Codes are single-use (marked atomically) and expire in ~60s; PKCE S256 is verified on exchange.
- Adds a `hub_session` cookie (httpOnly RS256 JWT) so an authenticated user is not re-prompted; an authorize request without a session bounces to the hub `/sign-in?continue=…`.

## Why it matters

The hub is now a full OAuth2 Authorization Code provider, so satellite apps can delegate login to it instead of hitting `404 Cannot GET /api/o-auth/authorize`. PKCE S256 is mandatory and the authorize endpoint fails closed — it never redirects on a validation error, removing the open-redirect surface. The Password and Refresh Token grants are untouched, so existing token clients keep working. Authorization stays permission-based (`dPermissions` via `iamMeAccount`); the OAuth `scope` remains a cosmetic passthrough and grants nothing.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/f7c1e260443c9310e7e7da7677eb370f1ded29c8/openspec/changes/archive/2026-06-08-add-oauth-authorization-code-flow/)
