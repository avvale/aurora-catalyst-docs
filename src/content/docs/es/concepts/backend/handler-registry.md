---
title: El registro de handlers
description: Cómo Aurora Catalyst hace dispatch del trabajo a handlers conectables mediante una clave en tiempo de ejecución — el decorador @Handler, el descubrimiento en el arranque vía DiscoveryService y el KeyedHandlerRegistry agnóstico del dominio.
---

## Por qué existe

Cierto trabajo del backend no se puede cablear a un único colaborador conocido de antemano. Un worker que consume eventos de integración no sabe, en tiempo de compilación, qué pieza de código debe reaccionar a `order.created` frente a `payment.received` — y no debería tener que saberlo. Con el tiempo se añaden nuevas reacciones, a veces desde otro bounded context, y el dispatcher debería quedar intacto cuando eso ocurre.

El arreglo ingenuo es un `switch` sobre la clave, o un módulo que importa todos los handlers posibles y los inyecta a mano. Ambos funden el dispatcher con el conjunto completo de handlers: cada handler nuevo edita el dispatcher, y este acaba importando a través de fronteras de bounded context que no tiene por qué conocer.

El registro de handlers es la alternativa. Un provider declara las claves que atiende con un decorador `@Handler(...)`; el framework descubre cada provider decorado una sola vez en el arranque y los indexa por clave; y un dispatcher pide `resolveAll(key)` los handlers registrados bajo una clave — sin importar ninguno de ellos, y sin cambiar cuando se añade uno nuevo.

El módulo vive en `backend/src/@aurora/modules/handler-registry/` y se importa desde tu código como `@aurora/modules/handler-registry`.

## Las tres piezas

### 1. `@Handler(...keys)` — el marcador

Un decorador de clase que registra, en metadatos de reflexión, las claves a las que responde un provider. Admite la forma variádica y la apilada:

```ts
@Handler('order.created', 'order.updated')   // variádica — ambas claves en una llamada
@Injectable()
export class OrderProjector { /* … */ }

@Handler('payment.received')                  // apilada — dos llamadas separadas
@Handler('payment.refunded')                  // sobre la misma clase
@Injectable()
export class PaymentProjector { /* … */ }
```

El decorador **acumula** claves en lugar de sobrescribirlas. Cada llamada lee los metadatos que ya hay en el destino y fusiona sus claves nuevas:

```ts
export function Handler(...keys: string[]): ClassDecorator {
  return (target: object): void => {
    const existing: string[] = Reflect.getMetadata(HANDLER_KEYS, target) ?? [];
    Reflect.defineMetadata(HANDLER_KEYS, [...existing, ...keys], target);
  };
}
```

Esto importa en la forma apilada. Un `Reflect.defineMetadata(HANDLER_KEYS, keys, target)` ingenuo sobrescribiría en cada llamada, de modo que dos decoradores `@Handler` apilados descartarían en silencio todos salvo el último aplicado. Acumular al leer mantiene todas las claves descubribles.

### 2. `KeyedHandlerRegistry` — el índice

Un servicio `@Injectable()` que implementa `OnModuleInit`. En el arranque recorre todos los providers que NestJS conoce, lee sus claves `@Handler` y archiva la **instancia** del provider bajo cada clave en un `Map<string, T[]>`:

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

De este diseño se derivan dos propiedades:

- **El descubrimiento ocurre una vez, en el arranque.** El hook de ciclo de vida `onModuleInit` ejecuta el escaneo exactamente una vez. Las llamadas a `resolveAll` en tiempo de ejecución son una simple búsqueda en el mapa — sin reflexión, sin reescaneo.
- **El registro es agnóstico del dominio.** Guarda instancias en crudo de `T` (por defecto `unknown`) y las devuelve tal cual. Nunca sabe qué métodos expone un handler; lo sabe quien llama. Eso es lo que le permite no importar nada de ningún bounded context ni de `@app` — depende solo de `@nestjs/common` y `@nestjs/core`.

`resolveAll` **nunca lanza una excepción**. Una clave desconocida devuelve un array vacío, así que un dispatcher puede hacer fan-out sobre cero handlers sin una guarda.

### 3. `HandlerRegistryModule` — el cableado

Un módulo del framework decorado `@Global()`. Importa `DiscoveryModule` (que provee el `DiscoveryService` que necesita el registro), y provee y exporta `KeyedHandlerRegistry`:

```ts
@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [KeyedHandlerRegistry],
  exports: [KeyedHandlerRegistry],
})
export class HandlerRegistryModule {}
```

Al ser `@Global()`, cualquier módulo — en cualquier bounded context — puede inyectar `KeyedHandlerRegistry` sin importar este módulo de forma explícita. Se importa una vez cerca de la raíz de la aplicación y a partir de ahí está disponible en todas partes.

## Cómo fluye un dispatch

En conjunto, un único dispatch se ve así:

1. **En el arranque**, `KeyedHandlerRegistry.onModuleInit` escanea todos los providers y construye el índice `byKey`. Cada provider decorado con `@Handler` que NestJS instanció queda alcanzable por sus claves.
2. **En tiempo de ejecución**, un dispatcher inyecta el registro y llama a `resolveAll(claveEnRuntime)`.
3. El registro devuelve el array de instancias de handler archivadas bajo esa clave — los singletons gestionados por la DI, en orden de registro.
4. El dispatcher itera e invoca el método que defina la interfaz compartida de handler.

Ese último paso necesita un método al que llamar — y `handle` **no** sale del registro. El registro devuelve instancias en crudo y no sabe nada de sus métodos. `handle` sale de un contrato que defines *tú* y que implementa cada handler; ese contrato se lo entregas al registro como su parámetro genérico, para que las instancias devueltas vengan tipadas:

