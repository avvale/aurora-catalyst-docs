---
title: "Composables: atoms y presets"
description: "Por qué @aurora/composables separa la capa cerebro en atoms de responsabilidad única y presets opinados, y cómo el binding layer los conecta a TanStack Table."
---

## Por qué existe

La capa visual de Aurora ya estaba atomizada. `hlm-checkbox`, `hlm-input`, `hlm-popover`, `hlm-button` — cada uno hace una sola cosa, y las composiciones complejas (un formulario, un dialog) se construyen pegando piezas. La capa cerebro no lo estaba. `useDataTable` mezclaba sort, paginación, filtros de columna, visibilidad, selección y orden de columnas en un único blob de signals; la familia `useGraphqlX` vivía dispersa en `@aurora/modules/graphql/composables/`; `useAggregateShell` vivía en `@aurora/lib/`. Cuando una pantalla necesitaba algo ligeramente fuera del caso canónico — un manager many-to-many con dos tablas paginadas coordinadas, por ejemplo — las únicas opciones eran duplicar todo el boilerplate o escribir un nuevo composable monolítico que solapaba responsabilidades con el existente. Ninguna produce una arquitectura sostenible para "cientos de proyectos muy diferentes", que es la restricción de diseño explícita de Aurora Catalyst.

La salida es alinear la capa cerebro con la visual: composables de responsabilidad única ("las piezas lego") bajo `atoms/`, más composiciones opinadas bajo `presets/` para los casos típicos. Un consumer con una necesidad rara (kanban, virtual list, tree table) elige los atoms; el caso común (lista paginada en servidor) elige el preset. El estado vive en **un único sitio** — los atoms — y los presets son orquestación pura encima.

## Cómo funciona

### Atoms vs presets — la regla

Un **atom** es un composable con exactamente un concern, sin composición interna de otros composables, sin imports de UI, y una forma retornable hecha de signals readonly más setters explícitos. Si un atom necesitaría importar otro atom para hacer su trabajo, no es atom — es preset.

Un **preset** es la composición opinada. Toma los atoms que necesita (o los instancia con defaults), conecta sus reglas transversales (por ejemplo, "cuando el atom de búsqueda cambia, resetea la paginación a la página 0 antes de refrescar") y expone una API unificada adaptada a un caso típico.

Esta disciplina previene el pegamento prematuro. `useTableSort` no sabe nada de `useTablePagination`; solo guarda un signal `SortingState`. Que "cambiar el sort dispare un refetch y resetee el page index" es una propiedad del caso "lista paginada en servidor", no de ninguno de los dos atoms — por eso vive en `usePaginatedDataTable`, el preset.

### Organización por subdominio

Los atoms viven bajo `@aurora/composables/atoms/<subdominio>/`:

- `atoms/data-table/` — primitivas de estado de tabla (búsqueda, sort, paginación, filtros, selección, visibilidad de columna, orden de columna, exportación, carga de datos).
- `atoms/graphql/` — un composable por operación GraphQL, cada uno delegando en un fetcher puro bajo `@aurora/modules/graphql/fetchers/`.

Los presets viven planos bajo `@aurora/composables/presets/`. Son menos numerosos y a menudo cruzan subdominios (un preset puede componer atoms de data-table y de graphql), así que una taxonomía más profunda añade fricción sin valor.

La cadena de barrels reexporta todo desde el alias raíz, así que los consumers escriben:

```ts
import { useTableSort, usePaginatedDataTable, useGraphqlList } from '@aurora';
```

sin tener que conocer la ruta interna.

### El binding layer — `useDataTable`

`useDataTable` es el preset que conecta los atoms con TanStack. Acepta atoms (o los instancia con defaults) y produce un `Table<T>` cuyos `state.sorting`, `state.pagination`, `state.columnFilters`, `state.rowSelection`, `state.columnVisibility` y `state.columnOrder` están enlazados a las señales del atom. Los callbacks `onXxxChange` de TanStack delegan en los setters de los atoms. **No hay signals propios dentro de `useDataTable`** — el estado vive una sola vez, en los atoms, y el binding es solo cableado.

