---
title: "Preservation regions for HTML"
description: "Preservation regions let you mark zones of generated HTML with AURORA:NAME markers. Your hand-written or AI edits survive regeneration while untouched regions still receive template improvements."
date: 2026-04-18
version: "Unreleased"
classification: feature
source_commit: "79c30b8f0bb7b3eb894c33374707926bd2bf5449"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/79c30b8f0bb7b3eb894c33374707926bd2bf5449/openspec/changes/archive/2026-04-18-preservation-regions/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- Declare a preservation region in HTML with `<!-- #region AURORA:NAME-START -->` and close it with `<!-- #endregion AURORA:NAME-END -->`. Names follow an uppercase + digits + hyphen grammar (hyphens only between non-empty groups).
- Your edits inside a region survive regeneration byte-for-byte. If you never touched it, the template's updated body flows in automatically on the next sync.
- `[REGION DROPPED] <file>: <name>` is always visible whenever a template stops declaring a region and your custom body would be lost. Under `--verbose`, `[REGION UPDATED]` and `[REGION PRESERVED]` report per-region decisions.

## Why it matters

You can now co-own generated files with the engine: hand-tune a form layout, paste AI-generated validators, keep your markup, and still pull template improvements without solving a manual merge every time. The lockfile format bumps to `0.1.0` so the CLI can track a content hash per region; older `0.0.1` lockfiles without the `regions` field remain valid and fall back to a safe "preserve everything" mode until the next regeneration. Scope is HTML only today — future changes can extend the same mechanism to TS and CSS comments without breaking the contract.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/79c30b8f0bb7b3eb894c33374707926bd2bf5449/openspec/changes/archive/2026-04-18-preservation-regions/)
