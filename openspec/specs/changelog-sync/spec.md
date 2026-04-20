# changelog-sync Specification

## Purpose

Produce a curated, bilingual changelog of user-facing changes drawn from the openspec archives of the Aurora Catalyst sibling repos. Archived changes are detected deterministically, classified against a fixed user-facing-impact contract (publish only new APIs, new flows, breaking changes, and deprecations; dismiss internal refactors, performance tweaks, and bug fixes), drafted in English and Spanish for those that qualify, and recorded in a versioned decision registry. Idempotent re-runs, manual overrides in either direction, and semver-grouped presentation keep the resulting `/changes/` section useful for developers learning or upgrading, without polluting it with implementation noise.

## Requirements
### Requirement: Detection of new archived changes

The sync script SHALL, for every configured source repo, enumerate the directories under that repo's `openspec/changes/archive/` and determine which slugs are not yet present in `scripts/changelog-registry.json`. Only slugs absent from the registry SHALL be treated as candidates for classification.

#### Scenario: New slugs are detected

- **WHEN** the source repo has archived changes `A`, `B`, and `C`, and the registry contains only `A`
- **THEN** the script reports `B` and `C` as new, and `A` is ignored

#### Scenario: No new slugs

- **WHEN** every archive slug is already present in the registry
- **THEN** the script reports zero new changes and the skill exits without invoking the LLM

#### Scenario: Multiple source repos

- **WHEN** two source repos are configured (e.g. `cli` and `framework`)
- **THEN** detection runs independently per repo and results are grouped under their respective registry keys

### Requirement: Classification against the user-facing-impact contract

For every new change, the skill SHALL pass the contents of the archive's `proposal.md` to the LLM together with the classification contract and receive a decision of `publish` or `dismiss`. The LLM SHALL NOT read `design.md` or `tasks.md` during classification.

#### Scenario: Classify a new feature as publish

- **WHEN** the proposal describes introducing a new CLI command `aurora deploy`
- **THEN** the LLM returns `{ status: "publish", classification: "feature", reason: "<...>" }`

#### Scenario: Classify an internal performance tweak as dismiss

- **WHEN** the proposal describes improving the hash algorithm used internally by the diff engine
- **THEN** the LLM returns `{ status: "dismiss", reason: "internal performance improvement, not user-facing" }` and no `classification` is set

#### Scenario: Classify a breaking change as publish with correct tag

- **WHEN** the proposal describes renaming a public decorator
- **THEN** the LLM returns `{ status: "publish", classification: "breaking", reason: "<...>" }`

### Requirement: Bilingual authoring for published changes

For every change classified as `publish`, the skill SHALL generate two Markdown files — one at `src/content/docs/en/changes/<repo>/<slug>.md` and one at `src/content/docs/es/changes/<repo>/<slug>.md` — drafted from `proposal.md` and `specs/<capability>/spec.md` of the source archive. The Spanish file SHALL follow the repo's tuteo-neutral convention.

#### Scenario: English and Spanish pages are produced together

- **WHEN** a change is classified as publish
- **THEN** both `en/changes/cli/<slug>.md` and `es/changes/cli/<slug>.md` exist after the run

#### Scenario: Only proposal and spec feed the LLM

- **WHEN** the LLM authors an entry
- **THEN** it has been given the archive's `proposal.md` and `specs/<capability>/spec.md` content, and has not been given `design.md` or `tasks.md`

#### Scenario: Spanish entry uses tuteo neutral

- **WHEN** the Spanish entry is produced
- **THEN** it uses forms such as "tú", "aquí", "empieza" and avoids voseo forms like "vos", "acá", "empezá"

### Requirement: Frontmatter metadata on every published entry

Each generated entry Markdown file SHALL include frontmatter with at least `title`, `date`, `classification`, `source_commit`, and `source_archive_url`. The `version` key SHALL be resolved at entry-write time from the source repo's tags and SHALL default to `"Unreleased"` when no tag contains the source commit.

#### Scenario: Entry inside a tagged version

- **WHEN** the archive commit is contained by the tag `v5.0.3`
- **THEN** the entry frontmatter has `version: "v5.0.3"`

#### Scenario: Entry with no containing tag

- **WHEN** no tag in the source repo contains the archive commit
- **THEN** the entry frontmatter has `version: "Unreleased"`

#### Scenario: Frontmatter keys are present

- **WHEN** an entry is generated
- **THEN** its frontmatter includes `title`, `date`, `classification`, `source_commit`, `source_archive_url`, and `version`

### Requirement: Persistent decision registry

Every classification decision, whether `publish` or `dismiss`, SHALL be recorded in `scripts/changelog-registry.json`, keyed by `<repo>/<slug>`. The registry SHALL be versioned in this repository. For `published` entries, the registry SHALL store `classification`, `classified_at`, `source_commit`, and `override`. For `dismissed` entries, the registry SHALL store `reason`, `classified_at`, `source_commit`, and `override`; it SHALL NOT store `classification`.

#### Scenario: Published entry registry shape

- **WHEN** a change has just been published
- **THEN** its registry entry has `status: "published"`, a non-null `classification`, an ISO 8601 `classified_at`, the `source_commit` SHA, and `override: null`

#### Scenario: Dismissed entry registry shape

