---
title: "Traducción de lista vacía seedada"
description: "El codegen seedea `No<Plural>Found` en EN + ES para que las listas vacías muestren un mensaje legible en vez de la clave cruda."
date: 2026-05-08
version: "Unreleased"
classification: feature
source_commit: "c70036405358d68a5cd055c473a8118e88ebde5b"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/c70036405358d68a5cd055c473a8118e88ebde5b/openspec/changes/archive/2026-05-08-emit-no-results-found-translations/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- `generateFrontTranslations` seedea una clave `No<PluralPascal>Found` bajo `frontend/public/i18n/<bc>/<lang>.json` por módulo, con default consciente del idioma: `'No <pluralLower> found.'` para `en`, `'No se encontraron <pluralLower>.'` para `es`. Un langCode desconocido cae al formato inglés.
- El seed es idempotente — solo escribe cuando la clave está `undefined` actualmente. Los valores existentes (editados a mano o seedados antes) se preservan tal cual.
- Un nuevo mapa de dispatch `NO_RESULTS_FOUND_DEFAULTS` al final de `code-writer.ts` es la única fuente de verdad para esos defaults; añadir un idioma nuevo es una entrada.

## Por qué importa

Cada list-component ya bindea `[emptyMessage]="t('<bc>.<mod>.No<Plural>Found')"`, pero el handler de traducciones nunca seedaba esa clave — cinco de los siete módulos IAM renderizaban el texto crudo `iam.role.NoRolesFound` en producción cuando su lista estaba vacía. Regenerar cualquier módulo de un BC existente rellena la clave en los dos idiomas sin riesgo para las otras entradas.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/c70036405358d68a5cd055c473a8118e88ebde5b/openspec/changes/archive/2026-05-08-emit-no-results-found-translations/)
