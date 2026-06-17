---
title: "The four governance artifacts"
description: "Harness Rules, the architecture-checkpoint hook, and the backend/frontend catalyst-project-structure skills look like they overlap — they don't. A ground-up reference that assumes no prior Aurora knowledge and draws the boundary between what blocks you, what advises you, and who is really responsible for what."
---

Aurora Catalyst ships four separate mechanisms that all "watch" how code gets written. To someone new on the team they look redundant. They are not. Each one owns a different responsibility, but they share vocabulary and cite each other, and that grey zone is where people get lost. This page exists to dissolve that confusion.

## 1. Why this document exists

The four artifacts are:

1. **Harness Rules** — the codified architectural rules of the monorepo.
2. **The `architecture-checkpoint.ts` hook** — the automatic guard that fires at write-time.
3. **The backend `catalyst-project-structure` skill** — the "where does each file go" blueprint for the backend.
4. **The frontend `catalyst-project-structure` skill** — the equivalent blueprint for the frontend.

If you have just joined the team, you have probably seen at least two of these fire at you and wondered whether they are the same thing wearing different hats. They are not. By the end of this page you will be able to look at any one of them and answer three questions instantly: *does this block me or just advise me? where does it physically live? who actually decides — an architect, a tool, or me?*

This is **understanding-oriented** reading. If you want to *do* something specific, the how-to guides are the right place; if you want exact facts about a single rule, read its catalog entry. This page is the map.

In short: four governors, one shared vocabulary, four distinct jobs — and this document is the legend that tells them apart.

## 2. TL;DR — the mental map

Writing code in Aurora is like **building inside a complex of buildings that is already under construction**. Four things govern your work on that site, and each one plays a role you already understand from real construction:

| Artifact | Role on the building site | Nature |
| --- | --- | --- |
| **Harness Rules** | The **building code / structural regulations**. Permanent constraints: they state what is forbidden for structural safety. Breaking one is not "bad practice" — it is *illegal*. You do not edit them quietly; you formally **repeal** the old one and publish a new regulation. | Stable, citable constraint. |
| **`architecture-checkpoint` hook** | The **guard at the entrance to the structural zone**. The first time you walk in with new material to place in a critical area, he stops you and asks: "have you looked at the blueprints?" He is **blind to content** — he does not judge whether your wall is well built, only *where* you are about to build, and he forces you to consult first. | Automatic gate, once per spot. |
| **`catalyst-project-structure` skill (backend)** | The **floor plans of the backend building**: the decision tree that answers "this element — which floor and which room does it go in?" It does not stop you; it orients you. | Guidance with judgment, no blocking. |
| **`catalyst-project-structure` skill (frontend)** | The **floor plans of the frontend building**. Same role, a different building in the same complex. | Guidance with judgment, no blocking. |

The key point to internalize: **the guard (the hook) does not know the regulations in detail, and he cannot read the blueprints for you.** He only forces you to stop and consult. The regulations (HR) define what is forbidden; the blueprints (skills) tell you where to put things; the guard (hook) is the one who stops you so you don't build blind. Three distinct jobs that support each other — they do not duplicate each other.

In short: regulations forbid, blueprints place, the guard stops. Keep those three verbs apart and the rest of the page falls into place.

## 3. One fiche per artifact

Every fiche below follows the same fixed template, so you can compare them line by line.

### 3.1 Harness Rules (HR)

- **What it is.** Codified **architectural / framework** constraints that govern your work *before* you write code.
- **What it's for.** They are not post-hoc documentation nor "optional memory" — they are constraints you comply with *now*, while writing. Their core responsibility is to state, in a citable form, what the architecture forbids.
- **What triggers it.** (a) citing an ID by name (`HR-MODULES-001`); (b) going to touch governed paths (a `byPath` / `byId` / `byKeyword` lookup in the index); (c) during `/opsx:propose`, in the `## Harness rules applicable` section; (d) editing files under `cliter/harness-rules/`.
- **How it's applied — three enforcement layers.**
  - *Prompt-time* (`UserPromptSubmit`): the `inject-rules-context.ts` hook injects the top-N active rules as a separate block, framed as "constraints, not memory".
  - *Propose-time* (`/opsx:propose`): `openspec/config.yaml` detects applicable rules; if the change VIOLATEs a `blocking` rule, it HALTs until resolved.
  - *Write-time* (`PreToolUse`): (a) the checkpoint (see Artifact 2) **attaches the HR-IDs** governing the path to the blocking message; (b) a *content-guard* blocks if the content matches a `detect.pattern` of an active rule. Today the only active `detect` is **`HR-ACL-001`** (pattern `as unknown as`).
