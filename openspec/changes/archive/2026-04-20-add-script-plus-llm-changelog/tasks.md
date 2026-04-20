## 1. Scaffolding and configuration

- [x] 1.1 Decide the final source-repo configuration shape. **Resolved**: reuse the `SOURCES` array from `scripts/import-from-sources.ts`, extracted to a shared module. Add `pnpm sync:changelog` alongside `pnpm sync` (which shrinks to CLI + API only).
- [x] 1.2 Add the new `pnpm sync:changelog` command to `package.json`, add `pnpm test` backed by vitest, and update the commands table in `CLAUDE.md`.
- [x] 1.3 Create `scripts/changelog-registry.json` initialised as `{}` and commit it.
- [x] 1.4 No-op. Verified `.gitignore` does not exclude `src/content/docs/{en,es}/changes/` today — entries are already committed normally.
- [x] 1.5 Extract `SOURCES` (and any shared path/label helpers) from `scripts/import-from-sources.ts` into `scripts/lib/sources.ts` and update the importer to consume it.
- [x] 1.6 Remove the archive-mirror logic from `scripts/import-from-sources.ts` and drop the now-unused `--skip-archives` flag. Old mirrored files are deleted in task 7.4 under the explicit gate.
- [x] 1.7 Add `vitest` as a devDependency and a `vitest.config.ts` at the repo root.

## 2. Deterministic detection script

- [x] 2.1 Implement a script module that, given a source repo path and key, lists the slugs under `openspec/changes/archive/`.
- [x] 2.2 Implement the registry loader and diff: return only slugs whose `<repo>/<slug>` key is not present in `scripts/changelog-registry.json`.
- [x] 2.3 Implement the semver-tag resolver: for a given archive commit, return the first tag via `git tag --contains <sha> --sort=v:refname | head -1`, falling back to `"Unreleased"`.
- [x] 2.4 Implement the atomic registry writer that takes decision payloads and persists them with `classified_at` timestamps, `source_commit`, and `override` fields according to the spec.
- [x] 2.5 Implement the consistency check: every `published` registry entry has EN + ES files, and every EN/ES file has a matching `published` entry; mismatches fail loudly.
- [x] 2.6 Add unit tests for detection, tag resolution, registry read/write, and the consistency check.

## 3. Skill: classification and authoring

- [x] 3.1 Create the skill scaffold under `.claude/skills/catalyst-changelog-sync/` (SKILL.md + any helper scripts).
- [x] 3.2 Encode the classification contract exactly as written in `design.md` §2, with output schema `{ status, classification, reason }`.
- [x] 3.3 Implement the classification step: for each new change, load its `proposal.md`, run it through the LLM with the contract, and collect the decisions.
- [x] 3.4 Implement the authoring step for `publish` decisions: load `proposal.md` and `specs/<capability>/spec.md`, draft EN + ES Markdown files with the frontmatter defined in the spec, and write them to `src/content/docs/{en,es}/changes/<repo>/<slug>.md`.
- [x] 3.5 Pin the Spanish convention (tuteo neutral) in the authoring prompt, aligned with project rules.
- [x] 3.6 Wire the dry-run flag so detection + classification run without writing to the registry or the filesystem.

## 4. Override flow

- [x] 4.1 Extend the skill to accept a "force publish `<slug>`" instruction that flips a dismissed entry to published, re-runs classification + authoring, and records `override.previous_status: "dismissed"`.
- [x] 4.2 Extend the skill to accept a "force dismiss `<slug>`" instruction that deletes the EN + ES entry files, flips the registry to dismissed with a reason, and records `override.previous_status: "published"`.
- [x] 4.3 Ensure `override` is preserved across subsequent non-override runs. (Handled by `resolveOverride` in `scripts/changelog-sync.ts`: when a non-override `commit` keeps the same status, the existing `override` record is preserved.)

## 5. Index page and content templates

