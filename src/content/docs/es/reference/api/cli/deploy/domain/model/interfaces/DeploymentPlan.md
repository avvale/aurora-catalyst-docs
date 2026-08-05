---
title: "DeploymentPlan"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [deploy/domain/model](/aurora-catalyst-docs/es/reference/api/cli/deploy/domain/model/readme/) / DeploymentPlan

# Interface: DeploymentPlan

Defined in: [deploy/domain/model.ts:41](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L41)

Fully resolved plan for deploying a single target in a single environment.
Built by `plan-builder.ts` from `aurora.yaml`, CLI flags, env vars, and file-based
secrets (`plan-resolver.ts`). Every provider port receives data derived from a plan.

## Properties

### database?

> `optional` **database?**: `object`

Defined in: [deploy/domain/model.ts:43](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L43)

Database provisioning config. Omitted when the target has no DB.

#### name

> **name**: `string`

#### password

> **password**: `string`

#### type

> **type**: [`DatabaseType`](/aurora-catalyst-docs/es/reference/api/cli/deploy/domain/model/type-aliases/databasetype/)

#### user

> **user**: `string`

***

### dir

> **dir**: `string`

Defined in: [deploy/domain/model.ts:50](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L50)

Working directory on the server (e.g. `/httpdocs`).

***

### dnsRecordType

> **dnsRecordType**: [`DnsRecordType`](/aurora-catalyst-docs/es/reference/api/cli/deploy/domain/model/type-aliases/dnsrecordtype/)

Defined in: [deploy/domain/model.ts:51](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L51)

***

### dnsValue?

> `optional` **dnsValue?**: `string`

Defined in: [deploy/domain/model.ts:53](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L53)

DNS target value. Defaults to the server host when omitted.

***

### dnsZone

> **dnsZone**: `string`

Defined in: [deploy/domain/model.ts:55](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L55)

DNS zone that owns the record (the registrable parent domain).

***

### domain

> **domain**: `string`

Defined in: [deploy/domain/model.ts:57](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L57)

Fully qualified domain this deployment serves.

***

### dotEnv?

> `optional` **dotEnv?**: `string`

Defined in: [deploy/domain/model.ts:59](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L59)

Plaintext `.env` content, if resolved. Sensitive.

***

### dotEnvEnc?

> `optional` **dotEnvEnc?**: `string`

Defined in: [deploy/domain/model.ts:61](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L61)

Encrypted `.env.{env}.enc` content produced by SOPS.

***

### envConfiguration?

> `optional` **envConfiguration?**: `string`

Defined in: [deploy/domain/model.ts:63](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L63)

Frontend-only: Angular `configuration` name. Defaults to env name.

***

### environment

> **environment**: `string`

Defined in: [deploy/domain/model.ts:65](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L65)

Environment slug (`dev`, `qa`, `prod`, ...).

***

### ftpLogin

> **ftpLogin**: `string`

Defined in: [deploy/domain/model.ts:66](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L66)

***

### ftpPassword

> **ftpPassword**: `string`

Defined in: [deploy/domain/model.ts:67](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L67)

***

### nginxDirectives?

> `optional` **nginxDirectives?**: `string`

Defined in: [deploy/domain/model.ts:69](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L69)

Extra Nginx directives to inject in the vhost, if any.

***

### oauthPrivateKey?

> `optional` **oauthPrivateKey?**: `string`

Defined in: [deploy/domain/model.ts:71](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L71)

OAuth private key (backend targets that require JWT signing).

***

### oauthPublicKey?

> `optional` **oauthPublicKey?**: `string`

Defined in: [deploy/domain/model.ts:73](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L73)

OAuth public key (verification half of the pair above).

***

### pleskSshUser

> **pleskSshUser**: `string`

Defined in: [deploy/domain/model.ts:75](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L75)

Plesk SSH user for operations that require shell access.

***

### project

> **project**: `object`

Defined in: [deploy/domain/model.ts:76](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L76)

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

Defined in: [deploy/domain/model.ts:83](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L83)

Prefix applied to every CI/CD secret/variable name (`ENV_TARGET_...`).

***

### server

> **server**: `object`

Defined in: [deploy/domain/model.ts:84](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L84)

#### host

> **host**: `string`

#### plan

> **plan**: `string`

Hosting plan identifier, provider-specific.

***

### skipCicd

> **skipCicd**: `boolean`

Defined in: [deploy/domain/model.ts:90](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L90)

If true, skip the CI/CD phase for this target.

***

### skipDns

> **skipDns**: `boolean`

Defined in: [deploy/domain/model.ts:92](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L92)

If true, skip DNS upsert.

***

### skipHosting

> **skipHosting**: `boolean`

Defined in: [deploy/domain/model.ts:94](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L94)

If true, skip hosting provisioning (subscription, SSL, etc.).

***

### skipSsh

> **skipSsh**: `boolean`

Defined in: [deploy/domain/model.ts:96](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L96)

If true, do not install SSH keys on the server.

***

### sopsAgeKey?

> `optional` **sopsAgeKey?**: `string`

Defined in: [deploy/domain/model.ts:98](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L98)

SOPS age key used to decrypt `dotEnvEnc`. Sensitive.

***

### startupFile

> **startupFile**: `string`

Defined in: [deploy/domain/model.ts:100](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L100)

Node.js entry file. Auto-detected from `package.json` `main`.

***

### target

> **target**: [`DeployTarget`](/aurora-catalyst-docs/es/reference/api/cli/deploy/domain/model/type-aliases/deploytarget/)

Defined in: [deploy/domain/model.ts:101](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L101)
