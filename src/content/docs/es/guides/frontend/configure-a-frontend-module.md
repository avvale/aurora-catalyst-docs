---
title: Configurar un módulo frontend
description: "Receta de extremo a extremo para un módulo frontend generado — eliges shell de detalle, widgets, layout, modo embed y regeneras."
---

## Objetivo

Coger un módulo frontend recién scaffoldeado y configurarlo a través de su `*.aurora.yaml` para que la regeneración produzca el form, la list y el detail con el shell correcto, los widgets relacionales correctos, el layout correcto y el cableado de embed correcto — sin editar a mano el código generado.

## Antes de empezar

- Un módulo scaffoldeado bajo `cliter/<bounded-context>/<module>.aurora.yaml`.
- El CLI `catalyst` disponible localmente (`catalyst generate front module --force` funciona).
- Ficheros de traducción para el bounded context y el módulo — Aurora genera la estructura, nunca las cadenas.

## Pasos

1. **Elige el shell de detalle.** El campo opcional `front.detailMode` del YAML acepta `view` (por defecto) o `dialog`. Elige según el caso: formularios largos, deep-links y muchos tabs → `view`; lookups pequeños donde la edición inline gana → `dialog`. El modo view emite `*-detail.component.ts` más rutas `/new` y `/edit/:id`; el modo dialog omite el detail y embebe un `<hlm-dialog>` sobre la lista. Concepto: [Detail mode: view o dialog](../../../concepts/frontend/detail-mode/).

