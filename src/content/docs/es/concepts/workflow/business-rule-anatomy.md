---
title: "Anatomía de una business rule"
description: "Los campos, las convenciones y el ciclo de vida de cada regla — shape del frontmatter, gramática del ID, estado y severidad, tabla exhaustiva de casos, apuntadores cross-agregado y relación con las citas `@rule`."
---

Una regla es una sección Markdown dentro de `cliter/<bc>/business-rules/<aggregate>.md`. El fichero contiene varias reglas; su frontmatter describe el agregado entero, mientras que cada regla vive bajo su propia cabecera `## BR-...` con su propia tabla de metadata. Esta página recorre cada parte de esa anatomía.

## Frontmatter de fichero

Cada archivo del catálogo arranca con un frontmatter YAML que describe el ámbito del agregado.

```yaml
---
bounded_contexts:
  - production-planning            # kebab-minúsculas, en plural
  - iam                            # idem; varios BCs admitidos en reglas cross-BC
aggregates:
  - production-planning/production-order-header
  - production-planning/production-order-position-event
last_updated: 2026-05-02
keywords:
  - cancelación de evento          # bilingüe a propósito
  - cancel event
  - cascada de revert
  - revert cascade
paths:
  - backend/src/@app/production-planning/production-order-header/**
  - frontend/src/app/modules/admin/apps/production-planning/production-order-header/**
---
```

| Campo              | Tipo                | Propósito                                                                                                                                |
| ------------------ | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `bounded_contexts` | `string[]`          | Todos los BC que tocan las reglas del fichero. Siempre en plural — incluso para ficheros de un solo BC. Alimenta `byBoundedContext`.    |
| `aggregates`       | `string[]`          | Paths totalmente cualificados (`<bc>/<aggregate>`). `/business-rules:document` los usa para localizar el fichero dueño.                  |
| `last_updated`     | `string` (ISO date) | Se refresca cuando una regla del fichero cambia. El audit lo usa para detectar `[VERIFICAR]` rancios (> 30 días).                        |
| `keywords`         | `string[]`          | Tokens bilingües de pista. El hook `UserPromptSubmit` puntúa los prompts contra esta lista para inyectar reglas relevantes a la IA.      |
| `paths`            | `string[]`          | Globs de paths de código que las reglas del fichero gobiernan. `pnpm br:check --branch` cruza ficheros modificados contra estos.        |

Los cinco son obligatorios. El casing es fijo: claves en `snake_case_lower` en el frontmatter, identificadores (los IDs `BR-...` del body) en `UPPER-KEBAB-CASE`. El validador estructural (`pnpm br:validate`) rechaza cualquier cosa que se desvíe de esa shape.

## Gramática del identificador

```
BR-<BOUNDED-CONTEXT>-<AGGREGATE>-<NNN>

  Ejemplos:
    BR-IAM-USER-001
    BR-PROD-EVENT-005           (BC en forma corta)
    BR-PRODUCTION-HEADER-007    (BC en forma larga)
```

Tres constraints hacen del ID una moneda estable que viaja por código, prosa, commits y PRs:

- **En mayúsculas, deliberadamente.** Resalta visualmente en cualquier contexto — comentarios JSDoc, subjects de commits, descripciones de PR, tickets de soporte.
- **Abreviaturas estables.** Un BC y un agregado pueden usar su nombre largo o una forma corta, pero la forma elegida es permanente para ese agregado. `BR-PROD-EVENT-*` y `BR-PRODUCTION-EVENT-*` no pueden coexistir para el mismo agregado.
- **Los números nunca se reutilizan.** Cuando una regla se deroga, su `NNN` queda quemado permanentemente. La siguiente regla coge el número siguiente. Esto garantiza que las citas históricas no se vuelvan ambiguas: un comentario en código que cita `BR-PROD-EVENT-005` siempre resuelve a la misma regla, esté activa o derogada.

La primera regla que un fichero recibe establece su prefijo; las siguientes lo heredan. Cuando `/business-rules:promote` scaffolda una regla nueva, infiere el prefijo de las reglas existentes; para ficheros vacíos, la propuesta debe declarar el prefijo explícitamente.

## Cuerpo de una regla

Cada regla es una sección `## BR-...`. La forma es la misma para todas, con secciones opcionales que se activan solo cuando la regla las necesita.

