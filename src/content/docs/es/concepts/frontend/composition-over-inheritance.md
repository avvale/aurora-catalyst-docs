---
title: "Composición vs herencia"
sidebar:
  order: 1
description: "Por qué la capa cerebro de Aurora se extiende horizontalmente componiendo funciones de un solo concern, en lugar de verticalmente mediante jerarquías de clases."
---

## Por qué existe

Cada pantalla de un frontend Aurora necesita alguna mezcla de las mismas capacidades: búsqueda, sort, paginación, selección, carga de datos, cableado GraphQL. La pregunta arquitectónica es cómo una pantalla nueva adquiere exactamente la mezcla que necesita. La respuesta clásica de la orientación a objetos es la herencia: pon la lógica compartida en una clase base y extiéndela.

```ts
class BaseListComponent<T> {
  /* carga de datos */
}
class PaginatedListComponent<T> extends BaseListComponent<T> {
  /* + paginación */
}
class SelectablePaginatedListComponent<T> extends PaginatedListComponent<T> {
  /* + selección */
}
```

Esto aguanta exactamente hasta la primera pantalla que no encaja en la cadena. Una pantalla que necesita **sort y selección pero sin paginación** no tiene hueco en esta jerarquía. Todas tus opciones son malas:

- **Heredar igualmente y desactivar.** La pantalla arrastra un estado de paginación que nunca usa, y las features "desactivadas" se convierten en un contrato que nadie documenta.
- **Abrir una rama nueva.** `SortableSelectableListComponent` duplica la lógica de selección, porque la herencia simple no puede fusionar dos ramas del árbol.
- **Empujarlo todo a la base.** `BaseListComponent` absorbe cada capacidad "por si acaso" y se convierte en el monolito — exactamente lo que era el viejo blob de signals de `useDataTable`.

Estas son las patologías con nombre propio de la reutilización por herencia: la *clase base frágil* (cada cambio en la base se propaga a todos los descendientes), *heredar lo que no necesitas* (cada nivel carga con todo lo que tiene encima) y la *explosión combinatoria* (con N capacidades hay hasta 2^N combinaciones, y cada una pide su propia clase).

La dirección de crecimiento de la herencia es **vertical**: extender significa añadir un piso más a una torre, y cada piso soporta el peso de todos los de abajo. La capa cerebro de Aurora crece en la otra dirección.

## Cómo funciona

### Qué es un composable

Un composable es una función normal que se ejecuta en el contexto de inyección de Angular, posee una porción acotada de estado en forma de signals, y devuelve signals readonly más setters explícitos. No hay `this`, ni clase base, ni jerarquía — nada que extender y nada heredado.

```ts
const sort = useTableSort();

sort.state(); // Signal<SortingState> — lectura
sort.set([{ id: 'name', desc: false }]); // escritura explícita
```

Un componente no *se convierte* en ordenable por descender de algo ordenable. *Tiene* sort porque llamó a la función. Ese giro — de **es-un** a **tiene-un** — es toda la idea.

### Extensibilidad vertical frente a horizontal

La herencia extiende apilando niveles; la composición extiende colocando piezas una junto a otra.

|                            | Herencia (vertical)                            | Composición (horizontal)                 |
| -------------------------- | ---------------------------------------------- | ---------------------------------------- |
| Unidad de reutilización    | Una clase dentro de una jerarquía              | Una función autocontenida                |
| Añadir una capacidad       | Nuevo nivel de subclase, o tocar la base       | Llamar a un composable más               |
| Combinar capacidades       | Una clase nueva por combinación                | Yuxtaponer llamadas                      |
| Capacidades sin usar       | Se heredan igualmente                          | Nunca se instancian                      |
| Impacto de un cambio       | Se propaga a todos los descendientes           | Local a los consumers de ese atom        |
| Coste de N capacidades     | Hasta 2^N clases                               | N atoms                                  |

La última fila es el argumento estructural. Aurora Catalyst tiene que servir a "cientos de proyectos muy diferentes" — la cola larga de variantes de pantalla es la norma, no la excepción. Una arquitectura vertical paga cada variante con un nodo nuevo en el árbol. Una horizontal paga una vez por capacidad y deja que cada pantalla elija su propio subconjunto.

### El contraste en código

La pantalla que rompía la jerarquía — sort y selección, sin paginación — son tres llamadas:

```ts
const sort = useTableSort();
const selection = useTableSelection();
const { table } = useDataTable({
  data: () => rows(),
  columns,
  getRowId: (r) => r.id,
  sort,
  selection,
});
```

No se arrastra nada sin usar: en esta pantalla no existe ningún atom de paginación, así que no hay estado de paginación que desactivar, documentar ni pagar. Y cuando la *siguiente* pantalla sí necesite paginación, aquí no cambia nada — esa pantalla compone su propio conjunto.

La composición tiene un coste honesto: alguien tiene que escribir este cableado, y los casos comunes lo repetirían en cada página. Por eso la convención en Aurora tiene dos niveles — **atoms**, las piezas de un solo concern, y **presets**, las composiciones opinadas como `usePaginatedDataTable` que traen el cableado canónico ya hecho. Los dos niveles, la regla que los separa y el catálogo completo se cubren en [Composables: atoms y presets](../composables/).

## Cuándo aplica

- Estás construyendo una pantalla que encaja en un caso canónico (lista paginada en servidor, manager many-to-many). Ve al preset — el cableado horizontal ya está hecho.
- Estás construyendo una variante que ningún preset cubre (kanban, virtual list, tree table, la pantalla de sort-más-selección de arriba). Compón los atoms directamente. Este es el caso al que la herencia no podía dar respuesta, y para el que existe esta arquitectura.
- Estás decidiendo entre una jerarquía de clases y composables para nueva lógica compartida. Regla práctica: **hereda formas de datos, compón comportamiento**. Las jerarquías de tipos genuinamente *es-un* — clases de error, modelos DTO — siguen estando bien como clases. El comportamiento con estado de una pantalla no es una relación *es-un*; es una lista de *tiene-un*.

## Compromisos y límites

- **El cableado es visible.** La herencia esconde la composición dentro de la clase base; los composables la ponen en el punto de uso. Una pantalla compleja declara su lista completa de capacidades de forma explícita. Son más líneas — y también son la documentación.
- **La disciplina de un-solo-concern es manual.** Ningún compilador impide que un atom crezca una segunda responsabilidad. Aplica la regla guardiana del contrato atoms/presets: en el momento en que un atom necesita otro atom, es un preset.
- **La orquestación transversal necesita un hogar.** "Cambiar la búsqueda resetea la paginación a la página 0" no pertenece a ninguno de los dos atoms. Sin presets, esa regla se duplica en cada punto de uso — los presets existen precisamente para que las piezas horizontales compartan conocimiento vertical en un único sitio.
- **Descubrir requiere un catálogo.** En una jerarquía, "ir a la clase base" revela lo que tienes. Con composición, necesitas saber que los atoms existen — para eso está la [referencia de composables](../../../reference/frontend/composables/).

## Relacionado

- [Composables: atoms y presets](../composables/) — cómo organiza Aurora la composición: la regla atom/preset, la organización por subdominio, el catálogo completo.
- [Referencia de composables](../../../reference/frontend/composables/) — firmas y configs de cada atom y preset.
- [Atomic composables + manager rewrite](../../../changes/catalyst/2026-05-05-refactor-data-table-to-atomic-composables/) — el cambio que llevó la capa cerebro del monolito a la composición.
