---
title: "Design"
---

## Scope reduction — 2026-04-20

> **The Storybook 10 runtime was removed after installation.** The decisions below (1, 2, 3, 4, 7) describe the Storybook-specific approach that was trialled and reverted. Decisions 5 and 6 (colocated stories, Claude skill as canonical reader) remain in effect and are the lasting outcome of this change. The trial validated that:
>
> - Storybook 10 + Angular 21 works, but requires a `pnpm.overrides.webpack: 5.105.2` to resolve the webpack-version conflict between `@angular/build` and `@storybook/builder-webpack5`.
> - `@storybook/addon-vitest` + Angular 21 + Vitest 4 is blocked until the pre-existing TS4111 errors in `use-graphql-*.spec.ts` are fixed.
> - The seed `.stories.ts` file is valid CSF3 and renders correctly when Storybook is present.
>
> Decisions 1–4, 7 are retained verbatim below as historical record. When the catalog grows past ~15 components or a dedicated visual review workflow becomes necessary, a new change can reintroduce Storybook — the stories authored under the current convention will work unchanged.

## Context

The Aurora frontend (`frontend/`, Angular 21.2, Tailwind 4, spartan-ng alpha.664, Vitest 4) centralizes reusable UI/behavior at `frontend/src/@aurora/`. This layer is consumed by every generated module and by hand-written screens in framework mode. Today:

