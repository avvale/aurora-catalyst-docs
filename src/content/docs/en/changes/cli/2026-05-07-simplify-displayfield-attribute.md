---
title: "Unified `displayField` schema"
description: "`front.templateDisplayField` is gone — `front.displayField` now auto-detects bare identifiers vs `{placeholder}` templates."
date: 2026-05-07
version: "Unreleased"
classification: breaking
source_commit: "1e43a47739202de45970bf29644cd56709d196fa"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/1e43a47739202de45970bf29644cd56709d196fa/openspec/changes/archive/2026-05-07-simplify-displayfield-attribute/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- BREAKING — `front.templateDisplayField` is removed from the YAML schema and from `ModuleDefinitionSchema['front']`. Aggregates that declared it MUST move the value into `front.displayField`.
- `front.displayField` accepts both shapes now: a bare property identifier (`'email'`) or an interpolation template (`'{code} - {name}'`). Detection is automatic — presence of `{<identifier>}` placeholders triggers template mode.
- `getDisplayFieldRef` and `getTemplateDisplayFieldExpr` are replaced by a single helper API that returns the right output for each call site (FK accessor key, delete-toast property, JS template literal).

## Why it matters

Two attributes for the same concept forced authors to relearn the distinction every time they touched a YAML schema. Collapsing into one auto-detected attribute removes the redundancy with zero loss of expressiveness — composite labels like `'{code} - {name}'` still work, but they live under the same key. Migration is one find/replace per former `templateDisplayField` declaration; the catalyst codebase had zero in-tree users at the time of the change, so the breakage surface in practice is empty.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/1e43a47739202de45970bf29644cd56709d196fa/openspec/changes/archive/2026-05-07-simplify-displayfield-attribute/)
