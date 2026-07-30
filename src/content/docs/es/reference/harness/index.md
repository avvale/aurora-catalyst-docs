---
title: Referencia del harness
description: Catálogo completo del harness de IA de Aurora Catalyst — cada hook, rule, script, skill, comando, agente y plugin, con su capa, su momento de disparo y si viaja con catalyst new.
---

Todas las piezas del harness, catalogadas. Para el razonamiento detrás de la estructura, empieza por [el harness de IA](../../concepts/harness/); para el orden de los acontecimientos, mira el [ciclo de vida](../../concepts/harness/lifecycle/).

Cada familia abre declarando dos cosas que aplican a todas sus entradas:

- su **capa** — `determinista` (la ejecuta el harness), `contextual` (la carga el harness) o `de criterio` (la aplica el modelo);
- si **viaja**, es decir, si `catalyst new` la deja en tu proyecto. Viaja todo salvo las instalaciones de plugins.

## Puntos de disparo del ciclo de vida

Los cinco momentos declarados en `.claude/settings.json`.

### SessionStart

Se dispara una vez al arrancar la sesión. Dos entradas, separadas por su matcher.

| Matcher | Orden | Comando | Timeout |
| --- | --- | --- | --- |
| `startup` | 1 | `generate-skills-index.ts` | 30 s |
| `startup` | 2 | `daily-tip.sh` | 5 s |
| `startup` | 3 | `catalyst-dev-mode.sh` | 5 s |
| `startup` | 4 | `check-required-plugins.ts` | 15 s |
| `startup\|clear` | 5 | limpieza de `.claude/.cache/` | 5 s |

No puede bloquear.

### InstructionsLoaded

Se dispara una vez por fichero de instrucciones cargado, con un `load_reason`: `session_start`, `nested_traversal`, `path_glob_match`, `include` o `compact`.

| Comando | Timeout | Notas |
| --- | --- | --- |
| `instructions-loaded-log.ts` | 10 s | solo notifica; su salida y su código de salida se ignoran |

No puede bloquear ni inyectar contexto.

### UserPromptSubmit

Se dispara en cada prompt enviado.

| Comando | Timeout | Notas |
| --- | --- | --- |
| `inject-rules-context.ts` | 15 s | todo lo que escriba en la salida estándar se inyecta por delante del prompt |

Puede bloquear.

### PreToolUse

Se dispara antes de ejecutarse una herramienta que casa con el matcher.

| Matcher | Comando | Timeout | Autoridad |
| --- | --- | --- | --- |
| `Write` | `architecture-checkpoint.ts` | 15 s | aviso — bloquea una vez por ruta y se aparta |
| `Write\|Edit\|MultiEdit` | `harness-rules-content-guard.ts` | 15 s | bloqueo |

### PostToolUse

Se dispara después de completarse una herramienta que casa con el matcher.

| Matcher | Comando | Timeout | Autoridad |
| --- | --- | --- | --- |
| `Write\|Edit\|MultiEdit` | `format-with-prettier.ts` | 30 s | informativo |
| `Write\|Edit\|MultiEdit` | `lint-barrels.ts` | 30 s | bloquea con una regla, informa con la otra |

## Hooks

Siete hooks, todos en `.claude/hooks/`, todos `deterministas`, todos viajan. Cada uno degrada a no hacer nada cuando falla por su cuenta, así que ningún fallo suyo puede degradar una sesión.

