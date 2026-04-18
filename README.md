# Aurora Catalyst Docs

Documentation site for the [Aurora Catalyst](https://github.com/avvale) ecosystem — CLI + framework — built with [Astro Starlight](https://starlight.astro.build/), deployed to GitHub Pages.

## Quick start

```bash
pnpm install
pnpm dev           # local dev server on http://localhost:4321
pnpm build         # static site in dist/
pnpm preview       # preview the built site
pnpm sync          # pull auto-generated content from sibling repos
```

Requires **Node 20+** and **pnpm 9+**.

## Structure

Content is organized following the [Diátaxis](https://diataxis.fr/) framework:

- `src/content/docs/en/tutorials/` — learn by doing (newcomers)
- `src/content/docs/en/guides/` — task-oriented recipes
- `src/content/docs/en/reference/` — technical reference (some auto-generated)
- `src/content/docs/en/concepts/` — understanding-oriented explanations
- `src/content/docs/en/changes/` — auto-mirrored change history from `openspec/changes/archive/`

Each of the above has a symmetric counterpart under `src/content/docs/es/`.

## Contributing

- English and Spanish versions MUST stay in sync. Write EN first, then rewrite idiomatic ES in neutral / international Spanish (tuteo — "tú", "aquí", "empieza").
- Auto-generated directories (`reference/cli-commands/`, `reference/api/`, `changes/`) are in `.gitignore`. They are rebuilt by `pnpm sync`. Do not commit or hand-edit them.
- For non-trivial additions that mirror a new feature in `aurora-catalyst-cli`, invoke the `docs-from-spec` skill — see `CLAUDE.md`.

## License

MIT.
