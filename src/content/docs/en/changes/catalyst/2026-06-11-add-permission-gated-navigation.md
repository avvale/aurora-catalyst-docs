---
title: "Permission-gated navigation"
description: "Sidebar items and routes can now require a permission: the menu hides what the session cannot use, and a reusable permissionGuard blocks unreachable routes."
date: 2026-06-11
version: "Unreleased"
classification: feature
source_commit: "276f3ac4073926a3c5e50e65ca316f5ae5d772ee"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/276f3ac4073926a3c5e50e65ca316f5ae5d772ee/openspec/changes/archive/2026-06-11-add-permission-gated-navigation/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- Nav items accept an optional `permission`; the sidebar renders only the entries the session holds, hides groups with no surviving children, and waits for the permission load so nothing forbidden flashes. Untagged items stay always-visible.
- Adds a reusable `permissionGuard(permission)` factory in `@aurora`, next to `authenticationGuard`, that awaits the async permission load and redirects to the landing route on denial.
- The `CurrentAccountService` port now exposes `permissions`, `hasPermission()`, and a `permissionsLoaded` readiness signal, fed from `dPermissions.all` by the IAM adapter; the HUB navigation and routes are the first consumer.

## Why it matters

The backend already enforces permissions on every endpoint, but the frontend rendered every menu entry and let users navigate into screens that only failed with a 403 on arrival. The menu and routes now mirror what the server would allow. This is a UX and defense-in-depth layer, not a security boundary — server-side enforcement remains the source of truth. Tagging the iam and o-auth navigation is an explicit follow-up.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/276f3ac4073926a3c5e50e65ca316f5ae5d772ee/openspec/changes/archive/2026-06-11-add-permission-gated-navigation/)
