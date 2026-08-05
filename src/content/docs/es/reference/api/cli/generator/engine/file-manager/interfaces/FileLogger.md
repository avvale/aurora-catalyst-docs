---
title: "FileLogger"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [generator/engine/file-manager](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/file-manager/readme/) / FileLogger

# Interface: FileLogger

Defined in: [generator/engine/file-manager.ts:30](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L30)

Minimal logging surface used by the file manager and file writer.
Matches `oclif.Command.log` so commands can be passed directly.

## Methods

### log()

> **log**(`message`, ...`args`): `void`

Defined in: [generator/engine/file-manager.ts:31](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/generator/engine/file-manager.ts#L31)

#### Parameters

##### message

`string`

##### args

...`unknown`[]

#### Returns

`void`
