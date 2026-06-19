---
title: "Tipo dateTime + remodelado de timestamp"
description: "Un nuevo tipo de propiedad dateTime para strings de fecha-hora ISO, y un remodelado breaking de timestamp a epoch numérico (TypeScript number, Sequelize BIGINT)."
date: 2026-06-16
version: "Unreleased"
classification: breaking
source_commit: "6c30c60e54a8e951f21c1dd8156dfc7e7c1753ec"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/6c30c60e54a8e951f21c1dd8156dfc7e7c1753ec/openspec/changes/archive/2026-06-16-add-datetime-type-and-remodel-timestamp/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- **Breaking:** `type: timestamp` se remodela como epoch numérico — TypeScript `number`, Sequelize `BIGINT` (antes `string` / `DATE`). Cualquier campo que quede en `timestamp` cambia de tipo.
- Nuevo `type: dateTime` para strings de fecha-hora ISO, con mappings internamente consistentes (TS `string`, GraphQL `GraphQLISODateTime`, Sequelize `DATE`), timezone-aware y un widget de formulario de fecha y hora.
- `type: date` (solo fecha) no cambia.

## Por qué importa

`timestamp` antes significaba "string de fecha-hora ISO", pero sus mitades de TypeScript y GraphQL no coincidían (`string` frente a un scalar que el frontend mapeaba a `number`), y eso rompía la compilación. Ahora los tipos se separan limpiamente: declara `dateTime` para cualquier campo de fecha y hora — es el tipo recomendado para los audit fields — y reserva `timestamp` para epochs numéricos de verdad. Para migrar, retipa tus campos `type: timestamp` a `dateTime`; el valor de GraphQL en el cable no cambia, así que los consumidores externos no ven ninguna diferencia. Este cambio entrega la capability del generador; el barrido del YAML y la regeneración ocurren en el repo de tu aplicación.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/6c30c60e54a8e951f21c1dd8156dfc7e7c1753ec/openspec/changes/archive/2026-06-16-add-datetime-type-and-remodel-timestamp/)
