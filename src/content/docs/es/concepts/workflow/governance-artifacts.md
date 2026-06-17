---
title: "Los cuatro artefactos de gobernanza"
description: "Las Harness Rules, el hook architecture-checkpoint y las skills catalyst-project-structure de backend y frontend parecen solaparse — no lo hacen. Una referencia desde cero que no asume conocimiento previo de Aurora y traza la frontera entre lo que te bloquea, lo que te aconseja y quién es el responsable real de cada cosa."
---

Aurora Catalyst trae cuatro mecanismos distintos que "vigilan" cómo se escribe el código. A quien entra nuevo al equipo le parecen redundantes. No lo son. Cada uno tiene una responsabilidad propia, pero comparten vocabulario y se citan entre sí, y esa zona gris es donde la gente se pierde. Esta página existe para disolver esa confusión.

## 1. Por qué existe este documento

Los cuatro artefactos son:

1. **Harness Rules** — las reglas arquitectónicas codificadas del monorepo.
2. **El hook `architecture-checkpoint.ts`** — el guardia automático que salta en el momento de escribir (*write-time*).
3. **La skill `catalyst-project-structure` del backend** — el plano de "dónde va cada archivo" en el backend.
4. **La skill `catalyst-project-structure` del frontend** — el plano equivalente en el frontend.

Si acabas de entrar al equipo, seguramente ya has visto saltar al menos dos de ellos y te has preguntado si son la misma cosa con distinto sombrero. No lo son. Al terminar esta página vas a poder mirar cualquiera de ellos y responder tres preguntas al instante: *¿esto me bloquea o solo me aconseja? ¿dónde vive físicamente? ¿quién decide de verdad — un arquitecto, una herramienta o yo?*

Esta es una lectura **orientada a entender**. Si quieres *hacer* algo concreto, las how-to guides son el lugar; si quieres datos exactos sobre una regla concreta, lee su entrada de catálogo. Esta página es el mapa.

En resumen: cuatro gobernantes, un vocabulario compartido, cuatro trabajos distintos — y este documento es la leyenda que los distingue.

## 2. TL;DR — el mapa mental

Escribir código en Aurora es como **construir dentro de un complejo de edificios que ya está en obra**. Cuatro cosas gobiernan tu trabajo en esa obra, y cada una cumple un papel que ya conoces de una obra real:

| Artefacto | Rol en la obra | Naturaleza |
| --- | --- | --- |
| **Harness Rules** | El **código técnico de edificación / la normativa estructural**. Constraints permanentes: dicen lo que está prohibido por seguridad estructural. Violarlas no es "mala práctica", es *ilegal*. No se editan a escondidas: se **derogan** formalmente y se publica una norma nueva. | Constraint estable y citable. |
| **Hook `architecture-checkpoint`** | El **guardia en la entrada de la zona estructural**. La primera vez que entras con material nuevo a colocar en una zona crítica, te para y te pregunta: "¿has mirado los planos?". Es **ciego al contenido**: no juzga si tu pared está bien hecha, solo mira *dónde* vas a construir y te obliga a consultar antes. | Compuerta automática, una vez por sitio. |
| **Skill `catalyst-project-structure` (backend)** | Los **planos de planta del edificio de backend**: el árbol de decisión que responde "este elemento, ¿en qué planta y en qué sala va?". No te detiene; te orienta. | Guía con criterio, no bloquea. |
| **Skill `catalyst-project-structure` (frontend)** | Los **planos de planta del edificio de frontend**. Mismo papel, otro edificio del mismo complejo. | Guía con criterio, no bloquea. |

El punto clave que hay que interiorizar: **el guardia (el hook) no conoce la normativa al detalle ni sabe leer los planos por ti.** Solo te obliga a parar y consultar. La normativa (HR) define lo prohibido; los planos (skills) te dicen dónde poner las cosas; el guardia (hook) es el que te frena para que no construyas a ciegas. Tres trabajos distintos que se apoyan — no se duplican.

