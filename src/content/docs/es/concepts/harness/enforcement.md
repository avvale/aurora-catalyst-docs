---
title: Niveles de enforcement
description: Por qué algunos hooks del harness bloquean una escritura, la mayoría solo avisa y ninguno puede romperte la sesión — más el diseño dirigido por catálogo que mantiene las reglas fuera del código de los hooks.
---

No todos los hooks del harness tienen la misma autoridad. Unos detienen una escritura, otros dejan una nota, y hay uno que bloquea de una forma que deliberadamente no detiene nada. Distinguirlos es lo que hace que el harness sea predecible en vez de misterioso.

## Los tres niveles

| Nivel | Qué hace | Dónde se usa |
| --- | --- | --- |
| **Bloqueo** | rechaza la acción y muestra el motivo | una violación que rompe la integridad arquitectónica |
| **Aviso** | interrumpe una vez para entregar contexto y luego deja pasar | crear un fichero en una ubicación con convenciones que conviene conocer |
| **Informativo** | actúa o informa sin interrumpir jamás | formateo, comprobaciones de arranque, diagnóstico |

Un hook señala esto con su código de salida. Salir con `0` deja pasar la acción. Salir con `2` la bloquea y muestra el mensaje al asistente. Los hooks que responden con salida estructurada también pueden devolver una decisión de bloqueo explícita.

## Por qué un aviso bloquea y aun así no es un gate

`architecture-checkpoint` sale con `2`. Mecánicamente eso es un bloqueo. Conceptualmente no lo es, y la propia documentación del hook es tajante al respecto.

La razón está en el orden de dos operaciones: **la ruta se cachea antes de emitir el bloqueo**. Así que un reintento idéntico sobre la misma ruta la encuentra ya registrada y pasa — sin que se haya verificado nada por el camino.

No es un fallo, es el objetivo. En ese instante no existe ninguna señal de verificación disponible. Lo que sí puede hacer el hook es garantizar que, justo cuando va a aparecer un fichero arquitectónico nuevo, el contexto estructural de esa ubicación llegue al asistente: a qué capa pertenece, qué skill de estructura la cubre, qué reglas la gobiernan. Una vez entregado ese contexto, insistir solo añadiría fricción sin añadir corrección.

La distinción importa en la práctica: **no cuentes con este hook para impedir nada**. El enforcement mecánico de verdad vive en el content guard y en la comprobación del catálogo que puedes lanzar sobre el árbol de trabajo.

## Por qué casi nada bloquea

La regla del proyecto es **enforcement proporcional al daño**. El bloqueo mecánico se reserva para reglas cuya violación compromete de verdad la integridad arquitectónica. Las convenciones de colocación y las preferencias de estilo se enrutan a una skill y, como mucho, a un aviso.

El razonamiento va de atención, no de indulgencia. Un guardián que salta ante cualquier error plausible entrena a la gente a descartarlo sin leerlo. Mantener el bloqueo raro es lo que lo hace informativo cuando ocurre.

## El contrato fail-open

Todos los hooks del harness degradan a «no hacer nada» cuando fallan por su cuenta. Entrada malformada, un catálogo ausente, un índice ilegible, una excepción inesperada: nada de eso se convierte en un error del que tengas que ocuparte.

La implementación varía. La mayoría envuelve todo su cuerpo en un único manejador que sale con `0`. `architecture-checkpoint`, en cambio, protege por separado cada paso arriesgado —leer su entrada, parsearla, consultar las reglas que gobiernan la ruta— de modo que un fallo en cualquiera de ellos sale limpiamente sin alterar la decisión estructural. La garantía es la misma; solo cambia el mecanismo.

Es una inversión deliberada del instinto habitual. Un guardián que fallara cerrado convertiría cualquier tropiezo de infraestructura en una sesión bloqueada; el harness pasaría a ser lo que se interpone entre tú y tu trabajo. Fallar abierto significa que un hook roto te cuesta su protección, nunca tu sesión.

De ahí salen dos consecuencias, y conviene interiorizar las dos:

- **La ausencia de bloqueo no demuestra cumplimiento.** Si falta el catálogo, el guardián degrada en silencio a cero enforcement.
- **La comprobación exhaustiva es un paso aparte.** El guardián en tiempo de escritura atrapa el caso común en el momento en que ocurre; lanzar la comprobación del catálogo sobre el árbol de trabajo es lo que cubre el resto.

## Qué no puede ver el guardián de escritura

El content guard solo observa las herramientas de edición del asistente, y solo el texto *entrante*. Tres cosas se le escapan por construcción:

- contenido escrito a través de un comando de shell, como un heredoc o una ejecución del generador;
- una violación que ya existe en disco y simplemente se mueve a una ruta gobernada;
- cualquier cosa fuera de las rutas que gobierna la regla en cuestión.

Conocer los puntos ciegos es parte de usar bien la herramienta. El guardián es una red rápida en el punto de escritura, no una auditoría.

## Las reglas viven en el catálogo, no en el hook

El content guard no contiene ninguna regla. Lee el índice de harness rules, recorre las entradas y actúa solo sobre las reglas activas *y* que declaren un bloque de detección: un patrón literal que buscar y las rutas donde importa.

Esto tiene una consecuencia práctica directa: **añadir una regla mecánica es editar el catálogo**. Escribes el documento de la regla, declaras su bloque de detección, regeneras el índice y el guardián la recoge. Nadie edita código de hooks para añadir una regla, y nadie tiene que revisar código de hooks para auditar qué reglas se aplican.

También explica por qué el propio fichero fuente del guardián puede mencionar un patrón prohibido sin autobloquearse: el código de los hooks vive fuera de las rutas que gobierna cualquier regla.

## Cómo leer la autoridad de un hook

Cuando quieras saber qué puede hacerte un hook concreto, tres preguntas lo resuelven:

1. **¿En qué punto de disparo está?** Solo `UserPromptSubmit`, `PreToolUse` y `PostToolUse` pueden bloquear.
2. **¿Sale con 2, o devuelve una decisión de bloqueo?** Ahí está la diferencia entre informativo y enforcing.
3. **¿Cachea antes de bloquear?** Ahí está la diferencia entre un gate y un aviso.

El [inventario de referencia](../../../reference/harness/) responde las tres para cada hook.

En resumen: un bloqueo real, un aviso que bloquea una vez y se aparta, y una mayoría que no interrumpe nunca — con un contrato fail-open por debajo que garantiza que el harness puede perder sus propias protecciones, pero nunca llevarse tu sesión por delante.