```markdown
## BR-PROD-HEADER-007 — Revert por borrado del último evento

| Campo      | Valor                                                |
| ---------- | ---------------------------------------------------- |
| Estado     | `active`                                             |
| Severidad  | `blocking`                                           |
| Origen     | openspec/changes/archive/2026-05-03-cancel-event/    |
| Trigger en | production-planning/production-order-position-event  |
| Efecto en  | production-planning/production-order-header          |

### Enunciado

Al borrar el último evento de una position, su header debe revertir a
`PENDING` salvo que existan otras positions activas en el mismo header.

### Diagrama de cascada

delete(event)
  │
  ▼
position.events.length === 0 ?
  │ sí
  ▼
header has other active positions ?
  │ no
  ▼
header.state = PENDING

### Casos exhaustivos

| #   | Evento previo | Header tiene otras positions | Resultado          |
| --- | ------------- | ---------------------------- | ------------------ |
| 1   | último        | no                           | revert a PENDING   |
| 2   | último        | sí                           | header sin cambios |
| 3   | no era último | n/a                          | position sin tocar |

### Implementa

- `backend/src/@app/production-planning/production-order-position-event/.../delete.handler.ts:42`
- `backend/src/@app/production-planning/production-order-header/.../revert-state.function.ts:11`

### Tests

- `backend/test/production-planning/.../revert-on-last-event-delete.spec.ts:'reverts when no siblings'`

### Reglas relacionadas

- **BR-PROD-EVENT-001** — No cancelar eventos DONE (precondición de este flujo)
```

La tabla de metadata, el `Enunciado`, la tabla de casos y la lista `Implementa` son la **espina obligatoria** de cada regla. El resto se activa por necesidad: `Diagrama de cascada` para reglas que propagan efectos, `Tests` cuando hay tests linkeables, `Reglas relacionadas` cuando otros IDs participan. Todo lo demás — etiquetas, orden de las secciones opcionales — se mantiene uniforme en todo el catálogo para que lectores y herramientas no tengan que adivinar.

## Estado y severidad

Cada regla declara dos dimensiones ortogonales en su tabla de metadata.

**Estado** es la posición de la regla en su ciclo de vida.

| Valor       | Significado                                                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `active`    | Implementada en código y vigente.                                                                                                          |
| `derogated` | Retirada o sustituida. Su ID queda quemado permanentemente. El body se mantiene para que las citas históricas se sigan leyendo.            |
| `proposed`  | Documentada pero todavía no implementada. El uso legítimo es el gap producto-↔-código — hacer auditable una regla deseada pero sin shippear. |

**Severidad** es lo que ocurre si la regla se rompe.

| Valor           | Significado                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------- |
| `blocking`      | Romperla produce un fallo del sistema o un comportamiento incorrecto del dominio.                |
| `informational` | Una convención u orientación. Las violaciones generan fricción pero nada se cae.                  |

No hay un nivel "warning" intermedio a propósito. Las severidades intermedias generan fatiga y enforcement inconsistente — el catálogo opta por un binario claro.

## La tabla de casos es exhaustiva

La tabla bajo `### Casos exhaustivos` es la parte más exigente del formato. Tiene que cubrir el producto cartesiano completo de las condiciones del trigger, no solo el camino feliz. El objetivo: que cualquier futuro lector — humano o IA — pueda responder "¿qué pasa cuando X e Y y Z?" recorriendo filas, sin re-derivar la lógica desde el código.

Cuando una fila genuinamente no se puede derivar del código ni de los tests, el caso se marca inline:

```markdown
- **[VERIFICAR caso 4]**: si el cliente está suspendido durante la cascada, ¿revert o no?
- **[ASUNCIÓN]**: asumimos que los eventos en estado `DONE` no participan; verificar con producto.
```

El audit reporta cualquier marcador con más de 30 días sin resolver, así que se convierten en trabajo visible en lugar de pudrirse para siempre.

## Reglas cross-agregado y cross-BC

Una regla que afecta a más de un agregado (una cascada) o a más de un bounded context (una excepción por rol de usuario) vive en **un solo fichero**: el del agregado donde se observa el invariante final. El frontmatter de ese fichero declara todos los BC y agregados afectados (en plural). Los demás ficheros involucrados llevan **apuntadores cortos** — nunca contenido duplicado.

