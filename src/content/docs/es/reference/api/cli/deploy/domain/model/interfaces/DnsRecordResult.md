---
title: "DnsRecordResult"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [deploy/domain/model](/aurora-catalyst-docs/es/reference/api/cli/deploy/domain/model/readme/) / DnsRecordResult

# Interface: DnsRecordResult

Defined in: [deploy/domain/model.ts:22](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L22)

Outcome of an idempotent DNS upsert. Reveals whether anything actually changed.

## Properties

### action

> **action**: `"created"` \| `"unchanged"` \| `"updated"`

Defined in: [deploy/domain/model.ts:23](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L23)

***

### domain

> **domain**: `string`

Defined in: [deploy/domain/model.ts:24](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L24)

***

### recordType

> **recordType**: [`DnsRecordType`](/aurora-catalyst-docs/es/reference/api/cli/deploy/domain/model/type-aliases/dnsrecordtype/)

Defined in: [deploy/domain/model.ts:25](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L25)

***

### value

> **value**: `string`

Defined in: [deploy/domain/model.ts:26](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L26)
