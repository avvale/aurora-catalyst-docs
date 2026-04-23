---
title: Componer un QueryStatement
description: Construye cláusulas where/include/order con el enum Operator, propaga constraint para el scoping por tenant y sortea la brecha de seguridad entre include y format.
---

## Objetivo

Componer un `QueryStatement` tipado dentro de un handler — `where`, `include`, `order`, `limit` — usando el enum `Operator` en lugar de strings literales, y cargar relaciones sin filtrar campos enmascarados.

## Antes de empezar

- Tienes un handler backend scaffoldeado (un handler de lectura es el caso habitual).
- Entiendes los dos parámetros `QueryStatement` que recibe un handler de catalyst:
  - `queryStatement` — el payload **orientado al cliente** de filtro / orden / paginación, enviado por el resolver o el controller.
  - `constraint` — el **scope del servidor** (tenant id, filtro de permisos), inyectado río arriba por middleware o decoradores.

  Trátalos como de solo lectura. Combinarlos es trabajo de la capa de servicio.
- `@aurorajs.dev/core-common` está instalado — viene con cualquier backend de Catalyst.

## Pasos

1. **Importa los helpers tipados.** Tipa siempre el statement y usa siempre el enum:

   ```typescript
   import { Operator, QueryStatement } from '@aurorajs.dev/core-common';
   ```

2. **Construye `where` con `Operator.X` — nunca con strings literales.**

   ```typescript
   const queryStatement: QueryStatement = {
     where: {
       [Operator.and]: [
         { isActive: true },
         { name: { [Operator.iLike]: `${query.prefix}%` } },
       ],
     },
     order: [['createdAt', 'DESC']],
     limit: query.limit ?? 50,
   };
   ```

   ¿Por qué no `'[iLike]'`? Un typo como `'[ilike]'` (con `l` minúscula) falla en silencio en runtime: el operador no se reconoce y el filtro degenera en una comparación literal. `Operator.iLike` se valida en compile-time; `Operator.iLikE` es error de compilación.

   El catálogo completo de `Operator` cubre comparación (`eq`, `ne`, `gt`, `gte`, `lt`, `lte`), inclusión (`in`, `notIn`), patrones de texto (`like`, `iLike`, `startsWith`, `endsWith`, `substring`, `regexp`, …), rangos (`between`, `notBetween`), composición lógica (`and`, `or`, `not`, `is`), operadores PG de rango / array (`overlap`, `contains`, `contained`, …) y cuantificadores (`any`, `all`). Importa y usa el enum — no escribas la forma string a mano.

3. **Carga relaciones con `include`.** El `field` del relationship en la YAML (por ejemplo, `field: tenant`) se convierte en la clave de asociación:

   ```typescript
   const queryStatement: QueryStatement = {
     where: { id: accountId },
     include: [{ association: 'user' }, { association: 'tenant' }],
   };
   ```

   Anida para cargar un grafo:

   ```typescript
   { include: [{ association: 'user', include: [{ association: 'preferences' }] }] }
   ```

4. **Propaga `queryStatement` y `constraint` al servicio sin modificarlos.** Si necesitas aumentar el objeto, crea uno nuevo con spread; no mutes los que recibiste.

   ```typescript
   return await this.getService.main(queryStatement, constraint, handlerMeta);
   ```

### Cargar relaciones de forma segura

`@Format` y `@ApplySchema` aplican la FieldSchema solo a los campos de **primer nivel** del registro devuelto. `formatRecord` no entra recursivamente en las relaciones cargadas con `include`. Cualquier campo con un `format()` protector — `type: 'password'` devuelve `undefined`, y lo mismo vale para tokens, secretos o blobs firmados — queda enmascarado en la entidad raíz pero pasa intacto en una relación cargada por include:

```typescript
// IamAccount con @Format(IamAccountFieldSchema) e include: user
// account.password      → undefined  (correcto — aplicó la máscara de primer nivel)
// account.user.password → '$2b$10$...' ← FILTRA el hash bcrypt
```

El fix aguas arriba está trackeado como **SPEC-07** en `aurora-catalyst-cli/ROADMAP.md` (un `formatRecord` recursivo que aplica el schema propio de cada relación). Hasta que aterrice, dos patrones viables:

**Opción A — format manual sobre la relación.** Preferible cuando el cliente necesita la entidad relacionada de forma atómica:

```typescript
import { formatRecord } from '@aurorajs.dev/core-back';
import { IamUserFieldSchema } from '@app/iam/user/domain';

async main(
  id: string,
  constraint?: QueryStatement,
  handlerMeta?: HandlerMeta,
): Promise<IamAccount> {
  const account = await this.findByIdService.main(
    id,
    { ...constraint, include: [{ association: 'user' }] },
    handlerMeta,
  );

  if (account.user) {
    // Workaround temporal de SPEC-07 — formatRecord no recursa en include.
    account.user = formatRecord(account.user, IamUserFieldSchema, handlerMeta?.timezone);
  }

  return account;
}
```

Este es uno de los pocos casos donde llamar a `formatRecord` directamente está justificado — el decorador no sabe nada de la relación incluida. Deja un comentario apuntando a SPEC-07 para que un refactor futuro pueda eliminar el workaround cuando el fix aterrice.

**Opción B — evita `include` en entidades con campos enmascarados.** Carga la relación en un endpoint separado donde sea la entidad raíz y `@Format` la enmascare correctamente. Es la opción más segura cuando la carga atómica no es estrictamente necesaria.

## Verifica que funcionó

- Inspecciona el SQL generado (vía logs de Sequelize o en la base de datos): el predicado usa el operador correcto (`ILIKE`, `BETWEEN`, `IN`, …) y no trata la clave del operador como un nombre de columna.
- Para un `include` con una relación sensible, confirma que el campo enmascarado NO aparece en el JSON devuelto después de aplicar el workaround.
- Confirma que `constraint` no se refleja en la respuesta ni en mensajes de error — transporta el scope de tenant / permisos y tiene que quedarse del lado servidor.

## Solución de problemas

**El filtro matchea todas las filas o ninguna.** Suele ser un typo en un operador como string literal. Pásate al enum `Operator.X` — TypeScript atrapa el error en compile-time.

**El merge del servicio se rompe después del handler.** Mutaste `queryStatement` o `constraint`. Trátalos como inmutables. Si necesitas un criteria aumentado, créalo nuevo con spread.

**`attributes` usado para ocultar una columna sensible.** `attributes` es una proyección (qué columnas seleccionar), no una frontera de seguridad. Cualquier consumidor que omita `attributes` filtrará la columna. Enmascara campos sensibles vía el handler `format` del field schema (`@Format` / `@ApplySchema`), que se aplica en cada lectura sin importar cómo se construyó la query.

**La relación cargada sigue filtrando el hash.** Aplicaste `@Format` pero omitiste la Opción A. `formatRecord` no recursa — llámalo manualmente sobre la relación, o directamente no uses `include`.

## Relacionado

- [Decoradores de field-schema](../apply-field-schema-decorators/) — el lado de validación / format de la capa declarativa.
- [Scaffolding de un módulo backend](../../../concepts/backend/module-scaffolding/) — cómo se declaran los relationships en YAML.
