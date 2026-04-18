---
title: "Spinner"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [deploy/ports/logger.port](../README.md) / Spinner

# Interface: Spinner

Defined in: [deploy/ports/logger.port.ts:6](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L6)

Progress indicator returned by [LoggerPort.step](LoggerPort.md#step). Backed by `ora` in
the default adapter. Call exactly one of `succeed` / `fail` / `warn` to
close the spinner.

## Methods

### fail()

> **fail**(`text`): `void`

Defined in: [deploy/ports/logger.port.ts:8](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L8)

Stop the spinner with a red failure mark and the given message.

#### Parameters

##### text

`string`

#### Returns

`void`

***

### succeed()

> **succeed**(`text`): `void`

Defined in: [deploy/ports/logger.port.ts:10](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L10)

Stop the spinner with a green check and the given message.

#### Parameters

##### text

`string`

#### Returns

`void`

***

### warn()

> **warn**(`text`): `void`

Defined in: [deploy/ports/logger.port.ts:12](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L12)

Stop the spinner with a yellow warning mark and the given message.

#### Parameters

##### text

`string`

#### Returns

`void`
