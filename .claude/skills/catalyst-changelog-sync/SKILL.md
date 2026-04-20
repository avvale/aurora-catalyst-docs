---
name: catalyst-changelog-sync
description: >
  Pull newly-archived openspec changes from the Aurora sibling repos, classify each
  one as PUBLISH or DISMISS against a user-facing-impact contract, draft bilingual
  changelog entries (EN + ES) for the ones that qualify, and persist every decision
  to the versioned registry. Supports dry-run and bidirectional manual override.
metadata:
  version: "0.1"
  trigger: "When the user wants to refresh /changes/ after new archives landed in aurora-catalyst-cli or aurora-catalyst, or to force an override on a single slug."
---

## When to use

The user wants to update `src/content/docs/{en,es}/changes/` after one or more archives landed in a sibling Aurora repo. Also use this skill when the user asks to:

- Preview what would change without writing anything (**dry run**).
- Force-publish a slug you previously dismissed (**override → publish**).
- Force-dismiss a slug you previously published (**override → dismiss**).

## When NOT to use

- Updating CLI command reference or TypeDoc API reference. Those live under `reference/cli-commands/` and `reference/api/` and are refreshed by `pnpm sync` — a pure deterministic script, no LLM involvement.
- Writing hand-curated tutorials, guides, or concept pages. Use `docs-from-spec` for that.
- Writing anything under `changes/` by hand. Every entry under `src/content/docs/{en,es}/changes/<repo>/<slug>.md` MUST be produced by this skill so the registry stays in sync.

## Invocation flags the user may ask for

| Intent                               | How to run                                                                                      |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Sync all repos, write everything     | (default)                                                                                       |
| Sync one repo only                   | `--source <slug>` (one of: `cli`, `catalyst`)                                                   |
| Dry run (no writes, just report)     | `--dry-run`                                                                                     |
| Force-publish a dismissed slug       | `--override publish --slug <slug> [--source <slug>]`                                            |
| Force-dismiss a published slug       | `--override dismiss --slug <slug> --reason "<one-line>" [--source <slug>]`                     |

These are semantic flags you interpret — they are NOT passed through to `pnpm sync:changelog`. The pnpm command only knows the subcommands below.

## The pnpm subcommands you have

```
pnpm sync:changelog detect [--source <slug>]
    Prints JSON array of DetectedChange. Run FIRST in a normal sync.

pnpm sync:changelog commit --decisions <path-to-json>
    Applies a decisions JSON file to the registry. On a publish→dismiss override
    it also deletes the EN + ES entry files for that slug.

pnpm sync:changelog check [--source <slug>]
    Consistency check — every 'published' entry must have EN + ES files, and
    every entry file must have a 'published' registry entry. Exits 1 on issues.

pnpm sync:changelog list [--status published|dismissed] [--source <slug>]
    Prints JSON of existing registry entries. Use this to look up a slug's
    current status when the user asks for an override.

pnpm sync:changelog resolve-tag <sha> --source <slug>
    Prints the containing semver tag, or "Unreleased".
```

## Standard sync process (no override)

Follow these steps in order. DO NOT skip.

### 1. Detect new changes

```bash
pnpm sync:changelog detect [--source <slug>]
```

Capture the JSON output. Each element has: `repo`, `slug`, `archiveAbsPath`, `files.proposal`, `files.specs[]`, `source_commit`, `version`.

If the array is empty → nothing to do. Tell the user and exit.

### 2. Classify each change

For every element, read `files.proposal` and apply the **classification contract** below. Never read `design.md` or `tasks.md` of the archived change — they bias toward implementation noise that does not reach the developer.

**Classification contract (verbatim from design.md §2)**

```
TASK: Classify each archived change as PUBLISH or DISMISS.

PUBLISH if the change introduces at least one of:
  - New public API (CLI command, decorator, exported helper, endpoint)
  - New user-facing flow (auth, sync, codegen, deploy)
  - Breaking change (signature change, rename, removal)
  - Deprecation (notice on existing public API)
  - New visible capability (support for X, integration with Y)

DISMISS if the change is solely:
  - Internal performance improvement (even if noticeable)
  - Bug fix (even one the developer suffered)
  - Internal refactor, private rename
  - Dependency bump with no functional impact
  - Tests, internal docs, tooling, CI

GUIDING RULE (tiebreaker): "Would a developer who just joined the project
learn something different about HOW TO USE the platform after this change?"
If the answer is NO → DISMISS.

OUTPUT per change:
  { "status": "publish" | "dismiss",
    "classification": "feature" | "breaking" | "deprecation" | null,
    "reason": "<one-line, honest, human-readable>" }
```