| Hook | Punto de disparo | Autoridad | Qué hace |
| --- | --- | --- | --- |
| `generate-skills-index.ts` | `SessionStart` | informativo | reescribe el bloque `[Project Skills Index]` dentro de cada `CLAUDE.md` a partir de lo que hay en disco |
| `check-required-plugins.ts` | `SessionStart` | informativo | comprueba que los plugins requeridos estén instalados y habilitados, leyendo el estado combinado en tiempo de ejecución y no los ficheros de configuración |
| `instructions-loaded-log.ts` | `InstructionsLoaded` | ninguna | añade una línea por fichero de instrucciones cargado a `.claude/.cache/instructions-loaded.log` |
| `inject-rules-context.ts` | `UserPromptSubmit` | informativo | inyecta hasta 3 business rules y hasta 3 harness rules que casen con el prompt, 4000 caracteres de cuerpo cada una, con presupuestos separados |
| `architecture-checkpoint.ts` | `PreToolUse` (`Write`) | aviso | saca a la superficie la clasificación de la ruta, la skill de estructura que la gobierna y las reglas aplicables al crear un fichero arquitectónico nuevo |
| `harness-rules-content-guard.ts` | `PreToolUse` | bloqueo | bloquea una escritura cuyo contenido casa con el patrón de detección de una regla activa dentro de las rutas que esa regla gobierna |
| `lint-barrels.ts` | `PostToolUse` | mixta | linta los imports de barrels del fichero recién escrito; una regla bloquea, la otra informa |

### Puntos ciegos del guardián de escritura

`harness-rules-content-guard` solo ve las herramientas de edición del asistente y solo el texto entrante. Contenido escrito a través de un comando de shell, o una violación ya existente que se traslada a una ruta gobernada, pasan sin ser vistos. La comprobación exhaustiva sobre el árbol de trabajo es la red de seguridad.

## Rules

Nueve ficheros en `.claude/rules/`, todos `contextuales`, todos viajan. Cada uno declara globs `paths:` en su frontmatter y se carga al leerse un fichero que case — con un `load_reason` de `path_glob_match`.

Dos familias:

Las **rules de ámbito** enrutan a las convenciones de un workspace entero.

| Rule | Gobierna |
| --- | --- |
| `scope-backend.md` | `backend/src/**`, `backend/test/**` |
| `scope-frontend.md` | `frontend/src/**`, `frontend/libs/**` |
| `scope-cli.md` | `packages/cli/**` |

Las **rules de ruta** enrutan a la skill que cubre un tipo de fichero.

| Rule | Gobierna |
| --- | --- |
| `route-aurora-components.md` | `frontend/src/@aurora/components/**` |
| `route-aurora-yaml.md` | `cliter/**/*.aurora.yaml` |
| `route-backend-test.md` | `backend/**/*.spec.ts`, `backend/**/*.e2e-spec.ts` |
| `route-drizzle-schema.md` | `backend/**/*.schema.ts`, el árbol de migraciones, la configuración de Drizzle y el workflow de drift |
| `route-eta.md` | `**/*.eta` |
| `route-skill-md.md` | `**/.claude/skills/*/SKILL.md`, `.claude/skills/REGISTRY.md` |

Las rules de ámbito enrutan en vez de duplicar porque un `CLAUDE.md` de ámbito no se re-inyecta tras una compactación, mientras que una rule se re-evalúa en cada lectura posterior que case.

## Scripts

Cuatro entradas en `.claude/scripts/`, todas `deterministas`, todas viajan.

| Script | Corre en | Qué hace |
| --- | --- | --- |
| `generate-skills-index.ts` | `SessionStart` | regenera el índice de skills dentro de cada `CLAUDE.md` |
| `daily-tip.sh` | `SessionStart` | imprime un consejo de `daily-tips.txt` |
| `catalyst-dev-mode.sh` | `SessionStart` | inyecta el modo de desarrollo activo |
| `status-line.sh` | continuamente | renderiza la status line; se configura fuera del bloque `hooks`, así que no es un punto de disparo |

Los hooks se apoyan además en código compartido bajo `scripts/`: el runtime de catálogo que carga y valida los índices de reglas, y el núcleo del lint de barrels. Ambos viajan con la plantilla.

## Skills

Treinta y ocho skills, `contextuales`, todas viajan. Están por ámbito: una skill vive con el workspace al que sirve, y la rule de ámbito de ese workspace enruta hacia ella.

### Ámbito monorepo — 16

`.claude/skills/`

