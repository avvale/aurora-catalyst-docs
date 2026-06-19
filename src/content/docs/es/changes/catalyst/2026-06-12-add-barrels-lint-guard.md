---
title: "Lint guard de imports por barrel"
description: "Un nuevo comando pnpm hr:lint-barrels fuerza la disciplina de imports por barrel en backend y frontend, conectado a un hook PostToolUse, pre-commit y CI."
date: 2026-06-12
version: "Unreleased"
classification: feature
source_commit: "297e038c11b31954cde99c1f26702082d6af7281"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/297e038c11b31954cde99c1f26702082d6af7281/openspec/changes/archive/2026-06-12-add-barrels-lint-guard/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Nuevo comando `pnpm hr:lint-barrels`: un lint determinista que fuerza la disciplina de imports por barrel (HR-BARRELS-001/002) en backend y frontend.
- Corre en tres sitios — un hook `PostToolUse`, un hook de pre-commit y un modo full-project para CI/auditoría.
- Los exit codes siguen la severidad del catálogo (las violaciones `blocking` fallan, las `informational` solo avisan); los archivos generados se reportan aparte y nunca hacen fallar el run.

## Por qué importa

La disciplina de barrels era solo advisory y se fue desviando — se colaron deep-path imports después de que la regla existiera. El guard la vuelve exigible: una violación `blocking` ahora detiene un commit, y cuando la IA escribe un deep-path import el hook le entrega la regla, la línea y el barrel que debe usar. Resuelve cada specifier (path aliases y rutas relativas) para comparar unidades gobernadas, escanea imports, exports y llamadas a `jest.mock`, y comprueba estructuralmente la política de dos superficies de `@bridges`.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/297e038c11b31954cde99c1f26702082d6af7281/openspec/changes/archive/2026-06-12-add-barrels-lint-guard/)
