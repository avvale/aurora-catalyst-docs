---
title: "LoggerPort"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [deploy/ports/logger.port](../README.md) / LoggerPort

# Interface: LoggerPort

Defined in: [deploy/ports/logger.port.ts:22](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L22)

Port for writing user-facing progress output during a deploy run.

Implementations decide whether to write to the terminal (interactive CLI),
to a file for CI logs, or to a silent sink for tests. The business logic in
`DeployService` depends only on this interface, never on `chalk` / `ora`.

## Properties

### logFilePath

> **logFilePath**: `string`

Defined in: [deploy/ports/logger.port.ts:35](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L35)

Absolute path to the log file the logger is currently writing to.

## Methods

### error()

> **error**(`message`): `void`

Defined in: [deploy/ports/logger.port.ts:24](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L24)

Print an error-level message. Does not throw.

#### Parameters

##### message

`string`

#### Returns

`void`

***

### header()

> **header**(`title`): `void`

Defined in: [deploy/ports/logger.port.ts:26](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L26)

Print a prominent section header (e.g. before starting a phase).

#### Parameters

##### title

`string`

#### Returns

`void`

***

### info()

> **info**(`message`): `void`

Defined in: [deploy/ports/logger.port.ts:28](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L28)

Print an informational message.

#### Parameters

##### message

`string`

#### Returns

`void`

***

### logError()

> **logError**(`context`, `error`): `void`

Defined in: [deploy/ports/logger.port.ts:33](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L33)

Append a structured entry to the log file about a caught error.
`context` identifies where the error came from; `error` is pretty-printed.

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

Defined in: [deploy/ports/logger.port.ts:40](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L40)

Start a spinner with `label` and return it. The caller is responsible for
closing it via `succeed` / `fail` / `warn`.

#### Parameters

##### label

`string`

#### Returns

[`Spinner`](Spinner.md)

***

### success()

> **success**(`message`): `void`

Defined in: [deploy/ports/logger.port.ts:42](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L42)

Print a success-level message.

#### Parameters

##### message

`string`

#### Returns

`void`

***

### warn()

> **warn**(`message`): `void`

Defined in: [deploy/ports/logger.port.ts:44](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/logger.port.ts#L44)

Print a warning-level message.

#### Parameters

##### message

`string`

#### Returns

`void`