| Skill | Cubre |
| --- | --- |
| `business-rules-guard` | el catálogo de business rules: añadir, modificar, derogar, citar por identificador |
| `catalyst-cli` | consumir el CLI: generación, reconciliación `.origin`, qué va en YAML y qué en código |
| `catalyst-delegation` | contratos de delegación: descubrimiento de skills, protocolo de escalado, asignación de modelo |
| `catalyst-langs` | el mecanismo de idiomas: panel frente a datos, adaptadores, añadir un idioma |
| `catalyst-query-dsl` | el contrato del query DSL compartido por ambos stacks |
| `catalyst-report-creator` | convertir una necesidad de reporte en el artefacto mínimo |
| `catalyst-schema` | escribir y validar los esquemas YAML de Aurora |
| `catalyst-skill-creator` | escribir una skill nueva |
| `catalyst-update-skill-registry` | regenerar el registro de skills tras cualquier cambio en ellas |
| `harness-rules-guard` | el catálogo de harness rules |
| `judgment-day` | revisión adversarial doble |
| `openspec-explore` | explorar una idea antes de comprometerse con un cambio |
| `openspec-propose` | crear un cambio y sus artefactos |
| `openspec-apply-change` | implementar las tareas de un cambio |
| `openspec-archive-change` | cerrar un cambio y sincronizar las specs |
| `typescript` | patrones de TypeScript estricto |

### Ámbito backend — 10

`backend/.claude/skills/`

| Skill | Se dispara con |
| --- | --- |
| `catalyst-project-structure` | «dónde va este fichero», los límites entre capas |
| `catalyst-handler-composer` | lógica de negocio dentro de un handler, handlers compuestos de flujo de protocolo |
| `catalyst-field-schema` | decoradores de esquema y formato, query statements dentro de un handler |
| `catalyst-nestjs-primitives` | guards, interceptors, pipes, filters, decoradores, permisos |
| `catalyst-cross-bounded-context-ports` | un bounded context que lee o escribe en otro |
| `catalyst-provider-composition` | elegir el provider concreto detrás de un puerto: storage, mailer, colas |
| `catalyst-tools` | configuración en runtime, feature flags, secretos, procedures de base de datos, migraciones declarativas |
| `catalyst-schema-migrations` | un cambio de esquema o una migración |
| `catalyst-backend-testing` | escribir tests |
| `catalyst-review-module` | revisión de coherencia de un módulo cerrado |

### Ámbito frontend — 11

`frontend/.claude/skills/`

| Skill | Se dispara con |
| --- | --- |
| `catalyst-data-layer` | leer o mutar datos del servidor: pantallas de listado y detalle, resolvers, queries, mutations |
| `catalyst-component-catalog` | componer una pantalla con los componentes del framework |
| `catalyst-data-table-management` | columnas, celdas e infraestructura de data-table |
| `catalyst-form-composer-auditor` | componer o auditar un formulario o un detalle |
| `layout-design-system` | espaciado, jerarquía visual, densidad |
| `transloco-i18n` | traducciones, scopes, cambio de idioma |
| `catalyst-widget-creator` | widgets de dashboard |
| `spartan` | los componentes de Spartan UI |
| `catalyst-project-structure` | «dónde va este fichero» |
| `catalyst-review-module` | revisión de coherencia de un módulo cerrado |
| `catalyst-component-story-composer` | escribir stories de los componentes del framework |

### Ámbito CLI — 1

`packages/cli/.claude/skills/`

| Skill | Se dispara con |
| --- | --- |
| `eta-templating` | editar una plantilla de codegen |

## Commands

Trece ficheros de comando en `.claude/commands/`, `contextuales`, viajan. Solo se cargan cuando los escribes tú.

| Comando | Para qué sirve |
| --- | --- |
| `/catalyst-dev-mode` | alternar entre modo Framework y modo Solution |
| `/create-schema` | analizar o crear un esquema YAML de Aurora |
| `/load-skill` | cargar una skill por nombre, o listarlas |
| `/review-module` | revisión profunda de coherencia de un módulo |
| `/opsx:explore` | pensar una idea antes de comprometerse con ella |
| `/opsx:propose` | crear un cambio y generar sus artefactos |
| `/opsx:apply` | implementar las tareas de un cambio |
| `/opsx:archive` | cerrar un cambio completado |
| `/business-rules:audit` | auditar el catálogo de business rules |
| `/business-rules:check` | validar contra el catálogo de business rules |
| `/business-rules:document` | documentar reglas implícitas en código existente |
| `/business-rules:promote` | cristalizar reglas declaradas en un cambio archivado |
| `/harness-rules:audit` | auditar el catálogo de harness rules |

