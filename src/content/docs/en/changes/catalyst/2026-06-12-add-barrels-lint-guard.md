---
title: "Barrel-import lint guard"
description: "A new pnpm hr:lint-barrels command enforces barrel-import discipline across backend and frontend, wired into a PostToolUse hook, pre-commit, and CI."
date: 2026-06-12
version: "Unreleased"
classification: feature
source_commit: "297e038c11b31954cde99c1f26702082d6af7281"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/297e038c11b31954cde99c1f26702082d6af7281/openspec/changes/archive/2026-06-12-add-barrels-lint-guard/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- New `pnpm hr:lint-barrels` command: a deterministic lint that enforces barrel-import discipline (HR-BARRELS-001/002) across backend and frontend.
- It runs in three places — a `PostToolUse` hook, a pre-commit hook, and a full-project CI/audit mode.
- Exit codes follow catalog severity (blocking violations fail, informational ones only warn); generated files are reported separately and never fail the run.

## Why it matters

Barrel discipline used to be advisory, and it drifted — deep-path imports slipped in after the rule existed. The guard makes it enforceable: a blocking violation now stops a commit, and when the AI writes a deep-path import the hook hands it the rule, the line, and the barrel to use instead. It resolves every specifier (path aliases and relative paths) to compare governed units, scans imports, exports and `jest.mock` calls, and checks the `@bridges` two-surface policy structurally.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/297e038c11b31954cde99c1f26702082d6af7281/openspec/changes/archive/2026-06-12-add-barrels-lint-guard/)