- No interactive catalog exists. Developers open `data-table` and its sub-components by grepping and reading source.
- Claude Code composes UI by reading existing screen files and guessing at component APIs — there is no canonical, AI-parseable spec for each component.
- Variants and composition recipes (e.g., data-table + filters + export + pagination) are re-derived each time, risking drift.
- Previous investigation (engram observation #43, 2026-04-17) mapped the Storybook MCP ecosystem and concluded that **manifest generation is React-only in v10.2**, so any MCP bridge for Angular is deferred.

The project already has every dependency that makes Storybook 10 cheap to adopt: Vitest 4 (for `addon-vitest`), Tailwind 4 (for `@source` story scanning), and spartan-ng's headless primitives (wrapped via `applicationConfig` in `preview.ts`).

## Goals / Non-Goals

**Goals:**

- Give developers an interactive, locally-served catalog of every `@aurora/components/**` element with live variants.
- Give Claude Code a canonical, deterministic source of truth for component APIs and composition patterns via `*.stories.ts` files (glob + Read).
- Reuse the existing **Vitest 4** runner for story-as-test — no parallel test infrastructure.
- Match the production runtime: Tailwind 4 tokens, dark mode (`html.dark`), spartan-ng providers, Transloco scopes.
- Establish a convention enforceable by review + linting that every public component in `@aurora/components` ships a colocated story.

**Non-Goals:**

- **MCP integration**: `@storybook/addon-mcp` is React-only; `@storybook/mcp` standalone is agnostic but requires custom manifest generation. Deferred until Angular is supported upstream, or until we invest in a manifest generator inside `aurora-catalyst-cli`.
- **Visual regression / Chromatic**: Out of scope. Addon-vitest covers interaction smoke tests; snapshot/diffing is a future concern.
- **Hosting a public Storybook**: Scripts for static build are included, but deployment (CDN, Netlify, etc.) is not part of this change.
- **Stories for generated module components**: Only `@aurora/*` is in scope. Per-module screens are the module author's concern and follow different lifecycle rules.
- **Migrating existing docs** (e.g., READMEs inside `@aurora/components/*`): Stories complement, not replace.

## Decisions

### Decision 1: Storybook 10 (stable), not Storybook 9 or none

**Choice:** Adopt Storybook 10.x as the catalog framework. Install `@storybook/addon-docs` to enable CSF3 **autodocs** (derived from JSDoc on components and stories). This is explicitly **not** MDX page authoring — MDX-driven docs pages are out of scope.

**Why:**

- Storybook 10 has first-class Angular 21 support (`@storybook/angular`) and a framework-agnostic `addon-vitest` that targets Vitest 4 — the exact stack in `frontend/package.json`.
- Storybook 10 standardizes CSF3 (`Meta<T>` / `StoryObj<T>`) and the `play` function, which map cleanly to AI-parseable story objects.
- `addon-docs` in SB10 is required to render the JSDoc-driven autodocs tab for each story; without it, CSF3 metadata (argTypes, descriptions) does not surface in the catalog UI. It does **not** imply authoring `.mdx` pages.
- The ecosystem investment here is shared across every generated module going forward (framework mode, reuse-first).

**Alternatives considered:**

- _Storybook 9:_ Older, lacks the Vitest 4 compatibility; would force a maintenance migration within months.
- _No catalog (status quo):_ Rejected — the cost of drift and the AI-discovery gap keep growing linearly with each new `@aurora/*` export.
- _Custom Angular playground (ad-hoc demo routes):_ Rejected — re-invents what Storybook gives for free, and produces no AI-parseable story objects.

### Decision 2: Path C — Storybook WITHOUT `@storybook/addon-mcp`

**Choice:** Install Storybook 10 standalone. Do **not** install the MCP addon. Claude reads `*.stories.ts` directly via glob + Read.

**Why:**

- `@storybook/addon-mcp` is explicitly React-only as of v10.2 (storybook.js.org/docs/next/ai/mcp/overview): _"Storybook's AI capabilities ... are currently only supported for React projects."_
- The standalone `@storybook/mcp` server is framework-agnostic but requires a `components.json` manifest that no tool generates for Angular today.
- Stories as plain TypeScript are already structured enough for Claude: `meta.title`, `meta.component`, `args`, `argTypes`, and named `StoryObj` exports are grep-able and predictable.
- When Angular manifest generation lands upstream (or when we invest in `aurora-catalyst-cli` emitting `components.json`), flipping the switch is additive: install the addon or self-host the standalone — no story rewrites.

**Alternatives considered:**

- _Install `addon-mcp` and ignore the React-only limitation:_ It literally won't produce usable manifests; pointless.
- _Write our own manifest generator now:_ Premature — the story-reading path is sufficient for the current scale of `@aurora/components` (data-table + a few helpers). Revisit when the catalog exceeds ~30 exports.

### Decision 3: `@storybook/addon-vitest` for story-as-test, not a separate test story runner

**Choice:** Wire stories into Vitest 4 via `@storybook/addon-vitest`. A story passes when it renders without error; `play` functions can add interaction assertions.

**Why:**

- Vitest 4 is already the project's unit test runner (`frontend/package.json` devDependencies). Addon-vitest reuses that infrastructure — no jest, no playwright, no parallel CI step.
- Enforces that every story stays renderable; prevents the common decay where a story silently breaks after a prop rename.

**Alternatives considered:**

- _`test-runner` (Playwright-based, legacy):_ Heavier, needs a running Storybook server and a browser. Overkill for smoke coverage.
- _No story tests:_ Rejected — stories would drift; the catalog is only useful if it's always green.

### Decision 4: `@storybook/addon-themes` with `parentSelector: 'html'`

**Choice:** Use `addon-themes` and set `parentSelector: 'html'` to toggle `html.dark` — matching the existing app.

**Why:** The project's dark-mode strategy (inspected in the current Tailwind/Angular setup) toggles a class on `<html>`. Matching that selector means component styles render identically in Storybook and in the app. Any other selector would hide dark-mode regressions.

### Decision 5: Co-located stories (`foo.component.ts` next to `foo.stories.ts`)

**Choice:** Stories live next to the component they describe, not in a `stories/` directory.

**Why:**

- Refactor safety: moving a component moves its story in the same diff.
- Discoverability: both humans and Claude find stories by path convention — if `data-table/components/column-toggle.component.ts` exists, `data-table/components/column-toggle.stories.ts` is the canonical story.
- The Claude skill `catalyst-component-catalog` relies on this locality to resolve component ↔ story mappings with a single glob.

**Alternatives considered:** centralized `frontend/stories/` tree — rejected, it creates two independent file hierarchies that drift.

### Decision 6: Claude skill `catalyst-component-catalog` teaches "read, don't regenerate"

**Choice:** Add `frontend/.claude/skills/catalyst-component-catalog/SKILL.md` that instructs agents to (a) glob `*.stories.ts`, (b) Read the story files, and (c) compose UI by lifting variants and args, not by re-inventing them.

**Why:** Without a skill, agents will ignore Storybook entirely and keep re-deriving component usage from screen files. The skill closes the loop between "stories exist" and "agents actually consult them". This mirrors existing skills like `layout-design-system` and `transloco-i18n` that already shape frontend agent behavior.

### Decision 7: spartan-ng via `applicationConfig` decorator; Tailwind 4 via `@source`

**Choice:** In `preview.ts`, use `applicationConfig({ providers: [...] })` to register Transloco / router / spartan-ng providers as needed. In `styles.css` (or Tailwind entry), add `@source "./src/**/*.stories.ts"` so Tailwind 4 scans story files for utility classes.

**Why:** Tailwind 4 uses file-scan-based discovery; without the `@source` directive, classes referenced only inside stories (variant demos) would not be generated. `applicationConfig` is the canonical Angular-standalone-providers pattern and is required for Transloco scope loading inside stories.

## Risks / Trade-offs

- [**Story decay** — stories not updated when components change] → Mitigation: story-as-test via addon-vitest makes CI fail on render breakage; code review checklist adds "story updated?" line for `@aurora/` changes.
- [**`addon-vitest` + Angular 21 + Vitest 4 is the greenest part of the stack**] → This combination is new and not battle-tested in the wild. Tasks 4.2 and 4.3 are the real integration gate: if the addon does not pick up stories cleanly under Angular 21, fall back to **renderable-only in Storybook UI** for this change, and open a follow-up change `enable-story-vitest-tests` once the upstream combo stabilizes. Do NOT block the catalog rollout on test integration.
- [**Tailwind 4 misses classes only used in stories**] → Mitigation: explicit `@source "./src/**/*.stories.ts"` directive; verify on first sample story by toggling a utility-only variant.
- [**Claude ignores the skill and regenerates components anyway**] → Mitigation: wire the pointer into `frontend/CLAUDE.md` skill index; the skill description uses trigger keywords (component composition, `@aurora/components`, UI screen authoring) so auto-invoke fires.
- [**`react-docgen` appears as a transitive devDep**] → Per engram #43, it's in `@storybook/mcp`'s devDependencies (test fixtures only). We are **not** installing `@storybook/mcp`, so this does not land. Verify after `pnpm install` that no React runtime dependency is introduced.
- [**First-story setup time exceeds the 1–2h estimate**] → Accept: one-off cost. If it balloons (>4h), narrow scope to a single seed story and defer the rollout plan.
- [**Angular workspace target conflicts**] → The Storybook CLI adds `storybook`/`build-storybook` targets to `angular.json`. Verify these don't collide with existing builders in the same project before running the init.

## Migration Plan

1. **Setup** (single PR): install deps, generate `.storybook/` config, wire preview decorators (themes, Tailwind, spartan-ng providers, Transloco), add pnpm scripts, commit seed story for `TableSearchComponent` (smallest @aurora surface that renders standalone — `data-table/components/table-search.component.ts`). Note: `breadcrumb` was the prior candidate but `@aurora/components/breadcrumb/` is a service + composable, not a component, and is slated for relocation out of `@aurora/components/`.
2. **Rollout** (follow-up PRs): add stories for remaining `@aurora/components/**` exports, prioritizing `data-table` and its sub-components (highest reuse).
3. **Skill activation**: publish the `catalyst-component-catalog` skill and add it to `frontend/CLAUDE.md`. This can land in step 1 — the skill is useful even with a single story.
4. **Rollback**: removing Storybook means deleting `frontend/.storybook/`, uninstalling the new devDependencies, dropping the pnpm scripts, and removing the `angular.json` targets. Stories themselves are isolated and can remain (plain TS) or be deleted. No runtime code touches this, so rollback is low-risk.

## Open Questions

- Should the Claude skill for component composition (`component-catalog`) sit in `frontend/.claude/skills/` or be promoted to root `.claude/skills/`? Current plan: frontend-scoped, since stories live in the frontend project; promotable later if the backend ever needs to reference component metadata.

## Follow-ups (tracked, not in scope)

These are known future work items intentionally excluded from this change. Each one MUST be opened as its own OpenSpec change when ready — leaving them as informal "Open Questions" risks dropping them.

- **`enforce-story-colocation`**: lint rule or CI script that flags any `@aurora/components/**/index.ts` export whose component file lacks a sibling `*.stories.ts`. Defer until the convention is lived-in (avoid enforcing a brand-new pattern). Action: open the change as soon as the catalog has ≥5 stories.
- **`enable-story-vitest-tests`**: only open if Task 4.2/4.3 reveals that `addon-vitest` + Angular 21 is not production-ready. Tracks the fallback path outlined in Risks.
- **`adopt-storybook-mcp`**: open when Angular manifest generation lands upstream OR when the catalog grows past ~30 exports (inflection point where explicit metadata dominates inferred metadata). At that point, either install `@storybook/addon-mcp` (if Angular is supported) or emit a custom `components.json` from `aurora-catalyst-cli` and self-host `@storybook/mcp`.
