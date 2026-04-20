## Context

Today, `src/content/docs/{en,es}/changes/` mirrors the openspec archive of sibling repos in full (proposal + design + tasks + spec files) for every archived change. A single change can produce 500+ lines of content that is useful for contributors reviewing the change in its original repo, but not for developers reading docs to learn what the platform now does differently. The first mirrored change (`2026-04-18-preservation-regions`) confirmed this: the generated pages are dense, duplicate internal decision-making, and hide actual user-visible novelties under spec boilerplate.

The predecessor repo `avvale/aurora-cli` has no `CHANGELOG.md` and publishes no GitHub Releases; its only semver tag today is `v5.0.2`. `aurora-catalyst-cli` is expected to follow the same tagging pattern. The docs site is therefore the first place a developer can reasonably consult for "what's new" — we should make that useful.

Two constraints shape the design:

- **No writes to sibling repos** (hard rule in `CLAUDE.md`). The docs repo is a consumer.
- **CI has no access to sibling repos.** Whatever should ship to production must be committed to this repo ahead of the deploy workflow.

## Goals / Non-Goals

**Goals:**

- A `/changes/cli/` section that a developer can scan in under a minute to see what's new, grouped by semver version.
- A deterministic pipeline for detecting which archived changes have been processed and which haven't, so each run is idempotent and incremental.
- LLM reasoning constrained to two explicit jobs: classification (publish vs dismiss) and authoring (EN + ES drafting from real archive content). Nothing invented.
- Bilingual output (English + Spanish using tuteo neutral, matching project convention) in the same run, committed together.
- Bidirectional manual override so a human can always correct the LLM.
- A structure that generalises to additional source repos (`aurora-catalyst` framework, future siblings) without redesign.

**Non-Goals:**

- Auto-publishing GitHub Releases or npm releases. Tagging happens in sibling repos; this repo only reads tags.
- Real-time sync. The flow is human-invoked, pre-commit.
- Mirroring `design.md` or `tasks.md` of archived changes. Only `proposal.md` and `specs/<capability>/spec.md` feed the LLM.
- Changing how `reference/cli-commands/` or `reference/api/` are synced — they remain deterministic script-only.
- Automatic translation review. The PR author is still expected to read the Spanish output.

## Decisions

### 1. Split the pipeline: deterministic script + LLM-driven skill

The script handles every step that can be pure data manipulation: listing archive directories, diffing against the registry, resolving semver tags, writing the registry after decisions are made. The skill handles classification and bilingual authoring — the only steps that need reasoning.

**Alternatives considered:**

- *All-script with templated output.* Rejected: drafting natural-language user-facing summaries from an openspec archive cannot be templated meaningfully. The entries would end up being slug + title only, which doesn't meet the "useful at a glance" goal.
- *All-skill.* Rejected: directory diffing, tag resolution, and registry writes are deterministic and should not consume LLM tokens or be subject to its non-determinism.

### 2. Classification contract encoded in the skill prompt

The LLM is given a fixed contract (see below) and asked to return a structured decision per change. The contract is versioned with the skill so that re-runs remain consistent.

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
If the answer is NO -> DISMISS.

OUTPUT per change:
  { "status": "publish" | "dismiss",
    "classification": "feature" | "breaking" | "deprecation" | null,
    "reason": "<one line>" }
