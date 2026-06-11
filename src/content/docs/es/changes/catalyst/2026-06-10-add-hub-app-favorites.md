---
title: "Preferencias de dashboard por usuario"
description: "Favoritos con estrella y reordenación drag-and-drop en el dashboard del HUB, guardados por usuario con los nuevos endpoints toggle-favorite, reorder-apps y my-preferences."
date: 2026-06-10
version: "Unreleased"
classification: feature
source_commit: "11af874f36473608c69cedec257834257f36c6f9"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/11af874f36473608c69cedec257834257f36c6f9/openspec/changes/archive/2026-06-10-add-hub-app-favorites/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Cada tarjeta del dashboard gana una estrella de favorito, y tanto el grupo de favoritos como el resto se pueden reordenar con drag and drop; el orden se guarda por usuario, con el `sort` del administrador como respaldo.
- Añade tres endpoints en `hub/app` — `toggle-favorite`, `reorder-apps` y `my-preferences` — que resuelven la cuenta en el servidor desde el principal de la petición; el cliente nunca envía un `accountId`.
- La lectura del dashboard (`hubGetApps`) y los endpoints de preferencias se abren a cualquier usuario autenticado, corrigiendo el 403 que los no administradores recibían en su propia página de inicio.

## Por qué importa

El dashboard es la página de aterrizaje tras el login, pero todos veían el mismo orden definido por el administrador. Ahora cada usuario puede destacar primero sus apps de uso diario y ordenar ambos grupos a su gusto, con cambios optimistas que se revierten si el servidor falla. Las filas de preferencia se crean de forma perezosa en la primera interacción y pertenecen estrictamente a la cuenta autenticada — un usuario nunca puede leer ni modificar el orden de otro. El CRUD administrativo conserva sus permisos.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/11af874f36473608c69cedec257834257f36c6f9/openspec/changes/archive/2026-06-10-add-hub-app-favorites/)
