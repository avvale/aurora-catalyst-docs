---
title: "Arquitectura del sistema de business rules"
description: "Las catorce piezas técnicas que hacen funcionar el catálogo — ficheros Markdown, índice consolidado, scripts de validación, slash commands, skill de Claude Code, hooks, pre-commit, CI y la extensión de OpenSpec — y cómo se relacionan entre sí."
---

El catálogo de business rules se sostiene sobre una constelación reducida de ficheros, scripts, hooks y comandos. Ninguna pieza es pesada por sí sola; lo que hace sentir sólido al sistema es cómo componen. Esta página recorre cada pieza y luego sigue su encaje en el flujo del día a día.

## La composición en una pantalla

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       ENTRADAS — humanos e IA                            │
├──────────────────────────────────────────────────────────────────────────┤
│  Developer/IA edita .md   ─┐                                             │
│  /opsx:propose             ├──►  cliter/<bc>/business-rules/<agg>.md     │
│  /business-rules:document ─┘                                             │
└────────────────────┬─────────────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│              PROCESAMIENTO ESTRUCTURAL — scripts + Ajv                   │
├──────────────────────────────────────────────────────────────────────────┤
│   parse-catalog.ts ──►  ParsedRule[]                                     │
│   generate-index.ts ──► cliter/business-rules-index.json (para tooling)  │
│                    └──► docs/business-rules/INDEX.md      (para humanos) │
│   validate-catalog.ts ─► Ajv + IDs únicos + metadata válida              │
│   validate-citations.ts ► @rule en código vs índice                      │
└────────────────────┬─────────────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            CONSUMIDORES                                  │
├──────────────────────────────────────────────────────────────────────────┤
│  Humanos      ─► INDEX.md, lectura ad-hoc de los .md                     │
│  IA (Claude)  ─► hook UserPromptSubmit inyecta reglas relevantes         │
│                  openspec/config.yaml inyecta awareness en /opsx:propose │
│  Pre-commit   ─► husky regenera el índice y valida en cada commit        │
│  CI           ─► business-rules-check.yml valida cada PR                 │
│  Audit        ─► audit.ts (estructural) + Claude continúa (semántico)    │
└──────────────────────────────────────────────────────────────────────────┘
```

Las siguientes secciones describen cada componente. Agrúpalos por rol para tenerlos ordenados:

- **Almacenamiento** — los `.md`, el schema, el índice JSON, el índice humano.
- **Tooling** — los nueve scripts TypeScript y los aliases `pnpm br:*` que los envuelven.
- **Superficie en Claude Code** — los cuatro slash commands, el skill `business-rules-guard` y los dos hooks.
- **Integración** — el pre-commit hook, el workflow de CI, la extensión de OpenSpec y la entrada en `CLAUDE.md`.

## Almacenamiento

### 1. Los `.md` del catálogo

Ubicación: `cliter/<bounded-context>/business-rules/<aggregate>.md`. Un fichero por agregado, junto al `*.aurora.yaml` y al `CONTEXT.md` del mismo agregado. La cohesión con el YAML es deliberada — todo lo que describe el dominio vive bajo `cliter/`, incluidos sus invariantes.

Cada fichero lleva un frontmatter de nivel-fichero y una sección `## BR-...` por regla. El formato detallado está documentado en [Anatomía de una business rule](../business-rule-anatomy/).

El path está fijado por convención: las reglas no pueden vivir bajo `openspec/`, `docs/business-rules/<bc>/` ni `backend/`. El audit detecta ficheros mal ubicados y los reporta.

### 2. El JSON Schema (`_schema.json`)

Ubicación: `docs/business-rules/_schema.json`. Un JSON Schema draft-07 que describe **únicamente el frontmatter de nivel-fichero**: campos obligatorios, distinción array vs string, constraint de fecha ISO sobre `last_updated`.

**No** valida la tabla de metadata por regla (estado, severidad, origen). Esa validación vive en código (`validate-catalog.ts`) porque los valores enum legales son más sencillos de codificar y evolucionar como sets de TypeScript que como enums de JSON Schema.

El schema se carga con Ajv (`+ ajv-formats` para el chequeo de fecha) y se aplica al frontmatter de cada fichero. Una violación aborta `pnpm br:validate` con exit `1` y un puntero preciso al fichero y campo problemáticos.

### 3. El índice consolidado (`business-rules-index.json`)

Ubicación: `cliter/business-rules-index.json`. Generado, nunca editado a mano. Es el **único punto de verdad** para cualquier herramienta que necesite razonar sobre reglas sin parsear prosa.

