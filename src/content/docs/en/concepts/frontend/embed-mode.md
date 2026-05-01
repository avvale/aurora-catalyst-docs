---
title: "Embed mode (parent-child)"
description: "How `front.embedSupport: true` opts a child module into being embedded inside its parent's detail view, and what changes in the codegen when it does."
---

## Why this exists

Aurora has plenty of relationships where one parent owns many children edited together. A bounded context owns its permissions; a tenant owns its accounts; an order owns its line items. Without help from the codegen, the only way to manage a parent's children is to navigate to the child's standalone CRUD, apply a manual filter, and remember which parent you are scoping to. The parent's detail page shows nothing about the children that belong to it.

Embed mode flips the model: the parent's detail page hosts the child's list, scoped automatically to the current parent, with create and edit happening in dialogs over the parent. The child still has its own standalone surface — it just gains a second mode the codegen knows how to drive.

## How it works

Two YAML toggles activate the model. They live in different modules and both must be set.

**On the child:** `front.embedSupport: true`. This opts the child into the polymorphic shape — the codegen now emits a list-component with `mode: 'standalone' | 'embed'` inputs, a `*-form-embed.component.ts` whose FK to the parent is injected at submit time (not declared as a control), and a second column factory `getXEmbedColumns(...)` that drops the parent FK column. Without the flag, the child's regen is unchanged.

**On the parent:** `widget.type: grid-elements-manager` on the relationship property pointing at the child. This tells the codegen to emit, in the parent's detail shell, a section that mounts `<au-{child}-list mode="embed" [parentFilter]=... [parentDefaults]=...>`. The codegen reads the child's YAML to find the FK back-reference (the property whose `relationship.type` is `many-to-one` and whose `modulePath` points at the parent), and wires that field into the `parentFilter` and `parentDefaults`.

Once both toggles are set:

- The child's list runs without header or breadcrumb in `mode="embed"`. The "+ New" button always opens a dialog, regardless of the child's own `front.detailMode`. The persistent `parentFilter` is AND-ed with the user's UI filters and cannot be removed.
- "Edit row" first calls `shell.fetchForEdit(row.id)` to hydrate the row with all the relational includes the list query did not load, then opens the dialog with the hydrated `initial`.
- The dialog renders `<au-{child}-form-embed>` instead of the standalone form. Submit injects the parent FK from `parentValue()`; the FK is not part of the FormGroup.

## When it applies

- The relationship is one-to-many and editing children inline saves the user the round trip to the child's standalone surface.
- The child still makes sense as a top-level CRUD — its own list, its own routes, all keep working.
- The parent's `front.detailMode` is `view`. Dialog mode cannot host the widget; the codegen warns and omits it.
- The widget appears only when the parent is in `mode = 'edit'`. In `new` mode the parent has no id yet, so there is nothing to associate children with.

## Trade-offs and limits

- **No nested writes.** Each child mutation is its own request — saving a parent does NOT save its children atomically. If you need transactional consistency across both, write that yourself; the framework does not coordinate them.
- **Dialog-in-dialog is forbidden.** A parent declared with `front.detailMode: dialog` cannot host the embed widget. The codegen emits a warning and skips emission to avoid stacking a dialog inside a dialog.
- **`widget.span` is ignored.** The widget is a section, not a field — it always renders full-width. Declaring `widget.span` on a `grid-elements-manager` property emits a warning at codegen time.
- **Hardcoded label.** The widget's card title uses a transloco key derived from the child aggregate's plural name (e.g. `iam.permission.Permissions`). Aurora does not generate the value — the developer adds it to the translation files.
- **Cross-schema validation is fail-fast.** If the parent's regen reads a child YAML that lacks `embedSupport: true`, generation aborts with an actionable error. Always opt the child in and regen it before regenerating the parent.

## Related

- [Implement a grid-elements-manager widget](../../../guides/frontend/implement-grid-elements-manager/) — step-by-step recipe for the YAML and the regen flow.
- [Configure a frontend module](../../../guides/frontend/configure-a-frontend-module/) — the broader workflow embed mode fits into.
- [Detail mode: view or dialog](../detail-mode/) — why `dialog` mode cannot host the embed widget.
- [Grid elements manager widget](../../../changes/cli/2026-04-30-spec-15-grid-elements-manager-widget/) — the change that introduced the model.
