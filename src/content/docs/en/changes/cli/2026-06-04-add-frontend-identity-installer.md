---
title: "Frontend Identity installer"
description: "catalyst add frontend now installs the combined Identity (IAM + OAuth) package, wiring routes, navigation, icons and the IAM account adapter into a clean frontend."
date: 2026-06-04
version: "Unreleased"
classification: feature
source_commit: "4550336b34c6769b5a9ec9625d740be70cb909ec"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/4550336b34c6769b5a9ec9625d740be70cb909ec/openspec/changes/archive/2026-06-04-add-frontend-identity-installer/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- `catalyst add frontend` now offers a combined **Identity (IAM + OAuth)** package that copies both member trees into a clean Aurora frontend.
- The installer registers admin routes, sidebar navigation and icons for both modules, and swaps `aurora.provider.ts` to the IAM current-account adapter so an IAM-backed session actually loads. It is idempotent and formats the files it touches with your Prettier.

## Why it matters

Until now `catalyst add frontend` was copy-only and left the four shared scaffold files (admin routes, navigation data, sidebar, `aurora.provider.ts`) untouched — so an identity install was unrouted, missing from the sidebar, short of icons, and stuck on the anonymous account adapter. You can now drop a working identity UI into a clean frontend in one command, mirroring the backend Identity installer. It adds no login UI, no dependencies, and does not touch navigation i18n.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/4550336b34c6769b5a9ec9625d740be70cb909ec/openspec/changes/archive/2026-06-04-add-frontend-identity-installer/)
