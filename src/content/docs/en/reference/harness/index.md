---
title: Harness reference
description: Complete catalogue of the Aurora Catalyst AI harness — every hook, rule, script, skill, command, agent and plugin, with its layer, its trigger moment and whether it ships with catalyst new.
---

Every piece of the harness, catalogued. For the reasoning behind the structure, start at [the AI harness](../../concepts/harness/); for the ordering of events, see [lifecycle](../../concepts/harness/lifecycle/).

Each family opens by stating two things that apply to every entry under it:

- its **layer** — `deterministic` (the harness executes it), `contextual` (the harness loads it) or `judgement` (the model applies it);
- whether it **ships**, meaning whether `catalyst new` puts it in your project. Everything ships except the plugin installations.

## Lifecycle trigger points

The five moments declared in `.claude/settings.json`.

### SessionStart

Fires once when a session starts. Two entries, distinguished by matcher.

| Matcher | Order | Command | Timeout |
| --- | --- | --- | --- |
| `startup` | 1 | `generate-skills-index.ts` | 30 s |
| `startup` | 2 | `daily-tip.sh` | 5 s |
| `startup` | 3 | `catalyst-dev-mode.sh` | 5 s |
| `startup` | 4 | `check-required-plugins.ts` | 15 s |
| `startup\|clear` | 5 | wipe of `.claude/.cache/` | 5 s |

Cannot block.

### InstructionsLoaded

Fires once per instruction file loaded, carrying a `load_reason`: `session_start`, `nested_traversal`, `path_glob_match`, `include` or `compact`.

| Command | Timeout | Notes |
| --- | --- | --- |
| `instructions-loaded-log.ts` | 10 s | notification-only; output and exit code are ignored |

Cannot block and cannot inject context.

### UserPromptSubmit

Fires on every prompt submitted.

| Command | Timeout | Notes |
| --- | --- | --- |
| `inject-rules-context.ts` | 15 s | anything on standard output is injected ahead of the prompt |

Can block.

### PreToolUse

Fires before a matching tool call executes.

| Matcher | Command | Timeout | Authority |
| --- | --- | --- | --- |
| `Write` | `architecture-checkpoint.ts` | 15 s | nudge — blocks once per path, then steps aside |
| `Write\|Edit\|MultiEdit` | `harness-rules-content-guard.ts` | 15 s | block |

### PostToolUse

Fires after a matching tool call completes.

| Matcher | Command | Timeout | Authority |
| --- | --- | --- | --- |
| `Write\|Edit\|MultiEdit` | `format-with-prettier.ts` | 30 s | advisory |
| `Write\|Edit\|MultiEdit` | `lint-barrels.ts` | 30 s | block on one rule, informational on the other |

## Hooks

Seven hooks, all in `.claude/hooks/`, all `deterministic`, all shipped. Every one of them degrades to doing nothing when it fails on its own, so no failure of theirs can degrade a session.

| Hook | Trigger point | Authority | What it does |
| --- | --- | --- | --- |
| `generate-skills-index.ts` | `SessionStart` | advisory | rewrites the `[Project Skills Index]` block inside every `CLAUDE.md` from what is on disk |
| `check-required-plugins.ts` | `SessionStart` | advisory | checks the required plugins are installed and enabled, reading merged runtime state rather than settings files |
| `instructions-loaded-log.ts` | `InstructionsLoaded` | none | appends one line per loaded instruction file to `.claude/.cache/instructions-loaded.log` |
| `inject-rules-context.ts` | `UserPromptSubmit` | advisory | injects up to 3 business rules and up to 3 harness rules matching the prompt, 4 000 characters of body each, on separate budgets |
| `architecture-checkpoint.ts` | `PreToolUse` (`Write`) | nudge | surfaces path classification, the governing project-structure skill and applicable rules when a new architectural file is created |
| `harness-rules-content-guard.ts` | `PreToolUse` | block | blocks a write whose content matches an active rule's detection pattern inside that rule's governed paths |
| `lint-barrels.ts` | `PostToolUse` | mixed | lints barrel imports on the file just written; one rule blocks, the other informs |

### Blind spots of the write-time guard

`harness-rules-content-guard` sees only the assistant's edit tools and only the incoming text. Content written through a shell command, or an existing violation relocated into a governed path, passes unseen. The exhaustive check over the working tree is the backstop.

## Rules

Nine files in `.claude/rules/`, all `contextual`, all shipped. Each declares `paths:` globs in its frontmatter and loads when a matching file is read — with a `load_reason` of `path_glob_match`.

