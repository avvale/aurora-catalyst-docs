---
title: "Mantener el catálogo de business rules"
description: "Operativa del día a día del catálogo — los tres workflows de autoría, los comandos que tecleas desde la shell, qué hace el pre-commit hook por ti y cómo derogar o auditar reglas cuando llega el momento."
---

Esta es la guía operativa del catálogo de business rules. Lee primero [Sistema de business rules](../../../concepts/workflow/business-rules-overview/) si todavía no lo has hecho — esta página asume que sabes qué es una regla y dónde vive.

## Elige un workflow

Cada cambio en el catálogo pasa por exactamente uno de los tres workflows. Escoge por el **origen del cambio**, no por el tamaño:

- **A — vía OpenSpec.** El cambio va por `/opsx:propose → /opsx:apply → /opsx:archive`. Casi todo lo que toque el dominio cae aquí.
- **B — bootstrap retroactivo.** Un agregado todavía no tiene fichero de catálogo y quieres extraer sus reglas implícitas del código existente, los tests o un Word de producto. Uno por agregado, una sola vez.
- **C — edición directa.** Typos, paths rotos, derogación de una regla obsoleta fuera de OpenSpec, resolver marcadores `[VERIFICAR]`.

Los workflows no se mezclan. Escoge uno y mantente en él.

## Workflow A — vía OpenSpec

Es el camino canónico. Seis pasos, y el último es el único específico de business rules.

1. **`/opsx:propose <descripción>`.** Claude genera los artefactos de propuesta. La extensión `openspec/config.yaml` le instruye a consultar el catálogo, detectar conflictos con reglas existentes y escribir una sección `## Business rules affected` en `proposal.md` declarando las acciones sobre reglas (`mantiene` / `deroga` / `extiende` / `Nuevas`).
2. **Resuelve conflictos.** Si Claude detectó un conflicto, se detiene y te pide una decisión: derogar la regla previa (a), mantener ambas con una excepción nueva (b) o no es conflicto — justifica (c). La elección queda registrada en la propuesta.
3. **`/opsx:apply`.** Claude implementa el cambio. El catálogo permanece intacto en este punto.
4. **`/opsx:archive <name>`.** El cambio se mueve a `openspec/changes/archive/`.
5. **`/business-rules:promote [<archive-name>]`.** Aquí es donde el catálogo se actualiza. El comando corre en dos mitades dentro de la misma sesión.
   - Primero el script aplica las acciones deterministas: las derogaciones reciben `state: derogated` + nota de derogación, las reglas nuevas reciben un scaffold con el siguiente ID secuencial bajo `state: proposed` y placeholders `[VERIFICAR]`, y el índice se regenera.
   - A continuación Claude lee la propuesta, el design, las specs, el código y los tests, y escribe el body real de cada regla nueva — `Enunciado`, tabla exhaustiva de casos, `Implementa`, `Tests`. Tras tu confirmación, cambia `state: proposed` por `active`.
6. **Commit.** El pre-commit hook regenera el índice y valida el catálogo. El commit aterriza.

La forma de la sección `## Business rules affected` en la propuesta importa. Claude te la escribe en el paso 1; si tienes que editarla a mano, la shape es:

```markdown
## Business rules affected

### Existentes

- mantiene BR-PROD-EVENT-005 — referencia, sin cambios.
- deroga BR-PROD-EVENT-003 — razón breve.
- extiende BR-PROD-HEADER-001 — relación; el script no toca el .md, solo recordatorio para actualizar "Reglas relacionadas" a mano.

### Nuevas

- en `production-planning/production-order-position-event` — título corto.
- BR-PROD-EVENT en `production-planning/production-order-position-event` — título corto.
  (la forma con prefijo explícito solo hace falta cuando el fichero destino no tiene reglas previas)
```

Si el cambio no toca el catálogo, escribe `None` bajo la sección. Saltarse la sección lo rechaza la extensión de OpenSpec.

## Workflow B — bootstrap retroactivo

Para agregados que todavía no tienen fichero de catálogo. El sistema fomenta el **bootstrap perezoso** — crea el fichero solo cuando hay motivación real (un bug que destapó una regla no documentada, un Word para importar, un bounded context nuevo entrando). Documentar cada agregado por adelantado es un anti-patrón explícito.

```text
/business-rules:document <bc>/<aggregate>
```

El flujo:

1. El script valida que el agregado existe, lista los ficheros que Claude debe consultar (YAML, `CONTEXT.md`, handlers, tests) y crea un scaffold solo con frontmatter.
2. Claude lee las fuentes listadas en sesión interactiva, identifica reglas implícitas y las propone una a una. Para cada candidata, tú confirmas o ajustas antes de que Claude la escriba.
3. Claude escribe las reglas confirmadas con body completo. Marca `[VERIFICAR]` en **las celdas concretas** de la tabla de casos que no puedes derivar del código, no en la regla entera.
4. `pnpm br:generate && pnpm br:validate` (o deja que el pre-commit hook lo haga). Commit.

