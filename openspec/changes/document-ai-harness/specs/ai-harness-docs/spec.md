## ADDED Requirements

### Requirement: Three-layer classification of every harness piece

The documentation SHALL classify every catalogued harness piece into exactly one of three layers: `deterministic` (the harness executes it — hooks and scripts), `contextual` (the harness loads it — `CLAUDE.md`, rules, skills, commands, agents), or `judgement` (the model applies it — Intent Gate, Task-Weight Triage, Worktree Gate, Quality Gates, delegation). The concepts entry page SHALL state the principle that assigns a piece to a layer: enforcement proportional to damage.

#### Scenario: A hook is catalogued

- **WHEN** a reader looks up `format-with-prettier` in the reference inventory
- **THEN** the entry identifies it as a `deterministic` piece and links back to the layer definition in the concepts entry page

#### Scenario: A judgement-layer mechanism is catalogued

- **WHEN** a reader looks up the Task-Weight Triage
- **THEN** it is presented as a `judgement`-layer mechanism, documented as applied by the model rather than executed by a script, with no lifecycle trigger point attributed to it

### Requirement: Complete lifecycle coverage with trigger points

The lifecycle page SHALL document all five trigger points declared in `.claude/settings.json` — `SessionStart`, `InstructionsLoaded`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse` — and for each one SHALL state which commands run, their declared execution order, their configured timeout, their matcher where one is declared, and whether the hook can block the action.

#### Scenario: Session startup is documented

- **WHEN** a reader consults the `SessionStart` section
- **THEN** it lists `generate-skills-index.ts` (30 s), `daily-tip.sh` (5 s), `catalyst-dev-mode.sh` (5 s) and `check-required-plugins.ts` (15 s) in declaration order under matcher `startup`, and separately the cache wipe under matcher `startup|clear`

#### Scenario: A blocking trigger point is distinguished from a non-blocking one

- **WHEN** a reader compares the `PreToolUse` and `InstructionsLoaded` sections
- **THEN** `PreToolUse` is documented as able to block the tool call via exit code 2, and `InstructionsLoaded` is documented as notification-only — unable to block and unable to inject context

### Requirement: Distinction between shipped and team-layer pieces

Every entry in the reference inventory SHALL be marked as either **shipped** (copied into a project created with `catalyst new`) or **team layer** (present only in the Aurora repositories). The marking SHALL reflect what the CLI actually copies.

#### Scenario: A shipped piece is marked

- **WHEN** a reader looks up any of the seven hooks or nine path rules
- **THEN** the entry is marked as shipped, because `catalyst new` copies the template `.claude/` directory recursively and excludes only `coverage`, `dist` and `node_modules`

#### Scenario: An externally-installed dependency is marked

- **WHEN** a reader looks up the required plugins
- **THEN** the entry states that the plugin declarations in `settings.json` travel with the project while the plugin installations themselves are per-user, and names the hook that checks for them at startup

### Requirement: Visual map with link-checkable navigation

The section SHALL provide a visual map component that emits real anchor elements in the built HTML, one per navigable node, each resolving to the entry of that piece in the reference inventory. The map SHALL NOT rely on client-rendered diagram click handlers for navigation.

#### Scenario: Map links survive the link checker

- **WHEN** `pnpm build` followed by `pnpm check:links` runs over the site
- **THEN** every link emitted by the map is crawled as part of the static HTML and no internal link is reported broken

#### Scenario: A node leads to its definition

- **WHEN** a reader activates the `inject-rules-context` node on the map
- **THEN** the browser navigates to that piece's entry in the reference inventory page

### Requirement: Locale-correct map rendering

The map component SHALL render its labels and its link targets for the locale of the page that mounts it, from a single shared geometry definition. Adding or correcting a label MUST NOT require editing the geometry.

#### Scenario: The map is mounted on the Spanish page

- **WHEN** the map renders inside `src/content/docs/es/concepts/harness/index.mdx`
- **THEN** its labels are the Spanish strings and every link target resolves under the `/es/` locale prefix

#### Scenario: The map is mounted on the English page

- **WHEN** the map renders inside `src/content/docs/en/concepts/harness/index.mdx`
- **THEN** its labels are the English strings and every link target resolves under the `/en/` locale prefix

### Requirement: Bilingual parity and Diátaxis containment

Every page added by this change SHALL exist at the same path under both `src/content/docs/en/` and `src/content/docs/es/`, and SHALL live under an existing Diátaxis category. No new top-level content category SHALL be created.

#### Scenario: Locale parity holds

- **WHEN** the set of files under `src/content/docs/en/concepts/harness/` and `src/content/docs/en/reference/harness/` is compared with the corresponding `es` paths
- **THEN** the two sets contain the same relative paths, with no file present in one locale only

#### Scenario: No category is invented

- **WHEN** the new pages are placed in the tree
- **THEN** they fall under `concepts/` and `reference/`, and the sidebar exposes them as subgroups of the existing `Concepts` and `Reference` groups