En resumen: la normativa prohíbe, los planos colocan, el guardia frena. Mantén separados esos tres verbos y el resto de la página encaja sola.

## 3. Una ficha por artefacto

Cada ficha de abajo sigue la misma plantilla fija, para que puedas compararlas línea a línea.

### 3.1 Harness Rules (HR)

- **Qué es.** Constraints **arquitectónicas / de framework** codificadas que gobiernan tu trabajo *antes* de escribir código.
- **Para qué sirve.** No son documentación post-hoc ni "memoria opcional" — son constraints que cumples *ahora*, mientras escribes. Su responsabilidad central es enunciar, de forma citable, lo que la arquitectura prohíbe.
- **Qué lo dispara (*trigger*).** (a) citar un ID por su nombre (`HR-MODULES-001`); (b) ir a tocar rutas gobernadas (lookup `byPath` / `byId` / `byKeyword` en el índice); (c) durante `/opsx:propose`, en la sección `## Harness rules applicable`; (d) editar archivos bajo `cliter/harness-rules/`.
- **Cómo se aplica — tres capas de enforcement.**
  - *Prompt-time* (`UserPromptSubmit`): el hook `inject-rules-context.ts` inyecta las top-N reglas activas como bloque aparte, con framing de "constraints, no memoria".
  - *Propose-time* (`/opsx:propose`): `openspec/config.yaml` detecta las reglas aplicables; si el cambio VIOLATE una regla `blocking`, hace HALT hasta resolver.
  - *Write-time* (`PreToolUse`): (a) el checkpoint (ver Artefacto 2) **adjunta los HR-IDs** que gobiernan el path al mensaje de bloqueo; (b) un *content-guard* bloquea si el contenido coincide con un `detect.pattern` de una regla activa. Hoy el único `detect` activo es **`HR-ACL-001`** (patrón `as unknown as`).
- **Dónde vive.** Reglas en `cliter/harness-rules/*.md` (core) y `cliter/<bc>/harness-rules/*.md` (atadas a un bounded context); un índice **generado** en `cliter/harness-rules-index.json` (nunca se edita a mano; se regenera con `pnpm hr:generate`); una skill guía en `.claude/skills/harness-rules-guard/SKILL.md` (más `references/enforcement.md`, `references/format.md`); y un catálogo legible en `docs/harness-rules/README.md`.
- **Ciclo de vida.** Una regla **nace** como decisión arquitectónica deliberada (un `.md` nuevo). Su `### Enunciado` y sus `### Casos exhaustivos` **nunca** se editan in-place: si la semántica cambia, se **deroga** la antigua (estado `derogated`) y se crea una **nueva con nuevo ID** — los IDs no se reutilizan. **No existe** `/harness-rules:promote`: las HR son estables, no se cristalizan por-cambio.
- **A quién va dirigido.** IA (inject en prompt-time, detección en propose-time, bloqueo de contenido en write-time) **y** dev humano (lo lee al citar un `HR-NNN` o al ser bloqueado).
- **Su lugar en la analogía.** El código de edificación. Estable, publicado, citable. Cumples ahora; no se negocia en la puerta.

Estados y severidades: estados `active` / `derogated`; severidad `blocking` / `informational`. Los IDs siguen `HR-<TOPIC>-<NNN>` (por ejemplo `HR-MODULES-001`, `HR-PORTS-001`, `HR-CODEGEN-001`, `HR-ACL-001`, `HR-BRIDGES-001`, `HR-FLOWS-001`, `HR-BARRELS-001`).

**No confundas Harness Rules con Business Rules.** La propia skill de harness-rules marca esta frontera:

| Aspecto | Business Rules | Harness Rules |
| --- | --- | --- |
| Naturaleza | invariantes de **dominio** | constraints de **arquitectura / framework** |
| Framing | **memoria** + post-hoc | una **constraint** que cumples ahora, antes de escribir |
| Verbos | mantiene / deroga / extiende | **COMPLY / VIOLATE / DEROGATE** |
| Ciclo | se cristalizan **tras** `/opsx:archive` vía `/br:promote` | sin promote; cambian solo por decisión arquitectónica deliberada |
| En la propuesta | `## Business rules affected` (declara futuro) | `## Harness rules applicable` (registra cumplimiento de algo ya existente) |

