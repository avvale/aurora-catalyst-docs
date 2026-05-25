---
title: Añadir un port cross-BC
description: Cablea una nueva dependencia entre bounded contexts a través de @bridges — port, token, adapter, bridge entry y BridgesModule.
---

## Objetivo

Conectar un consumer (un handler de un BC o un módulo de framework) con un BC supplier sin acoplar sus módulos NestJS directamente. El resultado es un token nuevo que el consumer inyecta, un adapter que el supplier expone y una bridge entry registrada en `BridgesModule`.

## Antes de empezar

- Tienes claro qué lado es el **consumer** (necesita el dato o el comportamiento) y cuál es el **supplier** (lo posee).
- El supplier ya tiene un service interno que expone la operación que necesitas. Si no lo tiene, créalo primero dentro del BC supplier — el adapter no es el sitio para añadir lógica de dominio nueva.
- Tienes claro el **DTO mínimo** que el consumer va a leer. La idea del port es que el consumer pida solo lo que realmente usa.
- Puedes editar tanto el handler del consumer como el módulo del supplier.

## Pasos

1. **Coloca el port en el territorio del consumer.**

   El port vive en `backend/src/@bridges/<consumer-bc>/<resource>/ports/`. La ubicación del supplier NO determina dónde vive el port — el consumer es dueño del contrato.

   El recorrido siguiente usa el ejemplo canónico: `iam` (consumer) necesita leer OAuth clients que pertenecen a `o-auth` (supplier), así que el port va en `@bridges/iam/client/ports/`.

2. **Escribe la interfaz del port y su DTO.** Usa el vocabulario del consumer, no el del supplier. Mantén el DTO al mínimo — solo los campos que el consumer lee.

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

3. **Declara el token al lado del port.**

   ```ts
   // backend/src/@bridges/iam/client/ports/iam-client-reader.token.ts
   export const IAM_CLIENT_READER = Symbol('IAM_CLIENT_READER');
   ```

   Reexporta los dos archivos desde un `index.ts` en la misma carpeta si quieres un único import path para los consumers:

   ```ts
   // backend/src/@bridges/iam/client/ports/index.ts
   export * from './iam-client-reader.port';
   export * from './iam-client-reader.token';
   ```

4. **Escribe el adapter del lado del supplier.** Implementa el port, inyecta por constructor el service interno del supplier y mapea el modelo del supplier al DTO del port.

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

5. **Registra el adapter como provider Y export del supplier module.** Esta es la pieza zero-leak: el supplier module expone únicamente sus adapters, nunca sus services internos.

   ```ts
   // backend/src/@api/o-auth/o-auth.module.ts
   import { OAuthClientReaderAdapter } from '@bridges/o-auth/client/adapters/o-auth-client-reader.adapter';

   @Module({
     providers: [/* …services internos… */, OAuthClientReaderAdapter],
     exports: [OAuthClientReaderAdapter],
   })
   export class OAuthModule {}
   ```

6. **Crea la bridge entry.** Un `Provider` de NestJS con `useExisting` para que el bridge reuse la instancia del supplier module en vez de crear una nueva.

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

7. **Engancha la entry en `BridgesModule`.** Añade el supplier module a `imports` (si no estaba ya), la bridge entry a `providers` y el token a `exports`.

   ```ts
   // backend/src/@bridges/bridges.module.ts
   @Global()
   @Module({
     imports: [OAuthModule, IamModule /* …otros supplier modules… */],
     providers: [
       iamClientReaderBridge,
       /* …otras bridge entries… */
     ],
     exports: [
       IAM_CLIENT_READER,
       /* …otros tokens… */
     ],
   })
   export class BridgesModule {}
   ```

8. **Inyecta el port por token en el consumer.** No hace falta tocar los `imports` del módulo del consumer — `BridgesModule` es `@Global()`.

   ```ts
   // backend/src/@app/iam/account/application/create/iam-create-account.handler.ts
   import { IAM_CLIENT_READER } from '@bridges/iam/client/ports/iam-client-reader.token';
   import type { IIamClientReader } from '@bridges/iam/client/ports/iam-client-reader.port';
   import { Inject } from '@nestjs/common';

   constructor(
     @Inject(IAM_CLIENT_READER) private readonly clientReader: IIamClientReader,
     // …otras dependencias
   ) {}

   async main(/* … */) {
     const client = await this.clientReader.findByIdWithApplications(clientId);
     // …
   }
   ```

## Verifica que funciona

- `pnpm back:build` compila sin errores.
- El test unitario del consumer mockea el port con un objeto literal — no hace falta construir ni stubear el service interno del supplier:

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

- La lista `exports` del supplier module contiene el adapter — y nada más de los internals del supplier que el consumer no deba ver.
- `bridges.module.ts` es el único sitio que menciona los dos BCs en el mismo `imports`. El archivo del módulo del consumer sigue sin referenciar al supplier.

## Solución de problemas

**`Nest can't resolve dependencies of <Adapter>`.**
A `BridgesModule.imports` le falta el supplier module, o el supplier module no incluyó al adapter en sus `providers`. `useExisting: AdapterClass` solo funciona cuando el adapter es alcanzable a través de un módulo importado.

**El módulo del consumer tuvo que importar el supplier module para compilar.**
Estás inyectando la clase del supplier directamente (o uno de sus services) en lugar del token del port. Cambia el consumer a `@Inject(TOKEN) port: IPort` y elimina el import. Si los tests del consumer fuerzan el import del supplier, mockea el port en su lugar.

**El adapter devuelve la entidad completa del supplier.**
Eso es una fuga. El DTO del port debe describir solo lo que el consumer lee. Si el consumer quiere la entidad entera del supplier, la frontera está rota — recorta el DTO para exponer solo los campos que el consumer usa.

**Dos BCs quieren leer el mismo recurso con shapes distintos.**
Escribe dos ports + dos adapters. El supplier es dueño de N traducciones, una por consumer; los consumers nunca comparten contratos entre sí.

**La bridge entry compila pero `@Inject(TOKEN)` devuelve `undefined` en runtime.**
Falta la bridge entry en `BridgesModule.providers`, o el symbol del token que importa el consumer es una instancia distinta del que usa la bridge entry. Asegúrate de que el token se importa desde el mismo `*.token.ts` en los dos lados — nunca redeclares `Symbol(...)` en otro sitio.

## Relacionado

- [Ports entre bounded contexts](../../../concepts/backend/cross-bounded-context-ports/) — la justificación de diseño y el catálogo de bridges en el código.
- [Cross-BC ports pattern — changelog](../../../changes/catalyst/2026-05-10-establish-cross-bc-ports-pattern/) — el cambio original que introdujo la convención.
