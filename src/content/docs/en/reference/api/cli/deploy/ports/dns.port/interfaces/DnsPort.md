---
title: "DnsPort"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [deploy/ports/dns.port](../README.md) / DnsPort

# Interface: DnsPort

Defined in: [deploy/ports/dns.port.ts:9](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/dns.port.ts#L9)

Port for managing DNS records in an external provider (IONOS, Cloudflare, etc.).

Swapping providers is done by implementing a new adapter and wiring it in
`src/deploy/factories/adapter.factory.ts`. No business logic changes.

## Methods

### upsertRecord()

> **upsertRecord**(`params`): `Promise`\<[`DnsRecordResult`](../../../domain/model/interfaces/DnsRecordResult.md)\>

Defined in: [deploy/ports/dns.port.ts:22](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/deploy/ports/dns.port.ts#L22)

Ensure a DNS record exists and points to `value`.

Idempotent: if the record already exists with the same value, returns
`action: 'unchanged'`; if it exists with a different value, updates it and
returns `action: 'updated'`; otherwise creates it and returns `action: 'created'`.

#### Parameters

##### params

###### domain

`string`

Fully qualified domain (e.g. `api.example.com`).

###### type

[`DnsRecordType`](../../../domain/model/type-aliases/DnsRecordType.md)

Record type (`A` or `CNAME`).

###### value

`string`

Target of the record (IP for `A`, hostname for `CNAME`).

###### zone

`string`

DNS zone the record belongs to (e.g. `example.com`).

#### Returns

`Promise`\<[`DnsRecordResult`](../../../domain/model/interfaces/DnsRecordResult.md)\>