```ts
// 1. El contrato del que depende el dispatcher y que implementa cada handler.
export interface OrderHandler {
  handle(payload: unknown): Promise<void>;
}

// 2. Un handler lo implementa — aquí es donde existe físicamente el método `handle`.
@Handler('order.created')
@Injectable()
export class UpdateInventory implements OrderHandler {
  async handle(payload: unknown): Promise<void> { /* … */ }
}

// 3. El dispatcher tipa el registro con ese contrato, así resolveAll devuelve OrderHandler[].
@Injectable()
export class EventDispatcher {
  constructor(private readonly registry: KeyedHandlerRegistry<OrderHandler>) {}

  async dispatch(event: { type: string; payload: unknown }): Promise<void> {
    for (const handler of this.registry.resolveAll(event.type)) {
      await handler.handle(event.payload); // .handle() viene de OrderHandler, no del registro
    }
  }
}
```

El genérico `<OrderHandler>` es el puente entre el registro sin tipo y tu contrato: hace que `resolveAll` devuelva `OrderHandler[]` en lugar de `unknown[]`, así que TypeScript sabe que cada elemento tiene `.handle()`. Es un puente de *tipado*, no una garantía en runtime — consulta [el compromiso más abajo](#compromisos-y-límites): si archivas bajo la misma clave un provider que no implementa `OrderHandler`, el cast miente y `.handle()` falla en ejecución. De ahí la regla: todo handler bajo una misma clave implementa la misma interfaz.

El dispatcher importa `OrderHandler` (la interfaz que espera) y nada más. Nunca importa un proyector concreto, así que añadir un proyector nuevo para `order.created` se reduce a escribir un provider decorado con `@Handler('order.created')` — el dispatcher no cambia.

## Fan-out: muchos handlers, una clave

El índice es un `Map<string, T[]>`, no `Map<string, T>`. Varios providers pueden declarar la misma clave, y `resolveAll` los devuelve todos:

```ts
@Handler('order.created') @Injectable() class UpdateInventory {}
@Handler('order.created') @Injectable() class SendConfirmation {}
@Handler('order.created') @Injectable() class NotifyWarehouse {}

registry.resolveAll('order.created'); // → [UpdateInventory, SendConfirmation, NotifyWarehouse]
```

Esta es la razón de ser del registro frente a una búsqueda en un `Map` plano: una clave hace fan-out hacia cada handler que se suscribió a ella, y el dispatcher recorre el resultado sin saber cuántos hay.

La misma instancia también puede aparecer bajo varias claves — un provider con `@Handler('a', 'b')` queda archivado bajo ambas, y `resolveAll('a')` y `resolveAll('b')` devuelven el mismo singleton gestionado por la DI.

## Compromisos y límites

- **El descubrimiento es solo en el arranque.** Un provider añadido al grafo de DI después del bootstrap no se indexa. En la práctica todo provider de NestJS se conoce en el arranque, así que rara vez es una limitación — pero las instancias creadas dinámicamente fuera del grafo de módulos no aparecerán.
- **Las claves son cadenas planas, sin comprobación en compilación.** Una errata en una clave — tanto en el lado de `@Handler` como en el de `resolveAll` — no da error; resuelve en silencio a `[]`. Centraliza las claves en constantes compartidas para que ambos lados referencien el mismo valor.
- **El genérico `T` es una comodidad, no una garantía.** `KeyedHandlerRegistry<OrderHandler>` hace que `resolveAll` *devuelva* `OrderHandler[]`, pero nada verifica que las instancias descubiertas implementen realmente `OrderHandler` — el descubrimiento casa por la clave de metadatos, no por la interfaz. Mantén el contrato del handler en una interfaz compartida y haz que cada handler la `implements`, para que el cast sea honesto.
- **Los providers sin metatype de clase se omiten.** El escaneo lee `Reflect.getMetadata(..., wrapper.metatype)`, así que los providers `useValue` / `useFactory` que no tienen metatype de clase nunca se indexan, aunque les adjuntes metadatos al valor. Los handlers deben ser providers de clase.

## Cuándo usarlo

- Dispatch dinámico por una clave en **tiempo de ejecución** — un tipo de evento, tipo de mensaje o nombre de comando — donde el dispatcher no debería conocer los handlers concretos.
- **Fan-out**: una sola clave debe alcanzar un conjunto abierto de handlers, y con el tiempo se añaden nuevos handlers sin tocar el dispatcher.
- Los handlers viven en **módulos o bounded contexts distintos** del dispatcher, e importarlos directamente acoplaría fronteras que deben permanecer independientes.

## Cuándo NO usarlo

- **El colaborador se conoce en tiempo de compilación.** Inyéctalo directamente. La indirección del registro no aporta nada.
- **Basta un conjunto estático con un único token.** Si solo necesitas «todos los providers asociados a un token» y el binding es fijo, la inyección multi-provider de NestJS (`@Inject(TOKEN)` resolviendo a un array) es más simple. El registro merece la pena cuando el dispatch se indexa por una cadena arbitraria en runtime y agrupa handlers por clave.

## Relacionado

- [Registrar y resolver handlers](../../../guides/backend/register-and-resolve-handlers/) — receta paso a paso para decorar un handler, hacer dispatch por clave y verificar el descubrimiento en un test.
- [Puertos entre bounded contexts](../cross-bounded-context-ports/) — el patrón complementario para dependencias cross-BC *estáticas*; el registro resuelve las *dinámicas, por clave*.
- [Andamiaje de módulos del backend](../module-scaffolding/) — cómo se estructura internamente un bounded context.
