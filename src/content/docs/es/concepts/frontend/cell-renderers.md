---
title: "Renderers de celdas"
description: "Cómo la data-table dispatcha por tipo de property y renderiza cada celda con un componente dedicado en `cells/`, y cómo personalizar el renderizado por columna."
---

## Por qué existe

La data-table de Aurora se apoya en TanStack Table. Para cada columna, el codegen decide qué renderizar en cada celda. El default es coerción a string: el valor que esté en la fila para esa key se stringifica y se imprime. Eso funciona para un `varchar` o un `text` — se queda corto para todo lo demás. Un boolean se muestra como el literal `true` / `false`. Una fecha se muestra como un timestamp ISO. Un enum se muestra como su key cruda. Ninguno es usable en una página de lista.

La solución son renderers por tipo. Cada uno coge el valor de la fila, sabe qué forma tiene y emite el tratamiento visual que encaja — un icono para los booleans, una fecha localizada para los timestamps, un badge coloreado para los enum. El codegen dispatcha por tipo de property para que el renderer correcto se cablee automáticamente; el desarrollador sobreescribe por columna cuando el default no encaja.

## Cómo funciona

### Dos tipos de componentes bajo la data-table

La librería frontend en `@aurora/components/data-table/` distingue dos roles:

- **`cells/`** — componentes inyectados vía `flexRenderComponent` cuyo único trabajo es **formatear un valor para mostrarlo**. Consumen el valor de la fila vía `injectFlexRenderContext<CellContext<T, V>>()` (o `HeaderContext<T, V>` para celdas de header) y no tienen efectos secundarios sobre el estado de la tabla.
- **`components/`** — componentes que componen el toolbar o mutan el estado de la tabla. Toggles de selección, botones de sort, controles de paginación, visibilidad de columnas, UI de filtros. Dependen de la API de mutación de TanStack (`Table<T>`, `setColumnVisibility`, `toggleAllRowsSelected`, …).

Cualquier cosa que llame a un setter de `Table<T>` pertenece a `components/`, aunque esté inyectado vía `flexRenderComponent`. Cualquier cosa que solo lea un valor y lo renderice pertenece a `cells/`.

### Dispatch por tipo de property

El codegen de `<mod>.columns.ts` recorre cada property del agregado y elige el cell según el tipo. Hoy el dispatch cubre:

| Forma de la property                  | Celda                                                                                                                                                |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `boolean`                             | `flexRenderComponent(BooleanCell, { inputs: {} })`                                                                                                   |
| `id` + `relationship: many-to-one`    | `accessorKey: '<rel>.name'` con auto-include (consulta [Columnas FK automáticas](../../../changes/cli/2026-04-30-spec-17-fk-column-auto-include/))   |
| cualquier otra cosa                   | `(info) => \`${info.getValue<string>()}\`` — coerción simple a string                                                                                |

La familia `cells/` está pensada para crecer: los futuros renderers (`DateCell`, `BadgeCell`, `CurrencyCell`, `EnumCell`, …) irán reemplazando al fallback de string para sus tipos respectivos según vayan aterrizando.

### `BooleanCell` como implementación de referencia

`BooleanCell` es el ejemplo canónico del contrato:

- Vive en `@aurora/components/data-table/cells/boolean-cell.component.ts`. Selector `au-boolean-cell`. `ChangeDetectionStrategy.OnPush`. Genérico sobre `T`.
- Defaults: `lucideCheck` + `text-emerald-600` para `true`, `lucideMinus` + `text-muted-foreground/60` para `false`.
- Inputs de override: `trueIcon`, `falseIcon`, `trueClass`, `falseClass`. Todos con default.
- Accesibilidad: el `<ng-icon>` lleva `aria-label="true"` o `aria-label="false"`.

### Personalizar por columna

Para cambiar el renderizado de una columna, edita la factory `cell:` en el `<mod>.columns.ts` generado y pasa overrides vía `inputs:`:

```typescript
{
  accessorKey: 'isLocked',
  // ...
  cell: () => flexRenderComponent(BooleanCell, {
    inputs: { trueIcon: 'lucideLock', trueClass: 'text-amber-600' },
  }),
}
```

Esa edición produce un fichero `.origin` en la siguiente regeneración — acepta el merge para conservar la personalización. Hoy no hay un campo en el YAML para overrides; el camino de override es TypeScript sobre el fichero de columnas generado.

### Escribir un renderer nuevo

Cuando añades `DateCell`, `BadgeCell` o cualquier otro, dos reglas:

1. **Ubícalo bajo `cells/` y re-expórtalo a través del barrel** (`cells/index.ts` → `data-table/index.ts` → `@aurora`). Cualquier cosa que mute estado de la tabla se queda en `components/`.

2. **Lee el valor con un getter, no con `computed()`.** La API `injectFlexRenderContext().getValue()` es un método sobre un Proxy, no un signal. Un `computed()` memoizaría contra una identidad que nunca cambia, así que la celda nunca se re-renderizaría cuando cambia el valor de la fila.

   ```typescript
   get value(): boolean {
     return this.context.getValue() ?? false;
   }
   ```

   No es obvio; cada renderer nuevo tiene que usar el patrón del getter.

## Cuándo aplica

- Una lista muestra el literal `true` / `false` para una columna boolean — eso es el fallback legacy de string. Regenera el módulo y la columna pasa a `BooleanCell`.
- Quieres un icono o color no-default en una columna boolean concreta (una cuenta "locked", un feature flag "deprecated") — edita la factory `cell:` generada y acepta el `.origin` review en la siguiente regeneración.
- Un SPEC futuro publica un renderer nuevo (`DateCell`, `EnumCell`, …). Regeneras y el tipo correspondiente lo recoge automáticamente.
- Estás aportando un renderer nuevo al framework. Va en `cells/`; si tiene cualquier mutación de `Table<T>`, va en `components/` en su lugar.

## Trade-offs y límites

- **Sin hook YAML para overrides.** No existe un campo `widget.cellIcon` ni `widget.cellColor`. Los overrides se aplican en TypeScript sobre el `<mod>.columns.ts` generado y se revisan vía `.origin` en el regen. Un hook YAML queda para un SPEC futuro.
- **Un renderer por tipo.** Los booleans siempre renderizan como `BooleanCell` salvo que sobreescribas por columna. No hay un hint YAML "render-as" por property — el dispatch es solo por tipo.
- **Los booleans pierden `searchable`.** La búsqueda de texto sobre el literal `true` / `false` no es útil, así que el codegen omite el flag en las columnas boolean.
- **`flexRenderComponent` requiere `inputs: {}` explícito.** Aunque no sobreescribas ningún input, el segundo argumento tiene que estar (`{ inputs: {} }`). El typing helper de TanStack trata las declaraciones `input<T>(default)` como requeridas bajo TypeScript strict, así que omitirlo es un error de compilación.
- **El split se cumple por convención, no técnicamente.** Nada impide que alguien ponga un componente que muta estado bajo `cells/`. La convención está documentada; los reviewers la policían.

## Relacionado

- [Cell con icono para columnas boolean](../../../changes/cli/2026-05-02-spec-18-boolean-cell-dispatch/) — el cambio que introdujo `BooleanCell` y la convención `cells/`.
- [Columnas FK automáticas en listas](../../../changes/cli/2026-04-30-spec-17-fk-column-auto-include/) — pipeline hermano que emite columnas relacionales (mecanismo distinto, superficie relacionada).
- [Configurar un módulo frontend](../../../guides/frontend/configure-a-frontend-module/) — el flujo más amplio donde este concepto encaja.
