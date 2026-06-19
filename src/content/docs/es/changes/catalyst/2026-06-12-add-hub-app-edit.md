---
title: "Editar apps del Hub desde la lista"
description: "El listado de apps del Hub gana una acción Edit para cambiar metadatos mutables y alternar isActive, con code y applicationId inmutables de extremo a extremo."
date: 2026-06-12
version: "Unreleased"
classification: feature
source_commit: "f44716b0d44e6f3f379ba8d2c9f9fd0b3937ef52"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/f44716b0d44e6f3f379ba8d2c9f9fd0b3937ef52/openspec/changes/archive/2026-06-12-add-hub-app-edit/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- El listado de apps del Hub ahora tiene una acción Edit: abres una app registrada, cambias sus metadatos mutables (name, description, url, icon, color, sort) y alternas `isActive` desde la UI.
- `code` y `applicationId` son inmutables — el formulario deshabilita `code` en modo edición y el backend elimina ambos campos del payload de update sea cual sea el transporte.
- `redirectUri` es create-only: oculto y no requerido al editar.

## Por qué importa

La tubería de update ya existía (`hubUpdateAppById`, protegida por el permiso `hub.app.update`), pero el módulo generado se entregó sin la UI de edición — así que no podías activar o desactivar una app, ni corregir sus metadatos, sin editar a mano. Ahora un administrador con `hub.app.update` gestiona las apps registradas directamente desde la lista. El fetch de edición usa el fragment `fields` compartido, por lo que nunca expone el `secret` de OAuth.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/f44716b0d44e6f3f379ba8d2c9f9fd0b3937ef52/openspec/changes/archive/2026-06-12-add-hub-app-edit/)
