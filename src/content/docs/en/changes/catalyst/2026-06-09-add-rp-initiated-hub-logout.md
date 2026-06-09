---
title: "RP-initiated hub logout"
description: "Sign-out now terminates the hub session through a navigable logout endpoint and a same-origin redirect, ending silent re-authentication."
date: 2026-06-09
version: "Unreleased"
classification: feature
source_commit: "2169b75bf56639459517dded70036bba8dfd7255"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/2169b75bf56639459517dded70036bba8dfd7255/openspec/changes/archive/2026-06-09-add-rp-initiated-hub-logout/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- Adds a navigable hub endpoint `GET /api/o-auth/logout` that clears the `hub_session` cookie and 302-redirects to a validated destination, echoing `state`; it is idempotent when no session exists.
- Adds a satellite BFF `GET /auth/logout` façade that bounces the browser to the hub, and turns `POST /auth/logout` from a no-op stub into a real hub refresh-token revocation — both keeping the hub URL and client secret server-side.
- Validates `post_logout_redirect_uri` by same-origin against the client's registered redirect, rejecting cross-origin or non-absolute destinations.

## Why it matters

Sign-out used to revoke the token pair and clear local storage while the `httpOnly` `hub_session` cookie survived — so the next visit to a protected route silently re-authenticated the user, making logout apparent but not real. Now sign-out navigates through the BFF to the hub, which clears the cookie on its own domain, ending the session in both `local-provider` (same-origin) and `aurora-hub` (cross-domain) topologies. The frontend never learns the hub URL — the BFF owns it, symmetric to login. Constraining the post-logout redirect to the registered origin keeps the endpoint from becoming an open redirect.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/2169b75bf56639459517dded70036bba8dfd7255/openspec/changes/archive/2026-06-09-add-rp-initiated-hub-logout/)