### Catálogo de atoms — `data-table`

| Atom                          | Responsabilidad única                                                            |
| ----------------------------- | -------------------------------------------------------------------------------- |
| `useTableSearch`              | Query de búsqueda libre más un signal derivado con debounce para refetch.        |
| `useTableSort`                | `SortingState` compatible con TanStack.                                          |
| `useTablePagination`          | `{ pageIndex, pageSize }` más accessors `offset` / `limit`.                      |
| `useTableFilters`             | `ColumnFilter[]` con la forma de Catalyst (consumido por `buildFilterWhere`).    |
| `useTableSelection`           | `Set<string>` de ids seleccionados; persiste a través de cambios de datos cuando se cablea `getRowId`. |
| `useTableColumnVisibility`    | `VisibilityState` en memoria. La persistencia se delega a un wrapper aparte.     |
| `useTableColumnOrder`         | `ColumnOrderState`.                                                              |
| `useTableExport`              | Helpers puros — generan blobs CSV/XLS y disparan la descarga. Sin estado.        |
| `useTableData<T>`             | Carga server-paginated vía un callback `paginate`; soporta `seed()` para prefetch desde resolver. |

### Catálogo de atoms — `graphql`

Cada atom delega en su fetcher bajo `@aurora/modules/graphql/fetchers/`. La responsabilidad del atom se limita al ciclo de vida del signal `loading`; ningún `apollo.query` / `apollo.mutate` vive dentro de un atom.

| Atom                       | Fetcher en el que delega    | Qué hace                                                  |
| -------------------------- | --------------------------- | --------------------------------------------------------- |
| `useGraphqlPaginate`       | `queryPaginate`             | Lectura paginada de lista.                                |
| `useGraphqlGet`            | `queryGet`                  | Lectura multi-registro sin paginar.                       |
| `useGraphqlFind`           | `queryFind`                 | Lectura de un registro por criterio.                      |
| `useGraphqlFindById`       | `queryFindById`             | Lectura de un registro por id.                            |
| `useGraphqlCreate`         | `mutateCreate`              | Creación de una sola fila.                                |
| `useGraphqlInsert`         | `mutateInsert`              | Creación en bulk — diseñado para agregados pivot.         |
| `useGraphqlUpdate`         | `mutateUpdate`              | Actualización.                                            |
| `useGraphqlDeleteById`     | `mutateDeleteById`          | Borrado por PK simple.                                    |
| `useGraphqlDeleteByKeys`   | `mutateDeleteByKeys`        | Borrado por clave compuesta — agregados pivot con PK multi-columna. |
| `useGraphqlDelete`         | `mutateDelete`              | Borrado en bulk basado en where.                          |

### Catálogo de presets

| Preset                    | Compone                                                                                               | Úsalo cuando                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `useDataTable`            | Los atoms de data-table (o sus defaults) → `Table<T>` de TanStack.                                    | Quieres una tabla cuyo estado se gestiona vía atoms, sin escribir el cableado. |
| `usePaginatedDataTable`   | Todos los atoms de data-table + `useTableData` + `useDataTable`.                                      | Listas server-paginated. Sustituye el patrón inline `useDataTable + signals + fetchData`. |
| `useStaticDataTable`      | Atoms de data-table + `useDataTable` configurado para sort y paginación cliente-side.                 | Tablas cliente-side con las filas ya en memoria. Sin fetch.                   |
| `useGraphqlList`          | `useGraphqlPaginate` + `useGraphqlDeleteById`.                                                        | Cableado graphql de una página de lista (paginar + borrar por id).             |
| `useGraphqlDetail`        | `useGraphqlFindById` + `useGraphqlCreate` + `useGraphqlUpdate`.                                       | Cableado graphql de una página de detalle (lectura + crear + actualizar).      |
| `useAggregateShell`       | `useGraphqlList` + `useGraphqlDetail`.                                                                | Página completa de un agregado con vista de lista y detalle compartiendo shell. |
| `usePivotMembership`      | `useGraphqlGet` + `useGraphqlInsert` + `useGraphqlDelete`.                                            | La capa de membership de un many-to-many: set completo de ids, `link()`, `unlink()`, `refresh()`. |
| `useRelationshipPivot`    | Dos `usePaginatedDataTable` (linked + candidates) + un `usePivotMembership`.                          | Pantalla de manager many-to-many: dos tablas coordinadas más mutaciones del pivot. |

