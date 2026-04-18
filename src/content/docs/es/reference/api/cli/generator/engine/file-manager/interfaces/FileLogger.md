---
title: "FileLogger"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/engine/file-manager](../README.md) / FileLogger

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
