---
title: "SshPort"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [deploy/ports/ssh.port](/aurora-catalyst-docs/es/reference/api/cli/deploy/ports/sshport/readme/) / SshPort

# Interface: SshPort

Defined in: [deploy/ports/ssh.port.ts:9](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/ssh.port.ts#L9)

Port for generating SSH key pairs used by the deploy pipeline (e.g. the
private/public keys installed on hosting + exposed as CI/CD secrets).

The reference adapter shells out to `ssh-keygen` (`src/deploy/adapters/ssh-keygen`).

## Methods

### generateKeyPair()

> **generateKeyPair**(`comment`): `Promise`\<[`SshKeyPair`](/aurora-catalyst-docs/es/reference/api/cli/deploy/domain/model/interfaces/sshkeypair/)\>

Defined in: [deploy/ports/ssh.port.ts:16](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/ssh.port.ts#L16)

Generate a new ED25519 key pair.

#### Parameters

##### comment

`string`

Text appended to the public key (RFC 4716 "comment"),
  typically used to identify the purpose or environment of the key.

#### Returns

`Promise`\<[`SshKeyPair`](/aurora-catalyst-docs/es/reference/api/cli/deploy/domain/model/interfaces/sshkeypair/)\>
