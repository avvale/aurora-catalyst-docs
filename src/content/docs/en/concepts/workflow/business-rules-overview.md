---
title: "Business rules system"
description: "A catalog of business invariants that lives next to the YAML schemas — bilingual prose, English identifiers, crystallized after implementation, and used as institutional memory plus incoherence detector by humans and AI."
---

## What it is

A **business rule** in Aurora Catalyst is a documented invariant, validation, cascade, or policy of the domain. The catalog stores them in plain Markdown files, one per aggregate, next to the YAML schema that describes the same aggregate. Each rule has a stable ID (`BR-<BC>-<AGG>-<NNN>`), a clear statement in Spanish, an exhaustive case table, and pointers to the code and tests that implement it.

The system is not a rule engine, a DSL, or a runtime constraint. The code and the tests are the executable truth. The catalog describes the **intent** in a form that humans, AI assistants, and tooling can all consult by ID — a layer of institutional memory that survives team rotation, AI context resets, and product hand-offs.

## What problem it solves

Aurora Catalyst projects routinely accumulate two kinds of knowledge that have nowhere to live:

1. **"Why is this record in `PENDING`?"** Support, customer success, and product all hit this question. The answer is usually a chain of invariants that crystallized in code months ago. Without a citable identifier, the explanation has to be reconstructed every time from commit history and JIRA threads.
2. **"Does this change contradict an earlier decision?"** Mid-sized domains converge on dozens of rules that interact silently. A new proposal that quietly contradicts an existing rule is one of the most expensive bugs in domain modeling — and the easiest to ship if no one has the prior rules loaded in their head.

The catalog gives both of those a single answer: a stable ID, a one-paragraph statement, an exhaustive case table, and links to the code that enforces it. Support cites `BR-PROD-EVENT-006`; AI assistants reading a new proposal can detect contradictions; a developer doing retroactive triage has a starting point.

## How it positions itself

The catalog is **complementary, not prescriptive**. Three stances make this concrete:

- **Memory and detector, not enforcement.** A rule does not stop the build. The pre-commit hook and CI only check structural integrity (frontmatter, unique IDs, valid metadata). Semantic enforcement happens through human review and AI-assisted detection at proposal time.
- **Crystallized post-implementation.** A rule lands in the catalog **after** the change that introduces it has been archived in OpenSpec, not before. The proposal declares which rule actions it will trigger (`mantiene` / `deroga` / `extiende` / `Nuevas`), and `/business-rules:promote` materializes them once the change has shipped. The catalog therefore documents what the system **does**, not what it **plans to do**.
- **Deliberately mixed languages.** Prose is in Spanish (because product and team discuss rules in Spanish). Identifiers, frontmatter keys, and `@rule` citations are in English (because they are stable tokens used in code and tooling). Keywords are bilingual. The mix is documented as a convention with a single hard constraint: **do not harmonize**. Translating the catalog to a single language is an explicit anti-pattern that the audit tool flags.

## The three workflows

Every change to the catalog goes through exactly one of three workflows. Each one has its own entry point and its own automation surface.

| Workflow                         | When it applies                                                                                                                    | Entry point                                  |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **A — via OpenSpec**             | A planned change that goes through `/opsx:propose → /opsx:apply → /opsx:archive`. Recommended for anything that touches the domain | `/business-rules:promote` after archive      |
| **B — retroactive bootstrap**    | The aggregate has no catalog file yet and you want to extract implicit rules from existing code, tests, or a product Word document | `/business-rules:document <bc>/<aggregate>`  |
| **C — direct edit**              | Typos, broken paths, formatting, derogating an obsolete rule outside an OpenSpec change, resolving `[VERIFICAR]` markers           | Edit the `.md` by hand + `pnpm br:generate`  |

These workflows are mutually exclusive by intent. A single change should pick one and stay in it. Mixing — for example, hand-editing a rule and then trying to re-run `:promote` over it — produces drift between the catalog and the OpenSpec archive that the audit will flag later.

The mechanics are documented in [Maintain the business-rules catalog](../../../guides/workflow/maintain-business-rules/).

## Two layers of consistency

