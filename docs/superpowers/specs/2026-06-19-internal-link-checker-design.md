# Design: post-build internal link checker

- **Date**: 2026-06-19
- **Status**: Approved (pending spec review)
- **Author**: docs maintainer + Claude
- **Topic**: Add automated internal-link validation to CI for `aurora-catalyst-docs`

## Background

`pnpm build` runs `astro check && astro build`. `astro check` only validates
TypeScript and content-collection schemas — it does **not** validate links.
Broken internal links therefore ship undetected; commit `b954e44`
(_"fix broken sibling links"_) is a concrete instance of the gap.

The repo has **no PR CI**: the only workflow (`.github/workflows/deploy.yml`)
runs on `push` to `main` and on `workflow_dispatch`. CI has no access to the
sibling source repos and trusts whatever is committed.

### Why not the idiomatic Starlight plugin

The obvious candidate, `starlight-links-validator`, was rejected after
measurement. Its `errorOnRelativeLinks` option only has two modes:

- `true` (default): **errors** on every relative link (`./x`, `../x`).
- `false`: **skips** relative links entirely — _"these links will not be validated"_.

The repo's dominant convention is relative links: **202 files** use `](../`
(56 of them hand-written, the rest the generated `reference/api/` TypeDoc tree).
Relative root-absolute links would need the brittle hardcoded `/aurora-catalyst-docs`
base prefix the repo deliberately avoids. So the plugin would either flag all
202 files (forcing a migration) or silently skip exactly the relative sibling
links that cause the bug class we want to catch. Neither fits.

A post-build crawler validates the **rendered output**, so it catches broken
links of any authoring style (relative siblings included) with zero content
migration. That is the chosen approach.

## Goal and scope

**Goal**: fail CI (and offer a local command) when an **internal** link in the
rendered site points at a non-existent page.

**In scope**
- Internal links of any style (relative `../`, root-absolute-with-base, slug).
- Runs on PRs and on `push` to `main`; also runnable locally.

**Out of scope** (explicit decisions)
- **External links** (`http(s)://`): slow and flaky in CI (rate limits, 403s,
  timeouts). Skipped. 154 files contain external links.
- **Anchor/fragment validation** (`page#heading`): linkinator validates the
  page, not the fragment. 80 content links use anchors — deferred as a future
  enhancement (would need `lychee` or a second tool).

## Architecture and data flow

```
astro build  ──►  dist/  ──►  astro preview  (serves dist under /aurora-catalyst-docs/)
                                     │
                                     ▼
                         linkinator (recurse: true, same-domain only)
                                     │   linksToSkip ignores external URLs
                                     ▼
                         links[] → filter state === 'BROKEN' → report → exit 0/1
```

- linkinator resolves `href="../foo"` against each page's URL exactly like a
  browser, so a broken sibling resolves to a 404 and is reported. This is why
  the crawler catches the bug class the type-checker and the Starlight plugin
  miss.
- `astro preview` is required because it honors `base`. Serving the flat `dist/`
  at `/` would break the absolute `/aurora-catalyst-docs/...` hrefs that Starlight
  emits (files live at `dist/en/...`, hrefs are `/aurora-catalyst-docs/en/...`).
- `recurse: true` follows **same-domain** links only (confirmed in linkinator
  docs), so the crawl naturally stays on the local preview origin.
- External links are still _seen_ on pages; `linksToSkip: ['^(?!http://localhost)']`
  skips any URL that does not start with the preview origin, keeping the run
  deterministic.

## Components and changes

### New dependency
- `linkinator` as a `devDependency`. Version pinned by `pnpm add -D linkinator`
  (current major: 6.x; Node ≥ 20 satisfies its engine requirement).

### `scripts/check-links.ts` (entrypoint, run via tsx)
Responsibilities — orchestration only:
1. Import `base` from `astro.config.mjs` (DRY; no hardcoded slug).
2. Spawn `astro preview` on a port (default 4321, overridable via env var).
   Spawn `detached` so the whole process group can be killed cleanly.
3. Poll `http://localhost:<port><base>/` with global `fetch` until it responds
   (200) or a timeout (~30 s) elapses.
4. Run `new LinkChecker().check({ path, recurse: true, linksToSkip })`.
5. Filter `links` to `state === 'BROKEN'`; print each as `url` + `parent`
   (the page it was found on) + `status`.
6. In a `finally`, kill the preview process group (so no orphan `astro preview`
   survives in CI).
7. Exit non-zero when any broken link is found.

### `scripts/lib/link-check.ts` (pure, testable helpers)
- `EXTERNAL_SKIP` — the skip regex string (`^(?!http://localhost)`), and/or a
  `isExternal(url, origin)` predicate.
- `selectBroken(links)` — filter to broken links.
- `formatReport(broken)` — render the human-readable report string.

Keeping these pure isolates the only logic worth unit-testing from the
process-spawning orchestration.

### `package.json` scripts
- `"check:links": "tsx scripts/check-links.ts"`
- `"verify": "pnpm build && pnpm check:links"` (local one-shot convenience)

### `.github/workflows/ci.yml` (new workflow)
```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  links:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: pnpm/action-setup@v5
      - uses: actions/setup-node@v6
        with: { node-version: 24, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm check:links
```
The `check:links` step starts and tears down the preview itself, so the step is
a single command. Blocks merge on PRs and `push` to `main`. `deploy.yml` is left
untouched.

### Docs
- Add `pnpm check:links` to the **Common Commands** table in `CLAUDE.md`.

## Testing

`scripts/lib/__tests__/link-check.test.ts` (vitest; include glob is
`scripts/**/__tests__/**/*.test.ts`):
- skip predicate ignores external URLs and keeps `localhost` ones;
- `selectBroken` returns only `state === 'BROKEN'`;
- `formatReport` renders url/parent/status legibly.

Orchestration (spawn preview, poll, crawl, teardown) is integration-level and is
exercised by the CI run itself, not unit-tested.

## Known risks and escape hatches

- **Pre-existing breakage in the generated `reference/api/` tree**: linkinator
  validates those ~140 TypeDoc files too. The first run will most likely surface
  broken links that already exist there. That is signal, not a checker fault.
  Two responses: fix at source (`pnpm sync`) or add the offending URL pattern to
  `linksToSkip`. Decide per finding when the first run lands.
- **Port already in use locally**: port is env-configurable; CI runners are
  clean.
- **Orphan preview process**: mitigated by `detached` spawn + process-group
  kill in `finally`.

## Out-of-scope / future enhancements
- Anchor (`#fragment`) validation via `lychee` or linkinator fragment support.
- Optional non-blocking external-link audit on a schedule.
