---
title: "Composables reference"
description: "Signatures and configs for every atom and preset under @aurora/composables."
---

This page is the consult-fast reference. For the *why* of the architecture and when to reach for what, read [Composables: atoms and presets](../../../concepts/frontend/composables/).

All exports resolve from the alias root:

```ts
import {
  useTableSearch, useTableSort, useTablePagination,
  useGraphqlPaginate, useGraphqlInsert,
  usePaginatedDataTable, useRelationshipPivot,
} from '@aurora';
```

## Atoms — `data-table`

### `useTableSearch`

```ts
useTableSearch(): {
  value: Signal<string>;
  set(s: string): void;
  debouncedValue: Signal<string>; // 300 ms default
}
```

### `useTableSort`

```ts
useTableSort(): {
  state: Signal<SortingState>;
  set(s: SortingState): void;
}
```

### `useTablePagination`

```ts
useTablePagination(defaultPageSize?: number): {
  state: Signal<PaginationState>;
  set(s: PaginationState): void;
  offset: Signal<number>;
  limit: Signal<number>;
}
```

### `useTableFilters`

```ts
useTableFilters(): {
  value: Signal<ColumnFilter[]>;
  set(f: ColumnFilter[]): void;
}
```

### `useTableSelection`

```ts
useTableSelection(): {
  ids: Signal<Set<string>>;
  toggleId(id: string): void;
  clear(): void;
  isSelected(id: string): Signal<boolean>;
  toRowSelectionState(visibleIds: () => string[]): Signal<RowSelectionState>;
}
```

Cross-page persistence requires the consumer to wire `getRowId: r => r.id` into the binding (`useDataTable` config). Without `getRowId`, TanStack falls back to the row index — fine for small client-side tables.

### `useTableColumnVisibility`

```ts
useTableColumnVisibility(): {
  state: Signal<VisibilityState>;
  set(s: VisibilityState): void;
}
```

In-memory only. Wrap externally for `gridId`-keyed persistence.

### `useTableColumnOrder`

```ts
useTableColumnOrder(): {
  state: Signal<ColumnOrderState>;
  set(s: ColumnOrderState): void;
}
```

### `useTableExport`

```ts
useTableExport<T>(): {
  exportCsv(table: Table<T>, columns: LabeledColumn[], filename: string): void;
  exportXls(table: Table<T>, columns: LabeledColumn[], filename: string): void;
}
```

Pure helpers — no state.

### `useTableData<T>`

```ts
useTableData<T>(config: {
  paginate: (input: { query: object; constraint?: object }) => Observable<DataTableData<T>>;
}): {
  data: Signal<DataTableData<T>>;
  loading: Signal<boolean>;
  refetch(): Promise<void>;
  seed(d: DataTableData<T>): void;
}
```

`seed()` populates `data` synchronously without firing `paginate`. Use it for resolver prefetch:

```ts
const seed = this.route.snapshot.data['pagination'] as DataTableData<T> | undefined;
if (seed) tableData.seed(seed);
```

## Atoms — `graphql`

Each atom delegates to a fetcher under `@aurora/modules/graphql/fetchers/`. The atom's only responsibility is the `loading` signal lifecycle.

| Atom                     | Returned shape                                                        | Fetcher              |
| ------------------------ | --------------------------------------------------------------------- | -------------------- |
| `useGraphqlPaginate<T>`  | `{ paginate(vars), pagination: Signal<DataTableData<T>>, loading }`   | `queryPaginate`      |
| `useGraphqlGet<T>`       | `{ get(vars), data: Signal<T[]>, loading }`                           | `queryGet`           |
| `useGraphqlFind<T>`      | `{ find(vars), data: Signal<T \| null>, loading }`                    | `queryFind`          |
| `useGraphqlFindById<T>`  | `{ findById(id, vars?), data: Signal<T \| null>, loading }`           | `queryFindById`      |
| `useGraphqlCreate`       | `{ create(payload, headers?), loading }`                              | `mutateCreate`       |
| `useGraphqlInsert`       | `{ insert(payloadArr, headers?), loading }`                           | `mutateInsert`       |
| `useGraphqlUpdate`       | `{ update(payload, headers?), loading }`                              | `mutateUpdate`       |
| `useGraphqlDeleteById`   | `{ deleteById(id, headers?), loading }`                               | `mutateDeleteById`   |
| `useGraphqlDeleteByKeys` | `{ deleteByKeys(keys, headers?), loading }`                           | `mutateDeleteByKeys` |
| `useGraphqlDelete`       | `{ delete(query, constraint?, headers?), loading }`                   | `mutateDelete`       |

