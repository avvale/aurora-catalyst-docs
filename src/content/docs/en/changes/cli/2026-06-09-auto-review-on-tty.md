---
title: "Auto review on TTY for generate"
description: "catalyst generate now opens the interactive .origin review automatically on a terminal, with new --review / --no-review flags to force either mode."
date: 2026-06-09
version: "v1.0.2"
classification: feature
source_commit: "dccd05508c72d48b58dce66dcf65099e3581b91f"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/dccd05508c72d48b58dce66dcf65099e3581b91f/openspec/changes/archive/2026-06-09-auto-review-on-tty/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- `catalyst generate` now starts the interactive `.origin` walk-through automatically when it produced origin files and stdout is a terminal — the same session `catalyst origin review` runs.
- Adds two mutually exclusive flags: `--review` forces the walk-through even without a TTY, and `--no-review` (re-introduced) forces the old skip behavior.
- Piped, CI, and agent runs (no TTY) keep the guaranteed non-interactive behavior and the closing summary pointing at `catalyst origin list` / `catalyst origin review`.

## Why it matters

Until now every `generate` that produced `.origin` proposals made you type a second command to act on them, because the command was hard-wired to never prompt. The TTY branch gives humans the review immediately while automation keeps its no-prompt guarantee — no flag to remember on either side. When auto-detection guesses wrong, the explicit flags override it. If the interactive session ends with origins still pending, the closing summary still tells you how many remain.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/dccd05508c72d48b58dce66dcf65099e3581b91f/openspec/changes/archive/2026-06-09-auto-review-on-tty/)
