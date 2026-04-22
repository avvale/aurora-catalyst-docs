---
title: Excluir APIs
description: Omitir operaciones o archivos específicos al regenerar un módulo backend de Catalyst.
---

## Objetivo

Evitar que el CLI de Catalyst emita operaciones o archivos que no quieres — ya sea una operación CRUD completa en todas las capas, o un archivo específico que choca con uno escrito a mano.

## Antes de empezar

- Tienes un proyecto Catalyst con al menos un módulo backend ya scaffoldeado.
- Conoces el bounded context y el nombre del módulo (por ejemplo, `iam/role`).
- Puedes ejecutar `catalyst load back module --force` en tu entorno.

## Pasos

1. **Localiza la YAML del módulo.** Vive en `cliter/<bounded-context>/<module>.aurora.yaml`. Para `iam/role`, eso es `cliter/iam/role.aurora.yaml`.

2. **Elige la granularidad que necesitas.**

   - Para sacar una operación completa — sin controller, sin resolver, sin handler, sin service, sin DTO, sin fragmento de GraphQL — usa `excludedOperations`.
   - Para mantener la operación pero omitir **un archivo específico** (porque lo escribiste a mano o choca con un archivo de `additionalApis`), usa `excludedFiles`.

3. **Edita la YAML en su nivel superior.** Las dos claves viven junto a `aggregateProperties` y `additionalApis`. Los nombres que puedes listar en `excludedOperations` son los de la [tabla de operaciones](../../../concepts/backend/module-scaffolding/#operaciones-que-el-cli-reconoce).

   ```yaml
   # cliter/iam/role.aurora.yaml
   additionalApis:
     - path: iam/role/inherit-permissions-role
       resolverType: mutation
       httpMethod: post
   excludedOperations:
     - count
     - getRaw
     - max
     - min
     - sum
     - updateAndIncrement
     - upsert
   excludedFiles:
     - backend/src/@app/iam/role/application/upsert/iam-upsert-role.handler.ts
   ```

4. **Regenera.**

   ```bash
   catalyst load back module --name=iam/role --force
   ```

5. **Borra los archivos huérfanos a mano.** Si acabas de excluir una operación que antes se generaba, los archivos que el CLI emitió previamente siguen en disco — el CLI nunca borra. Elimínalos manualmente, commitea y vuelve a ejecutar `catalyst load …` para confirmar que la salida quedó consistente.

## Verifica que funcionó

- Vuelve a correr con `--verbose` y confirma que la operación excluida no aparece entre las rutas emitidas:

  ```bash
  catalyst load back module --name=iam/role --force --verbose
  ```

- Para `excludedFiles`: confirma que la ruta que listaste no aparece en el log de salida.
- Ejecuta tu build de backend habitual (`pnpm back:build` o el equivalente de tu proyecto) para detectar imports colgantes que referenciaban al artefacto removido.

## Solución de problemas

**La operación no reapareció después de sacarla de `excludedOperations`.**
Revisa si hay errores de tipeo. Los nombres son sensibles a mayúsculas/minúsculas y deben coincidir exactamente con el [conjunto soportado](../../../concepts/backend/module-scaffolding/#operaciones-que-el-cli-reconoce). Vuelve a correr con `--force --verbose` para ver cada archivo que el CLI consideró.

**Aparecieron archivos `.origin` en operaciones que no toqué.**
Eso significa que los archivos en disco tienen ediciones manuales cuyo SHA-1 ya no coincide con el del lockfile. No tiene relación con la exclusión — mira [Scaffolding de un módulo backend → Lockfile y archivos `.origin`](../../../concepts/backend/module-scaffolding/#lockfile-y-archivos-origin). Resuelve cada `.origin`, o pasa `--noReview` si quieres atenderlos después.

**Excluí una operación pero el esquema GraphQL todavía la referencia.**
Los tipos de GraphQL se regeneran después del load del módulo. Si omitiste ese paso con `--noGraphQLTypes`, ejecuta `pnpm back:graphql:types` a mano para refrescar los exports.

## Relacionado

- [Scaffolding de un módulo backend](../../../concepts/backend/module-scaffolding/) — el concepto detrás de qué se emite y por qué.
- [Referencia de `catalyst load`](../../../reference/cli-commands/load/) — cada flag y argumento.
