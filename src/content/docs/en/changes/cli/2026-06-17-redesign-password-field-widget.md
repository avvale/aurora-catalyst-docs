---
title: "Rich password field by default"
description: "Generated password fields now emit a shared aurora-password-input with show/hide, a secure generator, and a strength meter — no more hand-wiring."
date: 2026-06-17
version: "Unreleased"
classification: feature
source_commit: "49897aa3760888352f7db1b4d1c304418293528e"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/49897aa3760888352f7db1b4d1c304418293528e/openspec/changes/archive/2026-06-17-redesign-password-field-widget/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- A field declared `type: password` now generates a shared `<aurora-password-input>` with a show/hide toggle and a secure password generator built into the input, plus a sibling password-strength meter.
- The rich password experience is now the generator baseline, not a hand-written per-form override.

## Why it matters

Until now only the hand-authored account form had the rich password UX; every other password field shipped a bare `<input type="password">`, and improving any of them meant wiring it by hand — exactly the anti-pattern Aurora exists to remove. Now any `type: password` field gets the toggle, the crypto-secure generator (`createPassword`), and the strength meter automatically. Accessibility labels live in the global i18n namespace. On the next regeneration, password forms surface an `.origin` you accept per file.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/49897aa3760888352f7db1b4d1c304418293528e/openspec/changes/archive/2026-06-17-redesign-password-field-widget/)
