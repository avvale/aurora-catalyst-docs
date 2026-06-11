---
title: "Per-user dashboard preferences"
description: "Star favorites and drag-and-drop ordering on the HUB dashboard, saved per user via new toggle-favorite, reorder-apps, and my-preferences endpoints."
date: 2026-06-10
version: "Unreleased"
classification: feature
source_commit: "11af874f36473608c69cedec257834257f36c6f9"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/11af874f36473608c69cedec257834257f36c6f9/openspec/changes/archive/2026-06-10-add-hub-app-favorites/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- Each dashboard card gains a favorite star, and both the favorites and non-favorites groups can be reordered by drag and drop; the arrangement is saved per user, with the admin-defined `sort` as fallback.
- Adds three endpoints on `hub/app` — `toggle-favorite`, `reorder-apps`, and `my-preferences` — that resolve the account server-side from the request principal; the client never sends an `accountId`.
- The dashboard read (`hubGetApps`) and the preference endpoints open to any authenticated user, fixing the 403 non-admins previously hit on their own landing page.

## Why it matters

The dashboard is the post-login landing for every user, yet everyone saw the same admin-defined order. Each user can now pin their daily apps first and arrange both groups to their liking, with optimistic toggle and reorder that revert on error. The preference rows are created lazily on first interaction and are strictly scoped to the authenticated account — one user can never read or modify another's arrangement. Admin CRUD on apps keeps its existing permission gates.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/11af874f36473608c69cedec257834257f36c6f9/openspec/changes/archive/2026-06-10-add-hub-app-favorites/)
