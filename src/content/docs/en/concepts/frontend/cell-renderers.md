---
title: "Cell renderers"
description: "How the data-table dispatches by property type and renders each cell through a dedicated component under `cells/`, and how to override the rendering per column."
---

## Why this exists

The Aurora data-table is built on TanStack Table. For each column, the codegen decides what to render in each cell. The default is plain string coercion: whatever value sits in the row at that key gets stringified and printed. That works for a `varchar` or a `text` property — it falls flat for everything else. A boolean shows as the literal `true` / `false`. A date shows as an ISO timestamp. An enum shows as its raw key. None of those are usable on a list page.

The fix is per-type cell renderers. Each one takes the row's value, knows what shape it has, and emits the visual treatment that fits — an icon for booleans, a localized date for timestamps, a colored badge for enum values. The codegen dispatches by property type so the right renderer is wired automatically; the developer overrides per column when the default does not fit.

## How it works

### Two kinds of components under the data-table

The frontend lib at `@aurora/components/data-table/` distinguishes two roles:

- **`cells/`** — components inyected via `flexRenderComponent` whose only job is to **format a value for display**. They consume the row's value via `injectFlexRenderContext<CellContext<T, V>>()` (or `HeaderContext<T, V>` for header cells) and have no side effects on the table state.
- **`components/`** — components that compose the toolbar or mutate the table's state. Selection toggles, sort buttons, pagination controls, column visibility, filter UI. They depend on the TanStack mutation API (`Table<T>`, `setColumnVisibility`, `toggleAllRowsSelected`, …).

Anything that calls a `Table<T>` setter belongs in `components/`, even if it happens to be inyected via `flexRenderComponent`. Anything that just reads a value and renders it belongs in `cells/`.

### Dispatch by property type

The codegen of `<mod>.columns.ts` walks each property of the aggregate and picks a cell based on the property type. Today the dispatch covers:

| Property shape                       | Cell                                                                          |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| `boolean`                            | `flexRenderComponent(BooleanCell, { inputs: {} })`                            |
| `id` + `relationship: many-to-one`   | `accessorKey: '<rel>.name'` with auto-include (see [Auto-include FK columns](../../../changes/cli/2026-04-30-spec-17-fk-column-auto-include/)) |
| anything else                        | `(info) => \`${info.getValue<string>()}\`` — plain string coercion            |

The `cells/` family is designed to grow: future renderers (`DateCell`, `BadgeCell`, `CurrencyCell`, `EnumCell`, …) will take over from the string fallback for their respective types as each lands.

### The `BooleanCell` reference implementation

`BooleanCell` is the canonical example of the contract:

- Lives at `@aurora/components/data-table/cells/boolean-cell.component.ts`. Selector `au-boolean-cell`. `ChangeDetectionStrategy.OnPush`. Generic over `T`.
- Defaults: `lucideCheck` + `text-emerald-600` for `true`, `lucideMinus` + `text-muted-foreground/60` for `false`.
- Override inputs: `trueIcon`, `falseIcon`, `trueClass`, `falseClass`. All have defaults.
- Accessibility: the `<ng-icon>` carries `aria-label="true"` or `aria-label="false"`.

### Customizing per column

To change the rendering of one column, edit the `cell:` factory in the generated `<mod>.columns.ts` and pass overrides through `inputs:`:

```typescript
{
  accessorKey: 'isLocked',
  // ...
  cell: () => flexRenderComponent(BooleanCell, {
    inputs: { trueIcon: 'lucideLock', trueClass: 'text-amber-600' },
  }),
}
```

That edit will produce a `.origin` file on the next regeneration — accept the merge to keep your customization. There is no YAML field for overrides today; the override path is TypeScript on the generated columns file.

### Authoring a new cell renderer

When you add `DateCell`, `BadgeCell`, or anything similar, two rules:

1. **Place it under `cells/` and re-export from the barrel chain** (`cells/index.ts` → `data-table/index.ts` → `@aurora`). Anything that mutates table state stays in `components/`.

2. **Read the value with a getter, not `computed()`.** The `injectFlexRenderContext().getValue()` API is a method on a Proxy, not a signal. A `computed()` would memoize against an identity that never changes, so the cell would never re-render when the row's value changes.

   ```typescript
   get value(): boolean {
     return this.context.getValue() ?? false;
   }
   ```

   This is non-obvious; every new cell renderer must use the getter pattern.

## When it applies

- A list shows literal `true` / `false` for a boolean column — that is the legacy string fallback. Regenerate the module and the column switches to `BooleanCell`.
- You want a non-default icon or color on one boolean column (a "locked" account, a "deprecated" feature flag) — edit the generated `cell:` factory and accept the `.origin` review on regeneration.
- A future SPEC ships a new cell renderer (`DateCell`, `EnumCell`, …). Regenerate and the matching property type picks it up automatically.
- You are contributing a new cell renderer to the framework. It belongs in `cells/`; if it has any `Table<T>` mutation, it belongs in `components/` instead.

## Trade-offs and limits

- **No YAML hook for overrides.** There is no `widget.cellIcon` or `widget.cellColor` field. Overrides are applied in TypeScript on the generated `<mod>.columns.ts` and reviewed via `.origin` on regen. A YAML hook is a future SPEC.
- **One renderer per type.** Booleans always render as `BooleanCell` unless you override per column. There is no per-property "render-as" YAML hint — the dispatch is by property type alone.
- **Booleans drop `searchable`.** Text search over the literal `true` / `false` is not useful, so the codegen omits the flag on boolean columns.
- **`flexRenderComponent` requires explicit `inputs: {}`.** Even when you do not override any input, the second argument has to be present (`{ inputs: {} }`). TanStack's typing helper treats `input<T>(default)` declarations as required under TypeScript strict mode, so leaving it off is a compile error.
- **The split is enforced socially, not technically.** Nothing prevents a contributor from putting a state-mutating component under `cells/`. The convention is documented; reviewers police it.

## Related

- [Icon cell for boolean columns](../../../changes/cli/2026-05-02-spec-18-boolean-cell-dispatch/) — the change that introduced `BooleanCell` and the `cells/` convention.
- [Auto-include FK columns in lists](../../../changes/cli/2026-04-30-spec-17-fk-column-auto-include/) — sibling pipeline that emits relational columns (different mechanism, related surface).
- [Configure a frontend module](../../../guides/frontend/configure-a-frontend-module/) — the broader workflow this concept fits into.