- **Where it lives.** Rules in `cliter/harness-rules/*.md` (core) and `cliter/<bc>/harness-rules/*.md` (tied to a bounded context); a **generated** index in `cliter/harness-rules-index.json` (never hand-edited; regenerated with `pnpm hr:generate`); a guide skill in `.claude/skills/harness-rules-guard/SKILL.md` (plus `references/enforcement.md`, `references/format.md`); and a human-readable catalog in `docs/harness-rules/README.md`.
- **Lifecycle.** A rule is **born** as a deliberate architectural decision (a new `.md`). Its `### Enunciado` and `### Casos exhaustivos` are **never** edited in place: if the meaning changes, the old rule is **repealed** (state `derogated`) and a **new one with a new ID** is created — IDs are never reused. There is **no** `/harness-rules:promote`: HR are stable, not crystallized per-change.
- **Audience.** AI (injected at prompt-time, detected at propose-time, content-blocked at write-time) **and** the human dev (who reads them when citing an `HR-NNN` or when blocked).
- **Its place in the analogy.** The building code. Stable, published, citable. You comply now; you do not negotiate at the door.

States and severities: states are `active` / `derogated`; severity is `blocking` / `informational`. IDs follow `HR-<TOPIC>-<NNN>` (for example `HR-MODULES-001`, `HR-PORTS-001`, `HR-CODEGEN-001`, `HR-ACL-001`, `HR-BRIDGES-001`, `HR-FLOWS-001`, `HR-BARRELS-001`).

**Do not confuse Harness Rules with Business Rules.** The harness-rules skill itself draws this line:

| Aspect | Business Rules | Harness Rules |
| --- | --- | --- |
| Nature | **domain** invariants | **architecture / framework** constraints |
| Framing | **memory** + post-hoc | a **constraint** you comply with now, before writing |
| Verbs | maintains / derogates / extends | **COMPLY / VIOLATE / DEROGATE** |
| Cycle | crystallized **after** `/opsx:archive` via `/br:promote` | no promote; they change only by deliberate architectural decision |
| In the proposal | `## Business rules affected` (declares the future) | `## Harness rules applicable` (records compliance with something that already exists) |

For the full picture of the Business Rules side of that table, see [Business rules system](../business-rules-overview/).

In short: HR are the law of the codebase — citable, blocking when marked so, and changed only by repeal-and-replace, never by quiet edit.

### 3.2 The `architecture-checkpoint.ts` hook

- **What it is.** A `PreToolUse` hook (it runs *before* a tool acts) that **blocks** (exit code 2, **once per path per session**) the first `Write` to a **new** file inside the backend architecture, until the project structure has been consulted.
- **What it's for.** To stop you — human or AI — from creating a brand-new file in a critical zone *without first looking at the blueprints*. It does one thing: it forces the consultation.
- **What triggers it.** Event `PreToolUse`, tool = `Write`, a **new** file (it does not yet exist on disk) under:
  - `backend/src/@(api|app|aurora|bridges)/` → **BLOCKS**.
  - a misplaced `*.e2e-spec.ts` test → **BLOCKS**.
  - `@app/**/shared/functions/*.function.ts` → **advisory only** (warns, does not block).
- **How it's applied.** `exit(2)` + a message on `stderr` → the tool call is rejected. **Only the first time** per path: it caches in `.claude/.cache/architecture-checkpoint.txt`. The cache is cleared on every `SessionStart`. It **never blocks because of its own bug**: everything is wrapped in try/catch with a failsafe.
- **What the blocking message contains.** (1) the path + the path's classification; (2) a body adapted to the detected type (aggregate, hand-written flow, cross-bc, framework, misplaced e2e, unknown), **citing concrete sections of the `catalyst-project-structure` skill**; (3) a "Harness rules that govern" section with the HR-IDs resolved through the index; (4) a "content violations" section if the content about to be written matches an active `detect.pattern`.
- **Where it lives.** `.claude/hooks/architecture-checkpoint.ts`; tests in `.claude/hooks/architecture-checkpoint.test.ts`; configured in `.claude/settings.json` (the `PreToolUse` hook entries).
- **Lifecycle.** Almost static; it is updated when the architecture paths change or new path patterns are discovered. Its state (the cache) is per-session.
- **Audience.** AI (it blocks the AI and forces it to read the skill) **and** the human dev (who reads the message and follows the guidance).
- **Its place in the analogy.** The guard at the entrance to the structural zone. He is a **blind nudge + path classifier + HR-aware messenger**: he does not understand semantics. He cannot tell `oauth.module.ts` (a shadow module, forbidden) from `oauth-utils.ts` (legitimate). His only job is to **stop you and force the consultation** before you create something new.

