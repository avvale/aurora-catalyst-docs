---
title: "HostingPort"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [deploy/ports/hosting.port](../README.md) / HostingPort

# Interface: HostingPort

Defined in: [deploy/ports/hosting.port.ts:3](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L3)

## Methods

### createDatabase()

> **createDatabase**(`params`): `Promise`\<`void`\>

Defined in: [deploy/ports/hosting.port.ts:4](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L4)

#### Parameters

##### params

###### domainId

`number`

###### name

`string`

###### password

`string`

###### type

[`DatabaseType`](../../../domain/model/type-aliases/DatabaseType.md)

###### user

`string`

#### Returns

`Promise`\<`void`\>

***

### createSubscription()

> **createSubscription**(`params`): `Promise`\<[`SubscriptionResult`](../../../domain/model/interfaces/SubscriptionResult.md)\>

Defined in: [deploy/ports/hosting.port.ts:12](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L12)

#### Parameters

##### params

###### domain

`string`

###### ftpLogin

`string`

###### ftpPassword

`string`

###### plan

`string`

#### Returns

`Promise`\<[`SubscriptionResult`](../../../domain/model/interfaces/SubscriptionResult.md)\>

***

### disableProxyMode()

> **disableProxyMode**(`params`): `Promise`\<`void`\>

Defined in: [deploy/ports/hosting.port.ts:19](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L19)

#### Parameters

##### params

###### domain

`string`

#### Returns

`Promise`\<`void`\>

***

### enableNodeJs()

> **enableNodeJs**(`params`): `Promise`\<`void`\>

Defined in: [deploy/ports/hosting.port.ts:21](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L21)

#### Parameters

##### params

###### domain

`string`

###### startupFile

`string`

#### Returns

`Promise`\<`void`\>

***

### enableShellAccess()

> **enableShellAccess**(`params`): `Promise`\<`void`\>

Defined in: [deploy/ports/hosting.port.ts:23](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L23)

#### Parameters

##### params

###### domain

`string`

###### sshUser

`string`

#### Returns

`Promise`\<`void`\>

***

### getAdminEmail()

> **getAdminEmail**(`params`): `Promise`\<`string`\>

Defined in: [deploy/ports/hosting.port.ts:25](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L25)

#### Parameters

##### params

###### sshUser

`string`

#### Returns

`Promise`\<`string`\>

***

### installSshKey()

> **installSshKey**(`params`): `Promise`\<`void`\>

Defined in: [deploy/ports/hosting.port.ts:27](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L27)

#### Parameters

##### params

###### domain

`string`

###### ftpLogin

`string`

###### publicKey

`string`

###### sshUser

`string`

#### Returns

`Promise`\<`void`\>

***

### installSslCertificate()

> **installSslCertificate**(`params`): `Promise`\<`void`\>

Defined in: [deploy/ports/hosting.port.ts:34](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L34)

#### Parameters

##### params

###### domain

`string`

###### email

`string`

###### sshUser

`string`

#### Returns

`Promise`\<`void`\>

***

### setNginxDirectives()

> **setNginxDirectives**(`params`): `Promise`\<`void`\>

Defined in: [deploy/ports/hosting.port.ts:40](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L40)

#### Parameters

##### params

###### directives

`string`

###### domain

`string`

###### sshUser

`string`

#### Returns

`Promise`\<`void`\>
