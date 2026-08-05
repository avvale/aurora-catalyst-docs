---
title: "DialogWidth"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [generator/domain/model](/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/readme/) / DialogWidth

# Type Alias: DialogWidth

> **DialogWidth** = `"full"` \| `"lg"` \| `"md"` \| `"sm"` \| `"xl"`

Defined in: [generator/domain/model.ts:62](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/domain/model.ts#L62)

Named-token width for the create/edit dialog, applied only when
`front.detailMode: dialog`. Each token maps to a fixed, viewport-bounded
Tailwind class (`w-[min(<vw>,<cap>)]`) via getDialogWidthClass —
see `src/generator/domain/dialog-width.ts`. Tokens express intent (`lg` =
"this is a wide form"), never raw CSS, so the emitted width can never
regress to a content-driven, shrink-to-fit box (the "dance" bug).
Default `'md'`.
