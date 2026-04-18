---
title: "DeploymentPlan"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [deploy/domain/model](../README.md) / DeploymentPlan

# Interface: DeploymentPlan

Defined in: [deploy/domain/model.ts:30](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L30)

## Properties

### database?

> `optional` **database?**: `object`

Defined in: [deploy/domain/model.ts:31](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L31)

#### name

> **name**: `string`

#### password

> **password**: `string`

#### type

> **type**: [`DatabaseType`](../type-aliases/DatabaseType.md)

#### user

> **user**: `string`

***

### dir

> **dir**: `string`

Defined in: [deploy/domain/model.ts:37](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L37)

***

### dnsRecordType

> **dnsRecordType**: [`DnsRecordType`](../type-aliases/DnsRecordType.md)

Defined in: [deploy/domain/model.ts:38](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L38)

***

### dnsValue?

> `optional` **dnsValue?**: `string`

Defined in: [deploy/domain/model.ts:39](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L39)

***

### dnsZone

> **dnsZone**: `string`

Defined in: [deploy/domain/model.ts:40](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L40)

***

### domain

> **domain**: `string`

Defined in: [deploy/domain/model.ts:41](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L41)

***

### dotEnv?

> `optional` **dotEnv?**: `string`

Defined in: [deploy/domain/model.ts:42](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L42)

***

### dotEnvEnc?

> `optional` **dotEnvEnc?**: `string`

Defined in: [deploy/domain/model.ts:43](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L43)

***

### envConfiguration?

> `optional` **envConfiguration?**: `string`

Defined in: [deploy/domain/model.ts:44](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L44)

***

### environment

> **environment**: `string`

Defined in: [deploy/domain/model.ts:45](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L45)

***

### ftpLogin

> **ftpLogin**: `string`

Defined in: [deploy/domain/model.ts:46](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L46)

***

### ftpPassword

> **ftpPassword**: `string`

Defined in: [deploy/domain/model.ts:47](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L47)

***

### nginxDirectives?

> `optional` **nginxDirectives?**: `string`

Defined in: [deploy/domain/model.ts:48](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L48)

***

### oauthPrivateKey?

> `optional` **oauthPrivateKey?**: `string`

Defined in: [deploy/domain/model.ts:49](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L49)

***

### oauthPublicKey?

> `optional` **oauthPublicKey?**: `string`

Defined in: [deploy/domain/model.ts:50](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L50)

***

### pleskSshUser

> **pleskSshUser**: `string`

Defined in: [deploy/domain/model.ts:51](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L51)

***

### project

> **project**: `object`

Defined in: [deploy/domain/model.ts:52](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L52)

#### email?

> `optional` **email?**: `string`

#### name

> **name**: `string`

#### repo

> **repo**: `string`

***

### secretPrefix

> **secretPrefix**: `string`

Defined in: [deploy/domain/model.ts:57](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L57)

***

### server

> **server**: `object`

Defined in: [deploy/domain/model.ts:58](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L58)

#### host

> **host**: `string`

#### plan

> **plan**: `string`

***

### skipCicd

> **skipCicd**: `boolean`

Defined in: [deploy/domain/model.ts:62](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L62)

***

### skipDns

> **skipDns**: `boolean`

Defined in: [deploy/domain/model.ts:63](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L63)

***

### skipHosting

> **skipHosting**: `boolean`

Defined in: [deploy/domain/model.ts:64](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L64)

***

### skipSsh

> **skipSsh**: `boolean`

Defined in: [deploy/domain/model.ts:65](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L65)

***

### sopsAgeKey?

> `optional` **sopsAgeKey?**: `string`

Defined in: [deploy/domain/model.ts:66](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L66)

***

### startupFile

> **startupFile**: `string`

Defined in: [deploy/domain/model.ts:67](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L67)

***

### target

> **target**: [`DeployTarget`](../type-aliases/DeployTarget.md)

Defined in: [deploy/domain/model.ts:68](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L68)