In short: the hook is a one-time gate that blocks the *first* write to a new architectural file, hands you the blueprints and the relevant law, and then gets out of the way — it judges *where*, never *what*.

### 3.3 The backend `catalyst-project-structure` skill

- **What it is.** A decision tree plus a canonical layer hierarchy that answers **"where does this file go?"** in the backend.
- **What it's for.** It explains how the layers live (`@api`, `@app`, `@aurora`, `@bridges`), the module convention, the `@aurora-catalyst-generated` pattern, the **shadow module** anti-pattern, and the scaffold-CLI vs editable-file distinction.
- **What triggers it.** The user asks "where does X go"; a new file is about to be created under `backend/src/@(api|app|aurora|bridges)/`; a new module / BC / layer is being planned; the `architecture-checkpoint` hook shows its STOP banner; auto-invocation when planning a module, controller, handler, service, port, adapter, or bridge.
- **How it's applied.** It does **NOT** block. It is guidance with judgment, for human or AI. The hook **cites** it in its message when it blocks (for example, "Skill `catalyst-project-structure` → Decision trees").
- **Where it lives.** `backend/.claude/skills/catalyst-project-structure/SKILL.md` (version 3.0).
- **Lifecycle.** Versioned alongside the backend architecture; it grows as new layers, patterns, or decision branches are added.
- **Audience.** AI (auto-invoke, decision tree) **and** the human dev (reference).
- **Its place in the analogy.** The floor plans of the backend building. They orient; they never stop you at the door.

This skill **cites HR explicitly**: it names `HR-PORTS-001` in its decision tree (the "upward inversion `@aurora → @app` is forbidden by `HR-PORTS-001`"). It also describes the shadow-module anti-pattern and when a hand-written `.module.ts` *is* justified (a dedicated flow module inside the BC, not a parallel one). But citing is not enforcing — the skill informs; the actual enforcement of `HR-PORTS-001` arrives through the HR index at `/opsx:propose`.

In short: the backend blueprint tells you where things go and warns you about the laws nearby, but it has no power to stop you — that power belongs to the hook and to HR.

### 3.4 The frontend `catalyst-project-structure` skill

- **What it is.** The project structure, folder organization, and file-placement rules for the Angular frontend (domains, bounded contexts, layouts, modules, routing).
- **What it's for.** To answer "where is X" / "where should I put X" for frontend features.
- **What triggers it.** "where is X" / "where should I put X"; planning where a new feature's files live; creating a new bounded context; understanding which files to modify.
- **How it's applied.** **Informative, does not block.** It has **no associated hook** (unlike the backend).
- **Where it lives.** `frontend/.claude/skills/catalyst-project-structure/SKILL.md` (version 1.0).
- **Lifecycle.** Versioned alongside the frontend architecture.
- **Audience.** AI (navigation + planning) **and** the human dev (reference).
- **Its place in the analogy.** The floor plans of the frontend building — the same role as the backend skill, in a different building of the same complex.

This skill **does not cite HR or any other governance artifact**: it is a pure-domain skill (DDD layout). There is no guard at this building's door, so nothing forces the consultation — you read it because it helps, not because you are blocked.

In short: same blueprint role as the backend skill, but standalone — no hook fronts it and no HR cross-references it.

## 4. Master comparison table

| | **Harness Rules** | **`architecture-checkpoint` hook** | **`catalyst-project-structure` (backend)** | **`catalyst-project-structure` (frontend)** |
| --- | --- | --- | --- | --- |
| **What it is** | Codified architectural constraints | A `PreToolUse` gate on new architectural files | "Where does this file go" decision tree (backend) | "Where does this file go" decision tree (frontend) |
| **What it's for** | State what is forbidden, citably | Force a structure consultation before the first write | Orient file placement across backend layers | Orient file placement across frontend layers |
| **Trigger** | Cite an ID, touch a governed path, `/opsx:propose`, edit a rule file | `PreToolUse` + `Write` + new file under backend arch paths | "where does X go", new backend file, hook STOP banner | "where is X", new frontend feature/BC |
| **Blocks?** | **Yes** (when `blocking`) | **Yes** (once per path per session) | No — advises | No — advises |
| **Automatic or read?** | Automatic (3 layers) + human reads | Automatic | Read by human/AI | Read by human/AI |
| **Where it lives** | `cliter/**` (+ `docs/`, guide skill in `.claude/`) | `.claude/hooks/` | `backend/.claude/skills/` | `frontend/.claude/skills/` |
| **Lifecycle** | Born as a decision; repeal + new ID, never edit in place | Almost static; per-session cache | Versioned with backend (v3.0) | Versioned with frontend (v1.0) |
| **Audience** | AI + human | AI + human | AI + human | AI + human |
| **Cites HR?** | (is HR) | Yes — attaches HR-IDs | Yes — `HR-PORTS-001` | No |
| **In the analogy** | Building code | Guard at the door | Backend floor plans | Frontend floor plans |