Para el panorama completo del lado Business Rules de esa tabla, mira [Sistema de business rules](../business-rules-overview/).

En resumen: las HR son la ley del codebase — citables, bloqueantes cuando así se marcan, y se cambian solo por derogar-y-reemplazar, nunca por edición silenciosa.

### 3.2 El hook `architecture-checkpoint.ts`

- **Qué es.** Un hook de tipo `PreToolUse` (se ejecuta *antes* de que una herramienta actúe) que **bloquea** (exit code 2, **una sola vez por path por sesión**) el primer `Write` a un archivo **nuevo** dentro de la arquitectura backend, hasta que se haya consultado la estructura del proyecto.
- **Para qué sirve.** Para evitar que tú — humano o IA — crees un archivo nuevo en una zona crítica *sin haber mirado antes los planos*. Hace una sola cosa: fuerza la consulta.
- **Qué lo dispara (*trigger*).** Evento `PreToolUse`, herramienta = `Write`, un archivo **nuevo** (no existe aún en disco) bajo:
  - `backend/src/@(api|app|aurora|bridges)/` → **BLOQUEA**.
  - un test `*.e2e-spec.ts` mal colocado → **BLOQUEA**.
  - `@app/**/shared/functions/*.function.ts` → solo **advisory** (avisa, no bloquea).
- **Cómo se aplica.** `exit(2)` + un mensaje por `stderr` → la llamada a la herramienta se rechaza. **Solo la primera vez** por path: cachea en `.claude/.cache/architecture-checkpoint.txt`. El cache se borra en cada `SessionStart`. **Nunca bloquea por un bug propio**: todo va envuelto en try/catch con failsafe.
- **Qué contiene el mensaje de bloqueo.** (1) la ruta + la clasificación del path; (2) un cuerpo adaptado al tipo detectado (aggregate, hand-written flow, cross-bc, framework, e2e mal colocado, desconocido), **citando secciones concretas de la skill `catalyst-project-structure`**; (3) una sección "Harness rules que gobiernan" con los HR-IDs resueltos vía el índice; (4) una sección de "content violations" si el contenido que se va a escribir coincide con un `detect.pattern` activo.
- **Dónde vive.** `.claude/hooks/architecture-checkpoint.ts`; tests en `.claude/hooks/architecture-checkpoint.test.ts`; configurado en `.claude/settings.json` (las entradas de hook `PreToolUse`).
- **Ciclo de vida.** Casi estático; se actualiza cuando cambian las rutas de arquitectura o se descubren nuevos patrones de path. Su estado (el cache) es por-sesión.
- **A quién va dirigido.** IA (la bloquea y la fuerza a leer la skill) **y** dev humano (lee el mensaje y sigue la guía).
- **Su lugar en la analogía.** El guardia en la entrada de la zona estructural. Es un **NUDGE ciego + clasificador de path + mensajero HR-aware**: no entiende semántica. No distingue `oauth.module.ts` (shadow module, prohibido) de `oauth-utils.ts` (legítimo). Su único trabajo es **frenarte y forzar la consulta** antes de que crees algo nuevo.

En resumen: el hook es una compuerta de una sola vez que bloquea el *primer* write a un archivo arquitectónico nuevo, te entrega los planos y la ley relevante, y luego se aparta — juzga *dónde*, nunca *qué*.

### 3.3 La skill `catalyst-project-structure` del backend

