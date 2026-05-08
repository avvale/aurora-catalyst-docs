---
title: "Aggregator de iconos por BC"
description: "El codegen ahora emite un `<bc>-icons.providers.ts` y sincroniza `nav-main.ts`, eliminando la deriva silenciosa de iconos sin registrar."
date: 2026-05-08
version: "Unreleased"
classification: feature
source_commit: "5b4b6cb56ea9cfbf4e7979017ad6c6f95bc647c0"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/5b4b6cb56ea9cfbf4e7979017ad6c6f95bc647c0/openspec/changes/archive/2026-05-08-emit-bc-icons-aggregator/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Nuevo fichero emitido por bounded context: `<bc>-icons.providers.ts`, exporta `<bcCamel>Icons` — el set deduplicado y ordenado alfabéticamente de iconos `lucide*` declarados en `<bc>.navigation.ts`. Marcado `@aurora-catalyst-generated`, sobrescrito por completo en cada regen.
- Nuevo bootstrap idempotente que modifica `nav-main.ts` exactamente una vez por BC: añade un `import { <bcCamel>Icons }` y un spread `...<bcCamel>Icons` dentro de `provideIcons({...})`. Los imports y los iconos chrome del framework existentes no se tocan.
- La plantilla scaffold `nav-main.ts` se actualiza para declarar solo iconos framework inline (`lucideSquareTerminal`, `lucideChevronRight`, …); los iconos BC-específicos viven en el aggregator.

## Por qué importa

Añadir un NavItem con un icono nuevo requería antes una edición manual de `nav-main.ts` para registrar el icono en `provideIcons`. Olvidar la edición producía un `<ng-icon>` vacío en el sidebar — bug visual silencioso, sin error en runtime. Con el aggregator dueño del registro, cada regen de módulo frontend mantiene el sidebar en sync; los consumidores solo editan `nav-main.ts` para chrome framework. Cuando `provideIcons` recibe un argumento no canónico (p.ej. una variable custom), el bootstrap loguea `[NAV-MAIN BOOTSTRAP SKIPPED]` y emite el aggregator igualmente, así que el wire-up manual sigue siendo posible.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/5b4b6cb56ea9cfbf4e7979017ad6c6f95bc647c0/openspec/changes/archive/2026-05-08-emit-bc-icons-aggregator/)