2. **(Solo modo dialog) Dimensiona el diálogo.** El campo opcional `front.dialogWidth` acepta `sm`, `md` (por defecto), `lg`, `xl` o `full`. Solo se lee cuando `front.detailMode: dialog` — déjalo sin declarar en modo view. Elige un token más ancho para un formulario con más campos que necesite espacio desde el principio; el `md` por defecto encaja en un formulario típico. Concepto: [Detail mode: view o dialog](../../../concepts/frontend/detail-mode/#ajustar-el-ancho-del-diálogo-con-frontdialogwidth).

3. **Configura los widgets relacionales.** Para cada FK o relación, declara `widget.type` según el tamaño del set de opciones y la UX que quieras:

   | `widget.type`                       | Para                                                                 |
   | ----------------------------------- | -------------------------------------------------------------------- |
   | `select`                            | many-to-one con hasta ~20 opciones                                   |
   | `multiple-select`                   | many-to-many con hasta ~20 opciones                                  |
   | `search-select`                     | many-to-one, 50–500 opciones, filter sync (precargado)               |
   | `multiple-search-select`            | many-to-many, 50–500 opciones, filter sync                           |
   | `async-search-select`               | many-to-one con 1000+ opciones, búsqueda paginada en servidor        |
   | `async-multiple-search-select`      | many-to-many con 1000+ opciones, búsqueda paginada en servidor       |
   | `grid-select-element`               | many-to-one renderizado como diálogo tabla                           |
   | `grid-select-multiple-elements`     | many-to-many renderizado como tabla multi-fila                       |
   | `grid-elements-manager`             | CRUD one-to-many embebido dentro del detail del padre                |

4. **Agrupa y tabula el form.** `widget.group` agrupa visualmente campos relacionados dentro del form (un wrapper por grupo, cada uno con su propia pasada de auto-expansión). `widget.tab` reparte los campos en paneles `<hlm-tabs-content>`. Ambos son contenedores independientes — la matemática del span no cruza entre ellos.

5. **Ajusta los anchos de los campos.** La tabla de defaults cubre la mayoría de los casos — `boolean` / `date` / `time` → 3, numéricos → 4, `varchar` por `maxLength` (≤30 → 4, 31–80 → 6, >80 → 12), `text` y relaciones grid → 12. Sobreescribe por property con `widget.span: 1–12` cuando el default no encaje. El último campo de una fila incompleta se auto-expande para rellenar el hueco. Concepto: [Ancho de campos en formulario](../../../concepts/frontend/form-field-widths/).

6. **(Opcional) Opta al módulo al modo embed.** Si este módulo es un HIJO que debe editarse dentro del detail de su padre, declara `front.embedSupport: true` a nivel raíz. El codegen emite entonces la lista polimórfica (`mode: 'standalone' | 'embed'`), el componente form-embed y la factory de columnas embed. El YAML del PADRE declara aparte `widget.type: grid-elements-manager` sobre la property que apunta aquí. Concepto: [Embed mode (padre-hijo)](../../../concepts/frontend/embed-mode/). Receta: [Implementar un widget grid-elements-manager](../implement-grid-elements-manager/).

7. **Personaliza campos más allá de lo que el YAML expresa.** La plantilla del form-component emite los marcadores `AURORA:FORM-FIELDS-START/END` alrededor del bloque de campos. Cualquier cosa que escribas dentro de esa región sobrevive a la regeneración byte por byte — validadores custom, reordenamientos manuales, markup libre, todo lo que el layout no exprese de forma declarativa. Concepto: [Regiones de preservación](../../../concepts/frontend/preservation-regions/).

8. **Regenera.**

   ```bash
   catalyst generate front module --name=<bounded-context>/<module> --force
   ```

   Para escenarios embed, regenera el **hijo primero** para que el regen del padre pueda leer el YAML del hijo con `embedSupport: true` ya puesto.

9. **Añade las keys de traducción.** Aurora publica `Aurora.NoResults` para los estados vacíos; el resto te toca. Las labels de campos, los headers de columnas de la lista, el título de la card del widget embed y las labels de las secciones del form vienen de tus ficheros transloco usando keys derivadas de los nombres del bounded context, del módulo y del agregado.

## Verifica que funcionó

- Ejecuta `pnpm dev`, navega a la lista del módulo y confirma: las filas muestran los campos locales más una columna por cada FK many-to-one (`<rel>.name`), search y filter cubren todas las columnas searchable incluidas las FK, y la paginación funciona.
- Abre el detail en modo `edit` y confirma que el layout del form, los widgets relacionales, los tabs y grupos, y cualquier sección de hijo embebido se comportan como declaraste.
- Abre el detail en modo `new` y confirma — para configuraciones embed — que el widget hijo embebido está oculto hasta que se guarda el padre.
- Para modo dialog, confirma que `/new` y `/edit/:id` NO son enrutables; crear y editar ocurren solo dentro del diálogo.

## Troubleshooting

**El regen falla con "target lacks `embedSupport: true`".**
El regen del padre lee el YAML del hijo durante la validación. Añade `front.embedSupport: true` al YAML del hijo y regenera el hijo primero, después relanza el padre.

**El widget embed nunca aparece.**
Comprueba el `front.detailMode` del padre. Si es `dialog`, el codegen registra un warning y omite el widget para evitar el apilado diálogo-en-diálogo. Cambia el padre a `view`.

**Un dropdown relacional aparece vacío al cargar la página.**
El route resolver precarga las listas de opciones en paralelo. Si tu list-config o detail-config custom recortó el fetch relacional, el form no tiene nada que renderizar. Confirma que `<rel>Options` está en `route.snapshot.data` para la relación afectada.

**Search no encuentra una columna FK.**
El codegen pone `searchable: true` por defecto en las columnas FK. Si un override manual dejó `searchable: false`, regenera el fichero de columnas (ahora es propiedad del codegen).

**Una región de preservación se descarta en el regen.**
La plantilla dejó de declarar esa región upstream. Rescata tu contenido del historial de git; no hay migración automática. Consulta [Regiones de preservación](../../../concepts/frontend/preservation-regions/).

**`widget.span` no afecta al layout en un `grid-elements-manager`.**
Es lo esperado — el widget es una sección, no un campo, y siempre renderiza a ancho completo. El codegen emite un warning cuando declaras `span` sobre él.

## Relacionado

- [Detail mode: view o dialog](../../../concepts/frontend/detail-mode/) — la decisión del shell.
- [Ancho de campos en formulario](../../../concepts/frontend/form-field-widths/) — el sistema del grid.
- [Embed mode (padre-hijo)](../../../concepts/frontend/embed-mode/) — el modelo padre-hijo.
- [Regiones de preservación](../../../concepts/frontend/preservation-regions/) — poseer una porción de código generado.
- [Implementar un widget grid-elements-manager](../implement-grid-elements-manager/) — receta enfocada al widget embed.
- [Referencia de `catalyst generate`](../../../reference/cli-commands/generate/) — cada flag y argumento.
