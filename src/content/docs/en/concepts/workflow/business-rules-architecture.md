---
title: "Business rules system architecture"
description: "The fourteen technical pieces that make the catalog work — Markdown files, the consolidated index, validation scripts, slash commands, the Claude Code skill, hooks, pre-commit, CI, and the OpenSpec extension — and how they relate to each other."
---

The catalog of business rules is supported by a small constellation of files, scripts, hooks, and commands. None of them is heavy on its own; what makes the system feel solid is the way they compose. This page walks through every piece and then traces how the pieces fit together in the day-to-day flow.

## The composition at a glance

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       INPUTS — humans and AI                             │
├──────────────────────────────────────────────────────────────────────────┤
│  Developer/AI edits .md   ─┐                                             │
│  /opsx:propose             ├──►  cliter/<bc>/business-rules/<agg>.md     │
│  /business-rules:document ─┘                                             │
└────────────────────┬─────────────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                STRUCTURAL PROCESSING — scripts + Ajv                     │
├──────────────────────────────────────────────────────────────────────────┤
│   parse-catalog.ts ──►  ParsedRule[]                                     │
│   generate-index.ts ──► cliter/business-rules-index.json (for tooling)   │
│                    └──► docs/business-rules/INDEX.md       (for humans)  │
│   validate-catalog.ts ─► Ajv check + unique IDs + valid metadata         │
│   validate-citations.ts ► @rule in code vs index                         │
└────────────────────┬─────────────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            CONSUMERS                                     │
├──────────────────────────────────────────────────────────────────────────┤
│  Humans       ─► INDEX.md, ad-hoc reading of the .md                     │
│  AI (Claude)  ─► UserPromptSubmit hook injects relevant rules            │
│                  openspec/config.yaml injects awareness in /opsx:propose │
│  Pre-commit   ─► husky regenerates the index + validates on each commit  │
│  CI           ─► business-rules-check.yml validates each PR              │
│  Audit        ─► audit.ts (structural) + Claude continues (semantic)     │
└──────────────────────────────────────────────────────────────────────────┘
```

The next sections describe each component in turn. Group them by role to keep them straight:

- **Storage** — the `.md` files, the schema, the JSON index, the human index.
- **Tooling** — the nine TypeScript scripts and the `pnpm br:*` aliases that wrap them.
- **Claude Code surface** — the four slash commands, the `business-rules-guard` skill, and the two hooks.
- **Integration** — the pre-commit hook, the CI workflow, the OpenSpec extension, and the entry in `CLAUDE.md`.

## Storage

### 1. The catalog `.md` files

Location: `cliter/<bounded-context>/business-rules/<aggregate>.md`. One file per aggregate, sitting next to the same aggregate's `*.aurora.yaml` and `CONTEXT.md`. The cohesion with the YAML is deliberate — everything that describes the domain lives under `cliter/`, including its invariants.

Each file holds a file-level frontmatter and one `## BR-...` section per rule. The detailed format is documented in [Anatomy of a business rule](../business-rule-anatomy/).

The path is fixed by convention: rules cannot live under `openspec/`, `docs/business-rules/<bc>/`, or `backend/`. The audit detects misplaced files and reports them.

### 2. The JSON Schema (`_schema.json`)

Location: `docs/business-rules/_schema.json`. A JSON Schema draft-07 that describes the **file-level frontmatter** only: required fields, array-vs-string typing, the ISO date constraint on `last_updated`.

It does **not** validate the per-rule metadata table (state, severity, origin). That validation lives in code (`validate-catalog.ts`) because the legal enum values are simpler to encode and evolve as TypeScript sets than as JSON Schema enums.

The schema is loaded with Ajv (`+ ajv-formats` for the date check) and applied to each file's frontmatter. A schema violation aborts `pnpm br:validate` with exit `1` and a precise pointer to the offending file and field.

### 3. The consolidated index (`business-rules-index.json`)

Location: `cliter/business-rules-index.json`. Generated, never edited by hand. It is the **single point of truth** for any tool that needs to reason about rules without parsing prose.

