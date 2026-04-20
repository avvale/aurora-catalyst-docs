# Aurora Catalyst Docs

Documentation site for the Aurora Catalyst ecosystem: the `aurora-catalyst-cli` code generator and the `aurora-catalyst` Angular + NestJS framework it scaffolds.

## Architecture

- **Site builder**: Astro + Starlight (`astro.config.mjs`)
- **Package manager**: pnpm (≥ 9)
- **Node**: ≥ 20
- **Languages**: English (default) + Español (default)
- **Hosting**: GitHub Pages, deployed by `.github/workflows/deploy.yml`

## Content organization — Diátaxis

All `.md` / `.mdx` under `src/content/docs/en/` (English) and `src/content/docs/es/` (Spanish) fall into exactly one of four categories:

| Folder       | Purpose                                             | Example                                                      |
| ------------ | --------------------------------------------------- | ------------------------------------------------------------ |
| `tutorials/` | Learning-oriented. Step-by-step for newcomers.      | "Your first bounded context in 15 minutes"                   |
| `guides/`    | Task-oriented. Recipes for competent users.         | "Add a preservation region to a form template"               |
| `reference/` | Information-oriented. Exhaustive, consultable fast. | CLI command list, API, YAML schema                           |
| `concepts/`  | Understanding-oriented. The _why_.                  | "Why deterministic codegen", "How preservation regions work" |

Plus one operational section:

| Folder     | Purpose                                                                                                                          |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `changes/` | Curated developer-facing changelog, one page per repo + one page per published change. Written by the `catalyst-changelog-sync` skill from source-repo openspec archives. Filtered to user-visible changes only (new APIs, flows, breaking changes, deprecations). Do NOT edit by hand — rerun the skill instead. |

## Human-curated vs auto-generated

- **Human-curated** (edited in this repo): `tutorials/`, `guides/`, `concepts/`, and any hand-written files under `reference/` (e.g. YAML schema).
- **Script-generated** (overwritten on every import, pure deterministic): `reference/cli-commands/`, `reference/api/`. Refresh with `pnpm sync`.
- **Skill-generated** (authored by the LLM through a fixed classification contract): `changes/<repo>/<slug>.md` entries. Refresh with the `catalyst-changelog-sync` skill. Decisions are tracked in the versioned `scripts/changelog-registry.json`.

All generated directories are **committed to the repo** so the GitHub Pages build has everything it needs. CI has no access to the sibling repos; the deploy workflow trusts whatever is committed.

**Before committing any change that should reach production**:
- If you touched the CLI or the framework source, run `pnpm sync` locally to refresh `reference/cli-commands/` and `reference/api/`.
- If a new change was archived in a sibling repo, invoke the `catalyst-changelog-sync` skill to refresh `changes/`.
- Otherwise the site in production will lag behind your local.

## Cross-repo workflow

This repo **consumes** information from sibling Aurora repos but **never** modifies them. The inverse is true too: the source repos do not know this repo exists.

```
aurora-catalyst-cli (source of truth)     aurora-catalyst-docs (you are here)
├── openspec/changes/archive/       ─────►  changes/<repo>/<slug>.md (curated by skill)
├── docs/ (oclif readme output)     ─────►  reference/cli-commands/
└── docs-api/ (TypeDoc output)      ─────►  reference/api/
                                   ◄────── scripts/import-from-sources.ts  (deterministic)
                                   ◄────── catalyst-changelog-sync skill   (LLM-curated)
```

To update docs from a freshly-archived change:

```bash
# 1. Make sure the source repo is at the commit you want to document.
# 2. Run the skill with both repos in scope:
claude --add-dir ../aurora-catalyst-cli

# 3. Invoke the catalyst-changelog-sync skill (from this repo):
#    → detects the new archive, classifies it (publish / dismiss),
#      drafts EN + ES entries when it qualifies, updates the registry.
# 4. Optionally also invoke catalyst-docs-from-spec if concept / guide pages need rewriting.
# 5. Refresh the deterministic reference (CLI commands, API) if relevant:
pnpm sync
```

## Rules