- **Qué es.** Un árbol de decisión más una jerarquía canónica de capas que responde **"¿dónde va este archivo?"** en el backend.
- **Para qué sirve.** Explica cómo viven las capas (`@api`, `@app`, `@aurora`, `@bridges`), la convención de módulos, el patrón `@aurora-catalyst-generated`, el antipatrón **shadow module** y la distinción scaffold-CLI vs archivo editable.
- **Qué lo dispara (*trigger*).** El usuario pregunta "where does X go"; se va a crear un archivo nuevo bajo `backend/src/@(api|app|aurora|bridges)/`; se planifica un módulo / BC / capa nuevos; el hook `architecture-checkpoint` muestra su banner de STOP; auto-invocación al planificar un módulo, controller, handler, service, port, adapter o bridge.
- **Cómo se aplica.** **NO bloquea.** Es guía con criterio, para humano o IA. El hook la **cita** en su mensaje cuando bloquea (por ejemplo, "Skill `catalyst-project-structure` → Decision trees").
- **Dónde vive.** `backend/.claude/skills/catalyst-project-structure/SKILL.md` (versión 3.0).
- **Ciclo de vida.** Versionada junto a la arquitectura backend; crece a medida que se añaden capas, patrones o ramas de decisión nuevos.
- **A quién va dirigido.** IA (auto-invoke, árbol de decisión) **y** dev humano (referencia).
- **Su lugar en la analogía.** Los planos de planta del edificio de backend. Orientan; nunca te detienen en la puerta.

Esta skill **cita HR explícitamente**: menciona `HR-PORTS-001` en su árbol de decisión (la "upward inversion `@aurora → @app` está prohibida por `HR-PORTS-001`"). También describe el antipatrón shadow module y cuándo un `.module.ts` hand-written *sí* está justificado (un dedicated flow module dentro del BC, no paralelo). Pero citar no es enforçar — la skill informa; el enforcement real de `HR-PORTS-001` llega por el índice HR en `/opsx:propose`.

En resumen: el plano de backend te dice dónde van las cosas y te avisa de las leyes cercanas, pero no tiene poder para detenerte — ese poder es del hook y de las HR.

### 3.4 La skill `catalyst-project-structure` del frontend

- **Qué es.** La estructura del proyecto, la organización de carpetas y las reglas de ubicación de archivos para el frontend Angular (domains, bounded contexts, layouts, modules, routing).
- **Para qué sirve.** Responder "where is X" / "where should I put X" para features de frontend.
- **Qué lo dispara (*trigger*).** "where is X" / "where should I put X"; planificar dónde viven los archivos de un feature nuevo; crear un bounded context nuevo; entender qué archivos modificar.
- **Cómo se aplica.** **Informativa, no bloquea.** **No tiene hook asociado** (a diferencia del backend).
- **Dónde vive.** `frontend/.claude/skills/catalyst-project-structure/SKILL.md` (versión 1.0).
- **Ciclo de vida.** Versionada junto a la arquitectura frontend.
- **A quién va dirigido.** IA (navegación + planificación) **y** dev humano (referencia).
- **Su lugar en la analogía.** Los planos de planta del edificio de frontend — el mismo papel que la skill de backend, en otro edificio del mismo complejo.

Esta skill **no cita HR ni ningún otro artefacto de gobernanza**: es una skill de dominio puro (layout DDD). No hay guardia en la puerta de este edificio, así que nada fuerza la consulta — la lees porque ayuda, no porque te bloquee.

En resumen: mismo papel de plano que la skill de backend, pero autónoma — ningún hook la antecede y ninguna HR la referencia.

## 4. Tabla comparativa maestra

