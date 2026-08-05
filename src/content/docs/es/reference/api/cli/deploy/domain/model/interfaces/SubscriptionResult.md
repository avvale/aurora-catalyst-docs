---
title: "SubscriptionResult"
---

[**@aurorajs.dev/catalyst-cli**](/aurora-catalyst-docs/es/reference/api/cli/readme/)

***

[@aurorajs.dev/catalyst-cli](/aurora-catalyst-docs/es/reference/api/cli/readme/) / [deploy/domain/model](/aurora-catalyst-docs/es/reference/api/cli/deploy/domain/model/readme/) / SubscriptionResult

# Interface: SubscriptionResult

Defined in: [deploy/domain/model.ts:30](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L30)

Outcome of a hosting subscription create (or reuse).

## Properties

### action

> **action**: `"created"` \| `"existing"`

Defined in: [deploy/domain/model.ts:31](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L31)

***

### domainId

> **domainId**: `number`

Defined in: [deploy/domain/model.ts:33](https://github.com/avvale/aurora-catalyst/blob/main/packages/cli/src/deploy/domain/model.ts#L33)

Numeric ID used by the hosting provider to identify this subscription.
