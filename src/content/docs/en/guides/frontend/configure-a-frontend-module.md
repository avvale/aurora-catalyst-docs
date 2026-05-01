---
title: Configure a frontend module
description: "End-to-end recipe for a generated frontend module — pick the detail shell, choose widgets, lay out the form, opt into embed mode, and regenerate."
---

## Goal

Take a freshly-scaffolded frontend module and configure it through its `*.aurora.yaml` so the regenerated form, list, and detail come out with the right shell, the right relational widgets, the right layout, and the right child-embed wiring — without hand-editing the generated code.

## Before you start

- A scaffolded module under `cliter/<bounded-context>/<module>.aurora.yaml`.
- The `catalyst` CLI available locally (`catalyst load front module --force` works).
- Translation files for the bounded context and module — Aurora generates the structure but never the strings.

## Steps

1. **Pick the detail shell.** The optional `front.detailMode` field on the module's YAML accepts `view` (default) or `dialog`. Choose by use case: long forms, deep links, and many tabs → `view`; small lookups where inline editing wins → `dialog`. View mode emits `*-detail.component.ts` plus `/new` and `/edit/:id` routes; dialog mode skips the detail file and embeds an `<hlm-dialog>` over the list. Concept: [Detail mode: view or dialog](../../../concepts/frontend/detail-mode/).

2. **Configure relational widgets.** For each FK or relationship, declare `widget.type` based on the option-set size and the UX you want:

   | `widget.type`                       | Best for                                                          |
   | ----------------------------------- | ----------------------------------------------------------------- |
   | `select`                            | many-to-one with up to ~20 options                                |
   | `multiple-select`                   | many-to-many with up to ~20 options                               |
   | `search-select`                     | many-to-one, 50–500 options, sync filter (preloaded)              |
   | `multiple-search-select`            | many-to-many, 50–500 options, sync filter                         |
   | `async-search-select`               | many-to-one with 1000+ options, server-side paginated search      |
   | `async-multiple-search-select`      | many-to-many with 1000+ options, server-side paginated search     |
   | `grid-select-element`               | many-to-one rendered as a table-style picker dialog               |
   | `grid-select-multiple-elements`     | many-to-many rendered as a multi-row table picker                 |
   | `grid-elements-manager`             | one-to-many CRUD embedded inside the parent's detail              |

3. **Group and tab the form.** `widget.group` clusters related fields visually inside the form (one wrapper per group, each with its own auto-expand pass). `widget.tab` spreads fields across `<hlm-tabs-content>` panels. Both are independent containers — span math never crosses between them.

4. **Tweak field widths.** The default span table covers most cases — `boolean` / `date` / `time` → 3, numerics → 4, `varchar` by `maxLength` (≤30 → 4, 31–80 → 6, >80 → 12), `text` and grid relations → 12. Override per property with `widget.span: 1–12` when the default does not fit. The last field of an incomplete row auto-expands to fill the gap. Concept: [Form field widths](../../../concepts/frontend/form-field-widths/).

5. **(Optional) Opt the module into embed mode.** If this module is a CHILD that should be edited inside its parent's detail, declare `front.embedSupport: true` at the top level. The codegen then emits the polymorphic list (`mode: 'standalone' | 'embed'`), the form-embed component, and the embed columns factory. The PARENT's YAML separately declares `widget.type: grid-elements-manager` on the property pointing here. Concept: [Embed mode (parent-child)](../../../concepts/frontend/embed-mode/). Recipe: [Implement a grid-elements-manager widget](./implement-grid-elements-manager/).

6. **Customize fields beyond the YAML's reach.** The form-component template emits `AURORA:FORM-FIELDS-START/END` markers around the field block. Anything you write inside that region survives regeneration byte-for-byte — custom validators, hand-tuned field reorderings, freeform markup, anything the layout cannot express declaratively. Concept: [Preservation regions](../../../concepts/frontend/preservation-regions/).

7. **Regenerate.**

   ```bash
   catalyst load front module --name=<bounded-context>/<module> --force
   ```

   For embed scenarios, regenerate the **child first** so the parent's regen can read the child's YAML with `embedSupport: true` already in place.

8. **Add the translation keys.** Aurora ships `Aurora.NoResults` for empty states; everything else is on you. Field labels, list column headers, the embed widget card title, and the form section labels all come from your transloco files using keys derived from the bounded context, module, and aggregate names.

## Verify it worked

- Run `pnpm dev`, navigate to the module's list, and confirm: rows show local fields plus a column for each many-to-one FK (`<rel>.name`), search and filter cover all searchable columns including FK columns, and pagination works.
- Open detail in `edit` mode and confirm the form layout, the relational widgets, the tabs and groups, and any embedded child sections behave as you declared.
- Open detail in `new` mode and confirm — for embed setups — that the embedded child widget is hidden until the parent is saved.
- For dialog mode, confirm `/new` and `/edit/:id` are NOT routable; create and edit only happen inside the dialog.

## Troubleshooting

**Regen fails with "target lacks `embedSupport: true`".**
The parent's regen reads the child's YAML during validation. Add `front.embedSupport: true` to the child YAML and regenerate the child first, then rerun the parent.

**The embed widget never renders.**
Check the parent's `front.detailMode`. If it is `dialog`, the codegen logs a warning and omits the widget to avoid a dialog-in-dialog stack. Switch the parent to `view`.

**A relational dropdown is empty when the page loads.**
The route resolver pre-loads option lists in parallel. If your custom list-config or detail-config trims away the relational fetch, the form has nothing to render. Confirm `<rel>Options` is in `route.snapshot.data` for the affected relation.

**Search misses an FK column.**
The codegen sets `searchable: true` on FK columns by default. If a manual override left `searchable: false`, regenerate the columns file (it is now codegen-owned).

**A preservation region is dropped on regen.**
The template stopped declaring that region upstream. Rescue your content from git history; there is no automatic migration. See [Preservation regions](../../../concepts/frontend/preservation-regions/).

**`widget.span` does not affect the layout on a `grid-elements-manager`.**
Expected — the widget is a section, not a field, and always renders full-width. The codegen emits a warning when `span` is declared on it.

## Related

- [Detail mode: view or dialog](../../../concepts/frontend/detail-mode/) — the shell decision.
- [Form field widths](../../../concepts/frontend/form-field-widths/) — the grid system.
- [Embed mode (parent-child)](../../../concepts/frontend/embed-mode/) — the parent-child model.
- [Preservation regions](../../../concepts/frontend/preservation-regions/) — owning a slice of generated code.
- [Implement a grid-elements-manager widget](./implement-grid-elements-manager/) — focused recipe for the embed widget.
- [`catalyst load` reference](../../../reference/cli-commands/load/) — every flag and argument.
