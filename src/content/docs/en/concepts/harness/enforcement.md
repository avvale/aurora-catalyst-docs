---
title: Enforcement levels
description: Why some harness hooks block a write, most only nudge, and none of them can break your session — plus the catalogue-driven design that keeps rules out of hook code.
---

Not every hook in the harness has the same authority. Some stop a write, some leave a note, and one blocks in a way that deliberately does not stop anything. Telling them apart is what makes the harness predictable instead of mysterious.

## The three levels

| Level | What it does | Where it is used |
| --- | --- | --- |
| **Block** | refuses the action and shows the reason | a violation that breaks architectural integrity |
| **Nudge** | interrupts once to surface context, then lets it through | creating a file in a location with conventions worth knowing |
| **Advisory** | acts or reports without ever interrupting | formatting, startup checks, diagnostics |

A hook signals these through its exit code. Exit `0` lets the action proceed. Exit `2` blocks it and shows the message to the assistant. Hooks that answer with structured output can also return an explicit block decision.

## Why a nudge blocks and still is not a gate

`architecture-checkpoint` exits with `2`. Mechanically that is a block. Conceptually it is not, and the hook's own documentation is emphatic about it.

The reason is the order of two operations: **the path is cached before the block is issued**. So an identical retry to the same path finds the path already recorded and proceeds — with nothing verified in between.

That is not a bug; it is the point. There is no verification signal available at that moment. What the hook can do is guarantee that at the instant a new architectural file is about to appear, the structural context for that location reaches the assistant: which layer it belongs to, which project-structure skill covers it, which rules govern it. Once that context has been delivered, insisting further would only add friction without adding correctness.

The distinction matters practically: **do not rely on this hook to prevent anything.** Real mechanical enforcement lives in the content guard and in the catalogue check you can run over the working tree.

## Why almost nothing blocks

The project's rule is **enforcement proportional to damage**. Mechanical blocking is reserved for rules whose violation genuinely compromises architectural integrity. Placement conventions and stylistic preferences are routed to a skill and, at most, a nudge.

The reasoning is about attention, not about leniency. A guard that fires on every plausible mistake trains people to dismiss it without reading. Keeping the block rare is what makes it informative when it happens.

## The fail-open contract

Every hook in the harness degrades to "do nothing" when it fails on its own. Malformed input, a missing catalogue, an unreadable index, an unexpected exception — none of them turn into an error you have to deal with.

The implementation varies. Most hooks wrap their whole body in a single handler that exits `0`. `architecture-checkpoint` instead guards each risky step separately — reading its input, parsing it, looking up the governing rules — so that a failure in any one of them exits cleanly without altering the structural decision. The guarantee is the same; only the mechanism differs.

This is a deliberate inversion of the usual instinct. A guard that fails closed would turn any infrastructure hiccup into a blocked session; the harness would become the thing standing between you and your work. Failing open means a broken hook costs you its protection, never your session.

Two consequences follow, and both are worth internalising:

- **Absence of a block is not proof of compliance.** If the catalogue is missing, the guard degrades silently to no enforcement.
- **The exhaustive check is a separate step.** The write-time guard catches the common case at the moment it happens; running the catalogue check over the working tree is what covers the rest.

## What the write-time guard cannot see

The content guard only observes the assistant's edit tools, and only the *incoming* text. Three things slip past it by construction:

- content written through a shell command, such as a heredoc or a code generator run;
- a violation that already exists on disk and is merely moved into a governed path;
- anything outside the governed paths of the rule in question.

Knowing the blind spots is part of using the tool correctly. The guard is a fast net at the point of writing, not an audit.

## Rules live in the catalogue, not in the hook

The content guard contains no rule. It reads the harness-rule index, iterates the entries, and acts only on rules that are active *and* declare a detection block — a literal pattern to look for and the paths where it matters.

This has a direct practical consequence: **adding a mechanical rule is a catalogue edit**. You write the rule document, declare its detection block, regenerate the index, and the guard picks it up. Nobody edits hook code to add a rule, and nobody has to review hook code to audit which rules are enforced.

It also explains why the guard's own source file can mention a forbidden pattern without blocking itself: hook code lives outside the paths any rule governs.

## Reading a hook's authority

When you want to know what a given hook can do to you, three questions settle it:

1. **Which trigger point is it on?** Only `UserPromptSubmit`, `PreToolUse` and `PostToolUse` can block at all.
2. **Does it exit 2, or return a block decision?** That is the difference between advisory and enforcing.
3. **Does it cache before blocking?** That is the difference between a gate and a nudge.

The [reference inventory](../../../reference/harness/) answers all three for every hook.

In short: one true block, one nudge that blocks once and then steps aside, and a majority that never interrupt at all — with a fail-open contract underneath guaranteeing that the harness can lose its own protections but never take your session down with it.