```

**Alternatives considered:**

- *Classification by tag or frontmatter in the archive.* Rejected: requires writing to the sibling repo, which violates the hard constraint. Also makes the CLI author responsible for docs curation, which is not their concern.
- *Human classification via PR checklist.* Rejected: the whole point is to offload triage to the LLM so the human reviews fewer, already-drafted entries.

### 3. LLM reads only `proposal.md` and the spec files, not `design.md` / `tasks.md`

The proposal gives the user-level narrative (why + what). The spec gives the final behaviour to document. `design.md` and `tasks.md` are internal-facing and would pollute the prompt with implementation discussion, biasing the classifier toward details that don't reach the developer.

### 4. Registry at `scripts/changelog-registry.json`

The registry is versioned in this repo, lives next to the script that owns it, and is outside the Astro content collection so Starlight doesn't treat it as a content file.

Shape (top-level keyed by source repo):

```json
{
  "cli": {
    "2026-04-18-preservation-regions": {
      "status": "published",
      "classification": "feature",
      "classified_at": "2026-04-20T09:00:00Z",
      "source_commit": "a217885...",
      "override": null
    },
    "2026-04-15-hash-speedup": {
      "status": "dismissed",
      "reason": "internal performance improvement, not user-facing",
      "classified_at": "2026-04-20T09:00:00Z",
      "source_commit": "abc1234...",
      "override": null
    },
    "2026-04-08-render-perf": {
      "status": "published",
      "classification": "feature",
      "classified_at": "2026-04-20T10:15:00Z",
      "source_commit": "def5678...",
      "override": {
        "by": "user",
        "at": "2026-04-20",
        "previous_status": "dismissed"
      }
    }
  }
}
```

Rules:

- `classification` is written only for `status: "published"` entries. On re-publish via override, the LLM re-classifies.
- `source_commit` is stored for auditability and to resolve semver tags at index-build time.
- `override` is null except when the user forced the decision. Overrides survive future runs.
- Keys are `<repo>/<slug>`; adding `aurora-catalyst` later is a new top-level object.

**Alternatives considered:**

- *Registry under `src/content/docs/changes/.processed.json`.* Rejected: risks being parsed by Starlight's content collection. Dotfiles are usually skipped but relying on that is fragile.
- *Registry under `.cache/`, not versioned.* Rejected: CI re-processes everything and loses decisions.
- *Registry in frontmatter of the generated entries only.* Rejected: loses dismissed changes (they have no generated entry to attach frontmatter to), breaking idempotency.

### 5. Semver grouping via `git tag --contains` with `Unreleased` fallback

For each archived change, the script runs (in the source repo):

```
git tag --contains <archive_commit> --sort=v:refname | head -1
```

The first tag whose history contains the archive commit is the version that shipped that change. If no tag contains it, the change belongs to `Unreleased` and will be relocated in a future run when a new tag is published.

The tag is resolved at **index-build time**, not at classification time, and is stored in the generated entry's frontmatter as `version: "v5.0.3"` (or `version: "Unreleased"`). Re-running the sync after a new tag lands is enough to move entries from `Unreleased` to the correct version bucket without re-invoking the LLM.

**Alternatives considered:**

- *Chronological grouping by archive date.* Rejected: less informative for a developer who wants to know what's in a specific version they installed.
- *Pinning each change to a version at classification time.* Rejected: the archive commit often lands before the version tag exists. We'd freeze incorrect versions.

### 6. Content collection for entries, Astro-rendered index

Each published change becomes a Markdown file in `src/content/docs/{en,es}/changes/cli/<slug>.md` with frontmatter including `title`, `date`, `version`, `classification`, `source_commit`, `source_archive_url`. The index at `src/content/docs/{en,es}/changes/cli/index.mdx` is an Astro page that reads the content collection, groups by `version`, and renders.

This keeps the registry minimal (decision metadata only) and makes the rendered index a function of the content, not of the registry.

### 7. Bidirectional override

The skill accepts two instruction shapes from the user:

- *Include a dismissed change*: move registry entry to `status: "published"`, re-run classification + authoring, write entries, record the override with `previous_status: "dismissed"`.
- *Exclude a published change*: delete the generated EN + ES entries, move registry entry to `status: "dismissed"`, record the override with `previous_status: "published"`.

Both pass through the same script boundaries. The override flag makes re-runs respect the human decision.

### 8. Deletion of the current mirror is gated on explicit user confirmation

The single mirrored change today (`2026-04-18-preservation-regions`) lives at a URL that is technically a contract per `CLAUDE.md`. The migration task list includes an explicit gate: do not delete until the user confirms in the apply phase.

## Risks / Trade-offs

- **LLM misclassification in both directions** → Mitigation: reason is always stored; the override flow is first-class; PR review is expected. The risk skews toward DISMISS-when-it-should-PUBLISH, which the user sees immediately when scanning the index; the reverse is caught in PR review.
- **Spanish drift from tuteo neutral convention** → Mitigation: classification-and-authoring prompt pins the convention; PR reviewer confirms before merge. Long-term we can add a lint step.
- **Registry and generated pages drift out of sync** (e.g. someone deletes a page but leaves the registry alone) → Mitigation: script validates, on each run, that every `published` entry has a corresponding page in both locales and fails loudly if not.
- **Source archive is rewritten after publication** (slug renamed, contents edited) → Mitigation: the slug is the primary key. A slug rename would look like a new change; an edit goes unnoticed. Acceptable for v1 — flag with manual override if it matters.
- **Source repo has no tags at all** → Everything stays in `Unreleased`. Not a functional issue, but the index lacks structure. Acceptable; resolves itself the moment the first tag lands.
- **Developer skips the skill and edits entries manually** → Entries drift from the archive's source of truth. Mitigation: header note in each generated file that it is produced by the skill; treat as informational, not enforced.
- **Adding a second source repo requires coordination** → The config layer expects stable keys (`cli`, future `framework`, etc.) so a new repo is a config entry plus a top-level key in the registry. Low risk if the naming is disciplined.

## Migration Plan

1. Ship the script + skill + content templates + index page. No existing content is touched yet.
2. Run the skill in "dry-run" mode against the current archive to preview classifications without writing.
3. User reviews the dry-run output; adjusts classification contract or overrides if needed.
4. **Gate**: user explicitly confirms deletion of `src/content/docs/{en,es}/changes/cli/2026-04-18-preservation-regions/` and its counterparts in `changes/index.md` + `changes/cli/index.md`.
5. Run the skill for real. It writes the registry, the new entries in EN + ES, and the index.
6. PR reviewed, merged, deployed via existing GitHub Pages workflow.

Rollback: revert the PR. Registry and generated pages live together so a single revert returns the site to the pre-migration state.

## Resolved Questions

- **Source repo configuration**: reuse the existing `SOURCES` array in `scripts/import-from-sources.ts` as the single source of truth. Extract it to a shared module consumed by both the existing importer and the new changelog helper script. Add a new `pnpm sync:changelog` command that invokes the skill; `pnpm sync` shrinks to CLI commands + API only and drops the now-obsolete `--skip-archives` flag (archive mirroring logic is removed entirely).
- **Index grouping within `Unreleased`**: newest-first by `date`, same rule as within every tagged version.
- **Link back to source archive on GitHub**: yes. Stored in frontmatter as `source_archive_url` (pointing at `https://github.com/avvale/<repo>/tree/<commit>/openspec/changes/archive/<slug>/`) and rendered as a "View original proposal" link at the bottom of each entry page.
- **Dismissed decisions in the UI**: no, internal registry only for v1. Revisit if a developer asks "why isn't X in the changelog".
- **Per-repo filter on the skill**: the skill accepts `--source <slug>` matching the semantics of today's `pnpm sync --source <slug>`, so a single repo can be processed in isolation.
- **Unit-test strategy**: adopt `vitest` as the test runner. Unit-test the deterministic helpers (detection, tag resolution, registry I/O, consistency check). The LLM-driven steps remain validated through the block 8 manual verification.