Dos de esos ficheros se llaman igual, `audit.md`, en directorios distintos. El índice de skills generado deduplica por nombre de fichero, así que informa de doce comandos donde hay trece ficheros; los comandos en sí son distintos y ambos funcionan.

## Agents

Un agente en `.claude/agents/`, `contextual`, viaja.

| Agente | Para qué sirve |
| --- | --- |
| `catalyst-schema-manager` | analiza los esquemas YAML de Aurora y propone mejoras de nombres, descripciones y semántica; crea, edita y borra campos cuando se le pide |

## Plugins

Cuatro plugins. **Es la única familia que no viaja del todo.** Las declaraciones sí van dentro de `settings.json`, así que tu editor te ofrece instalarlos al confiar en la carpeta del proyecto — pero las instalaciones son por usuario, y justo por eso `check-required-plugins` los verifica en cada arranque.

| Plugin | Requerido | Por qué |
| --- | --- | --- |
| `engram` | sí | memoria persistente entre sesiones |
| `superpowers` | sí | skills base y disciplina de desarrollo dirigido por tests |
| `code-review` | sí | el gate de verificación |
| `context7` | no | documentación actualizada de librerías |

`engram` vive en un marketplace propio, también declarado en el `settings.json` que recibes.

## Capa de criterio

Estas no son ficheros bajo `.claude/`. Son instrucciones dentro de `CLAUDE.md`, aplicadas por el razonamiento del asistente, y viajan porque la plantilla lleva su propio `CLAUDE.md`.

### Intent Gate

El primer gate. Antes de clasificar nada, el asistente confirma que entiende la petición. Una petición ambigua —objetivo difuso, una restricción que falta, dos lecturas plausibles— se aclara conversando antes de empezar cualquier trabajo, y después se vuelve a triar. Una petición clara se salta el gate por completo.

### Task-Weight Triage

Clasifica cada petición como **Minor**, **Medium** o **Complex**, y el tier decide si entra el flujo dirigido por specs y qué gates de calidad corren. Se vuelve a lanzar si el alcance crece a mitad de tarea; ante la duda entre dos tiers, gana el más pesado.

### Worktree Gate

Para trabajo Medium y Complex, antes del primer cambio de código: se ofrece aislar el trabajo en un worktree de git con su propia rama, cerrando con un pull request. Recomendado, nunca impuesto, nunca hecho en silencio. El trabajo Minor no lo dispara.

### Quality Gates

Desarrollo dirigido por tests y revisión de código, escalados por tier: nada para Minor, una pasada de revisión para Medium, revisión adversarial doble para Complex. Una revisión de seguridad aparte se dispara con su propio criterio —si el cambio toca la superficie de seguridad— con independencia del tier.

### Delegation contracts

Las reglas que gobiernan el trabajo delegado a subagentes: cómo se descubren las skills y se inyectan como rutas explícitas, cómo escala un subagente cuando necesita orientación en lugar de adivinar, y qué modelo se encarga de cada tipo de tarea.

## CLAUDE.md

Las instrucciones del proyecto en sí, `contextuales`, viajan. El fichero raíz se carga al arrancar la sesión; los de ámbito se cargan por traversal anidado al leerse un fichero bajo su directorio.

Cada uno lleva un bloque generado `[Project Skills Index]`, reescrito en cada arranque por `generate-skills-index.ts`. Editar ese bloque a mano no tiene efecto: se regenera a partir del disco.

Un `CLAUDE.md` de ámbito **no** se re-inyecta tras una compactación. Esa limitación es justo lo que vienen a compensar las rules de ámbito.
