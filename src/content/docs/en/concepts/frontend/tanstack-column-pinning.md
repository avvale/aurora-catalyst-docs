---
title: "TanStack column pinning order"
description: "Why pinning a column does not move it — and how the data-table reorders pinned columns by writing to both `setColumnPinning` and `setColumnOrder`."
---

## Why this exists

TanStack Table powers the Aurora data-table. Its column-pinning API is built around two state slices that look like one when you read the docs at first pass: `columnPinning.left` (and `.right`) and `columnOrder`. Mixing them up is the difference between a column moving where you wanted it and the column refusing to budge.

The single sentence that costs the most debugging time: **`columnPinning.left` is a SET of IDs, not a visual order.** A column listed there is pinned to the left edge — that is all. Where it sits relative to other pinned columns on that edge is decided by `columnOrder` (or, when `columnOrder` is empty, by the declarative order of the `columns` array passed to the table).

If you want to drag a pinned column to a new spot inside the pinned zone — or simply to introduce a deterministic ordering when several pinned columns coexist — you have to write to **both** state slices.

## How it works

### The two state slices

TanStack reads two pieces of state to render a column:

| State                     | Job                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| `columnPinning.left`      | The set of column IDs anchored to the left edge under horizontal scroll. Order does not matter here.  |
| `columnPinning.right`     | Same idea, anchored to the right edge.                                                            |
| `columnOrder`             | The visual order across the whole table (left-pinned, scrollable middle, right-pinned). When empty, falls back to the declarative order of `columns`. |

Render order is `[left-pinned in columnOrder] [scrollable in columnOrder] [right-pinned in columnOrder]`. Membership in a pin zone comes from `columnPinning`. Position within the zone comes from `columnOrder`.

### The symptom

Imagine a table whose declarative `columns` array is `[actions, select, code, name, description]`. The user drags `name` before `code` inside the left-pinned zone. The naive call:

```typescript
table.setColumnPinning({
  left: ['actions', 'select', 'name', 'code'],
  right: [],
});
```

You expect the rendered row to read `Actions · Select · Name · Code · Description`. It does not. The DOM still shows `Actions · Select · Code · Name · Description`. The pinning flags moved (both `name` and `code` register as left-pinned), but the visual order respected the declarative `columns` array, not the array you passed to `setColumnPinning.left`.

### The fix

Reorder is a two-write operation: pinning AND order, with the same intent on both:

```typescript
const newStickyOrder = ['actions', 'select', 'name', 'code'];
const right: string[] = [];
const scrollOrder = ['description'];

table.setColumnPinning({ left: newStickyOrder, right });
table.setColumnOrder([...newStickyOrder, ...scrollOrder, ...right]);
```

Verified in the DOM (`Code` 90 px from the left edge, `Name` 250 px) when both calls land with the same intent. Drop either call and the visual stays at the original declarative order.

### Where Aurora applies it

`@aurora/components/data-table/components/column-toggle.component.ts` exposes a private `applyZoneReorder(stickyOrder, scrollOrder)` method invoked by the drag-drop handlers `onDropSticky` and `onDropScroll`. That single helper is the only place in the framework that calls both setters together; every consumer that needs to reorder pinned columns goes through it.

## When it applies

- You implement a drag-and-drop reorder UI inside a pinned zone of a TanStack-based table — left-pinned actions, right-pinned summary, anything similar. Use `setColumnPinning` for membership and `setColumnOrder` for position.
- A `setColumnPinning({ left: [...] })` call seems to work for everything except the rendered order — the column still sits where it sat before. That is the symptom; add the matching `setColumnOrder` call.
- You are introducing programmatic control over which columns are pinned (e.g., a "default sticky" preset). Decide a deterministic order at the same time you decide membership and write both.

## Trade-offs and limits

- **The two slices can drift.** A column ID can appear in `columnPinning.left` but be missing from `columnOrder` (or vice versa). TanStack tolerates the asymmetry — the column still renders — but the visual order falls back to declarative for whichever slice is incomplete. Keep the two writes paired in a single helper to avoid drift.
- **Helpers do not chain implicitly.** `setColumnPinning` does not call `setColumnOrder` for you, even when the new pinning value would be ambiguous without a matching order. The decoupling is intentional in TanStack — pinning and order are orthogonal concepts — but it is also why this trip-up shows up.
- **Declarative `columns` is your default order.** When `columnOrder` is empty, the table renders in the order of the `columns` array passed at construction. Do not rely on it after the user has interacted: once you call `setColumnOrder` once, the table starts honoring that array, and silently drifting back to declarative order is no longer an option.

## Related

- [Cell renderers](./cell-renderers/) — the sibling concept that covers how each column's value is rendered (the WHAT). Pinning is the WHERE.
- [Configure a frontend module](../../../guides/frontend/configure-a-frontend-module/) — the broader workflow this lives inside.
