---
title: Add a cross-BC port
description: Wire a new cross-bounded-context dependency through @bridges — port, token, adapter, bridge entry, and BridgesModule.
---

## Goal

Connect a consumer (a BC handler or a framework module) to a supplier BC without coupling their NestJS modules directly. The result is one new token a consumer injects, an adapter the supplier exposes, and a bridge entry registered in `BridgesModule`.

## Before you start

- You know which side is the **consumer** (needs the data or behavior) and which side is the **supplier** (owns it).
- The supplier already has an internal service that exposes the operation you need. If it does not, build that first inside the supplier BC — the adapter is not the place to add new domain logic.
- You have a clear sense of the **minimal DTO** the consumer reads. The whole point of the port is that the consumer asks only for what it actually uses.
- You can edit both the consumer's handler and the supplier's module.

## Steps

1. **Place the port in the consumer's territory.**

   The port lives in `backend/src/@bridges/<consumer-bc>/<resource>/ports/`. The supplier's location does NOT determine where the port lives — the consumer owns the contract.

   The walkthrough below uses the canonical example: `iam` (consumer) needs to read OAuth clients owned by `o-auth` (supplier), so the port goes in `@bridges/iam/client/ports/`.

2. **Write the port interface and its DTO.** Use the consumer's vocabulary, not the supplier's. Keep the DTO minimal — only the fields the consumer reads.

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

3. **Declare the token next to the port.**

   ```ts
   // backend/src/@bridges/iam/client/ports/iam-client-reader.token.ts
   export const IAM_CLIENT_READER = Symbol('IAM_CLIENT_READER');
   ```

   Reexport both files from an `index.ts` in the same folder if you want a single import path for consumers:

   ```ts
   // backend/src/@bridges/iam/client/ports/index.ts
   export * from './iam-client-reader.port';
   export * from './iam-client-reader.token';
   ```

4. **Write the adapter on the supplier side.** It implements the port, constructor-injects the supplier's internal service, and maps the supplier's model into the port's DTO.

   ```ts
   // backend/src/@bridges/o-auth/client/adapters/o-auth-client-reader.adapter.ts
   import { OAuthFindClientByIdService } from '@app/o-auth/client';
   import { IamClientWithApplications, IIamClientReader } from '@bridges/iam/client/ports';
   import { Injectable, NotFoundException } from '@nestjs/common';

   @Injectable()
   export class OAuthClientReaderAdapter implements IIamClientReader {
     constructor(private readonly findByIdService: OAuthFindClientByIdService) {}

     async findByIdWithApplications(id: string): Promise<IamClientWithApplications> {
       const client = await this.findByIdService.main(id, {
         include: [{ association: 'applications' }],
       });
       if (!client) {
         throw new NotFoundException({
           message: `OAuthClient with id: ${id}, not found`,
           translation: 'o-auth.error.clientNotFound',
           placeholders: { id },
         });
       }
       const applications =
         (client as { applications?: { code?: string | null }[] }).applications ?? [];
       return {
         id: client.id,
         applicationCodes: applications
           .map((application) => application?.code)
           .filter((code): code is string => Boolean(code)),
       };
     }
   }
   ```

5. **Register the adapter as provider AND export of the supplier module.** This is the zero-leak piece: the supplier module exposes only its adapters, never its internal services.

   ```ts
   // backend/src/@api/o-auth/o-auth.module.ts
   import { OAuthClientReaderAdapter } from '@bridges/o-auth/client/adapters/o-auth-client-reader.adapter';

   @Module({
     providers: [/* …internal services… */, OAuthClientReaderAdapter],
     exports: [OAuthClientReaderAdapter],
   })
   export class OAuthModule {}
   ```

