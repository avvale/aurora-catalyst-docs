## Context

The harness is not a set of loose files; it is machinery with a shape. Measured against the sources:

- `.claude/settings.json` declares **five trigger points** wiring 7 hooks and 4 session scripts.
- `.claude/rules/` holds **9 path rules** in two families: `scope-*` (backend, frontend, cli) and `route-*` (aurora components, aurora yaml, backend tests, drizzle schema, eta templates, skill md).
- **38 skills** are split by scope: 16 root, 10 backend, 11 frontend, 1 in `packages/cli`. Plus 12 commands and 1 agent.
- The judgement layer — Intent Gate, Task-Weight Triage, Worktree Gate, Quality Gates, delegation contracts — lives in `CLAUDE.md`, not in `.claude/`. It is already drawn in `aurora-catalyst/docs/aurora-flujo.html` (v15), which is the visual reference for that layer.

Two structural facts anchor the design:

1. **The harness ships.** `catalyst new` → `newMonorepo()` → `copyDirRecursive(templates/monorepo, appName)`, and `SKIP_COPY` excludes only `coverage`, `dist`, `node_modules`. `diff -rq` confirms the template's `hooks/` and `rules/` are byte-for-byte identical to the repo's. This is product documentation, not internal notes.
2. **Every hook is fail-open.** All seven wrap `main()` in a try/catch that exits 0. A broken hook can never degrade a session. Only three paths block deliberately: `architecture-checkpoint` (exit 2, once per path), `harness-rules-content-guard` (exit 2, catalog-driven), and `lint-barrels` (`decision: "block"` for HR-BARRELS-002).

## Goals / Non-Goals

**Goals:**

- Give a reader a mental model they can hold: three layers, five trigger points, one assignment principle.
- Make the map navigable — the visual is the index, not decoration.
- State for every piece whether the reader actually has it.
- Keep the reference inventory in one page so every definition is an anchor on one URL.

**Non-Goals:**

- Auditing or verifying the harness at runtime (the how-to guide was considered and dropped).
- Documenting `catalyst ai setup` or `.ai/` — the command is being removed, and neither `aurora-catalyst` nor the monorepo template contains `.ai/`.
- Generating the inventory from source. Hand-written now; generation deferred.
- Changing the harness. This change reads the sources and never writes to them.

## Decisions

### D1 — Three layers as the organising axis, not the file-type list

Organising by directory (`hooks/`, `rules/`, `skills/`) produces a catalogue that answers "what exists" but not "when does this happen". The three-layer model answers both, because layer membership *implies* the trigger semantics: deterministic pieces fire at a settings-declared point, contextual pieces arrive when something is read or invoked, judgement pieces apply whenever the model reasons.

*Alternative considered:* one page per file type. Rejected — it scatters the lifecycle across four pages and leaves the judgement layer homeless, since it has no directory at all.

### D2 — The visual map is a hand-authored Astro component, not clickable mermaid

Verified against the installed toolchain, four facts rule out mermaid for navigation:

1. `astro-mermaid@2.0.4` renders **client-side**: it sets `startOnLoad: false` and scans `pre.mermaid` after load. `scripts/check-links.ts` starts `astro preview` and crawls the built HTML with linkinator, so it **never executes the diagram**. URLs inside a mermaid `click` are invisible to the link checker — broken links nobody detects, on the page that indexes the section.
2. The site is served under `base: '/aurora-catalyst-docs'`, and mermaid does not resolve Astro's base. Click URLs would be hardcoded and duplicated per locale. `astro.config.mjs` already documents this class of bug in its `redirects` comment.
3. Enabling click requires `mermaidConfig: { securityLevel: 'antiscript' | 'loose' }` — a global change affecting every diagram on the site. (The mechanism does exist: `mermaidConfig` is spread into `mermaid.initialize()` and `securityLevel` is not hardcoded. It is simply not worth it.)
4. `check:links` validates pages, not fragments. A mistyped `#anchor` resolves to the page and passes silently.

A component emitting real `<a>` elements in the static HTML solves 1, 2 and 3, and there is precedent: `ChangelogIndex.astro`.

*Consequence of fact 4:* anchor correctness is not machine-verified. Mitigated by keeping the whole inventory on one page authored in the same change, so every anchor and every link are written together.

*Alternative considered:* mermaid diagram plus a linked legend table below. Cheaper and fully link-checked, but the drawing itself is inert — the reader looks up and clicks down. Rejected because navigability from the visual was the explicit requirement.

### D3 — Geometry once, labels from a locale dictionary

`HarnessMap.astro` takes a `lang: 'en' | 'es'` prop. Node positions, edges and shapes are declared once as data; labels and link targets are resolved per node id from an `{ en, es }` dictionary. Bilingual parity then cannot drift geometrically — only a missing string can go wrong, and that is visible on sight.

*Alternative considered:* two SVG files. Rejected — any layout change would have to be applied twice, which is exactly how the two locales diverge.

### D4 — One reference page, anchors as the link target

The map's nodes all point into a single URL. This keeps navigation coherent (no fragmentation across five pages), makes the page searchable with one `Ctrl-F`, and leaves a single file per locale for the deferred generator to produce.

*Trade-off:* the skills table is long (38 rows). Accepted — reference material is searched, not browsed. Splitting later is trivial; merging published URLs is not, and in this repo "docs URLs are contracts".

### D5 — Facts come from the sources, verified, not from memory

Timeouts, matchers, execution order and blocking semantics are read from `.claude/settings.json`; behaviour and failure modes from each hook's docblock, which is unusually explicit (for example, `architecture-checkpoint` documents that it caches the path *before* `exit(2)`, so an identical retry proceeds — it is a nudge, not a gate). Counts are taken by enumeration. Anything not verifiable is left out rather than approximated.

### D6 — Mermaid stays, for diagrams that only explain

Non-navigational diagrams inside the lifecycle and enforcement pages may use mermaid fences as the rest of the site does. The rejection in D2 is about navigation, not about mermaid.

## Risks / Trade-offs

- **Hand-written inventory drifts when the harness changes** → The section is scoped to structure and lifecycle, which change rarely, rather than to per-skill prose, which changes often. Counts and tables are concentrated in one page so a future generator has a single target. Recorded as a deliberate deferral in the proposal.
- **Anchors are not link-checked (D2, fact 4)** → Inventory and map are authored in the same change, so targets and links are written together. `github-slugger` is already a dependency and already used in `scripts/lib/api-links.ts`, so extending `check-links.ts` to validate fragments is feasible later; out of scope here.
- **Hand-authored SVG is laborious to modify** → Cost is bounded because the map draws the five trigger points and three layers, a structure fixed by the harness's own design. Adding a hook is a label change, not a layout change.
- **Documenting the judgement layer risks describing intent rather than behaviour** → That layer is documented as what `CLAUDE.md` instructs, explicitly attributed to it, and marked as applied by the model. No claim is made that it is enforced mechanically.
- **Two CLI origins** (`avvale/aurora-catalyst-cli` and `packages/cli` inside `aurora-catalyst`, which holds the template harness) → No impact while the inventory is hand-written. It must be resolved before any generator is pointed at a source.

## Migration Plan

Additive only. New pages, one new component, one sidebar edit. No existing URL is renamed or deleted, so no redirect is required. Rollback is deleting the added files and reverting the `astro.config.mjs` sidebar entries.

## Open Questions

None blocking. The inventory-generation follow-up and the anchor-validation extension to `check-links.ts` are both recorded as deferred, not open.
