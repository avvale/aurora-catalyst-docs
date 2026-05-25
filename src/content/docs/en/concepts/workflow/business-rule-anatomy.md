---
title: "Anatomy of a business rule"
description: "The fields, conventions, and lifecycle of a single rule — frontmatter shape, ID grammar, state and severity, the exhaustive case table, cross-aggregate pointers, and how `@rule` citations relate to the catalog."
---

A rule is a Markdown section under `cliter/<bc>/business-rules/<aggregate>.md`. The file holds many rules; the file's frontmatter describes the whole aggregate, while each rule lives under its own `## BR-...` heading with its own metadata table. This page walks through every part of that anatomy.

## File-level frontmatter

Every catalog file starts with a YAML frontmatter that describes the aggregate scope.

```yaml
---
bounded_contexts:
  - production-planning            # kebab-lowercase, in plural
  - iam                            # same; multiple BCs allowed for cross-BC rules
aggregates:
  - production-planning/production-order-header
  - production-planning/production-order-position-event
last_updated: 2026-05-02
keywords:
  - cancelación de evento          # bilingual on purpose
  - cancel event
  - cascada de revert
  - revert cascade
paths:
  - backend/src/@app/production-planning/production-order-header/**
  - frontend/src/app/modules/admin/apps/production-planning/production-order-header/**
---
```

| Field              | Type                | Purpose                                                                                                                        |
| ------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `bounded_contexts` | `string[]`          | Every BC the file's rules touch. Always plural — even for single-BC files. Drives the `byBoundedContext` lookup in the index.  |
| `aggregates`       | `string[]`          | Fully-qualified aggregate paths (`<bc>/<aggregate>`). Used by `/business-rules:document` to locate the owner file.             |
| `last_updated`     | `string` (ISO date) | Refreshed when a rule in the file changes. The audit uses it to detect stale `[VERIFICAR]` markers (older than 30 days).       |
| `keywords`         | `string[]`          | Bilingual hint tokens. The `UserPromptSubmit` hook scores prompts against this list to inject relevant rules into AI context.  |
| `paths`            | `string[]`          | Glob patterns of source paths that this file's rules govern. `pnpm br:check --branch` matches changed files against these.     |

All five are required. Casing is fixed: keys are `snake_case_lower` in the frontmatter, identifiers (the `BR-...` IDs in the body) are `UPPER-KEBAB-CASE`. The structural validator (`pnpm br:validate`) rejects anything that drifts from that shape.

## Identifier grammar

```
BR-<BOUNDED-CONTEXT>-<AGGREGATE>-<NNN>

  Examples:
    BR-IAM-USER-001
    BR-PROD-EVENT-005           (short-form BC)
    BR-PRODUCTION-HEADER-007    (long-form BC)
```

Three constraints make IDs stable currency across code, prose, commits, and PRs:

- **Uppercase, deliberately.** They stand out in every context — JSDoc comments, commit subjects, PR descriptions, support tickets.
- **Stable abbreviations.** A BC and an aggregate may use either their long name or a short form, but the chosen form is permanent for that aggregate. `BR-PROD-EVENT-*` and `BR-PRODUCTION-EVENT-*` can never coexist for the same aggregate.
- **Numbers never reuse.** When a rule is derogated, its `NNN` is permanently burned. The next rule gets the next number. This guarantees historical citations stay unambiguous: a code comment that cites `BR-PROD-EVENT-005` always resolves to the same rule, whether that rule is currently active or derogated.

The first rule a file ever gets establishes its prefix; subsequent rules in the file inherit it. When `/business-rules:promote` scaffolds a new rule, it infers the prefix from the file's existing rules; for empty files, the proposal must declare the prefix explicitly.

## Per-rule body

Each rule is a `## BR-...` section. The shape is the same for every rule, with optional sections that activate only when the rule needs them.

```markdown
## BR-PROD-HEADER-007 — Revert por borrado del último evento

| Campo      | Valor                                                |
| ---------- | ---------------------------------------------------- |
| Estado     | `active`                                             |
| Severidad  | `blocking`                                           |
| Origen     | openspec/changes/archive/2026-05-03-cancel-event/    |
| Trigger en | production-planning/production-order-position-event  |
| Efecto en  | production-planning/production-order-header          |

### Enunciado

Al borrar el último evento de una position, su header debe revertir a
`PENDING` salvo que existan otras positions activas en el mismo header.

### Diagrama de cascada

delete(event)
  │
  ▼
position.events.length === 0 ?
  │ sí
  ▼
header has other active positions ?
  │ no
  ▼
header.state = PENDING

### Casos exhaustivos

| #   | Evento previo | Header tiene otras positions | Resultado          |
| --- | ------------- | ---------------------------- | ------------------ |
| 1   | último        | no                           | revert a PENDING   |
| 2   | último        | sí                           | header sin cambios |
| 3   | no era último | n/a                          | position sin tocar |

### Implementa

- `backend/src/@app/production-planning/production-order-position-event/.../delete.handler.ts:42`
- `backend/src/@app/production-planning/production-order-header/.../revert-state.function.ts:11`

### Tests

- `backend/test/production-planning/.../revert-on-last-event-delete.spec.ts:'reverts when no siblings'`

### Reglas relacionadas

- **BR-PROD-EVENT-001** — No cancelar eventos DONE (precondición de este flujo)
```

The metadata table at the top, the `Enunciado`, the case table, and the `Implementa` list are the **required spine** of every rule. The rest activates by need: `Diagrama de cascada` for rules that propagate effects, `Tests` when there are linkable tests, `Reglas relacionadas` when other IDs participate. Everything else — labels, ordering of optional sections — stays uniform across the catalog so readers and tools never have to guess.