Notice the one column that matters most: only the first two artifacts have **Yes** in the *Blocks?* row. That single line is the spine of this whole page.

In short: read the *Blocks?* and *Where it lives* rows first — they separate the two enforcers (`cliter/` law, `.claude/` gate) from the two advisors (`.claude/` blueprints).

## 5. ⭐ Overlap zones

This is where the real value of the page lives. Each pair below shares a *topic* but not a *responsibility*. For every overlap: what they share, where they do **not** step on each other, and how they coexist. After each one, ask yourself who is the *real* owner — the reader should always be able to say who to "blame".

### 5.1 `HR-MODULES-001` ↔ the hook (direct dependency)

`HR-MODULES-001` ("Shadow Module Antipattern") names the hook explicitly as an *already existing* guard in its "anchor patterns". The hook, in turn, resolves and attaches `HR-MODULES-001` to the message when a new file is created in a BC zone. **But the hook is blind**: it cannot tell a shadow module from legitimate code; its role is to get the AI *into the skill first*.

Real owner: the HR **relies** on the hook + skill to prevent the case at write-time. The HR alone does not block the creation of a shadow module — it is the *constraint*, not the gate.

### 5.2 The hook ↔ the backend `catalyst-project-structure` skill (behavioral coupling)

The hook is the **dispatcher** ("go read the skill"); the skill is the **provider of the decision tree** ("here is where the file goes"). The skill itself documents that the hook blocks the first write until it is consulted. Neither *owns* the enforcement — they are co-dependent for the experience.

Real owner: the hook owns *stopping you*; the skill owns *telling you where*. The experience only works because both are present.

### 5.3 The backend skill ↔ `HR-PORTS-001` (a concrete citation)

The skill *mentions* the rule ("this would violate `HR-PORTS-001`") but **does not enforce it** — it only informs. The real enforcement arrives through the HR index at `/opsx:propose`.

Real owner: `HR-PORTS-001` (via the index, at propose-time) owns enforcement. The skill is a signpost pointing at the law, not the law.

### 5.4 `HR-CODEGEN-001` ↔ the backend skill (shared semantics, no direct citation)

Both explain the same thing: `@aurora-catalyst-generated` files **are editable**, and `.origin` reconciles them on every regeneration. The HR expresses it as a rule to audit / propose against; the skill expresses it as an operational decision tree.

Real owner: split by purpose. The HR owns the *audit/propose* truth; the skill owns the *day-to-day placement* truth. Same fact, two surfaces.

### 5.5 `HR-MODULES-001` ↔ the backend skill (same anti-pattern, different framing)

The skill describes exactly the shadow-module anti-pattern (symptom, correct action, and when a flow module *is* valid) without citing the rule. The HR says "it's a constraint; if you violate it, the audit catches it"; the skill says "it's a decision tree; if you do it wrong, the hook stops you".

Real owner: split by moment. The HR owns the *audit* catch (after the fact); the skill + hook own the *write-time* catch (before the fact).

### 5.6 The HR index `byPath` ↔ the hook's path classification (same space, disjoint purposes)

Both do *path-matching* with globs. The hook asks "is this a NEW file in an architectural zone?" (binary: block or not). The HR index asks "which constraints govern this path?" (a set of active rules). Same terrain, different semantics.

Real owner: split by question. The hook owns the *new-file-or-not* decision; the index owns the *which-rules-apply* lookup. They happen to walk the same globs.

### 5.7 The hook's content violations ↔ the HR `detect` field (`HR-ACL-001`)

The hook reads the `detect` field of the rules that govern the path and, if the content matches, adds it as a violation. Today the only active `detect` is `HR-ACL-001` (`as unknown as`). The hook feeds the *content-guard*, which shares the same `detect` index.

Real owner: the HR owns the *pattern* (`detect`); the hook is one *reader* of it at write-time.

### The three-layer enforcement frame

Step back and the picture clears: the HR enforce across **three independent layers**.

```
PROMPT-TIME   →   PROPOSE-TIME   →   WRITE-TIME
inject-rules-     openspec/          architecture-checkpoint.ts
context.ts        config.yaml        + content-guard
```

