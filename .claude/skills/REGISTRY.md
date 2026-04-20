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
| `catalyst-changelog-sync` | After new archives land in a sibling repo; refreshes `/changes/` with classified, bilingual entries. Supports dry-run and bidirectional override. | `.claude/skills/catalyst-changelog-sync/SKILL.md` |
| `catalyst-docs-from-spec` | After a change is archived in `aurora-catalyst-cli` or similar; drafts concepts, guides, and reference stubs in EN + ES. | `.claude/skills/catalyst-docs-from-spec/SKILL.md` |

---

## Workflow — OpenSpec SDD

Drive the openspec propose / apply / archive / explore loop.

| Skill | Trigger | Path |
| --- | --- | --- |
| `openspec-apply-change` | Implement tasks from an OpenSpec change. Use when the user wants to start implementing, continue, or work through tasks. | `.claude/skills/openspec-apply-change/SKILL.md` |
| `openspec-archive-change` | Archive a completed change in the experimental workflow. Use when finalizing a change after implementation. | `.claude/skills/openspec-archive-change/SKILL.md` |
| `openspec-explore` | Enter explore mode — thinking partner for ideas, investigations, and clarifying requirements. Use before or during a change. | `.claude/skills/openspec-explore/SKILL.md` |
| `openspec-propose` | Propose a new change with proposal + design + specs + tasks generated in one step. | `.claude/skills/openspec-propose/SKILL.md` |

---

## Meta

Operate on the skill ecosystem itself.

| Skill | Trigger | Path |
| --- | --- | --- |
| `catalyst-update-skill-registry` | After creating, editing, deleting, or renaming any `SKILL.md`; or when the user asks to update the registry / catalog. | `.claude/skills/catalyst-update-skill-registry/SKILL.md` |
