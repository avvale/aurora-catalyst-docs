---
title: Gestionar themes
description: "Usar el selector de paletas del header, añadir una paleta nueva desde un export de tweakcn en un comando y mantener el selector oculto en los builds de producción."
---

## Objetivo

Trabajar con el **gestor de themes** de un frontend Aurora scaffoldeado: cambiar la paleta de color activa desde el header, añadir una paleta nueva desde un export de [tweakcn.com](https://tweakcn.com) en **un solo comando** (CSS, registro y cableado de la fuente incluidos), y entender por qué el selector desaparece en un build de producción.

Para el *porqué* de fondo — la cadena de resolución de tres capas, el flujo anti-**FOUC** y cómo las paletas se propagan a toda la UI incluyendo fuentes y charts — mira el concepto [Paletas de theme](../../../concepts/frontend/theme-palettes/). FOUC (*Flash Of Unstyled —o Incorrect— Content*) es ese parpadeo en el que, al cargar la página, ves por un instante el aspecto "equivocado" antes de que se aplique el estilo correcto.

Dos términos que se usan a lo largo de esta guía:

- **Paleta** — el theme de color (`theme-neutral`, `theme-amber-minimal`, …), gestionado por el servicio de framework `ThemePaletteService` (importado desde `@aurora`). Es el "theme" que añades y cambias.
- **Apariencia** — el modo ortogonal claro / oscuro / sistema. Un selector aparte; cambiar uno nunca toca el otro.

La paleta activa se resuelve `localStorage["theme-palette"]` → `environment.appearance.theme` → `'theme-neutral'` (gana la primera coincidencia).

## Cambiar de paleta desde el header

El selector de paletas vive en el header (`frontend/src/app/domains/admin/layout/site-header.ts`) tras el icono de paleta (swatch book). Itera `service.palettes` (la lista de `environment.appearance.palettes`), marca con un check la activa y, al hacer clic, llama a `ThemePaletteService.set(id)` — que swapea la clase, carga la fuente de la paleta si hace falta, persiste la elección y actualiza la signal. Es totalmente independiente del selector claro/oscuro que tiene al lado.

## Añadir una paleta nueva

Dar de alta una paleta es **un comando**. Escribe el CSS, registra la paleta en todos los environments y cablea su web font — sin editar a mano el servicio ni los ficheros de environment.

1. **Diseña y exporta** la paleta en [tweakcn.com](https://tweakcn.com) y guarda el CSS crudo en `themes/` (p. ej. `themes/theme-ocean.css`).

2. **Ejecuta el importador desde la raíz del proyecto** (donde viven los scripts de `pnpm` y la carpeta `themes/`) con `--append`:

   ```bash
   pnpm theme:adapt themes/theme-ocean.css theme-ocean --name "Ocean" --append
   ```

   Ese único comando:

   - **appendea** los dos bloques CSS scoped (`:root .theme-ocean` y `:root.dark .theme-ocean`) a `frontend/src/styles.css`;
   - **registra** `{ id, label, fontHref? }` en los cinco ficheros `environment*.ts` — idempotente, así que reejecutarlo nunca duplica un id existente;
   - **detecta la web font** del export (`--font-sans` / `--font-serif` / `--font-mono`, ignorando stacks de sistema) y guarda la URL de Google Fonts como `fontHref`.

   `--name` es opcional; sin él, el label se deriva del id (`theme-amber-minimal` → "Amber Minimal"). Quita `--append` para imprimir el CSS adaptado por stdout sin tocar ningún fichero.

   La entrada de registro resultante (en cada env) queda así:

   ```ts
   // frontend/src/environments/environment.ts  (y los otros cuatro envs)
   appearance: {
     theme: 'theme-neutral',     // default del build (debe ser una de las paletas de abajo)
     layout: '',
     themeSelector: true,        // muestra el selector del header en este build
     palettes: [
       { id: 'theme-neutral', label: 'Neutral' },
       {
         id: 'theme-ocean',
         label: 'Ocean',
         fontHref: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
       },
     ],
   },
   ```

3. **Recarga la app.** La paleta aparece en el selector del header (en builds con `themeSelector: true`), y su fuente se carga sola si la declaró.

Eso es todo el flujo: CSS + registro en los cinco envs + detección de fuente, en un comando.

### Qué hace el importador con el export

`pnpm theme:adapt` está implementado en `scripts/theme/adapt-tweakcn.ts` por funciones puras — `adaptTweakcnExport`, `detectFontHref`, `registerPaletteInEnvSource`, `deriveLabelFromId` (tests: `pnpm test:theme`). Firma:

```bash
pnpm theme:adapt <export.css> <theme-id> [-n|--name "Etiqueta"] [--append]
```

Dado un export crudo de tweakcn (`:root {}`, `.dark {}`, `@import`, `@theme inline`, …):

- Emite `:root .theme-<id>` a partir del bloque `:root` del export y `:root.dark .theme-<id>` a partir de su bloque `.dark`, inyectando el `color-scheme` correspondiente.
- **Descarta** `@import`, `@custom-variant`, `@layer base` y `@theme inline` — eso lo aporta global el preset de Spartan, así que una copia por paleta sería redundante o conflictiva.
- **Detecta la web font** (primera familia de cada `--font-*`, filtrando stacks de sistema) y construye el `fontHref`.
- **Avisa** si el export no traía bloque `.dark` (solo se emite el bloque claro).

Con `--append` escribe el CSS en `frontend/src/styles.css` y registra la paleta en los cinco envs; sin él, solo imprime el CSS por stdout.

## Las fuentes siguen al theme

Normalmente no tocas las fuentes a mano — el importador las detecta y el framework las carga. Dos piezas lo hacen posible, ambas detalladas en el concepto:

- **Aplicada:** `frontend/src/styles.css` enlaza `font-family: var(--font-sans, …)` en `<body>`, así que la tipografía sigue al token de la paleta activa.
- **Cargada:** cuando una paleta declara `fontHref`, `ThemePaletteService` inyecta su `<link rel="stylesheet">` en `<head>` bajo demanda — una sola vez y solo para la paleta activa. Las paletas con stack de sistema no llevan `fontHref` y no cargan nada.

Mira [Paletas de theme › Cómo las fuentes siguen al theme](../../../concepts/frontend/theme-palettes/#cómo-las-fuentes-siguen-al-theme) para el mecanismo y el caso límite de la página de login.

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

- [Paletas de theme](../../../concepts/frontend/theme-palettes/) — el concepto: modelo de resolución, flujo anti-FOUC, fuentes, propagación.
- [tweakcn.com](https://tweakcn.com) — el editor visual de themes que consume el importador.
