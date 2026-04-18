---
title: "CiCdPort"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [deploy/ports/cicd.port](../README.md) / CiCdPort

# Interface: CiCdPort

Defined in: [deploy/ports/cicd.port.ts:7](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/cicd.port.ts#L7)

Port for pushing secrets and variables to a CI/CD provider (GitHub Actions,
GitLab CI, etc.) so generated workflows can consume them at deploy time.

The reference adapter targets GitHub (`src/deploy/adapters/github-cicd`).

## Methods

### setSecrets()

> **setSecrets**(`params`): `Promise`\<`void`\>

Defined in: [deploy/ports/cicd.port.ts:14](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/cicd.port.ts#L14)

Create or update encrypted repository secrets in bulk.

#### Parameters

##### params

###### repo

`string`

`owner/name` slug of the target repository.

###### secrets

`Record`\<`string`, `string`\>

Secret name → value map. Each entry is upserted.

#### Returns

`Promise`\<`void`\>

***

### setVariables()

> **setVariables**(`params`): `Promise`\<`void`\>

Defined in: [deploy/ports/cicd.port.ts:23](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/cicd.port.ts#L23)

Create or update non-secret repository variables in bulk.
Variables are visible in workflow runs and safe for non-sensitive values.

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

Defined in: [deploy/ports/cicd.port.ts:32](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/cicd.port.ts#L32)

Validate that the configured credentials can authenticate against the
provider. Throws with a descriptive error otherwise.

#### Returns

`Promise`\<`void`\>
