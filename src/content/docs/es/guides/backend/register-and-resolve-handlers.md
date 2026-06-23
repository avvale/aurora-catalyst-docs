---
title: Registrar y resolver handlers por clave
description: Decora un provider con @Handler, hace dispatch a todos los handlers de una clave en runtime con KeyedHandlerRegistry.resolveAll y verifica el descubrimiento en un TestingModule.
---

## Objetivo

Registrar uno o varios providers como handlers de una clave en tiempo de ejecución y, después, hacer dispatch a cada handler asociado a esa clave — sin que el dispatcher importe ningún handler concreto. Este es el patrón detrás del dispatch por clave con fan-out (proyección de eventos, enrutado de comandos, manejo de mensajes).

Para el *porqué* del diseño — descubrimiento en el arranque, el decorador acumulativo, el índice agnóstico del dominio — consulta [El registro de handlers](../../../concepts/backend/handler-registry/).

## Antes de empezar

- `HandlerRegistryModule` es un módulo del framework `@Global()` en `@aurora/modules/handler-registry`. Se importa una vez cerca de la raíz de la aplicación, así que `KeyedHandlerRegistry` es inyectable en todas partes — no importas el módulo en tu propio módulo de funcionalidad.
- Los handlers a los que quieres hacer dispatch son **providers de clase** registrados en el `providers` de algún módulo. El registro descubre providers por su metatype de clase; los providers `useValue` / `useFactory` no se escanean.
- Decide la **interfaz compartida** que implementan tus handlers y que llama el dispatcher. El registro devuelve instancias en crudo — el contrato entre dispatcher y handler lo defines tú.

## Pasos

1. **Define el contrato del handler.** Una interfaz simple de la que depende el dispatcher y que implementa cada handler. Mantén las claves en constantes compartidas para que ambos lados referencien el mismo valor.

   ```typescript
   // order-handler.contract.ts
   export const ORDER_CREATED = 'order.created';
   export const ORDER_CANCELLED = 'order.cancelled';

   export interface OrderHandler {
     handle(payload: unknown): Promise<void>;
   }
   ```

2. **Decora cada provider con `@Handler(...)`.** Importa el decorador desde el módulo del framework. Un provider puede atender una clave, varias a la vez (variádica) o varias mediante decoradores apilados — todas las formas acumulan:

   ```typescript
   import { Handler } from '@aurora/modules/handler-registry';
   import { Injectable } from '@nestjs/common';
   import { ORDER_CREATED, ORDER_CANCELLED, OrderHandler } from './order-handler.contract';

   @Handler(ORDER_CREATED)
   @Injectable()
   export class UpdateInventoryHandler implements OrderHandler {
     async handle(payload: unknown): Promise<void> { /* … */ }
   }

   // Un provider, dos claves — ambas resuelven a la misma instancia.
   @Handler(ORDER_CREATED, ORDER_CANCELLED)
   @Injectable()
   export class AuditOrderHandler implements OrderHandler {
     async handle(payload: unknown): Promise<void> { /* … */ }
   }
   ```

   `@Handler` debe ir junto a `@Injectable()` — el descubrimiento solo ve instancias que NestJS creó de verdad.

3. **Registra los handlers como providers.** Añádelos al array `providers` de su módulo. Si un handler vive en un módulo distinto del dispatcher, no hay problema — el registro indexa toda la aplicación en el arranque; no necesitas exportar el handler para que el *registro* lo encuentre. (Solo lo exportas si otro módulo inyecta la clase directamente.)

   ```typescript
   @Module({
     providers: [UpdateInventoryHandler, AuditOrderHandler],
   })
   export class OrderModule {}
   ```

4. **Inyecta el registro en tu dispatcher y haz fan-out con `resolveAll`.** Tipa el genérico con tu contrato para que el bucle quede tipado:

   ```typescript
   import { Injectable } from '@nestjs/common';
   import { KeyedHandlerRegistry } from '@aurora/modules/handler-registry';
   import { OrderHandler } from './order-handler.contract';

   @Injectable()
   export class OrderDispatcher {
     constructor(private readonly registry: KeyedHandlerRegistry<OrderHandler>) {}

     async dispatch(type: string, payload: unknown): Promise<void> {
       // resolveAll nunca lanza — una clave desconocida da [] y el bucle no hace nada.
       for (const handler of this.registry.resolveAll(type)) {
         await handler.handle(payload);
       }
     }
   }
   ```

   El dispatcher importa solo `OrderHandler` — nunca un handler concreto. Añadir más adelante un handler para `order.created` es un nuevo provider decorado; este archivo no cambia.

## Verifica que funcionó

Escribe un test de descubrimiento. Construye un `TestingModule` con `DiscoveryModule` y `KeyedHandlerRegistry`, registra el handler real y **llama a `moduleRef.init()`** — `compile()` por sí solo *no* dispara `OnModuleInit`, así que el escaneo de descubrimiento nunca corre y cada `resolveAll` devuelve `[]`.

```typescript
import { DiscoveryModule } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { KeyedHandlerRegistry } from '@aurora/modules/handler-registry';
import { UpdateInventoryHandler } from './update-inventory.handler';
import { ORDER_CREATED } from './order-handler.contract';

it('descubre el provider @Handler bajo su clave', async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [DiscoveryModule],
    providers: [KeyedHandlerRegistry, UpdateInventoryHandler],
  }).compile();
  await moduleRef.init(); // dispara onModuleInit → corre el escaneo de descubrimiento

  const registry = moduleRef.get(KeyedHandlerRegistry);
  const handler = moduleRef.get(UpdateInventoryHandler);

  const result = registry.resolveAll(ORDER_CREATED);
  expect(result).toHaveLength(1);
  expect(result[0]).toBe(handler); // el singleton gestionado por la DI, por referencia
});
```

Para demostrar el fan-out, registra varios handlers bajo la misma clave y verifica que `resolveAll(key)` los devuelve todos. Para demostrar el contrato de no-lanzar, verifica que una clave desconocida devuelve `[]`.

## Resolución de problemas

**`resolveAll` devuelve `[]` para una clave que registraste.** Tres causas habituales: (1) el handler no está en el `providers` de ningún módulo, así que NestJS nunca lo instanció; (2) la cadena de la clave en `@Handler` no coincide con la que pasas a `resolveAll` — centraliza las claves en constantes para eliminar esto; (3) en un test llamaste a `compile()` pero olvidaste `init()`, así que `onModuleInit` nunca corrió.

**Un provider está registrado pero nunca se descubre.** El escaneo lee los metadatos del metatype de clase, así que los providers `useValue` y `useFactory` se omiten — no tienen metatype de clase. Los handlers deben ser providers de clase (clases `@Injectable()` listadas directamente, o `useClass`).

**Solo resuelve una de dos claves apiladas.** Estás usando un decorador artesanal que llama a `Reflect.defineMetadata` y sobrescribe. Usa el `@Handler` del framework, que acumula las claves entre llamadas apiladas.

**Las instancias devueltas no son del tipo que esperabas.** `KeyedHandlerRegistry<T>` castea el resultado a `T[]`; no verifica que las instancias implementen `T`. Haz que cada handler `implements` la interfaz compartida para que el genérico sea veraz, y nunca archives providers no relacionados bajo la misma clave.

## Relacionado

- [El registro de handlers](../../../concepts/backend/handler-registry/) — el diseño y los compromisos detrás de esta receta.
- [Puertos entre bounded contexts](../../../concepts/backend/cross-bounded-context-ports/) — la contraparte estática para dependencias cross-BC conocidas en tiempo de compilación.