| | **Harness Rules** | **Hook `architecture-checkpoint`** | **`catalyst-project-structure` (backend)** | **`catalyst-project-structure` (frontend)** |
| --- | --- | --- | --- | --- |
| **Qué es** | Constraints arquitectónicas codificadas | Compuerta `PreToolUse` sobre archivos arquitectónicos nuevos | Árbol de decisión "dónde va este archivo" (backend) | Árbol de decisión "dónde va este archivo" (frontend) |
| **Para qué sirve** | Enunciar lo prohibido, de forma citable | Forzar una consulta de estructura antes del primer write | Orientar la ubicación de archivos por las capas de backend | Orientar la ubicación de archivos por las capas de frontend |
| **Trigger** | Citar un ID, tocar un path gobernado, `/opsx:propose`, editar un archivo de regla | `PreToolUse` + `Write` + archivo nuevo bajo paths de arquitectura backend | "where does X go", archivo nuevo de backend, banner STOP del hook | "where is X", feature/BC nuevo de frontend |
| **¿Bloquea?** | **Sí** (cuando es `blocking`) | **Sí** (una vez por path por sesión) | No — aconseja | No — aconseja |
| **¿Automático o se lee?** | Automático (3 capas) + lo lee un humano | Automático | Lo lee humano/IA | Lo lee humano/IA |
| **Dónde vive** | `cliter/**` (+ `docs/`, skill guía en `.claude/`) | `.claude/hooks/` | `backend/.claude/skills/` | `frontend/.claude/skills/` |
| **Ciclo de vida** | Nace como decisión; derogar + nuevo ID, nunca editar in-place | Casi estático; cache por-sesión | Versionada con backend (v3.0) | Versionada con frontend (v1.0) |
| **Audiencia** | IA + humano | IA + humano | IA + humano | IA + humano |
| **¿Cita HR?** | (es HR) | Sí — adjunta HR-IDs | Sí — `HR-PORTS-001` | No |
| **En la analogía** | Código de edificación | Guardia en la puerta | Planos de backend | Planos de frontend |

Fíjate en la única columna que más importa: solo los dos primeros artefactos tienen **Sí** en la fila *¿Bloquea?*. Esa única línea es la columna vertebral de toda la página.

En resumen: lee primero las filas *¿Bloquea?* y *Dónde vive* — separan a los dos que enforçan (ley en `cliter/`, compuerta en `.claude/`) de los dos que aconsejan (planos en `.claude/`).

## 5. ⭐ Zonas de solapamiento

Aquí está el verdadero valor de la página. Cada pareja de abajo comparte un *tema* pero no una *responsabilidad*. Por cada solape: qué comparten, dónde **no** se pisan y cómo conviven. Después de cada uno, pregúntate quién es el dueño *real* — el lector debe poder decir siempre a quién "echarle la culpa".

### 5.1 `HR-MODULES-001` ↔ el hook (dependencia directa)

`HR-MODULES-001` ("Shadow Module Antipattern") nombra explícitamente al hook como guard *ya existente* en sus "anchor patterns". El hook, a su vez, resuelve y adjunta `HR-MODULES-001` al mensaje cuando se crea un archivo nuevo en zona de BC. **Pero el hook es ciego**: no puede distinguir el shadow module del código legítimo; su papel es meter a la IA *en la skill primero*.

Dueño real: la HR **confía** en que el hook + skill eviten el caso en write-time. La HR por sí sola no bloquea la creación de un shadow module — es la *constraint*, no la compuerta.

### 5.2 El hook ↔ la skill backend `catalyst-project-structure` (acoplamiento de comportamiento)

El hook es el **dispatcher** ("ve a leer la skill"); la skill es el **proveedor del árbol de decisión** ("aquí va el archivo"). La propia skill documenta que el hook bloquea el primer write hasta que se la consulta. Ninguno de los dos *posee* el enforcement — son co-dependientes para la experiencia.

Dueño real: el hook posee *frenarte*; la skill posee *decirte dónde*. La experiencia solo funciona porque ambos están presentes.

### 5.3 La skill backend ↔ `HR-PORTS-001` (cita concreta)

La skill *menciona* la regla ("esto violaría `HR-PORTS-001`") pero **no la enforça** — solo informa. El enforcement real llega por el índice HR en `/opsx:propose`.

Dueño real: `HR-PORTS-001` (vía el índice, en propose-time) posee el enforcement. La skill es un cartel que señala la ley, no la ley.

### 5.4 `HR-CODEGEN-001` ↔ la skill backend (semántica compartida, sin cita directa)

Ambos explican lo mismo: los archivos `@aurora-catalyst-generated` **son editables** y `.origin` los reconcilia en cada regeneración. La HR lo expresa como regla para auditar / proponer; la skill como árbol de decisión operativo.

