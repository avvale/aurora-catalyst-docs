---
title: "Client secrets hashed at rest"
description: "BREAKING: OAuthApplication.secret is now stored as a bcrypt hash, masked on every read, and verified with bcrypt.compare; frontend environments must carry the plaintext secret."
date: 2026-06-11
version: "Unreleased"
classification: breaking
source_commit: "2a40bd9908012dcab4ec010b5bcc19a4361d2137"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/2a40bd9908012dcab4ec010b5bcc19a4361d2137/openspec/changes/archive/2026-06-11-add-oauth-application-secret-hashing/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- **Breaking:** `OAuthApplication.secret` is now persisted as a bcrypt hash and masked to `undefined` on every read path; client authentication verifies the presented `client_secret` with `bcrypt.compare` on every grant (password, authorization_code, refresh_token).
- **Breaking:** the frontend `environment*.ts` files must carry the plaintext secret as `oAuth.applicationSecret` — the old pre-computed hash literal no longer authenticates.
- The bootstrap seeder now seeds a plaintext that is hashed on write, reconciles drift with `bcrypt.compare` so reboots never double-hash, and heals a legacy unhashed bootstrap secret on boot.

## Why it matters

Secrets were stored as the literal value sent on the wire, so any database read, admin listing, or backup dump exposed every usable `client_secret` in the platform. The migration path: update your frontend environments to the plaintext secret, and for satellite apps provisioned before this change, follow the documented re-registration / detect-and-hash strategy — otherwise their logins fail the bcrypt comparison. The one-time credential bundle still returns the plaintext; only the at-rest representation changed.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/2a40bd9908012dcab4ec010b5bcc19a4361d2137/openspec/changes/archive/2026-06-11-add-oauth-application-secret-hashing/)