Tras un `link()` o `unlink()` exitoso, `useRelationshipPivot` invoca automáticamente `linked.refetch()`. La orquestación está en el preset; los atoms se mantienen limpios.

## Cuándo aplica

- Estás escribiendo una nueva página de lista paginada en servidor. Empieza por `usePaginatedDataTable + seed()`. Los handlers (`onSearch`, `onFiltersChange`, …) se reducen a one-liners.
- Estás escribiendo un manager many-to-many (los permisos de un rol, las tags de un usuario). Empieza por `useRelationshipPivot` — las dos tablas coordinadas, la membership del pivot y el auto-refetch ya están conectados.
- Necesitas una composición personalizada que no encaja en ningún preset (kanban, virtual list, tree table). Coge los atoms directamente y escribe la orquestación inline; promuévela a preset solo cuando un segundo consumer necesite la misma orquestación.
- Estás migrando un list component antiguo. El bloque inline `useDataTable + sortSignal + paginationSignal + filtersSignal + fetchData()` es el smell — sustitúyelo por `usePaginatedDataTable`. Espera perder unas 25 líneas por archivo.

## Concesiones y límites

- **La atomización para en "aparece en dos presets".** Un concern que solo aflora en un preset se queda inline. Atomizar especulativamente contamina `atoms/` con primitivas que nadie reusa.
- **La persistencia no es problema del atom.** `useTableColumnVisibility` y `useTableColumnOrder` son in-memory. Si necesitas persistir el layout por `gridId`, envuelve el atom en un composable separado que hable con `column-config-storage`. El atom se mantiene puro.
- **`useDataTable` ya no es propietario de estado.** El código que leía `useDataTable().sortSignal` directamente (porque la versión antigua lo exponía) ahora debe leerlo desde el atom — pasado por el caller o reexpuesto por el preset en su retorno.
- **Los imports a través de `@aurora` siguen resolviendo — excepto `grid-select-multiple-elements`.** Los barrels hacen transparente cada relocalización a nivel de import. La única superficie breaking es el contrato del componente `grid-select-multiple-elements`: ahora es un manager many-to-many con outputs `(linkRequested)` / `(unlinkRequested)`, no un picker batch con Apply/Cancel. Los consumers existentes deben migrar el cableado del template.
- **El codegen sigue emitiendo el patrón antiguo de list.** El generador de `aurora-catalyst-cli` aún no se ha actualizado para emitir `usePaginatedDataTable + seed()`. Hasta que aterrice el change hermano en el lado CLI, regenerar un módulo IAM de tipo lista lo revertirá al patrón inline antiguo. Las migraciones manuales se quedan en el patrón nuevo.

## Relacionado

- [Composables atómicos y nuevo manager](../../../changes/catalyst/2026-05-05-refactor-data-table-to-atomic-composables/) — el change que introdujo esta arquitectura.
- [Implementar grid-elements-manager](../../../guides/frontend/implement-grid-elements-manager/) — receta task-oriented para el manager one-to-many, patrón hermano.
- [Cell renderers](../cell-renderers/) — la contraparte en la capa visual: renderers por tipo bajo `cells/`, despachados por el codegen.
