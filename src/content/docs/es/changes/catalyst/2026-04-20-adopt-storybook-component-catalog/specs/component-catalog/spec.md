---
title: "Spec: Component catalog"
---

## ADDED Requirements

### Requirement: Every public @aurora/components export has a colocated story file

Every Angular component, directive, or composable exported from a barrel file under `frontend/src/@aurora/components/**/index.ts` SHALL have a colocated `*.stories.ts` sibling file. Stories MUST follow the CSF3 format (`Meta<T>` + named `StoryObj<T>` exports) so that tooling (Claude, future Storybook, static analysis) can statically introspect them. Adoption is incremental: new components MUST ship a story at creation time; existing components without a story MUST be documented the next time they are modified or consumed by generated code.

#### Scenario: Public component ships a colocated story

- **WHEN** a new component file `foo.component.ts` is added under `frontend/src/@aurora/components/foo/` and exported through its `index.ts`
- **THEN** a sibling `foo.stories.ts` exists in the same directory
- **AND** the story file exports a default `Meta<FooComponent>` object with `title`, `component`, and at least one named `StoryObj<FooComponent>` export

#### Scenario: Composable or directive is cataloged by proxy

- **WHEN** the public export is a composable or directive (not a standalone component)
- **THEN** the sibling `*.stories.ts` provides a minimal host component demonstrating usage
- **AND** the story title uses the path convention `@aurora/<area>/<name>`

### Requirement: Claude agents use *.stories.ts as the source of truth for UI composition

A Claude skill SHALL exist at `frontend/.claude/skills/catalyst-component-catalog/SKILL.md` that instructs agents to consult `*.stories.ts` files — via `Glob` and `Read` — before composing screens that use `@aurora/components`. The skill MUST be referenced from `frontend/CLAUDE.md` so that it is auto-invoked when relevant context is detected.

#### Scenario: Agent composes a screen using an @aurora component

- **WHEN** an agent is asked to build a UI that consumes `@aurora/components/data-table`
- **THEN** the skill directs the agent to `Glob frontend/src/@aurora/components/data-table/**/*.stories.ts` and `Read` the matching files before writing code
- **AND** the agent's output uses prop names, slot shapes, and composition patterns lifted from the stories rather than re-derived

#### Scenario: Agent encounters an undocumented component

- **WHEN** the agent cannot find a `*.stories.ts` for an `@aurora/components` export it needs to use
- **THEN** the skill instructs the agent to flag the gap and propose a story before consuming the component, rather than inventing usage silently

### Requirement: Stories MAY declare aurora semantic metadata for AI discovery

Story files MAY declare a `parameters.aurora` object on their `Meta` export with the fields `category`, `when`, and `whenNot`. These fields are OPTIONAL (adoption is incremental) but, when present, SHALL follow a fixed shape so agents can parse them deterministically. The fields provide explicit "when to use / when not to use" hints that scale better than inference from titles, argTypes, or variant names once the catalog grows past ~15 components.

#### Scenario: A story declares aurora metadata

- **WHEN** a story's `Meta` exports a `parameters: { aurora: { category, when, whenNot } }` object
- **THEN** all three fields are strings (no null, no undefined, no empty values)
- **AND** `category` groups the component into a coarse family (e.g., `'data-table'`, `'navigation'`, `'form'`)
- **AND** `when` describes the primary use case in one sentence
- **AND** `whenNot` describes at least one scenario where a different component is the better choice, referencing that alternative by name

#### Scenario: An agent selects a component using aurora metadata

- **WHEN** an agent needs to pick between two `@aurora/components` that could satisfy a user requirement
- **THEN** the `catalyst-component-catalog` skill directs it to read `parameters.aurora.when` and `parameters.aurora.whenNot` from candidate stories
- **AND** if those fields are absent, the skill falls back to title/argTypes inference (degraded but functional)

### Requirement: Story authoring convention is documented for humans and agents

A `STORIES.md` (or equivalent section inside the `catalyst-component-catalog` skill) SHALL document the story authoring convention: file naming, title path format, minimum required variants (default + edge cases), decorator usage, and the proxy host pattern for composables/directives. The document MUST be the single reference consulted by both humans adding stories and agents generating them.

#### Scenario: New contributor adds their first story

- **WHEN** a contributor opens the story authoring reference
- **THEN** they find an end-to-end example story for a real `@aurora/components` component
- **AND** the example demonstrates `argTypes` descriptions, optional `parameters.aurora` metadata, and the proxy host pattern for non-component exports
