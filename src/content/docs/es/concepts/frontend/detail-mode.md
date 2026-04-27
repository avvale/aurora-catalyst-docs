---
title: "Detail mode: view o dialog"
description: Cómo `front.detailMode` elige entre página de detalle enrutada y CRUD modal sobre la lista, y por qué ambos shells embeben el mismo componente de form.
---

## Por qué existe

Algunos agregados merecen una página dedicada — formularios largos, muchos tabs, muchas relaciones que digerir. Otros son lo suficientemente pequeños como para que abrir una ruta aparte solo para editar una fila sea fricción: clicas "Editar", la lista desaparece, guardas, navegas de vuelta. Para esos, un modal que flota sobre la lista es más rápido.

Aurora horneaba antes "página de detalle enrutada" dentro del codegen. Si querías un CRUD basado en diálogo, editabas a mano los componentes de detalle y de lista generados — y perdías esas ediciones la siguiente vez que regenerabas. La otra mitad del problema: incluso cuando la página enrutada era la decisión correcta, el cuerpo del form vivía inline dentro de `*-detail.component.ts`, así que no se podía embeber en ningún otro sitio (un paso de wizard, un editor hijo, un shell custom).

`front.detailMode` separa las dos preguntas. El form es siempre un componente standalone. El shell que lo envuelve — página enrutada o modal — es una decisión del YAML.

## Cómo funciona

Dos piezas.

### El form siempre es su propio componente

Independientemente del modo, el generador emite un `*-form.component.ts` con un contrato de "componente tonto":

| Superficie          | Tipo                          | Notas                                                                                                  |
| ------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| `[initial]`         | `T \| null`                   | `null` significa "nuevo registro"; un objeto significa "editar".                                       |
| `[mode]`            | `'new' \| 'edit'` (requerido) | Input requerido. Un shell que se olvida de pasarlo es un error de TypeScript, no un default silencioso. |
| `(save)`            | `T`                           | Se emite cuando el shell llama a `submit()` y el FormGroup es válido.                                  |
| `(cancel)`          | `void`                        | Se emite cuando el usuario clica Cancelar.                                                             |
| `submit()` (método) | `void`                        | Método público que invoca el botón Guardar del shell. Valida y emite `(save)` o marca campos touched.   |

El form NO posee data fetching (sin Apollo, sin `useGraphqlDetail`) y NO posee chrome — sin header, sin botones de acción, sin `<section hlmCard>`, sin `<hlm-dialog-content>`. Layout, validadores y markup de campos viven dentro del form; todo lo que lo rodea es responsabilidad del shell.

### El shell se elige por `front.detailMode`

El campo del YAML acepta dos valores, y el generador emite una matriz de ficheros distinta por valor:

| `detailMode`         | Ficheros emitidos                                                                                              | Rutas (forma objetivo)                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `view` (por defecto) | `*-form.component.ts` + `*-detail.component.ts` (shell ligero que embebe el form)                              | `''` → lista, `new` → form en modo `new`, `edit/:id` → form en modo `edit`     |
| `dialog`             | `*-form.component.ts` + `*-list.component.ts` extendido con `<hlm-dialog>` envolviendo el form. Sin detail.    | `''` → lista. Sin `/new`, sin `/edit/:id`.                                      |

En modo **view**, al clicar Crear en la lista navega a `/new`; al clicar Editar en una fila navega a `/edit/:id`. El detail shell delega el renderizado de campos a `<au-module-form>` y el acceso a datos a `useAggregateShell` — no posee FormGroup propio, ni validadores, ni markup de campos.

En modo **dialog**, la lista embebe un `<hlm-dialog>` cuyo `[state]` está enlazado a un signal. Al clicar Crear se abre el diálogo con `mode = 'new'` e `initial = null`. Al clicar Editar en una fila, primero se llama a `shell.fetchForEdit(row.id)` para hidratar el agregado completo (incluyendo los includes relacionales que la query de la lista no cargó), luego se abre el diálogo con `mode = 'edit'` e `initial` ya hidratado. Cancelar y un guardado correcto cierran el diálogo.

