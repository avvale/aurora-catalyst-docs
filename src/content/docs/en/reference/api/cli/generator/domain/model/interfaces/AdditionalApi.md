---
title: "AdditionalApi"
---

[**@aurorajs.dev/catalyst-cli**](../../../../README.md)

***

[@aurorajs.dev/catalyst-cli](../../../../README.md) / [generator/domain/model](../README.md) / AdditionalApi

# Interface: AdditionalApi

Defined in: [generator/domain/model.ts:244](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L244)

Metadata for an ad-hoc endpoint the generator should emit in addition to
the CRUD defaults. Produces a GraphQL resolver or a REST controller route.

## Properties

### httpMethod

> **httpMethod**: [`HttpMethod`](../type-aliases/HttpMethod.md)

Defined in: [generator/domain/model.ts:245](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L245)

***

### path

> **path**: `string`

Defined in: [generator/domain/model.ts:247](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L247)

URL path of the endpoint (REST) or operation name (GraphQL).

***

### resolverType

> **resolverType**: [`ResolverType`](../type-aliases/ResolverType.md)

Defined in: [generator/domain/model.ts:248](https://github.com/avvale/aurora-catalyst-cli/blob/main/src/generator/domain/model.ts#L248)
