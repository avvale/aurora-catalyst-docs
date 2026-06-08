---
title: "Transparent token refresh"
description: "Expired-access-token GraphQL calls now refresh and retry silently instead of bouncing the user to sign-in, keeping sessions alive up to the refresh-token lifetime."
date: 2026-05-27
version: "Unreleased"
classification: feature
source_commit: "90c8d83a94124dd7b7f6deba51954e65532a393b"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/90c8d83a94124dd7b7f6deba51954e65532a393b/openspec/changes/archive/2026-05-27-add-transparent-token-refresh/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- When an in-page GraphQL operation fails with `UNAUTHENTICATED` because the access token expired, the Apollo error link now transparently calls `signInUsingRefreshToken()` and retries the original operation instead of redirecting to sign-in.
- Concurrent 401s share a single in-flight refresh, each operation retries at most once, and only user operations trigger it. Sign-in happens only when the refresh itself is unavailable or fails (`invalid_grant`).

## Why it matters

Access tokens last about an hour and refresh tokens about a month, but previously any access-token expiry kicked the user back to the login screen on the next navigation — even though the refresh token was still valid — forcing a re-login roughly every hour for no reason. Sessions now stay alive silently up to the refresh-token lifetime.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/90c8d83a94124dd7b7f6deba51954e65532a393b/openspec/changes/archive/2026-05-27-add-transparent-token-refresh/)
