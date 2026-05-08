---
title: "Columnas data-table responsive"
description: "Las columnas generadas declaran `size`, `minSize` y `sticky: 'left'` en actions/select, con fallback null-safe en la celda."
date: 2026-05-08
version: "Unreleased"
classification: feature
source_commit: "a41e3fb048b4c4374b235314d856608a1e6abbeb"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/a41e3fb048b4c4374b235314d856608a1e6abbeb/openspec/changes/archive/2026-05-08-emit-responsive-data-table-columns/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- `<mod>.columns.ts` ahora emite un par explícito de `size` (columnas rígidas) o `size + minSize` (elásticas) para cada columna escalar y FK, derivado del tipo de la property mediante una tabla heurística cerrada — `boolean → 100`, `varchar/char ≤ 100 → 200/120`, `varchar/char > 100 → 300/160`, `text → 300/160`, label FK → `220/140`.
- Las columnas runtime-compuestas `actions` (size 50) y `select` (size 40) reciben `sticky: 'left'`, anclándolas al borde izquierdo bajo scroll horizontal.
- Los renderers de celda escalar no-boolean renderizan `null` / `undefined` como vacío (`?? ''`) en lugar del literal `"null"`.

## Por qué importa

Sin `size`/`minSize` explícitos, TanStack inyecta defaults que colapsan toda columna al bucket elástico-sin-mínimo — los anchos saltan entre páginas y no hay anclaje para los offsets sticky. La heurística nueva fija las columnas rígidas a un ancho determinista y deja a las elásticas absorber espacio hasta un mínimo, dando un layout que aguanta en viewports estrechos y anchos estables al paginar. El fallback null-safe en la celda cierra un bug visual previo.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/a41e3fb048b4c4374b235314d856608a1e6abbeb/openspec/changes/archive/2026-05-08-emit-responsive-data-table-columns/)
