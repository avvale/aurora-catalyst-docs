---
title: "Provisión OAuth al registrar"
description: "Registrar una app del HUB ahora provisiona atómicamente su identidad OAuth y te entrega un paquete de credenciales .env de un solo uso con el secret generado."
date: 2026-06-10
version: "Unreleased"
classification: feature
source_commit: "7426f19dbc88c4ab65b416427a951210a43f5f85"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/7426f19dbc88c4ab65b416427a951210a43f5f85/openspec/changes/archive/2026-06-10-add-hub-oauth-provisioning/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Registrar una `HubApp` ahora provisiona su identidad OAuth — aplicación, cliente authorization-code y su vínculo — en una única transacción todo-o-nada; cualquier fallo revierte el registro completo.
- El formulario de alta exige una `redirectUri` (URL `http(s)` absoluta), y tras el registro un diálogo de un solo uso muestra el bloque `.env` que necesita el satélite — issuer URL, código de aplicación, secret generado y redirect URI — con botón de copia. El secret nunca vuelve a ser recuperable.
- Cada `HubApp` lleva un `applicationId` único que enlaza su aplicación OAuth provisionada, sin foreign key física entre los dos bounded contexts.

## Por qué importa

Hasta ahora una app registrada era pura metadata: no tenía identidad OAuth y no podía participar en el flujo de SSO. Ahora basta con registrarla para que sea capaz de SSO — el alta del HUB es el dueño único de la provisión OAuth de satélites, así que el catálogo y los clientes OAuth reales nunca pueden divergir. El cliente nace sin scopes; los configuras después en el módulo `o-auth`.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/7426f19dbc88c4ab65b416427a951210a43f5f85/openspec/changes/archive/2026-06-10-add-hub-oauth-provisioning/)
