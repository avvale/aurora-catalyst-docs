---
title: "Origin subcommand topic"
description: "`catalyst origin` ships with six idempotent verbs and `catalyst generate` no longer runs the interactive review; the `--no-review` flag is removed."
date: 2026-05-12
version: "Unreleased"
classification: breaking
source_commit: "8f2ee6d3f1450981119949419ed519e25bd52177"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/8f2ee6d3f1450981119949419ed519e25bd52177/openspec/changes/archive/2026-05-12-decouple-review-and-add-origin-subcommand/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- BREAKING — `catalyst generate` no longer triggers the interactive review at the end of a run, and the `--no-review` flag is removed (oclif rejects it as unknown). The closing log now points at `catalyst origin list` and `catalyst origin review`.
- New `catalyst origin` topic with six subcommands: `list`, `diff`, `accept`, `reject`, `ignore`, `review`. Each non-`review` verb takes an optional pathspec (cwd recursive when omitted; file or directory otherwise) and emits a structured `--json` summary on demand.
- The three mutating verbs (`accept`, `reject`, `ignore`) are atomic and idempotent — invoking them on a path without a `.origin` exits 0 with a `noop` entry, so AI agents and shell scripts can retry safely.

## Why it matters

The old end-of-run prompt was a hard wall for non-human consumers: CI pipelines, automation, and AI agents could not drive it, and `--no-review` only silenced it without giving back any tools to manage origins. Decoupling generation from review means `generate` always produces files; review is a separate verb you opt into. `catalyst origin review` keeps the interactive walk-through (with VS Code diff when `code` is on `PATH`), while the other five verbs expose the same domain operations as atomic, scriptable commands — single source of truth, identical behaviour whether driven by a human prompt or a script. Migration: drop `--no-review` from automation and call `catalyst origin review` after `generate` if you want the human flow. Next release is a major bump (`2.0.0` → `3.0.0`).

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/8f2ee6d3f1450981119949419ed519e25bd52177/openspec/changes/archive/2026-05-12-decouple-review-and-add-origin-subcommand/)
