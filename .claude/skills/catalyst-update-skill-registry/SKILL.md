---
name: catalyst-update-skill-registry
description: >
  Regenerates the project's skill catalog at `.claude/skills/REGISTRY.md` by scanning every
  SKILL.md under `.claude/skills/` and grouping the entries by type. Trigger: IMMEDIATELY after
  creating, editing, deleting, or renaming ANY SKILL.md in the project — even if the user does
  not ask explicitly — because a stale registry lies to the next Claude and breaks skill
  discovery. Also trigger whenever the user mentions "update the registry", "regenerate the
  catalog", "skill catalog", "skill index", or anything related to the inventory of skills,
  EVEN IF they don't use the word "registry".
license: MIT
metadata:
  author: aurora
  version: '1.0'
  auto_invoke: 'After creating/editing/deleting a SKILL.md; when user asks to update the skill registry'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

## When to Use

- You have just created a new `SKILL.md` under `.claude/skills/`
- You have just edited the `name`, `description`, or trigger of an existing `SKILL.md`
- You have just deleted or renamed a skill
- The user asks to "update the registry", "regenerate the skill catalog", or similar

**STOP if you are not sure** which skills changed. Scan first, do not assume.

## Critical Patterns

### 1. Type-first taxonomy

All skills live under a single location (`.claude/skills/`), so the REGISTRY is organized by
**type** only. Type comes from the skill's function, not its filename prefix.

| Subcategory | Fits |
| --- | --- |
| **Docs automation** | Skills that author content under `src/content/docs/` from external sources (sibling-repo archives, auto-generated reference, changelog entries) |
| **Workflow — OpenSpec SDD** | Skills that drive the openspec propose / apply / archive / explore loop |
| **Meta** | Skills that operate on the skill ecosystem itself (this one) |

**Do NOT change the taxonomy without reason.** If a new skill does not fit an existing
subcategory, STOP and ask the user before inventing a new one. Subcategories are UX for humans,
and arbitrary ones fragment the mental model.

### 2. Exclude this skill from self-processing

`catalyst-update-skill-registry` must appear under the `Meta` subcategory, but do NOT
self-duplicate logic by scanning itself multiple times. Include it exactly once.

### 3. Trigger formatting

Extract from the frontmatter `description` the text after `Trigger:` if present. Otherwise, use
the full description text. Keep it concise (1-2 lines).

### 4. Preserve the preamble

The REGISTRY preamble (title, "How to use", sync rule) is preserved across regenerations. Only
the tables change.

## Procedure

### Step 1 — Scan SKILL.md files

Use Glob on `.claude/skills/*/SKILL.md` and Read each file. Equivalent shell survey:

```bash
for f in .claude/skills/*/SKILL.md; do
  echo "=== $f ==="
  awk '/^---$/{c++; next} c==1{print}' "$f"
done
```

Extract for each skill:

- `name` (from frontmatter)
- `description` (from frontmatter, the narrative part)
- Trigger (the text after `Trigger:` inside `description`)

### Step 2 — Classify

For each skill, pick a subcategory from the table in Critical Patterns §1. Use the skill's
function, not its filename prefix. If a skill does not fit, STOP and ask the user before
inventing a new subcategory.

### Step 3 — Write REGISTRY.md

Write `.claude/skills/REGISTRY.md` using exactly this template (preserving the preamble):

```markdown
# Skill Registry — Aurora Catalyst Docs

A navigable catalog of the project's skills, organized by **type**. Each `SKILL.md` is the
source of truth — this file is only the index.

**Sync rule**: after creating, editing, or deleting any skill, regenerate this file so it
reflects the real state.

## How to use this registry

1. Identify the category that matches your task (docs automation, openspec workflow, meta)
2. Locate the applicable skill under that heading
3. Read the `SKILL.md` BEFORE writing code
4. Multiple skills may apply at once — read them all and combine their rules

---

## Docs automation

Author content under `src/content/docs/` from external sources (sibling-repo archives,
auto-generated reference, changelog entries).

| Skill | Trigger | Path |
| --- | --- | --- |
| `{name}` | {trigger} | `.claude/skills/{name}/SKILL.md` |

---

## Workflow — OpenSpec SDD

Drive the openspec propose / apply / archive / explore loop.

| Skill | Trigger | Path |
| --- | --- | --- |
| `{name}` | {trigger} | `.claude/skills/{name}/SKILL.md` |

---

## Meta

Operate on the skill ecosystem itself.

| Skill | Trigger | Path |
| --- | --- | --- |
| `{name}` | {trigger} | `.claude/skills/{name}/SKILL.md` |
```

### Step 4 — Verify

After writing the REGISTRY:

1. Count SKILL.md files: `eza .claude/skills/ | wc -l`
2. Count entries in the generated REGISTRY (one per row)
3. The numbers must match (each existing SKILL.md = one entry in the registry)
4. If there is a mismatch, investigate before marking the task complete

## Rules

- Keep a subcategory section even when it feels redundant, unless a skill has actually
  disappeared from the filesystem. Removing a section may delete navigational context that
  other entries still lean on.
- Do not invent new subcategories on the fly. If a new skill doesn't fit an existing one, ask
  the user first — subcategories are UX for humans, and arbitrary ones fragment the mental
  model.
- Preserve the preamble verbatim. It explains the usage flow; rewriting it every regeneration
  is churn with no reader benefit.
- Keep subcategories in stable order (Docs automation → Workflow — OpenSpec SDD → Meta) and
  skills alphabetical within each subcategory. This avoids diff noise when entries are added.

## Commands

```bash
# List every skill
eza .claude/skills/

# Extract frontmatter from every SKILL.md
for f in .claude/skills/*/SKILL.md; do
  echo "=== $f ==="
  awk '/^---$/{c++; next} c==1{print}' "$f"
done
```
