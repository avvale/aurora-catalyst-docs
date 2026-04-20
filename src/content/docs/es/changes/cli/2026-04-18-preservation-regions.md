---
title: "Preservation regions en HTML"
description: "Las preservation regions marcan zonas de HTML generado con marcadores AURORA:NAME. Tus ediciones manuales o de IA sobreviven a la regeneración, mientras que las regiones que no tocaste siguen recibiendo mejoras del template."
date: 2026-04-18
version: "Unreleased"
classification: feature
source_commit: "79c30b8f0bb7b3eb894c33374707926bd2bf5449"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/79c30b8f0bb7b3eb894c33374707926bd2bf5449/openspec/changes/archive/2026-04-18-preservation-regions/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Declara una preservation region en HTML con `<!-- #region AURORA:NAME-START -->` y ciérrala con `<!-- #endregion AURORA:NAME-END -->`. El nombre sigue una gramática de mayúsculas, dígitos y guiones entre grupos no vacíos.
- Lo que edites dentro de una región se mantiene byte a byte al regenerar. Si nunca la tocaste, el cuerpo nuevo del template entra automáticamente en la próxima sync.
- `[REGION DROPPED] <file>: <name>` aparece siempre que un template deja de declarar una región y tu cuerpo custom se perdería: visible sin falta. Con `--verbose`, `[REGION UPDATED]` y `[REGION PRESERVED]` detallan decisiones por región.

## Por qué importa

Ahora compartes los ficheros generados con el engine sin fricción: ajusta a mano el layout de un formulario, pega validadores escritos por IA, conserva tu markup y sigue recibiendo mejoras del template sin resolver un merge manual cada vez. El formato del lockfile pasa a `0.1.0` para que el CLI guarde un hash por región; los lockfiles anteriores `0.0.1` sin el campo `regions` siguen siendo válidos y caen al modo seguro "preservar todo" hasta la próxima regeneración. Hoy el scope es sólo HTML — próximos changes pueden extender el mismo mecanismo a comentarios de TS y CSS sin romper el contrato.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/79c30b8f0bb7b3eb894c33374707926bd2bf5449/openspec/changes/archive/2026-04-18-preservation-regions/)
