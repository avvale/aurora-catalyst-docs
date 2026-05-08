---
title: "Empty-list translation seeded"
description: "Codegen now seeds `No<Plural>Found` in EN + ES so empty lists render a human message instead of the raw translation key."
date: 2026-05-08
version: "Unreleased"
classification: feature
source_commit: "c70036405358d68a5cd055c473a8118e88ebde5b"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/c70036405358d68a5cd055c473a8118e88ebde5b/openspec/changes/archive/2026-05-08-emit-no-results-found-translations/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- `generateFrontTranslations` seeds a `No<PluralPascal>Found` key under `frontend/public/i18n/<bc>/<lang>.json` per module, with a language-aware default: `'No <pluralLower> found.'` for `en`, `'No se encontraron <pluralLower>.'` for `es`. Unknown langCode falls back to the English form.
- The seed is idempotent — only writes when the key is currently `undefined`. Existing values (manually edited or previously seeded) are preserved verbatim.
- A new `NO_RESULTS_FOUND_DEFAULTS` dispatch map at the bottom of `code-writer.ts` is the single source of truth for these defaults; adding a new language is one entry.

## Why it matters

Every list-component already binds `[emptyMessage]="t('<bc>.<mod>.No<Plural>Found')"`, but the translation handler never seeded that key — five of seven IAM modules rendered the raw `iam.role.NoRolesFound` text in production when their list was empty. Regenerating any module of an existing BC backfills the key in both languages with no risk to other entries.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/c70036405358d68a5cd055c473a8118e88ebde5b/openspec/changes/archive/2026-05-08-emit-no-results-found-translations/)