Two families:

**Scope rules** route to the conventions of a whole workspace.

| Rule | Governs |
| --- | --- |
| `scope-backend.md` | `backend/src/**`, `backend/test/**` |
| `scope-frontend.md` | `frontend/src/**`, `frontend/libs/**` |
| `scope-cli.md` | `packages/cli/**` |

**Route rules** route to the skill that covers one kind of file.

| Rule | Governs |
| --- | --- |
| `route-aurora-components.md` | `frontend/src/@aurora/components/**` |
| `route-aurora-yaml.md` | `cliter/**/*.aurora.yaml` |
| `route-backend-test.md` | `backend/**/*.spec.ts`, `backend/**/*.e2e-spec.ts` |
| `route-drizzle-schema.md` | `backend/**/*.schema.ts`, the migrations tree, the Drizzle config and the drift-check workflow |
| `route-eta.md` | `**/*.eta` |
| `route-skill-md.md` | `**/.claude/skills/*/SKILL.md`, `.claude/skills/REGISTRY.md` |

Scope rules route instead of duplicating because a scoped `CLAUDE.md` is not re-injected after a compaction, while a rule is re-evaluated on every later matching read.

## Scripts

Four entries in `.claude/scripts/`, all `deterministic`, all shipped.

| Script | Runs at | What it does |
| --- | --- | --- |
| `generate-skills-index.ts` | `SessionStart` | regenerates the skills index inside every `CLAUDE.md` |
| `daily-tip.sh` | `SessionStart` | prints one tip from `daily-tips.txt` |
| `catalyst-dev-mode.sh` | `SessionStart` | injects the active development mode |
| `status-line.sh` | continuously | renders the status line; configured outside the `hooks` block, so it is not a trigger point |

The hooks also draw on shared code under `scripts/`: the catalogue runtime that loads and validates rule indexes, and the barrel-lint core. Both ship with the template.

## Skills

Thirty-eight skills, `contextual`, all shipped. They are scoped: a skill lives with the workspace it serves, and the scope rule for that workspace routes to it.

### Monorepo scope — 16

`.claude/skills/`

| Skill | Covers |
| --- | --- |
| `business-rules-guard` | the business-rule catalogue: adding, changing, derogating, citing by identifier |
| `catalyst-cli` | consuming the CLI: generation, `.origin` reconciliation, what belongs in YAML versus code |
| `catalyst-delegation` | delegation contracts: skill discovery, escalation protocol, model assignment |
| `catalyst-langs` | the language mechanism: panel versus data, adapters, adding a language |
| `catalyst-query-dsl` | the query DSL wire contract shared by both stacks |
| `catalyst-report-creator` | turning a reporting need into the minimal reporting artifact |
| `catalyst-schema` | authoring and validating the Aurora YAML schemas |
| `catalyst-skill-creator` | writing a new skill |
| `catalyst-update-skill-registry` | regenerating the skill registry after any skill changes |
| `harness-rules-guard` | the harness-rule catalogue |
| `judgment-day` | dual adversarial review |
| `openspec-explore` | exploring an idea before committing to a change |
| `openspec-propose` | creating a change and its artifacts |
| `openspec-apply-change` | implementing the tasks of a change |
| `openspec-archive-change` | closing a change and syncing specs |
| `typescript` | strict TypeScript patterns |

### Backend scope — 10

`backend/.claude/skills/`

| Skill | Triggered by |
| --- | --- |
| `catalyst-project-structure` | "where does this file go", the layer boundaries |
| `catalyst-handler-composer` | business logic inside a handler, composite protocol-flow handlers |
| `catalyst-field-schema` | schema and formatting decorators, query statements inside a handler |
| `catalyst-nestjs-primitives` | guards, interceptors, pipes, filters, decorators, permissions |
| `catalyst-cross-bounded-context-ports` | one bounded context reading from or writing to another |
| `catalyst-provider-composition` | choosing the concrete provider behind a port: storage, mailer, queue |
| `catalyst-tools` | runtime configuration, feature flags, secrets, database procedures, declarative migrations |
| `catalyst-schema-migrations` | a schema change or a migration |
| `catalyst-backend-testing` | writing tests |
| `catalyst-review-module` | coherence review of a finished module |

### Frontend scope — 11

`frontend/.claude/skills/`

