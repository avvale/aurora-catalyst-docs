## 1. Ground the facts

- [x] 1.1 Enumerate the harness from the sources and record the raw table: for each hook, its trigger point, matcher, declared order, timeout, and whether it can block (`.claude/settings.json` + each hook's docblock)
- [x] 1.2 Enumerate the 9 path rules with their `paths:` globs and which family they belong to (`scope-*` vs `route-*`)
- [x] 1.3 Enumerate skills per scope (root, backend, frontend, packages/cli), commands, and agents, with a one-line purpose each — 16 / 10 / 11 / 1 skills, 13 command files, 1 agent. Purposes taken from the `scope-*` rules, which already carry curated one-liners, rather than from the frontmatter `description` fields, which are trigger-oriented folded scalars and read poorly as catalogue entries
- [x] 1.4 Confirm the shipped/team-layer mark for every piece by comparing the repo `.claude/` against `packages/cli/src/templates/monorepo/.claude/` and the scoped template `.claude/skills/` directories
- [x] 1.5 **Resolved.** Grounding surfaced that the template shipped hooks whose runtime dependencies were absent: `architecture-checkpoint`, `inject-rules-context` and `harness-rules-content-guard` import `../../scripts/_catalog-runtime/`, `lint-barrels` imports `../../scripts/harness-rules/lint-barrels.js`, and the shipped `scripts/business-rules/*.ts` import `_catalog-runtime` too — none of which were in any template. Fixed in `packages/cli` outside this change: the packager manifest now carries `scripts/_catalog-runtime/**`, `scripts/harness-rules/**`, `cliter/harness-rules-index.json` and `cliter/harness-rules/**`. Re-verified against the template before writing the inventory

## 2. Visual map component

- [x] 2.1 Create `src/components/HarnessMap.astro` with a `lang: 'en' | 'es'` prop, node/edge geometry declared once as data, and an `{ en, es }` label dictionary keyed by node id
- [x] 2.2 Wrap every navigable node in a real `<a href>` resolving to its anchor in the locale's reference inventory page, including the `base` prefix
- [x] 2.3 Style the SVG with Starlight's CSS custom properties so it follows the light/dark `data-theme` switch, and give it an accessible name plus per-node accessible labels
- [x] 2.4 Verify the component renders in both locales and that its anchors appear in the built HTML (not injected at runtime)

## 3. Concept pages

- [x] 3.1 Write `en/concepts/harness/index.mdx`: the three-layer model, the "enforcement proportional to damage" principle, and the mounted `HarnessMap`
- [x] 3.2 Write `en/concepts/harness/lifecycle.md`: the five trigger points, each with what runs, order, timeout, matcher and blocking capability; call out that `InstructionsLoaded` is notification-only and that path rules re-evaluate on every matching read while a nested `CLAUDE.md` does not survive `/compact`
- [x] 3.3 Write `en/concepts/harness/enforcement.md`: nudge vs block vs advisory, the fail-open contract shared by all seven hooks, why `architecture-checkpoint` blocks without being a gate, and the catalog-driven design of `harness-rules-content-guard`
- [x] 3.4 Translate 3.1–3.3 into `es/concepts/harness/` using neutral Spanish with tuteo, same paths, not a literal translation

## 4. Reference inventory

- [x] 4.1 Write `en/reference/harness/index.md` with one table per family (hooks, rules, scripts, skills, commands, agents, plugins), every row carrying its layer, its trigger or invocation moment, and its shipped/team-layer mark
- [x] 4.2 Give every piece a stable heading so the map's anchors resolve, and cross-check each map link against the headings actually emitted
- [x] 4.3 Translate into `es/reference/harness/index.md`, keeping identifiers, file paths and anchors identical to the English page

## 5. Wire up and verify

- [x] 5.1 Add a `Harness` subgroup under both `Concepts` and `Reference` in the `astro.config.mjs` sidebar, for both locales
- [x] 5.2 Run `pnpm build` and fix any Astro or content-collection error
- [x] 5.3 Run `pnpm check:links` and confirm zero broken internal links
- [x] 5.4 Confirm locale parity: the set of new paths under `en/` matches the set under `es/`
- [x] 5.5 Manually click through every node of the map in both locales and confirm each lands on its definition
