---
title: Ciclo de vida del harness
description: Los cinco puntos de una sesión de Claude Code en los que el harness de Aurora ejecuta algo — qué se dispara, en qué orden, con qué timeout y qué puede hacer cada uno.
---

La capa determinista del harness está conectada a exactamente cinco momentos de la sesión. Todos se declaran en `.claude/settings.json` y los ejecuta Claude Code: el asistente no interviene en ello.

Conocer esos cinco puntos es lo que convierte «el harness hace cosas» en un modelo sobre el que puedes razonar. Esta página los recorre en orden.

## Los cinco puntos de disparo

| # | Punto de disparo | Cuándo se dispara | ¿Puede bloquear? |
| --- | --- | --- | --- |
| 1 | `SessionStart` | una vez, al arrancar la sesión | no |
| 2 | `InstructionsLoaded` | una vez por fichero de instrucciones cargado | no |
| 3 | `UserPromptSubmit` | en cada prompt que envías | sí |
| 4 | `PreToolUse` | antes de ejecutarse una herramienta que casa | sí |
| 5 | `PostToolUse` | después de completarse una herramienta que casa | sí |

## 1. `SessionStart` — preparar el terreno

Aquí se disparan dos entradas distintas, separadas por su matcher.

Bajo el matcher `startup` corren cuatro comandos en orden de declaración:

| Orden | Comando | Timeout | Qué hace |
| --- | --- | --- | --- |
| 1 | `generate-skills-index.ts` | 30 s | escanea todos los `.claude/` del repositorio y reescribe el bloque `[Project Skills Index]` dentro de cada `CLAUDE.md` |
| 2 | `daily-tip.sh` | 5 s | muestra un consejo de una lista rotatoria |
| 3 | `catalyst-dev-mode.sh` | 5 s | inyecta el modo de desarrollo activo, Framework o Solution |
| 4 | `check-required-plugins.ts` | 15 s | verifica que los plugins requeridos estén instalados **y** habilitados |

El primero merece una pausa. El índice de skills no se escribe a mano: se regenera en cada arranque a partir de lo que hay en disco. Por eso el índice no puede desincronizarse de la realidad — y por eso también editarlo a mano no sirve de nada.

Bajo el matcher `startup|clear`, un quinto comando limpia `.claude/.cache/`. Ese directorio guarda estado de sesión, y empezar de cero —o limpiar la conversación— tiene que empezar con él vacío.

`check-required-plugins` lee el estado *combinado* en tiempo de ejecución a través del CLI de Claude Code, y no los ficheros de configuración, porque un `false` a nivel de usuario pisa un `true` a nivel de proyecto y solo la vista combinada lo refleja. Nunca bloquea: informa y sigue.

## 2. `InstructionsLoaded` — observar qué se cargó

Se dispara una vez por cada fichero de instrucciones que carga el harness, con un `load_reason` que explica el motivo:

| `load_reason` | Significado |
| --- | --- |
| `session_start` | se cargó porque empezó la sesión |
| `nested_traversal` | un `CLAUDE.md` de ámbito se cargó al leerse un fichero bajo su directorio |
| `path_glob_match` | una rule se cargó porque un fichero casó con sus globs `paths:` |
| `include` | lo arrastró otro fichero de instrucciones |
| `compact` | se recargó tras una compactación de la conversación |

El hook conectado aquí, `instructions-loaded-log.ts`, añade una línea por carga a `.claude/.cache/instructions-loaded.log`. Es de **solo notificación**: no puede bloquear la carga ni inyectar contexto. Su salida y su código de salida se ignoran.

Existe como instrumento. Las rules por ruta son un mecanismo, no una promesa: sin un registro de lo que se disparó, «la rule está configurada» se convierte en silencio en «la rule funciona», y nadie puede distinguir una cosa de la otra.

### Por qué existen las rules por ruta

Este punto de disparo explica una decisión de diseño que, si no, parece duplicación.