```jsonc
{
  "generatedAt": "2026-05-03T08:32:09.043Z",
  "totalRules": 5, "activeRules": 4, "derogatedRules": 0, "proposedRules": 1,
  "byId": {
    "BR-PROD-HEADER-001": { "id": ..., "title": ..., "filePath": ...,
                            "bounded_contexts": [...], "aggregates": [...],
                            "paths": [...], "keywords": [...],
                            "state": "active", "severity": "blocking",
                            "last_updated": "2026-05-03" },
    ...
  },
  "byBoundedContext": { "production-planning": ["BR-PROD-HEADER-001", ...] },
  "byAggregate": { ... },
  "byKeyword":   { ... },
  "byPath":      [ { "pattern": "backend/src/...", "ruleIds": [...] }, ... ]
}
```

Cinco consumidores dependen de él: `audit.ts` (salud + drift), `check.ts` (sus cuatro modos), `promote.ts` (para localizar reglas a derogar), `validate-citations.ts` (para cruzar IDs `@rule`) y el hook `inject-rules-context.ts` (para puntuar relevancia contra un prompt).

Las claves están en inglés a propósito. El JSON es un artefacto estructural consumido por tooling; la mezcla bilingüe solo aplica al contenido de las reglas, nunca a las claves de formato.

### 4. El índice humano (`docs/business-rules/INDEX.md`)

Ubicación: `docs/business-rules/INDEX.md`. Generado por el mismo script que produce el índice JSON, en la misma pasada. Una tabla plana con todas las reglas (ID, título, BCs, agregados, estado, severidad, last_updated, link) ordenadas por ID. Es la forma más rápida de que un humano obtenga una visión global sin abrir docenas de ficheros.

Como el índice JSON, se sobrescribe en cada regeneración. Las ediciones manuales se pierden.

## Tooling

### 5. Los nueve scripts TypeScript (`scripts/business-rules/`)

| Script                   | Responsabilidad                                                                                                                                  | Invocado por                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `types.ts`               | Interfaces compartidas (`ParsedRule`, `IndexedRule`, `CatalogIndex`).                                                                            | Todos los demás scripts.                                                      |
| `parse-catalog.ts`       | Recorre el catálogo, parsea el frontmatter con `gray-matter` y el body con regex sobre `## <ID>` y tablas de metadata.                          | Todos los demás scripts.                                                      |
| `generate-index.ts`      | Construye `business-rules-index.json` + `INDEX.md`. Falla en IDs duplicados o frontmatter inválido.                                              | `pnpm br:generate`, pre-commit, CI.                                            |
| `validate-catalog.ts`    | Valida frontmatter contra `_schema.json` (Ajv), IDs únicos, valores legales de `Estado`/`Severidad`, existencia de paths en `Implementa` (warn). | `pnpm br:validate`, CI.                                                       |
| `validate-citations.ts`  | Recorre `backend/src/` y `frontend/src/` buscando `@rule BR-...`. Reporta huérfanas y zombis.                                                    | `pnpm br:validate:citations`, paso del audit.                                  |
| `audit.ts`               | Reporte estructural en cuatro secciones (Salud, Drift, Asunciones, Apuntadores cross-BC). Salida humana o `--json`.                              | `/business-rules:audit` paso 1. **No** expuesto como `pnpm br:*` (ver abajo). |
| `promote.ts`             | Lee un `proposal.md` archivado, parsea `## Business rules affected`, aplica acciones (mantiene/deroga/extiende/Nuevas), regenera el índice. Soporta `--dry-run`. | `/business-rules:promote` paso 1.                                              |
| `document.ts`            | Bootstrap retroactivo. Valida el agregado, lista fuentes relevantes, crea un scaffold con solo el frontmatter. **No** genera reglas autónomamente — esa parte la pone el LLM en el paso 2. | `/business-rules:document` paso 1.                                            |
| `check.ts`               | Validación dirigida en cuatro modos: por agregado, por regla, por branch / PR (`gh` + git diff), por working tree.                              | `pnpm br:check`.                                                              |

Stack: `gray-matter` (frontmatter), `ajv` + `ajv-formats` (validación de schema), `fast-glob` (file walking), `tsx` (correr TS sin compilar). Todo en `devDependencies` del `package.json` raíz.

### 6. Los comandos `pnpm br:*`

Wrappers declarados en el `package.json` raíz. El prefijo `br:` los separa del resto de scripts del repo (`back:*`, `front:*`, `dev`).

