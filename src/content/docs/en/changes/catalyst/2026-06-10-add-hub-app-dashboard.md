---
title: "HUB app registry and dashboard"
description: "New hub bounded context: register satellite applications and launch them from a responsive app-launcher dashboard with per-card icon, color, and link."
date: 2026-06-10
version: "Unreleased"
classification: feature
source_commit: "18d529e6ef97474bfb5b63f8c3db3eac8017ac6d"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/18d529e6ef97474bfb5b63f8c3db3eac8017ac6d/openspec/changes/archive/2026-06-10-add-hub-app-dashboard/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- Adds the `hub/app` registry module: register, query (paginate, list, find-by-id), and soft-delete satellite applications with their metadata — `code`, `name`, `url`, `icon`, `color`, `sort`, `isActive`, `description`.
- Adds the HUB dashboard, an app launcher that renders one card per active app in a responsive grid; activating a card navigates to the app's `url`, with explicit loading and empty states.
- Wires the HUB into the admin sidebar with its own icon and ships its UI strings in English and Spanish.

## Why it matters

The Aurora ecosystem revolves around satellite applications that delegate authentication to the central platform, but there was nowhere to register them or jump into them. You can now maintain a central catalog of satellite apps and give every authenticated user a single landing point to see and open them. This is the foundation milestone of the `hub` bounded context — OAuth provisioning and per-user favorites build on top of it.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/18d529e6ef97474bfb5b63f8c3db3eac8017ac6d/openspec/changes/archive/2026-06-10-add-hub-app-dashboard/)
