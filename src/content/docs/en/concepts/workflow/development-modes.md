---
title: Development modes
description: Framework mode vs Solution mode — two explicit mindsets for working in an Aurora scaffold with Claude Code, and the `/dev-mode` command that switches between them.
---

## Why this exists

The same Aurora repo hosts two very different kinds of work. Sometimes you are **extracting a pattern** — writing a composable, adding a skill, or generalizing a helper so the next feature (or the next AI session) inherits it for free. Other times you are **consuming the framework** — delivering a concrete requirement using pieces that already exist, and the shortest path wins.

Without an explicit signal, these two modes blur. AI assistants tend to over-engineer feature work — "let me extract this in case we need it later" — when the task was to ship a form. In the other direction, when you really are building foundations, a "shortest path" reflex produces throwaway code that never makes it to `@aurora/` and never gets documented.

Aurora solves this with two declared modes and a command to switch between them. The mode is visible in the Claude Code status line, is persisted per-project, and changes how every downstream skill and agent reasons about the task at hand.

## The two modes

### Framework mode

**Mindset**: "Who else might need this?" You are producing something for other developers — or future AI sessions — to consume.

| Area                   | What Framework mode expects                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Code shape             | Generalize. Extract composables, shared components, and utilities to the `@aurora/` packages. |
| Scope                  | Plan for future uses even when the current task does not need them — unless the cost is high. |
| Skills and patterns    | Create or update skills so the pattern is recoverable in later sessions.                      |
| Architecture           | Introduce new layers, abstractions, or conventions when the pattern demands them.             |
| Trade-off              | Clarity and reusability over speed.                                                           |
| Audience for your code | Other developers, other AI sessions, your future self six months from now.                    |

### Solution mode

**Mindset**: "What's the shortest path?" You are delivering a requirement against the architecture that already exists.

| Area                   | What Solution mode expects                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Code shape             | Consume, don't build. Reuse composables, components, and utilities from `@aurora/`.                                    |
| Scope                  | The requirement in front of you. No scaffolding for imaginary needs.                                                   |
| CLI first              | Reach for `catalyst load`, `catalyst add`, etc. before writing by hand. Manual code is the last resort.                |
| Architecture           | Stay inside the current architecture. Introduce new structure only when the requirement cannot fit anywhere that exists. |
| Trade-off              | Delivery speed over future flexibility.                                                                                |
| Audience for your code | The feature itself. Follow the patterns documented in skills — do not invent new ones.                                 |

## Switching with `/dev-mode`

Switch the mode with the `/dev-mode` slash command inside Claude Code:

```text
/dev-mode framework    # switch to Framework mode
/dev-mode solution     # switch to Solution mode
/dev-mode              # report the current mode without changing it
```

The argument is case-insensitive, and anything other than `framework` or `solution` is treated as empty — the command simply reports the current mode.

When you pass a valid value, Claude writes the normalized word (`Framework` or `Solution`) to `.aurora-dev-mode` at the project root and confirms the switch with a one-line message. The file is the single source of truth; the status line reads from it, and skills that adapt their behavior per mode read from it too.

:::note
`.aurora-dev-mode` lives **at the project root**, not in your home directory. It is scoped per Aurora repo, so two repos open in parallel can be in different modes without interfering.
:::

## What changes between modes

The modes are not enforcement — they are **declared intent**. They shape three things.

1. **What AI does by default.** Skills and agents that apply to both backend and frontend read the current mode and prefer the matching behavior. In Framework mode they propose extractions and skill updates; in Solution mode they propose CLI invocations and reuse first.
2. **How you review changes.** A PR built in Framework mode is expected to touch `@aurora/` or `.claude/skills/`. A PR built in Solution mode is expected to stay inside the feature folder and consume existing shared code.
3. **What "good enough" means.** In Framework mode, a partial feature that ships a clean reusable primitive is a win. In Solution mode, an inlined one-off that delivers the requirement today is a win, even if it would be worth extracting later.

## When to use each

Pick a mode before starting the session. Switch only when the shape of the work genuinely changes.

| Scenario                                                                          | Mode         |
| --------------------------------------------------------------------------------- | ------------ |
| Adding a new bounded context with the CLI and filling in the business rules       | Solution     |
| Writing a new `@aurora/` composable because several features need the same shape  | Framework    |
| Documenting a convention as a Claude Code skill                                   | Framework    |
| Fixing a bug inside a single module's handler                                     | Solution     |
| Introducing a new generator template or preservation region contract             | Framework    |
| Wiring a new form against existing fetchers and composables                       | Solution     |
| Renaming a shared primitive across the monorepo                                   | Framework    |

A useful heuristic: if your change would be lost — or repeated — if someone else started the next feature from a clean checkout, you are probably in the wrong mode.

## Trade-offs and limits

- **The modes are advisory, not mechanical.** Nothing in the build pipeline rejects a Solution-mode PR that extracts a composable, or a Framework-mode PR that inlines a one-off. The modes work because humans and AI honor them, not because CI enforces them.
- **Mixing modes in one session is usually a signal to stop.** If halfway through you realize the task is actually Framework work, switch explicitly with `/dev-mode framework` instead of quietly letting the work drift. The status line lie is worse than the context switch.
- **Framework mode is not a license to over-engineer.** "Who else might need this?" has a corollary: if the answer is "nobody, plausibly", the pattern does not belong in `@aurora/` yet. Ship the one-off in Solution mode and extract it the second time a consumer appears.
- **Solution mode is not a license to bypass skills.** CLI first and shortest path are not the same thing as ignoring the coding standards documented in `.claude/skills/`. Those apply in every mode.

## Related

- [Backend module scaffolding](../../backend/module-scaffolding/) — the CLI-first workflow that Solution mode leans on.
- [`catalyst load` reference](../../../reference/cli-commands/load/) — the command you reach for first in Solution mode.