Dueño real: repartido por propósito. La HR posee la verdad de *auditar/proponer*; la skill posee la verdad del *día a día de ubicación*. Mismo hecho, dos superficies.

### 5.5 `HR-MODULES-001` ↔ la skill backend (mismo antipatrón, distinto framing)

La skill describe exactamente el antipatrón shadow module (síntoma, acción correcta y cuándo un flow module *sí* es válido) sin citar la regla. La HR dice "es un constraint; si lo violas, la auditoría lo detecta"; la skill dice "es un árbol de decisión; si lo haces mal, el hook te detiene".

Dueño real: repartido por momento. La HR posee la captura de *auditoría* (a posteriori); la skill + hook poseen la captura de *write-time* (antes del hecho).

### 5.6 El índice HR `byPath` ↔ la clasificación de path del hook (mismo espacio, propósitos disjuntos)

Ambos hacen *path-matching* con globs. El hook pregunta "¿es esto un archivo NUEVO en zona arquitectónica?" (binario: bloquea o no). El índice HR pregunta "¿qué constraints rigen este path?" (un conjunto de reglas activas). Mismo terreno, semántica distinta.

Dueño real: repartido por pregunta. El hook posee la decisión *archivo-nuevo-o-no*; el índice posee el lookup *qué-reglas-aplican*. Da la casualidad de que recorren los mismos globs.

### 5.7 Las content violations del hook ↔ el campo `detect` de las HR (`HR-ACL-001`)

El hook lee el campo `detect` de las reglas que gobiernan el path y, si el contenido coincide, lo añade como violación. Hoy el único `detect` activo es `HR-ACL-001` (`as unknown as`). El hook alimenta el *content-guard*, que comparte el mismo índice `detect`.

Dueño real: la HR posee el *patrón* (`detect`); el hook es un *lector* de él en write-time.

### El marco de las tres capas de enforcement

Da un paso atrás y la imagen se aclara: las HR enforçan a través de **tres capas independientes**.

```
PROMPT-TIME   →   PROPOSE-TIME   →   WRITE-TIME
inject-rules-     openspec/          architecture-checkpoint.ts
context.ts        config.yaml        + content-guard
```

El hook es **una pieza** (capa 3) de un sistema de tres capas. Las otras dos son independientes de él. Así que cuando el hook no hace nada — porque estás editando un archivo existente, o no estás en un path arquitectónico de backend — las HR siguen enforzadas en prompt-time y en propose-time. El hook no es la ley; es uno de los tres momentos de enforcement de la ley.

En resumen: cada solape comparte un tema, nunca una responsabilidad — nombra al dueño real cada vez y los cuatro artefactos dejan de parecer redundantes.

## 6. El flujo típico, paso a paso

Esto es lo que pasa cuando un dev o una IA intenta `Write` a un archivo nuevo en `backend/src/@api/oauth/flows/oauth.controller.ts`:

1. `architecture-checkpoint.ts` intercepta (es un hook `PreToolUse`).
2. Confirma que el archivo es nuevo → clasifica el path → busca los HR-IDs que lo gobiernan en el índice → busca content violations → construye un mensaje adaptado al tipo → **adjunta los HR-IDs** → cachea el path → `exit(2)`.
3. La IA lee el mensaje → ve "Skill `catalyst-project-structure` → …" → abre la skill → aplica el árbol de decisión → reintenta el `Write`.
4. En el reintento al **mismo path**: el hook ve el path ya cacheado → `exit(0)` en silencio → el `Write` procede.
5. Más tarde, en `/opsx:propose` para ese código: el motor carga el índice HR, hace `byPath` sobre los archivos tocados, declara `## Harness rules applicable` y juzga COMPLY / VIOLATE / DEROGATE por regla. Si VIOLATE una regla `blocking` → HALT hasta resolver.

Lee esa cadena contra la analogía: el guardia te para en la puerta (paso 1–2), te entrega los planos y señala el código de edificación (paso 2–3), te deja pasar una vez has consultado (paso 4), y solo más tarde el arquitecto revisa formalmente tu trabajo contra la normativa en la mesa de propuestas (paso 5).

