---
title: Paletas de theme
sidebar:
  order: 9
description: "Cómo el frontend resuelve la paleta de color activa mediante una cadena de tres capas, por qué claro/oscuro es un eje aparte y cómo la paleta se propaga a toda la UI — charts incluidos — sin flash."
---

## Por qué existe

Un frontend Aurora scaffoldeado necesita tres cosas de su theming que rara vez van juntas: un **default por despliegue** (para que el mismo código salga white-label a distintos tenants), un **override por usuario en runtime** (para que un desarrollador — o el usuario final, en builds no-prod — cambie de paleta sin recompilar) y **ningún flash de los colores equivocados** al cargar. Encima, el modo claro/oscuro tiene que moverse independientemente de la paleta.

El gestor de themes resuelve las cuatro cosas con una sola cadena de resolución y una única fuente de verdad (`ThemePaletteService`), así que nunca hay duda de "qué valor gana" — el orden es fijo y está validado.

## Dos ejes ortogonales

El theming se divide en dos ejes que nunca interfieren entre sí:

| Eje            | Qué controla                           | Dónde vive                         | Persistido como           |
| -------------- | -------------------------------------- | ---------------------------------- | ------------------------- |
| **Paleta**     | El theme de color (`theme-neutral`, …) | Una clase `theme-*` en `<body>`    | `localStorage["theme-palette"]` |
| **Apariencia** | Modo claro / oscuro / sistema          | La clase `.dark` en `<html>`       | `localStorage["theme"]`   |

Como son independientes, cada paleta trae **dos** bloques scoped — uno por apariencia — y al cambiar claro/oscuro se relee la misma paleta bajo un selector distinto.

## Cómo se resuelve la paleta activa

La paleta activa sale de una única cadena, de mayor a menor prioridad:

| Prioridad | Fuente                              | Alcance                | Cambiarla exige |
| --------- | ----------------------------------- | ---------------------- | --------------- |
| 1         | `localStorage["theme-palette"]`     | Por navegador, runtime | Que el usuario elija una |
| 2         | `environment.appearance.theme`      | Por build / despliegue | Recompilar (este es el mando del white-label) |
| 3         | `'theme-neutral'`                   | Fallback duro          | — (siempre presente) |

La misma cadena se ejecuta dos veces, en dos momentos distintos, por dos razones distintas:

```
 BUILD          environment.appearance.theme fija el default del despliegue;
   │            environment.appearance.palettes lista las paletas disponibles.
   │
 PRIMER PAINT   Un <script> inline (el PRIMER hijo de <body> en
   │            index.html) lee localStorage → default y añade la clase
   │            .theme-<name> a <body> ANTES del primer paint
   │            → sin flash de contenido sin estilo (FOUC). Valida solo
   │            la FORMA de la clase (^theme-[a-z0-9-]+$), nunca el
   │            registro — no puede importar el servicio tan pronto.
   │
 BOOTSTRAP      ThemePaletteService vuelve a resolver la misma cadena, esta
   │            vez validando contra environment.appearance.palettes, corrige
   │            un valor obsoleto o desconocido y expone la signal palette() como
   │            única fuente de verdad post-bootstrap.
   │
 RUNTIME        service.set(id) swapea la clase .theme-* en <body>, carga la
   │            fuente de la paleta si declara una, persiste y actualiza la signal.
   │
 PROPAGACIÓN    Los tokens --* cascadean desde <body> a toda la UI.
                Spartan mapea --color-* encima, así que cada componente
                se re-tematiza solo por cascada — sin re-render.
```

El script inline existe únicamente para ganarle la carrera al primer paint; es deliberadamente tonto (solo chequea la forma). `ThemePaletteService` es la autoridad en la que confía todo lo demás una vez la app está corriendo. Vive en la **capa framework**, en `frontend/src/@aurora/modules/theme/theme-palette.service.ts`, y se consume a través del barrel (`import { ThemePaletteService } from '@aurora'`); está declarado con el `@Service()` de Angular 22 (el alias de `@Injectable({ providedIn: 'root' })`). Expone tres miembros: la signal `palette()` (id activo), la lista `palettes` (leída directamente de `environment.appearance.palettes`) y `set(id)`.

## Cómo está estructurada una paleta

Cada paleta son dos bloques CSS autocontenidos, scoped por la clase de `<body>` y la apariencia:

```css
:root .theme-amber-minimal {
  color-scheme: light;
  --background: oklch(…);
  --primary: oklch(…);
  --font-sans: Inter, sans-serif;
  --chart-1: oklch(…);
  /* …todos los tokens de diseño… */
}

:root.dark .theme-amber-minimal {
  color-scheme: dark;
  /* …las variantes oscuras de los mismos tokens… */
}
```

Los tokens son el único contrato. Los componentes nunca nombran colores directamente — leen tokens `--*` — así que un cambio de paleta o de claro/oscuro recolorea todo gratis. Los datos categóricos usan `--chart-1..5`; los estados semánticos usan tokens como `--destructive`. Una paleta puede llevar además un `fontHref` en su entrada del registro (ver más abajo).

## Cómo las fuentes siguen al theme

Un token es solo la mitad de la historia: declarar `--font-sans` en una paleta no hace nada hasta que algo lo *aplica*. Los colores ya se aplicaban vía las utilidades de Tailwind de Spartan; la tipografía no — hasta un binding explícito en `styles.css`:

```css
body {
  /* la clase theme-* vive en <body>, así que --font-sans se resuelve desde la paleta activa */
  font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
}
```

Como el binding lee `--font-sans` de `<body>` — donde vive la clase de la paleta — cambiar de paleta también cambia la tipografía, con un fallback de sistema seguro cuando una paleta omite el token.

Cargar el *fichero* de fuente es algo aparte y bajo demanda. Una paleta puede llevar un `fontHref` (una URL de Google Fonts) en su entrada del registro (`environment.appearance.palettes`); cuando esa paleta se activa, `ThemePaletteService` inyecta un único `<link rel="stylesheet" data-theme-font="<id>">` en `<head>` — una sola vez (idempotente) y solo para la paleta activa, así que ningún build carga una fuente que no usa. Las paletas que se apoyan en un stack de sistema no llevan `fontHref` y no cargan nada.

**Caso límite:** la página de login no instancia `ThemePaletteService`, así que la web font de una paleta no se carga ahí — aunque el script anti-FOUC sí aplica la clase de la paleta.

## Cómo se mantienen sincronizados los charts

La cascada CSS pura cubre todos los componentes salvo los charts renderizados en canvas, que pintan a un bitmap y no pueden heredar un cambio de clase. El wrapper de chart del catálogo (`<aurora-chart>`, `@aurora/components/chart`) cierra ese hueco con un `MutationObserver` sobre el atributo `class` de `<html>` y `<body>`: cualquier cambio de paleta **o** de claro/oscuro dispara un `reinit()` debounced, que relee `--chart-1..5` y re-renderiza.

También convierte `oklch → rgb` internamente, porque echarts/zrender no sabe manipular `oklch` al derivar los colores de hover y énfasis. Nada de esto te incumbe cuando usas `<aurora-chart>` — es la razón por la que los charts "simplemente funcionan" entre paletas.

## Relacionado

- [Gestionar themes](../../../guides/frontend/manage-theme-palettes/) — usar el selector, añadir una paleta nueva, ocultarla en producción.
- [tweakcn.com](https://tweakcn.com) — el editor visual donde se diseñan las paletas.
