---
title: Gestionar themes
description: "Usar el selector de paletas del header, añadir una paleta nueva desde un export de tweakcn y mantener el selector oculto en los builds de producción."
---

## Objetivo

Trabajar con el **gestor de themes** de un frontend Aurora scaffoldeado: cambiar la paleta de color activa desde el header, añadir una paleta nueva desde un export de [tweakcn.com](https://tweakcn.com) y entender por qué el selector desaparece en un build de producción.

Para el *porqué* de fondo — la cadena de resolución de tres capas, el flujo anti-**FOUC** y cómo las paletas se propagan a toda la UI incluyendo los charts — mira el concepto [Paletas de theme](../../../concepts/frontend/theme-palettes/). FOUC (*Flash Of Unstyled —o Incorrect— Content*) es ese parpadeo en el que, al cargar la página, ves por un instante el aspecto "equivocado" antes de que se aplique el estilo correcto.

Dos términos que se usan a lo largo de esta guía:

- **Paleta** — el theme de color (`theme-neutral`, `theme-amber-minimal`, …), gestionado por el servicio de framework `ThemePaletteService` (importado desde `@aurora`). Es el "theme" que añades y cambias.
- **Apariencia** — el modo ortogonal claro / oscuro / sistema. Un selector aparte; cambiar uno nunca toca el otro.

La paleta activa se resuelve `localStorage["theme-palette"]` → `environment.appearance.theme` → `'theme-neutral'` (gana la primera coincidencia).

## Cambiar de paleta desde el header

El selector de paletas vive en el header (`frontend/src/app/domains/admin/layout/site-header.ts`) tras el icono de paleta (swatch book). Itera `service.palettes` (la lista de `environment.appearance.palettes`), marca con un check la activa y, al hacer clic, llama a `ThemePaletteService.set(id)` — que swapea la clase, persiste la elección y actualiza la signal. Es totalmente independiente del selector claro/oscuro que tiene al lado.

## Añadir una paleta nueva

Cuatro pasos llevan una paleta desde la herramienta de diseño hasta el selector.

1. **Diseña y exporta la paleta** en [tweakcn.com](https://tweakcn.com) y guarda el CSS crudo en un fichero (p. ej. `ocean-export.css`).

2. **Adapta el export** a la convención del proyecto con el importador, ejecutándolo **desde la raíz del proyecto** (donde viven los scripts de `pnpm`), y añádelo a la hoja de estilos:

   ```bash
   # imprime el bloque adaptado por stdout para revisarlo primero
   pnpm theme:adapt ./ocean-export.css theme-ocean

   # o añádelo directamente a frontend/src/styles.css
   pnpm theme:adapt ./ocean-export.css theme-ocean --append
   ```

   El importador emite dos bloques scoped autocontenidos. Revisa lo que aterrizó en `frontend/src/styles.css`:

   ```css
   :root .theme-ocean {
     color-scheme: light;

     --background: oklch(0.98 0 0);
     --primary: oklch(0.55 0.13 240);
     /* …cada token del :root del export… */
     --chart-1: oklch(0.7 0.13 240);
     --chart-2: oklch(0.62 0.15 250);
     /* …--chart-3..5… */
   }

   :root.dark .theme-ocean {
     color-scheme: dark;
     /* …cada token del bloque .dark del export… */
   }
   ```

3. **Registra la paleta** en `environment.appearance.palettes` — la lista de paletas disponibles, declarada por environment en `frontend/src/environments/environment*.ts`. Añade la entrada a cada environment que deba ofrecerla. El `id` debe coincidir con el nombre de la clase scoped; el `label` es lo que muestra el selector:

   ```ts
   // frontend/src/environments/environment.ts  (repite en los envs que deban ofrecerla)
   appearance: {
     theme: 'theme-neutral',     // default del build (debe ser una de las paletas de abajo)
     layout: '',
     themeSelector: true,        // muestra el selector del header en este build
     palettes: [
       { id: 'theme-neutral', label: 'Neutral' },
       { id: 'theme-amber-minimal', label: 'Amber' },
       { id: 'theme-ocean', label: 'Ocean' }, // ← tu paleta nueva
     ],
   },
   ```

4. **Carga la web font, si la hay.** Si la paleta declara una web font (p. ej. Inter para `theme-amber-minimal`), añade su `<link>` en `frontend/src/index.html`. `theme-neutral` usa stacks de fuentes del sistema y no carga nada.

La paleta ya aparece en el selector del header en cualquier build con `themeSelector: true`.

### Qué hace el importador con el export

`pnpm theme:adapt` está implementado por la función pura `adaptTweakcnExport(css, name)` en `scripts/theme/adapt-tweakcn.ts` (cubierta por `pnpm test:theme`). Toma un export crudo de tweakcn — con `:root {}`, `.dark {}`, `@import`, `@theme inline` y similares — y:

- Emite `:root .theme-<name>` a partir del bloque `:root` del export y `:root.dark .theme-<name>` a partir de su bloque `.dark`.
- **Descarta** `@import`, `@custom-variant`, `@layer base` y `@theme inline` — eso lo aporta global el preset de Spartan, así que una copia por paleta sería redundante o conflictiva.
- Inyecta el `color-scheme: light | dark` correspondiente en cada bloque.
- **Avisa** si el export no traía bloque `.dark` (solo se emite el bloque claro).

## Ocultar el selector en producción

El selector está gateado por un flag de build-time, `environment.appearance.themeSelector: boolean`. El header renderiza el botón dentro de `@if (showPaletteSelector)`, donde `showPaletteSelector = environment.appearance?.themeSelector ?? false`.

| Fichero de environment            | `themeSelector` |
| --------------------------------- | --------------- |
| `environment.ts` (base)           | `true`          |
| `environment.dev.ts`              | `true`          |
| `environment.local.ts`            | `true`          |
| `environment.qa.ts`               | `true`          |
| `environment.prod.ts`             | `false`         |

Un build de producción, por tanto, sale **sin** el selector; los builds dev / local / qa lo muestran. Ocultar el botón **no** cambia la paleta activa — `environment.appearance.theme` más `localStorage` siguen decidiendo qué renderiza la app.

## Notas para desarrolladores

- **El color es siempre un token del theme, nunca hardcodeado.** Series categóricas → `--chart-1..5`; estados semánticos (éxito / error) → tokens semánticos como `--destructive`. Un hex hardcodeado no sigue los cambios de paleta ni de claro/oscuro.
- **Los charts del catálogo se tematizan solos.** `<aurora-chart>` (`@aurora/components/chart`) ya lee `--chart-*` y re-renderiza ante cualquier cambio de paleta o de claro/oscuro — no tienes que hacer nada especial. Mira [Paletas de theme › Cómo se mantienen sincronizados los charts](../../../concepts/frontend/theme-palettes/#cómo-se-mantienen-sincronizados-los-charts) para el mecanismo.
- **Anticipado, aún no implementado:** theming por tenant en runtime — llamar a `service.set(tenantTheme)` desde el hook `provideAuthenticatedInitializer` al establecerse la sesión. Construye la cadena asumiendo que esto puede llegar; hoy no hay que cambiar nada en ella.

## Relacionado

- [Paletas de theme](../../../concepts/frontend/theme-palettes/) — el concepto: modelo de resolución, flujo anti-FOUC, propagación.
- [tweakcn.com](https://tweakcn.com) — el editor visual de themes que consume el importador.