```markdown
# En cliter/production-planning/business-rules/production-order-position-event.md

## Cascadas que dispara este agregado

- `delete(event)` → ver **BR-PROD-HEADER-007** (revert cascade hacia header
  cuando se borra el último evento de su position).
```

Esta convención tiene dos beneficios. Buscar un ID nunca aterriza en dos versiones ligeramente distintas, y el índice cross-BC en `business-rules-index.json` (`byBoundedContext`) recoge automáticamente cada BC declarado en el frontmatter del fichero dueño.

## Citas `@rule` en código (opcional)

Un handler, función o test puede citar una regla en JSDoc o un comentario equivalente:

```typescript
/**
 * Cancela un evento de producción.
 *
 * @rule BR-PROD-EVENT-001 — No cancelar eventos DONE
 * @see cliter/production-planning/business-rules/production-order-position-event.md
 */
async cancel(eventId: string): Promise<void> {
  ...
}
```

El validador (`pnpm br:validate:citations`) recorre `backend/src/` y `frontend/src/` buscando anotaciones `@rule BR-...` y las cruza contra el índice. Reporta dos señales suaves:

- **Cita huérfana** — el código cita un ID que no existe en el catálogo. Suele ser un typo o un rename no propagado.
- **Regla zombi** — una regla `active` que lleva más de 30 días sin ninguna cita. O la regla quedó obsoleta y hay que derogarla, o el código que la implementa dejó de nombrarla.

Ninguna bloquea el build. Las citas son una comodidad para los lectores; el catálogo se sostiene solo.

## Ciclo de vida: cómo se mueve una regla entre estados

El ciclo de una regla es intencionalmente estrecho: solo puede **crearse** o **derogarse**. Modificar la semántica de una regla — cambiar el `Enunciado` o el significado de un caso — es estructuralmente equivalente a derogar la antigua y crear una nueva con ID nuevo. El catálogo no soporta ediciones semánticas en sitio.

Esa distinción importa porque los IDs son referencias estables en código y commits. Si `BR-PROD-EVENT-005` cambiase de significado en silencio con el tiempo, cada cita histórica desplazaría su semántica sin avisar. Al forzar derogación + regla nueva, el catálogo mantiene cada ID congelado a un único significado para siempre.

Ediciones que **no** cuentan como cambios semánticos (y por tanto sí están permitidas en sitio):

- Correcciones de typos, gramática, formato.
- Reformular el enunciado sin alterar significado.
- Arreglar paths rotos en `Implementa` o `Tests`.
- Refrescar `last_updated`.
- Resolver un marcador `[VERIFICAR]` o `[ASUNCIÓN]` una vez confirmada la respuesta.
- Añadir filas a la tabla de casos que cubran más espacio sin contradecir lo cubierto.

La guía de mantenimiento detalla la mecánica de derogación + creación.

## Por qué existe cada constraint

Una pregunta sutil es por qué el formato es exactamente este. Tres razones gobiernan la mayoría de las decisiones:

- **El catálogo debe sobrevivir a los resets de contexto de la IA.** Una futura sesión de Claude Code, sin memoria de esta conversación, tiene que poder localizar, citar y razonar sobre una regla. Eso requiere IDs estables, un frontmatter machine-parseable y una shape de body lo suficientemente consistente para que un hook la resuma en unos miles de caracteres.
- **El catálogo debe sobrevivir a la rotación del equipo.** Un dev nuevo leyendo `BR-PROD-EVENT-007` debería aprender qué dice la regla, dónde se enforza y qué la precede. Eso requiere el `Enunciado`, la tabla de casos, la lista `Implementa` y el bloque `Reglas relacionadas`.
- **El catálogo no debe convertirse en una wishlist.** Cada constraint que fuerza framing post-implementación (el estado `active` solo después de que el código aterrice, `proposed` solo para gaps producto-↔-código documentados, derogación que nunca borra) está para mantener el catálogo pegado a lo que el código realmente hace.

Para las piezas en movimiento que convierten esos constraints en automatización real — scripts, hooks, slash commands, skill, workflow de CI — consulta [Arquitectura del sistema](../business-rules-architecture/).
