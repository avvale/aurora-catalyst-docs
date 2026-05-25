---
title: "Maintain the business-rules catalog"
description: "Day-to-day operations on the catalog — the three authoring workflows, the commands you run from the shell, what the pre-commit hook does for you, and how to derogate or audit rules when the time comes."
---

This is the operational guide for the business-rules catalog. Read [Business rules system](../../../concepts/workflow/business-rules-overview/) first if you have not — this page assumes you know what a rule is and where it lives.

## Pick a workflow

Every change to the catalog goes through exactly one of three workflows. Choose by the **origin of the change**, not by the size:

- **A — via OpenSpec.** The change is going through `/opsx:propose → /opsx:apply → /opsx:archive`. Almost everything that touches the domain belongs here.
- **B — retroactive bootstrap.** An aggregate has no catalog file yet, and you want to extract its implicit rules from existing code, tests, or a product Word document. One-off per aggregate.
- **C — direct edit.** Typos, broken paths, derogation of an obsolete rule outside OpenSpec, resolution of `[VERIFICAR]` markers.

Workflows do not mix. Pick one and stay in it.

## Workflow A — via OpenSpec

This is the canonical path. Six steps, the last of which is the only one specific to business rules.

1. **`/opsx:propose <description>`.** Claude generates the proposal artifacts. The `openspec/config.yaml` extension instructs it to consult the catalog, detect conflicts with existing rules, and write a `## Business rules affected` section in `proposal.md` declaring the rule actions (`mantiene` / `deroga` / `extiende` / `Nuevas`).
2. **Resolve conflicts.** If Claude detected a conflict, it pauses and asks for a decision: derogate the prior rule (a), keep both with a new exception (b), or no real conflict — justify (c). The choice is recorded in the proposal.
3. **`/opsx:apply`.** Claude implements the change. The catalog stays untouched at this stage.
4. **`/opsx:archive <name>`.** The change moves to `openspec/changes/archive/`.
5. **`/business-rules:promote [<archive-name>]`.** This is where the catalog gets updated. The command runs in two halves in the same session.
   - First, the script applies the deterministic actions: derogations get `state: derogated` + a derogation note, new rules get a scaffold with the next sequential ID under `state: proposed` and `[VERIFICAR]` placeholders, and the index is regenerated.
   - Then Claude reads the proposal, the design, the specs, the code, and the tests, and writes the real body of every new rule — `Enunciado`, exhaustive case table, `Implementa`, `Tests`. After your confirmation it switches `state: proposed` to `active`.
6. **Commit.** The pre-commit hook regenerates the index and validates the catalog. The commit lands.

The form of the proposal's `## Business rules affected` section matters. Claude writes it for you in step 1; if you have to edit it by hand, the shape is:

```markdown
## Business rules affected

### Existentes

- mantiene BR-PROD-EVENT-005 — reference, no changes.
- deroga BR-PROD-EVENT-003 — short reason.
- extiende BR-PROD-HEADER-001 — relationship; the script does not touch the .md, just a reminder to update "Reglas relacionadas" by hand.

### Nuevas

- en `production-planning/production-order-position-event` — short title.
- BR-PROD-EVENT en `production-planning/production-order-position-event` — short title.
  (the form with an explicit prefix is only needed when the target file has no prior rules)
```

If the change does not touch the catalog, write `None` under the section. Skipping the section is rejected by the OpenSpec extension.

## Workflow B — retroactive bootstrap

For aggregates that have no catalog file yet. The system encourages **lazy bootstrap** — only create the file when there is real motivation (a bug that uncovered an undocumented rule, a Word document to import, a new bounded context being onboarded). Documenting every aggregate up front is an explicit anti-pattern.

```text
/business-rules:document <bc>/<aggregate>
```

The flow:

1. The script validates that the aggregate exists, lists the source files Claude should consult (YAML, `CONTEXT.md`, handlers, tests), and creates a scaffold file with just the frontmatter.
2. Claude reads the listed sources in an interactive session, identifies implicit rules, and proposes them one by one. For each candidate, you confirm or adjust before Claude writes it.
3. Claude writes the confirmed rules with full body. Mark `[VERIFICAR]` on **the specific cells** of the case table that you cannot derive from the code, not on the whole rule.
4. `pnpm br:generate && pnpm br:validate` (or let the pre-commit hook do it). Commit.

