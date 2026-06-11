---
title: "Composables: atoms y presets"
sidebar:
  order: 2
description: "Por qué @aurora/composables separa la capa cerebro en atoms de responsabilidad única y presets opinados, y cómo el binding layer los conecta a TanStack Table."
---

## Por qué existe

La capa visual de Aurora es atómica — `hlm-checkbox`, `hlm-input`, `hlm-button`: cada pieza hace una sola cosa y las composiciones complejas se construyen pegándolas. La capa cerebro sigue el mismo principio: en lugar de un único composable que lo hace todo, la lógica se reparte en atoms de responsabilidad única, y los casos típicos se arman con presets opinados por encima. Esta página describe esa convención. El argumento de fondo (por qué composición y no herencia) vive en [Composición vs herencia](../composition-over-inheritance/).

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

<div class="nowrap-first-col">



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

</div>

### Catálogo de atoms — `graphql`

Cada atom delega en su fetcher bajo `@aurora/modules/graphql/fetchers/`. La responsabilidad del atom se limita al ciclo de vida del signal `loading`; ningún `apollo.query` / `apollo.mutate` vive dentro de un atom.

<div class="nowrap-first-col">

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

</div>

### Catálogo de presets

<div class="nowrap-first-col">

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

</div>

Tras un `link()` o `unlink()` exitoso, `useRelationshipPivot` invoca automáticamente `linked.refetch()`. La orquestación está en el preset; los atoms se mantienen limpios.

## Cuándo aplica

- Estás escribiendo una nueva página de lista paginada en servidor. Empieza por `usePaginatedDataTable + seed()`. Los handlers (`onSearch`, `onFiltersChange`, …) se reducen a one-liners.
- Estás escribiendo un manager many-to-many (los permisos de un rol, las tags de un usuario). Empieza por `useRelationshipPivot` — las dos tablas coordinadas, la membership del pivot y el auto-refetch ya están conectados.
- Necesitas una composición personalizada que no encaja en ningún preset (kanban, virtual list, tree table). Coge los atoms directamente y escribe la orquestación inline; promuévela a preset solo cuando un segundo consumer necesite la misma orquestación.
- Tienes una lista con el cableado inline `useDataTable + sortSignal + paginationSignal + filtersSignal + fetchData()`. Ese bloque es el smell — sustitúyelo por `usePaginatedDataTable`. Espera perder unas 25 líneas por archivo.

## Concesiones y límites

- **La atomización para en "aparece en dos presets".** Un concern que solo aflora en un preset se queda inline. Atomizar especulativamente contamina `atoms/` con primitivas que nadie reusa.
- **La persistencia no es problema del atom.** `useTableColumnVisibility` y `useTableColumnOrder` son in-memory. Si necesitas persistir el layout por `gridId`, envuelve el atom en un composable separado que hable con `column-config-storage`. El atom se mantiene puro.
- **`useDataTable` no es propietario de estado.** Es puro cableado. Para leer sort, paginación o cualquier otro estado, hazlo desde el atom correspondiente — pasado por el caller o reexpuesto por el preset en su retorno.
- **`grid-select-multiple-elements` exige un cableado específico.** Los barrels de `@aurora` mantienen los imports resolviendo de forma transparente, así que el resto de componentes no requieren atención. La excepción es este: es un manager many-to-many con outputs `(linkRequested)` / `(unlinkRequested)`, y el template que lo monta debe cablear esos outputs. Solo emite la intención porque no sabe dónde persistir el vínculo: la pertenencia se muta al instante, fuera del ciclo create/update del formulario, así que el orquestador host hace la mutación y refresca los datos.

## Relacionado

- [Composables atómicos y nuevo manager](../../../changes/catalyst/2026-05-05-refactor-data-table-to-atomic-composables/) — el change que introdujo esta arquitectura.
- [Implementar grid-elements-manager](../../../guides/frontend/implement-grid-elements-manager/) — receta task-oriented para el manager one-to-many, patrón hermano.
- [Cell renderers](../cell-renderers/) — la contraparte en la capa visual: renderers por tipo bajo `cells/`, despachados por el codegen.
