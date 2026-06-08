---
title: "snake_case database naming"
description: "Generated Sequelize models now emit snake_case physical names (tables, columns, foreign keys) while TypeScript keeps camelCase — a breaking change for existing databases."
date: 2026-05-22
version: "Unreleased"
classification: breaking
source_commit: "79f8b1e4e533f1b48b510d46db0251e4542e37f1"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/79f8b1e4e533f1b48b510d46db0251e4542e37f1/openspec/changes/archive/2026-05-22-adopt-snake-case-db-naming/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- **Breaking:** generated Sequelize models now emit physical database names in `snake_case` — tables (`iam_tag`), columns (`row_id`, `created_at`) and foreign keys — while TypeScript and the Aurora model keep `camelCase` (`IamTagModel.rowId`).
- Each `@Column` emits an explicit `field: '<snake_case>'`, `@Table` keeps a PascalCase `modelName` for logs, and the scaffold sets `underscored: true` as a safety net.

## Why it matters

Postgres case-folds unquoted identifiers, so the previous PascalCase/camelCase names forced quoting across psql, pg_dump, views, triggers, replication and DBA tooling. With snake_case the database is idiomatic and quote-free, while your TypeScript surface is untouched. This is breaking for existing databases: a schema generated before this change uses the old names, so regenerating against a live database requires a migration that renames the affected tables and columns to their snake_case form.

---

[View original proposal](https://github.com/avvale/aurora-catalyst-cli/tree/79f8b1e4e533f1b48b510d46db0251e4542e37f1/openspec/changes/archive/2026-05-22-adopt-snake-case-db-naming/)
