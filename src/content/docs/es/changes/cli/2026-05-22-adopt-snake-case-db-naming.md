---
title: "Nombres de BD en snake_case"
description: "Los modelos Sequelize generados ahora emiten nombres físicos en snake_case (tablas, columnas, claves foráneas) mientras TypeScript mantiene camelCase — breaking para bases de datos existentes."
date: 2026-05-22
version: "Unreleased"
classification: breaking
source_commit: "79f8b1e4e533f1b48b510d46db0251e4542e37f1"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/79f8b1e4e533f1b48b510d46db0251e4542e37f1/openspec/changes/archive/2026-05-22-adopt-snake-case-db-naming/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- **Breaking:** los modelos Sequelize generados ahora emiten nombres físicos en `snake_case` — tablas (`iam_tag`), columnas (`row_id`, `created_at`) y claves foráneas — mientras TypeScript y el modelo Aurora mantienen `camelCase` (`IamTagModel.rowId`).
- Cada `@Column` emite un `field: '<snake_case>'` explícito, `@Table` conserva un `modelName` en PascalCase para los logs, y el scaffold pone `underscored: true` como red de seguridad.

## Por qué importa

Postgres aplica case-folding a los identificadores sin comillar, así que los nombres PascalCase/camelCase anteriores obligaban a comillar todo en psql, pg_dump, vistas, triggers, replicación y herramientas de DBA. Con snake_case la base de datos es idiomática y sin comillas, mientras tu superficie TypeScript queda intacta. Es breaking para bases de datos existentes: un esquema generado antes de este cambio usa los nombres antiguos, así que regenerar contra una base viva requiere una migración que renombre las tablas y columnas afectadas a su forma snake_case.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/79f8b1e4e533f1b48b510d46db0251e4542e37f1/openspec/changes/archive/2026-05-22-adopt-snake-case-db-naming/)
