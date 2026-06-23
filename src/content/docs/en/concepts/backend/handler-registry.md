---
title: The handler registry
description: How Aurora Catalyst dispatches work to pluggable handlers by a runtime key — the @Handler decorator, boot-time discovery via DiscoveryService, and the domain-agnostic KeyedHandlerRegistry.
---

## Why this exists

Some backend work cannot be wired to a single, statically-known collaborator. A worker that consumes integration events does not know at compile time which piece of code should react to `order.created` versus `payment.received` — and it should not have to. New reactions get added over time, sometimes by a different bounded context, and the dispatcher should stay untouched when they do.

The naive fix is a `switch` on the key, or a module that imports every possible handler and injects them by hand. Both fuse the dispatcher to the full set of handlers: every new handler edits the dispatcher, and the dispatcher ends up importing across bounded-context boundaries it has no business knowing about.

The handler registry is the alternative. A provider declares the keys it handles with a `@Handler(...)` decorator; the framework discovers every decorated provider once at boot and indexes them by key; and a dispatcher asks `resolveAll(key)` for the handlers registered under a key — without importing any of them, and without changing when a new one is added.

The module lives at `backend/src/@aurora/modules/handler-registry/` and is imported through your code as `@aurora/modules/handler-registry`.

## The three pieces

### 1. `@Handler(...keys)` — the marker

A class decorator that records, in reflection metadata, the keys a provider answers to. It supports both variadic and stacked forms:

```ts
@Handler('order.created', 'order.updated')   // variadic — both keys in one call
@Injectable()
export class OrderProjector { /* … */ }

@Handler('payment.received')                  // stacked — two separate calls
@Handler('payment.refunded')                  // on the same class
@Injectable()
export class PaymentProjector { /* … */ }
```

The decorator **accumulates** keys rather than overwriting them. Each call reads the metadata already on the target and merges its new keys in:

```ts
export function Handler(...keys: string[]): ClassDecorator {
  return (target: object): void => {
    const existing: string[] = Reflect.getMetadata(HANDLER_KEYS, target) ?? [];
    Reflect.defineMetadata(HANDLER_KEYS, [...existing, ...keys], target);
  };
}
```

This matters for the stacked form. A naive `Reflect.defineMetadata(HANDLER_KEYS, keys, target)` would overwrite on every call, so two stacked `@Handler` decorators would silently drop all but the last-applied one. Accumulating on read keeps every key discoverable.

### 2. `KeyedHandlerRegistry` — the index

An `@Injectable()` service that implements `OnModuleInit`. At boot it walks every provider NestJS knows about, reads its `@Handler` keys, and files the provider's **instance** under each key in a `Map<string, T[]>`:

```ts
@Injectable()
export class KeyedHandlerRegistry<T = unknown> implements OnModuleInit {
  private readonly byKey = new Map<string, T[]>();

  constructor(private readonly discovery: DiscoveryService) {}

  onModuleInit(): void {
    for (const wrapper of this.discovery.getProviders()) {
      if (!wrapper.metatype) continue;
      const keys: string[] | undefined = Reflect.getMetadata(HANDLER_KEYS, wrapper.metatype);
      if (!keys?.length) continue;
      for (const key of keys) {
        const existing = this.byKey.get(key) ?? [];
        existing.push(wrapper.instance as T);
        this.byKey.set(key, existing);
      }
    }
  }

  resolveAll(key: string): T[] {
    return this.byKey.get(key) ?? [];
  }
}
```

Two properties fall out of this design:

- **Discovery happens once, at boot.** The `onModuleInit` lifecycle hook runs the scan exactly one time. Runtime `resolveAll` calls are a plain map lookup — no reflection, no re-scanning.
- **The registry is domain-agnostic.** It stores raw instances of `T` (defaulting to `unknown`) and hands them back untouched. It never knows what methods a handler exposes; the caller does. That is what lets the module import nothing from any bounded context or from `@app` — it depends only on `@nestjs/common` and `@nestjs/core`.

`resolveAll` **never throws**. An unknown key returns an empty array, so a dispatcher can fan out over zero handlers without a guard.

### 3. `HandlerRegistryModule` — the wiring

A framework module decorated `@Global()`. It imports `DiscoveryModule` (which provides the `DiscoveryService` the registry needs), and provides and exports `KeyedHandlerRegistry`:

```ts
@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [KeyedHandlerRegistry],
  exports: [KeyedHandlerRegistry],
})
export class HandlerRegistryModule {}
```

Because it is `@Global()`, any module — in any bounded context — can inject `KeyedHandlerRegistry` without importing this module explicitly. It is imported once near the application root and is then available everywhere.

## How a dispatch flows

Put together, a single dispatch looks like this:

1. **At boot**, `KeyedHandlerRegistry.onModuleInit` scans all providers and builds the `byKey` index. Every `@Handler`-decorated provider that NestJS instantiated is now reachable by its keys.
2. **At runtime**, a dispatcher injects the registry and calls `resolveAll(someRuntimeKey)`.
3. The registry returns the array of handler instances filed under that key — the DI-managed singletons, in registration order.
4. The dispatcher iterates and invokes whatever method the shared handler interface defines.

