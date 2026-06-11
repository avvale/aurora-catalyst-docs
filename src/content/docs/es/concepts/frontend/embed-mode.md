---
title: "Embed mode"
sidebar:
  order: 5
description: "Cómo `front.embedSupport: true` activa el modo embed en un módulo hijo para que se integre dentro del detail del padre, y qué cambia en el codegen cuando lo haces."
---

## Por qué existe

Aurora tiene muchas relaciones en las que un padre posee varios hijos que se editan juntos. Un bounded context posee sus permissions; un tenant posee sus accounts; un order posee sus líneas. Sin ayuda del codegen, la única forma de gestionar los hijos de un padre es navegar al CRUD standalone del hijo, aplicar un filtro a mano y recordar a qué padre estás referenciando. El detail del padre no muestra nada sobre los hijos que le pertenecen.

El modo embed cambia el modelo: el detail del padre aloja la lista del hijo, filtrada automáticamente al padre actual, con create y edit en diálogos sobre el padre. El hijo conserva su superficie standalone — simplemente gana un segundo modo que el codegen sabe activar.

## Cómo funciona

Dos flags del YAML activan el modelo. Viven en módulos distintos y ambos tienen que estar puestos.

**En el hijo:** `front.embedSupport: true`. Esto opta al hijo a la forma polimórfica — el codegen emite ahora un list-component con inputs `mode: 'standalone' | 'embed'`, un `*-form-embed.component.ts` cuyo FK al padre se inyecta en submit (no se declara como control) y una segunda factory de columnas `getXEmbedColumns(...)` que elimina la columna del FK al padre. Sin el flag, la regeneración del hijo no cambia.

**En el padre:** `widget.type: grid-elements-manager` sobre la property de relación que apunta al hijo. Esto le dice al codegen que emita, en el detail shell del padre, una sección que monta `<au-{child}-list mode="embed" [parentFilter]=... [parentDefaults]=...>`. El codegen lee el YAML del hijo para encontrar la FK de back-reference (la property cuya `relationship.type` es `many-to-one` y cuyo `modulePath` apunta al padre) y cablea ese campo en `parentFilter` y `parentDefaults`.

Una vez ambos flags están puestos:

- La lista del hijo corre sin header ni breadcrumb en `mode="embed"`. El botón "+ New" abre siempre un diálogo, independientemente del propio `front.detailMode` del hijo. El `parentFilter` persistente se AND-ea con los filtros de UI del usuario y no se puede quitar.
- "Editar fila" llama primero a `shell.fetchForEdit(row.id)` para hidratar la fila con todos los includes relacionales que la query de la lista no cargó, después abre el diálogo con `initial` hidratado.
- El diálogo renderiza `<au-{child}-form-embed>` en lugar del form standalone. El submit inyecta el FK al padre desde `parentValue()`; el FK no forma parte del FormGroup.

## Cuándo aplica

- La relación es one-to-many y editar hijos inline le ahorra al usuario el viaje a la superficie standalone del hijo.
- El hijo sigue teniendo sentido como CRUD top-level — su propia lista, sus propias rutas, todo sigue funcionando.
- El `front.detailMode` del padre es `view`. El modo dialog no puede alojar el widget; el codegen avisa y lo omite.
- El widget aparece solo cuando el padre está en `mode = 'edit'`. En modo `new` el padre todavía no tiene id, así que no hay con qué asociar hijos.

## Trade-offs y límites

- **Sin nested writes.** Cada mutación del hijo es su propia request — guardar un padre NO guarda sus hijos atómicamente. Si necesitas consistencia transaccional entre los dos, lo escribes tú; el framework no los coordina.
- **Diálogo dentro de diálogo está prohibido.** Un padre declarado con `front.detailMode: dialog` no puede alojar el widget embed. El codegen emite un warning y omite la emisión para no apilar un diálogo dentro de otro.
- **`widget.span` se ignora.** El widget es una sección, no un campo — siempre renderiza a ancho completo. Declarar `widget.span` sobre una property `grid-elements-manager` emite un warning en tiempo de generación.
- **Label cableado.** El título de la card del widget usa una key transloco derivada del nombre plural del hijo (p. ej. `iam.permission.Permissions`). Aurora no genera el valor — el desarrollador lo añade a los ficheros de traducción.
- **La validación cross-schema es fail-fast.** Si el regen del padre lee un YAML del hijo que no declara `embedSupport: true`, la generación aborta con un error accionable. Siempre opta al hijo y regenéralo antes de regenerar el padre.

## Relacionado

- [Implementar un widget grid-elements-manager](../../../guides/frontend/implement-grid-elements-manager/) — receta paso a paso del YAML y del flujo de regeneración.
- [Configurar un módulo frontend](../../../guides/frontend/configure-a-frontend-module/) — el flujo más amplio donde el modo embed encaja.
- [Detail mode: view o dialog](../detail-mode/) — por qué el modo dialog no puede alojar el widget embed.
- [Widget grid-elements-manager](../../../changes/cli/2026-04-30-spec-15-grid-elements-manager-widget/) — el cambio que introdujo el modelo.