Un `CLAUDE.md` de ámbito —pongamos `backend/CLAUDE.md`— se carga por `nested_traversal` al leerse un fichero bajo `backend/`. Pero **no se re-inyecta tras una compactación**. Una rule por ruta es distinta: se re-evalúa en cada lectura posterior que case con sus globs.

Por eso las rules `scope-*` enrutan hacia el `CLAUDE.md` de ámbito en vez de duplicar su contenido. La rule sobrevive a la compactación y apunta a la tabla canónica; copiar esa tabla dentro de la rule crearía una segunda fuente de verdad que acabaría desincronizándose.

## 3. `UserPromptSubmit` — armar el prompt

`inject-rules-context.ts` (15 s) corre en cada prompt que envías. Lee tu prompt, lo cruza con los índices de los catálogos de business rules y harness rules, e inyecta las reglas relevantes en el contexto antes de que el asistente vea tu mensaje.

Los presupuestos son deliberadamente separados: hasta **3 business rules** y hasta **3 harness rules**, con un máximo de 4000 caracteres de cuerpo por regla. La separación importa: las harness rules son restricciones y las business rules son memoria de dominio, y dejarlas competir por las mismas tres plazas haría que un prompt cargado de dominio dejara sin sitio, en silencio, a las restricciones arquitectónicas.

Todo lo que se escriba en la salida estándar en este punto se inyecta por delante del prompt.

## 4. `PreToolUse` — el instante antes de escribir

Aquí hay dos hooks conectados, con matchers distintos y caracteres muy distintos.

**`architecture-checkpoint.ts`** (matcher `Write`, 15 s) se dispara cuando va a crearse un fichero *nuevo* en una ubicación arquitectónicamente significativa: las capas del backend, un test de aceptación mal ubicado, un módulo de bounded context en el frontend, la UI de Spartan vendorizada o la capa de framework del frontend. Saca a la superficie la clasificación de la ruta, la skill de estructura que aplica y las reglas que la gobiernan.

Bloquea exactamente una vez por ruta y por sesión — y es un **aviso, no un gate**. En [niveles de enforcement](../enforcement/) está por qué esa distinción no es un tecnicismo.

**`harness-rules-content-guard.ts`** (matcher `Write|Edit|MultiEdit`, 15 s) sí es el bloqueo de verdad. Lee el índice de harness rules y, para cada regla activa que declare un patrón de detección, comprueba si el contenido entrante lo contiene *y* si el fichero destino cae bajo las rutas que esa regla gobierna. Si se cumplen las dos cosas, la escritura se bloquea y se muestra el mensaje de la regla.

No conoce ninguna regla a mano. Añadir una regla mecánica es editar el catálogo, nunca el hook.

## 5. `PostToolUse` — recoger después de escribir

Los dos hooks de aquí comparten el matcher `Write|Edit|MultiEdit` y corren con el fichero ya en disco.

**`format-with-prettier.ts`** (30 s) formatea lo que se acaba de escribir, pero solo bajo `backend/` y `frontend/`, y solo para extensiones de código. La restricción es deliberada: esos son los workspaces donde Prettier resuelve su binario y sus plugins, y el resto del repositorio guarda catálogos y Markdown que no deben reformatearse. Si Prettier falla —por ejemplo con sintaxis inválida a mitad de un refactor— el hook sale limpiamente y el flujo continúa.

**`lint-barrels.ts`** (30 s) linta los imports del fichero recién escrito contra las reglas de barrels. Una informa y la otra bloquea. Corre aquí, y no solo en el commit, porque una comprobación de pre-commit trabaja por lotes mucho después de tomada la decisión; esto cierra el ciclo sobre la edición concreta.

## La status line no es un punto de disparo

`status-line.sh` se configura aparte, fuera del bloque `hooks`. Se re-renderiza continuamente para mostrar el estado de la sesión, incluido el modo de desarrollo activo. No está atada a ningún evento del ciclo de vida, y por eso no aparece entre los cinco.

En resumen: un punto prepara la sesión, otro observa qué se cargó, otro arma cada prompt, otro vigila la escritura y otro recoge después. Todo lo que el harness hace mecánicamente ocurre en uno de esos cinco momentos.
