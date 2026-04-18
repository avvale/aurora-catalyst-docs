---
title: "DeploymentPlan"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [deploy/domain/model](../README.md) / DeploymentPlan

# Interface: DeploymentPlan

Defined in: [deploy/domain/model.ts:53](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L53)

Fully resolved plan for deploying a single target in a single environment.

Built by `src/deploy/domain/plan-builder.ts` from the project's
`aurora.yaml`, the active environment, CLI flags, env vars, and file-based
secrets (`plan-resolver.ts`). Every provider port receives data derived
from one of these plans.

## Properties

### database?

> `optional` **database?**: `object`

Defined in: [deploy/domain/model.ts:55](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L55)

Database provisioning config. Omitted when the target has no DB.

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

Defined in: [deploy/domain/model.ts:62](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L62)

Working directory on the server (e.g. `/httpdocs`).

***

### dnsRecordType

> **dnsRecordType**: [`DnsRecordType`](../type-aliases/DnsRecordType.md)

Defined in: [deploy/domain/model.ts:63](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L63)

***

### dnsValue?

> `optional` **dnsValue?**: `string`

Defined in: [deploy/domain/model.ts:65](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L65)

DNS target value. Defaults to the server host when omitted.

***

### dnsZone

> **dnsZone**: `string`

Defined in: [deploy/domain/model.ts:67](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L67)

DNS zone that owns the record (the registrable parent domain).

***

### domain

> **domain**: `string`

Defined in: [deploy/domain/model.ts:69](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L69)

Fully qualified domain this deployment serves.

***

### dotEnv?

> `optional` **dotEnv?**: `string`

Defined in: [deploy/domain/model.ts:71](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L71)

Plaintext `.env` content, if resolved. Sensitive.

***

### dotEnvEnc?

> `optional` **dotEnvEnc?**: `string`

Defined in: [deploy/domain/model.ts:73](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L73)

Encrypted `.env.{env}.enc` content produced by SOPS.

***

### envConfiguration?

> `optional` **envConfiguration?**: `string`

Defined in: [deploy/domain/model.ts:75](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L75)

Frontend-only: Angular `configuration` name. Defaults to env name.

***

### environment

> **environment**: `string`

Defined in: [deploy/domain/model.ts:77](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L77)

Environment slug (`dev`, `qa`, `prod`, ...).

***

### ftpLogin

> **ftpLogin**: `string`

Defined in: [deploy/domain/model.ts:78](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L78)

***

### ftpPassword

> **ftpPassword**: `string`

Defined in: [deploy/domain/model.ts:79](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L79)

***

### nginxDirectives?

> `optional` **nginxDirectives?**: `string`

Defined in: [deploy/domain/model.ts:81](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L81)

Extra Nginx directives to inject in the vhost, if any.

***

### oauthPrivateKey?

> `optional` **oauthPrivateKey?**: `string`

Defined in: [deploy/domain/model.ts:83](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L83)

OAuth private key (backend targets that require JWT signing).

***

### oauthPublicKey?

> `optional` **oauthPublicKey?**: `string`

Defined in: [deploy/domain/model.ts:85](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L85)

OAuth public key (verification half of the pair above).

***

### pleskSshUser

> **pleskSshUser**: `string`

Defined in: [deploy/domain/model.ts:87](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L87)

Plesk SSH user for operations that require shell access.

***

### project

> **project**: `object`

Defined in: [deploy/domain/model.ts:88](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L88)

#### email?

> `optional` **email?**: `string`

#### name

> **name**: `string`

#### repo

> **repo**: `string`

`owner/repo` slug used by the CI/CD adapter.

***

### secretPrefix

> **secretPrefix**: `string`

Defined in: [deploy/domain/model.ts:95](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L95)

Prefix applied to every CI/CD secret/variable name (`ENV_TARGET_...`).

***

### server

> **server**: `object`

Defined in: [deploy/domain/model.ts:96](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L96)

#### host

> **host**: `string`

#### plan

> **plan**: `string`

Hosting plan identifier, provider-specific.

***

### skipCicd

> **skipCicd**: `boolean`

Defined in: [deploy/domain/model.ts:102](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L102)

If true, skip the CI/CD phase for this target.

***

### skipDns

> **skipDns**: `boolean`

Defined in: [deploy/domain/model.ts:104](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L104)

If true, skip DNS upsert.

***

### skipHosting

> **skipHosting**: `boolean`

Defined in: [deploy/domain/model.ts:106](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L106)

If true, skip hosting provisioning (subscription, SSL, etc.).

***

### skipSsh

> **skipSsh**: `boolean`

Defined in: [deploy/domain/model.ts:108](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L108)

If true, do not install SSH keys on the server.

***

### sopsAgeKey?

> `optional` **sopsAgeKey?**: `string`

Defined in: [deploy/domain/model.ts:110](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L110)

SOPS age key used to decrypt `dotEnvEnc`. Sensitive.

***

### startupFile

> **startupFile**: `string`

Defined in: [deploy/domain/model.ts:112](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L112)

Node.js entry file. Auto-detected from `package.json` `main`.

***

### target

> **target**: [`DeployTarget`](../type-aliases/DeployTarget.md)

Defined in: [deploy/domain/model.ts:113](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L113)
