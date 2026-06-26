---
title: Register handlers by key
description: Decorate a provider with @Handler, dispatch to all handlers for a runtime key with KeyedHandlerRegistry.resolveAll, and verify discovery in a TestingModule.
---

## Goal

Register one or more providers as handlers for a runtime key, then dispatch to every handler bound to that key — without the dispatcher importing any concrete handler. This is the pattern behind keyed, fan-out dispatch (event projection, command routing, message handling).

For the *why* behind the design — boot-time discovery, the accumulating decorator, the domain-agnostic index — see [The handler registry](../../../concepts/backend/handler-registry/).

## Before you start

- `HandlerRegistryModule` is a `@Global()` framework module under `@aurora/modules/handler-registry`. It is imported once near the application root, so `KeyedHandlerRegistry` is injectable everywhere — you do not import the module in your own feature module.
- The handlers you want to dispatch to are **class providers** registered in some module's `providers`. The registry discovers providers by their class metatype; `useValue` / `useFactory` providers are not scanned.
- Decide the **shared interface** your handlers implement and the dispatcher calls. The registry returns raw instances — the contract between dispatcher and handler is yours to define.

## Steps

1. **Define the handler contract.** A plain interface the dispatcher depends on and every handler implements. Keep the keys in shared constants so both sides reference the same value.

   ```typescript
   // order-handler.contract.ts
   export const ORDER_CREATED = 'order.created';
   export const ORDER_CANCELLED = 'order.cancelled';

   export interface OrderHandler {
     handle(payload: unknown): Promise<void>;
   }
   ```

2. **Decorate each provider with `@Handler(...)`.** Import the decorator from the framework module. A provider can answer one key, several at once (variadic), or several via stacked decorators — all forms accumulate:

   ```typescript
   import { Handler } from '@aurora/modules/handler-registry';
   import { Injectable } from '@nestjs/common';
   import { ORDER_CREATED, ORDER_CANCELLED, OrderHandler } from './order-handler.contract';

   @Handler(ORDER_CREATED)
   @Injectable()
   export class UpdateInventoryHandler implements OrderHandler {
     async handle(payload: unknown): Promise<void> { /* … */ }
   }

   // One provider, two keys — both resolvable to the same instance.
   @Handler(ORDER_CREATED, ORDER_CANCELLED)
   @Injectable()
   export class AuditOrderHandler implements OrderHandler {
     async handle(payload: unknown): Promise<void> { /* … */ }
   }
   ```

   `@Handler` must sit alongside `@Injectable()` — discovery only sees instances NestJS actually created.

3. **Register the handlers as providers.** Add them to the `providers` array of their module. If a handler lives in a different module from the dispatcher, that is fine — the registry indexes across the whole app at boot; you do not need to export the handler for the *registry* to find it. (You only export it if some other module injects the class directly.)

   ```typescript
   @Module({
     providers: [UpdateInventoryHandler, AuditOrderHandler],
   })
   export class OrderModule {}
   ```

4. **Inject the registry into your dispatcher and fan out with `resolveAll`.** Type the generic with your contract so the loop is typed:

   ```typescript
   import { Injectable } from '@nestjs/common';
   import { KeyedHandlerRegistry } from '@aurora/modules/handler-registry';
   import { OrderHandler } from './order-handler.contract';

   @Injectable()
   export class OrderDispatcher {
     constructor(private readonly registry: KeyedHandlerRegistry<OrderHandler>) {}

     async dispatch(type: string, payload: unknown): Promise<void> {
       // resolveAll never throws — an unknown key yields [] and the loop is a no-op.
       for (const handler of this.registry.resolveAll(type)) {
         await handler.handle(payload);
       }
     }
   }
   ```

   The dispatcher imports only `OrderHandler` — never a concrete handler. Adding a new handler for `order.created` later is one new decorated provider; this file does not change.

## Verify it worked

Write a discovery spec. Build a `TestingModule` with `DiscoveryModule` and `KeyedHandlerRegistry`, register the real handler, and **call `moduleRef.init()`** — `compile()` alone does *not* fire `OnModuleInit`, so the discovery scan never runs and every `resolveAll` returns `[]`.

```typescript
import { DiscoveryModule } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { KeyedHandlerRegistry } from '@aurora/modules/handler-registry';
import { UpdateInventoryHandler } from './update-inventory.handler';
import { ORDER_CREATED } from './order-handler.contract';

it('discovers the @Handler provider under its key', async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [DiscoveryModule],
    providers: [KeyedHandlerRegistry, UpdateInventoryHandler],
  }).compile();
  await moduleRef.init(); // triggers onModuleInit → the discovery scan runs

  const registry = moduleRef.get(KeyedHandlerRegistry);
  const handler = moduleRef.get(UpdateInventoryHandler);

  const result = registry.resolveAll(ORDER_CREATED);
  expect(result).toHaveLength(1);
  expect(result[0]).toBe(handler); // the DI-managed singleton, by reference
});
```

To prove fan-out, register several handlers for the same key and assert `resolveAll(key)` returns all of them. To prove the no-throw contract, assert an unknown key returns `[]`.

## Troubleshooting

**`resolveAll` returns `[]` for a key you registered.** Three usual causes: (1) the handler is not in any module's `providers`, so NestJS never instantiated it; (2) the key string on `@Handler` does not match the one passed to `resolveAll` — centralize keys in constants to eliminate this; (3) in a test you called `compile()` but forgot `init()`, so `onModuleInit` never ran.

**A provider is registered but never discovered.** The scan reads metadata off the class metatype, so `useValue` and `useFactory` providers are skipped — they have no class metatype. Handlers must be class providers (`@Injectable()` classes listed directly, or `useClass`).

**Only one of two stacked keys resolves.** You are using a hand-rolled decorator that calls `Reflect.defineMetadata` and overwrites. Use the framework `@Handler`, which accumulates keys across stacked calls.

**The returned instances are not the type you expected.** `KeyedHandlerRegistry<T>` casts the result to `T[]`; it does not verify the instances implement `T`. Make every handler `implements` the shared interface so the generic is truthful, and never file unrelated providers under the same key.

## Related

- [The handler registry](../../../concepts/backend/handler-registry/) — the design and trade-offs behind this recipe.
- [Cross-bounded-context ports](../../../concepts/backend/cross-bounded-context-ports/) — the static counterpart for cross-BC dependencies known at compile time.
