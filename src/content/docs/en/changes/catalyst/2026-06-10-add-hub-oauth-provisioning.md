---
title: "OAuth provisioning on register"
description: "Registering a HUB app now atomically provisions its OAuth identity and hands you a one-time .env credential bundle with the generated secret."
date: 2026-06-10
version: "Unreleased"
classification: feature
source_commit: "7426f19dbc88c4ab65b416427a951210a43f5f85"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/7426f19dbc88c4ab65b416427a951210a43f5f85/openspec/changes/archive/2026-06-10-add-hub-oauth-provisioning/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- Registering a `HubApp` now provisions its OAuth identity — application, authorization-code client, and their link — in a single all-or-nothing transaction; any failure rolls the whole registration back.
- The register form requires a `redirectUri` (absolute `http(s)` URL), and after registration a show-once dialog presents the `.env` block the satellite needs — issuer URL, application code, generated secret, and redirect URI — with a copy button. The secret is never retrievable again.
- Each `HubApp` carries a unique `applicationId` linking its provisioned OAuth application, with no physical foreign key between the two bounded contexts.

## Why it matters

Before this, a registered app was pure metadata: it had no OAuth identity, so it could not participate in the SSO flow. Now registering an app is all it takes to make it SSO-capable — the HUB create flow is the single owner of satellite OAuth provisioning, so the catalog and the real OAuth clients can never drift apart. The client is born with empty scopes; you configure them later in the `o-auth` module.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/7426f19dbc88c4ab65b416427a951210a43f5f85/openspec/changes/archive/2026-06-10-add-hub-oauth-provisioning/)
