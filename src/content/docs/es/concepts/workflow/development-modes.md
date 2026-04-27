---
title: Modos de desarrollo
description: Modo Framework vs modo Solution — dos mentalidades explícitas para trabajar en un scaffold de Aurora con Claude Code, y el comando `/dev-mode` que alterna entre ellas.
---

## Por qué existe

En un mismo repositorio de Aurora conviven dos tipos de trabajo muy distintos. A veces **extraes un patrón** — escribes un composable, agregas una skill o generalizas un helper para que la próxima feature (o la próxima sesión de IA) lo herede sin coste. Otras veces **consumes el framework** — entregas un requisito concreto con piezas que ya existen y gana el camino más corto.

Sin una señal explícita, ambos modos se confunden. La IA tiende a sobreingeniar el trabajo de feature — "déjame extraer esto por si más adelante lo necesitamos" — cuando la tarea era simplemente entregar un formulario. En la dirección contraria, cuando sí estás construyendo cimientos, el reflejo de "camino más corto" produce código desechable que nunca llega a `@aurora/` y nunca queda documentado.

Aurora resuelve esto con dos modos declarados y un comando para alternarlos. El modo se ve en la statusline de Claude Code, se persiste por proyecto y cambia cómo razona cada skill y cada agent que corre por debajo.

## Los dos modos

### Modo Framework

**Mentalidad**: "¿quién más podría necesitar esto?" Estás produciendo algo para que otros desarrolladores — u otras sesiones de IA — lo consuman.

| Aspecto                 | Qué espera el modo Framework                                                                        |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| Forma del código        | Generalizar. Extraer composables, componentes compartidos y utilidades hacia los paquetes `@aurora/`. |
| Alcance                 | Planear usos futuros aunque la tarea actual no los necesite — salvo que el coste sea alto.            |
| Skills y patrones       | Crear o actualizar skills para que el patrón sea recuperable en sesiones posteriores.               |
| Arquitectura            | Introducir nuevas capas, abstracciones o convenciones cuando el patrón lo demande.                  |
| Trade-off               | Claridad y reusabilidad por encima de velocidad.                                                    |
| Público de tu código    | Otros desarrolladores, otras sesiones de IA, tú mismo dentro de seis meses.                         |

### Modo Solution

**Mentalidad**: "¿cuál es el camino más corto?" Estás entregando un requisito contra la arquitectura que ya existe.

| Aspecto                 | Qué espera el modo Solution                                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Forma del código        | Consumir, no construir. Reutilizar composables, componentes y utilidades de `@aurora/`.                                                  |
| Alcance                 | El requisito que tienes delante. Nada de andamiaje para necesidades imaginarias.                                                       |
| CLI primero             | Recurrir a `catalyst load`, `catalyst add`, etc. antes de escribir a mano. El código manual es el último recurso.                      |
| Arquitectura            | Quedarte dentro de la arquitectura actual. Introducir estructura nueva solo cuando el requisito no encaje en nada que ya exista.       |
| Trade-off               | Velocidad de entrega por encima de flexibilidad futura.                                                                                |
| Público de tu código    | La feature en sí. Sigue los patrones documentados en las skills — no inventes nuevos.                                                  |

## Cambiar de modo con `/dev-mode`

Alternas el modo con el slash command `/dev-mode` dentro de Claude Code:

```text
/dev-mode framework    # cambiar a modo Framework
/dev-mode solution     # cambiar a modo Solution
/dev-mode              # reportar el modo actual sin cambiarlo
```

El argumento no distingue mayúsculas, y cualquier valor que no sea `framework` o `solution` se trata como vacío — el comando simplemente reporta el modo actual.

Cuando pasas un valor válido, Claude escribe la palabra normalizada (`Framework` o `Solution`) en `.aurora-dev-mode` en la raíz del proyecto y confirma el cambio con un mensaje de una línea. Ese archivo es la única fuente de verdad; la statusline lo lee y las skills que adaptan su comportamiento según el modo también lo leen.

:::note
`.aurora-dev-mode` vive **en la raíz del proyecto**, no en tu home. Está acotado por repositorio de Aurora, así que dos repos abiertos en paralelo pueden estar en modos distintos sin interferir.
:::

## Qué cambia entre modos

Los modos no son un mecanismo de enforcement — son **intención declarada**. Afectan tres cosas.

1. **Qué hace la IA por defecto.** Las skills y agents que aplican a backend y frontend leen el modo actual y prefieren el comportamiento correspondiente. En modo Framework proponen extracciones y actualizaciones de skills; en modo Solution proponen invocaciones de CLI y reutilización primero.
2. **Cómo revisas los cambios.** Un PR hecho en modo Framework se espera que toque `@aurora/` o `.claude/skills/`. Un PR hecho en modo Solution se espera que se quede dentro de la carpeta de la feature y consuma el código compartido que ya existe.
3. **Qué significa "suficientemente bueno".** En modo Framework, una feature parcial que deja una primitive limpia y reutilizable es una victoria. En modo Solution, un inline puntual que entrega el requisito hoy es una victoria, aunque luego valga la pena extraerlo.

## Cuándo usar cada uno

Elige un modo antes de empezar la sesión. Cámbialo solo cuando la forma del trabajo cambie de verdad.

| Escenario                                                                                   | Modo         |
| ------------------------------------------------------------------------------------------- | ------------ |
| Agregar un nuevo bounded context con el CLI y rellenar las reglas de negocio                | Solution     |
| Escribir un composable nuevo en `@aurora/` porque varias features necesitan la misma forma  | Framework    |
| Documentar una convención como skill de Claude Code                                         | Framework    |
| Arreglar un bug dentro del handler de un módulo                                             | Solution     |
| Introducir una nueva plantilla del generador o un contrato de regiones de preservación      | Framework    |
| Cablear un formulario nuevo contra fetchers y composables que ya existen                    | Solution     |
| Renombrar una primitive compartida a lo largo del monorepo                                  | Framework    |

Una heurística útil: si tu cambio se perdería — o se repetiría — cuando alguien empiece la siguiente feature desde un checkout limpio, probablemente estás en el modo equivocado.

## Trade-offs y límites

- **Los modos son orientativos, no mecánicos.** Nada en el pipeline rechaza un PR en modo Solution que extrae un composable, ni un PR en modo Framework que deja un inline puntual. Los modos funcionan porque humanos e IA los respetan, no porque CI los imponga.
- **Mezclar modos en una sola sesión suele ser una señal para parar.** Si a mitad de camino te das cuenta de que la tarea en realidad es trabajo de Framework, cambia explícitamente con `/dev-mode framework` en lugar de dejar que el trabajo se desvíe en silencio. Una statusline que miente es peor que el coste del context switch.
- **El modo Framework no es licencia para sobreingeniar.** "¿Quién más podría necesitar esto?" tiene un corolario: si la respuesta plausible es "nadie", el patrón todavía no pertenece a `@aurora/`. Entrega el inline en modo Solution y extráelo la segunda vez que aparezca un consumidor.
- **El modo Solution no es licencia para saltarse las skills.** CLI primero y camino más corto no son lo mismo que ignorar los estándares de código documentados en `.claude/skills/`. Esos aplican en todos los modos.

## Relacionado

- [Scaffolding de un módulo backend](../../backend/module-scaffolding/) — el workflow CLI-first sobre el que se apoya el modo Solution.
- [Referencia de `catalyst load`](../../../reference/cli-commands/load/) — el comando al que recurres primero en modo Solution.
