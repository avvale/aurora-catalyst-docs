---
title: Form field widths
description: How the 12-column grid, type-based defaults, the `widget.span` override, and the auto-expand pass decide how wide each field renders.
---

## Why this exists

Forms used to render on three abrupt grid tiers (`compact` / `medium` / `full`) keyed by field count, with span keywords whose meaning shifted per tier and `maxLength` doubling as a UI proportion proxy. A single `varchar(64)` field could render at 50% width inside a dialog. Gaps appeared when the row's fields did not sum to a clean grid total. The layout jumped from 2 columns to 6 the moment you added the sixth field. And there was no escape hatch — everything lived in a hardcoded `switch`.

The new model is uniform and predictable: one 12-column grid for every form, group, and tab; a default span chosen by the property's type; and a YAML override for the cases the default cannot foresee.

## How it works

There are three layers.

### 1. One grid

Every form, every `widget.group`, every `<hlm-tabs-content>` panel renders on the same wrapper class:

```html
<div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-5">…</div>
```

Mobile stacks vertically (`grid-cols-1`); from the `md` breakpoint up everything is a 12-column grid. There is no per-tier alternative — one grid configuration in the entire codegen.

### 2. Default span by type

When a property does not declare `widget.span`, the generator picks a span from this table:

| Property shape                                                                                                              | Default span |
| --------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `boolean` / `date` / `time` / `enum` (≤ 5 options)                                                                          | 3            |
| `enum` (> 5 options) / `int` / `smallint` / `bigint` / `decimal` / `float` / `id` with `select` or `multiple-select` widget | 4            |
| `id` with `async-search-select` widget / `password`                                                                         | 6            |
| `varchar` with `maxLength` ≤ 30                                                                                             | 4            |
| `varchar` with `maxLength` 31–80                                                                                            | 6            |
| `varchar` with `maxLength` > 80 or undefined / `text` / `grid-select-element` / `grid-select-multiple-elements`             | 12           |

`maxLength` only feeds the `varchar` row — it is no longer reused as a UI proxy for numerics or anything else. Each field's wrapper carries `col-span-12 md:col-span-<N>` so the mobile stacking baseline holds regardless of the desktop span.

### 3. Override and auto-expand

Two escape hatches close the gap between the default table and the layout you want.

**`widget.span` (1–12)** overrides the default on a single property. Out-of-range values (0, 13, …) fail JSON schema validation before generation runs.

```yaml
properties:
  - name: notes
    type: text
    widget:
      span: 8       # half-row instead of full-width
```

**Auto-expand of the last incomplete row.** A single-pass algorithm walks the visible fields per container, tracking how many columns the current row already occupies. When the next field would overflow 12, the current row wraps. When the **last** field of a container leaves a gap (its accumulated row reaches less than 12), its span is overridden to fill the remaining columns. The pass runs once per container — the entire form, each `widget.group`, each tab — so spans never bleed between groups or between tabs.

That gives the layouts you would draw by hand:

| Resolved spans  | Rendered rows                                                  |
| --------------- | -------------------------------------------------------------- |
| `[6]`           | one row with the field at span 12 (auto-expanded)              |
| `[4, 4]`        | one row: 4 + 8 (the second auto-expands from 4 to 8)           |
| `[6, 6, 4]`     | row 1: 6 + 6 — row 2: 12 (the third auto-expands from 4 to 12) |
| `[6, 6, 12]`    | unchanged — the last field is already 12                       |

A container with exactly one field always renders at span 12, by the same algorithm.

## When it applies

- You generate a new module and the field widths look right out of the box — the default table is doing its job.
- You add a sixth field to the YAML and the layout does not "jump" — the grid is the same regardless of field count.
- You want a `varchar` to take half a row instead of full — declare `widget.span: 6` and regenerate.
- You see a form with two short fields and the second renders wider than its default — that is auto-expand filling the last row.
- You split fields across tabs or groups — each container balances its own row math; spans never cross containers.

## Trade-offs and limits

- **Regenerating any form changes the markup.** The legacy `SPAN_TABLE`, `pickGridMode`, `lengthToProportion`, and the compact/medium/full tiers are gone. YAMLs do not need migration, but the rendered layout will differ. By design.
- **Defaults are opinionated, not detected.** The table is a fixed lookup. The generator does not try to guess that a particular `int` represents a year (and could be narrower) or that two related varchars belong on the same row. Use `widget.span` when the default does not fit.
- **Auto-expand only touches the last field of a row.** It is not a redistribution algorithm. If you have `[3, 3, 3]`, the third field expands to 6 — not three fields of 4. To get a symmetric `[4, 4, 4]`, declare them with `widget.span: 4` explicitly.
- **Mobile is always one column.** The baseline `col-span-12` stacks every field below 768px. The dialog's CSS `max-width` is what controls modal width — not the template.

## Related

- [Detail mode: view or dialog](../detail-mode/) — both shells render the form using this same grid and span system.
- [Preservation regions](../preservation-regions/) — `AURORA:FORM-FIELDS-START/END` lives inside `*-form.component.ts` so customised field bodies survive regeneration.
