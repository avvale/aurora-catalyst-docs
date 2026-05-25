---
title: "Sistema de business rules"
description: "Catálogo de invariantes del dominio que vive junto a los YAML — prosa bilingüe, identificadores en inglés, cristalizado tras implementación y consumido por humanos y por la IA como memoria institucional y detector de incoherencias."
---

## Qué es

Una **business rule** en Aurora Catalyst es un invariante, una validación, una cascada o una política del dominio, documentada de forma explícita. El catálogo guarda esas reglas en ficheros Markdown planos, uno por agregado, junto al YAML que describe ese mismo agregado. Cada regla tiene un ID estable (`BR-<BC>-<AGG>-<NNN>`), un enunciado claro en español, una tabla exhaustiva de casos y apuntadores al código y los tests que la implementan.

El sistema no es un motor de reglas, ni un DSL, ni una constraint de runtime. La verdad ejecutable es el código y los tests. El catálogo describe la **intención** en un formato que humanos, asistentes IA y tooling pueden consultar por ID — una capa de memoria institucional que sobrevive a la rotación del equipo, a los resets de contexto de la IA y a los traspasos con producto.

## Qué problema resuelve

Los proyectos Aurora Catalyst acumulan dos tipos de conocimiento que no tienen dónde vivir:

1. **"¿Por qué este registro está en `PENDING`?"** Soporte, atención al cliente y producto se chocan con esta pregunta de forma recurrente. La respuesta suele ser una cadena de invariantes que cristalizaron en código hace meses. Sin un identificador citable, la explicación hay que reconstruirla cada vez desde el historial de commits y los hilos de JIRA.
2. **"¿Este cambio contradice una decisión anterior?"** Los dominios medianos convergen en docenas de reglas que interactúan en silencio. Una propuesta nueva que contradice una regla existente sin que nadie se dé cuenta es uno de los bugs más caros del modelado de dominio — y el más fácil de shippear si nadie tiene las reglas previas cargadas en la cabeza.

El catálogo da una sola respuesta a las dos preguntas: un ID estable, un enunciado de un párrafo, una tabla exhaustiva de casos y un enlace al código que enforza la regla. Soporte cita `BR-PROD-EVENT-006`; los asistentes IA al leer una propuesta nueva detectan contradicciones; un dev haciendo triage retroactivo tiene por dónde empezar.

## Cómo se posiciona

El catálogo es **complementario, no prescriptivo**. Tres posicionamientos concretan ese punto:

- **Memoria y detector, no enforcement.** Una regla no rompe el build. El pre-commit hook y el CI solo verifican integridad estructural (frontmatter, IDs únicos, metadata válida). El enforcement semántico ocurre por revisión humana y detección asistida por IA en el momento de proponer cambios.
- **Cristalizado post-implementación.** Una regla aterriza en el catálogo **después** de que el cambio que la introduce se archive en OpenSpec, no antes. La propuesta declara qué acciones sobre reglas va a disparar (`mantiene` / `deroga` / `extiende` / `Nuevas`), y `/business-rules:promote` las materializa una vez que el cambio ha shippeado. El catálogo, por tanto, documenta lo que el sistema **hace**, no lo que **planea hacer**.
- **Mezcla deliberada de idiomas.** La prosa está en español (porque producto y equipo discuten reglas en español). Los identificadores, las keys del frontmatter y las citas `@rule` están en inglés (porque son tokens estables que viajan por código y tooling). Las keywords son bilingües. La mezcla está documentada como convención con una sola constraint dura: **no armonizar**. Traducir el catálogo a un solo idioma es un anti-patrón explícito que la herramienta de audit detecta.

## Los tres workflows

Cada cambio en el catálogo pasa por exactamente uno de los tres workflows. Cada uno tiene su entry point y su superficie de automatización.

| Workflow                            | Cuándo aplica                                                                                                                          | Entry point                                  |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **A — vía OpenSpec**                | Un cambio planificado que pasa por `/opsx:propose → /opsx:apply → /opsx:archive`. Recomendado para todo lo que toque el dominio       | `/business-rules:promote` tras el archive    |
| **B — bootstrap retroactivo**       | El agregado todavía no tiene archivo de catálogo y quieres extraer reglas implícitas del código, los tests o un Word funcional         | `/business-rules:document <bc>/<aggregate>`  |
| **C — edición directa**             | Typos, paths rotos, formato, derogar una regla obsoleta fuera de OpenSpec, resolver marcadores `[VERIFICAR]`                          | Editar el `.md` a mano + `pnpm br:generate`  |

Los workflows se excluyen mutuamente por intención. Un cambio concreto escoge uno y se queda en él. Mezclar — por ejemplo, editar a mano una regla y luego intentar pasar `:promote` por encima — produce drift entre catálogo y archive de OpenSpec, que el audit acabará marcando.

La mecánica está documentada en [Mantener el catálogo de business rules](../../../guides/workflow/maintain-business-rules/).

## Dos capas de consistencia

