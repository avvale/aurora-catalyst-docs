---
title: "FileLogger"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [generator/engine/file-manager](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/file-manager/readme/) / FileLogger

# Interface: FileLogger

Defined in: [generator/engine/file-manager.ts:34](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L34)

Minimal logging surface used by the file manager and file writer.

Matches `oclif.Command.log` so commands can be passed directly; tests and
programmatic callers can pass any object with a `log` method.

## Methods

### log()

> **log**(`message`, ...`args`): `void`

Defined in: [generator/engine/file-manager.ts:35](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/engine/file-manager.ts#L35)

#### Parameters

##### message

`string`

##### args

...`unknown`[]

#### Returns

`void`