```json
"br:generate":          "tsx scripts/business-rules/generate-index.ts",
"br:validate":          "tsx scripts/business-rules/validate-catalog.ts",
"br:validate:citations":"tsx scripts/business-rules/validate-citations.ts",
"br:check":             "tsx scripts/business-rules/check.ts"
```

**Asimetría a propósito — qué se expone y qué no.** `audit.ts`, `promote.ts` y `document.ts` **no se exponen** como `pnpm br:*`. Los tres siguen el patrón **script + LLM continuation**: el script hace la parte determinista y Claude continúa la misma sesión rellenando lo que requiere razonamiento (la sección E semántica del audit, el body de las reglas recién scaffolded en promote, la propuesta de reglas implícitas en document). Exponerlos como aliases `pnpm` daría una salida parcial bajo el mismo nombre que la versión completa — el peor default para el dev. Se invocan exclusivamente vía slash commands; para tooling o debugging los scripts siguen siendo invocables directamente con `npx tsx scripts/business-rules/<script>.ts`.

El set `pnpm br:*` refleja exactamente lo que un dev teclea desde la shell: regenerar el índice, validar, validar citas, correr un check dirigido. Nada más.

## Superficie en Claude Code

### 7. Los cuatro slash commands

Ficheros bajo `.claude/commands/business-rules/`. El nombre de la subcarpeta se convierte en el prefijo namespaced con `:`: `business-rules/promote.md` se materializa como `/business-rules:promote`.