Dos capas automatizadas protegen el catálogo de la deriva, y se detienen en puntos distintos a propósito.

**Consistencia estructural — totalmente automatizada.** Un pre-commit hook regenera el índice en cada commit que toque `cliter/<bc>/business-rules/*.md` y corre el validador (`pnpm br:validate`). Un workflow de GitHub Actions repite las mismas comprobaciones en cada PR y, además, verifica que el índice commiteado coincide con el regenerado. Los errores aquí bloquean el commit o el PR — violaciones de schema, IDs duplicados, valores ilegales de `Estado`/`Severidad`, drift entre catálogo e índice.

**Consistencia semántica — asistida por humano, dos momentos.** El primer momento es preventivo: cuando ejecutas `/opsx:propose`, la extensión `openspec/config.yaml` instruye a la IA a cargar las reglas relevantes de los bounded contexts candidatos y preguntarse a sí misma si la propuesta nueva contradice alguna. Si la contradice, la propuesta se detiene con opciones (derogar / coexistir con excepción / no es conflicto, justificar). El segundo momento es on-demand: `/business-rules:audit` corre un reporte estructural y a continuación pide a la IA que empareje reglas que comparten BCs, agregados o keywords, y clasifique cada par (`contradiction` / `extension` / `orthogonal` / `needs-review`). No hay job nocturno, ni GitHub App, ni API key — la audit usa la sesión de Claude Code que ya está abierta.

La separación deliberada entre las dos capas es el corazón de la ligereza del sistema. Las comprobaciones estructurales son baratas, deterministas y suficientemente rápidas para gatear cada commit. Las semánticas son caras y requieren juicio, así que ocurren donde ya hay un humano en el loop.

## Cómo se ve en la práctica

```
cliter/
├── production-planning/
│   ├── CONTEXT.md
│   ├── production-order-header.aurora.yaml
│   └── business-rules/
│       ├── production-order-header.md           ← reglas de este agregado
│       └── production-order-position-event.md
├── iam/
│   ├── CONTEXT.md
│   ├── account.aurora.yaml
│   └── business-rules/
│       └── account.md
└── business-rules-index.json                    ← generado
```

El fichero de una regla es Markdown plano con un frontmatter YAML (que declara `bounded_contexts`, `aggregates`, `paths`, `keywords`, `last_updated`) seguido de una sección `## BR-...` por regla. El frontmatter y el índice permiten a las herramientas (el hook de la IA, el workflow de CI, los slash commands) razonar sobre las reglas sin tener que parsear prosa. La prosa es para humanos.

La siguiente página — [Anatomía de una business rule](../business-rule-anatomy/) — desglosa la estructura de una regla en detalle. Para las piezas técnicas que hacen funcionar el sistema (scripts, hooks, slash commands, skill, integración OpenSpec), consulta [Arquitectura del sistema](../business-rules-architecture/).

## Cuándo leer qué documento

- **Vas a redactar o modificar una regla.** Lee [Anatomía de una business rule](../business-rule-anatomy/) y la guía de mantenimiento.
- **Quieres entender cómo encajan el índice, los hooks y el CI.** Lee [Arquitectura del sistema](../business-rules-architecture/).
- **Quieres la fuente canónica.** Vive en el repo de Aurora Catalyst, en `docs/business-rules/README.md` (operativo) y `docs/business-rules/ARCHITECTURE.md` (técnico). Las páginas de este sitio las destilan para usuarios de catalyst; el repo es la referencia normativa.

## Trade-offs y límites

- **El catálogo escala con el dominio, no con el esfuerzo.** Hasta ~150 reglas activas el sistema opera sin fricción. Entre 150 y 500 el audit emite warnings y recomienda filtrar propuestas por bounded context. Pasadas las 1000 hay que replantear la arquitectura (sub-catálogos, RAG, embeddings) — pero esa conversación solo es urgente en proyectos que llevan años vivos.
- **Las citas `@rule` en código son opcionales.** Un handler puede documentar `@rule BR-PROD-EVENT-001` en un bloque JSDoc, pero nada lo fuerza. El validador reporta citas huérfanas (IDs inexistentes) y reglas zombi (activas con cero citas durante más de 30 días) como señales advisory — nunca bloquean.
- **La detección de contradicciones es best-effort.** El chequeo preventivo en propose y el audit on-demand pillan la mayoría de conflictos reales, pero ninguno es exhaustivo. Dos reglas en bounded contexts distintos con keywords sin solape pueden contradecirse en silencio; por eso el audit te deja relanzar el análisis pairwise por BC.
- **La disciplina post-implementación importa.** Es tentador redactar reglas "por adelantado" mientras diseñas una feature. El catálogo explícitamente no funciona así — las reglas describen lo que el código hace (o lo que un cambio archivado en OpenSpec se ha comprometido formalmente a hacer). Saltarte esa disciplina convierte el catálogo en una wishlist, que es el modo de fallo en el que han caído todas las encarnaciones previas de esta idea.
