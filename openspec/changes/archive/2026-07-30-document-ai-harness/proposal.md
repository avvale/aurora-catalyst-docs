## Why

Every project created with `catalyst new` ships a complete AI harness — 7 hooks, 9 path rules, 4 session scripts, 38 skills, 12 commands, 1 agent and a plugin manifest — copied verbatim from `packages/cli/src/templates/monorepo/.claude/`. None of it is documented. A developer inherits machinery that rewrites their `CLAUDE.md` on startup, injects business rules into their prompts, blocks some of their writes and reformats others, with no way to know what runs, when it runs, or why it exists. The result is a harness that is trusted or distrusted on faith rather than understood: nobody can evaluate whether it is working, because nobody has a map of it.

## What Changes

- Add a `harness` section to the docs site: three `concepts/harness/` pages (the mental model, the execution lifecycle, the enforcement levels) plus one exhaustive `reference/harness/` inventory page. Bilingual (EN + ES), 8 content files total.
- Introduce the **three-layer model** as the organising idea for the whole section: layer 1 *deterministic* (the harness executes it — hooks and scripts), layer 2 *contextual* (the harness loads it — `CLAUDE.md`, rules, skills, commands, agents), layer 3 *judgement* (the model applies it — Intent Gate, Task-Weight Triage, Worktree Gate, Quality Gates, delegation). Document the design principle that assigns each piece to a layer: enforcement proportional to damage.
- Document the **five lifecycle trigger points** declared in `.claude/settings.json` — `SessionStart`, `InstructionsLoaded`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse` — naming for each one what runs, in what order, with what timeout, and whether it can block.
- Mark every catalogued piece as either **shipped** (travels with `catalyst new`) or **team layer** (lives in the Aurora repos only), so a reader can tell what they actually have.
- Add `src/components/HarnessMap.astro`: a hand-authored inline SVG map whose nodes are real `<a>` links into the reference inventory. Geometry is written once; labels come from an `{ en, es }` dictionary keyed by node id, selected by a `lang` prop. It is the navigational entry point of the section, mounted in `concepts/harness/index.mdx`.
- Extend the Starlight sidebar in `astro.config.mjs` with a `Harness` subgroup under both `Concepts` and `Reference`.
- Out of scope, deliberately: `catalyst ai setup` and the `.ai/` directory (the command is being removed, and neither `aurora-catalyst` nor the monorepo template contains `.ai/`); a how-to guide on auditing the harness; and any change to the harness itself — this change documents, it does not modify.

## Capabilities

### New Capabilities

- `ai-harness-docs`: publish a navigable, bilingual map of the AI harness that classifies every piece by layer, states its lifecycle trigger point and enforcement level, distinguishes shipped pieces from team-only ones, and links each node of a visual map to its catalogue entry.

### Modified Capabilities

<!-- None. `changelog-sync` is untouched; no existing requirement changes. -->

## Impact

- **New content**: `src/content/docs/{en,es}/concepts/harness/{index.mdx,lifecycle.md,enforcement.md}` and `src/content/docs/{en,es}/reference/harness/index.md`.
- **New component**: `src/components/HarnessMap.astro` (second custom component in the repo, after `ChangelogIndex.astro`).
- **Modified config**: `astro.config.mjs` sidebar only. No mermaid configuration change — clickable mermaid is rejected on verified grounds (see design).
- **Untouched**: `reference/cli-commands/`, `reference/api/`, `changes/` — all script- or skill-generated. No existing URL is renamed or deleted.
- **Source of truth read, never written**: `aurora-catalyst/.claude/` and `aurora-catalyst/packages/cli/src/templates/monorepo/.claude/`. This repo consumes from siblings and never modifies them.
- **Known drift risk**: the inventory is hand-written for this change. It will fall out of sync when the harness changes. Generating it from the template `.claude/` is a follow-up, explicitly deferred.
