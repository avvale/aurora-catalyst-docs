---
title: "Navegación filtrada por permisos"
description: "Los ítems del sidebar y las rutas pueden exigir un permiso: el menú oculta lo que la sesión no puede usar y un permissionGuard reutilizable bloquea rutas inalcanzables."
date: 2026-06-11
version: "Unreleased"
classification: feature
source_commit: "276f3ac4073926a3c5e50e65ca316f5ae5d772ee"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/276f3ac4073926a3c5e50e65ca316f5ae5d772ee/openspec/changes/archive/2026-06-11-add-permission-gated-navigation/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Los ítems de navegación aceptan un `permission` opcional; el sidebar muestra solo las entradas que la sesión posee, oculta los grupos sin hijos visibles y espera a que carguen los permisos para que no parpadee nada prohibido. Los ítems sin etiquetar siguen siempre visibles.
- Añade una factoría reutilizable `permissionGuard(permission)` en `@aurora`, junto a `authenticationGuard`, que espera la carga asíncrona de permisos y redirige a la ruta de inicio cuando se deniega.
- El puerto `CurrentAccountService` expone ahora `permissions`, `hasPermission()` y la señal de disponibilidad `permissionsLoaded`, alimentadas desde `dPermissions.all` por el adaptador de IAM; la navegación y las rutas del HUB son el primer consumidor.

## Por qué importa

El backend ya aplicaba permisos en cada endpoint, pero el frontend pintaba todo el menú y dejaba navegar a pantallas que solo fallaban con un 403 al llegar. Ahora el menú y las rutas reflejan lo que el servidor permitiría. Es una capa de UX y defensa en profundidad, no una frontera de seguridad — la aplicación en el servidor sigue siendo la fuente de verdad. Etiquetar la navegación de iam y o-auth es un follow-up explícito.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/276f3ac4073926a3c5e50e65ca316f5ae5d772ee/openspec/changes/archive/2026-06-11-add-permission-gated-navigation/)