- [x] 5.1 Define the Astro content-collection schema for changelog entries, including `title`, `date`, `version`, `classification`, `source_commit`, `source_archive_url`. (See `src/content.config.ts` — extended via `docsSchema({ extend: ... })` with all fields optional so plain docs are unaffected.)
- [x] 5.2 Implement the index page at `src/content/docs/en/changes/cli/index.mdx` (and its ES counterpart) that reads the collection, groups by `version`, places `Unreleased` at the top, orders tagged versions semver-descending, and orders entries within a version by `date` descending. (Shared `src/components/ChangelogIndex.astro` component; `catalyst/index.mdx` created symmetrically.)
- [x] 5.3 Implement the per-entry layout (title, date, classification badge, "what changed" bullets, link to source archive on GitHub). (Title + body come from Starlight defaults; classification badge surfaces on the index page; the `[View original proposal](<source_archive_url>)` footer link is part of the body template in `SKILL.md`.)
- [x] 5.4 Add a standard header note to generated entries indicating they are produced by the skill (informational, not enforced). (Blockquote `> Auto-generated from the source archive…` included in `SKILL.md` body template in both locales.)

## 6. Documentation

- [x] 6.1 Update `CLAUDE.md` so the Skills table references `catalyst-changelog-sync` and removes any claim that `changes/` is a raw mirror. Also updated the generation model table, the cross-repo flow diagram, the Rules section, and the Common Commands table (added `pnpm test`, `pnpm sync:changelog` subcommands, dropped stale `--cli-path` flag).
- [x] 6.2 Update `src/content/docs/en/changes/index.md` (and ES) to describe the new shape and link to the per-repo index pages.
- [x] 6.3 Document the override flow and dry-run flag in the skill's SKILL.md. (Covered in dedicated "Override flow" and "Dry-run" sections; also summarised in the "Invocation flags" table at the top.)

## 7. Migration of existing mirrored content

- [x] 7.1 Run the new skill in dry-run mode against `aurora-catalyst-cli` and share the proposed decisions with the user. (Surfaced `preservation-regions` + unexpectedly detected `adopt-storybook-component-catalog` in `aurora-catalyst`; user accepted the two proposed decisions without overrides.)
- [x] 7.2 Incorporate any overrides the user asks for during dry-run review. (None requested.)
- [x] 7.3 **GATE**: obtain explicit user confirmation before deleting the current mirror at `src/content/docs/{en,es}/changes/cli/2026-04-18-preservation-regions/`. (Granted; also covers the `catalyst` mirror found during the dry-run.)
- [x] 7.4 Delete the mirrored files (both locales) and update `src/content/docs/{en,es}/changes/index.md` and `changes/cli/index.md` so they no longer reference the old shape. (Deleted both mirror dirs, EN+ES, for `cli` and `catalyst`. Landings rewritten in task 6.2.)
- [x] 7.5 Run the skill for real, writing `scripts/changelog-registry.json` and the new entries in EN + ES. (Registry has `cli/2026-04-18-preservation-regions: published/feature` and `catalyst/2026-04-20-adopt-storybook-component-catalog: dismissed`. Consistency check passes; re-running `detect` returns `[]`.)

## 8. Validation

- [x] 8.1 Run `pnpm build` and confirm the link checker passes. (202 pages built, 0 errors, 0 warnings; `astro check` clean.)
- [x] 8.2 Manually open the new `/changes/cli/` index in dev to verify grouping, ordering, and the source-archive link. (Inspected the built HTML instead — `Unreleased` section appears, `Feature` badge rendered, per-entry page includes the "View original proposal" / "Ver propuesta original" footer linking to the correct source commit. No live browser session was run in this session.)
- [x] 8.3 Verify that `pnpm sync` (CLI commands and API) does not alter `scripts/changelog-registry.json` or any file under `changes/`. (SHA-256 comparison before / after: registry unchanged, every file under `changes/` unchanged.)
- [x] 8.4 Verify the consistency check fails when an EN or ES entry is intentionally deleted without updating the registry, and passes after running the sync. (Moved the ES entry aside → `check` reported `[MISSING]` and exited 1; restored the file → `check` reported `OK` and exited 0.)
- [x] 8.5 Confirm an override run correctly moves an entry between published and dismissed and updates the registry + filesystem accordingly. (Force-published the dismissed `catalyst/storybook` slug → registry recorded `override.previous_status: "dismissed"` and both locale files appeared; force-dismissed it back → registry recorded `override.previous_status: "published"` and the EN + ES files were deleted by `commit` automatically; final state restored from baseline.)
