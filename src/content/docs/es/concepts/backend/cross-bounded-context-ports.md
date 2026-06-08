---
title: Ports entre bounded contexts
description: Cómo Aurora Catalyst desacopla los bounded contexts a través de la carpeta @bridges — ports, tokens, adapters y el composition root global BridgesModule.
---

## Por qué existe

Aurora Catalyst organiza el backend en bounded contexts. Cada uno vive en `backend/src/@app/<bc>/` (dominio + aplicación) y `backend/src/@api/<bc>/` (REST + GraphQL), y se registra en `app.module.ts` como `<Bc>Module`. El sentido completo de partir el backend en BCs es que cada uno evolucione por su cuenta — equipos distintos, ritmos de release distintos, modelos internos distintos.

La tentación cuando un BC necesita datos o comportamiento de otro es cablearlos a nivel de módulo: `IamModule.imports = [OAuthModule]` y `OAuthModule.exports = [...OAuthServices]`. Funciona, pero fusiona los dos BCs. Refactorizar los internals del supplier rompe al consumer, el catálogo completo de servicios del supplier se filtra a través de la frontera, y no hay un único lugar donde auditar qué BCs dependen de cuáles.

`backend/src/@bridges/` es la alternativa. Cada dependencia entre bounded contexts pasa por cuatro archivos pequeños — un port, un token, un adapter y una bridge entry — cableados a través de un único composition root global, `BridgesModule`. Los consumers dependen solo de contratos que ellos mismos declararon; los suppliers traducen su modelo interno a esos contratos; y toda la superficie cross-BC es una sola carpeta que puedes grepear.

## Las cuatro piezas

### 1. Port — qué necesita el consumer