`classification` is null for dismiss decisions. `reason` is always required — for publish it summarises what shipped, for dismiss it names the kind of work.

### 3. Author bilingual entries for PUBLISH

Skip this step in `--dry-run`.

For each PUBLISH, read `files.proposal` AND every file in `files.specs[]` (the spec is the normative contract — it tells you the final behaviour). Then write two files:

- `src/content/docs/en/changes/<repo>/<slug>.md`
- `src/content/docs/es/changes/<repo>/<slug>.md`

Use this structure:

```markdown
---
title: "<Sentence-case, aim for <= 36 characters. A short, scannable label — the index lists titles in a dense list, anything longer wraps awkwardly. Describe the feature, not the benefit (the 'why' goes in the body). Use the full, active-voice phrasing in the description field, which has no length limit.>"
description: "<One-line summary, used by search and metadata. <= 160 chars.>"
date: <YYYY-MM-DD — take the DATE PREFIX from the slug; if the slug has none, use today.>
version: "<value of 'version' from detect output — a tag like 'v5.1.0' or the literal 'Unreleased'>"
classification: <feature | breaking | deprecation>
source_commit: "<source_commit value from detect>"
source_archive_url: "<https://github.com/<github>/<repo>/tree/<source_commit>/openspec/changes/archive/<slug>/>"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- <2-3 bullets, each a concrete user-visible change. Start with a verb.>
- <Bullet second change.>
- <Bullet third if needed; stop here, do not pad.>

## Why it matters

<One short paragraph (3-5 sentences). Focus on what the developer can now DO
that they couldn't before — or what they must adjust if it's breaking.
Drawn from the proposal's "Why" and the spec's scenarios, paraphrased.>

---

[View original proposal](<source_archive_url>)
```

Rules:

- No code blocks in "What changed" unless the change IS a new identifier worth quoting (e.g. a new decorator `@PreservationRegion` — backticks are fine). Prefer plain language.
- If `classification: breaking`, lead "What changed" with the breaking item and state the migration path in "Why it matters".
- NEVER quote the proposal verbatim. Rewrite in the reader's voice.
- Length: the whole body (excluding frontmatter) stays under ~200 words. A changelog entry that takes a minute to read has failed.

### 4. Write the Spanish version

The Spanish file is NOT a literal translation. Rewrite idiomatically in **neutral / international Spanish using tuteo**:

- Use: "tú", "aquí", "empieza", "cómo", "después".
- Avoid: "vos", "acá", "empezá" (Rioplatense voseo).
- Avoid: regional colloquialisms from any Spanish-speaking country.
- Technical identifiers stay in English (`@PreservationRegion`, `pnpm sync`).

Write the Spanish file AFTER the English one, but rewrite — do not auto-translate sentence by sentence.

Section titles translate to: "Qué cambió" (What changed), "Por qué importa" (Why it matters), and the footer link reads "Ver propuesta original" (View original proposal). The auto-generated blockquote becomes: `> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar \`catalyst-changelog-sync\`.`

### 5. Persist decisions

Build the decisions JSON in a temp file (use `$TMPDIR/changelog-decisions.json` or similar). Shape:

```json
[
  {
    "repo": "cli",
    "slug": "2026-04-18-preservation-regions",
    "status": "published",
    "classification": "feature",
    "source_commit": "79c30b8f...",
    "reason": "Introduces @PreservationRegion decorator for HTML templates."
  },
  {
    "repo": "cli",
    "slug": "2026-03-10-internal-hash",
    "status": "dismissed",
    "reason": "Internal performance improvement — new hash algorithm for the diff engine.",
    "source_commit": "abc1234..."
  }
]
```

Then:

```bash
pnpm sync:changelog commit --decisions <path-to-tmp-file>
```

Skip this step in `--dry-run` — instead print the decisions array to the user as a markdown table.

### 6. Verify consistency

```bash
pnpm sync:changelog check
```

If it exits non-zero, something got out of sync. Read the reported issues, fix them, re-run. Never commit with a failing check.

### 7. Report back to the user

Summarise:

