---
title: "Composables: atoms and presets"
sidebar:
  order: 2
description: "Why @aurora/composables splits brain logic into single-responsibility atoms and opinionated presets, and how the binding layer wires them to TanStack Table."
---

## Why this exists

Aurora's visual layer is atomic — `hlm-checkbox`, `hlm-input`, `hlm-button`: each does one thing, and complex compositions are built by sticking those pieces together. The brain layer follows the same principle: instead of one composable that does everything, logic is split into single-responsibility atoms, with opinionated presets layered on top for the typical cases. This page describes that convention. The underlying argument (why composition rather than inheritance) lives in [Composition vs inheritance](../composition-over-inheritance/).

## How it works

### Atoms vs presets — the rule

An **atom** is a composable with exactly one concern, no internal composition of other composables, no UI imports, and a returnable shape made of readonly signals plus explicit setters. If an atom would need to import another atom to do its job, it is not an atom — it is a preset.

A **preset** is the opinionated composition. It takes the atoms it needs (or instantiates them with defaults), wires their cross-cutting rules (e.g. "when the search atom changes, reset the pagination atom to page 0 before refetching"), and exposes a unified API tailored to a typical case.

This discipline prevents premature glue. `useTableSort` does not know about `useTablePagination`; it just tracks a `SortingState` signal. The fact that "changing sort triggers a refetch and resets the page index" is a property of the server-paginated list use case, not a property of either atom — so it lives in `usePaginatedDataTable`, the preset.

### Subdomain organization

Atoms live under `@aurora/composables/atoms/<subdomain>/`:

- `atoms/data-table/` — table state primitives (search, sort, pagination, filters, selection, column visibility, column order, export, data load).
- `atoms/graphql/` — one composable per GraphQL operation, each delegating to a pure fetcher under `@aurora/modules/graphql/fetchers/`.

Presets live flat under `@aurora/composables/presets/`. They are fewer and often cross subdomains (a preset can compose data-table atoms with graphql atoms), so a deeper taxonomy adds friction without value.

The barrel chain re-exports everything from the alias root, so consumers write:

```ts
import { useTableSort, usePaginatedDataTable, useGraphqlList } from '@aurora';
```

without ever caring about the internal path.

### The binding layer — `useDataTable`

`useDataTable` is the preset that bridges atoms to TanStack. It accepts atoms (or instantiates them with defaults) and produces a `Table<T>` whose `state.sorting`, `state.pagination`, `state.columnFilters`, `state.rowSelection`, `state.columnVisibility` and `state.columnOrder` are bound to the atom signals. The TanStack `onXxxChange` callbacks delegate back to the atom setters. There are **no internal signals in `useDataTable` of its own** — state lives once, in the atoms, and the binding is just plumbing.

### Atom catalog — `data-table`

<div class="nowrap-first-col">



| Atom                          | Single responsibility                                                            |
| ----------------------------- | -------------------------------------------------------------------------------- |
| `useTableSearch`              | Free-text search query plus a debounced derived signal for refetch.              |
| `useTableSort`                | TanStack-compatible `SortingState`.                                              |
| `useTablePagination`          | `{ pageIndex, pageSize }` plus `offset` / `limit` accessors.                     |
| `useTableFilters`             | Catalyst-shape `ColumnFilter[]` (consumed by `buildFilterWhere`).                |
| `useTableSelection`           | `Set<string>` of selected ids; persists across data changes when `getRowId` is wired. |
| `useTableColumnVisibility`    | In-memory `VisibilityState`. Persistence is delegated to a separate wrapper.    |
| `useTableColumnOrder`         | `ColumnOrderState`.                                                              |
| `useTableExport`              | Pure helpers — generate CSV/XLS blobs and trigger the download. No state.        |
| `useTableData<T>`             | Server-paginated load via a `paginate` callback; supports `seed()` for resolver prefetch. |

</div>

### Atom catalog — `graphql`

Each atom delegates to its fetcher under `@aurora/modules/graphql/fetchers/`. The atom's responsibility is limited to the `loading` signal lifecycle; no `apollo.query`/`apollo.mutate` lives inside an atom.

<div class="nowrap-first-col">