El estado por defecto para reglas nuevas en este workflow es `active` — el código ya las implementa. La única excepción legítima es el gap producto-↔-código: una regla que producto ya decidió pero el código todavía no enforza. Márcala como `proposed` y el audit la listará como intención auditable.

Para importar un Word de producto ya convertido a Markdown:

```text
/business-rules:document iam/role --from docs/word-export/roles.md
```

Claude usa el Markdown como fuente de reglas candidatas, además del código (o en lugar de él).

## Workflow C — edición directa

Para fixes ad-hoc fuera de un cambio OpenSpec.

### Crear una regla nueva

1. Abre el `.md` destino y añade una nueva sección `## BR-<ID>`, donde `<ID>` es el siguiente número secuencial para el prefijo del fichero (no reutilices IDs derogados).
2. Rellena la tabla de metadata, `Enunciado`, tabla exhaustiva de casos e `Implementa` (la espina obligatoria — ver [Anatomía de una business rule](../../../concepts/workflow/business-rule-anatomy/)).
3. Marca `[VERIFICAR]` o `[ASUNCIÓN]` solo en celdas en las que realmente tengas dudas.
4. `pnpm br:generate && pnpm br:validate` (o deja que el pre-commit hook lo haga).

### Derogar una regla

Las reglas no se editan en su semántica. Para retirar o reemplazar una:

1. Localiza la regla: `pnpm br:check BR-PROD-EVENT-005`.
2. En su `.md`, modifica la tabla de metadata:

   ```diff
   | Campo       | Valor                                |
   | ----------- | ------------------------------------ |
   - | Estado      | `active`                             |
   + | Estado      | `derogated`                          |
   | Severidad   | `blocking`                           |
   - | Origen      | retro-documentada                    |
   + | Origen      | retro-documentada (derogada por BR-PROD-EVENT-007) |
   ```

3. Añade una sección `### Derogación` al final del body:

   ```markdown
   ### Derogación

   Derogada el 2026-06-15 por **BR-PROD-EVENT-007**. Razón breve: <motivo>.
   ```

4. Si hay una regla sustituta, créala bajo un ID nuevo (la derogada nunca se reutiliza). Cruza-refiérelo en `Reglas relacionadas` de la sustituta:

   ```markdown
   - **BR-PROD-EVENT-005** (derogada por esta regla)
   ```

5. `pnpm br:generate && pnpm br:validate`.

El body de la regla derogada permanece en el fichero para siempre, para que las citas históricas en código, commits y tickets sigan siendo legibles. El catálogo crece monotónicamente — derogar nunca borra.

### Modificar una regla (= derogar + crear)

Modificar la semántica de una regla es estructuralmente una derogación + una regla nueva. Encadena los dos procedimientos anteriores en orden.

Ediciones que **no** cuentan como cambios semánticos y sí están permitidas en sitio:

- Correcciones de typos y gramática.
- Reformular sin alterar significado.
- Arreglar paths rotos en `Implementa` o `Tests`.
- Refrescar `last_updated`.
- Resolver un `[VERIFICAR]` o `[ASUNCIÓN]` una vez confirmado.
- Añadir filas a la tabla de casos que cubran más espacio sin contradecir lo cubierto.

## Los comandos de la shell

Cuatro comandos cubren el día a día. Los dos primeros son los que corres a mano con más frecuencia.

### `pnpm br:generate`

Regenera `cliter/business-rules-index.json` y `docs/business-rules/INDEX.md`. Idempotente — correrlo dos veces sin cambios produce el mismo output.

```bash
pnpm br:generate
# → ✓ Índice regenerado: 5 reglas (4 activas, 0 derogadas, 1 propuesta) en 3 archivos.
```

Normalmente no hace falta correrlo a mano; el pre-commit hook lo hace automáticamente cuando detecta cambios staged bajo `cliter/<bc>/business-rules/*.md`. Córrelo manualmente después de editar una regla y antes de abrir Claude Code si quieres que el hook (`inject-rules-context.ts`) vea la última versión inmediatamente.

### `pnpm br:validate`

Validador estructural. Falla con exit code `1` en errores que abortan el commit (frontmatter inválido, IDs duplicados, valores ilegales de `Estado`/`Severidad`); sale con `2` en warnings que no bloquean (paths en `Implementa` que no existen en disco).

```bash
pnpm br:validate
# → Resumen: 3 archivos analizados, 0 errores, 0 warnings.
# → ✓ Catálogo válido.
```

Re-córrelo después de cada edición del catálogo. El pre-commit hook lo encadena tras `br:generate`.

### `pnpm br:validate:citations`

Recorre `backend/src/` y `frontend/src/` buscando anotaciones `@rule BR-...` y las cruza con el catálogo. Reporta huérfanas (citas a IDs inexistentes) y zombis (reglas activas con cero citas durante más de 30 días). Advisory — nunca bloquea el commit ni el PR.