```jsonc
{
  "generatedAt": "2026-05-03T08:32:09.043Z",
  "totalRules": 5, "activeRules": 4, "derogatedRules": 0, "proposedRules": 1,
  "byId": {
    "BR-PROD-HEADER-001": { "id": ..., "title": ..., "filePath": ...,
                            "bounded_contexts": [...], "aggregates": [...],
                            "paths": [...], "keywords": [...],
                            "state": "active", "severity": "blocking",
                            "last_updated": "2026-05-03" },
    ...
  },
  "byBoundedContext": { "production-planning": ["BR-PROD-HEADER-001", ...] },
  "byAggregate": { ... },
  "byKeyword":   { ... },
  "byPath":      [ { "pattern": "backend/src/...", "ruleIds": [...] }, ... ]
}
```

Five consumers depend on it: `audit.ts` (health + drift), `check.ts` (all four modes), `promote.ts` (to locate rules being derogated), `validate-citations.ts` (to cross `@rule` IDs), and the `inject-rules-context.ts` hook (to score relevance against a prompt).

The keys are in English on purpose. The JSON is a structural artifact consumed by tooling; the bilingual mix only applies to rule content, never to formatting keys.

### 4. The human index (`docs/business-rules/INDEX.md`)

Location: `docs/business-rules/INDEX.md`. Generated by the same script that produces the JSON index, in the same pass. A flat table with every rule (ID, title, BCs, aggregates, state, severity, last_updated, link) ordered by ID. It's the fastest way for a human to get a global view without opening dozens of files.

Like the JSON index, it is overwritten on every regeneration. Manual edits are lost.

## Tooling

### 5. The nine TypeScript scripts (`scripts/business-rules/`)

| Script                   | Responsibility                                                                                                                            | Invoked by                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `types.ts`               | Shared interfaces (`ParsedRule`, `IndexedRule`, `CatalogIndex`).                                                                          | Every other script.                                                         |
| `parse-catalog.ts`       | Walks the catalog, parses frontmatter with `gray-matter` and the body with regex over `## <ID>` headings + metadata tables.               | Every other script.                                                         |
| `generate-index.ts`      | Builds `business-rules-index.json` + `INDEX.md`. Fails on duplicate IDs or invalid frontmatter.                                           | `pnpm br:generate`, pre-commit, CI.                                          |
| `validate-catalog.ts`    | Validates frontmatter against `_schema.json` (Ajv), unique IDs, legal `Estado`/`Severidad` values, optional path existence under `Implementa`. | `pnpm br:validate`, CI.                                                  |
| `validate-citations.ts`  | Walks `backend/src/` and `frontend/src/` looking for `@rule BR-...`. Reports orphans and zombies.                                          | `pnpm br:validate:citations`, audit step.                                    |
| `audit.ts`               | Structural report in four sections (Health, Drift, Assumptions, Cross-BC pointers). Outputs human or `--json`.                            | `/business-rules:audit` step 1. Not exposed as `pnpm br:*` (see below).      |
| `promote.ts`             | Reads an archived `proposal.md`, parses `## Business rules affected`, applies actions (mantiene/deroga/extiende/Nuevas), regenerates the index. Supports `--dry-run`. | `/business-rules:promote` step 1.                                            |
| `document.ts`            | Retroactive bootstrap. Validates the aggregate, lists relevant sources, creates a frontmatter-only scaffold. Does **not** generate rules autonomously — that's the LLM's part in step 2. | `/business-rules:document` step 1.                                          |
| `check.ts`               | Targeted validation in four modes: by aggregate, by rule, by branch / PR (`gh` + git diff), by working tree.                              | `pnpm br:check`.                                                             |

Stack: `gray-matter` (frontmatter), `ajv` + `ajv-formats` (schema validation), `fast-glob` (file walking), `tsx` (run TS without compilation). All in the root `package.json` `devDependencies`.

### 6. The `pnpm br:*` commands

