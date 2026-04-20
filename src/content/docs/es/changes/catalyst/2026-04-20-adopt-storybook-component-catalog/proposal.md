---
title: "Propuesta"
---

## Why

> **Scope reduction — 2026-04-20**: the original proposal adopted Storybook 10 as the visual catalog runtime. After installing and configuring it, the ongoing cognitive cost (learning CSF3/addons/play, webpack-vs-Vite conflict in Angular 21, `@storybook/addon-vitest` green combination not ready) was deemed disproportionate to the team's current capacity and the current size of `@aurora/components` (<10 exports). The Storybook runtime has been **removed**; the *convention* (`*.stories.ts` as structured TS documentation + Claude skill that reads them) is **kept**. The title is preserved for audit-trail continuity — this change now formalizes a lightweight catalog convention, not a Storybook installation. A future change can reintroduce Storybook when the catalog justifies the investment.

The `frontend/src/@aurora/` layer holds platform-level, reusable infrastructure (composables, components like `data-table` and its sub-components, and directives) that every generated module consumes. Today, there is no canonical documentation describing how these building blocks look, behave, or compose — humans explore them by grepping and reading code, and Claude Code does the same with no structured source of truth. This causes duplicated invention in generated modules, drift between intended and actual usage, and a high onboarding cost each time someone (or an AI agent) needs to pick a component.

Colocated `*.stories.ts` files (CSF3 `Meta<T>` + `StoryObj<T>` shape) give both audiences a deterministic, parseable source of truth: the `Meta` declares the component and its props, `argTypes` describe each input, named `StoryObj` exports demonstrate representative variants, and optional `parameters.aurora` metadata provides explicit "when to use" hints. Claude reads these via `Glob` + `Read`; humans read them as structured documentation next to each component. No runtime UI is required for either audience to benefit.

## What Changes

- Establish the **convention**: every component exported from `@aurora/components` MUST ship a colocated `*.stories.ts` describing its public API and representative variants using CSF3 (`Meta<T>` + named `StoryObj<T>` exports). Adoption is **incremental** — new components get a story at creation; existing components get one the next time they are modified or consumed by generated code.
- Add a new Claude skill `frontend/.claude/skills/catalyst-component-catalog/` (SKILL.md + STORIES.md) that teaches agents to **read `*.stories.ts` files directly** (Glob + Read) when composing UI, and to flag + propose a story when a required component is undocumented.
- Commit a **seed story** for `TableSearchComponent` as the reference implementation of the convention.
- **NOT included** (explicitly out of scope):
  - Storybook 10 installation and `.storybook/` runtime configuration — removed after installation revealed disproportionate cost (see "Scope reduction" above).
  - `@storybook/addon-vitest` story-as-test integration — required Storybook and hit pre-existing TS strict errors in `use-graphql-*.spec.ts` specs unrelated to this change.
  - `@storybook/addon-mcp` / custom manifest generation — was already deferred under Storybook; no longer relevant until Storybook itself is revisited.

## Capabilities

### New Capabilities

- `component-catalog`: Defines how reusable components under `frontend/src/@aurora/components/**` are documented and consumed — both by developers (structured TS files read in-editor) and by AI agents (`*.stories.ts` as canonical source of truth). Covers story authoring conventions, optional `parameters.aurora` semantic metadata, and the Claude-facing discovery protocol.

### Modified Capabilities

<!-- None. No existing specs in openspec/specs/ and this adds a new capability area that does not alter requirements of any other capability. -->

## Impact

- **Code**: Seed `*.stories.ts` colocated with `TableSearchComponent` in `frontend/src/@aurora/components/data-table/components/`, new skill at `frontend/.claude/skills/catalyst-component-catalog/` (SKILL.md + STORIES.md).
- **Dependencies**: No runtime or devDependencies added. The `frontend/package.json` tree is identical to the pre-change state (the original Storybook install was reverted).
- **Build / CI**: No changes. No new pnpm scripts, no `angular.json` target changes apart from a bonus fix (`test.options.buildTarget: "frontend:build:dev"`) that unblocks `pnpm front:test` from a pre-existing broken default — kept because the test runner was broken before this change started.
- **Agent behavior**: `frontend/CLAUDE.md` (and the frontend skill index) gains a pointer instructing agents to consult the `catalyst-component-catalog` skill before composing screens with `@aurora/components`.
- **Non-impact**: No changes to backend, to `cliter/` schemas, to generated module code, or to existing component implementations. Stories and the skill are additive.
