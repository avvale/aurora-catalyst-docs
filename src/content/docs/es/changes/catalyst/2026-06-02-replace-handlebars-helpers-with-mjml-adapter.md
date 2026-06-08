---
title: "Adaptador MJML para emails"
description: "El mailer pasa al adaptador de plantillas MJML y elimina la dependencia abandonada handlebars-helpers — un cambio breaking para quien dependa de sus ~180 helpers."
date: 2026-06-02
version: "Unreleased"
classification: breaking
source_commit: "f6e4ea61dd17c20cc374514291a319c9073adaf4"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/f6e4ea61dd17c20cc374514291a319c9073adaf4/openspec/changes/archive/2026-06-02-replace-handlebars-helpers-with-mjml-adapter/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- **Breaking:** el motor de plantillas del mailer pasa al `MjmlAdapter` de `@nestjs-modules/mailer` (que envuelve Handlebars), y se elimina la dependencia abandonada `handlebars-helpers` — sus ~180 helpers genéricos ya no están disponibles dentro de las plantillas de email.
- Las plantillas de email ahora se escriben en MJML (compilado a HTML responsive con CSS inline); se incluyen un layout base y una plantilla de ejemplo, y se preserva el helper i18n `t` personalizado.

## Por qué importa

`handlebars-helpers@0.10.0` (publicado por última vez hacia 2018) arrastraba transitivas con deprecaciones de seguridad sin beneficio alguno — hoy no hay plantillas de email y el mailer está deshabilitado por defecto (`MAILER_ENABLED !== 'true'`). De aquí en adelante escribes las plantillas en MJML y obtienes HTML responsive a prueba de balas sin un adaptador propio. Si dependías de alguno de los 180 helpers de Handlebars debes reemplazarlo; el comportamiento de arranque deshabilitado por defecto no cambia.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/f6e4ea61dd17c20cc374514291a319c9073adaf4/openspec/changes/archive/2026-06-02-replace-handlebars-helpers-with-mjml-adapter/)
