---
title: "Composition over inheritance: why composables"
description: "Why Aurora's brain layer extends horizontally by composing single-concern functions instead of vertically through class hierarchies."
---

## Why this exists

Every screen in an Aurora frontend needs some mix of the same capabilities: search, sort, pagination, selection, data loading, GraphQL wiring. The architectural question is how a new screen acquires exactly the mix it needs. The classic object-oriented answer is inheritance: put the shared logic in a base class and extend it.

```ts
class BaseListComponent<T> {
  /* data loading */
}
class PaginatedListComponent<T> extends BaseListComponent<T> {
  /* + pagination */
}
class SelectablePaginatedListComponent<T> extends PaginatedListComponent<T> {
  /* + selection */
}
```

This holds up exactly until the first screen that does not fit the chain. A screen that needs **sort and selection but no pagination** has no slot in this hierarchy. Your options are all bad:

- **Inherit anyway and disable.** The screen drags in pagination state it never uses, and "disabled" features become a contract nobody documents.
- **Fork a new branch.** `SortableSelectableListComponent` duplicates the selection logic, because single inheritance cannot merge two branches of the tree.
- **Push everything into the base.** `BaseListComponent` absorbs every capability "just in case" and becomes the monolith — exactly what the old `useDataTable` signal blob was.

These are the named pathologies of inheritance-based reuse: the *fragile base class* (every change to the base ripples down to every descendant), *inheriting what you don't need* (each level carries everything above it), and the *combinatorial explosion* (with N capabilities there are up to 2^N combinations, and each one wants its own class).

The growth direction of inheritance is **vertical**: extending means adding another floor to a tower, and every floor bears the weight of all the floors below. Aurora's brain layer grows in the other direction.

## How it works

### What a composable is

A composable is a plain function that runs in Angular's injection context, owns one bounded slice of state as signals, and returns readonly signals plus explicit setters. There is no `this`, no base class, no hierarchy — nothing to extend and nothing inherited.

```ts
const sort = useTableSort();

sort.state(); // Signal<SortingState> — read
sort.set([{ id: 'name', desc: false }]); // explicit write
```

A component does not *become* sortable by descending from something sortable. It *has* sorting because it called the function. That shift — from **is-a** to **has-a** — is the entire idea.

### Vertical vs horizontal extensibility

Inheritance extends by stacking levels; composition extends by placing pieces side by side.

|                          | Inheritance (vertical)                       | Composition (horizontal)              |
| ------------------------ | -------------------------------------------- | ------------------------------------- |
| Unit of reuse            | A class inside a hierarchy                   | A self-contained function             |
| Adding a capability      | New subclass level, or touching the base     | Calling one more composable           |
| Combining capabilities   | A new class per combination                  | Juxtaposing calls                     |
| Unused capabilities      | Inherited anyway                             | Never instantiated                    |
| Impact of a change       | Ripples down to every descendant             | Local to the consumers of that atom   |
| Cost of N capabilities   | Up to 2^N classes                            | N atoms                               |

The last row is the structural argument. Aurora Catalyst must serve "hundreds of very different projects" — the long tail of screen variants is the norm, not the exception. A vertical architecture pays for each variant with a new node in the tree. A horizontal one pays once per capability and lets every screen pick its own subset.

### The contrast in code

The screen that broke the hierarchy — sortable, selectable, no pagination — is three calls:

```ts
const sort = useTableSort();
const selection = useTableSelection();
const { table } = useDataTable({
  data: () => rows(),
  columns,
  getRowId: (r) => r.id,
  sort,
  selection,
});
```

Nothing unused is dragged in: no pagination atom exists in this screen, so there is no pagination state to disable, document, or pay for. And when the *next* screen needs pagination too, nothing here changes — it composes its own set.

Composition has one honest cost: someone has to write this wiring, and the common cases would repeat it on every page. That is why the convention in Aurora has two tiers — **atoms**, the single-concern pieces, and **presets**, the opinionated compositions like `usePaginatedDataTable` that ship the canonical wiring ready-made. The tiers, the rule that separates them, and the full catalog are covered in [Composables: atoms and presets](../composables/).

## When it applies

- You are building a screen that matches a canonical case (server-paginated list, many-to-many manager). Reach for the preset — the horizontal wiring is already done for you.
- You are building a variant no preset covers (kanban, virtual list, tree table, the sort-plus-selection screen above). Compose the atoms directly. This is the case inheritance could not serve, and the one this architecture exists for.
- You are deciding between a class hierarchy and composables for new shared logic. Rule of thumb: **inherit data shapes, compose behavior**. Genuine *is-a* type hierarchies — error classes, DTO models — are still fine as classes. Stateful screen behavior is not an *is-a* relationship; it is a *has-a* list.

## Trade-offs and limits

- **The wiring is visible.** Inheritance hides composition inside the base class; composables put it at the call site. A complex screen states its full capability list explicitly. That is more lines — and it is also the documentation.
- **The one-concern discipline is manual.** No compiler stops an atom from growing a second responsibility. The guard rule from the atoms/presets contract applies: the moment an atom needs another atom, it is a preset.
- **Cross-cutting orchestration needs a home.** "Changing search resets pagination to page 0" belongs to neither atom. Without presets, that rule gets duplicated at every call site — presets exist precisely so horizontal pieces can share vertical knowledge in one place.
- **Discovery requires a catalog.** In a hierarchy, "go to base class" reveals what you have. With composition, you need to know the atoms exist — that is what the [composables reference](../../../reference/frontend/composables/) is for.

## Related

- [Composables: atoms and presets](../composables/) — how Aurora organizes the composition: the atom/preset rule, the subdomain layout, the full catalog.
- [Composables reference](../../../reference/frontend/composables/) — signatures and configs for every atom and preset.
- [Atomic composables + manager rewrite](../../../changes/catalyst/2026-05-05-refactor-data-table-to-atomic-composables/) — the change that moved the brain layer from monolith to composition.
