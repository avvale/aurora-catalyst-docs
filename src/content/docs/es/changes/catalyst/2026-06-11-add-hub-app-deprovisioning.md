---
title: "Deprovisión OAuth al borrar"
description: "Borrar una app del HUB ahora desmantela atómicamente su identidad OAuth — aplicación, clientes y refresh tokens — y libera su code para re-registrarla."
date: 2026-06-11
version: "Unreleased"
classification: feature
source_commit: "f55fa4f57bc968031eea633a79ad6f347ed3f044"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/f55fa4f57bc968031eea633a79ad6f347ed3f044/openspec/changes/archive/2026-06-11-add-hub-app-deprovisioning/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Borrar una `HubApp` ahora deprovisiona su identidad OAuth en la misma transacción todo-o-nada: la aplicación OAuth, sus clientes, sus filas de vínculo y todos los refresh tokens de esos clientes se eliminan físicamente. Cualquier fallo lo revierte todo.
- Los access tokens se dejan expirar deliberadamente por sí solos y los purga después el job de retención existente — solo el vector de renovación muere al instante.
- Como la aplicación OAuth se elimina físicamente, el `code` único de la app queda libre y puede registrarse de nuevo; el diálogo de confirmación ahora avisa de que las credenciales y el SSO terminan de forma inmediata e irreversible.

## Por qué importa

Es el espejo de la provisión al registrar. Antes, borrar una app dejaba su identidad OAuth huérfana: el código quedaba ocupado para siempre y las sesiones del satélite podían renovarse indefinidamente. Ahora el borrado es un desmantelamiento real — una app borrada ya no puede renovar sesión, y el catálogo conserva su historial mientras las credenciales desaparecen de verdad. El borrado del HUB es el dueño único de la deprovisión, completando la garantía anti-drift en ambas direcciones.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/f55fa4f57bc968031eea633a79ad6f347ed3f044/openspec/changes/archive/2026-06-11-add-hub-app-deprovisioning/)
