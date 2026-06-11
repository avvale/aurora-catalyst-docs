---
title: "Registro de apps y dashboard HUB"
description: "Nuevo bounded context hub: registra aplicaciones satélite y ábrelas desde un dashboard tipo app launcher con icono, color y enlace por tarjeta."
date: 2026-06-10
version: "Unreleased"
classification: feature
source_commit: "18d529e6ef97474bfb5b63f8c3db3eac8017ac6d"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/18d529e6ef97474bfb5b63f8c3db3eac8017ac6d/openspec/changes/archive/2026-06-10-add-hub-app-dashboard/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Añade el módulo de registro `hub/app`: alta, consulta (paginación, listado, búsqueda por id) y baja lógica de aplicaciones satélite con su metadata — `code`, `name`, `url`, `icon`, `color`, `sort`, `isActive`, `description`.
- Añade el dashboard del HUB, un app launcher que muestra una tarjeta por app activa en una rejilla responsive; activar una tarjeta navega a la `url` de la app, con estados de carga y vacío explícitos.
- Integra el HUB en la barra lateral de administración con su propio icono e incluye sus textos en español e inglés.

## Por qué importa

El ecosistema Aurora gira en torno a aplicaciones satélite que delegan su autenticación en la plataforma central, pero no había dónde registrarlas ni desde dónde saltar a ellas. Ahora puedes mantener un catálogo central de apps satélite y dar a cada usuario autenticado un punto de aterrizaje único para verlas y abrirlas. Este es el hito fundacional del bounded context `hub` — la provisión OAuth y los favoritos por usuario se construyen encima.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/18d529e6ef97474bfb5b63f8c3db3eac8017ac6d/openspec/changes/archive/2026-06-10-add-hub-app-dashboard/)