| Skill | Triggered by |
| --- | --- |
| `catalyst-data-layer` | reading or mutating server data: list and detail screens, resolvers, queries, mutations |
| `catalyst-component-catalog` | composing a screen from the framework components |
| `catalyst-data-table-management` | data-table columns, cells and infrastructure |
| `catalyst-form-composer-auditor` | composing or auditing a form or detail view |
| `layout-design-system` | spacing, visual hierarchy, density |
| `transloco-i18n` | translations, scopes, language switching |
| `catalyst-widget-creator` | dashboard widgets |
| `spartan` | the Spartan UI components |
| `catalyst-project-structure` | "where does this file go" |
| `catalyst-review-module` | coherence review of a finished module |
| `catalyst-component-story-composer` | authoring stories for framework components |

### CLI scope — 1

`packages/cli/.claude/skills/`

| Skill | Triggered by |
| --- | --- |
| `eta-templating` | editing a codegen template |

## Commands

Thirteen command files in `.claude/commands/`, `contextual`, shipped. They load only when you type them.

| Command | Purpose |
| --- | --- |
| `/catalyst-dev-mode` | switch between Framework and Solution mode |
| `/create-schema` | analyse or create an Aurora YAML schema |
| `/load-skill` | load a skill by name, or list them |
| `/review-module` | deep coherence review of a module |
| `/opsx:explore` | think an idea through before committing to it |
| `/opsx:propose` | create a change and generate its artifacts |
| `/opsx:apply` | implement the tasks of a change |
| `/opsx:archive` | close a completed change |
| `/business-rules:audit` | audit the business-rule catalogue |
| `/business-rules:check` | validate against the business-rule catalogue |
| `/business-rules:document` | document rules implicit in existing code |
| `/business-rules:promote` | crystallise rules declared in an archived change |
| `/harness-rules:audit` | audit the harness-rule catalogue |

Two of these files are both named `audit.md`, in different directories. The generated skills index deduplicates by file name, so it reports twelve commands where thirteen files exist; the commands themselves are distinct and both work.

## Agents

One agent in `.claude/agents/`, `contextual`, shipped.

| Agent | Purpose |
| --- | --- |
| `catalyst-schema-manager` | analyses Aurora YAML schemas and proposes improvements to names, descriptions and semantics; creates, edits and deletes fields on request |

## Plugins

Four plugins. **This is the one family that does not fully ship.** The declarations travel inside `settings.json`, so your editor offers to install them when you trust the project folder — but the installations themselves are per user, which is exactly why `check-required-plugins` verifies them at every startup.

| Plugin | Required | Why |
| --- | --- | --- |
| `engram` | yes | persistent memory across sessions |
| `superpowers` | yes | base skills and test-driven-development discipline |
| `code-review` | yes | the verification gate |
| `context7` | no | up-to-date library documentation |

`engram` lives in a custom marketplace, also declared in the shipped settings.

## Judgement layer

These are not files under `.claude/`. They are instructions in `CLAUDE.md`, applied by the assistant's reasoning, and they ship because the template carries its own `CLAUDE.md`.

### Intent Gate

The first gate. Before classifying anything, the assistant confirms it understands the request. An ambiguous request — a vague goal, a missing constraint, two plausible readings — is clarified in conversation before any work begins, and then re-triaged. A clear request skips the gate entirely.

### Task-Weight Triage

Classifies every request as **Minor**, **Medium** or **Complex**, and the tier decides whether the spec-driven workflow is involved and which quality gates run. Re-run whenever scope grows mid-task; when torn between two tiers, the heavier one wins.

### Worktree Gate

For Medium and Complex work, before the first code change: an offer to isolate the work in a git worktree on its own branch, closing with a pull request. Recommended, never imposed, never done silently. Minor work never triggers it.

### Quality Gates

Test-driven development and code review, scaled by tier: nothing for Minor, a single review pass for Medium, dual adversarial review for Complex. A separate security review fires on its own criterion — whether the change touches the security surface — regardless of tier.

### Delegation contracts

The rules governing work handed to sub-agents: how skills are discovered and injected as explicit paths, how a sub-agent escalates when it needs guidance instead of guessing, and which model handles which kind of task.

## CLAUDE.md

The project instructions themselves, `contextual`, shipped. The root file loads at session start; the scoped ones load through nested traversal when a file under their directory is read.

Each one carries a generated `[Project Skills Index]` block, rewritten at every session start by `generate-skills-index.ts`. Editing that block by hand has no effect — it is regenerated from disk.

A scoped `CLAUDE.md` is **not** re-injected after a compaction. That limitation is what the scope rules exist to compensate for.
