---
title: "FieldSchema emite entries de relación"
description: "El CLI ahora emite una entry de relación por cada relationship del YAML en *.field-schema.ts, activando saneo y validación recursiva de agregados anidados."
date: 2026-04-24
version: "Unreleased"
classification: feature
source_commit: "beba3ac948a4960edadc791f560ad893022de9ea"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/beba3ac948a4960edadc791f560ad893022de9ea/openspec/changes/archive/2026-04-24-emit-relation-field-schema-entries/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Cada property del YAML que declara `relationship` produce ahora una entry `{ type: 'relation', cardinality, target: () => <Aggregate>FieldSchema }` en el `*.field-schema.ts` generado, junto a las entries scalar existentes.
- En shape 1 (FK escalar + bloque `relationship`) se mantiene la entry scalar del FK y se añade la entry de relación a continuación; en shape 2 (`type: 'relationship'`) se emite una única entry de relación. La cardinalidad mapea `many-to-one`/`one-to-one` owning → `'one'` y `one-to-many`/`many-to-many` → `'many'`. Las combinaciones inválidas (one-to-many o many-to-many con FK escalar, many-to-one declarado como shape 2) fallan la generación con un error descriptivo.
- Los imports entre schemas hermanos resuelven al barrel top-level `@app/<modulePath>` y el campo `target` se envuelve en un thunk para que las referencias circulares entre agregados carguen sin errores en runtime.

## Por qué importa

`formatRecord` y `sanitizeRecord` recursivos en `@aurorajs.dev/core-back` ya tienen sobre qué recursar: los includes anidados se validan y se sanean según el field schema del agregado target. La fuga P0 que exponía hashes de `password` a través de cualquier `include` de una relación con un campo hasheado queda cerrada en cuanto regeneras. Los módulos que no regeneren mantienen el pipeline legacy no-recursivo. El CLI sube su versión mínima requerida de `@aurorajs.dev/core-back` a la que incluye el pipeline recursivo.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/beba3ac948a4960edadc791f560ad893022de9ea/openspec/changes/archive/2026-04-24-emit-relation-field-schema-entries/)
