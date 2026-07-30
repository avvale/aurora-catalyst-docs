---
title: Harness lifecycle
description: The five points of a Claude Code session where the Aurora harness runs something — what fires, in what order, with what timeout, and what each one is allowed to do.
---

The deterministic layer of the harness is wired to exactly five moments of a session. All of them are declared in `.claude/settings.json`, and Claude Code runs them — the assistant has no say in it.

Knowing these five points is what turns "the harness does things" into a model you can reason about. This page walks them in order.

## The five trigger points

| # | Trigger point | When it fires | Can it block? |
| --- | --- | --- | --- |
| 1 | `SessionStart` | once, when a session starts | no |
| 2 | `InstructionsLoaded` | once per instruction file loaded | no |
| 3 | `UserPromptSubmit` | on every prompt you send | yes |
| 4 | `PreToolUse` | before a matching tool call runs | yes |
| 5 | `PostToolUse` | after a matching tool call completes | yes |

## 1. `SessionStart` — preparing the ground

Two separate entries fire here, distinguished by their matcher.

Under matcher `startup`, four commands run in declaration order:

| Order | Command | Timeout | What it does |
| --- | --- | --- | --- |
| 1 | `generate-skills-index.ts` | 30 s | scans every `.claude/` in the repo and rewrites the `[Project Skills Index]` block inside each `CLAUDE.md` |
| 2 | `daily-tip.sh` | 5 s | surfaces one tip from a rotating list |
| 3 | `catalyst-dev-mode.sh` | 5 s | injects the active development mode, Framework or Solution |
| 4 | `check-required-plugins.ts` | 15 s | verifies the required plugins are installed **and** enabled |

The first one is worth pausing on. The skills index is not written by hand: it is regenerated at every startup from what is actually on disk. That is why the index cannot drift from reality — but also why editing it by hand is pointless.

Under matcher `startup|clear`, a fifth command wipes `.claude/.cache/`. That directory holds per-session state, and starting fresh — or clearing the conversation — must start it empty.

`check-required-plugins` reads the *merged* runtime state through the Claude Code CLI rather than the settings files, because a user-level `false` overrides a project-level `true`, and only the merged view shows that. It never blocks: it reports and moves on.

## 2. `InstructionsLoaded` — observing what got loaded

Fires once for every instruction file the harness loads, with a `load_reason` that says why:

| `load_reason` | Meaning |
| --- | --- |
| `session_start` | loaded because the session began |
| `nested_traversal` | a scoped `CLAUDE.md` loaded because a file under its directory was read |
| `path_glob_match` | a rule loaded because a file matched its `paths:` globs |
| `include` | pulled in by another instruction file |
| `compact` | reloaded after a conversation compaction |

The hook wired here, `instructions-loaded-log.ts`, appends one line per load to `.claude/.cache/instructions-loaded.log`. It is **notification-only**: it cannot block the load and cannot inject context. Its output and exit code are ignored.

It exists as an instrument. Path rules are a mechanism, not a promise — without a record of what fired, "the rule is configured" quietly becomes "the rule works", and nobody can tell the difference.

### Why path rules exist at all

This trigger point explains a design decision that otherwise looks like duplication.

A scoped `CLAUDE.md` — say `backend/CLAUDE.md` — loads through `nested_traversal` when a file under `backend/` is read. But **it is not re-injected after a compaction**. A path rule is different: it is re-evaluated on every subsequent read that matches its globs.

That is why the `scope-*` rules route to the scoped `CLAUDE.md` instead of duplicating its content. The rule survives compaction and points at the canonical table; copying that table into the rule would create a second source of truth that drifts.

## 3. `UserPromptSubmit` — arming the prompt

`inject-prompt-context.ts` (15 s) runs on every prompt you send. It reads your prompt, matches it against the business-rule, harness-rule and skill-trigger catalogue indexes, and injects the relevant context before the assistant sees your message — in three separate blocks, in that order.

Budgets are deliberately separate: up to **3 business rules** and up to **3 harness rules**, at most 4 000 characters of body per rule. The separation matters — harness rules are constraints, business rules are domain memory, and letting them compete for the same three slots would mean a busy domain prompt silently starves the architectural constraints.

The third block, last and with its own budget of up to **3 skills**, scores the prompt against `.claude/skills-triggers-index.json` — the keywords a skill's own `SKILL.md` declares in `metadata.triggers`. Unlike the first two, it never injects a body: a `SKILL.md` runs to hundreds of lines, so the block writes a pointer instead (a path plus the matched terms) and leaves opening the file to the assistant. The same fail-open contract applies: an absent or malformed skill index means the block writes nothing.

Anything written to standard output at this trigger point is injected ahead of the prompt.

## 4. `PreToolUse` — the moment before a write

Two hooks are wired here, with different matchers and very different characters.

**`architecture-checkpoint.ts`** (matcher `Write`, 15 s) fires when a *new* file is about to be created in an architecturally significant location: the backend layers, a misplaced end-to-end spec, a bounded-context module in the frontend, the vendored Spartan UI, or the frontend framework layer. It surfaces the path classification, the relevant project-structure skill, and any governing rules.

It blocks exactly once per path per session — and it is a **nudge, not a gate**. See [enforcement levels](../enforcement/) for why that distinction is not a technicality.

**`harness-rules-content-guard.ts`** (matcher `Write|Edit|MultiEdit`, 15 s) is the real block. It reads the harness-rule index and, for every active rule declaring a detection pattern, checks whether the incoming content contains that pattern *and* the target file falls under that rule's governed paths. If both hold, the write is blocked and the rule's message is shown.

It knows no rule by hand. Adding a mechanical rule is a catalogue edit, never a hook edit.

## 5. `PostToolUse` — cleaning up after a write

Both hooks here share the matcher `Write|Edit|MultiEdit` and run after the file is on disk.

**`format-with-prettier.ts`** (30 s) formats what was just written — but only under `backend/` and `frontend/`, and only for code extensions. The restriction is deliberate: those are the workspaces where Prettier resolves its binary and its plugins, and the rest of the repo holds catalogues and Markdown that must not be reformatted. If Prettier fails — mid-refactor invalid syntax, for instance — the hook exits cleanly and the flow continues.

**`lint-barrels.ts`** (30 s) lints the imports of the file just written against the barrel rules. One is informational, one blocks. It runs here rather than only at commit time because a pre-commit check works in batches, long after the decision was made; this closes the loop on the individual edit.

## The status line is not a trigger point

`status-line.sh` is configured separately, outside the `hooks` block. It re-renders continuously to display session state — including the active development mode. It is not tied to any lifecycle event, which is why it does not appear among the five.

In short: one point prepares the session, one observes what loaded, one arms each prompt, one guards the write, and one cleans up after it. Everything the harness does mechanically happens at one of those five moments.
