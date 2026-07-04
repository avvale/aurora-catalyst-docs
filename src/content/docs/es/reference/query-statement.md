---
title: "Query Statement (Aurora Query DSL)"
description: "Referencia exhaustiva de QueryStatement — el lenguaje de consultas propio de Aurora, neutral respecto al ORM: where, relations, order, aggregation, paginación, validación y la migración desde el legacy."
---

`QueryStatement` es el lenguaje de consultas propio de Aurora: un objeto JSON plano que expresa filtrado, carga de relaciones, ordenación, agregación y paginación — sin una sola clave específica de un ORM. Es el contrato de transporte que aceptan todos los endpoints de listado, paginación, búsqueda (`find`) y obtención (`get`), tanto en GraphQL como en REST.

Se aplica en todo punto donde una consulta viaja del cliente al servidor:

- **GraphQL**: los argumentos `query` y `constraint` de las queries `paginate*`, `get*`, `find*` (tipados como `QueryStatementInput`, un input object cuyos bloques por debajo son scalars `JSON`).
- **REST**: las claves equivalentes `query` / `constraint` en el body de la petición, por ejemplo `POST /library/books/paginate { "query": {...}, "constraint": {...} }`.

El flujo de extremo a extremo es siempre el mismo:

```
JSON del cliente  →  QueryStatementInput (passthrough, sin validación de forma a nivel de schema)
                  →  QueryDslValidator.validate()   (whitelist default-deny, profundidad ≤ 10, limit ≤ 10000)
                  →  DrizzleCriteria.translate()    (DSL → Drizzle RQB v2, o fallback al core builder)
                  →  SQL
```

`QueryStatementInput` es un input object de GraphQL cuyos bloques (`where`, `relations`, `order`, `aggregation`) están tipados cada uno como el scalar `JSON`, con `limit`/`offset` como `Int` — así que el schema no impone ninguna validación de forma sobre el DSL en sí. La validación real de la forma ocurre server-side, en `QueryDslValidator`, antes de que la sentencia se traduzca a SQL.

Aquí tienes una sentencia que usa cinco de los seis bloques de nivel superior a la vez:

```json
{
  "where": {
    "and": [
      { "status": { "eq": "active" } },
      { "role": { "name": { "iLike": "%admin%" } } }
    ]
  },
  "relations": {
    "role": { "order": [{ "field": "name", "dir": "asc" }] }
  },
  "order": [{ "field": "createdAt", "dir": "desc" }],
  "limit": 50,
  "offset": 0
}
```

Esto busca cuentas activas cuyo rol contenga "admin" en el nombre (un filtro, vía `where.role`), carga la relación `role` de cada cuenta ordenada por nombre (una preocupación distinta, vía `relations.role`), ordena el resultado por fecha de creación, y devuelve la primera página de 50 filas.

## Forma de nivel superior