```bash
pnpm br:validate:citations
# → Citaciones encontradas: 3
# → Reglas con al menos una cita: 2
# → ⚠ Citaciones huérfanas (1):
# →   - BR-INVENT-XXX-001 en backend/src/.../foo.ts:42
```

Conviene correrlo de vez en cuando como parte del mantenimiento.

### `pnpm br:check [args]`

Validación dirigida. Cuatro modos según el argumento:

```bash
# Modo 1 — por agregado (lista las reglas del agregado):
pnpm br:check production-planning/production-order-position-event

# Modo 2 — por regla (detalle completo de una regla):
pnpm br:check BR-PROD-HEADER-001

# Modo 3a — por branch (diff vs main):
pnpm br:check --branch feature/cancel-event

# Modo 3b — por PR de GitHub (vía gh CLI):
pnpm br:check --pr 123

# Modo 4 — por working tree (ficheros sin commitear):
pnpm br:check
```

Los modos 3 y 4 son particularmente útiles para code review — listan las reglas cuyo glob de `paths` matchea cualquier fichero modificado en el diff, así ves rápido qué reglas pisa implícitamente un PR.

## Los slash commands

Cuatro comandos viven exclusivamente en Claude Code. Siguen el patrón **script + LLM continuation**: un script determinista escribe el scaffolding y Claude continúa la misma sesión para rellenar lo que requiere razonamiento. Ninguno se expone como `pnpm br:*` (ver [Arquitectura del sistema](../../../concepts/workflow/business-rules-architecture/) para la justificación).

| Comando                                 | Cuándo invocarlo                                                                                                                       |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `/business-rules:promote [<archive>]`   | Después de cada `/opsx:archive` cuya propuesta declaró una sección `## Business rules affected`.                                       |
| `/business-rules:document <bc>/<agg>`   | Una vez por agregado, al hacer bootstrap retroactivo (workflow B).                                                                     |
| `/business-rules:audit [<bc>]`          | Housekeeping mensual o antes de una release importante. Córrelo sin argumento para el catálogo entero; pasa un BC para acotar el sweep semántico pairwise a ese BC. |
| `/business-rules:check [<args>]`        | Cuando quieres el output de `pnpm br:check` renderizado dentro de la conversación de Claude Code.                                      |

Cada comando está documentado en su propio `.md` bajo `.claude/commands/business-rules/` en el repo de catalyst. Claude lee el fichero de documentación y decide cómo conducir el script subyacente.

## Qué hace el pre-commit hook por ti

No tienes que pensar en regeneraciones durante el trabajo normal — el pre-commit hook lo gestiona. Se dispara siempre que el commit lleva cambios staged bajo `cliter/<bc>/business-rules/*.md`, y corre dos pasos en orden:

1. `pnpm br:generate` — regenera y re-stagea el índice. Aborta el commit en fallos de parsing.
2. `pnpm br:validate` — valida el catálogo. Aborta el commit en errores estructurales (exit `1`); permite commit en warnings (exit `2`).

La consecuencia práctica: cada commit que toca el catálogo viaja con un índice al día, y cada commit que llega tiene la misma línea base de validez que CI re-comprueba en el PR.

Si el hook aborta tu commit, el mensaje de error te dice exactamente qué fichero y campo está mal. Arréglalo y re-commitea; nada de `--no-verify`.

## Cuándo auditar

El audit no es parte de cada commit. Es una actividad periódica, conducida por un humano dentro de Claude Code, que combina un reporte estructural con un análisis pairwise semántico hecho por la IA. Córrelo:

- **Mensualmente**, como hábito de mantenimiento, para limpiar marcadores `[VERIFICAR]` con más de 30 días y resolver reglas zombi.
- **Antes de una release importante**, para confirmar que ninguna contradicción se ha colado.
- **Cuando el catálogo pase de 150 reglas activas**, cada dos semanas, para pillar tensiones latentes antes de que el catálogo se vuelva inmanejable.

```text
/business-rules:audit                       # catálogo completo
/business-rules:audit production-planning   # acota el sweep pairwise a un BC
```

El reporte estructural es determinista. La sección semántica reporta tensiones como `contradiction | extension | orthogonal | needs-review` con un score de confianza y una explicación corta en español. Trata el reporte como una worklist, no un veredicto — cada tensión marcada es candidata a revisión, no un problema garantizado.

## Cuándo pedir ayuda

El skill `business-rules-guard` se auto-carga cuando Claude detecta que estás tocando el sistema. Si te encuentras atascado en:

- La forma exacta de una regla (frontmatter, body, secciones) → pide a Claude que aplique la reference `format` del skill.
- Una decisión de workflow (¿derogo, o es una edición no-semántica?) → pide a Claude que aplique la reference `workflow`.
- Un finding del audit que no entiendes → pide a Claude que aplique la reference `audit`.

Los ficheros de references viven en `.claude/skills/business-rules-guard/references/` en el repo de catalyst. Son el manual vivo del sistema; esta guía es la destilación cara al usuario de catalyst.
