---
title: "Añadir GraphQL Fetchers"
description: "Siete nuevos fetchers queryX / mutateX exponen llamadas GraphQL puras de una sola emisión — los resolvers ya no necesitan montar un composable para precargar datos."
date: 2026-04-22
version: "Unreleased"
classification: feature
source_commit: "7a17c6e1add03d4b6b5bce810df80723f7199204"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/7a17c6e1add03d4b6b5bce810df80723f7199204/openspec/changes/archive/2026-04-22-query-mutate-layer-separation/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Siete fetchers nuevos en `@aurora/modules/graphql/fetchers/`: `queryPaginate`, `queryFindById`, `queryFind`, `queryGet`, `mutateCreate`, `mutateUpdate`, `mutateDeleteById`. Cada uno devuelve un `Observable<T>` puro, sin signals y sin depender del contexto de ejecución de un componente.
- Nuevo composable `useGraphqlGet` para lecturas múltiples sin paginación — refleja la forma generada `getQuery` / `objects:`.
- `useGraphqlFind` se realinea a semántica de un solo registro (`T | null`) para coincidir con `findQuery` / `object:`. Las lecturas plurales viven ahora en `useGraphqlGet`; ningún composable publicado previamente cambia su forma pública.

## Por qué importa

Los resolvers ya pueden llamar a GraphQL sin levantar un composable. Desestructura `queryPagination`, `paginationKey` y `fields` desde tu `*_LIST_CONFIG` generado, invoca `queryPaginate(...)` y devuelve el observable — sin signals muertas, sin contrato de ciclo de vida del componente filtrándose al router. Cada `useGraphqlX` previamente publicado conserva su API pública, así que los componentes existentes siguen compilando sin tocar un solo import. La separación fetcher / composable deja una costura limpia para añadir capacidades nuevas en cualquiera de las dos capas.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/7a17c6e1add03d4b6b5bce810df80723f7199204/openspec/changes/archive/2026-04-22-query-mutate-layer-separation/)
