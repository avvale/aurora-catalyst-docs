---
title: "HostingPort"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [deploy/ports/hosting.port](../README.md) / HostingPort

# Interface: HostingPort

Defined in: [deploy/ports/hosting.port.ts:11](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L11)

Port for managing hosting resources — domains, databases, Node.js runtime,
SSL certificates, SSH access, Nginx directives.

The reference adapter targets Plesk (`src/deploy/adapters/plesk-hosting`).
Replace it by implementing this interface against another control panel
(cPanel, DirectAdmin, etc.) and updating `adapter.factory.ts`.

## Methods

### createDatabase()

> **createDatabase**(`params`): `Promise`\<`void`\>

Defined in: [deploy/ports/hosting.port.ts:18](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L18)

Create a database attached to an existing subscription.

#### Parameters

##### params

###### domainId

`number`

Subscription/domain identifier returned by
  [HostingPort.createSubscription](#createsubscription).

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

Defined in: [deploy/ports/hosting.port.ts:32](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L32)

Create (or reuse) a hosting subscription and its FTP credentials for a domain.

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

Object with `domainId` (numeric identifier used by later calls)
  and `action: 'created' | 'existing'`.

***

### disableProxyMode()

> **disableProxyMode**(`params`): `Promise`\<`void`\>

Defined in: [deploy/ports/hosting.port.ts:40](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L40)

Turn off proxy mode (direct traffic, no reverse proxy) for the domain.

#### Parameters

##### params

###### domain

`string`

#### Returns

`Promise`\<`void`\>

***

### enableNodeJs()

> **enableNodeJs**(`params`): `Promise`\<`void`\>

Defined in: [deploy/ports/hosting.port.ts:43](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L43)

Enable the Node.js runtime and register its startup file for the domain.

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

Defined in: [deploy/ports/hosting.port.ts:46](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L46)

Grant shell access to the subscription's SSH user.

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

Defined in: [deploy/ports/hosting.port.ts:49](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L49)

Return the administrative email associated with the given SSH user.

#### Parameters

##### params

###### sshUser

`string`

#### Returns

`Promise`\<`string`\>

***

### installSshKey()

> **installSshKey**(`params`): `Promise`\<`void`\>

Defined in: [deploy/ports/hosting.port.ts:52](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L52)

Install an SSH public key for the given FTP user inside the subscription.

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

Defined in: [deploy/ports/hosting.port.ts:60](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L60)

Issue and install a Let's Encrypt SSL certificate for the domain.

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

Defined in: [deploy/ports/hosting.port.ts:67](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/hosting.port.ts#L67)

Replace the Nginx `server { ... }` block directives for the domain.

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