- **IMPORTANT**: When completing a workflow, provide a summary table with two columns: Skills Used and Role Performed.
- Never use `cat`/`grep`/`find`/`sed`/`ls`. Use `bat`/`rg`/`fd`/`sd`/`eza` instead.
- When asking the user a question, STOP and wait for response. Never assume.
- Never agree with user claims without verification. Say "dejame verificar" and check code/docs first.
- If the user is wrong, explain WHY with evidence. If you were wrong, acknowledge with proof.
- Always propose alternatives with tradeoffs when relevant.
- Every page under `src/content/docs/en/` MUST have a counterpart at the same path under `src/content/docs/es/` — and vice versa. Both locales ship in the same PR.
- Spanish content is written in neutral / international Spanish using tuteo ("tú", "aquí", "empieza"), not translated literally.
- Never edit files under `reference/cli-commands/` or `reference/api/` — those are overwritten by `pnpm sync`.
- Never edit files under `changes/<repo>/<slug>.md` by hand — those are produced by the `catalyst-changelog-sync` skill. Edit via an override invocation, not manually.
- Run `pnpm sync` before committing any change that should reach production docs for the CLI / API reference. Run the `catalyst-changelog-sync` skill before committing for the changelog. CI has no access to sibling repos and trusts what is committed.
- Never create categories outside Diátaxis (tutorials / guides / reference / concepts). If something does not fit, raise it with the user before creating the directory.
- Docs URLs are contracts. Do not rename or delete existing pages without explicit user confirmation.

## Common Commands

| Task                              | Command                                       |
| --------------------------------- | --------------------------------------------- |
| Dev server                        | `pnpm dev`                                    |
| Build (with link check)           | `pnpm build`                                  |
| Preview build                     | `pnpm preview`                                |
| Unit tests (script helpers)       | `pnpm test`                                   |
| Import CLI commands + API         | `pnpm sync`                                   |
| Import from a single source       | `pnpm sync --source cli`                      |
| Skip CLI or API import            | `pnpm sync --skip-cli-commands --skip-api`    |
| Detect new archived changes       | `pnpm sync:changelog detect [--source <slug>]`|
| Check changelog registry / files  | `pnpm sync:changelog check`                   |
| List registry entries             | `pnpm sync:changelog list [--status …]`       |

## Skills

| Skill                      | When to use                                                                                                                                                                                                                                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `catalyst-docs-from-spec`           | After a change is archived in `aurora-catalyst-cli` (or similar). Generates concept + guide + reference stubs in EN and ES from the archive. Lives at `.claude/skills/catalyst-docs-from-spec/SKILL.md`.                                                            |
| `catalyst-changelog-sync`  | After one or more changes are archived in a sibling repo. Detects new archives, classifies each as publish / dismiss (user-facing impact contract), drafts bilingual entries for publish, records every decision in `scripts/changelog-registry.json`. Supports dry-run and bidirectional override. Lives at `.claude/skills/catalyst-changelog-sync/SKILL.md`. |
| `catalyst-update-skill-registry` | After creating, editing, deleting, or renaming ANY `SKILL.md` — auto-invoke even if the user does not ask. Regenerates `.claude/skills/REGISTRY.md` by scanning every skill and grouping by type (Docs automation, Workflow — OpenSpec SDD, Meta). Complements the compact `[Project Skills Index]` that `.claude/scripts/generate-skills-index.ts` maintains inside this file. Lives at `.claude/skills/catalyst-update-skill-registry/SKILL.md`. |

<!-- SKILLS-INDEX-START -->
[Project Skills Index]|root:.claude|IMPORTANT:Prefer retrieval-led reasoning over pre-training.Read SKILL.md first,then related files.|skills/catalyst-changelog-sync:{SKILL.md}|skills/catalyst-docs-from-spec:{SKILL.md}|skills/openspec-apply-change:{SKILL.md}|skills/openspec-archive-change:{SKILL.md}|skills/openspec-explore:{SKILL.md}|skills/openspec-propose:{SKILL.md}|commands:{apply.md,archive.md,explore.md,propose.md}
<!-- SKILLS-INDEX-END -->