### `useAggregateShell<T>` es la costura compartida de data access

Los dos shells llaman al mismo composable hand-authored desde `aurora-catalyst/frontend/src/@aurora/lib/use-aggregate-shell.ts`:

- `fetchForEdit(id)` — fetch estandarizado que incluye cada relación configurada en `detailConfig`.
- `save(value, mode)` — despacha `create` cuando `mode === 'new'`, `update` cuando `mode === 'edit'`.
- `loading: Signal<boolean>` — refleja cualquier fetch o mutación en vuelo.
- `error: Signal<Error | null>` — último error de save/fetch, limpiado en el siguiente éxito.

El código generado no se ramifica según `detailMode` al llamarlo — solo el chrome alrededor del form es distinto.

## Cuándo aplica

- Scaffoldeas un módulo nuevo sin setear `front.detailMode` — obtienes el flujo enrutado de modo view con `/new` y `/edit/:id`.
- Declaras `front.detailMode: dialog` en una tabla de lookup pequeña (tags, permisos, referencias simples) — la lista crece un botón Crear que abre un `<hlm-dialog>` y las acciones de edición abren el mismo diálogo con la fila hidratada.
- Cambias un módulo de un modo al otro — regenera. Pasar a dialog deja de emitir `*-detail.component.ts` y recorta el fichero de rutas (el recorte de rutas es un follow-up; el cambio que introdujo `detailMode` deja deliberadamente intacto el codewriter de rutas). Volver a view vuelve a emitir el detail shell.
- Necesitas embeber el form en un sitio nuevo (un paso de wizard, el próximo `grid-elements-manager`) — no peleas con el codegen; el form ya es un componente standalone que puedes montar donde quieras siempre que pases `[mode]`.

## Trade-offs y límites

- **La región de preservación para cuerpos de campo personalizados vive en el fichero del form.** `AURORA:FORM-FIELDS-START/END` está alojada en `*-form.component.ts`. Si personalizaste esa región cuando vivía dentro de `*-detail.component.ts`, copia tu cuerpo al nuevo fichero del form antes de regenerar — no hay migración automática, y el CLI emite `[REGION DROPPED]` para la ubicación abandonada.
- **El modo dialog se salta el routing de create y edit.** Sin `/new`, sin `/edit/:id`. No es posible deep-linkar a "editar la fila 42" sin que tú lo cablees a mano. Si te importan las URLs compartibles a un estado de edición concreto, quédate en `view`.
- **Los dos modos comparten el mismo layout del form.** El grid de 12 columnas y el sistema `widget.span` se renderizan idénticos independientemente del shell — el `max-width` CSS del diálogo controla el ancho del modal, no la plantilla. Un form ancho simplemente scrolea dentro del diálogo.
- **`mode` es requerido por diseño.** El `mode = input.required()` del form convierte un parámetro ausente en error de TypeScript. Si embebes el form en un shell custom, pasa `'new'` o `'edit'` explícitamente. El form trata `[initial]="row" [mode]="'new'"` como un clon (un registro nuevo prerellenado con los valores de otra fila) — útil, pero explícito.
- **Las rutas siguen al modo, pero el emisor de rutas todavía va por detrás.** El cambio que introdujo `detailMode` define la forma objetivo (view → tres rutas, dialog → una) pero deja el generador de rutas existente intacto; un follow-up cablea el codewriter. Hasta que aterrice ese follow-up, cambiar de modo deja el fichero de rutas sin tocar — puedes acabar con una ruta `/new` inalcanzable en modo dialog, o sin ella en modo view. Regenera cuando aterrice el follow-up para alinear.

## Relacionado

- [Anchura de los campos del formulario](../form-field-widths/) — el sistema de grid y span del form-body aplica en ambos shells.
- [Regiones de preservación](../preservation-regions/) — la región `AURORA:FORM-FIELDS` vive dentro de `*-form.component.ts`.
- [Detail mode: view o dialog](../../../changes/cli/2026-04-25-spec-08-form-extraction-detail-mode/) — el cambio que introdujo el split.
