---
title: Cross-bounded-context ports
description: How Aurora Catalyst decouples bounded contexts through the @bridges folder — ports, tokens, adapters, and the global BridgesModule composition root.
---

## Why this exists

Aurora Catalyst organizes the backend into bounded contexts. Each lives in `backend/src/@app/<bc>/` (domain + application) and `backend/src/@api/<bc>/` (REST + GraphQL), and registers itself in `app.module.ts` as `<Bc>Module`. The whole point of the BC split is that each one evolves independently — different teams, different release cadences, different internal models.

The temptation when one BC needs data or behavior from another is to wire them at the module level: `IamModule.imports = [OAuthModule]` and `OAuthModule.exports = [...OAuthServices]`. It works, but it fuses the two BCs together. Refactoring the supplier's internals breaks the consumer, the supplier's full service catalog leaks across the boundary, and there is no single place to audit which BCs depend on which.

`backend/src/@bridges/` is the alternative. Every cross-bounded-context dependency goes through four small files — a port, a token, an adapter, and a bridge entry — wired through a single global composition root, `BridgesModule`. Consumers depend only on contracts they declared themselves; suppliers translate their internal model into those contracts; and the entire cross-BC surface is one folder you can grep.

## The four pieces

### 1. Port — what the consumer needs

A TypeScript interface plus the DTO the consumer exchanges with the supplier. Two flavors depending on direction — see [Read ports vs write ports](#read-ports-vs-write-ports) below for the full distinction. The example here is the canonical *read* shape: a minimal DTO in the consumer's vocabulary.

```ts
// backend/src/@bridges/iam/client/ports/iam-client-reader.port.ts
export interface IamClientWithApplications {
  id: string;
  applicationCodes: string[];
}

export interface IIamClientReader {
  findByIdWithApplications(id: string): Promise<IamClientWithApplications>;
}
```

The port lives **where its DTO lives** — see [Read ports vs write ports](#read-ports-vs-write-ports) below for the full rule. For this read example, the consumer (iam) owns the DTO, so the port sits in iam's territory at `@bridges/iam/client/ports/iam-client-reader.port.ts`.

### 2. Token — the injection key

A `Symbol(...)` constant that sits next to the port. Consumers inject `@Inject(TOKEN)`; the runtime DI container resolves the symbol to the adapter the bridge entry points at.

```ts
// backend/src/@bridges/iam/client/ports/iam-client-reader.token.ts
export const IAM_CLIENT_READER = Symbol('IAM_CLIENT_READER');
```

### 3. Adapter — the supplier's implementation

A class with `@Injectable()` that implements the port. It lives **on the supplier side** of `@bridges/`, constructor-injects the supplier's internal service, and translates the supplier's model into the consumer's DTO.

```ts
// backend/src/@bridges/o-auth/client/adapters/o-auth-client-reader.adapter.ts
@Injectable()
export class OAuthClientReaderAdapter implements IIamClientReader {
  constructor(private readonly findByIdService: OAuthFindClientByIdService) {}

  async findByIdWithApplications(id: string): Promise<IamClientWithApplications> {
    const client = await this.findByIdService.main(id, {
      include: [{ association: 'applications' }],
    });
    if (!client) throw new NotFoundException(/* … */);
    return {
      id: client.id,
      applicationCodes: (client.applications ?? [])
        .map((a) => a?.code)
        .filter((c): c is string => Boolean(c)),
    };
  }
}
```

The adapter is the one place in the codebase that knows both worlds: the supplier's internal service and the consumer's contract. Everything else stays on its own side.

### 4. Bridge entry — the wiring

A NestJS `Provider` that binds the token to the adapter using `useExisting`. The bridge entry creates no new instance — it reuses the adapter instance the supplier module already declares.

```ts
// backend/src/@bridges/iam-client-reader.bridge.ts
export const iamClientReaderBridge: Provider = {
  provide: IAM_CLIENT_READER,
  useExisting: OAuthClientReaderAdapter,
};
```

## The composition root: BridgesModule

`backend/src/@bridges/bridges.module.ts` is decorated `@Global()`. It is the only composition root cross-BC dependencies pass through.

```ts
@Global()
@Module({
  imports: [OAuthModule, IamModule],
  providers: [iamClientReaderBridge, credentialVerifierBridge, accountLoaderBridge],
  exports: [IAM_CLIENT_READER, CREDENTIAL_VERIFIER, ACCOUNT_LOADER],
})
export class BridgesModule {}
```

Three responsibilities, in order:

1. **Imports** — the supplier modules. They are imported so that the adapter instances they declare become visible to NestJS DI. Adapters are NOT providers of `BridgesModule` itself.
2. **Providers** — the bridge entries, each binding a token to an adapter via `useExisting`.
3. **Exports** — tokens only. Never the adapter classes. Never the supplier's internal services.

Because the module is `@Global()`, no consumer module has to import it. Any handler in any BC can `@Inject(TOKEN)` a port without coupling its own module to `BridgesModule` or to the supplier.

### Zero-leak: how suppliers cooperate

The pattern in this codebase is called **zero-leak** because the supplier modules export only their adapters — nothing of their internal service catalog crosses the boundary. Every supplier module that participates in `@bridges/` declares its cross-BC adapter as a provider AND as the only outward-facing export it adds for `@bridges/`:

```ts
// backend/src/@api/o-auth/o-auth.module.ts
@Module({
  providers: [/* … internal services … */, OAuthClientReaderAdapter],
  exports: [OAuthClientReaderAdapter],
})
export class OAuthModule {}
```

A future BC that imports `OAuthModule` sees `OAuthClientReaderAdapter` and nothing else from o-auth's internals. The supplier owns what it exposes; the consumer never reaches past the port.

## What lives where today

| Token                          | Variant | Port                                                                                | Adapter                                                                          | Consumer            | Supplier            |
| ------------------------------ | ------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------- | ------------------- |
| `IAM_CLIENT_READER`            | read    | `@bridges/iam/client/ports/iam-client-reader.port.ts`                               | `@bridges/o-auth/client/adapters/o-auth-client-reader.adapter.ts`                | `iam` (BC)          | `o-auth` (BC)       |
| `CREDENTIAL_VERIFIER`          | read    | `@aurora/modules/authentication/domain/ports/credential-verifier.port.ts`           | `@bridges/iam/user/adapters/iam-credential-verifier.adapter.ts`                  | `authentication`    | `iam` (BC)          |
| `ACCOUNT_LOADER`               | read    | `@aurora/modules/authentication/domain/ports/account-loader.port.ts`                | `@bridges/iam/account/adapters/iam-account-loader.adapter.ts`                    | `authentication`    | `iam` (BC)          |
| `IAM_BOUNDED_CONTEXT_SEEDER`   | write   | `@bridges/iam/bounded-context/ports/iam-bounded-context-seeder.port.ts`             | `@bridges/iam/bounded-context/adapters/iam-bounded-context-seeder.adapter.ts`    | `o-auth` (BC)       | `iam` (BC)          |
| `IAM_PERMISSION_SEEDER`        | write   | `@bridges/iam/permission/ports/iam-permission-seeder.port.ts`                       | `@bridges/iam/permission/adapters/iam-permission-seeder.adapter.ts`              | `o-auth` (BC)       | `iam` (BC)          |

The first row is the canonical *read* case: `iam` declares what it needs from `o-auth`, the port lives in iam's territory under `@bridges/iam/`, and the adapter lives in o-auth's territory under `@bridges/o-auth/`.

Rows 2 and 3 are read ports whose consumer is a framework module instead of a BC. Their ports live in `@aurora/modules/authentication/domain/ports/` because `authentication` is framework infrastructure — the framework module owns the contract that any concrete BC may fulfil. New BC-to-BC dependencies do not use this layout; they belong under `@bridges/<consumer-bc>/`.

The last two rows are *write* ports for o-auth's bootstrap seeding into iam — see the next section.

## Read ports vs write ports

The same four pieces wire two different intents. The DTO inside the port is what changes between them — and the DTO's ownership decides where the port file lives.

> **The rule:** the port lives where its DTO lives.

### Read ports — the consumer projects what it needs

The port returns a DTO shaped to the consumer's vocabulary, not the supplier's. The adapter translates the supplier's internal model into that DTO — flattening relations, renaming fields, dropping the ones the consumer does not need. This is DDD's **Anti-Corruption Layer** expressed in plain NestJS DI: if `o-auth` renames `applications` to `apis` tomorrow, only `OAuthClientReaderAdapter` breaks; `iam` does not see the rename.

The DTO is consumer-shaped → **the port file lives in the consumer's territory** (`@bridges/<consumer-bc>/<feature>/ports/`). Hand-write the DTO next to the port, with the `<Consumer><DescriptiveName>` naming.

Canonical case: `IIamClientReader.findByIdWithApplications()` returns a hand-written `IamClientWithApplications` containing just `id` and `applicationCodes` — not the full `OAuthClient` model. The port sits at `@bridges/iam/client/ports/iam-client-reader.port.ts`.

### Write ports — the consumer relays data to the supplier

The consumer has no domain vocabulary for the resource it is writing; it is orchestrating data into a supplier that owns it. The DTO IS the supplier's input contract, reused as-is from upstream — typically a framework-level type from `@aurorajs.dev/core-back` (`SeederBoundedContext`, `RepositoryOptions`) or the supplier's GraphQL `*Input` type. The adapter is a pass-through with no mapping.

The DTO is supplier-shaped → **the port file lives in the supplier's territory** (`@bridges/<supplier-bc>/<resource>/ports/`). The port is essentially the supplier's driving interface for cross-BC writes — a contract that any consumer in the project can inject by token. The file prefix matches the supplier (e.g. `iam-bounded-context-seeder.port.ts` under `@bridges/iam/bounded-context/ports/`).

Canonical case: `IIamBoundedContextSeeder.seedAll(items, options)` accepts `SeederBoundedContext[]` and `RepositoryOptions` straight from core-back. Hand-writing a near-duplicate DTO would only introduce drift when the supplier's input contract evolves, and gain no Anti-Corruption value (there is no projection to do).

### Choosing between them

> Does the consumer have its own vocabulary for this resource?
>
> - **Yes** — the consumer reduces, flattens, or renames the supplier's model → write a custom DTO in the consumer's territory, next to the port. **Read port.**
> - **No** — the consumer relays data that semantically belongs to the supplier → reuse the supplier's or framework's existing type, and place the port in the supplier's territory. **Write port.**

Both variants share the identical 4-file shape (port, token, adapter, bridge entry) and the same composition-root registration. Only the port's DTO source and its file location differ.

## When it applies

- A handler or service in one BC needs to read data owned by another BC.
- A handler or service in one BC needs to trigger behavior owned by another BC.

## When NOT to use it

- **Access within the same BC.** Handlers, services, and repositories of the same BC inject each other directly — ports are pure overhead with no isolation gain.
- **One-off scripts, seeds, or tests** that are not part of the runtime module graph. They can import what they need.
- **Framework infrastructure already exposed globally** (cache, config, i18n, audit). `SharedModule` is `@Global()` precisely so these do not need a port.

## Trade-offs and limits

- **Boilerplate per dependency.** Four small files instead of one `imports: [OtherModule]`. The trade is compile-time isolation between BCs and a single audit surface — `@bridges/` plus `bridges.module.ts`.
- **The adapter still couples `@bridges/` to a supplier's internal service.** That is the whole point: someone has to translate, and it is the supplier's job to do so. Internal refactors of a supplier service do ripple into its adapter — but they stop there.
- **Two `@Global()` modules in the project.** `BridgesModule` and `SharedModule`. Both are composition roots by design, not behavior. The rule of thumb is unchanged: do not reach for `@Global()` for anything else.

## Related

- [Add a cross-BC port](../../../guides/backend/add-a-cross-bc-port/) — step-by-step recipe to wire a new cross-BC dependency.
- [Cross-BC ports pattern — changelog](../../../changes/catalyst/2026-05-10-establish-cross-bc-ports-pattern/) — the original change that introduced the convention.
- [Backend module scaffolding](../module-scaffolding/) — how a single BC is laid out internally, before any cross-BC concern.
