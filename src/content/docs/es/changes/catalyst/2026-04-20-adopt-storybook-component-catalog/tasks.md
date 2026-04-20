---
title: "Tareas"
---

## 0. Scope reduction (2026-04-20)

> **Decision**: drop the Storybook 10 runtime; keep the `*.stories.ts` convention + the Claude skill. Rationale in `proposal.md > Why > Scope reduction`. All tasks below that touched Storybook infrastructure were either reverted or never executed in the final state.

## 1. Dependency and workspace setup — REVERTED

- [~] 1.1 ~~Install Storybook 10 core~~ — reverted via `pnpm --filter aurora-front remove storybook @storybook/angular @storybook/addon-docs @storybook/addon-themes @storybook/addon-vitest`. `frontend/package.json` and `pnpm-lock.yaml` returned to pre-change state.
- [~] 1.2 ~~Install Storybook addons~~ — reverted alongside 1.1.
- [x] 1.3 Verify `frontend/package.json` `dependencies` contains no `react`, `react-dom`, or other UI framework — PASS (trivially, nothing installed).
- [~] 1.4 ~~Add `storybook` / `build-storybook` targets to `angular.json`~~ — reverted; `architect` block returned to pre-change shape except for the bonus fix noted in Task 4.1.

## 2. Storybook configuration — REVERTED

- [~] 2.1 ~~Create `.storybook/main.ts`~~ — `frontend/.storybook/` directory removed.
- [~] 2.2 ~~Create `.storybook/preview.ts`~~ — removed with the directory.
- [~] 2.3 ~~Register `withThemeByClassName`~~ — n/a (no preview.ts).
- [~] 2.4 ~~Create `.storybook/tsconfig.json`~~ — removed with the directory.
- [~] 2.5 ~~Add `@source "../src/**/*.stories.ts"` to `styles.css`~~ — directive removed from `frontend/src/styles.css`.

## 3. Scripts and developer ergonomics — REVERTED

- [~] 3.1 ~~Add `storybook` / `build-storybook` scripts to `frontend/package.json`~~ — removed.
- [~] 3.2 ~~Add `front:storybook` / `front:storybook:build` scripts to root `package.json`~~ — removed.
- [~] 3.3 ~~Run `pnpm front:storybook` and confirm dev server on :6006~~ — verified during the Storybook trial (dev server ran cleanly, stories indexed, static build emitted `storybook-static/`). Process + artifacts removed with the rest of the runtime.

## 4. Vitest integration — DEFERRED (never reached gate)

- [~] 4.1 ~~Update `vitest.config.ts`~~ — never executed (decision gate tripped before this step).
- [~] 4.2 ~~Confirm stories picked up by Vitest~~ — deferred; baseline `pnpm front:test` fails with pre-existing TS4111 errors in `use-graphql-create.spec.ts:96,102,105` and `use-graphql-detail.spec.ts:148,149` (`.name`/`.id` access on index-signature types). Unrelated to this change.
- [~] 4.3 ~~Break seed story and confirm Vitest flags it~~ — deferred (contingent on 4.2).
- [x] 4.4 **BONUS — kept**: fixed `angular.json > test.options.buildTarget: "frontend:build:dev"` so the `@angular/build:unit-test` builder no longer looks for a non-existent `build:development` configuration. This is a pre-existing bug unrelated to Storybook; the fix is kept because it improves baseline test ergonomics regardless of Storybook adoption.

## 5. Seed story — `table-search` — KEPT

