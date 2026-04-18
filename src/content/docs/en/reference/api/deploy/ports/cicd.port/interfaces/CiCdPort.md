---
title: "CiCdPort"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [deploy/ports/cicd.port](../README.md) / CiCdPort

# Interface: CiCdPort

Defined in: [deploy/ports/cicd.port.ts:1](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/cicd.port.ts#L1)

## Methods

### setSecrets()

> **setSecrets**(`params`): `Promise`\<`void`\>

Defined in: [deploy/ports/cicd.port.ts:2](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/cicd.port.ts#L2)

#### Parameters

##### params

###### repo

`string`

###### secrets

`Record`\<`string`, `string`\>

#### Returns

`Promise`\<`void`\>

***

### setVariables()

> **setVariables**(`params`): `Promise`\<`void`\>

Defined in: [deploy/ports/cicd.port.ts:7](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/cicd.port.ts#L7)

#### Parameters

##### params

###### repo

`string`

###### variables

`Record`\<`string`, `string`\>

#### Returns

`Promise`\<`void`\>

***

### verifyAuth()

> **verifyAuth**(): `Promise`\<`void`\>

Defined in: [deploy/ports/cicd.port.ts:12](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/cicd.port.ts#L12)

#### Returns

`Promise`\<`void`\>
