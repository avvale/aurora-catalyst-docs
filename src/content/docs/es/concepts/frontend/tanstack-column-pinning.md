---
title: "Orden de columnas pinned en TanStack"
description: "Por qué pinnear una columna no la mueve — y cómo la data-table reordena columnas pinned escribiendo en `setColumnPinning` y `setColumnOrder` a la vez."
---

## Por qué existe

TanStack Table es la base de la data-table de Aurora. Su API de pinning se construye sobre dos slices de estado que parecen uno solo cuando lees los docs por encima: `columnPinning.left` (y `.right`) y `columnOrder`. Confundirlos es la diferencia entre que una columna se mueva donde tú quieres y que se quede pegada donde estaba.

La frase que más debugging cuesta: **`columnPinning.left` es un SET de IDs, no un orden visual.** Una columna listada ahí está anclada al borde izquierdo — eso es todo. Dónde se coloca respecto a otras columnas pinned en ese borde lo decide `columnOrder` (o, cuando `columnOrder` está vacío, el orden declarativo del array `columns` que le pasaste a la tabla).

Si quieres arrastrar una columna pinned a un sitio nuevo dentro de la zona pinned — o simplemente introducir un orden determinista cuando coexisten varias pinned — tienes que escribir en **los dos** slices.

## Cómo funciona

### Los dos slices de estado

TanStack lee dos piezas de estado para renderizar una columna:

| Estado                    | Trabajo                                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| `columnPinning.left`      | El set de IDs de columna ancladas al borde izquierdo bajo scroll horizontal. El orden aquí no importa. |
| `columnPinning.right`     | Misma idea, ancladas al borde derecho.                                                                |
| `columnOrder`             | El orden visual de toda la tabla (pinned-izq, centro scrollable, pinned-der). Cuando está vacío, cae al orden declarativo de `columns`. |

El orden de render es `[pinned-izq en columnOrder] [scrollable en columnOrder] [pinned-der en columnOrder]`. La pertenencia a una zona pin viene de `columnPinning`. La posición dentro de la zona viene de `columnOrder`.

### El síntoma

Imagina una tabla con `columns: [actions, select, code, name, description]`. El usuario arrastra `name` antes que `code` dentro de la zona pinned-izq. La llamada ingenua:

```typescript
table.setColumnPinning({
  left: ['actions', 'select', 'name', 'code'],
  right: [],
});
```

Tú esperas que la fila renderizada diga `Actions · Select · Name · Code · Description`. No lo hace. El DOM sigue mostrando `Actions · Select · Code · Name · Description`. Los flags de pinning se movieron (tanto `name` como `code` aparecen como left-pinned), pero el orden visual respetó el array declarativo `columns`, no el array que le pasaste a `setColumnPinning.left`.

### El fix

Reordenar es una operación de dos escrituras: pinning Y orden, con la misma intención en ambas:

```typescript
const newStickyOrder = ['actions', 'select', 'name', 'code'];
const right: string[] = [];
const scrollOrder = ['description'];

table.setColumnPinning({ left: newStickyOrder, right });
table.setColumnOrder([...newStickyOrder, ...scrollOrder, ...right]);
```

Verificado en el DOM (`Code` a 90 px del borde izquierdo, `Name` a 250 px) cuando las dos llamadas aterrizan con la misma intención. Quita cualquiera de las dos y el orden visual se queda en el declarativo original.

### Dónde lo aplica Aurora

`@aurora/components/data-table/components/column-toggle.component.ts` expone un método privado `applyZoneReorder(stickyOrder, scrollOrder)` que los handlers de drag-drop `onDropSticky` y `onDropScroll` invocan. Ese helper es el único sitio del framework que llama a los dos setters juntos; cualquier consumidor que necesite reordenar columnas pinned pasa por ahí.

## Cuándo aplica

- Implementas una UI de drag-and-drop para reordenar dentro de una zona pinned de una tabla TanStack — actions a la izquierda, summary a la derecha, lo que sea. Usa `setColumnPinning` para pertenencia y `setColumnOrder` para posición.
- Una llamada `setColumnPinning({ left: [...] })` parece funcionar para todo menos para el orden renderizado — la columna sigue en el sitio de antes. Ese es el síntoma; añade la llamada gemela a `setColumnOrder`.
- Introduces control programático sobre qué columnas están pinned (p.ej. un preset "sticky por defecto"). Decide un orden determinista al mismo tiempo que decides pertenencia y escribe en los dos.

## Trade-offs y límites

- **Los dos slices pueden divergir.** Un ID de columna puede aparecer en `columnPinning.left` pero faltar en `columnOrder` (o al revés). TanStack tolera la asimetría — la columna se renderiza igual — pero el orden visual cae al declarativo para el slice incompleto. Mantén las dos escrituras emparejadas en un único helper para evitar la deriva.
- **Los helpers no encadenan implícitamente.** `setColumnPinning` no llama a `setColumnOrder` por ti, ni siquiera cuando el nuevo valor de pinning sería ambiguo sin un orden coincidente. El desacoplamiento en TanStack es intencional — pinning y orden son conceptos ortogonales — pero también es la razón por la que este tropezón aparece.
- **El array declarativo `columns` es tu orden por defecto.** Cuando `columnOrder` está vacío, la tabla renderiza en el orden del array `columns` que le pasaste en construcción. No te apoyes en eso después de que el usuario haya interactuado: en cuanto llamas a `setColumnOrder` una vez, la tabla empieza a respetar ese array y volver al declarativo silenciosamente ya no es opción.

## Relacionado

- [Renderers de celdas](./cell-renderers/) — el concept hermano que cubre cómo se renderiza el valor de cada columna (el QUÉ). El pinning es el DÓNDE.
- [Configurar un módulo frontend](../../../guides/frontend/configure-a-frontend-module/) — el workflow más amplio en el que vive esto.
