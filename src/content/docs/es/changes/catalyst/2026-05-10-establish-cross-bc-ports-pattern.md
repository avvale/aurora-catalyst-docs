---
title: "Patrón ports cross-BC"
description: "Nueva convención arquitectónica: cada dependencia cross-bounded-context se modela como port + adapter + bridge entry, cableada en un `BridgesModule` global."
date: 2026-05-10
version: "Unreleased"
classification: breaking
source_commit: "b9e2580ad11e2388bd4cdecc55ca79cf4a9b51a9"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/b9e2580ad11e2388bd4cdecc55ca79cf4a9b51a9/openspec/changes/archive/2026-05-10-establish-cross-bc-ports-pattern/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- BREAKING (convención arquitectónica) — toda dependencia entre bounded contexts se modela ahora con Ports & Adapters: interface del port + token Symbol bajo `@app/<consumer>/shared/ports/`, adapter bajo `@api/<supplier>/<module>/infrastructure/adapters/` y bridge entry bajo `@bridges/`. Importar el módulo de otro BC desde el tuyo deja de estar permitido.
- Nuevo composition root global `BridgesModule` (`backend/src/@bridges/bridges.module.ts`, decorado con `@Global()`) que importa los módulos supplier, registra los adapters como providers y exporta solo los tokens — nunca las clases adapter ni los services del supplier.
- `SharedModule` pasa a `@Global()` por coherencia con el `CacheModule` / `ConfigModule` que ya viven globales dentro de él. Los `imports: [SharedModule]` redundantes en los BC modules se conservan (deprecarlos es trabajo del codegen del CLI).
- La integración `iam → o-auth` recién shippeada se refactoriza como ejemplo canónico: nuevo port `IClientReader` + token `CLIENT_READER`, un `IamClientReaderAdapter` en el lado de o-auth y un bridge entry. Se revierten `OAuthModule.exports = [...OAuthServices]` e `IamModule.imports = [OAuthModule]`.

## Por qué importa

La integración cross-BC previa acoplaba `IamModule` directamente a `OAuthModule` y exponía el catálogo completo de `OAuthServices`. Su propio design.md lo señalaba como deuda técnica consciente ("PARCHE consciente — no copiar"). Si lo dejábamos así, futuras integraciones (iam↔message, iam↔whatsapp, message↔notification…) replicarían el patrón y el grafo de módulos de catalyst acabaría siendo una maraña de imports cross-BC sin curaduría de lo que cada BC expone. El nuevo patrón sustituye al legado `QueryBus` (que catalyst quitó adrede) con Ports & Adapters tipados en compile-time: cada BC es dueño del contrato que consume, cada supplier es dueño de la traducción a ese contrato, y la superficie auditable es una sola carpeta — `@bridges/`. Un nuevo skill (`catalyst-cross-bc-ports`) documenta la convención y los antipatterns. Cualquier handler que necesite leer cruzando BCs debe migrar a inyección por token.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/b9e2580ad11e2388bd4cdecc55ca79cf4a9b51a9/openspec/changes/archive/2026-05-10-establish-cross-bc-ports-pattern/)