En resumen: primero el hook (compuerta en write-time), luego la skill (ubicación), y al final y más fuerte las HR (juicio en propose-time) — tres momentos, no un muro.

## 7. Heurísticas rápidas — "¿cuál me aplica ahora?"

Lleva esta chuleta en la cabeza. Cuando cualquiera de estos te salte, pásale las preguntas:

- **¿Me bloquea o me aconseja?** Si recibiste `exit(2)` y tu llamada a la herramienta fue rechazada → fue el **hook** (o una HR `blocking` en propose-time). Si solo te señalaron una sección para leer → fue una **skill**. Bloquear es exclusivo del hook y de las HR; las skills solo orientan.
- **¿Vive en `cliter/` o en `.claude/`?** `cliter/` = el dominio/arquitectura del proyecto → **Harness Rules**. `.claude/` = la instrumentación del harness de la IA → el **hook** y las **skills**. Esta pista física por sí sola te dice si miras una ley o un tooling.
- **¿Esto lo decide un arquitecto o me orienta a mí?** Si cambiarlo exige derogar y republicar con un nuevo ID → **Harness Rule** (decide un arquitecto). Si es un árbol de decisión que lees y aplicas → **skill** (te orienta).
- **¿Estoy creando un archivo nuevo o editando uno existente?** El hook solo salta con archivos **nuevos** bajo paths arquitectónicos de backend. Editar un archivo existente nunca dispara el hook (aunque las HR siguen aplicando en prompt-time y propose-time).
- **¿Backend o frontend?** Ambos tienen una skill `catalyst-project-structure`, pero solo la de backend tiene un hook delante y referencia HR. La skill de frontend es autónoma.

En resumen: *bloquea vs aconseja*, `cliter/` vs `.claude/`, *lo-decide-un-arquitecto vs me-orienta* — tres preguntas, y siempre sabes qué artefacto te está hablando.

## 8. Glosario

- **hook** — un script que el harness de la IA ejecuta automáticamente ante un evento concreto (aquí, antes de que una herramienta actúe). Puede bloquear saliendo con un código distinto de cero.
- **skill** — un documento Markdown (`SKILL.md`) que la IA consulta como guía para una tarea. Informa; no bloquea.
- **harness rule (HR)** — una constraint arquitectónica/de framework codificada, citable por ID (`HR-<TOPIC>-<NNN>`), que cumples antes de escribir código.
- **business rule (BR)** — un invariante de dominio documentado, citable por ID (`BR-<BC>-<AGG>-<NNN>`), cristalizado *tras* la implementación. Distinta de una HR — mira la tabla en §3.1.
- **trigger** — la condición que activa un artefacto (un evento, un match de path, un ID citado, un slash command).
- **enforce** — hacer que una constraint muerda de verdad: bloquear una llamada a herramienta, hacer halt a una propuesta o fallar un check. Citar una regla *no* es enforçarla.
- **blocking** — una severidad/comportamiento donde violar la constraint detiene la acción (el `exit(2)` del hook, el HALT de una HR `blocking` en propose-time).
- **`.origin`** — el archivo que Aurora escribe para reconciliar un archivo generado con las ediciones del usuario en cada regeneración (el corazón de `HR-CODEGEN-001`).
- **`@aurora-catalyst-generated`** — el marcador en archivos generados que señala que son *editables* y se reconcilian vía `.origin` — no son de solo lectura.
- **drift** — cuando dos cosas que deberían mantenerse sincronizadas divergen (por ejemplo, documentación que ya no coincide con el código real).
- **shadow module** — el antipatrón que nombra `HR-MODULES-001`: un `.module.ts` hand-written que ensombrece o corre en paralelo a la estructura de módulos generada en vez de encajar dentro de ella.
- **`PreToolUse`** — el evento del harness que salta *antes* de que una herramienta (como `Write`) se ejecute; el momento en que el hook `architecture-checkpoint` tiene su oportunidad de bloquear.
