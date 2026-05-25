---
title: "Codegen frontend one-to-one"
description: "El codegen del frontend ahora emite GraphQL, columnas y formulario correctos para las dos variantes de one-to-one: HasOne (navegación) y BelongsTo (FK)."
date: 2026-05-12
version: "Unreleased"
classification: feature
source_commit: "b3f40fe16086184a448d2057589a3eb6e9c99332"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/b3f40fe16086184a448d2057589a3eb6e9c99332/openspec/changes/archive/2026-05-12-extend-frontend-codegen-one-to-one/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- `<module>.graphql.ts` emite un bloque de subcampos (`<rel> { id rowId ... }`) para la navegación one-to-one. La variante HasOne emite solo el bloque de navegación — sin escalar FK —, mientras que BelongsTo emite tanto el FK escalar como el bloque de navegación, replicando la rama existente de many-to-one.
- `<module>.columns.ts` añade una rama de columna one-to-one con `accessorFn` null-safe y la pista `relation: { association: '<navAlias>' }` para que `getRelationIncludes` la recoja. No se usa `accessorKey` con dot-path porque la navegación HasOne puede ser null a nivel de fila.
- `<module>-form.component.ts` excluye las propiedades de navegación HasOne del `FormGroup` del `signalForm` (el FK vive en el otro agregado). El BelongsTo one-to-one se queda como un control FK normal, idéntico a many-to-one.

## Por qué importa

Hasta este cambio, declarar una relación one-to-one en el YAML producía GraphQL inválido al editar (`ScalarLeafsRule` se rompía cuando la proyección incluía un objeto suelto), renderizado de columna incorrecto (`accessorKey: '<rel>'` proyectaba un objeto entero) y una entrada fantasma en el `FormGroup` del lado HasOne. El codegen tenía rama para many-to-one pero ninguna equivalente para one-to-one, así que el único parche era editar a mano los tres ficheros generados — y el siguiente `catalyst generate` los machacaba. Ahora las dos formas válidas de YAML (HasOne solo navegación y BelongsTo dueño del FK) se manejan correctamente desde el primer día, y los proyectos que llevan parches manuales — por ejemplo `o-auth/access-token` con `refreshToken` como HasOne a `OAuthRefreshToken` — verán el codegen ponerse al día en lugar de pisar sus correcciones. Sin migración: la salida nueva es estrictamente correcta donde la vieja fallaba en runtime.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/b3f40fe16086184a448d2057589a3eb6e9c99332/openspec/changes/archive/2026-05-12-extend-frontend-codegen-one-to-one/)
