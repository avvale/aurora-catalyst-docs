---
title: "MJML email template adapter"
description: "The mailer moves to the MJML template adapter and drops the abandoned handlebars-helpers dependency — a breaking change for anyone relying on its ~180 helpers."
date: 2026-06-02
version: "Unreleased"
classification: breaking
source_commit: "f6e4ea61dd17c20cc374514291a319c9073adaf4"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/f6e4ea61dd17c20cc374514291a319c9073adaf4/openspec/changes/archive/2026-06-02-replace-handlebars-helpers-with-mjml-adapter/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- **Breaking:** the mailer's template engine moves to `@nestjs-modules/mailer`'s `MjmlAdapter` (wrapping Handlebars), and the abandoned `handlebars-helpers` dependency is removed — its ~180 generic helpers are no longer available inside email templates.
- Email templates are now authored in MJML (compiled to responsive, CSS-inlined HTML); a base layout and a sample template ship, and the custom i18n `t` helper is preserved.

## Why it matters

`handlebars-helpers@0.10.0` (last published around 2018) dragged in security-deprecated transitives for no benefit — there are no email templates today and the mailer is disabled by default (`MAILER_ENABLED !== 'true'`). Going forward you author templates in MJML and get bulletproof responsive HTML without a custom adapter. If you depended on any of the 180 Handlebars helpers you must replace them; the default-disabled boot behavior is unchanged.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/f6e4ea61dd17c20cc374514291a319c9073adaf4/openspec/changes/archive/2026-06-02-replace-handlebars-helpers-with-mjml-adapter/)