Wrappers declared in the root `package.json`. The `br:` prefix marks them apart from the rest of the repo's scripts (`back:*`, `front:*`, `dev`).

```json
"br:generate":          "tsx scripts/business-rules/generate-index.ts",
"br:validate":          "tsx scripts/business-rules/validate-catalog.ts",
"br:validate:citations":"tsx scripts/business-rules/validate-citations.ts",
"br:check":             "tsx scripts/business-rules/check.ts"
```

**Asymmetry on purpose — what is exposed and what is not.** `audit.ts`, `promote.ts`, and `document.ts` are **not exposed** as `pnpm br:*`. They follow the **script + LLM continuation** pattern: the script does the deterministic work, and Claude continues the same session to fill in the parts that need reasoning (the semantic E section of the audit, the body of newly-scaffolded rules in promote, the proposal of implicit rules in document). Exposing them as `pnpm` aliases would offer a partial output under the same name as the full one, which is the wrong default for the developer. They are invoked exclusively via slash commands; for tooling or debugging, the scripts can still be called directly with `npx tsx scripts/business-rules/<script>.ts`.

The `pnpm br:*` set therefore mirrors exactly what a developer types from the shell: regenerate the index, validate, validate citations, run a targeted check. Nothing more.

## Claude Code surface

### 7. The four slash commands

Files under `.claude/commands/business-rules/`. The subfolder name turns into the `:`-namespaced prefix: `business-rules/promote.md` becomes `/business-rules:promote`.