6. **Create the bridge entry.** A NestJS `Provider` with `useExisting` so the bridge reuses the supplier-module instance instead of creating a new one.

   ```ts
   // backend/src/@bridges/iam-client-reader.bridge.ts
   import { IAM_CLIENT_READER } from '@bridges/iam/client/ports/iam-client-reader.token';
   import { OAuthClientReaderAdapter } from '@bridges/o-auth/client/adapters/o-auth-client-reader.adapter';
   import { Provider } from '@nestjs/common';

   export const iamClientReaderBridge: Provider = {
     provide: IAM_CLIENT_READER,
     useExisting: OAuthClientReaderAdapter,
   };
   ```

7. **Hook the entry into `BridgesModule`.** Add the supplier module to `imports` (if not already there), add the bridge entry to `providers`, and add the token to `exports`.

   ```ts
   // backend/src/@bridges/bridges.module.ts
   @Global()
   @Module({
     imports: [OAuthModule, IamModule /* …other supplier modules… */],
     providers: [
       iamClientReaderBridge,
       /* …other bridge entries… */
     ],
     exports: [
       IAM_CLIENT_READER,
       /* …other tokens… */
     ],
   })
   export class BridgesModule {}
   ```

8. **Inject the port by token in the consumer.** No `imports` change on the consumer's module is required — `BridgesModule` is `@Global()`.

   ```ts
   // backend/src/@app/iam/account/application/create/iam-create-account.handler.ts
   import { IAM_CLIENT_READER } from '@bridges/iam/client/ports/iam-client-reader.token';
   import type { IIamClientReader } from '@bridges/iam/client/ports/iam-client-reader.port';
   import { Inject } from '@nestjs/common';

   constructor(
     @Inject(IAM_CLIENT_READER) private readonly clientReader: IIamClientReader,
     // …other deps
   ) {}

   async main(/* … */) {
     const client = await this.clientReader.findByIdWithApplications(clientId);
     // …
   }
   ```

## Verify it worked

- `pnpm back:build` compiles without errors.
- The consumer's unit test mocks the port with a plain literal — no need to construct or stub the supplier's internal service:

  ```ts
  {
    provide: IAM_CLIENT_READER,
    useValue: {
      findByIdWithApplications: jest
        .fn()
        .mockResolvedValue({ id, applicationCodes: ['app-a', 'app-b'] }),
    },
  }
  ```

- The supplier module's `exports` list contains the adapter — and nothing else from inside the supplier that the consumer should not see.
- `bridges.module.ts` is the only place that mentions both BCs in the same `imports`. The consumer's module file still has no reference to the supplier.

## Troubleshooting

**`Nest can't resolve dependencies of <Adapter>`.**
`BridgesModule.imports` is missing the supplier module, or the supplier module did not include the adapter in its `providers`. `useExisting: AdapterClass` only works when the adapter is reachable through an imported module.

**The consumer's module had to import the supplier module to compile.**
You are injecting the supplier's class directly (or one of its services) instead of the port token. Switch the consumer to `@Inject(TOKEN) port: IPort` and drop the import. If the consumer's tests force the supplier import, mock the port instead.

**The adapter returns the supplier's full entity.**
That is a leak. The port's DTO must describe only what the consumer reads. If the consumer wants the entire supplier entity, the boundary has effectively collapsed — split the DTO to expose only the fields the consumer uses.

**Two BCs want to read the same resource with different shapes.**
Write two ports + two adapters. The supplier owns N translations, one per consumer; consumers never share each other's contracts.

**The bridge entry compiles but `@Inject(TOKEN)` returns `undefined` at runtime.**
The bridge entry is missing from `BridgesModule.providers`, or the token symbol the consumer imports is a different instance than the one the bridge entry uses. Make sure the token is imported from the same `*.token.ts` file on both sides — never redeclare `Symbol(...)` elsewhere.

## Related

- [Cross-bounded-context ports](../../../concepts/backend/cross-bounded-context-ports/) — the design rationale and the catalog of bridges in the codebase.
- [Cross-BC ports pattern — changelog](../../../changes/catalyst/2026-05-10-establish-cross-bc-ports-pattern/) — the original change that introduced the convention.
