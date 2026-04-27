---
title: "Rename `webComponent` to `widget`"
description: "BREAKING — the YAML namespace `webComponent` is renamed to `widget` everywhere. Hard cutover with no alias and no deprecation period."
date: 2026-04-26
version: "Unreleased"
classification: breaking
source_commit: "773499a5266d7775d98e956ec8e374ba863f42ba"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/773499a5266d7775d98e956ec8e374ba863f42ba/openspec/changes/archive/2026-04-26-rename-web-component-to-widget/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- The top-level YAML namespace `webComponent` is renamed to `widget` across the entire schema (`aurora-1.4.json`, the TS model, every generator helper, and every Eta template).
- Sub-keys keep their existing names: `widget.type`, `widget.group`, `widget.tab`, `widget.detailSort`, `widget.isDetailHidden`, `widget.listSort`, `widget.isListHidden`, `widget.displayFields`, `widget.className`. Only the namespace moves.
- A YAML that still declares `webComponent:` fails the schema loader with a descriptive error pointing at the offending file and the required rename.

## Why it matters

The previous name conflated Aurora's UI controls with the W3C "Web Components" standard (Custom Elements + Shadow DOM); what Aurora actually emits are Angular components. `widget` is stack-neutral, free from collisions with Angular `@Component`, NestJS `@Injectable`, ReactiveForms `FormControl`, or HTML `<input>`. Update every `cliter/**/*.aurora.yaml` in the same commit as the CLI bump — the cutover is hard and there is no alias to fall back on. Generated output is byte-identical for modules that update their YAMLs.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/773499a5266d7775d98e956ec8e374ba863f42ba/openspec/changes/archive/2026-04-26-rename-web-component-to-widget/)
