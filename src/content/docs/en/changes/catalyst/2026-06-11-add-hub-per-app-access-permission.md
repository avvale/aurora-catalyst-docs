---
title: "Per-app access permissions"
description: "Each satellite app now gets its own <code>.access IAM permission; the HUB dashboard shows a user only the apps their roles grant."
date: 2026-06-11
version: "Unreleased"
classification: feature
source_commit: "a19011dbe0608c483e3027375cd1d56cbd8c344a"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/a19011dbe0608c483e3027375cd1d56cbd8c344a/openspec/changes/archive/2026-06-11-add-hub-per-app-access-permission/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- Registering a satellite app now also creates an IAM bounded context named after the app's `code` and a dynamic `<code>.access` permission attached to the Administrator role — inside the same atomic registration transaction. Deleting the app removes both.
- The dashboard read filters server-side: a user sees only the apps whose `<code>.access` permission their roles grant; administrators see everything because they hold every permission, with no special-casing.
- A namespace-collision guard fails the whole registration when the `code` clashes with an existing bounded-context or permission name, and an idempotent boot pass backfills the permission for apps registered before this change.

## Why it matters

Until now, anyone who could open the dashboard saw every registered app. You can now grant access app by app through the standard IAM roles UI — each satellite uses the platform's usual `<bc>.access` permission shape, exactly like `hub.access` gates the HUB itself. Grants reach users at their next login or token refresh. Enforcing the permission in the OAuth authorize flow is a noted follow-up; this change gates dashboard visibility.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/a19011dbe0608c483e3027375cd1d56cbd8c344a/openspec/changes/archive/2026-06-11-add-hub-per-app-access-permission/)