Una interfaz de TypeScript más el DTO que el consumer intercambia con el supplier. Dos sabores según la dirección — consulta [Read ports vs write ports](#read-ports-vs-write-ports) más abajo para la distinción completa. El ejemplo aquí es la forma canónica *read*: un DTO mínimo en el vocabulario del consumer.

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

El port vive **donde vive su DTO** — ver [Read ports vs write ports](#read-ports-vs-write-ports) más abajo para la regla completa. Para este ejemplo read, el consumer (iam) es dueño del DTO, así que el port queda en el territorio de iam en `@bridges/iam/client/ports/iam-client-reader.port.ts`.

### 2. Token — la clave de inyección

Una constante `Symbol(...)` al lado del port. El consumer inyecta `@Inject(TOKEN)`; el contenedor DI en runtime resuelve el símbolo al adapter al que apunta la bridge entry.

```ts
// backend/src/@bridges/iam/client/ports/iam-client-reader.token.ts
export const IAM_CLIENT_READER = Symbol('IAM_CLIENT_READER');
```

### 3. Adapter — la implementación del supplier

Una clase con `@Injectable()` que implementa el port. Vive **del lado del supplier** dentro de `@bridges/`, inyecta por constructor el service interno del supplier y traduce el modelo del supplier al DTO del consumer.

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

El adapter es el único lugar del código que conoce los dos mundos: el service interno del supplier y el contrato del consumer. Todo lo demás se queda de su lado.

### 4. Bridge entry — el cableado

Un `Provider` de NestJS que ata el token al adapter usando `useExisting`. La bridge entry no crea ninguna instancia nueva — reusa la instancia del adapter que ya declara el supplier module.

```ts
// backend/src/@bridges/iam-client-reader.bridge.ts
export const iamClientReaderBridge: Provider = {
  provide: IAM_CLIENT_READER,
  useExisting: OAuthClientReaderAdapter,
};
```

## El composition root: BridgesModule

`backend/src/@bridges/bridges.module.ts` está decorado `@Global()`. Es el único composition root por el que pasan las dependencias cross-BC.

```ts
@Global()
@Module({
  imports: [OAuthModule, IamModule],
  providers: [iamClientReaderBridge, credentialVerifierBridge, accountLoaderBridge],
  exports: [IAM_CLIENT_READER, CREDENTIAL_VERIFIER, ACCOUNT_LOADER],
})
export class BridgesModule {}
```

Tres responsabilidades, en orden:

1. **Imports** — los supplier modules. Se importan para que las instancias de adapter que ellos declaran sean visibles para el DI de NestJS. Los adapters NO son providers de `BridgesModule`.
2. **Providers** — las bridge entries, cada una atando un token a un adapter mediante `useExisting`.
3. **Exports** — solo tokens. Nunca las clases adapter. Nunca los services internos del supplier.

Como el módulo es `@Global()`, ningún consumer module tiene que importarlo. Cualquier handler en cualquier BC puede hacer `@Inject(TOKEN)` sobre un port sin acoplar su propio módulo a `BridgesModule` ni al supplier.

### Zero-leak: cómo cooperan los suppliers

El patrón en este código se llama **zero-leak** porque los supplier modules exportan únicamente sus adapters — nada del catálogo de servicios internos cruza la frontera. Cada supplier module que participa en `@bridges/` declara su adapter cross-BC como provider Y como el único export que añade hacia `@bridges/`:

```ts
// backend/src/@api/o-auth/o-auth.module.ts
@Module({
  providers: [/* … services internos … */, OAuthClientReaderAdapter],
  exports: [OAuthClientReaderAdapter],
})
export class OAuthModule {}
```

Un futuro BC que importe `OAuthModule` ve `OAuthClientReaderAdapter` y nada más de los internals de o-auth. El supplier decide qué expone; el consumer nunca alcanza más allá del port.

## Qué hay hoy

| Token                          | Variant | Port                                                                                | Adapter                                                                          | Consumer            | Supplier            |
| ------------------------------ | ------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------- | ------------------- |
| `IAM_CLIENT_READER`            | read    | `@bridges/iam/client/ports/iam-client-reader.port.ts`                               | `@bridges/o-auth/client/adapters/o-auth-client-reader.adapter.ts`                | `iam` (BC)          | `o-auth` (BC)       |
| `CREDENTIAL_VERIFIER`          | read    | `@aurora/modules/authentication/domain/ports/credential-verifier.port.ts`           | `@bridges/iam/user/adapters/iam-credential-verifier.adapter.ts`                  | `authentication`    | `iam` (BC)          |
| `ACCOUNT_LOADER`               | read    | `@aurora/modules/authentication/domain/ports/account-loader.port.ts`                | `@bridges/iam/account/adapters/iam-account-loader.adapter.ts`                    | `authentication`    | `iam` (BC)          |
| `IAM_BOUNDED_CONTEXT_SEEDER`   | write   | `@bridges/iam/bounded-context/ports/iam-bounded-context-seeder.port.ts`             | `@bridges/iam/bounded-context/adapters/iam-bounded-context-seeder.adapter.ts`    | `o-auth` (BC)       | `iam` (BC)          |
| `IAM_PERMISSION_SEEDER`        | write   | `@bridges/iam/permission/ports/iam-permission-seeder.port.ts`                       | `@bridges/iam/permission/adapters/iam-permission-seeder.adapter.ts`              | `o-auth` (BC)       | `iam` (BC)          |

La primera fila es el caso canónico *read*: `iam` declara qué necesita de `o-auth`, el port vive en el territorio de iam bajo `@bridges/iam/`, y el adapter vive en el territorio de o-auth bajo `@bridges/o-auth/`.

Las filas 2 y 3 son read ports cuyo consumer es un módulo de framework, no un BC. Sus ports viven en `@aurora/modules/authentication/domain/ports/` porque `authentication` es infraestructura de framework — el módulo de framework es dueño del contrato y cualquier BC concreto puede cumplirlo. Las dependencias BC-a-BC nuevas no usan este layout; viven bajo `@bridges/<consumer-bc>/`.

Las dos últimas filas son ports *write* para el seeding de bootstrap de o-auth hacia iam — ver la sección siguiente.

## Read ports vs write ports

Las mismas cuatro piezas cablean dos intenciones distintas. Lo que cambia entre ellas es el DTO del port — y la propiedad del DTO decide dónde vive el archivo del port.

> **La regla:** el port vive donde vive su DTO.

### Read ports — el consumer proyecta lo que necesita

El port devuelve un DTO con la forma del vocabulario del consumer, no del supplier. El adapter traduce el modelo interno del supplier a ese DTO — aplanando relaciones, renombrando campos, descartando los que el consumer no necesita. Esto es la **Anti-Corruption Layer** de DDD expresada en DI puro de NestJS: si `o-auth` renombra mañana `applications` a `apis`, solo se rompe `OAuthClientReaderAdapter`; `iam` no ve el cambio.

El DTO tiene la forma del consumer → **el archivo del port vive en el territorio del consumer** (`@bridges/<consumer-bc>/<feature>/ports/`). Escribes el DTO a mano al lado del port, con el naming `<Consumer><DescriptiveName>`.

Caso canónico: `IIamClientReader.findByIdWithApplications()` devuelve un `IamClientWithApplications` escrito a mano con solo `id` y `applicationCodes` — no el modelo `OAuthClient` completo. El port queda en `@bridges/iam/client/ports/iam-client-reader.port.ts`.

### Write ports — el consumer reenvía datos al supplier

El consumer no tiene vocabulario propio sobre el recurso que escribe; solo está orquestando datos hacia un supplier que sí es dueño de ellos. El DTO ES el contrato de input del supplier, reutilizado tal cual desde upstream — normalmente un tipo framework-level de `@aurorajs.dev/core-back` (`SeederBoundedContext`, `RepositoryOptions`) o el tipo `*Input` GraphQL del supplier. El adapter es un pass-through sin mapping.

El DTO tiene la forma del supplier → **el archivo del port vive en el territorio del supplier** (`@bridges/<supplier-bc>/<resource>/ports/`). El port es en esencia la interfaz driving del supplier para escrituras cross-BC — un contrato que cualquier consumer del proyecto puede inyectar por token. El prefijo del archivo coincide con el supplier (p. ej. `iam-bounded-context-seeder.port.ts` bajo `@bridges/iam/bounded-context/ports/`).

Caso canónico: `IIamBoundedContextSeeder.seedAll(items, options)` acepta `SeederBoundedContext[]` y `RepositoryOptions` directamente de core-back. Escribir un DTO casi-duplicado a mano solo introduciría drift cuando el contrato de input del supplier evolucione, y no aporta valor de Anti-Corruption Layer (no hay proyección que hacer).

### Cómo elegir entre los dos

> ¿Tiene el consumer vocabulario propio sobre este recurso?
>
> - **Sí** — el consumer reduce, aplana o renombra el modelo del supplier → escribe un DTO custom en el territorio del consumer, al lado del port. **Read port.**
> - **No** — el consumer reenvía datos que semánticamente pertenecen al supplier → reutiliza el tipo existente del supplier o del framework, y coloca el port en el territorio del supplier. **Write port.**

Las dos variantes comparten la misma estructura de 4 archivos (port, token, adapter, bridge entry) y el mismo registro en el composition root. Solo cambian la procedencia del DTO y la ubicación del archivo del port.

## Cuándo aplica

- Un handler o service de un BC necesita leer datos que pertenecen a otro BC.
- Un handler o service de un BC necesita disparar comportamiento que pertenece a otro BC.

## Cuándo NO usarlo

- **Acceso dentro del mismo BC.** Handlers, services y repositorios del mismo BC se inyectan directamente entre sí — los ports serían puro overhead sin ganar aislamiento.
- **Scripts puntuales, seeds o tests** que no son parte del grafo de módulos en runtime. Pueden importar lo que necesiten.
- **Infraestructura de framework ya expuesta globalmente** (cache, config, i18n, audit). `SharedModule` es `@Global()` precisamente para que esto no necesite ningún port.

## Trade-offs y límites

- **Boilerplate por dependencia.** Cuatro archivos pequeños en lugar de un único `imports: [OtherModule]`. El intercambio es aislamiento en tiempo de compilación entre BCs y una sola superficie auditable — `@bridges/` más `bridges.module.ts`.
- **El adapter sí acopla `@bridges/` al service interno del supplier.** Ese es el punto: alguien tiene que traducir, y le toca al supplier. Los refactors internos de un service del supplier sí se propagan a su adapter — pero ahí se detienen.
- **Dos módulos `@Global()` en el proyecto.** `BridgesModule` y `SharedModule`. Ambos son composition roots por diseño, no por comportamiento. La regla sigue siendo la misma: no tires de `@Global()` para nada más.

## Relacionado

- [Añadir un port cross-BC](../../../guides/backend/add-a-cross-bc-port/) — receta paso a paso para cablear una nueva dependencia cross-BC.
- [Cross-BC ports pattern — changelog](../../../changes/catalyst/2026-05-10-establish-cross-bc-ports-pattern/) — el cambio original que introdujo la convención.
- [Scaffolding de un módulo](../module-scaffolding/) — cómo se organiza internamente un BC antes de cualquier preocupación cross-BC.
