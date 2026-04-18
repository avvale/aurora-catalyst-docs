---
title: "DnsRecordResult"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [deploy/domain/model](../README.md) / DnsRecordResult

# Interface: DnsRecordResult

Defined in: [deploy/domain/model.ts:29](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L29)

Outcome of an idempotent DNS upsert. Reveals whether anything actually changed.

## Properties

### action

> **action**: `"created"` \| `"unchanged"` \| `"updated"`

Defined in: [deploy/domain/model.ts:30](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L30)

***

### domain

> **domain**: `string`

Defined in: [deploy/domain/model.ts:31](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L31)

***

### recordType

> **recordType**: [`DnsRecordType`](../type-aliases/DnsRecordType.md)

Defined in: [deploy/domain/model.ts:32](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L32)

***

### value

> **value**: `string`

Defined in: [deploy/domain/model.ts:33](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/domain/model.ts#L33)
