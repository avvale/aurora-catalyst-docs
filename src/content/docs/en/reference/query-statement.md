---
title: "Query Statement (Aurora Query DSL)"
description: "Exhaustive reference for QueryStatement — Aurora's own ORM-neutral JSON query language: where, relations, order, aggregation, pagination, validation, and the legacy migration path."
---

`QueryStatement` is Aurora's own query language: a plain JSON object that expresses filtering, relation loading, sorting, aggregation, and pagination — without a single ORM-specific key. It is the wire contract every list, paginate, find, and get endpoint accepts, on both GraphQL and REST.

It applies everywhere a query travels from client to server:

- **GraphQL**: the `query` and `constraint` arguments on `paginate*`, `get*`, `find*` queries (typed `QueryStatementInput`, an input object whose blocks are `JSON` scalars under the hood).
- **REST**: the equivalent `query` / `constraint` keys in the request body, e.g. `POST /library/books/paginate { "query": {...}, "constraint": {...} }`.

The end-to-end flow is always the same:

```
client JSON  →  QueryStatementInput (passthrough, no server-side shape validation at the schema level)
             →  QueryDslValidator.validate()   (default-deny whitelist, depth ≤ 10, limit ≤ 10000)
             →  DrizzleCriteria.translate()    (DSL → Drizzle RQB v2, or core-builder fallback)
             →  SQL
```

`QueryStatementInput` is a GraphQL input object whose blocks (`where`, `relations`, `order`, `aggregation`) are each typed as the `JSON` scalar, with `limit`/`offset` as `Int` — so the schema imposes no shape validation on the DSL itself. The real shape validation happens server-side, in `QueryDslValidator`, before the statement is ever translated to SQL.

Here is a statement using five of the six top-level blocks at once:

```json
{
  "where": {
    "and": [
      { "status": { "eq": "active" } },
      { "role": { "name": { "iLike": "%admin%" } } }
    ]
  },
  "relations": {
    "role": { "order": [{ "field": "name", "dir": "asc" }] }
  },
  "order": [{ "field": "createdAt", "dir": "desc" }],
  "limit": 50,
  "offset": 0
}
```

This finds active accounts whose role name contains "admin" (a filter, via `where.role`), loads each account's `role` relation ordered by name (a separate concern, via `relations.role`), sorts the result by creation date, and returns the first page of 50 rows.

## Top-level shape