- [x] 5.1 Seed story `frontend/src/@aurora/components/data-table/components/table-search.stories.ts` authored with `Meta<TableSearchComponent>` default export (title: `@aurora/components/data-table/table-search`) and a `Default` `StoryObj<TableSearchComponent>`.
- [x] 5.2 Two additional variants: `TranslatedPlaceholder` (Transloco-sourced placeholder) and `FastDebounce` (short debounce demonstrating emit cadence).
- [x] 5.3 `parameters.aurora = { category: 'data-table', when, whenNot }` declared, pointing `whenNot` at `TableFiltersComponent` as the alternative for column-scoped filtering.
- [x] 5.4 `play` interaction on `FastDebounce` that types into the input and asserts `search` emits the typed value. Non-executable under the current setup (no Storybook runtime); structurally valid CSF3 for when Storybook is reintroduced.
- [~] 5.5 ~~Visual verification in Storybook UI~~ — N/A with no runtime. Story file shape was verified during the Storybook trial: all three variants indexed, iframes returned HTTP 200.
- [~] 5.6 ~~Run `pnpm front:test` on the story~~ — deferred with §4.

## 6. Claude skill — `catalyst-component-catalog` — KEPT

- [x] 6.1 Skill at `frontend/.claude/skills/catalyst-component-catalog/SKILL.md` with frontmatter (`name`, `description`, trigger keywords), "When to Use" list, and checklist.
- [x] 6.2 Discovery protocol encoded: (1) `Glob frontend/src/@aurora/components/**/*.stories.ts`, (2) `Read` matching file(s), (3) lift prop names/slots/composition patterns from stories instead of re-deriving.
- [x] 6.3 Escalation rule encoded: if no `*.stories.ts` exists for a required component, flag the gap and propose a story before consuming the component.
- [x] 6.4 `STORIES.md` authored next to `SKILL.md`: file naming, title path format, `argTypes`, optional `parameters.aurora` shape and examples, proxy host pattern for composables/directives, end-to-end worked example referencing the `table-search` seed.
- [x] 6.5 Two-tier agent lookup encoded in SKILL.md: (tier 1) `parameters.aurora.when`/`whenNot`; (tier 2) fall back to title/argTypes inference.
- [x] 6.6 Row added to the "Skills (Auto-invoke based on context)" table in `frontend/CLAUDE.md`, plus entry in the `<!-- SKILLS-INDEX-START -->` block.

## 7. Verification against specs — KEPT (reduced scope)

- [x] 7.1 Walked the reduced `specs/component-catalog/spec.md` scenarios:
  - "Public component ships a colocated story" — PASS for `TableSearchComponent`; other `@aurora/components/**` exports remain undocumented (incremental adoption per proposal).
  - "Composable or directive cataloged by proxy" — PATTERN DOCUMENTED in STORIES.md; no applicable component in scope (breadcrumb service slated for relocation).
  - "Agent composes a screen using an @aurora component" / "Agent encounters an undocumented component" — PASS: skill + pointer in `frontend/CLAUDE.md` exercise both flows.
  - "A story declares aurora metadata" / "An agent selects a component using aurora metadata" — PASS: seed story declares all three fields with non-empty strings and a named alternative.
  - "New contributor adds their first story" — PASS: `STORIES.md` includes checklist, worked example, and proxy host pattern.
- [x] 7.2 No fixes required — the only deltas from the original spec are the Storybook-runtime scenarios, which were intentionally removed from the spec when the Storybook runtime was dropped (see 2026-04-20 scope reduction).

## 8. Follow-ups and archive

- [~] 8.1 ~~Open `enforce-story-colocation`~~ — CANCELLED. The original rationale (lint/CI enforcement of colocation once the catalog has ≥5 stories) still applies, but without Storybook the enforcement surface is simpler; reopen when the catalog reaches threshold.
- [~] 8.2 ~~Open `enable-story-vitest-tests`~~ — CANCELLED. Not applicable without Storybook. The underlying baseline issue (TS4111 errors in GraphQL composable specs) should be filed as its own change independent of the catalog.
- [x] 8.3 `openspec status --change adopt-storybook-component-catalog` confirms all four artifacts (proposal, design, specs, tasks) are done.
- [x] 8.4 Run `/opsx:archive adopt-storybook-component-catalog` to close the change.
