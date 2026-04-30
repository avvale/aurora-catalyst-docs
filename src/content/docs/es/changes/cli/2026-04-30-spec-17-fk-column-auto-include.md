---
title: "Columnas FK automáticas en listas"
description: "Las listas muestran una columna por cada FK many-to-one y el codegen cablea `getRelationIncludes` con los includes Sequelize en la llamada a paginate."
date: 2026-04-30
version: "Unreleased"
classification: feature
source_commit: "77945962c7228c7a6f92c75ede0a3cbe5119ccc0"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/77945962c7228c7a6f92c75ede0a3cbe5119ccc0/openspec/changes/archive/2026-04-30-spec-17-fk-column-auto-include/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Para cada relación many-to-one, `<mod>.columns.ts` emite una columna con `accessorKey: '<rel>.name'`, `relation: { association: '<rel>' }` y los flags estándar `sortable` / `searchable` / `filterable` / `exportable`. La posición respeta el orden de declaración de la FK en el YAML.
- El list-component importa `getRelationIncludes` desde `@aurora`, declara un campo `relationIncludes` y pasa `include` tanto en `query` como en `constraint` de la llamada a `paginate()`. El resolver de la lista cablea el mismo include para la precarga de la primera página, para que la tabla renderice sin parpadeos.
- La búsqueda y los filtros sobre columnas FK funcionan sin codegen extra — los helpers existentes `buildSearchWhere` / `buildFilterWhere` traducen `boundedContext.name` a `$boundedContext.name$` en Sequelize. Los aggregates sin FK many-to-one regeneran byte a byte idénticos.

## Por qué importa

Antes, la lista de un agregado con FKs mostraba los campos locales pero ocultaba los UUIDs `<rel>Id` — un listado de permissions no mostraba a qué bounded-context pertenecía cada fila, lo que lo hacía inservible como herramienta de exploración. Los devs escribían la columna FK a mano y cada regen producía un `.origin` que reconciliar. El codegen ahora se hace cargo de extremo a extremo: emisión de la columna, include en el resolver para la precarga, include en el list-component para `paginate` en runtime y traducción de dot-paths en search/filter. El label se asume `name` en el target; los aggregates con label composite (`{code} - {name}`) o sin `name` quedan diferidos a un follow-up.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/77945962c7228c7a6f92c75ede0a3cbe5119ccc0/openspec/changes/archive/2026-04-30-spec-17-fk-column-auto-include/)
