---
title: "GraphQL login for local provider"
description: "A new oAuthCreateToken GraphQL mutation (Password + Refresh grants) completes the local-provider login flow in the browser, twin of the REST token endpoint."
date: 2026-05-26
version: "Unreleased"
classification: feature
source_commit: "2ba8a72f3e1aff639b3182bfdb5cc4d8aed0a987"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/2ba8a72f3e1aff639b3182bfdb5cc4d8aed0a987/openspec/changes/archive/2026-05-26-add-local-provider-graphql-login/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- Adds the GraphQL mutation `oAuthCreateToken(payload: OAuthCreateTokenInput!): OAuthTokens!` (Password and Refresh Token grants) — the twin of the REST `POST /api/o-auth/token`, both delegating to the same composite handler.
- Wires the Aurora login form to that mutation: in-flight loading state, guard verification, redirect to `/` on success (staying on `/auth/sign-in` on failure), and `authenticationPasswordGuard` on protected routes. Login strings are translatable.

## Why it matters

The local-provider backend shipped a REST token endpoint, but the frontend called a GraphQL mutation that did not exist — so the login form was broken against it. The flow now works end to end in the browser. REST remains for RFC 6749-conformant external clients; GraphQL serves Aurora's own frontends — one business flow over two transports. An unsupported `grant_type` returns an OAuth2-conformant error.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/2ba8a72f3e1aff639b3182bfdb5cc4d8aed0a987/openspec/changes/archive/2026-05-26-add-local-provider-graphql-login/)