That last step needs a method to call — and `handle` does **not** come from the registry. The registry returns raw instances and knows nothing about their methods. `handle` comes from a contract *you* define and every handler implements; you hand that contract to the registry as its generic type parameter so the returned instances are typed:

```ts
// 1. The contract the dispatcher depends on and every handler implements.
export interface OrderHandler {
  handle(payload: unknown): Promise<void>;
}

// 2. A handler implements it — this is where the `handle` method physically lives.
@Handler('order.created')
@Injectable()
export class UpdateInventory implements OrderHandler {
  async handle(payload: unknown): Promise<void> { /* … */ }
}

// 3. The dispatcher types the registry with that contract, so resolveAll returns OrderHandler[].
@Injectable()
export class EventDispatcher {
  constructor(private readonly registry: KeyedHandlerRegistry<OrderHandler>) {}

  async dispatch(event: { type: string; payload: unknown }): Promise<void> {
    for (const handler of this.registry.resolveAll(event.type)) {
      await handler.handle(event.payload); // .handle() comes from OrderHandler, not from the registry
    }
  }
}
```

The generic `<OrderHandler>` is the bridge between the typeless registry and your contract: it makes `resolveAll` return `OrderHandler[]` instead of `unknown[]`, so TypeScript knows each element has `.handle()`. It is a *typing* bridge, not a runtime guarantee — see [the trade-off below](#trade-offs-and-limits): if you file a provider that does not implement `OrderHandler` under the same key, the cast lies and `.handle()` fails at runtime. The rule that follows is that every handler under a given key implements the same interface.

The dispatcher imports `OrderHandler` (the interface it expects) and nothing else. It never imports a concrete projector, so adding a new projector for `order.created` is a matter of writing one `@Handler('order.created')`-decorated provider — the dispatcher does not change.

## Fan-out: many handlers, one key

The index is a `Map<string, T[]>`, not `Map<string, T>`. Several providers can declare the same key, and `resolveAll` returns all of them:

```ts
@Handler('order.created') @Injectable() class UpdateInventory {}
@Handler('order.created') @Injectable() class SendConfirmation {}
@Handler('order.created') @Injectable() class NotifyWarehouse {}

registry.resolveAll('order.created'); // → [UpdateInventory, SendConfirmation, NotifyWarehouse]
```

This is the registry's reason for existing over a plain `Map` lookup: a key fans out to every handler that subscribed to it, and the dispatcher loops over the result without knowing how many there are.

The same instance can also appear under several keys — a provider with `@Handler('a', 'b')` is filed under both, and `resolveAll('a')` and `resolveAll('b')` return the same DI-managed singleton.

## Trade-offs and limits

- **Discovery is boot-time only.** A provider added to the DI graph after bootstrap is not indexed. In practice every NestJS provider is known at boot, so this is rarely a constraint — but dynamically-created instances outside the module graph will not appear.
- **Keys are plain strings, unchecked at compile time.** A typo in a key — on either the `@Handler` side or the `resolveAll` side — does not error; it silently resolves to `[]`. Centralize keys in shared constants so both sides reference the same symbol-like value.
- **The generic `T` is a convenience, not a guarantee.** `KeyedHandlerRegistry<OrderHandler>` makes `resolveAll` *return* `OrderHandler[]`, but nothing verifies that the discovered instances actually implement `OrderHandler` — discovery matches on the metadata key, not on the interface. Keep the handler contract in a shared interface and have every handler `implements` it, so the cast is honest.
- **Providers without a class metatype are skipped.** The scan reads `Reflect.getMetadata(..., wrapper.metatype)`, so `useValue` / `useFactory` providers that have no class metatype are never indexed even if you attach metadata to the value. Handlers must be class providers.

## When to use it

- Dynamic dispatch by a **runtime** key — an event type, message type, or command name — where the dispatcher should not know the concrete handlers.
- **Fan-out**: a single key should reach an open-ended set of handlers, and new handlers get added over time without touching the dispatcher.
- The handlers live in **different modules or bounded contexts** from the dispatcher, and importing them directly would couple boundaries that should stay independent.

## When NOT to use it

- **The collaborator is known at compile time.** Inject it directly. The registry's indirection buys nothing.
- **A static, single-token set is enough.** If you just need "all providers bound to one token" and the binding is fixed, NestJS multi-provider injection (`@Inject(TOKEN)` resolving to an array) is simpler. The registry earns its keep when dispatch is keyed by an arbitrary runtime string and buckets handlers per key.

## Related

- [Register and resolve handlers](../../../guides/backend/register-and-resolve-handlers/) — step-by-step recipe to decorate a handler, dispatch by key, and verify discovery in a test.
- [Cross-bounded-context ports](../cross-bounded-context-ports/) — the complementary pattern for *static* cross-BC dependencies; the registry handles the *dynamic, keyed* ones.
- [Backend module scaffolding](../module-scaffolding/) — how a single bounded context is laid out internally.
