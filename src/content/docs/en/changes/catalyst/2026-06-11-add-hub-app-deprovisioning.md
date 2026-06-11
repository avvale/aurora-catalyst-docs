---
title: "OAuth deprovisioning on delete"
description: "Deleting a HUB app now atomically tears down its OAuth identity — application, clients, and refresh tokens — and frees its code for re-registration."
date: 2026-06-11
version: "Unreleased"
classification: feature
source_commit: "f55fa4f57bc968031eea633a79ad6f347ed3f044"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/f55fa4f57bc968031eea633a79ad6f347ed3f044/openspec/changes/archive/2026-06-11-add-hub-app-deprovisioning/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- Deleting a `HubApp` now deprovisions its OAuth identity in the same all-or-nothing transaction: the OAuth application, its clients, their link rows, and every refresh token of those clients are hard-deleted. Any failure rolls everything back.
- Access tokens are deliberately left to expire on their own and are purged later by the existing token-retention job — only the renewal vector dies immediately.
- Because the OAuth application is physically removed, the app's unique `code` is freed and can be registered again; the delete confirmation dialog now warns that credentials and SSO end immediately and irreversibly.

## Why it matters

This is the mirror of provisioning-on-register. Before, deleting an app left its OAuth identity orphaned: the code stayed occupied forever and the satellite's sessions could keep renewing indefinitely. Now deletion is a real teardown — a deleted app can no longer renew a session, and the catalog keeps its history while the credentials genuinely disappear. The HUB delete flow is the single owner of deprovisioning, completing the no-drift guarantee in both directions.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/f55fa4f57bc968031eea633a79ad6f347ed3f044/openspec/changes/archive/2026-06-11-add-hub-app-deprovisioning/)