| Command                                 | What it does                                                                                                                                                                |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/business-rules:promote [<archive>]`   | Crystallizes the actions declared in an archived OpenSpec proposal: applies derogations, scaffolds new rules, then continues the session to fill in the rule bodies.        |
| `/business-rules:document <bc>/<agg>`   | Retroactive bootstrap for an aggregate with no catalog file yet. Reads YAML + `CONTEXT.md` + code + tests, proposes candidate rules, writes them after user confirmation.   |
| `/business-rules:audit [<bc>]`          | Structural report (health, drift, assumptions, cross-BC pointers) followed by a pairwise semantic analysis written by Claude in the same session.                            |
| `/business-rules:check [<args>]`        | The Claude-Code-facing wrapper of `pnpm br:check`. Useful when the developer is already in a Claude Code session and wants the output rendered in the conversation.         |

The `.md` files themselves are documentation for Claude, not executable code. They describe what to ask the user, when to run the underlying script, and how to continue the session.

### 8. The skill `business-rules-guard`

Location: `.claude/skills/business-rules-guard/`. **Not invoked by any slash command.** Claude auto-loads it when the conversation touches any of the triggers declared in the skill's frontmatter `auto_invoke`:

- Mention of "business rules" or "reglas de negocio" in any language.
- Explicit citations like `BR-PROD-EVENT-005`.
- Invocations of `/business-rules:*`.
- Edits to files under `cliter/<bc>/business-rules/`.
- The user is about to touch code of an aggregate that has active rules (looked up via the index by path or aggregate).

The skill contains the **system manual**: the ten anti-patterns to avoid, the three workflow entry points, the inviolable conventions, and links to three references files (`format.md`, `workflow.md`, `audit.md`) that Claude can drill into when it needs specific guidance.

The distinction with slash commands matters. A slash command is a delimited action that the user triggers explicitly. The skill is **continuous guidance** that informs every Claude action related to the system — even when no command is invoked. They complement each other; neither replaces the other.

### 9. The two Claude Code hooks

**`SessionStart` — `generate-skills-index.ts`.** Not specific to business rules; pre-existed in the project. When the skill and the slash commands were added, this hook updated the root `CLAUDE.md` skills index so Claude would see them. Runs at the start of every Claude Code session.

**`UserPromptSubmit` — `inject-rules-context.ts`.** Specific to business rules. Runs before every prompt the user submits:

1. Reads the prompt from the JSON Claude Code passes via stdin.
2. Locates the repo root (looks for `package.json` with `name: aurora`).
3. Loads `cliter/business-rules-index.json`. If absent, the hook exits silently.
4. For each active or proposed rule, computes a **relevance score**: explicit ID mention `+50`, aggregate name `+10`, BC name `+5`, keyword (lowercase, length ≥ 4) `+3`.
5. If any rule has score > 0, sorts and takes the **top 3**.
6. Reads the body of each, truncates to 4000 chars per rule, and writes a formatted section to stdout. Claude sees it as added context next to the user prompt.

This is **soft enforcement**. Injection of context does not bind Claude to anything; it is a nudge. If Claude ignores it, the on-demand audit still catches drift afterward. Failsafe: any error (missing index, parse failure, package not found) makes the hook exit silently — it never blocks a prompt.

## Integration

### 10. The pre-commit hook (Husky)

Location: `.husky/pre-commit`. Detects staged changes in `cliter/<bc>/business-rules/*.md` and, if any are present, runs two steps in order:

1. `pnpm br:generate` — regenerates the index (`business-rules-index.json` + `INDEX.md`) and stages it in the same commit. Aborts if it fails (broken frontmatter, duplicate IDs, parsing error).
2. `pnpm br:validate` — validates the catalog against `_schema.json` and the metadata sets. Aborts on structural errors (exit code `1`); permits commit on warnings only (exit code `2`, e.g. paths under `Implementa` that don't exist).

The hook guarantees two invariants on every commit: the committed index always matches the committed `.md` files, and the catalog always passes the same structural checks that CI will re-run on the PR.

### 11. The CI workflow `business-rules-check.yml`

Location: `.github/workflows/business-rules-check.yml`. Triggers on push to `main` and on pull requests that touch `cliter/**/business-rules/**`, `cliter/business-rules-index.json`, `docs/business-rules/**`, `scripts/business-rules/**`, or the workflow itself.

Steps:

1. Setup pnpm + Node 24, `pnpm install --frozen-lockfile`.
2. `pnpm br:validate` — fails on structural errors.
3. `pnpm br:generate` followed by `git diff --quiet` against `business-rules-index.json` and `INDEX.md` — fails if the committed index drifted from the regenerated one (in theory the pre-commit hook prevents this, but CI is the belt-and-braces).
4. `pnpm br:validate:citations || true` — advisory, never blocks.

The CI is **structural only** by design. Semantic contradictions are caught preventively in `/opsx:propose` and on-demand via `/business-rules:audit`; trying to enforce them in CI would either be unreliable (cheap heuristics produce false positives) or expensive (calling an LLM from CI requires API keys, prompts maintained outside the repo, GitHub App permissions — for a piloting catalog, the cost outweighs the value).

### 12. Semantic tension detection (script + LLM continuation)

There is **no automated cron, routine, or GitHub App** for detecting latent contradictions between rules. Coverage is split into two planes that share infrastructure:

- **Preventive — in `/opsx:propose`.** The `openspec/config.yaml` extension instructs Claude to load the relevant rules of candidate BCs and check the proposal against them before it gets archived. This is the main net.
- **On-demand — in `/business-rules:audit`.** Step 1 runs `audit.ts` for the structural report; step 2 has Claude continue the same session, pair up rules sharing BCs/aggregates/keywords, and classify each pair as `contradiction | extension | orthogonal | needs-review` with a confidence value and a short Spanish explanation.

This design keeps the system free of external infrastructure (no SDK, no API key, no scheduled job, no GitHub App). The tradeoff is that semantic checks are not continuous — they run when a human is in the loop. For a catalog under ~150 rules, that tradeoff is well-balanced; past that point the audit warnings recommend re-evaluating.

### 13. OpenSpec integration (`openspec/config.yaml`)

The **only** file under `openspec/` the system modifies. Everything else under `openspec/` is managed by the OpenSpec CLI itself — touching it would risk being overwritten by `openspec update`.

`config.yaml` carries:

- A `context` block (~3.1 KB) that the AI receives when generating proposal, design, spec, or task artifacts. It covers the catalog location, the 7-step conflict detection procedure, the bilingual conventions, the post-implementation lifecycle, and optional `@rule` citations.
- A `rules` block with six rules for `proposal`, two for `design`, two for `specs`, and two for `tasks`. They mandate the `## Business rules affected` section in the proposal, force a halt on detected conflicts, request rule citations in non-trivial changes, and require the final task list to include `/business-rules:promote` when applicable.

If OpenSpec ever gets removed from the project, the rest of the business-rules system keeps working. Only the automatic awareness at proposal time goes away; document, promote-over-existing-archives, audit, and check are all independent.

### 14. The root `CLAUDE.md` entry

A new section "Business rules" before the "Skills" section, plus a row in the skill auto-invoke table, plus an entry in the auto-generated skills index (between `<!-- SKILLS-INDEX-START -->` and `<!-- SKILLS-INDEX-END -->`).

`CLAUDE.md` loads at the start of every Claude Code session, so it is the first line of defense against Claude inventing alternative conventions or "harmonizing" the bilingual mix. The section is short on purpose — it points at the slash commands, the skill, and the docs site — but it is what every new session sees first.

## How the pieces fit in a normal flow

The cleanest way to see the architecture in motion is to walk a single change through it end to end.

**1. Authoring.** A developer runs `/opsx:propose` for a change in `production-planning`. The OpenSpec config extension nudges Claude to consult the catalog. Claude loads `business-rules-index.json`, picks the relevant rules by BC and keyword, and asks itself whether the proposal contradicts any of them. If a contradiction is found, the proposal halts with options (derogate / coexist / no real conflict). The resolution is written into the `## Business rules affected` section of `proposal.md`.

**2. Implementation.** `/opsx:apply` writes the code. The hooks that affect the business-rules system stay quiet — no rule has changed yet, only the code.

**3. Archive.** `/opsx:archive` moves the change to `openspec/changes/archive/`. The catalog is still untouched.

**4. Promote.** `/business-rules:promote` reads the archived `proposal.md`, parses `## Business rules affected`, and runs `promote.ts`: derogations are applied to the affected `.md` files, scaffolds are created for new rules with the next sequential ID under `state: proposed` and `[VERIFICAR]` placeholders, and `business-rules-index.json` is regenerated. Claude then continues the same session — reading proposal, design, spec, code, and tests — and fills in each new rule's body with the real `Enunciado`, `Casos exhaustivos`, `Implementa`, and `Tests`. When the developer confirms, Claude switches `state: proposed` to `active`.

**5. Commit.** When the developer commits the catalog changes, the pre-commit hook detects staged `.md` files and runs `br:generate` + `br:validate`. If anything is wrong (a duplicate ID, an illegal `Estado` value, a frontmatter typo), the commit aborts with a precise pointer. The regenerated index is staged into the same commit.

**6. CI.** The PR triggers `business-rules-check.yml`, which re-runs the validator, regenerates the index, and verifies the committed index is in sync. Citations validation runs advisory.

**7. Consumption.** Once the change is merged, the rule is live in the catalog. The next developer that opens a Claude Code session and asks anything that hits the relevant keywords gets the rule injected into context by `UserPromptSubmit`. Support cites the new `BR-...` in its tickets. A later proposal that touches the same area finds it via the OpenSpec extension.

Step 4 is where most of the architecture pays its rent: a single command coordinates a deterministic script, an LLM continuation, and a regenerated index, with the developer's confirmation at the only point that genuinely needs judgment.

## Where the source of truth lives

This page is a tour. The normative documentation lives in the Aurora Catalyst repo itself, at:

- `docs/business-rules/README.md` — operational guide (workflows, commands, conventions).
- `docs/business-rules/ARCHITECTURE.md` — exhaustive technical reference for every component.
- `docs/business-rules/MIGRATION.md` — porting the system to another repo.
- `.claude/skills/business-rules-guard/SKILL.md` and its `references/` files — the live system manual that Claude reads.

When in doubt, the catalyst repo wins. The pages on this site distill the system for catalyst users; the repo is the source of truth.
