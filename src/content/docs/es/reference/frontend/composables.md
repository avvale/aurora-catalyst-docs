---
title: "Referencia de composables"
description: "Firmas y configuración de cada atom y preset bajo @aurora/composables."
---

Esta página es la referencia de consulta rápida. Para el *porqué* de la arquitectura y cuándo elegir cada cosa, lee [Composables: atoms y presets](../../../concepts/frontend/composables/).

Todos los exports resuelven desde el alias raíz:

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
  debouncedValue: Signal<string>; // 300 ms por defecto
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

La persistencia cross-page requiere que el consumer cablee `getRowId: r => r.id` en la config del binding (`useDataTable`). Sin `getRowId`, TanStack cae al index de la fila — válido para tablas pequeñas client-side.

### `useTableColumnVisibility`

```ts
useTableColumnVisibility(): {
  state: Signal<VisibilityState>;
  set(s: VisibilityState): void;
}
```

Solo en memoria. Envuélvelo externamente para persistencia por `gridId`.

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

Helpers puros — sin estado.

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

`seed()` rellena `data` de forma síncrona sin disparar `paginate`. Úsalo para prefetch desde resolver:

```ts
const seed = this.route.snapshot.data['pagination'] as DataTableData<T> | undefined;
if (seed) tableData.seed(seed);
```

## Atoms — `graphql`

Cada atom delega en un fetcher bajo `@aurora/modules/graphql/fetchers/`. La única responsabilidad del atom es el ciclo de vida del signal `loading`.

| Atom                     | Forma retornada                                                       | Fetcher              |
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

Las firmas del constructor son uniformes:

```ts
useGraphqlX<T>(statement: TypedDocumentNode, key: string, fields?: string[])
```

## Presets

### `useDataTable`

El binding layer. No tiene estado propio — cada signal que expone proviene de un atom.

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
  // atoms — todos opcionales; si se omiten, se instancian con defaults
  sort?: ReturnType<typeof useTableSort>;
  pagination?: ReturnType<typeof useTablePagination>;
  filters?: ReturnType<typeof useTableFilters>;
  selection?: ReturnType<typeof useTableSelection>;
  columnVisibility?: ReturnType<typeof useTableColumnVisibility>;
  columnOrder?: ReturnType<typeof useTableColumnOrder>;
}): {
  table: Table<T>;
  hidableColumns: () => Column<T>[];
  // atoms reexpuestos (los pasados o los defaults)
  sort: ReturnType<typeof useTableSort>;
  pagination: ReturnType<typeof useTablePagination>;
  filters: ReturnType<typeof useTableFilters>;
  selection: ReturnType<typeof useTableSelection>;
  columnVisibility: ReturnType<typeof useTableColumnVisibility>;
  columnOrder: ReturnType<typeof useTableColumnOrder>;
}
```

### `usePaginatedDataTable`

Preset canónico para listas paginadas en servidor.

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
  // atoms reexpuestos
  search; sort; pagination; filters; selection; columnVisibility; columnOrder;
}
```

El preset cablea:

- `onSortingChange` → atom + `refetch()`.
- `onPaginationChange` → atom + `refetch()`.
- `setSearch` / `setFilters` → atoms + reset de `pagination` a `{ pageIndex: 0 }` + `refetch()`.

### `useStaticDataTable`

Cliente-side. Sin fetch.

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
  parentKey: string;       // FK del pivot apuntando al padre, p. ej. 'roleId'
  childKey: string;        // otra FK del pivot, p. ej. 'permissionId'
  getStatement: TypedDocumentNode;
  insertStatement: TypedDocumentNode;
  deleteStatement: TypedDocumentNode;
}): {
  linkedIds: Signal<Set<string>>;
  link(ids: string[]): Promise<void>;   // ignora silenciosamente ids ya vinculados
  unlink(ids: string[]): Promise<void>; // borrado en bulk basado en where
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
  init(): Promise<void>;  // fetch inicial coordinado
}
```

Tras un `membership.link()` o `membership.unlink()` exitoso, el preset invoca automáticamente `linked.refetch()`.

## Fetchers

La capa de llamada pura. Vive en `@aurora/modules/graphql/fetchers/` y también se reexporta desde el alias raíz. Los fetchers no crean signals ni mantienen estado.

| Fetcher                | Variables enviadas                              | Devuelve                             |
| ---------------------- | ----------------------------------------------- | ------------------------------------ |
| `queryPaginate<T>`     | `{ query, constraint? }`                        | `Observable<DataTableData<T>>`       |
| `queryGet<T>`          | `{ query?, constraint? }`                       | `Observable<T[]>`                    |
| `queryFind<T>`         | `{ query, constraint? }`                        | `Observable<T \| null>`              |
| `queryFindById<T>`     | `{ id, ...vars }`                               | `Observable<T \| null>`              |
| `mutateCreate`         | `{ payload }`                                   | `Observable<ApolloLink.Result>`      |
| `mutateInsert`         | `{ payload: object[] }`                         | `Observable<ApolloLink.Result>`      |
| `mutateUpdate`         | `{ payload }`                                   | `Observable<ApolloLink.Result>`      |
| `mutateDeleteById`     | `{ id }`                                        | `Observable<ApolloLink.Result>`      |
| `mutateDeleteByKeys`   | `{ ...keys }` (clave compuesta spread)          | `Observable<ApolloLink.Result>`      |
| `mutateDelete`         | `{ query, constraint? }`                        | `Observable<ApolloLink.Result>`      |

## Relacionado

- [Composables: atoms y presets](../../../concepts/frontend/composables/) — el *porqué* de la arquitectura.
- [Composables atómicos y nuevo manager](../../../changes/catalyst/2026-05-05-refactor-data-table-to-atomic-composables/) — el change que introdujo esta superficie.
