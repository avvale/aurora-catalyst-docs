---
title: "DnsPort"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [deploy/ports/dns.port](../README.md) / DnsPort

# Interface: DnsPort

Defined in: [deploy/ports/dns.port.ts:3](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/dns.port.ts#L3)

## Methods

### upsertRecord()

> **upsertRecord**(`params`): `Promise`\<[`DnsRecordResult`](../../../domain/model/interfaces/DnsRecordResult.md)\>

Defined in: [deploy/ports/dns.port.ts:4](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/dns.port.ts#L4)

#### Parameters

##### params

###### domain

`string`

###### type

[`DnsRecordType`](../../../domain/model/type-aliases/DnsRecordType.md)

###### value

`string`

###### zone

`string`

#### Returns

`Promise`\<[`DnsRecordResult`](../../../domain/model/interfaces/DnsRecordResult.md)\>