Constructor signatures are uniform:

```ts
useGraphqlX<T>(statement: TypedDocumentNode, key: string, fields?: string[])
```

## Presets

### `useDataTable`

The binding layer. Owns no state of its own — every signal it exposes comes from an atom.

```ts
useDataTable<T>(config: {
  data: () => T[];
  columns: DataTableColumnDef<T>[];
  getRowId?: (row: T) => string;
  enableRowSelection?: boolean | ((row: Row<T>) => boolean);
  manualSorting?: boolean;
  manualPagination?: boolean;
  totalRows?: () => number;
  pageSize?: number;
  // atoms — all optional; instantiated with defaults if omitted
  sort?: ReturnType<typeof useTableSort>;
  pagination?: ReturnType<typeof useTablePagination>;
  filters?: ReturnType<typeof useTableFilters>;
  selection?: ReturnType<typeof useTableSelection>;
  columnVisibility?: ReturnType<typeof useTableColumnVisibility>;
  columnOrder?: ReturnType<typeof useTableColumnOrder>;
}): {
  table: Table<T>;
  hidableColumns: () => Column<T>[];
  // atoms re-exposed (whichever were used or defaulted)
  sort: ReturnType<typeof useTableSort>;
  pagination: ReturnType<typeof useTablePagination>;
  filters: ReturnType<typeof useTableFilters>;
  selection: ReturnType<typeof useTableSelection>;
  columnVisibility: ReturnType<typeof useTableColumnVisibility>;
  columnOrder: ReturnType<typeof useTableColumnOrder>;
}
```

### `usePaginatedDataTable`

Canonical preset for server-paginated lists.

```ts
usePaginatedDataTable<T>(config: {
  paginate: (input: { query: object; constraint?: object }) => Observable<DataTableData<T>>;
  columns: DataTableColumnDef<T>[];
  searchableColumnIds?: string[];
  defaultPageSize?: number;
  constraint?: () => Record<string, unknown> | null;
  relationIncludes?: () => unknown[];
}): {
  table: Table<T>;
  hidableColumns: () => Column<T>[];
  data: Signal<DataTableData<T>>;
  loading: Signal<boolean>;
  refetch(): Promise<void>;
  seed(d: DataTableData<T>): void;
  setSearch(value: string): void;
  setFilters(filters: ColumnFilter[]): void;
  setSort(state: SortingState): void;
  setPage(state: PaginationState): void;
  // re-exposed atoms
  search; sort; pagination; filters; selection; columnVisibility; columnOrder;
}
```

The preset wires:

- `onSortingChange` → atom + `refetch()`.
- `onPaginationChange` → atom + `refetch()`.
- `setSearch` / `setFilters` → atoms + reset `pagination` to `{ pageIndex: 0 }` + `refetch()`.

### `useStaticDataTable`

Client-side. No fetch.

```ts
useStaticDataTable<T>(config: {
  rows: () => T[];
  columns: DataTableColumnDef<T>[];
  getRowId?: (row: T) => string;
  pageSize?: number;
}): {
  table: Table<T>;
  hidableColumns: () => Column<T>[];
  sort; pagination; filters; selection; columnVisibility; columnOrder;
}
```

### `useGraphqlList`

```ts
useGraphqlList<T>(config: {
  paginateStatement: TypedDocumentNode;
  paginateKey: string;
  deleteStatement: TypedDocumentNode;
  fields?: string[];
}): {
  paginate(vars): Observable<DataTableData<T>>;
  deleteById(id): Promise<void>;
  pagination: Signal<DataTableData<T>>;
  loading: Signal<boolean>;
}
```

