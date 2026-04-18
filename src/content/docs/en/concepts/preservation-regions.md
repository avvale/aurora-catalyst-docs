---
title: Preservation regions
description: How Aurora lets you own a slice of a generated file — and why that slice survives regeneration.
---

## Why this exists

Generating code is a blessing until the first time you touch the output. Most generators do one of two things: they run once and you own the result (scaffolding), or they run forever and you submit to whatever they produce (pure determinism). Aurora wants both — deterministic regeneration that keeps your project in sync with the template, **and** the freedom to customize the parts the generator can't nail.

Forms are where this hurts most. A template can get the input fields right 80% of the time, but the last 20% — the exact layout, extra fields, custom validators — needs a human touch. Before preservation regions, any edit inside a generated file forced Aurora to write a `.origin` file next to the original and hand you the merge. Do that ten times in a sprint and you stop regenerating altogether.

Preservation regions give you a contract: **mark a zone, own it forever**. The CLI regenerates everything outside the zone. Inside, your code survives.

## How it works

A preservation region is an HTML comment block the template emits:

```html
<!-- #region AURORA:FORM-FIELDS-START -->
<input name="displayName" />
<!-- #endregion AURORA:FORM-FIELDS-END -->
```

Two things happen at regeneration time.

**The skeleton integrity check ignores region bodies.** When Aurora calculates the hash of a generated file, it strips out everything between the START and END markers. As long as the structure around your regions hasn't been edited by hand, the file is considered "clean" — and the CLI can rewrite the skeleton with the new template output without asking you anything.

**The body inside each region goes through a per-region decision.** The lockfile remembers a hash of what the template last produced for each region. On regeneration:

- If the body on disk matches that hash → you didn't touch it → Aurora writes the new template body. Template improvements propagate.
- If the body on disk doesn't match → you touched it → Aurora preserves your work, byte for byte.

That's it. No three-way merge, no conflict markers, no manual reconciliation. The region either belongs to the template or to you, and the hash tells Aurora which.

If the skeleton itself has been edited by hand (not just the body of a region), Aurora falls back to the old `.origin` behavior — but even then, the `.origin` file already has your preserved regions merged in, so the diff you review focuses on skeleton changes only.

## When it applies

You'll encounter preservation regions in these moments:

- You open a generated HTML form and see `<!-- #region AURORA:FORM-FIELDS-START -->` wrapping the input block. That's the contract. Anything between that comment and the matching END is yours.
- You edit a form, regenerate with `catalyst generate`, and the CLI logs `[REGION PRESERVED] my-form.component.html: FORM-FIELDS`. Your edit survived.
- The template is upgraded (new field type, better accessibility attributes). You regenerate and see `[REGION UPDATED] my-form.component.html: FORM-FIELDS`. You didn't have custom changes there, so the new template body flows in transparently.
- You see `[REGION DROPPED] my-form.component.html: OLD-NAME`. A template you're consuming used to declare that region and no longer does. Whatever you had there is lost — check git if you need to recover it.
- Your lockfile at `cliter/<bc>/.locks/<scope>/<module>.lock.json` grows a `regions` field per entry, mapping region names to hashes. `LOCK_JSON_VERSION` bumps from `0.0.1` to `0.1.0`.

## Trade-offs and limits

Preservation regions are built around a few explicit decisions worth knowing:

- **HTML only (for now).** Scope v1 is `<!-- -->` markers. Template strings inside `.ts` files count — any HTML inside a backtick template literal is recognized. Plain TypeScript, CSS, GraphQL, YAML: not yet. The architecture is ready to add them; the tests aren't.
- **No nested regions.** A region inside another region is rejected at parse time with a clear error. If you need two customizable zones near each other, declare them as siblings with different names.
- **No freestyle user regions.** You can't add `AURORA:MY-CUSTOMIZATION` to a template that doesn't emit it. Preservation regions are a contract the template controls — it decides where the seams are. This is a deliberate limit: without the template declaring the marker, Aurora has no anchor to inject your body back into the new skeleton on the next regeneration.
- **Rename is destructive.** If a template maintainer renames `FORM-FIELDS` to `FORM-BODY`, your existing content under `FORM-FIELDS` shows up as `[REGION DROPPED]` on the next regeneration. The new region starts empty. That's a template versioning concern, not an engine feature.
- **Whitespace noise can cost you updates.** Aurora normalizes line endings and trailing whitespace before hashing region bodies, which covers the 90% case (editor autosave, cross-platform checkouts). If your editor aggressively reformats inside a region, the hash won't match and you'll "own" that region even though you didn't mean to. Safe default, but worth knowing.

## Related

- How-to: Customize a form preserving the layout *(coming)*
- How-to: Add a preservation region to your own template *(coming)*
- Reference: [`lock-file.ts` API](/aurora-catalyst-docs/en/reference/api/cli/generator/engine/lock-file/)
- Reference: lockfile format *(coming)*