The hook is **one piece** (layer 3) of a three-layer system. The other two layers are independent of it. So when the hook does nothing — because you are editing an existing file, or you are not on a backend architectural path — the HR are still enforced at prompt-time and propose-time. The hook is not the law; it is one of the law's three enforcement moments.

In short: every overlap shares a topic, never a responsibility — name the real owner each time, and the four artifacts stop looking redundant.

## 6. The typical flow, step by step

Here is what happens when a dev or AI tries to `Write` a brand-new file at `backend/src/@api/oauth/flows/oauth.controller.ts`:

1. `architecture-checkpoint.ts` intercepts (it is a `PreToolUse` hook).
2. It confirms the file is new → classifies the path → looks up the HR-IDs that govern it in the index → looks for content violations → builds a message adapted to the type → **attaches the HR-IDs** → caches the path → `exit(2)`.
3. The AI reads the message → sees "Skill `catalyst-project-structure` → …" → opens the skill → applies the decision tree → retries the `Write`.
4. On the retry to the **same path**: the hook sees the path is already cached → `exit(0)` silently → the `Write` proceeds.
5. Later, in `/opsx:propose` for that code: the engine loads the HR index, runs `byPath` over the touched files, declares `## Harness rules applicable`, and judges COMPLY / VIOLATE / DEROGATE per rule. If it VIOLATEs a `blocking` rule → HALT until resolved.

Read that chain against the analogy: the guard stops you at the door (step 1–2), hands you the blueprints and points at the building code (step 2–3), lets you through once you've consulted (step 4), and only later does the architect formally check your work against the regulations at the propose desk (step 5).

In short: hook first (write-time gate), skill in the middle (placement), HR last and loudest (propose-time judgment) — three moments, not one wall.

## 7. Quick heuristics — "which one applies to me right now?"

Keep this cheat sheet in your head. When any of these fires at you, run the questions:

- **Does it block me, or advise me?** If you got `exit(2)` and your tool call was rejected → it was the **hook** (or a `blocking` HR at propose-time). If you just got pointed at a section to read → it was a **skill**. Blocking belongs only to the hook and HR; skills only orient.
- **Does it live in `cliter/` or in `.claude/`?** `cliter/` = the project's domain/architecture → **Harness Rules**. `.claude/` = the AI harness instrumentation → the **hook** and the **skills**. This physical clue alone tells you whether you are looking at a law or at tooling.
- **Does an architect decide this, or is it orienting me?** If changing it requires repealing and republishing with a new ID → **Harness Rule** (an architect decides). If it is a decision tree you read and apply → **skill** (it orients you).
- **Am I creating a new file, or editing an existing one?** The hook only fires on **new** files under backend architectural paths. Editing an existing file never trips the hook (though HR still apply at prompt-time and propose-time).
- **Backend or frontend?** Both have a `catalyst-project-structure` skill, but only the backend one has a hook in front of it and cross-references HR. The frontend skill is standalone.

In short: *blocks vs advises*, `cliter/` vs `.claude/`, *architect-decides vs orients-me* — three questions, and you always know which artifact is talking to you.

## 8. Glossary

- **hook** — a script the AI harness runs automatically on a specific event (here, before a tool acts). It can block by exiting with a non-zero code.
- **skill** — a Markdown document (`SKILL.md`) the AI consults for guidance on a task. It informs; it does not block.
- **harness rule (HR)** — a codified architectural/framework constraint, citable by ID (`HR-<TOPIC>-<NNN>`), that you comply with before writing code.
- **business rule (BR)** — a documented domain invariant, citable by ID (`BR-<BC>-<AGG>-<NNN>`), crystallized *after* implementation. Distinct from an HR — see the table in §3.1.
- **trigger** — the condition that activates an artifact (an event, a path match, a cited ID, a slash command).
- **enforce** — to make a constraint actually bite: block a tool call, halt a proposal, or fail a check. Citing a rule is *not* enforcing it.
- **blocking** — a severity/behavior where violating the constraint stops the action (the hook's `exit(2)`, a `blocking` HR's HALT at propose-time).
- **`.origin`** — the file Aurora writes to reconcile a generated file with user edits on every regeneration (the heart of `HR-CODEGEN-001`).
- **`@aurora-catalyst-generated`** — the marker on generated files that signals they are *editable* and reconciled via `.origin` — not read-only.
- **drift** — when two things that should stay in sync diverge (for example, documentation that no longer matches the real code).
- **shadow module** — the anti-pattern named by `HR-MODULES-001`: a hand-written `.module.ts` that shadows or runs parallel to the generated module structure instead of fitting inside it.
- **`PreToolUse`** — the harness event that fires *before* a tool (like `Write`) executes; the moment the `architecture-checkpoint` hook gets its chance to block.
