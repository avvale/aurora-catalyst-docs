---
title: "LoggerPort"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [deploy/ports/logger.port](../README.md) / LoggerPort

# Interface: LoggerPort

Defined in: [deploy/ports/logger.port.ts:7](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L7)

## Properties

### logFilePath

> **logFilePath**: `string`

Defined in: [deploy/ports/logger.port.ts:12](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L12)

## Methods

### error()

> **error**(`message`): `void`

Defined in: [deploy/ports/logger.port.ts:8](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L8)

#### Parameters

##### message

`string`

#### Returns

`void`

***

### header()

> **header**(`title`): `void`

Defined in: [deploy/ports/logger.port.ts:9](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L9)

#### Parameters

##### title

`string`

#### Returns

`void`

***

### info()

> **info**(`message`): `void`

Defined in: [deploy/ports/logger.port.ts:10](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L10)

#### Parameters

##### message

`string`

#### Returns

`void`

***

### logError()

> **logError**(`context`, `error`): `void`

Defined in: [deploy/ports/logger.port.ts:11](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L11)

#### Parameters

##### context

`string`

##### error

`unknown`

#### Returns

`void`

***

### step()

> **step**(`label`): [`Spinner`](Spinner.md)

Defined in: [deploy/ports/logger.port.ts:13](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L13)

#### Parameters

##### label

`string`

#### Returns

[`Spinner`](Spinner.md)

***

### success()

> **success**(`message`): `void`

Defined in: [deploy/ports/logger.port.ts:14](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L14)

#### Parameters

##### message

`string`

#### Returns

`void`

***

### warn()

> **warn**(`message`): `void`

Defined in: [deploy/ports/logger.port.ts:15](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L15)

#### Parameters

##### message

`string`

#### Returns

`void`