### `useGraphqlDetail`

```ts
useGraphqlDetail<T>(config: {
  findByIdStatement: TypedDocumentNode;
  findByIdKey: string;
  createStatement: TypedDocumentNode;
  updateStatement: TypedDocumentNode;
  fields?: string[];
}): {
  findById(id): Promise<T | null>;
  create(payload): Promise<void>;
  update(payload): Promise<void>;
  data: Signal<T | null>;
  loading: Signal<boolean>;
}
```

### `useAggregateShell`

```ts
useAggregateShell<T>(config: {
  listConfig: Parameters<typeof useGraphqlList<T>>[0];
  detailConfig: Parameters<typeof useGraphqlDetail<T>>[0];
}): {
  list: ReturnType<typeof useGraphqlList<T>>;
  detail: ReturnType<typeof useGraphqlDetail<T>>;
}
```

### `usePivotMembership<TPivot>`

```ts
usePivotMembership<TPivot>(config: {
  parentId: () => string;
  parentKey: string;       // FK column on the pivot, e.g. 'roleId'
  childKey: string;        // other FK column on the pivot, e.g. 'permissionId'
  getStatement: TypedDocumentNode;
  insertStatement: TypedDocumentNode;
  deleteStatement: TypedDocumentNode;
}): {
  linkedIds: Signal<Set<string>>;
  link(ids: string[]): Promise<void>;   // silently skips already-linked ids
  unlink(ids: string[]): Promise<void>; // where-based bulk delete
  refresh(): Promise<void>;
  loading: Signal<boolean>;
}
```

### `useRelationshipPivot<TLinked, TCandidate>`

```ts
useRelationshipPivot<TLinked, TCandidate>(config: {
  linked: Parameters<typeof usePaginatedDataTable<TLinked>>[0];
  candidates: Parameters<typeof usePaginatedDataTable<TCandidate>>[0];
  membership: Parameters<typeof usePivotMembership>[0];
}): {
  linked: ReturnType<typeof usePaginatedDataTable<TLinked>>;
  candidates: ReturnType<typeof usePaginatedDataTable<TCandidate>>;
  membership: ReturnType<typeof usePivotMembership>;
  init(): Promise<void>;  // coordinated initial fetch
}
```

After a successful `membership.link()` or `membership.unlink()`, the preset auto-invokes `linked.refetch()`.

## Fetchers

The pure call layer. Lives at `@aurora/modules/graphql/fetchers/` and is also re-exported from the alias root. Fetchers create no signals and hold no state.

| Fetcher                | Variables sent                                  | Returns                              |
| ---------------------- | ----------------------------------------------- | ------------------------------------ |
| `queryPaginate<T>`     | `{ query, constraint? }`                        | `Observable<DataTableData<T>>`       |
| `queryGet<T>`          | `{ query?, constraint? }`                       | `Observable<T[]>`                    |
| `queryFind<T>`         | `{ query, constraint? }`                        | `Observable<T \| null>`              |
| `queryFindById<T>`     | `{ id, ...vars }`                               | `Observable<T \| null>`              |
| `mutateCreate`         | `{ payload }`                                   | `Observable<ApolloLink.Result>`      |
| `mutateInsert`         | `{ payload: object[] }`                         | `Observable<ApolloLink.Result>`      |
| `mutateUpdate`         | `{ payload }`                                   | `Observable<ApolloLink.Result>`      |
| `mutateDeleteById`     | `{ id }`                                        | `Observable<ApolloLink.Result>`      |
| `mutateDeleteByKeys`   | `{ ...keys }` (composite key spread)            | `Observable<ApolloLink.Result>`      |
| `mutateDelete`         | `{ query, constraint? }`                        | `Observable<ApolloLink.Result>`      |

## Related

- [Composables: atoms and presets](../../../concepts/frontend/composables/) — the *why* of the architecture.
- [Atomic composables + manager rewrite](../../../changes/catalyst/2026-05-05-refactor-data-table-to-atomic-composables/) — the change that introduced this surface.