Default state for new rules in this workflow is `active` — the code already implements them. The single legitimate exception is the product-↔-code gap: a rule that product has decided but the code does not enforce yet. Mark it `proposed` and the audit will list it as auditable intent.

To import a product Word document already converted to Markdown:

```text
/business-rules:document iam/role --from docs/word-export/roles.md
```

Claude uses the Markdown as the source of candidate rules instead of (or in addition to) the code.

## Workflow C — direct edit

For ad-hoc fixes outside an OpenSpec change.

### Create a new rule

1. Open the target `.md` and append a new `## BR-<ID>` section, where `<ID>` is the next sequential number for the file's prefix (do not reuse derogated IDs).
2. Fill in the metadata table, `Enunciado`, exhaustive case table, and `Implementa` (the required spine — see [Anatomy of a business rule](../../../concepts/workflow/business-rule-anatomy/)).
3. Mark `[VERIFICAR]` or `[ASUNCIÓN]` only on cells you actually have doubts about.
4. `pnpm br:generate && pnpm br:validate` (or let the pre-commit hook do it).

### Derogate a rule

Rules are never edited in their semantics. To retire or replace one:

1. Find the rule: `pnpm br:check BR-PROD-EVENT-005`.
2. In its `.md`, change the metadata table:

   ```diff
   | Campo       | Valor                                |
   | ----------- | ------------------------------------ |
   - | Estado      | `active`                             |
   + | Estado      | `derogated`                          |
   | Severidad   | `blocking`                           |
   - | Origen      | retro-documentada                    |
   + | Origen      | retro-documentada (derogada por BR-PROD-EVENT-007) |
   ```

3. Append a `### Derogación` section at the end of the rule body:

   ```markdown
   ### Derogación

   Derogada el 2026-06-15 por **BR-PROD-EVENT-007**. Razón breve: <motivo>.
   ```

4. If there is a replacement rule, create it under a fresh ID (the derogated one is never reused). Cross-reference in the replacement's `Reglas relacionadas`:

   ```markdown
   - **BR-PROD-EVENT-005** (derogada por esta regla)
   ```

5. `pnpm br:generate && pnpm br:validate`.

The derogated rule body stays in the file forever so historical citations in code, commits, and tickets stay readable. The catalog grows monotonically — derogation never deletes.

### Modify a rule (= derogate + create)

Modifying the semantics of a rule is structurally a derogation + a new rule. Follow the two procedures above in order.

Edits that **do not** count as semantic changes and are allowed in place:

- Typo and grammar fixes.
- Re-wording without altering meaning.
- Fixing broken paths under `Implementa` or `Tests`.
- Refreshing `last_updated`.
- Resolving a `[VERIFICAR]` or `[ASUNCIÓN]` once confirmed.
- Adding rows to the case table that cover more space without contradicting what was covered.

## The shell commands

Four commands cover the day-to-day. The first two are the ones you actually run by hand the most.

### `pnpm br:generate`

Regenerates `cliter/business-rules-index.json` and `docs/business-rules/INDEX.md`. Idempotent — running it twice with no changes produces the same output.

```bash
pnpm br:generate
# → ✓ Index regenerated: 5 rules (4 active, 0 derogated, 1 proposed) across 3 files.
```

You normally do not need to run it by hand; the pre-commit hook does it automatically when it detects staged changes under `cliter/<bc>/business-rules/*.md`. Run it manually after editing a rule and before opening Claude Code if you want the hook (`inject-rules-context.ts`) to see the latest version immediately.

### `pnpm br:validate`

Structural validator. Fails with exit code `1` on errors that abort the commit (invalid frontmatter, duplicate IDs, illegal `Estado`/`Severidad`); exits `2` on warnings that do not block (paths in `Implementa` that do not exist on disk).

```bash
pnpm br:validate
# → Summary: 3 files analyzed, 0 errors, 0 warnings.
# → ✓ Catalog valid.
```

Re-run after every catalog edit. The pre-commit hook chains it after `br:generate`.

### `pnpm br:validate:citations`

Walks `backend/src/` and `frontend/src/` looking for `@rule BR-...` annotations and crosses them with the catalog. Reports orphans (citations to IDs that do not exist) and zombies (active rules with zero citations for more than 30 days). Advisory — never blocks the commit or the PR.

