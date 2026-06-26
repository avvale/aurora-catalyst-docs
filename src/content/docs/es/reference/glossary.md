---
title: "Glosario"
description: "Términos técnicos que aparecen en la documentación y en las conversaciones de Aurora Catalyst, con definiciones concisas."
---

Este glosario reúne los términos técnicos que se repiten en la documentación de Aurora Catalyst y en las conversaciones de ingeniería. Está **orientado a la información**: definiciones cortas y consultables, ordenadas alfabéticamente.

## ack

Es la abreviatura de *acknowledgment* — "acuse de recibo". Es la señal que tu sistema le devuelve a la cola para decirle: "este mensaje lo he recibido y me hago cargo, ya puedes borrarlo".

## ACL

Puede significar *Anti-Corruption Layer* ("capa anticorrupción"). Es un término de DDD (Domain-Driven Design), acuñado por Eric Evans: una capa de traducción que protege tu modelo de dominio del modelo de otro sistema, para que los conceptos ajenos no se filtren y corrompan el tuyo.

## AI slop

Es contenido digital de baja calidad generado masivamente con inteligencia artificial.

## BFF

*Backend-For-Frontend*. Es un patrón en el que cada frontend tiene su propio backend dedicado que actúa de intermediario entre ese frontend y los servicios/APIs de detrás. El frontend no habla directamente con el hub (ni con otros servicios): habla solo con su BFF, y el BFF orquesta/proxea hacia el resto server-side.

## Caveats

Advertencias o salvedades: condiciones o limitaciones que hay que tener en cuenta antes de dar algo por bueno.

## Coalesced

Viene del verbo inglés *to coalesce*: fusionar varias cosas en una sola. En nuestro contexto significa agrupar varias peticiones en una única llamada.

## Coalescing

"Fusionar" o "agrupar en uno": colapsar varias operaciones pendientes que llevan al mismo resultado en una sola, para no hacer el trabajo repetido.

## Drift

Desincronización progresiva entre dos cosas que deberían estar alineadas, cuando una evoluciona y la otra se queda atrás.

## DRY

Son las siglas de *Don't Repeat Yourself* ("No te repitas") — un principio de diseño de software que dice que cada pieza de conocimiento debe tener una única fuente de verdad en el sistema, sin duplicarse.

## Enforcement

Hacer cumplir una regla por la fuerza — un mecanismo que la impone, no que solo la sugiere.

## Failsafe

"A prueba de fallos": un diseño en el que, si algo va mal, el sistema cae automáticamente en el estado seguro en lugar de en el peligroso.

## Fan-out

Abrir/abanicar en paralelo: lanzar varias tareas a la vez desde un único punto, en lugar de hacerlas una tras otra.

## Gate

Bloquea de verdad. No pasas hasta cumplir la condición. Verifica y, si no se cumple, deniega.

## Idempotencia

Es la propiedad de una operación que puedes ejecutar muchas veces y el resultado es el mismo que si la ejecutaras una sola vez. Repetirla no causa daño ni efectos adicionales.

## Lift-and-shift

"Levantar y mover": migrar algo tal cual, sin rediseñarlo — coges el código (o un sistema entero) de un sitio y lo dejas caer en otro sin adaptarlo a su nuevo entorno.

## Nudge

Solo te recuerda, avisa o pone una pequeña fricción. Si insistes, pasas igual. No comprueba que realmente hiciste lo correcto.

## Obliterar

(de la API de BullMQ, `obliterate`) es **destruir una cola por completo en Redis** — la acción más destructiva del gestor de colas.

A diferencia de otras operaciones:

- **vaciar** (`empty`/`drain`): quita los jobs en espera/retrasados, pero la cola sigue viva.
- **limpiar** (`clean`): borra jobs de un estado concreto (completados, fallidos…), la cola sigue viva.
- **obliterar** (`obliterate`): **borra TODAS las claves de la cola** — todos los jobs (cualquier estado), su histórico, contadores y los propios metadatos de la cola. No queda nada; es como si la cola nunca hubiera existido.

El equivalente mental en SQL no es `TRUNCATE` (que conserva la tabla vacía) sino **`DROP`** (la elimina entera).

Por su severidad, en el diseño tiene dos salvaguardas: requiere el permiso de mayor nivel **`queue-manager.destroy`**, y la cola debe estar **pausada** antes (validado server-side por el guard *obliterate-paused* y confirmado en la UI con un diálogo).

En resumen: obliterar = **arrasar la cola entera** de Redis, irreversible, y por eso la operación más protegida del panel.

## Ortogonal

Viene de la geometría: dos líneas ortogonales son perpendiculares, forman 90 grados. La propiedad clave es que moverse a lo largo de una no te mueve nada a lo largo de la otra. Son ejes independientes: puedes cambiar tu posición en el eje X sin afectar tu posición en el eje Y.

En ingeniería de software usamos la palabra para decir que dos dimensiones de un problema son independientes entre sí: conocer el valor de una no te dice nada sobre el valor de la otra, y cambiar una no arrastra a la otra.

## Self-healing

"Que se cura solo". Es la propiedad de un proceso que, aunque arranque en un estado incompleto o incorrecto, converge al estado correcto por sí mismo en ejecuciones posteriores, sin intervención manual.

## Snowflake

Es una metáfora de la jerga de ingeniería: un componente único, hecho a mano, distinto de todos los demás — como un copo de nieve, del que se dice que no hay dos iguales.
