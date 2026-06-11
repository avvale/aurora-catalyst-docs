---
title: "Permission refresh at token issuance"
description: "Every login and token renewal now recomputes the account's dPermissions snapshot from its current roles, so role permission changes actually reach users."
date: 2026-06-11
version: "Unreleased"
classification: feature
source_commit: "15878aea6259969da06ee4aeec8eb2574e17e4a2"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/15878aea6259969da06ee4aeec8eb2574e17e4a2/openspec/changes/archive/2026-06-11-refresh-dpermissions-on-token-issuance/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- All three OAuth grants (password, authorization_code, refresh_token) now refresh the account's denormalized `dPermissions` snapshot from its current roles and permissions at issuance, persisting it only when it actually changed.
- The cross-BC account loader (`IAccountLoader.loadById`) gains an opt-in `refreshPermissions` option; without it, behavior is exactly as before.
- The refresh is fail-soft: if the recompute or its persistence fails, tokens are still issued with the stored snapshot — a login is never blocked by the maintenance step.

## Why it matters

Granting or revoking a permission on a role previously never reached the accounts holding that role: the snapshot was only recomputed when the account itself was edited, so authorization ran against stale data indefinitely. Now the contract is simple — a role permission change takes effect at the user's next login or token renewal, plus at most the five-minute guard cache. Token response shapes, JWT claims, and all grant validations are unchanged.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/15878aea6259969da06ee4aeec8eb2574e17e4a2/openspec/changes/archive/2026-06-11-refresh-dpermissions-on-token-issuance/)