```bash
pnpm br:validate:citations
# → Citations found: 3
# → Rules with at least one citation: 2
# → ⚠ Orphan citations (1):
# →   - BR-INVENT-XXX-001 in backend/src/.../foo.ts:42
```

Worth running occasionally as part of housekeeping.

### `pnpm br:check [args]`

Targeted validation. Four modes depending on the argument:

```bash
# Mode 1 — by aggregate (lists the aggregate's rules):
pnpm br:check production-planning/production-order-position-event

# Mode 2 — by rule (full detail of one rule):
pnpm br:check BR-PROD-HEADER-001

# Mode 3a — by branch (diff vs main):
pnpm br:check --branch feature/cancel-event

# Mode 3b — by GitHub PR (via gh CLI):
pnpm br:check --pr 123

# Mode 4 — by working tree (uncommitted files):
pnpm br:check
```

Modes 3 and 4 are particularly useful for code review — they list the rules whose `paths` glob matches any changed file in the diff, so you can quickly see which rules a PR is implicitly stepping on.

## The slash commands

Four commands live exclusively in Claude Code. They follow the **script + LLM continuation** pattern: a deterministic script writes the scaffolding, and Claude continues the same session to fill in the parts that need reasoning. None of them is exposed as `pnpm br:*` (see [System architecture](../../../concepts/workflow/business-rules-architecture/) for the rationale).

| Command                                 | When to invoke                                                                                            |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `/business-rules:promote [<archive>]`   | After every `/opsx:archive` whose proposal declared a `## Business rules affected` section.               |
| `/business-rules:document <bc>/<agg>`   | Once per aggregate, when bootstrapping retroactively (workflow B).                                        |
| `/business-rules:audit [<bc>]`          | Monthly housekeeping or before a major release. Run with no argument for the full catalog; pass a BC to limit the pairwise semantic sweep to that BC. |
| `/business-rules:check [<args>]`        | When you want the output of `pnpm br:check` rendered inside the Claude Code conversation.                 |

Each command is documented in its own `.md` under `.claude/commands/business-rules/` in the catalyst repo. Claude reads the documentation file and decides how to drive the underlying script.

## What the pre-commit hook does for you

You do not have to think about regeneration during normal work — the pre-commit hook handles it. It triggers whenever the commit has staged changes under `cliter/<bc>/business-rules/*.md`, and runs two steps in order:

1. `pnpm br:generate` — regenerates and re-stages the index. Aborts the commit on parse failures.
2. `pnpm br:validate` — validates the catalog. Aborts the commit on structural errors (exit `1`); permits commit on warnings (exit `2`).

The practical consequence: every commit that touches the catalog ships with an up-to-date index, and every commit that ships has the same baseline of validity that CI re-checks on the PR.

If the hook aborts your commit, the error message tells you exactly which file and field is wrong. Fix it and re-commit; don't `--no-verify`.

## When to audit

The audit is not part of every commit. It is a periodic activity, run by a human inside Claude Code, that combines a structural report with an LLM-driven pairwise semantic analysis. Run it:

- **Monthly**, as a maintenance habit, to clear `[VERIFICAR]` markers older than 30 days and resolve zombie rules.
- **Before a major release**, to confirm no contradiction slipped through.
- **When the catalog grows past 150 active rules**, every two weeks, to catch latent tensions before the catalog gets unwieldy.

```text
/business-rules:audit                       # full catalog
/business-rules:audit production-planning   # narrow the pairwise sweep to a BC
```

The structural report is deterministic. The semantic section reports tensions as `contradiction | extension | orthogonal | needs-review` with a confidence score and a short Spanish explanation. Treat the report as a worklist, not a verdict — each tension flagged is a candidate for review, not a guaranteed problem.

## When to ask for help

The skill `business-rules-guard` auto-loads when Claude detects you are touching the system. If you find yourself stuck on:

- The exact format of a rule (frontmatter, body, sections) → ask Claude to apply the `format` reference of the skill.
- A workflow decision (do I derogate, or is this a non-semantic edit?) → ask Claude to apply the `workflow` reference.
- An audit finding you do not understand → ask Claude to apply the `audit` reference.

The references files are mirrored as `.claude/skills/business-rules-guard/references/` in the catalyst repo. They are the live system manual; this guide is the catalyst-user-facing distillation.