| Comando                                 | Qué hace                                                                                                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/business-rules:promote [<archive>]`   | Cristaliza las acciones declaradas en una propuesta OpenSpec archivada: aplica derogaciones, scaffolda reglas nuevas y continúa la sesión rellenando los bodies.                |
| `/business-rules:document <bc>/<agg>`   | Bootstrap retroactivo para un agregado todavía sin fichero de catálogo. Lee YAML + `CONTEXT.md` + código + tests, propone reglas candidatas y las escribe con confirmación.      |
| `/business-rules:audit [<bc>]`          | Reporte estructural (salud, drift, asunciones, apuntadores cross-BC) seguido de un análisis pairwise semántico que Claude redacta en la misma sesión.                          |
| `/business-rules:check [<args>]`        | Wrapper en Claude Code de `pnpm br:check`. Útil cuando el dev ya está en una sesión de Claude Code y quiere la salida renderizada en la conversación.                          |

Los `.md` en sí son documentación para Claude, no código ejecutable. Describen qué preguntar al usuario, cuándo correr el script subyacente y cómo continuar la sesión.

### 8. El skill `business-rules-guard`

Ubicación: `.claude/skills/business-rules-guard/`. **No lo invoca ningún slash command.** Claude lo auto-carga cuando la conversación toca alguno de los triggers declarados en el `auto_invoke` del frontmatter:

- Mención de "business rules" o "reglas de negocio" en cualquier idioma.
- Citas explícitas como `BR-PROD-EVENT-005`.
- Invocaciones de `/business-rules:*`.
- Ediciones a ficheros bajo `cliter/<bc>/business-rules/`.
- El usuario va a tocar código de un agregado con reglas activas (resuelto contra el índice por path o agregado).

El skill contiene el **manual del sistema**: los diez anti-patterns, los tres entry points de workflow, las convenciones inviolables y enlaces a tres ficheros de `references/` (`format.md`, `workflow.md`, `audit.md`) donde Claude puede profundizar cuando necesita guidance específica.

La distinción con los slash commands importa. Un slash command es una acción delimitada que el usuario dispara explícitamente. El skill es **guidance continua** que informa cada acción de Claude relacionada con el sistema — incluso cuando no se invoca ningún comando. Se complementan; ninguno reemplaza al otro.

### 9. Los dos hooks de Claude Code

**`SessionStart` — `generate-skills-index.ts`.** No específico de business rules; pre-existente en el proyecto. Cuando se añadieron el skill y los slash commands, este hook actualizó el índice de skills del `CLAUDE.md` raíz para que Claude los viese. Corre al inicio de cada sesión de Claude Code.

**`UserPromptSubmit` — `inject-rules-context.ts`.** Específico de business rules. Corre antes de cada prompt del usuario:

1. Lee el prompt del JSON que Claude Code pasa por stdin.
2. Localiza la raíz del repo (busca `package.json` con `name: aurora`).
3. Carga `cliter/business-rules-index.json`. Si no existe, el hook sale en silencio.
4. Para cada regla activa o propuesta, calcula un **score de relevancia**: mención explícita del ID `+50`, nombre del agregado `+10`, nombre del BC `+5`, keyword (lowercase, longitud ≥ 4) `+3`.
5. Si alguna regla tiene score > 0, ordena y coge las **3 top**.
6. Lee el body de cada una, trunca a 4000 chars por regla y escribe a stdout una sección formateada. Claude la ve como contexto adicional al prompt.

Esto es **soft enforcement**. La inyección de contexto no obliga a Claude a nada; es un nudge. Si Claude la ignora, el audit on-demand pilla la deriva más tarde. Failsafe: cualquier error (índice ausente, parse roto, package no encontrado) hace que el hook salga en silencio — nunca bloquea un prompt.

## Integración

### 10. El pre-commit hook (Husky)

Ubicación: `.husky/pre-commit`. Detecta cambios staged en `cliter/<bc>/business-rules/*.md` y, si los hay, corre dos pasos en orden:

1. `pnpm br:generate` — regenera el índice (`business-rules-index.json` + `INDEX.md`) y lo añade al mismo commit. Aborta si falla (frontmatter roto, IDs duplicados, error de parsing).
2. `pnpm br:validate` — valida el catálogo contra `_schema.json` y los sets de metadata. Aborta en errores estructurales (exit code `1`); permite commit con warnings (exit code `2`, p. ej. paths inexistentes en `Implementa`).

El hook garantiza dos invariantes en cada commit: el índice commiteado siempre coincide con los `.md` commiteados, y el catálogo siempre pasa los mismos chequeos estructurales que el CI re-correrá en el PR.

### 11. El workflow de CI `business-rules-check.yml`

Ubicación: `.github/workflows/business-rules-check.yml`. Trigger en push a `main` y en pull requests que toquen `cliter/**/business-rules/**`, `cliter/business-rules-index.json`, `docs/business-rules/**`, `scripts/business-rules/**` o el propio workflow.

Pasos:

1. Setup pnpm + Node 24, `pnpm install --frozen-lockfile`.
2. `pnpm br:validate` — falla en errores estructurales.
3. `pnpm br:generate` seguido de `git diff --quiet` contra `business-rules-index.json` y `INDEX.md` — falla si el índice commiteado se ha desviado del regenerado (en teoría el pre-commit hook lo previene, pero el CI es el cinturón y los tirantes).
4. `pnpm br:validate:citations || true` — advisory, nunca bloquea.

El CI es **estructural solo** por diseño. Las contradicciones semánticas se pillan preventivamente en `/opsx:propose` y on-demand vía `/business-rules:audit`; intentar enforzarlas en CI sería poco fiable (heurísticas baratas generan falsos positivos) o caro (llamar a un LLM desde CI requiere API keys, prompts mantenidos fuera del repo, permisos de GitHub App — para un catálogo en piloto, el coste excede el valor).

### 12. Detección de tensiones semánticas (script + LLM continuation)

**No existe un cron, routine o GitHub App** para detectar contradicciones latentes entre reglas. La cobertura se divide en dos planos que comparten infraestructura:

- **Preventiva — en `/opsx:propose`.** La extensión `openspec/config.yaml` instruye a Claude a cargar las reglas relevantes de los BCs candidatos y comprobar la propuesta contra ellas antes de archivarla. Es la red principal.
- **On-demand — en `/business-rules:audit`.** El paso 1 corre `audit.ts` para el reporte estructural; el paso 2 hace que Claude continúe la misma sesión, empareje reglas que comparten BCs/agregados/keywords y clasifique cada par como `contradiction | extension | orthogonal | needs-review` con un valor de confianza y una explicación corta en español.

Este diseño mantiene al sistema libre de infraestructura externa (no SDK, no API key, no job programado, no GitHub App). El trade-off es que los chequeos semánticos no son continuos — corren cuando hay un humano en el loop. Para un catálogo por debajo de ~150 reglas el trade-off está bien balanceado; pasada esa cifra los warnings del audit recomiendan reevaluarlo.

### 13. Integración con OpenSpec (`openspec/config.yaml`)

El **único** fichero bajo `openspec/` que el sistema modifica. Todo el resto bajo `openspec/` lo gestiona el propio OpenSpec CLI — tocarlo arriesgaría que `openspec update` lo sobrescribiese.

`config.yaml` lleva:

- Un bloque `context` (~3,1 KB) que la IA recibe al generar artefactos de proposal, design, spec o tasks. Cubre la ubicación del catálogo, el procedimiento de 7 pasos para detección de conflictos, las convenciones bilingües, el ciclo de vida post-implementación y las citas opcionales `@rule`.
- Un bloque `rules` con seis reglas para `proposal`, dos para `design`, dos para `specs` y dos para `tasks`. Obligan a incluir la sección `## Business rules affected` en la propuesta, fuerzan el halt al detectar conflictos, piden citas a IDs en cambios no triviales y exigen que la lista final de tasks incluya `/business-rules:promote` cuando aplica.

Si OpenSpec se retira del proyecto, el resto del sistema de business rules sigue funcionando. Solo desaparece la awareness automática al proponer; document, promote sobre archives existentes, audit y check son independientes.

### 14. La entrada en el `CLAUDE.md` raíz

Una sección nueva "Business rules" antes de la sección "Skills", una fila en la tabla de skill auto-invoke y una entrada en el índice de skills auto-generado (entre `<!-- SKILLS-INDEX-START -->` y `<!-- SKILLS-INDEX-END -->`).

`CLAUDE.md` se carga al inicio de cada sesión de Claude Code, así que es la primera línea de defensa contra que Claude se invente convenciones alternativas o "armonice" la mezcla bilingüe. La sección es corta a propósito — apunta a los slash commands, al skill y al sitio de docs — pero es lo primero que cada sesión nueva ve.

## Cómo encajan las piezas en un flujo normal

La forma más limpia de ver la arquitectura en movimiento es seguir un cambio único de extremo a extremo.

**1. Autoría.** Un dev corre `/opsx:propose` para un cambio en `production-planning`. La extensión de OpenSpec nudgea a Claude a consultar el catálogo. Claude carga `business-rules-index.json`, escoge las reglas relevantes por BC y keyword, y se pregunta a sí misma si la propuesta contradice alguna. Si encuentra contradicción, la propuesta se detiene con opciones (derogar / coexistir / no es conflicto). La resolución se escribe en la sección `## Business rules affected` del `proposal.md`.

**2. Implementación.** `/opsx:apply` escribe el código. Los hooks que afectan al sistema de business rules permanecen en silencio — ninguna regla ha cambiado todavía, solo el código.

**3. Archive.** `/opsx:archive` mueve el cambio a `openspec/changes/archive/`. El catálogo sigue intacto.

**4. Promote.** `/business-rules:promote` lee el `proposal.md` archivado, parsea `## Business rules affected` y corre `promote.ts`: aplica derogaciones a los `.md` afectados, crea scaffolds para reglas nuevas con el siguiente ID secuencial en `state: proposed` y placeholders `[VERIFICAR]`, y regenera `business-rules-index.json`. Claude entonces continúa la misma sesión — leyendo proposal, design, spec, código y tests — y rellena el body real de cada regla con `Enunciado`, `Casos exhaustivos`, `Implementa` y `Tests`. Cuando el dev confirma, Claude cambia `state: proposed` por `active`.

**5. Commit.** Cuando el dev commitea los cambios del catálogo, el pre-commit hook detecta los `.md` staged y corre `br:generate` + `br:validate`. Si algo está mal (un ID duplicado, un valor ilegal de `Estado`, un typo en el frontmatter), el commit aborta con un puntero preciso. El índice regenerado se añade al mismo commit.

**6. CI.** El PR dispara `business-rules-check.yml`, que re-corre el validador, regenera el índice y verifica que el índice commiteado está al día. La validación de citas corre advisory.

**7. Consumo.** Una vez merged, la regla está viva en el catálogo. El siguiente dev que abra una sesión de Claude Code y pregunte algo que dispare keywords relevantes recibe la regla inyectada en contexto por `UserPromptSubmit`. Soporte cita el nuevo `BR-...` en sus tickets. Una propuesta posterior que toque la misma área la encuentra vía la extensión de OpenSpec.

El paso 4 es donde la arquitectura paga su alquiler: un único comando coordina un script determinista, una continuación LLM y un índice regenerado, con la confirmación del dev en el único punto que genuinamente requiere juicio.

## Dónde vive la fuente de verdad

Esta página es un tour. La documentación normativa vive en el propio repo de Aurora Catalyst, en:

- `docs/business-rules/README.md` — guía operativa (workflows, comandos, convenciones).
- `docs/business-rules/ARCHITECTURE.md` — referencia técnica exhaustiva de cada componente.
- `docs/business-rules/MIGRATION.md` — porte del sistema a otro repo.
- `.claude/skills/business-rules-guard/SKILL.md` y sus ficheros `references/` — el manual vivo del sistema que Claude lee.

Cuando haya duda, el repo de catalyst gana. Las páginas de este sitio destilan el sistema para usuarios de catalyst; el repo es la fuente de verdad.