`QueryStatement` tiene exactamente seis claves de nivel superior — no se acepta ninguna otra (ver [Validación y seguridad](#validación-y-seguridad)):

| Clave         | Tipo                        | Propósito                                                              |
| ------------- | --------------------------- | ------------------------------------------------------------------------|
| `where`       | `WhereClause`                | Filtra qué filas se devuelven (el conjunto de padres).                  |
| `relations`   | `Record<string, true \| RelationNode>` | Da forma a qué relaciones se cargan, y cómo — nunca filtra padres.  |
| `order`       | `OrderClause[]`              | Orden de clasificación; entradas `{ field, dir }`, `field` puede ser un dot-path. |
| `aggregation` | `AggregationBlock`           | `count`/`sum`/`avg`/`min`/`max` con `groupBy` opcional.                 |
| `limit`       | `number`                     | Número máximo de filas devueltas (tope de 10000).                       |
| `offset`      | `number`                     | Filas a saltar antes de devolver resultados.                            |

Las seis son opcionales. Una sentencia vacía (`{}`) es válida y devuelve todo, sin dar forma, según el orden natural de la fuente de datos.

## `where` — filtrado

`where` es un árbol de filtros recursivo. Cada clave es un **conector lógico** (`and`, `or`, `not`) o un **nombre de campo o relación** mapeado a una comparación hoja — o, cuando la clave nombra una relación, a un nodo `where` anidado (ver [filtrar por campos de una relación](#filtrar-por-campos-de-una-relación) más abajo).

### Referencia de operadores

Estos son los únicos 13 operadores hoja (a nivel de campo) que acepta el validador. Cualquier otra clave se rechaza antes de que la consulta llegue a la base de datos.

| Operador   | Significado                                | Tipo de valor                      | Equivalente SQL                |
| ---------- | -------------------------------------------- | ------------------------------------ | -------------------------------- |
| `eq`       | Igual a                                       | escalar                              | `= valor`                        |
| `ne`       | Distinto de                                   | escalar                              | `<> valor`                       |
| `gt`       | Mayor que                                     | escalar                              | `> valor`                        |
| `gte`      | Mayor o igual que                             | escalar                              | `>= valor`                       |
| `lt`       | Menor que                                     | escalar                              | `< valor`                        |
| `lte`      | Menor o igual que                             | escalar                              | `<= valor`                       |
| `in`       | El valor está dentro de un conjunto           | array de escalares                   | `IN (...)`                       |
| `notIn`    | El valor no está en un conjunto               | array de escalares                   | `NOT IN (...)`                   |
| `between`  | El valor cae en un rango, **inclusivo**       | tupla de 2 escalares `[min, max]`      | `BETWEEN min AND max`            |
| `isNull`   | El valor es/no es `NULL`                       | booleano                              | `IS NULL` / `IS NOT NULL`        |
| `iLike`    | Coincidencia de patrón sin distinguir mayúsculas (Postgres) | string                    | `ILIKE '%patrón%'`               |
| `contains` | La columna array/jsonb contiene un valor       | escalar o array de escalares          | `@>` (`contains` de Postgres)    |
| `overlap`  | La columna array/jsonb comparte elementos con  | escalar o array de escalares          | `&&` (`overlap` de Postgres)     |

`ScalarValue` es `string \| number \| boolean \| null` — la única forma de valor que aceptan los operadores de comparación. `contains` y `overlap` están pensados para columnas array/jsonb; un valor escalar a la derecha se normaliza internamente a un array de un elemento antes de llegar a Postgres, así que ambos aceptan cualquiera de las dos formas.

### Igualdad, desigualdad y nulos

```json
{ "where": { "id": { "eq": 123 } } }
{ "where": { "tenantId": { "ne": "public" } } }
{ "where": { "deletedAt": { "isNull": true } } }
{ "where": { "deletedAt": { "isNull": false } } }
```

`isNull: false` compila a `IS NOT NULL` — no es lo mismo que `ne: null` (la lógica de tres valores de SQL hace que `<> NULL` nunca sea verdadero).

### Comparaciones

```json
{ "where": { "price": { "gt": 10 } } }
{ "where": { "price": { "gte": 10 } } }
{ "where": { "createdAt": { "lt": "2025-01-01T00:00:00Z" } } }
{ "where": { "createdAt": { "lte": "2025-12-31T23:59:59Z" } } }
```

### Rangos

```json
{ "where": { "score": { "between": [70, 90] } } }
```

`between` es **inclusivo en ambos extremos** — tanto `score: 70` como `score: 90` coinciden.

### Conjuntos

```json
{ "where": { "status": { "in": ["draft", "published"] } } }
{ "where": { "status": { "notIn": ["archived"] } } }
```

### Coincidencia de patrones

```json
{ "where": { "name": { "iLike": "%madrid%" } } }
```

`iLike` es el único operador de patrones en el DSL — específico de Postgres (equivalente a `LIKE` sin distinguir mayúsculas). No existe un `like`/`startsWith`/`endsWith` plano en el DSL actual.

### Arrays / jsonb

```json
{ "where": { "tags": { "overlap": ["react", "node"] } } }
{ "where": { "tags": { "contains": ["graphql"] } } }
```

`contains` (`@>`) pregunta "¿el valor array/jsonb de la columna contiene todos estos elementos?"; `overlap` (`&&`) pregunta "¿comparte al menos un elemento con este conjunto?".

### AND implícito entre campos hermanos

Dos claves de campo dentro del mismo objeto `where` se combinan implícitamente con AND — solo necesitas un `and` explícito cuando combinas condiciones sobre el **mismo** campo, o cuando anidas `or`/`not`:

```json
{
  "where": {
    "status": { "eq": "active" },
    "age": { "gte": 18 }
  }
}
```

Esto es equivalente a `{ "and": [{ "status": {...} }, { "age": {...} }] }`, pero más plano.

### Lógicos `and` / `or` / `not`

```json
{
  "where": {
    "and": [
      { "status": { "eq": "active" } },
      {
        "or": [
          { "role": { "eq": "admin" } },
          { "role": { "eq": "editor" } }
        ]
      }
    ]
  }
}
```

```json
{ "where": { "not": { "deletedAt": { "isNull": false } } } }
```

`and` y `or` toman un array de cláusulas `where` anidadas; `not` toma una única cláusula anidada. Se pueden anidar hasta cualquier profundidad (hasta el [tope de profundidad de validación](#validación-y-seguridad)).

### Filtrar por campos de una relación

Un nombre de relación colocado **dentro de `where`** filtra las filas **padre** mediante un chequeo `EXISTS` contra esa relación — no carga ni da forma a las filas relacionadas:

```json
{ "where": { "role": { "name": { "iLike": "%admin%" } } } }
```

Solo se devuelven las filas padre que tienen al menos un `role` relacionado cuyo `name` coincide. Las filas de `role` en sí **no** se incluyen en el resultado — para eso, añade `role` al bloque `relations` por separado (ver la siguiente sección). Esta es la respuesta del DSL al filtro por join vía sintaxis de ruta `$role.name$` de Sequelize: sin cualificación con strings, sin ambigüedad sobre a qué tabla pertenece un nombre de columna a secas — la clave de relación ya lo delimita.

## `relations` — dando forma a los hijos cargados

`relations` es un **bloque separado de `where`**. Cada clave nombra una relación y se mapea a `true` (cargarla, sin dar forma adicional) o a un **nodo de relación** — un objeto de consulta recursivo que restringe/ordena/pagina los **hijos cargados**, sin tocar nunca qué filas padre se devuelven.

### Forma `true` vs. forma de nodo

```json
{ "relations": { "role": true } }
```

```json
{
  "relations": {
    "role": {
      "where": { "active": { "eq": true } },
      "order": [{ "field": "name", "dir": "asc" }],
      "limit": 5,
      "offset": 0
    }
  }
}
```

Un nodo de relación acepta exactamente estas claves: `where`, `order`, `limit`, `offset`, `relations` (para anidar un nivel más).

:::caution
Seleccionar los campos de una relación en la query de GraphQL (o en una proyección de respuesta REST) **no** carga esa relación por sí solo. `relations` es lo único que dispara la carga eager — hace falta un nodo `relations: { role: true }` explícito incluso si el selection set de GraphQL del cliente pide `role { name }`. Sin él, el campo vuelve como `null`.
:::

### Relaciones anidadas

```json
{
  "relations": {
    "fleetAircraft": {
      "relations": {
        "aircraftModel": true
      }
    }
  }
}
```

Las relaciones muchos-a-muchos usan la misma forma que cualquier otra relación — el DSL no expone una bolsa de opciones para la tabla pivote (no hay `through`); los datos del pivote, si hacen falta, se modelan como su propio agregado/relación.

### La regla de ortogonalidad

> `relations` da forma a los hijos cargados y **nunca** filtra a los padres. `where` filtra a los padres y **nunca** da forma a los hijos.

Son dos ejes independientes ([ortogonales](./glossary/#ortogonal), en el sentido del glosario): cambiar uno nunca arrastra al otro. Es una separación deliberada respecto al `include` de Sequelize, que mezclaba en una sola bolsa de opciones "carga esta asociación", "filtra los padres por ella" y "da forma a las filas unidas por el join".

La diferencia se ve mejor lado a lado, sobre los mismos datos subyacentes (cuentas, cada una con un `role`):

**Filtrar por relación** — se restringen los padres, `role` no se carga:

```json
{ "where": { "role": { "active": { "eq": true } } } }
```
Resultado: solo vuelven las cuentas cuyo rol está activo. El campo `role` de cada cuenta devuelta está ausente de la respuesta (nunca se pidió).

**Dar forma vía relación** — vuelven todos los padres, `role` se carga y se restringe:

```json
{ "relations": { "role": { "where": { "active": { "eq": true } } } } }
```
Resultado: vuelven **todas** las cuentas, incluyendo las que tienen un rol inactivo. El campo `role` de cada cuenta se rellena solo cuando el rol coincide con `active: true` — una cuenta sin ningún rol que coincida sigue apareciendo, con un `role` vacío.

Combina ambos cuando necesites "solo cuentas con un rol activo, y cargar ese rol":

```json
{
  "where": { "role": { "active": { "eq": true } } },
  "relations": { "role": true }
}
```

## `order` — ordenación

Un array de objetos `{ field, dir }`. `dir` es `"asc"` o `"desc"`.

```json
{ "order": [{ "field": "createdAt", "dir": "desc" }] }
{ "order": [{ "field": "name", "dir": "asc" }, { "field": "id", "dir": "desc" }] }
```

### Ordenar por una columna de una relación (dot-path)

`field` acepta un dot-path que nombra una columna de una relación, por ejemplo `role.name`:

```json
{ "order": [{ "field": "role.name", "dir": "asc" }] }
```

Cuando el Relational Query Builder de Drizzle no puede expresar directamente "ordenar las filas padre por una columna de una relación", la consulta se enruta de forma transparente al core select builder de Drizzle (un `JOIN` explícito) — quien llama recibe la misma forma de resultado en cualquiera de los dos casos.

**Restricciones de la ordenación por dot-path:**

- Solo se puede ordenar por relaciones **to-one** (una relación to-many no tiene una única fila contra la que ordenar al padre).
- La propia clave de relación debe resolver a una **única columna** en la tabla unida (`nombreRelación.nombreColumna`) — sin anidar más allá de un punto.
- Un `field` con dot-path **no está permitido dentro del `order` propio de un nodo de relación** — solo a nivel superior. Dentro de un `relations.<nombre>.order`, la ordenación queda acotada a las columnas propias de esa relación; no hay fallback de join disponible un nivel más abajo.
- `order.field` **no puede nombrar un alias de `aggregation.fields[].as`** — ver [Limitaciones de la agregación](#limitaciones) más abajo.

## Paginación — `limit` / `offset`

```json
{ "limit": 20, "offset": 40 }
```

- `limit` — número máximo de filas a devolver. **Tope de 10000** — ver [Validación y seguridad](#validación-y-seguridad).
- `offset` — número de filas a saltar antes de devolver resultados.

Los endpoints de paginación (GraphQL `paginate*`, REST `/paginate`) envuelven el conjunto de filas en un tipo `Pagination` que reporta totales junto con la página:

```graphql
type Pagination {
  total: Int!   # total de filas que cumplen `where`, ignorando limit/offset
  count: Int!   # filas realmente devueltas en esta página
  rows: [JSON]!
}
```

`total` le permite al cliente calcular el número de páginas; `count` refleja cuántas filas contiene realmente esta página (que puede ser menor que `limit` en la última página). A diferencia del contrato legacy de Sequelize, no hay un flag `distinct` para deduplicar filas raíz infladas por un join: `relations` nunca ejecuta un join que multiplique filas — cada nivel de relación se resuelve como su propia consulta — así que nunca hace falta una deduplicación manual.

## `aggregation` — count / sum / avg / min / max / group

El bloque de agregación **siempre** se enruta al core select builder de Drizzle (el Relational Query Builder no soporta agregaciones). Solo lleva claves propias de Aurora — nunca un string SQL crudo.

```typescript
interface AggregateField {
  fn: 'count' | 'sum' | 'max' | 'min' | 'avg';
  field: string;   // nombre de columna, o un dot-path `relation.column`
  as?: string;     // alias para la clave del resultado
}

interface AggregationBlock {
  fields: AggregateField[];
  groupBy?: string[];
}
```

### Conteo por grupo

```json
{
  "aggregation": {
    "fields": [{ "fn": "count", "field": "*", "as": "total" }],
    "groupBy": ["status"]
  },
  "order": [{ "field": "status", "dir": "asc" }]
}
```

### Media, agrupada

```json
{
  "aggregation": {
    "fields": [{ "fn": "avg", "field": "salary", "as": "avgSalary" }],
    "groupBy": ["departmentId"]
  }
}
```

### Agrupar por una columna de una relación (dot-path)

Tanto las entradas de `groupBy` como `fields[].field` aceptan un dot-path `relation.column` — el motor une la relación para resolverlo, del mismo modo que hace `order`:

```json
{
  "aggregation": {
    "fields": [{ "fn": "count", "field": "id", "as": "total" }],
    "groupBy": ["role.name"]
  }
}
```

### Limitaciones

- **`order.field` no puede nombrar un alias de `aggregation.fields[].as`.** `order.field` siempre se resuelve como una búsqueda de columna real contra la tabla base (o una tabla de relación unida) — nunca contra la lista del `SELECT`. Nombrar un alias como `"total"` en `order` resuelve a una columna indefinida y falla en el core builder:

  ```json
  {
    "aggregation": { "fields": [{ "fn": "count", "field": "id", "as": "total" }], "groupBy": ["status"] },
    "order": [{ "field": "total", "dir": "desc" }]
  }
  ```

  Ordena por uno de los campos de `groupBy` (una columna real) en lugar del alias de la agregación. Esto difiere del query builder de cubos del report-engine, que re-expande la expresión de agregación completa en el `ORDER BY` en lugar de referenciar un alias — ese camino no tiene esta limitación, pero es una superficie distinta y más especializada (ver la nota siguiente).
- El reporting avanzado (KPIs curados, joins entre varios cubos, formas listas para gráficos) pertenece a los **cubos** del report-engine, no a bloques `aggregation` ad hoc sobre un endpoint de listado — esta referencia no cubre esa superficie.

## Validación y seguridad

Cada `QueryStatement` es recorrido por `QueryDslValidator` — una **whitelist default-deny** — antes de traducirse a SQL. Operadores desconocidos, claves de nivel superior desconocidas y claves de nodo de relación desconocidas se rechazan sin excepción.

| Tope                       | Valor              | Se aplica sobre                                                       |
| --------------------------- | ------------------- | ------------------------------------------------------------------------|
| `limit` máximo               | **10000**            | El `limit` de nivel superior y el de cada nodo de relación.            |
| Profundidad máxima de anidación | **10**           | El árbol `where` (incluyendo `and`/`or`/`not` anidados y el anidamiento EXISTS por relación) y el bloque `relations` (incluyendo `relations.<nombre>.relations...` anidado). |
| Claves reservadas            | `RAW`, `AND`, `OR`, `NOT` | Denegadas como nombre de campo o relación en cualquier profundidad — colisionan con las claves de filtro reservadas propias de Drizzle RQB v2 o con los conectores traducidos del propio DSL. |

Ambos topes son valores **por defecto a nivel de proceso**, no configurables desde el wire — una sentencia que viole cualquiera de los dos nunca llega a la base de datos. Una sentencia que supera el tope de `limit` o el de profundidad falla la validación con un error descriptivo antes de que ocurra cualquier traducción.

### Decisión de diseño: nunca SQL crudo

El DSL no expone **ninguna** clave `literal`, `fn`, `col`, ni SQL crudo en ningún sitio — no hay escape hatch. Esto cierra la superficie de inyección que abría el contrato legacy de Sequelize vía `attributes: { literal: ... }` (se podía colar un fragmento SQL arbitrario disfrazado de "proyección"). Tampoco hay subconsultas en el sentido general: la única capacidad "parecida a una subconsulta" que expone el DSL es el chequeo `EXISTS` de filtro por relación descrito en [Filtrar por campos de una relación](#filtrar-por-campos-de-una-relación) — y esa es una forma fija y validada, no un `SELECT` anidado arbitrario.

Si un caso de uso realmente necesita SQL de agregación crudo, joins entre más de una relación, o funciones de ventana, pertenece a la capa de cubos del report-engine, no a un `QueryStatement` escrito a mano — ver la nota en [Limitaciones de la agregación](#limitaciones).

## `query` vs. `constraint`

Todo endpoint de paginación/get/find/list acepta **dos** argumentos independientes con forma `QueryStatement`:

- **`query`** — el payload de filtro/orden/paginación que provee el cliente. Viene directamente del body de la petición (REST) o de las variables de GraphQL.
- **`constraint`** — el alcance impuesto por el servidor (aislamiento por tenant, filtros de permisos, exclusión de borrado lógico). Lo fija el lado del servidor, nunca el cliente.

```graphql
hubPaginateAppsAccounts(query: QueryStatementInput, constraint: QueryStatementInput): Pagination!
```

Ambos se combinan server-side, bajo `AND`, antes de la traducción — el `where` del cliente nunca puede sobrescribir ni sortear el `constraint` del servidor:

```json
// query (provista por el cliente)
{ "where": { "name": { "iLike": "%acme%" } }, "limit": 20 }

// constraint (impuesto por el servidor)
{ "where": { "tenantId": { "eq": "tenant-42" } } }

// sentencia efectiva combinada
{
  "where": {
    "and": [
      { "name": { "iLike": "%acme%" } },
      { "tenantId": { "eq": "tenant-42" } }
    ]
  },
  "limit": 20
}
```

`relations` y `order` se combinan mediante deep-merge (no se reemplazan por completo) del mismo modo — una entrada de `constraint.relations` no borra una entrada de `query.relations` para una relación distinta.

## Migración desde la sentencia legacy (con forma de Sequelize)

Antes del paso a Drizzle, `QueryStatement` reflejaba la propia bolsa de opciones de Sequelize. La tabla siguiente mapea cada forma legacy a su equivalente actual — útil al leer código o documentación antigua.

| Legacy (forma Sequelize)                                     | Actual (Aurora Query DSL)                                       |
| --------------------------------------------------------------| -------------------------------------------------------------------|
| `include: [{ association: 'role' }]`                           | `relations: { role: true }`                                       |
| `order: [['createdAt', 'DESC']]`                                | `order: [{ field: 'createdAt', dir: 'desc' }]`                     |
| `where: { '$role.name$': { [Operator.iLike]: '%admin%' } }`      | `where: { role: { name: { iLike: '%admin%' } } }`                  |
| `where: { name: { '[eq]': 'admin' } }` (clave string con corchetes) | `where: { name: { eq: 'admin' } }` (clave a secas)              |
| `where: { name: { [Operator.eq]: 'admin' } }` (enum tipado)      | `where: { name: { eq: 'admin' } }` (misma clave a secas, sin importar el enum) |
| `include: [{ association: 'role', required: true }]` (`required: true` → `INNER JOIN`, excluye padres sin coincidencia) | **Sin equivalente directo.** Dar forma a una relación en el DSL nunca excluye padres por sí solo — expresa la exclusión como un filtro de relación en `where` (`where: { role: {...} }`), combinado con `relations: { role: true }` si además quieres cargar los datos. |
| `attributes: [...]` (proyección de columnas)                     | Eliminado — no hay clave de proyección en el DSL; usa `format`/`@Sanitize` del field-schema para enmascarar campos sensibles en vez de depender de la selección de columnas. |
| `group: [...]` (`GROUP BY` suelto)                               | Eliminado como clave independiente — el agrupamiento solo está disponible dentro de `aggregation.groupBy`, junto con `aggregation.fields`. |
| `lock: ...` (`SELECT ... FOR UPDATE` / `FOR SHARE`)              | Eliminado — no hay clave de bloqueo de filas en el DSL.             |

El enum `Operator` legacy también traía muchos valores exclusivos de MySQL o poco usados, sin equivalente hoy (`like`, `startsWith`, `regexp`, `col`, `join`, operadores de adyacencia de rangos, `any`/`all`/`values`/`placeholder`, …) — los 13 operadores `where` del DSL actual son un conjunto intencionalmente más pequeño, centrado en Postgres y validado por whitelist.