- How many PUBLISH and DISMISS per repo.
- The titles of the new entries (linked to the files created).
- Any slugs that would have warranted a closer look (tiebreaker cases where you chose DISMISS but there's a reasonable argument for PUBLISH — flag them for user review).

## Override flow

The user says: *"include `<slug>` from the dismissed list"* (or equivalent) — OR — *"remove `<slug>`, it shouldn't be published"*.

### Override → PUBLISH (dismissed → published)

1. Run `pnpm sync:changelog list --status dismissed --source <slug>` to confirm the slug exists and grab its `source_commit`.
2. Locate the archive directory at `<sibling-repo>/openspec/changes/archive/<slug>/`. Read `proposal.md` and every `specs/<cap>/spec.md`.
3. Re-classify it applying the classification contract, but with the assumption that the user's judgement overrides — still decide `feature` / `breaking` / `deprecation`.
4. Author the EN + ES entry files exactly like a normal PUBLISH (step 3–4 above).
5. Build a decisions array with a SINGLE entry using the new status and classification. The `commit` command will detect the status change (`dismissed → published`) and record `override: { by: "user", ..., previous_status: "dismissed" }` automatically.
6. Run `pnpm sync:changelog commit --decisions <tmp>`.
7. Run `pnpm sync:changelog check`.

### Override → DISMISS (published → dismissed)

1. Run `pnpm sync:changelog list --status published --source <slug>` to confirm and grab `source_commit`.
2. Build a decisions array with a single entry: `status: "dismissed"`, `reason: "<what the user told you>"`, `source_commit: <existing>`. No `classification` field.
3. Run `pnpm sync:changelog commit --decisions <tmp>`. The commit command DELETES the EN + ES entry files automatically for publish→dismiss overrides — you do not delete them by hand.
4. Run `pnpm sync:changelog check`.

## Dry-run

`--dry-run` means: do steps 1 and 2 (detect + classify), then print the classification table to the user, and STOP. Do not author files. Do not invoke `commit`. Do not modify anything.

Output table shape:

```
| Repo | Slug                              | Decision | Class.    | Reason                                   |
| ---- | --------------------------------- | -------- | --------- | ---------------------------------------- |
| cli  | 2026-04-18-preservation-regions   | PUBLISH  | feature   | Introduces @PreservationRegion decorator |
| cli  | 2026-03-10-internal-hash          | DISMISS  | —         | Internal perf improvement                 |
```

The user may then ask to proceed for real, or to flip specific decisions before committing.

## Quality bar — before you report success

- [ ] Every PUBLISH has an EN file AND an ES file at the expected paths.
- [ ] Every frontmatter contains `title`, `description`, `date`, `version`, `classification`, `source_commit`, `source_archive_url`.
- [ ] `title` is concise — aim for ≤ 36 characters. If you need more words, put them in `description`.
- [ ] `date` matches the slug date prefix when present.
- [ ] `version` matches the value from `detect` (do not invent one).
- [ ] `source_archive_url` points to the real commit SHA (do not use `main`).
- [ ] Spanish file is idiomatic tuteo, not a literal translation.
- [ ] "What changed" bullets do NOT quote the proposal verbatim.
- [ ] Total body is ≤ ~200 words.
- [ ] `pnpm sync:changelog check` exits 0.

## What you MUST NOT do

- Write or edit the registry (`scripts/changelog-registry.json`) by hand. Only `pnpm sync:changelog commit` writes it — that's the atomic boundary.
- Read `design.md` or `tasks.md` of an archived change for classification or authoring. They are implementation-facing and bias the output.
- Delete an EN/ES entry file by hand. Overrides → dismiss delete via `commit`; anything else means the registry and filesystem got out of sync and you need to investigate before acting.
- Modify `scripts/import-from-sources.ts` or anything under `reference/cli-commands/` / `reference/api/`. That's a different pipeline.
- Machine-translate the Spanish entry.
- Guess version tags. Always use what `detect` returned — re-runs reshuffle Unreleased automatically when new tags land.

## Hand-off

When done, summarise in the response:

1. Count of PUBLISH and DISMISS per source repo.
2. The new entry titles + paths (so the user can open them quickly).
3. Any override recorded.
4. Confirmation that `pnpm sync:changelog check` exits 0.
5. Remind the user that `pnpm build` still needs to pass before merging — run it if you can, or say so explicitly.
