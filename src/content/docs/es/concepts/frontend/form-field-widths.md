---
title: "Ancho de campos en formulario"
description: Cómo el grid de 12 columnas, los defaults por tipo, el override `widget.span` y la pasada de auto-expansión deciden la anchura de cada campo.
---

## Por qué existe

Los formularios se renderizaban antes con tres tiers de grid (`compact` / `medium` / `full`) elegidos según el número de campos, con keywords de span cuyo significado cambiaba según el tier y un `maxLength` que hacía doble función como proxy de proporción visual. Un único campo `varchar(64)` podía renderizarse al 50% de ancho dentro de un diálogo. Aparecían huecos cuando los campos de una fila no sumaban un total limpio del grid. El layout saltaba de 2 columnas a 6 al añadir el sexto campo. Y no había válvula de escape — todo vivía en un `switch` cableado a mano.

El modelo nuevo es uniforme y predecible: un único grid de 12 columnas para cada form, grupo y tab; un span por defecto elegido según el tipo de la property; y un override en el YAML para los casos que el default no puede prever.

## Cómo funciona

Tres capas.

### 1. Un único grid

Cada form, cada `widget.group` y cada panel `<hlm-tabs-content>` se renderiza con la misma clase wrapper:

```html
<div class="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-5">…</div>
```

En móvil apila vertical (`grid-cols-1`); desde el breakpoint `md` hacia arriba todo es un grid de 12 columnas. No hay alternativa por tier — una sola configuración en todo el codegen.

### 2. Span por defecto según el tipo

Cuando una property no declara `widget.span`, el generador elige el span de esta tabla:

| Forma de la property                                                                                                           | Span por defecto |
| ------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| `boolean` / `date` / `time` / `enum` (≤ 5 opciones)                                                                            | 3                |
| `enum` (> 5 opciones) / `int` / `smallint` / `bigint` / `decimal` / `float` / `id` con widget `select` o `multiple-select`     | 4                |
| `id` con widget `async-search-select` / `password`                                                                             | 6                |
| `varchar` con `maxLength` ≤ 30                                                                                                 | 4                |
| `varchar` con `maxLength` 31–80                                                                                                | 6                |
| `varchar` con `maxLength` > 80 o sin declarar / `text` / `grid-select-element` / `grid-select-multiple-elements`               | 12               |

`maxLength` solo alimenta la fila de `varchar` — ya no se reutiliza como proxy de UI para numéricos ni para nada más. El wrapper de cada campo lleva `col-span-12 md:col-span-<N>` para que el apilado en móvil se cumpla independientemente del span de escritorio.

### 3. Override y auto-expansión

Dos válvulas de escape cubren el hueco entre el default y el layout que quieres.

**`widget.span` (1–12)** sobreescribe el default por property. Los valores fuera de rango (0, 13…) fallan la validación del JSON schema antes de que arranque la generación.

```yaml
properties:
  - name: notes
    type: text
    widget:
      span: 8       # media fila en lugar de fila completa
```

**Auto-expansión del último campo en una fila incompleta.** Un algoritmo de una sola pasada recorre los campos visibles por contenedor, registrando cuántas columnas lleva ya la fila actual. Si el siguiente campo desbordaría 12, la fila actual se cierra. Si el **último** campo del contenedor deja un hueco (su fila acumulada queda por debajo de 12), su span se sobreescribe para rellenar las columnas restantes. La pasada corre una vez por contenedor — el form completo, cada `widget.group`, cada tab — así que los spans no se mezclan entre grupos ni entre tabs.

Eso produce los layouts que dibujarías a mano:

| Spans resueltos | Filas renderizadas                                                       |
| --------------- | ------------------------------------------------------------------------ |
| `[6]`           | una fila con el campo a span 12 (auto-expandido)                         |
| `[4, 4]`        | una fila: 4 + 8 (el segundo se auto-expande de 4 a 8)                    |
| `[6, 6, 4]`     | fila 1: 6 + 6 — fila 2: 12 (el tercero se auto-expande de 4 a 12)        |
| `[6, 6, 12]`    | sin cambios — el último ya es 12                                          |

Un contenedor con exactamente un campo siempre renderiza a span 12, por el mismo algoritmo.

## Cuándo aplica

- Generas un módulo nuevo y las anchuras quedan razonables sin tocar nada — la tabla de defaults está haciendo su trabajo.
- Añades un sexto campo al YAML y el layout no "salta" — el grid es el mismo independientemente del número de campos.
- Quieres que un `varchar` ocupe media fila en vez de fila completa — declara `widget.span: 6` y regenera.
- Ves un formulario con dos campos cortos y el segundo se renderiza más ancho que su default — eso es la auto-expansión rellenando la última fila.
- Repartes los campos entre tabs o grupos — cada contenedor balancea su propia matemática de filas; los spans no cruzan contenedores.

## Trade-offs y límites

- **Regenerar cualquier form cambia el markup.** Las máquinas legacy `SPAN_TABLE`, `pickGridMode`, `lengthToProportion` y los tiers compact/medium/full desaparecen. Los YAMLs no requieren migración, pero el layout renderizado va a diferir. Es por diseño.
- **Los defaults son opinados, no detectados.** La tabla es una lookup fija. El generador no intenta adivinar que un `int` concreto representa un año (y podría ir más estrecho) o que dos varchars relacionados deberían ir en la misma fila. Usa `widget.span` cuando el default no encaje.
- **La auto-expansión solo toca el último campo de la fila.** No es un algoritmo de redistribución. Si tienes `[3, 3, 3]`, el tercero se expande a 6 — no tres campos de 4. Para conseguir un `[4, 4, 4]` simétrico, decláralos con `widget.span: 4` explícitamente.
- **El móvil siempre es una columna.** El baseline `col-span-12` apila todos los campos por debajo de 768px. El `max-width` CSS del diálogo es lo que controla el ancho del modal — no la plantilla.

## Relacionado

- [Detail mode: view o dialog](../detail-mode/) — los dos shells renderizan el form con este mismo sistema de grid y span.
- [Regiones de preservación](../preservation-regions/) — `AURORA:FORM-FIELDS-START/END` vive dentro de `*-form.component.ts` para que tus cuerpos de campo personalizados sobrevivan a la regeneración.
- [Grid de 12 columnas + widget.span](../../../changes/cli/2026-04-27-spec-14-form-field-width-system/) — el cambio que introdujo este modelo.