| Atom                       | Fetcher delegated to        | What it does                                              |
| -------------------------- | --------------------------- | --------------------------------------------------------- |
| `useGraphqlPaginate`       | `queryPaginate`             | Paginated list read.                                      |
| `useGraphqlGet`            | `queryGet`                  | Unpaginated multi-record read.                            |
| `useGraphqlFind`           | `queryFind`                 | Single-record read by criteria.                           |
| `useGraphqlFindById`       | `queryFindById`             | Single-record read by id.                                 |
| `useGraphqlCreate`         | `mutateCreate`              | Single-row create.                                        |
| `useGraphqlInsert`         | `mutateInsert`              | Bulk create — designed for pivot aggregates.              |
| `useGraphqlUpdate`         | `mutateUpdate`              | Update.                                                   |
| `useGraphqlDeleteById`     | `mutateDeleteById`          | Single-PK delete.                                         |
| `useGraphqlDeleteByKeys`   | `mutateDeleteByKeys`        | Composite-key delete — pivot aggregates with multi-column PK. |
| `useGraphqlDelete`         | `mutateDelete`              | Where-based bulk delete.                                  |

</div>

### Preset catalog

<div class="nowrap-first-col">

| Preset                    | Composes                                                                                              | Use it when                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `useDataTable`            | The data-table atoms (or its own defaults) → TanStack `Table<T>`.                                     | You want a table whose state is managed via atoms — without writing the wiring. |
| `usePaginatedDataTable`   | All data-table atoms + `useTableData` + `useDataTable`.                                               | Server-paginated lists. Replaces the inline `useDataTable + signals + fetchData` pattern. |
| `useStaticDataTable`      | Data-table atoms + `useDataTable` configured for client-side sort and pagination.                    | Client-side tables with the rows already in memory. No fetch.                |
| `useGraphqlList`          | `useGraphqlPaginate` + `useGraphqlDeleteById`.                                                        | List page graphql wiring (paginate + delete by id).                          |
| `useGraphqlDetail`        | `useGraphqlFindById` + `useGraphqlCreate` + `useGraphqlUpdate`.                                       | Detail page graphql wiring (read + create + update).                         |
| `useAggregateShell`       | `useGraphqlList` + `useGraphqlDetail`.                                                                | A full aggregate page with a list and a detail view sharing one shell.       |
| `usePivotMembership`      | `useGraphqlGet` + `useGraphqlInsert` + `useGraphqlDelete`.                                            | The membership layer of a many-to-many: full id set, `link()`, `unlink()`, `refresh()`. |
| `useRelationshipPivot`    | Two `usePaginatedDataTable` (linked + candidates) + one `usePivotMembership`.                         | A many-to-many manager screen — two coordinated tables plus pivot mutations.  |

</div>

After a successful `link()` or `unlink()`, `useRelationshipPivot` automatically calls `linked.refetch()`. The orchestration is in the preset; the atoms stay clean.

## When it applies

- You are writing a new server-paginated list page. Reach for `usePaginatedDataTable + seed()`. The handlers (`onSearch`, `onFiltersChange`, …) collapse to one-liners.
- You are writing a many-to-many manager (a role's permissions, a user's tags). Reach for `useRelationshipPivot` — the two coordinated tables, the pivot membership, and the auto-refetch are already wired.
- You need a custom composition that does not match any preset (kanban, virtual list, tree table). Pick the atoms directly and write the orchestration inline; promote it to a preset only when a second consumer needs the same orchestration.
- You have a list with the inline `useDataTable + sortSignal + paginationSignal + filtersSignal + fetchData()` wiring. That block is the smell — replace it with `usePaginatedDataTable`. Expect to lose roughly 25 lines per file.

## Trade-offs and limits

- **Atomization stops at "appears in two presets".** A concern that only surfaces in a single preset stays inline. Atomizing speculatively pollutes `atoms/` with primitives nobody else uses.
- **Persistence is not the atom's problem.** `useTableColumnVisibility` and `useTableColumnOrder` are in-memory. If you need to persist the layout per `gridId`, wrap the atom in a separate composable that talks to `column-config-storage`. The atom stays pure.
- **`useDataTable` is not a state owner.** It is pure wiring. To read sort, pagination, or any other state, read it from the relevant atom — either passed in by the caller or re-exposed by the preset on its return value.
- **`grid-select-multiple-elements` needs specific wiring.** The `@aurora` barrels keep every import resolving transparently, so the rest of the components need no attention. The exception is this one: it is a many-to-many manager with `(linkRequested)` / `(unlinkRequested)` outputs, and the template that mounts it must wire those outputs. It only emits the intent because it does not know where to persist the link: membership is mutated immediately, outside the form's create/update lifecycle, so the host orchestrator runs the mutation and refreshes the data.

## Related

- [Atomic composables + manager rewrite](../../../changes/catalyst/2026-05-05-refactor-data-table-to-atomic-composables/) — the change that introduced this architecture.
- [Implement grid-elements-manager](../../../guides/frontend/implement-grid-elements-manager/) — task-oriented recipe for the one-to-many manager, sibling pattern.
- [Cell renderers](../cell-renderers/) — the visual-layer counterpart: per-type renderers under `cells/`, dispatched by codegen.
