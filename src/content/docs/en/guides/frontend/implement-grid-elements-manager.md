---
title: Implement a grid-elements-manager widget
description: "Embed a child module's CRUD inside the parent's detail page using `widget.type: grid-elements-manager`, end to end — from YAML flags to translation keys."
---

## Goal

Let users manage a parent's children directly from the parent's detail view. The widget renders the child's list (filtered to the current parent) and a "+ New" button that opens the child's form in a dialog — without leaving the parent.

## Before you start

- A Catalyst project with two related frontend modules already scaffolded — a parent (e.g. `iam/bounded-context`) and a child (e.g. `iam/permission`).
- The child YAML declares a `many-to-one` relationship pointing back to the parent — that is the FK the codegen reads to wire the widget. Most child modules already have it.
- The parent's `front.detailMode` is unset or `view`. Dialog mode cannot host the widget — the codegen warns and omits it to avoid a dialog-in-dialog UX.
- You can run `catalyst load front module --force` locally.

## Steps

1. **Opt the child into embed mode.** In the child YAML, declare `front.embedSupport: true`. Without this flag the codegen emits the same files it always did, and the parent's regen will fail when it tries to dispatch the widget.

   ```yaml
   # cliter/iam/permission.aurora.yaml
   front:
     embedSupport: true
   ```

2. **Regenerate the child.**

   ```bash
   catalyst load front module --name=iam/permission --force
   ```

   Three new artefacts appear:

   - `iam-permission-form-embed.component.ts` — a form variant whose FK to the parent is injected at `submit()` time, not declared as a `FormControl`. The required `[parentValue]` input is wired by the embedded list automatically.
   - `getIamPermissionEmbedColumns(...)` factory in `iam-permission.columns.ts` — same columns as `Standalone`, minus the column for the FK to the parent (every row in embed view shares the same parent, so the column would be redundant).
   - The list component grows `mode`, `parentFilter`, `parentDefaults` inputs and renders without header or breadcrumb in `mode="embed"`.

3. **Declare the widget on the parent property.** In the parent YAML, the relationship property that points at the child gets `widget.type: grid-elements-manager`. Optionally place it inside a tab.

   ```yaml
   # cliter/iam/bounded-context.aurora.yaml
   aggregateProperties:
     - name: permissions
       type: relationship
       relationship:
         type: one-to-many
         singularName: permission
         aggregateName: IamPermission
         modulePath: iam/permission
       widget:
         type: grid-elements-manager
         tab: permissions   # optional
   ```

   `widget.detailSort` and `widget.isDetailHidden` apply normally — the widget is treated as a logical field for ordering and hiding. `widget.span` is ignored: the widget always renders full-width.

4. **Regenerate the parent.**

   ```bash
   catalyst load front module --name=iam/bounded-context --force
   ```

   The codegen reads `iam/permission.aurora.yaml`, finds the property whose `relationship.type === 'many-to-one'` and `relationship.modulePath === 'iam/bounded-context'` (e.g. `boundedContextId`), and emits the partial inside the parent's detail shell — wrapped in `@if (mode() === 'edit')` so it only shows once the parent has an id. The list embed receives `parentFilter: { field: 'boundedContextId', value: bcId() }` and `parentDefaults: { boundedContextId: bcId() }`.

5. **Add the translation key.** The widget's card title uses a key derived from the child aggregate's plural name:

   ```text
   <bcKebab>.<childModKebab>.<ChildAggregatePluralPascal>
   ```

   For `iam/bounded-context.permissions` → `iam.permission.Permissions`. Add the entry to your translation files; the codegen does not provide the value.

## Verify it worked

- Open the parent's detail in `edit` mode (`/iam/bounded-context/edit/<id>`). A new section appears below the form card (or inside the declared tab) with a list of child rows filtered to the current parent.
- Click "+ New" inside the embedded list. A dialog opens with the form-embed; submit creates a child whose FK to the parent is set automatically — even though the FK has no field in the form.
- Open the parent in `new` mode (`/iam/bounded-context/new`). The widget is absent — the parent has no id yet, so there is nothing to associate children with.
- The child's standalone surface (`/iam/permission`, `/iam/permission/new`, `/iam/permission/edit/:id`) keeps working unchanged.

## Troubleshooting

**The parent's regen fails with "target lacks `embedSupport: true`".**
The codegen reads the child YAML to validate the embedability. Add `front.embedSupport: true` to the child YAML and regenerate the child first (step 1–2), then rerun the parent.

**Regen fails with "child has no many-to-one back-reference".**
The codegen could not find the FK property in the child YAML. Confirm the child declares an `aggregateProperty` with `relationship.type: many-to-one` and `relationship.modulePath` pointing at the parent's path.

**The widget never shows up.**
Check the parent's `front.detailMode`: if it is `dialog`, the codegen logs a warning and omits the widget to avoid stacking a dialog inside a dialog. Switch to `view` and regenerate.

**The widget shows up but the rows look wrong.**
The list embed reuses the child's `getXEmbedColumns(...)` factory. If you customised the child's columns expecting only the standalone factory to exist, double-check that your edits did not break the embed factory — both live in the same `*.columns.ts` file.

**`widget.span` does not affect the layout.**
Expected. The widget is a section, not a field — `widget.span` is ignored on `grid-elements-manager` and the codegen emits a warning when you declare it.

## Related

- [Grid elements manager widget](../../../changes/cli/2026-04-30-spec-15-grid-elements-manager-widget/) — the change that introduced the widget.
- [Detail mode: view or dialog](../../../concepts/frontend/detail-mode/) — why dialog mode cannot host the widget.
- [Form field widths](../../../concepts/frontend/form-field-widths/) — the grid the parent's form uses; the widget renders as a sibling section, not as a field.
- [`catalyst load` reference](../../../reference/cli-commands/load/) — every flag and argument.
