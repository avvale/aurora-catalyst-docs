---
title: "Glossary"
description: "Technical terms that come up across Aurora Catalyst docs and discussions, with concise definitions."
---

This glossary collects technical terms that recur across the Aurora Catalyst docs and in engineering discussions. It is **information-oriented**: short, consultable definitions, ordered alphabetically.

## ack

Short for *acknowledgment*. The signal your system returns to the queue to say: "I've received this message and I'm taking responsibility for it — you can delete it now."

## ACL

Can mean *Anti-Corruption Layer*. A term from DDD (Domain-Driven Design), coined by Eric Evans: a translation layer that shields your domain model from another system's model, so foreign concepts don't leak in and corrupt yours.

## AI slop

Low-quality digital content generated en masse with artificial intelligence.

## BFF

*Backend-For-Frontend*. A pattern where each frontend has its own dedicated backend that acts as an intermediary between that frontend and the services/APIs behind it. The frontend doesn't talk directly to the hub (or to other services): it talks only to its BFF, and the BFF orchestrates/proxies to the rest server-side.

## Caveats

Warnings or qualifications: conditions or limitations to keep in mind before taking something as settled.

## Coalesced

From the English verb *to coalesce*: to merge several things into one. In our context it means grouping several requests into a single call.

## Coalescing

"To merge" or "group into one": collapsing several pending operations that lead to the same result into a single one, so the repeated work isn't done twice.

## Drift

Progressive desynchronization between two things that should stay aligned, when one evolves and the other lags behind.

## DRY

Stands for *Don't Repeat Yourself* — a software design principle that says every piece of knowledge should have a single source of truth in the system, with no duplication.

## Enforcement

Making a rule hold by force — a mechanism that imposes it, rather than one that merely suggests it.

## Failsafe

"Fail-safe": a design in which, if something goes wrong, the system automatically falls into the safe state instead of the dangerous one.

## Fan-out

Spreading out in parallel: launching several tasks at once from a single point, instead of doing them one after another.

## Gate

Really blocks. You don't pass until you meet the condition. It verifies and, if the condition isn't met, it denies.

## Idempotency

The property of an operation that you can run many times with the same result as running it once. Repeating it causes no harm and no additional effects.

## Lift-and-shift

"Lift and shift": migrating something as-is, without redesigning it — you take the code (or a whole system) from one place and drop it into another without adapting it to its new environment.

## Nudge

Only reminds, warns, or adds a little friction. If you insist, you pass anyway. It doesn't check that you actually did the right thing.

## Obliterate

(from the BullMQ API, `obliterate`) is **destroying a queue completely in Redis** — the most destructive action of the queue manager.

Unlike other operations:

- **empty** (`empty`/`drain`): removes waiting/delayed jobs, but the queue stays alive.
- **clean** (`clean`): deletes jobs in a specific state (completed, failed…), the queue stays alive.
- **obliterate** (`obliterate`): **deletes ALL of the queue's keys** — every job (any state), its history, counters, and the queue's own metadata. Nothing is left; it's as if the queue had never existed.

The mental equivalent in SQL isn't `TRUNCATE` (which keeps the empty table) but **`DROP`** (which removes it entirely).

Because of its severity, the design has two safeguards: it requires the highest-level permission **`queue-manager.destroy`**, and the queue must be **paused** first (validated server-side by the *obliterate-paused* guard and confirmed in the UI with a dialog).

In short: obliterate = **wipe out the entire queue** in Redis, irreversible, and therefore the most protected operation in the panel.

## Orthogonal

From geometry: two orthogonal lines are perpendicular, forming 90 degrees. The key property is that moving along one doesn't move you at all along the other. They're independent axes: you can change your position on the X axis without affecting your position on the Y axis.

In software engineering we use the word to say that two dimensions of a problem are independent of each other: knowing the value of one tells you nothing about the value of the other, and changing one doesn't drag the other along.

## Self-healing

"Heals itself." The property of a process that, even if it starts in an incomplete or incorrect state, converges to the correct state by itself on later runs, without manual intervention.

## Snowflake

An engineering-jargon metaphor: a unique, hand-made component, different from all the others — like a snowflake, of which no two are said to be alike.