`QueryStatement` has exactly six top-level keys — nothing else is accepted (see [Validation & security](#validation--security)):

| Key           | Type                       | Purpose                                                              |
| ------------- | -------------------------- | ---------------------------------------------------------------------|
| `where`       | `WhereClause`               | Filters which rows come back (the parent set).                       |
| `relations`   | `Record<string, true \| RelationNode>` | Shapes which related rows get loaded, and how — never filters parents. |
| `order`       | `OrderClause[]`             | Sort order; `{ field, dir }` entries, `field` may be a dot-path.     |
| `aggregation` | `AggregationBlock`          | `count`/`sum`/`avg`/`min`/`max` with optional `groupBy`.              |
| `limit`       | `number`                    | Maximum rows returned (capped at 10000).                             |
| `offset`      | `number`                    | Rows to skip before returning results.                               |

All six are optional. An empty statement (`{}`) is valid and returns everything, unshaped, up to the datasource's natural order.

## `where` — filtering

`where` is a recursive filter tree. Every key is either a **logical connector** (`and`, `or`, `not`) or a **field/relation name** mapped to a leaf comparison — or, when the key names a relation, to a nested `where` node (see [filtering by relation fields](#filtering-by-relation-fields) below).

### Operator reference

These are the only 13 leaf (field-level) operators the validator accepts. Any other key is rejected before the query reaches the database.

| Operator  | Meaning                                   | Value type                       | SQL-ish equivalent            |
| --------- | ------------------------------------------ | --------------------------------- | ------------------------------ |
| `eq`      | Equals                                     | scalar                            | `= value`                      |
| `ne`      | Not equals                                 | scalar                            | `<> value`                     |
| `gt`      | Greater than                               | scalar                             | `> value`                      |
| `gte`     | Greater than or equal                      | scalar                             | `>= value`                     |
| `lt`      | Less than                                  | scalar                             | `< value`                      |
| `lte`     | Less than or equal                         | scalar                             | `<= value`                     |
| `in`      | Value is one of a set                      | array of scalars                   | `IN (...)`                     |
| `notIn`   | Value is none of a set                     | array of scalars                   | `NOT IN (...)`                 |
| `between` | Value falls within a range, **inclusive**  | 2-element scalar tuple `[min, max]`| `BETWEEN min AND max`          |
| `isNull`  | Value is/isn't `NULL`                      | boolean                            | `IS NULL` / `IS NOT NULL`      |
| `iLike`   | Case-insensitive pattern match (Postgres)  | string                             | `ILIKE '%pattern%'`            |
| `contains`| Array/jsonb column contains a value        | scalar or array of scalars         | `@>` (Postgres `contains`)     |
| `overlap` | Array/jsonb column shares elements with     | scalar or array of scalars         | `&&` (Postgres `overlap`)      |

`ScalarValue` is `string \| number \| boolean \| null` — the only value shape the comparison operators accept. `contains` and `overlap` are meant for array/jsonb columns; a scalar right-hand side is normalized internally to a single-element array before it reaches Postgres, so both accept either shape.

### Equality, inequality, and nulls

```json
{ "where": { "id": { "eq": 123 } } }
{ "where": { "tenantId": { "ne": "public" } } }
{ "where": { "deletedAt": { "isNull": true } } }
{ "where": { "deletedAt": { "isNull": false } } }
```

`isNull: false` compiles to `IS NOT NULL` — it is not the same as `ne: null` (SQL's three-valued logic makes `<> NULL` never true).

### Comparisons

```json
{ "where": { "price": { "gt": 10 } } }
{ "where": { "price": { "gte": 10 } } }
{ "where": { "createdAt": { "lt": "2025-01-01T00:00:00Z" } } }
{ "where": { "createdAt": { "lte": "2025-12-31T23:59:59Z" } } }
```

### Ranges

```json
{ "where": { "score": { "between": [70, 90] } } }
```

`between` is **inclusive on both ends** — `score: 70` and `score: 90` both match.

### Sets

```json
{ "where": { "status": { "in": ["draft", "published"] } } }
{ "where": { "status": { "notIn": ["archived"] } } }
```

### Pattern matching

```json
{ "where": { "name": { "iLike": "%madrid%" } } }
```

`iLike` is the only pattern operator in the DSL — dialect-specific to Postgres (case-insensitive `LIKE`). There is no plain `like`/`startsWith`/`endsWith` in the current DSL.

### Arrays / jsonb

```json
{ "where": { "tags": { "overlap": ["react", "node"] } } }
{ "where": { "tags": { "contains": ["graphql"] } } }
```

`contains` (`@>`) asks "does the column's array/jsonb value contain all of these elements"; `overlap` (`&&`) asks "does it share at least one element with this set".

### Implicit AND between sibling fields

Two field keys inside the same `where` object are implicitly ANDed together — you only need an explicit `and` when combining conditions on the **same** field, or when nesting `or`/`not`:

```json
{
  "where": {
    "status": { "eq": "active" },
    "age": { "gte": 18 }
  }
}
```

This is equivalent to `{ "and": [{ "status": {...} }, { "age": {...} }] }`, but flatter.

### Logical `and` / `or` / `not`

```json
{
  "where": {
    "and": [
      { "status": { "eq": "active" } },
      {
        "or": [
          { "role": { "eq": "admin" } },
          { "role": { "eq": "editor" } }
        ]
      }
    ]
  }
}
```

```json
{ "where": { "not": { "deletedAt": { "isNull": false } } } }
```

`and` and `or` take an array of nested `where` clauses; `not` takes a single nested clause. These nest to any depth (up to the [validation depth cap](#validation--security)).

### Filtering by relation fields

A relation name placed **inside `where`** filters the **parent** rows via an `EXISTS` check against that relation — it does not load or shape the related rows:

```json
{ "where": { "role": { "name": { "iLike": "%admin%" } } } }
```

Only parent rows that have at least one related `role` whose `name` matches are returned. The related `role` rows themselves are **not** included in the result — for that, add `role` to the `relations` block independently (see next section). This is the DSL's answer to the old Sequelize `$role.name$` path-syntax join-filter: no string qualification, no ambiguity about which table a bare column belongs to — the relation key already scopes it.

## `relations` — shaping loaded children

`relations` is a **separate block from `where`**. Each key names a relation and maps either to `true` (load it, no extra shaping) or to a **relation node** — a recursive query object that restricts/orders/paginates the **loaded children**, without ever touching which parent rows come back.

### `true` vs. node form

```json
{ "relations": { "role": true } }
```

```json
{
  "relations": {
    "role": {
      "where": { "active": { "eq": true } },
      "order": [{ "field": "name", "dir": "asc" }],
      "limit": 5,
      "offset": 0
    }
  }
}
```

A relation node accepts exactly these keys: `where`, `order`, `limit`, `offset`, `relations` (for nesting one level deeper).

:::caution
Selecting a relation's fields in the GraphQL query (or in a REST response projection) does **not**, by itself, load that relation. `relations` is the only thing that triggers the eager-load — an explicit `relations: { role: true }` node is required even if the caller's GraphQL selection set asks for `role { name }`. Without it, the field comes back `null`.
:::

### Nested relations

```json
{
  "relations": {
    "fleetAircraft": {
      "relations": {
        "aircraftModel": true
      }
    }
  }
}
```

Many-to-many relations use the same shape as any other relation — the DSL has no pivot-table option bag (no `through`); pivot data, if needed, is modeled as its own aggregate/relation.

### The orthogonality rule

> `relations` shapes loaded children and **never** filters parents. `where` filters parents and **never** shapes children.

These are two independent axes ([orthogonal](./glossary/#orthogonal), in the glossary's sense): changing one never drags the other along. This is a deliberate split from Sequelize's `include`, which conflated "load this association", "filter parents by it", and "shape the joined rows" into a single option bag.

The difference is easiest to see side by side, on the same underlying data (accounts, each with a `role`):

**Filtering by relation** — parents are restricted, `role` is not loaded:

```json
{ "where": { "role": { "active": { "eq": true } } } }
```
Result: only accounts whose role is active come back. Each returned account's `role` field is absent from the response (it was never requested).

**Shaping via relation** — all parents come back, `role` is loaded and restricted:

```json
{ "relations": { "role": { "where": { "active": { "eq": true } } } } }
```
Result: **every** account comes back, including ones whose role is inactive. Each account's `role` field is populated only when the role matches `active: true` — an account with no matching role still appears, with an empty `role`.

Combine both when you need "only accounts with an active role, and load that role":

```json
{
  "where": { "role": { "active": { "eq": true } } },
  "relations": { "role": true }
}
```

## `order` — sorting

An array of `{ field, dir }` objects. `dir` is `"asc"` or `"desc"`.

```json
{ "order": [{ "field": "createdAt", "dir": "desc" }] }
{ "order": [{ "field": "name", "dir": "asc" }, { "field": "id", "dir": "desc" }] }
```

### Ordering by a relation column (dot-path)

`field` accepts a dot-path naming a relation column, e.g. `role.name`:

```json
{ "order": [{ "field": "role.name", "dir": "asc" }] }
```

When Drizzle's Relational Query Builder cannot express "order the parent rows by a relation column" directly, the query transparently routes to Drizzle's core select builder (an explicit `JOIN`) instead — the caller receives the same result shape either way.

**Constraints on dot-path ordering:**

- Only **to-one** relations can be ordered by (a to-many relation has no single row to sort the parent against).
- The relation's own key must resolve to a **single column** on the joined table (`relationName.columnName`) — no further nesting past one dot.
- A dot-path `field` is **not allowed inside a relation node's own `order`** — only at the top level. Inside a `relations.<name>.order`, ordering is scoped to that relation's own columns; there is no join fallback available one level down.
- `order.field` **cannot name an `aggregation.fields[].as` alias** — see [Aggregation limitations](#limitations) below.

## Pagination — `limit` / `offset`

```json
{ "limit": 20, "offset": 40 }
```

- `limit` — maximum number of rows to return. **Capped at 10000** — see [Validation & security](#validation--security).
- `offset` — number of rows to skip before returning results.

Paginate endpoints (GraphQL `paginate*`, REST `/paginate`) wrap the row set in a `Pagination` type that reports totals alongside the page:

```graphql
type Pagination {
  total: Int!   # total rows matching `where`, ignoring limit/offset
  count: Int!   # rows actually returned in this page
  rows: [JSON]!
}
```

`total` lets the client compute page counts; `count` reflects how many rows this particular page actually contains (which can be less than `limit` on the last page). Unlike the old Sequelize-shaped contract, there is no `distinct` flag to de-duplicate root rows inflated by a join: `relations` never performs a row-multiplying join — each relation level is resolved as its own query — so no manual de-duplication is ever needed.

## `aggregation` — count / sum / avg / min / max / group

The aggregation block is **always** routed to Drizzle's core select builder (the Relational Query Builder does not support aggregations). It carries only Aurora-owned keys — never a raw SQL string.

```typescript
interface AggregateField {
  fn: 'count' | 'sum' | 'max' | 'min' | 'avg';
  field: string;   // column name, or a `relation.column` dot-path
  as?: string;     // alias for the result key
}

interface AggregationBlock {
  fields: AggregateField[];
  groupBy?: string[];
}
```

### Count per group

```json
{
  "aggregation": {
    "fields": [{ "fn": "count", "field": "*", "as": "total" }],
    "groupBy": ["status"]
  },
  "order": [{ "field": "status", "dir": "asc" }]
}
```

### Average, grouped

```json
{
  "aggregation": {
    "fields": [{ "fn": "avg", "field": "salary", "as": "avgSalary" }],
    "groupBy": ["departmentId"]
  }
}
```

### Grouping by a relation column (dot-path)

Both `groupBy` entries and `fields[].field` accept a `relation.column` dot-path — the engine joins the relation to resolve it, the same way `order` does:

```json
{
  "aggregation": {
    "fields": [{ "fn": "count", "field": "id", "as": "total" }],
    "groupBy": ["role.name"]
  }
}
```

### Limitations

- **`order.field` cannot name an `aggregation.fields[].as` alias.** `order.field` is always resolved as a real column lookup against the base table (or a joined relation table) — never against the `SELECT` list. Naming an alias like `"total"` in `order` resolves to an undefined column and fails at the core builder:

  ```json
  {
    "aggregation": { "fields": [{ "fn": "count", "field": "id", "as": "total" }], "groupBy": ["status"] },
    "order": [{ "field": "total", "dir": "desc" }]
  }
  ```

  Order by one of the `groupBy` fields (a real column) instead of the aggregate alias. This differs from the report-engine's cube query builder, which re-expands the full aggregate expression in `ORDER BY` instead of referencing an alias — that path has no equivalent limitation, but it is a different, more specialized surface (see the note below).
- Advanced reporting (curated KPIs, multi-cube joins, chart-ready shapes) belongs to the report-engine's **cubes**, not to ad-hoc `aggregation` blocks on a list endpoint — this reference does not cover that surface.

## Validation & security

Every `QueryStatement` is walked by `QueryDslValidator` — a **default-deny whitelist** — before it is translated to SQL. Unknown operators, unknown top-level keys, and unknown relation-node keys are all rejected outright.

| Cap                     | Value            | Enforced on                                                        |
| ------------------------ | ---------------- | -------------------------------------------------------------------|
| Max `limit`               | **10000**         | Top-level `limit` and every relation node's `limit`.               |
| Max nesting depth         | **10**            | The `where` tree (including nested `and`/`or`/`not` and relation-EXISTS nesting) and the `relations` block (including nested `relations.<name>.relations...`). |
| Reserved keys             | `RAW`, `AND`, `OR`, `NOT` | Denied as field/relation names at every depth — these collide with Drizzle RQB v2's own reserved filter keys or with the DSL's own translated connectors. |

Both caps are **process-wide defaults**, not configurable from the wire — a statement that violates either one never reaches the database. A statement exceeding the limit cap or the depth cap fails validation with a descriptive error before any translation happens.

### Design decision: no raw SQL, ever

The DSL exposes **no** `literal`, `fn`, `col`, or raw-SQL key anywhere — there is no escape hatch. This closes the injection surface the old Sequelize-shaped contract opened via `attributes: { literal: ... }` (an arbitrary SQL fragment could be smuggled in as a "projection"). There are also no subqueries in the general sense: the only "subquery-like" capability the DSL exposes is the relation-filter `EXISTS` check described in [Filtering by relation fields](#filtering-by-relation-fields) — and that is a fixed, validated shape, not an arbitrary nested SELECT.

If a use case genuinely needs raw aggregate SQL, multi-table joins beyond one relation hop, or window functions, it belongs to the report-engine's cube layer, not to a hand-crafted `QueryStatement` — see the note in [Aggregation limitations](#limitations).

## `query` vs. `constraint`

Every paginate/get/find/list endpoint accepts **two** independent `QueryStatement`-shaped arguments:

- **`query`** — the client-supplied filter/sort/pagination payload. Comes straight from the request body (REST) or GraphQL variables.
- **`constraint`** — the server-enforced scope (tenant isolation, permission filters, soft-delete exclusion). Set by the server side, never by the client.

```graphql
hubPaginateAppsAccounts(query: QueryStatementInput, constraint: QueryStatementInput): Pagination!
```

The two are merged server-side, under `AND`, before translation — the client's `where` can never override or bypass the server's `constraint`:

```json
// query (client-supplied)
{ "where": { "name": { "iLike": "%acme%" } }, "limit": 20 }

// constraint (server-enforced)
{ "where": { "tenantId": { "eq": "tenant-42" } } }

// merged effective statement
{
  "where": {
    "and": [
      { "name": { "iLike": "%acme%" } },
      { "tenantId": { "eq": "tenant-42" } }
    ]
  },
  "limit": 20
}
```

`relations` and `order` are deep-merged (not wholesale-replaced) the same way — a `constraint.relations` entry does not erase a `query.relations` entry for a different relation.

## Migration from the legacy (Sequelize-shaped) statement

Before the Drizzle cutover, `QueryStatement` mirrored Sequelize's own option bag. The table below maps each legacy shape to its current equivalent — useful when reading old code or old docs.

| Legacy (Sequelize-shaped)                                  | Current (Aurora Query DSL)                                    |
| ------------------------------------------------------------ | ---------------------------------------------------------------|
| `include: [{ association: 'role' }]`                          | `relations: { role: true }`                                    |
| `order: [['createdAt', 'DESC']]`                               | `order: [{ field: 'createdAt', dir: 'desc' }]`                  |
| `where: { '$role.name$': { [Operator.iLike]: '%admin%' } }`     | `where: { role: { name: { iLike: '%admin%' } } }`               |
| `where: { name: { '[eq]': 'admin' } }` (bracketed string key)   | `where: { name: { eq: 'admin' } }` (bare key)                   |
| `where: { name: { [Operator.eq]: 'admin' } }` (typed enum)      | `where: { name: { eq: 'admin' } }` (same bare key, no enum import) |
| `include: [{ association: 'role', required: true }]` (`required: true` → `INNER JOIN`, excludes parents with no match) | **No direct equivalent.** Relation shaping in the DSL never excludes parents by itself — express the exclusion as a relation filter in `where` (`where: { role: {...} }`) instead, combined with `relations: { role: true }` if you also want the data loaded. |
| `attributes: [...]` (column projection)                         | Removed — no projection key in the DSL; use field-schema `format`/`@Sanitize` to mask sensitive fields instead of relying on column selection. |
| `group: [...]` (bare `GROUP BY`)                                | Removed as a standalone key — grouping is only available inside `aggregation.groupBy`, paired with `aggregation.fields`. |
| `lock: ...` (`SELECT ... FOR UPDATE` / `FOR SHARE`)             | Removed — no row-locking key in the DSL.                        |

The legacy `Operator` enum also carried many MySQL-only or rarely-used values with no equivalent today (`like`, `startsWith`, `regexp`, `col`, `join`, range-adjacency operators, `any`/`all`/`values`/`placeholder`, …) — the current DSL's 13 `where` operators are an intentionally smaller, Postgres-focused, whitelist-validated set.