- **WHEN** a change has just been dismissed
- **THEN** its registry entry has `status: "dismissed"`, a non-empty `reason`, an ISO 8601 `classified_at`, the `source_commit` SHA, and `override: null`, and no `classification` key

#### Scenario: Registry is not touched for already-processed slugs

- **WHEN** the script runs and every archived slug is already in the registry
- **THEN** the registry file is not rewritten

### Requirement: Bidirectional manual override

The skill SHALL accept a user instruction to change the status of an already-processed change from `published` to `dismissed`, or from `dismissed` to `published`. On override, the pipeline SHALL re-run classification and (for publish) authoring, and SHALL record the override in the registry.

#### Scenario: Force-publish a previously dismissed change

- **WHEN** the user instructs the skill to publish `<slug>` that is currently `dismissed`
- **THEN** the skill re-runs classification and authoring, writes EN + ES entries, sets `status: "published"` in the registry, and sets `override: { by: "user", at: "<date>", previous_status: "dismissed" }`

#### Scenario: Force-dismiss a previously published change

- **WHEN** the user instructs the skill to dismiss `<slug>` that is currently `published`
- **THEN** the skill deletes the EN and ES entry files, sets `status: "dismissed"` with a `reason` in the registry, and sets `override: { by: "user", at: "<date>", previous_status: "published" }`

#### Scenario: Override survives a subsequent sync run

- **WHEN** a slug has `override: { ... }` set and the sync runs again
- **THEN** the override is preserved and the registry keeps the current status

### Requirement: Semver-grouped index with Unreleased fallback

An index page at `/changes/cli/` (and per locale) SHALL list every `published` entry grouped by the `version` frontmatter, with an `Unreleased` bucket at the top for entries whose `version` is `"Unreleased"`. Within each group, entries SHALL be sorted by `date` descending.

#### Scenario: Unreleased bucket appears at top when non-empty

- **WHEN** at least one published entry has `version: "Unreleased"`
- **THEN** the index shows an `Unreleased` section above all tagged version sections

#### Scenario: Tagged versions appear in semver-descending order

- **WHEN** entries exist for versions `v1.0.0`, `v1.1.0`, and `v2.0.0`
- **THEN** the index lists `v2.0.0` above `v1.1.0` above `v1.0.0`

#### Scenario: Entries within a version are sorted newest-first

- **WHEN** three entries share `version: "v1.2.0"` with dates 2026-03-10, 2026-03-15, and 2026-03-18
- **THEN** the index lists them in order 2026-03-18, 2026-03-15, 2026-03-10

### Requirement: Re-grouping on new tags

When a new semver tag is published in a source repo, a subsequent sync run SHALL recompute the `version` frontmatter for every published entry from that repo and SHALL NOT re-invoke the LLM for entries already processed.

#### Scenario: Entries move out of Unreleased when a tag lands

- **WHEN** entries previously had `version: "Unreleased"` and the source repo now has a new tag `v5.1.0` that contains their `source_commit`
- **THEN** the sync rewrites their frontmatter to `version: "v5.1.0"` without calling the LLM

### Requirement: Configurable source repos

The pipeline SHALL support multiple source repos configured in a single location (flag, environment, or config file), and adding a new repo SHALL NOT require code changes to the script or skill beyond registering the repo key.

#### Scenario: Add a second source repo

- **WHEN** a developer registers a new source repo under key `framework`
- **THEN** subsequent sync runs produce entries under `src/content/docs/{en,es}/changes/framework/<slug>.md` and store decisions under the `framework` key in the registry

### Requirement: Separation from CLI commands and API sync

Changelog sync SHALL be a distinct command from the existing `pnpm sync` pipeline that regenerates `reference/cli-commands/` and `reference/api/`. Invoking changelog sync SHALL NOT modify `reference/cli-commands/` or `reference/api/`, and invoking `pnpm sync` SHALL NOT modify changelog entries or the registry.

#### Scenario: pnpm sync does not touch changelog artefacts

- **WHEN** the developer runs `pnpm sync`
- **THEN** `scripts/changelog-registry.json` is unchanged and no files under `changes/cli/` are created, modified, or deleted

#### Scenario: Changelog sync does not touch reference artefacts

- **WHEN** the developer invokes the changelog sync skill
- **THEN** files under `reference/cli-commands/` and `reference/api/` are unchanged

### Requirement: Dry-run mode

The skill SHALL support a dry-run mode that runs detection and classification and reports the outcome without writing to the registry, without creating or deleting entry files, and without running the authoring step.

#### Scenario: Dry-run reports decisions without side effects

- **WHEN** the skill is invoked in dry-run mode with three new candidate changes
- **THEN** the skill reports the proposed decisions for all three and the repository's working tree is unchanged

### Requirement: Consistency check between registry and entries

On every sync run, the script SHALL verify that every `published` entry in the registry has a corresponding Markdown file in both `en/` and `es/`, and that every entry file in those locations has a matching `published` entry in the registry. If any mismatch is found, the script SHALL fail with a report listing the discrepancies.

#### Scenario: Missing locale file is detected

- **WHEN** an EN entry file exists for a slug but its ES counterpart is missing
- **THEN** the sync fails and reports the missing file

#### Scenario: Orphan entry file is detected

- **WHEN** an entry file exists for a slug that has no `published` registry entry
- **THEN** the sync fails and reports the orphan file

