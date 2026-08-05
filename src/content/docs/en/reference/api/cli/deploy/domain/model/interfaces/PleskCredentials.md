---
title: "PleskCredentials"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/en/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/en/reference/api/cli/readme/) / [deploy/domain/model](/aurora-catalyst-docs/en/reference/api/cli/deploy/domain/model/readme/) / PleskCredentials

# Interface: PleskCredentials

Defined in: [deploy/domain/model.ts:110](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L110)

Plesk control panel credentials. `sshKey` is an optional path on disk.

## Properties

### apiKey

> **apiKey**: `string`

Defined in: [deploy/domain/model.ts:111](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L111)

***

### host

> **host**: `string`

Defined in: [deploy/domain/model.ts:112](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L112)

***

### sshKey?

> `optional` **sshKey?**: `string`

Defined in: [deploy/domain/model.ts:114](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L114)

Absolute path to the SSH private key used to reach the Plesk box.
