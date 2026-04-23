---
title: Decoradores de field-schema
description: Cablea @ApplySchema, @Format o @Sanitize sobre el main() de un handler para que el payload se valide y el retorno se formatee automáticamente.
---

## Objetivo

Elegir el decorador correcto de field-schema para el handler que acabas de scaffoldear, cablearlo en `main()` y dejar que él se ocupe de la validación, la sanitización y el enmascarado del output — en lugar de duplicar esas comprobaciones a mano.

## Antes de empezar

- Tienes un módulo backend scaffoldeado y su archivo `*.field-schema.ts` existe en disco. El CLI lo generó desde `aggregateProperties` en la YAML del módulo; no lo edites a mano.
- Sabes qué rol tiene el handler: ¿recibe un payload?, ¿devuelve la entidad?
- `@aurorajs.dev/core-back` y `@aurorajs.dev/core-common` están instalados — ambos vienen con cualquier backend de Catalyst.

## Pasos

1. **Elige el decorador con este árbol de decisión.**

   ```
   ¿El handler RECIBE un payload?
     ├── No  → @Format(schema)
     └── Sí  → ¿DEVUELVE la entidad?
                ├── Sí → @ApplySchema(schema)
                └── No → @Sanitize(schema)
   ```

   `@ApplySchema` compone sanitize (input) + format (output). `@Format` solo formatea el retorno (las lecturas son idempotentes). `@Sanitize` solo sanitiza el payload (flujos de escritura cuyo retorno es `void`, un booleano o un tipo resumen).

2. **Cablea `@ApplySchema` en un handler de escritura que devuelve la entidad.** Ejemplo real desde `iam/tag`:

   ```typescript
   import { ApplySchema, EmitEvent } from '@aurorajs.dev/core-back';
   import { IamTagFieldSchema } from '@app/iam/tag/domain';

   @EmitEvent('iam.tag.created')
   @ApplySchema(IamTagFieldSchema)
   async main(payload: IamCreateTagInput, handlerMeta?: HandlerMeta): Promise<IamTag> {
     await this.createService.main(payload, handlerMeta);
     return await this.findByIdService.main(payload.id, {}, handlerMeta);
   }
   ```

   `sanitize` corre sobre `payload` ANTES de que se ejecute `main()` — en `iam/user`, por ejemplo, ahí es donde `type: 'password'` convierte el texto plano en un hash bcrypt. `format` corre sobre el retorno DESPUÉS de que `main()` resuelva — ahí `password` se vuelve `undefined` antes de salir al cliente.

3. **Cablea `@Format` en un handler de lectura.**

   ```typescript
   import { Format } from '@aurorajs.dev/core-back';

   @Format(IamTagFieldSchema)
   async main(id: string, constraint?: QueryStatement, handlerMeta?: HandlerMeta): Promise<IamTag> {
     const tag = await this.findByIdService.main(id, constraint, handlerMeta);
     if (!tag) throw new NotFoundException(`IamTag with id: ${id}, not found`);
     return tag;
   }
   ```

   `@Format` detecta automáticamente la forma del retorno — objeto individual, array o `Pagination` con una lista `.rows` — y formatea cada elemento.

4. **Si el payload no es el primer argumento, usa la forma de objeto.**

   ```typescript
   @ApplySchema({ schema: IamTagFieldSchema, payloadIndex: 1 })
   async main(constraint, payload, handlerMeta?) { … }
   ```

   Misma opción en `@Sanitize`. `@Format` no tiene `payloadIndex` — siempre opera sobre el retorno.

5. **En handlers de update, calcula el delta con `Obj.diff`.** Tras la sanitización, persiste solo lo que cambió. Uso real en `iam-update-tag-by-id.handler.ts`:

   ```typescript
   import { Obj } from '@aurorajs.dev/core-common';

   const tag = await this.findByIdService.main(payload.id, constraint, handlerMeta);
   if (!tag) throw new NotFoundException(`IamTag with id: ${payload.id}, not found`);

   const dataToUpdate = Obj.diff(payload, tag);

   await this.updateByIdService.main(
     { ...dataToUpdate, id: payload.id }, // reinyecta el id — diff omite claves coincidentes
     constraint,
     handlerMeta,
   );
   ```

   `Obj.diff` omite las claves cuyo valor coincide en ambos lados, así que el `id` hay que volver a añadirlo explícitamente como clave objetivo.

## Verifica que funcionó

- Para un campo `type: 'password'`, crea un usuario e inspecciona la fila: la columna guarda un hash bcrypt, nunca texto plano. Vuelve a leerlo — la clave `password` no aparece en la respuesta.
- Para `maxLength`, `enumOptions` o `nullable`, envía un payload que viole la restricción. El decorador lanza antes de que `main()` se ejecute.
- Los timestamps del retorno llevan la timezone del caller. Esa es la señal de que `@Format` / `@ApplySchema` extrajo `handlerMeta.timezone` — una llamada directa a `formatRecord()` la perdería.

## Solución de problemas

**Una relación cargada con `include` filtra un campo sensible.** `formatRecord` no entra recursivamente en las relaciones cargadas con `include`. Ese caso se trata aparte — mira [Componer un QueryStatement](../query-with-querystatement/#cargar-relaciones-de-forma-segura).

**La validación corre dos veces** — una en el decorador y otra dentro de `main()`. Elimina la comprobación del handler. `@ApplySchema` ya aplicó `maxLength`, `nullable`, `enumOptions` y las `rules` declaradas. Deja solo reglas de negocio que la FieldSchema no pueda expresar (invariantes entre campos, cálculos de dominio).

**Recurres a un Value Object para encapsular la validación.** Catalyst no tiene capa de VO — la validación y la modificación se delegan completamente a `FieldSchema` + type handlers vía `@ApplySchema`. Expresa la regla en `aggregateProperties` de la YAML y regenera.

**Llamada directa a `formatRecord()` o `sanitizeRecord()`.** Evítala. El decorador cablea `handlerMeta.timezone` y otras opciones automáticamente; una llamada directa pierde ese contexto y produce output inconsistente.

## Relacionado

- [Scaffolding de un módulo backend](../../../concepts/backend/module-scaffolding/) — por qué `*.field-schema.ts` se genera desde YAML y no se edita a mano.
- [Componer un QueryStatement](../query-with-querystatement/) — el lado de consulta de la capa declarativa de acceso a datos.
