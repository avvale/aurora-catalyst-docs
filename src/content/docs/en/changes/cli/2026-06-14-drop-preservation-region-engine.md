---
title: "Preservation regions removed"
description: "The AURORA:FORM-FIELDS preservation region and its whole engine are gone — .origin reconciliation is now the single seam for customizing generated code."
date: 2026-06-14
version: "Unreleased"
classification: breaking
source_commit: "6434d041cba6acb2d8c43834970361a57fae3fa4"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/6434d041cba6acb2d8c43834970361a57fae3fa4/openspec/changes/archive/2026-06-14-drop-preservation-region-engine/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- **Breaking:** the `AURORA:FORM-FIELDS` preservation region — the only one the codegen shipped — and the entire region engine are removed. Generated files no longer carry region markers.
- File integrity is now a plain whole-file `sha1`, and `.origin` reconciliation becomes the single seam for customizing generated code.
- Scalar-array fields carrying a relational widget now emit their options input correctly.

## Why it matters

The region was meant to protect your custom form HTML across regenerations, but it also froze that block: when the template's markup improved, the change never propagated to existing modules. That is the trade you are escaping. From now on every generated file follows one uniform rule, and you keep custom edits through `catalyst origin diff / accept / reject`. On the first `catalyst generate` after upgrading, existing forms produce an `.origin` to review — standard forms accept trivially, and any custom body is re-applied from the diff.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/6434d041cba6acb2d8c43834970361a57fae3fa4/openspec/changes/archive/2026-06-14-drop-preservation-region-engine/)
