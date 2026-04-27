---
title: "Detail mode: view or dialog"
description: How `front.detailMode` chooses between a routed detail page and a list-with-modal CRUD, and why both shells embed the same form component.
---

## Why this exists

Some aggregates deserve a dedicated page — long forms, many tabs, many relations to digest. Others are small enough that opening a separate route just to edit a row is friction: you click "Edit", the list disappears, you save, you navigate back. For those, a modal that floats over the list is faster.

Aurora used to bake "routed detail page" into the codegen. If you wanted a dialog-based CRUD, you edited the generated detail and list components by hand — and lost those edits the next time you regenerated. The other half of the problem: even when the routed page was the right call, the form body lived inline inside `*-detail.component.ts`, so it could not be embedded anywhere else (a wizard step, a child editor, a custom shell).

`front.detailMode` separates the two questions. The form is always its own standalone component. The shell that wraps it — routed page or modal — is a YAML decision.

## How it works

Two pieces.

### The form is always its own component

Regardless of the mode, the generator emits a `*-form.component.ts` with a dumb-component contract:

| Surface             | Type                          | Notes                                                                                             |
| ------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------- |
| `[initial]`         | `T \| null`                   | `null` means "new record"; an object means "edit".                                                |
| `[mode]`            | `'new' \| 'edit'` (required)  | Required input. A shell that forgets to pass it is a TypeScript error, not a silent default.     |
| `(save)`            | `T`                           | Emitted when the shell calls `submit()` and the FormGroup is valid.                               |
| `(cancel)`          | `void`                        | Emitted when the user clicks Cancel.                                                              |
| `submit()` (method) | `void`                        | Public method the shell's Save button calls. Validates and emits `(save)` or marks fields touched. |

The form does NOT own data fetching (no Apollo, no `useGraphqlDetail`) and does NOT own chrome — no header, no action buttons, no `<section hlmCard>`, no `<hlm-dialog-content>`. Layout, validators, and field markup are all inside the form; everything around it is the shell's job.

### The shell is chosen by `front.detailMode`

The YAML field accepts two values, and the generator emits a different file matrix per value:

| `detailMode`         | Files emitted                                                                                                   | Routes (target shape)                                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `view` (default)     | `*-form.component.ts` + `*-detail.component.ts` (thin shell embedding the form)                                 | `''` → list, `new` → form in `new` mode, `edit/:id` → form in `edit` mode  |
| `dialog`             | `*-form.component.ts` + `*-list.component.ts` extended with `<hlm-dialog>` wrapping the form. No detail file.   | `''` → list. No `/new`, no `/edit/:id`.                                     |

In **view** mode, clicking Create on the list navigates to `/new`; clicking Edit on a row navigates to `/edit/:id`. The detail shell delegates field rendering to `<au-module-form>` and data access to `useAggregateShell` — it owns no FormGroup, no validators, no field markup of its own.

In **dialog** mode, the list embeds an `<hlm-dialog>` whose `[state]` is bound to a signal. Clicking Create opens the dialog with `mode = 'new'` and `initial = null`. Clicking Edit on a row first calls `shell.fetchForEdit(row.id)` to hydrate the full aggregate (including relational includes the list query did not load), then opens the dialog with `mode = 'edit'` and the hydrated `initial`. Cancel and successful save both close the dialog.

### `useAggregateShell<T>` is the shared data-access seam

Both shells call the same hand-authored composable from `aurora-catalyst/frontend/src/@aurora/lib/use-aggregate-shell.ts`:

- `fetchForEdit(id)` — standardised fetch that includes every relation configured in `detailConfig`.
- `save(value, mode)` — dispatches `create` when `mode === 'new'`, `update` when `mode === 'edit'`.
- `loading: Signal<boolean>` — reflects any in-flight fetch or mutation.
- `error: Signal<Error | null>` — last error from save/fetch, cleared on next success.

The generated code does not branch on `detailMode` when calling it — only the chrome around the form is different.

## When it applies

- You scaffold a new module without setting `front.detailMode` — you get the routed view-mode flow with `/new` and `/edit/:id`.
- You declare `front.detailMode: dialog` on a small lookup table (tags, permissions, simple references) — the list grows a Create button that opens an `<hlm-dialog>` and edit actions open the same dialog with the row hydrated.
- You change a module from one mode to the other — regenerate. Switching to dialog stops emitting `*-detail.component.ts` and trims the routes file (the route trim is a follow-up; the change that introduced `detailMode` deliberately leaves the codewriter untouched). Switching back to view re-emits the detail shell.
- You need to embed the form somewhere new (a wizard step, the upcoming `grid-elements-manager`) — you do not fight the codegen; the form is already a standalone component you can mount anywhere as long as you pass `[mode]`.

## Trade-offs and limits

- **The preservation region for custom field bodies lives in the form file.** `AURORA:FORM-FIELDS-START/END` is hosted by `*-form.component.ts`. If you customised that region back when it lived inside `*-detail.component.ts`, copy your body into the new form file before regenerating — there is no automatic migration, and the CLI emits `[REGION DROPPED]` for the abandoned detail location.
- **Dialog mode skips routing for create and edit.** No `/new`, no `/edit/:id`. Deep-linking to "edit row 42" is not possible without you wiring it manually. If shareable URLs to a specific edit state matter, stay on `view`.
- **Both modes share the same form layout.** The 12-column grid and the `widget.span` system render identically regardless of shell — the dialog's CSS `max-width` controls the modal width, not the template. A wide form simply scrolls inside the dialog.
- **`mode` is required by design.** The form's `mode = input.required()` makes a missing parameter a TypeScript error. If you embed the form in a custom shell, pass `'new'` or `'edit'` explicitly. The form treats `[initial]="row" [mode]="'new'"` as a clone (a new record pre-filled with another row's values) — useful, but explicit.
- **Routes follow the mode, but the route emitter still lags.** The change that introduced `detailMode` defines the target route shape (view → three routes, dialog → one) but leaves the existing route generator untouched; a follow-up wires the codewriter. Until that follow-up lands, switching modes leaves the routes file unchanged — you may end up with an unreachable `/new` route in dialog mode, or a missing one in view. Regenerate after the follow-up to align.

## Related

- [Form field widths](../form-field-widths/) — the form-body's grid and span system applies in both shells.
- [Preservation regions](../preservation-regions/) — the `AURORA:FORM-FIELDS` region lives inside `*-form.component.ts`.
- [Detail mode: view or dialog](../../../changes/cli/2026-04-25-spec-08-form-extraction-detail-mode/) — the change that introduced the split.