Two automated layers protect the catalog from drift, and they stop at different points on purpose.

**Structural consistency — fully automated.** A pre-commit hook regenerates the index on every commit that touches `cliter/<bc>/business-rules/*.md` and runs the validator (`pnpm br:validate`). A GitHub Actions workflow re-runs the same checks on every PR and additionally verifies that the committed index matches the regenerated one. Errors here block the commit or the PR — schema violations, duplicate IDs, illegal `Estado`/`Severidad` values, drift between catalog and index.

**Semantic consistency — human-assisted, two moments.** The first moment is preventive: when you run `/opsx:propose`, the `openspec/config.yaml` extension instructs the AI to load the relevant rules of the candidate bounded contexts and ask itself whether the new proposal contradicts any of them. If it does, the proposal halts with options (derogate / coexist with an exception / no real conflict, justify). The second moment is on-demand: `/business-rules:audit` runs a structural report and then asks the AI to pair up rules sharing BCs, aggregates, or keywords and classify each pair (`contradiction` / `extension` / `orthogonal` / `needs-review`). There is no nightly job, no GitHub App, no API key — the audit uses the Claude Code session that is already open.

The deliberate gap between the two layers is the heart of the system's lightness. Structural checks are cheap, deterministic, and fast enough to gate every commit. Semantic checks are expensive and judgment-laden, so they happen where a human is already in the loop.

## What it looks like in practice

```
cliter/
├── production-planning/
│   ├── CONTEXT.md
│   ├── production-order-header.aurora.yaml
│   └── business-rules/
│       ├── production-order-header.md           ← rules of this aggregate
│       └── production-order-position-event.md
├── iam/
│   ├── CONTEXT.md
│   ├── account.aurora.yaml
│   └── business-rules/
│       └── account.md
└── business-rules-index.json                    ← generated
```

A rule file is plain Markdown with a YAML frontmatter (declaring `bounded_contexts`, `aggregates`, `paths`, `keywords`, `last_updated`) followed by one `## BR-...` section per rule. The frontmatter and the index let tools (the AI hook, the CI workflow, the slash commands) reason about rules without parsing prose. The prose is for humans.

The next page — [Anatomy of a business rule](../business-rule-anatomy/) — breaks down a single rule's structure in detail. For the technical pieces that make this work (scripts, hooks, slash commands, the skill, OpenSpec integration), see [System architecture](../business-rules-architecture/).

## When to read which document

- **You want to author or modify a rule.** Read [Anatomy of a business rule](../business-rule-anatomy/) and the maintenance guide.
- **You want to understand how the index, the hooks, and the CI fit together.** Read [System architecture](../business-rules-architecture/).
- **You want the canonical source of truth.** It lives in the Aurora Catalyst repo at `docs/business-rules/README.md` (operational) and `docs/business-rules/ARCHITECTURE.md` (technical). The pages on this site distill them for catalyst users; the repo is the normative reference.

## Trade-offs and limits

- **The catalog scales with the domain, not with effort.** Up to ~150 active rules the system operates with no friction. Between 150 and 500 the audit emits warnings and recommends filtering proposals by bounded context. Past 1000 the architecture needs to be revisited (sub-catalogs, RAG, embeddings) — but that conversation only becomes urgent for projects that have lived for years.
- **`@rule` citations in code are optional.** A handler can document `@rule BR-PROD-EVENT-001` in a JSDoc block, but nothing forces it. The validator reports orphaned citations (citing IDs that don't exist) and zombie rules (active rules with zero citations for more than 30 days) as advisory signals — not blockers.
- **Detection of contradictions is best-effort.** The preventive check at proposal time and the on-demand audit catch most real conflicts, but neither is exhaustive. Two rules in different bounded contexts with non-overlapping keywords can still contradict each other silently; that's why the audit lets you re-run the pairwise analysis by BC.
- **The post-implementation discipline matters.** It is tempting to write rules "in advance" while designing a feature. The catalog explicitly does not work that way — rules describe what the code does (or has been formally committed to doing through an archived OpenSpec change). Skipping that discipline turns the catalog into a wish list, which is the failure mode every prior incarnation of this idea has hit.
