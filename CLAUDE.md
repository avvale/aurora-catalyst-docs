# Aurora Catalyst Docs

Documentation site for the Aurora Catalyst ecosystem: the `aurora-catalyst-cli` code generator and the `aurora-catalyst` Angular + NestJS framework it scaffolds.

## Architecture

- **Site builder**: Astro + Starlight (`astro.config.mjs`)
- **Package manager**: pnpm (≥ 9)
- **Node**: ≥ 20
- **Languages**: English (default) + Español (Rioplatense, voseo)
- **Hosting**: GitHub Pages, deployed by `.github/workflows/deploy.yml`

## Content organization — Diátaxis

All `.md` / `.mdx` under `src/content/docs/` (and the `es/` mirror) fall into exactly one of four categories:

| Folder | Purpose | Example |
|---|---|---|
| `tutorials/` | Learning-oriented. Step-by-step for newcomers. | "Your first bounded context in 15 minutes" |
| `guides/` | Task-oriented. Recipes for competent users. | "Add a preservation region to a form template" |
| `reference/` | Information-oriented. Exhaustive, consultable fast. | CLI command list, API, YAML schema |
| `concepts/` | Understanding-oriented. The _why_. | "Why deterministic codegen", "How preservation regions work" |

Plus one operational section:

| Folder | Purpose |
|---|---|
| `changes/` | Mirror of `openspec/changes/archive/` from source repos. Auto-generated, do NOT edit. |

## Human-curated vs auto-generated

- **Human-curated** (edited in this repo): `tutorials/`, `guides/`, `concepts/`, and any hand-written files under `reference/` (e.g. YAML schema).
- **Auto-generated** (overwritten on every import): `reference/cli-commands/`, `reference/api/`, `changes/`.

The auto-generated directories are listed in `.gitignore` — they are rebuilt by `pnpm import` (locally) and by the deploy workflow (on CI before `astro build` if/when configured).

## Cross-repo workflow

This repo **consumes** information from sibling Aurora repos but **never** modifies them. The inverse is true too: the source repos do not know this repo exists.

```
aurora-catalyst-cli (source of truth)     aurora-catalyst-docs (you are here)
├── openspec/changes/archive/       ─────►  changes/ (mirror)
├── docs/ (oclif readme output)     ─────►  reference/cli-commands/
└── docs-api/ (TypeDoc output)      ─────►  reference/api/
                                   ◄────── scripts/import-from-catalyst.ts
```

To update docs from a freshly-archived change:

```bash
# 1. Make sure the source repo is at the commit you want to document.
# 2. Run the skill with both repos in scope:
claude --add-dir ../aurora-catalyst-cli

# 3. Invoke the skill (from this repo):
#    → it reads the archive, produces concept/guide pages in EN + ES, opens a PR.

# 4. Optionally pull the auto-generated parts:
pnpm import
```

## Rules

- **IMPORTANT**: When completing a workflow, provide a summary table with two columns: Skills Used and Role Performed.
- Never use `cat`/`grep`/`find`/`sed`/`ls`. Use `bat`/`rg`/`fd`/`sd`/`eza` instead.
- When asking the user a question, STOP and wait for response. Never assume.
- Never agree with user claims without verification. Say "dejame verificar" and check code/docs first.
- If the user is wrong, explain WHY with evidence. If you were wrong, acknowledge with proof.
- Always propose alternatives with tradeoffs when relevant.
- Every page written in English MUST have a Spanish counterpart under `src/content/docs/es/` — and vice versa.
- Spanish content is written in Rioplatense Spanish (voseo), not translated literally.
- Never edit files under `reference/cli-commands/`, `reference/api/`, or `changes/` — those are overwritten by `pnpm import`.
- Never create categories outside Diátaxis (tutorials / guides / reference / concepts). If something does not fit, raise it with the user before creating the directory.
- Docs URLs are contracts. Do not rename or delete existing pages without explicit user confirmation.

## Common Commands

| Task | Command |
|---|---|
| Dev server | `pnpm dev` |
| Build (with link check) | `pnpm build` |
| Preview build | `pnpm preview` |
| Import auto-generated content | `pnpm import` |
| Import overriding CLI path | `pnpm import --cli-path /abs/path` |
| Skip CLI or API import | `pnpm import --skip-cli-commands --skip-api` |

## Skills

| Skill | When to use |
|---|---|
| `docs-from-spec` | After a change is archived in `aurora-catalyst-cli` (or similar). Generates concept + guide + reference stubs in EN and ES from the archive. Lives at `.claude/skills/docs-from-spec/SKILL.md`. |
