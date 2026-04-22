---
title: Wire GraphQL data into the UI
description: Pre-load data in a resolver with fetchers, then render it in a component with composables — using the generated iam/tag module as a running example.
---

In this tutorial you will trace a single piece of data from the GraphQL server all the way to a form field. Along the way you will meet the two layers of `@aurora/modules/graphql/`:

- **Fetchers** — pure one-shot functions that return `Observable<T>`. Ideal for `ResolveFn` resolvers and anywhere you just need the HTTP call.
- **Composables** — `useGraphqlX` functions that wrap a fetcher and expose Angular signals. Ideal for components that need reactive state.

The examples below are taken from `iam/tag`, the first module aurora-catalyst-cli generates. The file paths come from `frontend/src/app/domains/admin/bounded-contexts/iam/tag/`.

## What you will learn

By the end you will be able to:

- Decide when to reach for a fetcher and when to reach for a composable.
- Pre-load data in a router resolver without standing up a composable.
- Render a paginated list backed by `useGraphqlList` and `useDataTable`.
- Render a detail form backed by `useGraphqlDetail`, `pickModel`, and `signalForm`.
- Recognize the anti-patterns that bypass the layer.

## Prerequisites

- An Aurora Catalyst project with at least one generated module (we use `iam/tag`).
- Familiarity with Angular signals and `ResolveFn`.
- Basic GraphQL vocabulary (`query` vs `mutation`, `object:` vs `objects:`).

## The two layers at a glance

The generator emits two files per module that are important for this tutorial:

- `tag.graphql.ts` — the raw GraphQL documents (`paginationQuery`, `findByIdQuery`, `createMutation`, …).
- `tag.list-config.ts` / `tag.detail-config.ts` — a config object that bundles the documents plus the key that the server wraps the payload with (`'pagination'` for lists, `'object'` for details).

Fetchers read from those documents directly. Composables accept the config object and hide the wiring. The config is the single source of truth — both layers point at the same queries.

## Step 1 — Pre-load data in a resolver with fetchers

Resolvers run inside the router's injection context. They do not have a component `DestroyRef`, and any signal they create is discarded the moment navigation resolves. A fetcher returns a plain `Observable<T>` — no signals, no lifecycle coupling — so it is exactly the right shape.

Destructure the fields you need from the generated config, call the fetcher, and return the observable. Nothing else.

```ts
// tag.resolvers.ts
import { type ResolveFn } from '@angular/router';
import {
  buildSortOrder,
  DEFAULT_PAGE_SIZE,
  queryFindById,
  queryPaginate,
  type DataTableData,
} from '@aurora';
import { type IamTag } from '@src/src/app/aurora.types';
import { TAG_DETAIL_CONFIG } from './tag.detail-config';
import { TAG_LIST_CONFIG } from './tag.list-config';

export const tagListResolver: ResolveFn<DataTableData<IamTag>> = () => {
  const { queryPagination, paginationKey, fields } = TAG_LIST_CONFIG;
  return queryPaginate<IamTag>(queryPagination, paginationKey, fields, {
    query: {
      offset: 0,
      limit: DEFAULT_PAGE_SIZE,
      order: buildSortOrder([]),
    },
  });
};

export const tagDetailResolver: ResolveFn<IamTag | null> = (route) => {
  const id = route.paramMap.get('id');
  if (!id) return null;
  const { queryObject, objectKey, fields } = TAG_DETAIL_CONFIG;
  return queryFindById<IamTag>(queryObject, objectKey, id, fields);
};
```

A few things to notice:

- **Destructuring**, not passing the whole config. The resolver declares what it needs (`queryPagination`, `paginationKey`, `fields`) — it does not pretend to own the delete mutation the config also carries.
- **`buildSortOrder([])`** for the initial page. It is the default sort; the component replaces it the moment the user clicks a column header.
- **Return the observable directly**. The router subscribes for you; `lastValueFrom` / manual subscribes are not needed here.

The seven fetchers you can import from `@aurora` are:

| Fetcher            | GraphQL op mirrored | Returns                   | Typical caller            |
| ------------------ | ------------------- | ------------------------- | ------------------------- |
| `queryPaginate`    | paginated list read | `Observable<DataTableData<T>>` | list resolver             |
| `queryFindById`    | single read by id   | `Observable<T \| null>`   | detail resolver           |
| `queryFind`        | single read by criteria (`findQuery` / `object:`) | `Observable<T \| null>` | resolver, ad-hoc lookup |
| `queryGet`         | unpaginated plural read (`getQuery` / `objects:`) | `Observable<T[]>`       | dropdowns, select lists  |
| `mutateCreate`     | create              | `Observable<unknown>`     | non-form CTAs             |
| `mutateUpdate`     | update              | `Observable<unknown>`     | bulk edit actions         |
| `mutateDeleteById` | delete              | `Observable<unknown>`     | delete confirmations      |

## Step 2 — Render a list with `useGraphqlList`

Components are where signals earn their keep. A composable wraps the fetcher, adds a `pagination` signal, a `loading` signal, and a readonly projection, and keeps the rest of your code ergonomic.

`useGraphqlList` is a **facade**: it composes `useGraphqlPaginate` and `useGraphqlDeleteById` so a list screen gets both read and delete with a single call.

Skipping the UI chrome to focus on the data wiring:

```ts
// tag-list.component.ts (abbreviated)
import {
  buildFilterWhere,
  buildSearchWhere,
  buildSortOrder,
  DEFAULT_PAGE_SIZE,
  useDataTable,
  useGraphqlList,
  type DataTableData,
} from '@aurora';
import { Operator } from '@aurorajs.dev/core-common';
import { lastValueFrom } from 'rxjs';
import { TAG_LIST_CONFIG } from '../data-access/tag.list-config';

export default class TagListComponent {
  private readonly route = inject(ActivatedRoute);

  // The whole config goes to the facade — it needs both the paginate query
  // AND the delete mutation.
  private readonly list = useGraphqlList<IamTag>(TAG_LIST_CONFIG);

  // The resolver put the first page into route data; seed the component signal
  // with it so the table paints without an extra round trip.
  readonly page = signal<DataTableData<IamTag>>(
    this.route.snapshot.data['pagination'],
  );

  private readonly dataTable = useDataTable<IamTag>({
    data: () => this.page()?.rows ?? [],
    columns: this.columns,
    totalRows: () => this.page()?.total ?? 0,
    pageSize: DEFAULT_PAGE_SIZE,
    manualSorting: true,
    manualPagination: true,
    onSortingChange: (sorting) => this.fetchPage({ sorting }),
    onPaginationChange: (pagination) =>
      this.fetchPage({
        offset: pagination.pageIndex * pagination.pageSize,
        limit: pagination.pageSize,
      }),
  });

  private async fetchPage(params: { /* … */ } = {}) {
    // build where / order from the table state, then ask the composable
    const fresh = await lastValueFrom(
      this.list.paginate({ query: { where, order, offset, limit } }),
    );
    this.page.set(fresh);
  }

  async confirmDelete() {
    const tag = this.tagToDelete();
    if (!tag) return;
    await lastValueFrom(this.list.deleteById(tag.id));
    await this.fetchPage();
  }
}
```

Three things worth highlighting:

- The resolver populated `route.snapshot.data['pagination']` with the first page. The component reads it once to seed `page` — no flicker on first render.
- `useDataTable` owns table state (sort, pagination, column visibility). Your `fetchPage` derives GraphQL variables from that state using `buildSearchWhere`, `buildFilterWhere`, and `buildSortOrder` from `@aurora`.
- `this.list.paginate(...)` and `this.list.deleteById(...)` return observables too. `lastValueFrom` is how you await them.

## Step 3 — Render a detail form with `useGraphqlDetail`

`useGraphqlDetail` is the write-side facade: it exposes `create(payload)` and `update(payload)` plus a `loading` signal for the save button.

```ts
// tag-detail.component.ts (abbreviated)
import { pickModel, useGraphqlDetail } from '@aurora';
import { TAG_DETAIL_CONFIG } from '../data-access/tag.detail-config';

export default class TagDetailComponent {
  readonly mode = signal<'new' | 'edit'>(this.route.snapshot.data['mode']);
  readonly detail = useGraphqlDetail<IamTag>(TAG_DETAIL_CONFIG);

  // pickModel maps the resolver-loaded record into the form's shape,
  // filling missing fields with the defaults you pass.
  readonly signalModel = pickModel(this.route.snapshot.data['item'], {
    id: '',
    name: '',
  });

  readonly signalForm = this.fb.group({
    id: [this.signalModel.id],
    name: [this.signalModel.name, [Validators.required, Validators.maxLength(64)]],
  });

  async onSubmit() {
    if (this.signalForm.invalid) return;
    const payload = this.signalForm.value as Record<string, unknown>;
    if (this.mode() === 'new') {
      await lastValueFrom(this.detail.create(payload));
    } else {
      await lastValueFrom(this.detail.update(payload));
    }
    this.router.navigate(['/iam/tag']);
  }
}
```

The interesting move is `pickModel`. The resolver returns the full entity (or `null` for new); the form wants a narrow shape with defaults. `pickModel` bridges the two without writing a mapping function by hand.

The button template reads `detail.loading()` to show a spinner while the mutation is in flight — that signal is why the component uses a composable instead of calling `mutateUpdate` directly.

## Choose the right layer

When in doubt, use this table:

| Situation                                         | Layer       |
| ------------------------------------------------- | ----------- |
| `ResolveFn` pre-loading data for a route          | Fetcher     |
| Reactive template that shows `loading` / `item`   | Composable  |
| Populating a `<select>` with a small dictionary   | Fetcher (`queryGet`) inside a resolver |
| One-shot call from a service or a utility         | Fetcher     |
| Anything else in a component                      | Composable  |

The test is simple: **do you need a signal?** If yes, composable. If no, fetcher.

## Anti-patterns to avoid

- **`inject(HttpClient)` for a GraphQL call.** The stack uses Apollo; a REST client breaks cache coherency and bypasses the interceptors.
- **`new BehaviorSubject(...)` for local component state.** The project is signals-first. Use `signal()` instead.
- **String operator literals like `'[iLike]'`.** Import `Operator` from `@aurorajs.dev/core-common` and use `Operator.iLike`. The literal form silently breaks on typos; the enum does not.
- **Calling `useGraphqlList(CONFIG).paginate(...)` from a resolver.** That instantiates a delete composable the resolver does not need and couples the resolver to a component-only contract. Reach for `queryPaginate` and destructure instead.

## Related

- [Change history: Add GraphQL Fetchers](../../changes/catalyst/2026-04-22-query-mutate-layer-separation/) — the original proposal and design notes.
- [How-to guides](../../guides/) — task-oriented recipes once you know the basics.
- [Reference: API](../../reference/api/) — the full TypeScript surface of `@aurora`.