## State and severity

Every rule declares two orthogonal dimensions in its metadata table.

**State** is the lifecycle position of the rule.

| Value       | Meaning                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `active`    | Implemented in code and currently in force.                                                                                                |
| `derogated` | Retired or replaced. Its ID is permanently burned. The body remains so historical citations stay readable.                                 |
| `proposed`  | Documented but not yet implemented. The legitimate use case is product-↔-code gap — making an intended-but-unshipped rule auditable.       |

**Severity** is what happens if the rule is broken.

| Value           | Meaning                                                                                            |
| --------------- | -------------------------------------------------------------------------------------------------- |
| `blocking`      | Breaking it produces a system failure or incorrect domain behavior.                                |
| `informational` | A convention or guideline. Violations cause friction but nothing crashes.                          |

There is no intermediate "warning" level on purpose. Intermediate severities cause fatigue and produce inconsistent enforcement — the catalog opts for a clear binary instead.

## The case table is exhaustive

The case table under `### Casos exhaustivos` is the most discipline-heavy part of the format. It must cover the full Cartesian product of trigger conditions, not just the happy path. The point is that any future reader — human or AI — can answer "what happens when X and Y and Z?" by scanning rows, without re-deriving the logic from code.

When a row genuinely cannot be derived from the code or the tests, the case is marked inline:

```markdown
- **[VERIFICAR caso 4]**: si el cliente está suspendido durante la cascada, ¿revert o no?
- **[ASUNCIÓN]**: asumimos que los eventos en estado `DONE` no participan; verificar con producto.
```

The audit reports any marker that has been sitting unresolved for more than 30 days, so these become a visible work item rather than rotting forever.

## Cross-aggregate and cross-BC rules

A rule that affects more than one aggregate (a cascade) or more than one bounded context (an exception based on a user role) lives in **one file**: the file of the aggregate where the final invariant is observed. The frontmatter of that file declares every affected BC and aggregate (in plural). Other files involved carry **short pointers** — never duplicated content.

```markdown
# In cliter/production-planning/business-rules/production-order-position-event.md

## Cascadas que dispara este agregado

- `delete(event)` → ver **BR-PROD-HEADER-007** (revert cascade hacia header
  cuando se borra el último evento de su position).
```

This convention has two payoffs. Searching for an ID never lands on two slightly different versions, and the cross-BC index in `business-rules-index.json` (`byBoundedContext`) automatically picks up every BC declared in the owning file's frontmatter.

## `@rule` citations in code (optional)

A handler, function, or test can cite a rule in JSDoc or an equivalent comment:

```typescript
/**
 * Cancela un evento de producción.
 *
 * @rule BR-PROD-EVENT-001 — No cancelar eventos DONE
 * @see cliter/production-planning/business-rules/production-order-position-event.md
 */
async cancel(eventId: string): Promise<void> {
  ...
}
```

The validator (`pnpm br:validate:citations`) walks `backend/src/` and `frontend/src/` looking for `@rule BR-...` annotations and crosses them against the index. It reports two soft signals:

- **Orphaned citation** — the code cites an ID that does not exist in the catalog. Usually a typo or a rename that wasn't propagated.
- **Zombie rule** — an `active` rule that has had zero citations for more than 30 days. Either the rule has gone obsolete and should be derogated, or the code that implements it stopped naming it.

Neither blocks the build. Citations are a convenience for readers; the catalog stays authoritative on its own.

## Lifecycle: how a rule moves between states

A rule's lifecycle is intentionally narrow: it can only **be created** or **be derogated**. Modifying the semantics of a rule — changing the `Enunciado` or the meaning of a case — is structurally equivalent to derogating the old one and creating a new one with a fresh ID. The catalog does not support in-place semantic edits.

That distinction matters because IDs are stable references in code and commits. If `BR-PROD-EVENT-005` quietly changed meaning over time, every historical citation would silently shift its semantics. By forcing derogation + new rule, the catalog keeps each ID frozen to one meaning forever.

Edits that **do not** count as semantic changes (and are therefore allowed in place):

- Typo fixes, grammar, formatting.
- Re-wording the statement without altering its meaning.
- Fixing broken paths under `Implementa` or `Tests`.
- Refreshing `last_updated`.
- Resolving a `[VERIFICAR]` or `[ASUNCIÓN]` marker once the answer is confirmed.
- Adding rows to the case table that cover more space without contradicting what was covered.

The maintenance guide walks through the mechanics of derogation + creation in detail.

## Why every constraint exists

A subtle question is why the format is this specific. Three reasons drive most of the choices:

- **The catalog must survive AI context resets.** A future Claude Code session, with no memory of this conversation, must be able to find, cite, and reason about a rule. That requires stable IDs, machine-parseable frontmatter, and a body shape consistent enough to be summarized by a hook into a few thousand characters.
- **The catalog must survive team rotation.** A new developer reading `BR-PROD-EVENT-007` should learn what the rule says, where it's enforced, and what came before it. That requires the `Enunciado`, the case table, the `Implementa` list, and the `Reglas relacionadas` block.
- **The catalog must not become a wishlist.** Every constraint that forces post-implementation framing (state = `active` only after the code lands, `proposed` only for documented product-↔-code gaps, derogation never deletes) is there to keep the catalog tightly bound to what the code actually does.

For the moving parts that turn those constraints into actual automation — the scripts, the hooks, the slash commands, the skill, the CI workflow — see [System architecture](../business-rules-architecture/).
