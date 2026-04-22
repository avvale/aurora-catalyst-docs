---
title: Conectar datos GraphQL a la UI
description: Precarga datos en un resolver con fetchers y luego renderízalos en un componente con composables — usando el módulo generado iam/tag como ejemplo.
---

En este tutorial vas a seguir el viaje de un dato desde el servidor GraphQL hasta un campo de formulario. Por el camino conocerás las dos capas de `@aurora/modules/graphql/`:

- **Fetchers** — funciones puras de una sola emisión que devuelven `Observable<T>`. Su hogar natural son los `ResolveFn` y cualquier sitio donde sólo necesitas la llamada HTTP.
- **Composables** — funciones `useGraphqlX` que envuelven a un fetcher y exponen signals de Angular. Su hogar natural son los componentes que necesitan estado reactivo.

Los ejemplos salen del módulo `iam/tag`, el primero que genera aurora-catalyst-cli. Las rutas de archivo apuntan a `frontend/src/app/domains/admin/bounded-contexts/iam/tag/`.

## Qué vas a aprender

Al terminar sabrás:

- Cuándo conviene un fetcher y cuándo un composable.
- Cómo precargar datos en un resolver sin montar un composable.
- Cómo renderizar una lista paginada con `useGraphqlList` y `useDataTable`.
- Cómo renderizar un formulario de detalle con `useGraphqlDetail`, `pickModel` y `signalForm`.
- Qué anti-patrones delatan que alguien evitó la capa.

## Requisitos previos

- Un proyecto Aurora Catalyst con al menos un módulo generado (aquí usamos `iam/tag`).
- Familiaridad con signals de Angular y `ResolveFn`.
- Vocabulario básico de GraphQL (`query` vs `mutation`, `object:` vs `objects:`).

## Las dos capas de un vistazo

Por cada módulo, el generador emite dos archivos que importan para este tutorial:

- `tag.graphql.ts` — los documentos GraphQL crudos (`paginationQuery`, `findByIdQuery`, `createMutation`…).
- `tag.list-config.ts` / `tag.detail-config.ts` — un objeto de configuración que agrupa los documentos y la clave con la que el servidor envuelve el payload (`'pagination'` para listas, `'object'` para detalles).

Los fetchers leen directamente de los documentos. Los composables aceptan el objeto de configuración y esconden el cableado. La config es la única fuente de verdad — ambas capas apuntan a las mismas queries.

## Paso 1 — Precargar datos en un resolver con fetchers

Los resolvers corren dentro del contexto de inyección del router. No tienen un `DestroyRef` de componente, y cualquier signal que creen se descarta apenas resuelve la navegación. Un fetcher devuelve un `Observable<T>` limpio — sin signals, sin acoplamiento al ciclo de vida — así que encaja perfecto.

Desestructura los campos que necesitas desde la config generada, llama al fetcher y devuelve el observable. Nada más.

```ts
// tag.resolvers.ts
import { type ResolveFn } from '@angular/router';
import {
  buildSortOrder,
  DEFAULT_PAGE_SIZE,
  queryFindById,
  queryPaginate,
  type DataTableData,
} from '@aurora';
import { type IamTag } from '@src/src/app/aurora.types';
import { TAG_DETAIL_CONFIG } from './tag.detail-config';
import { TAG_LIST_CONFIG } from './tag.list-config';

export const tagListResolver: ResolveFn<DataTableData<IamTag>> = () => {
  const { queryPagination, paginationKey, fields } = TAG_LIST_CONFIG;
  return queryPaginate<IamTag>(queryPagination, paginationKey, fields, {
    query: {
      offset: 0,
      limit: DEFAULT_PAGE_SIZE,
      order: buildSortOrder([]),
    },
  });
};

export const tagDetailResolver: ResolveFn<IamTag | null> = (route) => {
  const id = route.paramMap.get('id');
  if (!id) return null;
  const { queryObject, objectKey, fields } = TAG_DETAIL_CONFIG;
  return queryFindById<IamTag>(queryObject, objectKey, id, fields);
};
```

Tres cosas que vale la pena notar:

- **Desestructuras** en lugar de pasar la config entera. El resolver declara qué necesita (`queryPagination`, `paginationKey`, `fields`) — no finge ser dueño de la mutación de borrado que también vive en la config.
- **`buildSortOrder([])`** para la página inicial. Es el orden por defecto; el componente lo reemplaza en cuanto el usuario pincha una cabecera de columna.
- **Devuelve el observable tal cual**. El router se suscribe por ti; aquí no hace falta `lastValueFrom` ni suscribirse a mano.

Los siete fetchers que puedes importar desde `@aurora`:

| Fetcher            | Op GraphQL que refleja                             | Devuelve                        | Caller típico                  |
| ------------------ | -------------------------------------------------- | ------------------------------- | ------------------------------ |
| `queryPaginate`    | lectura paginada                                   | `Observable<DataTableData<T>>`  | resolver de lista              |
| `queryFindById`    | lectura de un registro por id                      | `Observable<T \| null>`         | resolver de detalle            |
| `queryFind`        | lectura de un registro por criterio (`findQuery` / `object:`) | `Observable<T \| null>` | resolver, búsqueda puntual    |
| `queryGet`         | lectura plural sin paginar (`getQuery` / `objects:`) | `Observable<T[]>`              | dropdowns, listas de selección |
| `mutateCreate`     | create                                             | `Observable<unknown>`           | CTA fuera de formularios       |
| `mutateUpdate`     | update                                             | `Observable<unknown>`           | ediciones en bloque            |
| `mutateDeleteById` | delete                                             | `Observable<unknown>`           | confirmación de borrado        |

## Paso 2 — Renderizar una lista con `useGraphqlList`

En los componentes es donde los signals se ganan el sueldo. Un composable envuelve al fetcher, añade una signal `pagination`, una signal `loading`, una proyección readonly, y deja el resto del código ergonómico.

`useGraphqlList` es una **fachada**: compone `useGraphqlPaginate` y `useGraphqlDeleteById` para que una pantalla de lista reciba lectura y borrado con una sola llamada.

Obviando el cromo de UI para centrarnos en los datos:

```ts
// tag-list.component.ts (abreviado)
import {
  buildFilterWhere,
  buildSearchWhere,
  buildSortOrder,
  DEFAULT_PAGE_SIZE,
  useDataTable,
  useGraphqlList,
  type DataTableData,
} from '@aurora';
import { Operator } from '@aurorajs.dev/core-common';
import { lastValueFrom } from 'rxjs';
import { TAG_LIST_CONFIG } from '../data-access/tag.list-config';

export default class TagListComponent {
  private readonly route = inject(ActivatedRoute);

  // La config entera va a la fachada — necesita la query paginada
  // Y la mutación de borrado.
  private readonly list = useGraphqlList<IamTag>(TAG_LIST_CONFIG);

  // El resolver dejó la primera página en los datos de la ruta; sembramos
  // la signal del componente con eso para pintar sin un round trip extra.
  readonly page = signal<DataTableData<IamTag>>(
    this.route.snapshot.data['pagination'],
  );

  private readonly dataTable = useDataTable<IamTag>({
    data: () => this.page()?.rows ?? [],
    columns: this.columns,
    totalRows: () => this.page()?.total ?? 0,
    pageSize: DEFAULT_PAGE_SIZE,
    manualSorting: true,
    manualPagination: true,
    onSortingChange: (sorting) => this.fetchPage({ sorting }),
    onPaginationChange: (pagination) =>
      this.fetchPage({
        offset: pagination.pageIndex * pagination.pageSize,
        limit: pagination.pageSize,
      }),
  });

  private async fetchPage(params: { /* … */ } = {}) {
    // construye where / order a partir del estado de la tabla y consulta al composable
    const fresh = await lastValueFrom(
      this.list.paginate({ query: { where, order, offset, limit } }),
    );
    this.page.set(fresh);
  }

  async confirmDelete() {
    const tag = this.tagToDelete();
    if (!tag) return;
    await lastValueFrom(this.list.deleteById(tag.id));
    await this.fetchPage();
  }
}
```

Tres detalles a destacar:

- El resolver rellenó `route.snapshot.data['pagination']` con la primera página. El componente lee ese valor una vez para sembrar `page` — así la tabla se pinta sin parpadeo en el primer render.
- `useDataTable` es el dueño del estado de tabla (orden, paginación, visibilidad de columnas). Tu `fetchPage` deriva las variables GraphQL desde ese estado con los helpers `buildSearchWhere`, `buildFilterWhere` y `buildSortOrder` de `@aurora`.
- `this.list.paginate(...)` y `this.list.deleteById(...)` también devuelven observables. `lastValueFrom` es cómo los esperas.

## Paso 3 — Renderizar un formulario de detalle con `useGraphqlDetail`

`useGraphqlDetail` es la fachada del lado de escritura: expone `create(payload)`, `update(payload)` y una signal `loading` para el botón de guardar.

```ts
// tag-detail.component.ts (abreviado)
import { pickModel, useGraphqlDetail } from '@aurora';
import { TAG_DETAIL_CONFIG } from '../data-access/tag.detail-config';

export default class TagDetailComponent {
  readonly mode = signal<'new' | 'edit'>(this.route.snapshot.data['mode']);
  readonly detail = useGraphqlDetail<IamTag>(TAG_DETAIL_CONFIG);

  // pickModel mapea el registro cargado por el resolver a la forma del
  // formulario, rellenando los campos ausentes con los defaults que le pases.
  readonly signalModel = pickModel(this.route.snapshot.data['item'], {
    id: '',
    name: '',
  });

  readonly signalForm = this.fb.group({
    id: [this.signalModel.id],
    name: [this.signalModel.name, [Validators.required, Validators.maxLength(64)]],
  });

  async onSubmit() {
    if (this.signalForm.invalid) return;
    const payload = this.signalForm.value as Record<string, unknown>;
    if (this.mode() === 'new') {
      await lastValueFrom(this.detail.create(payload));
    } else {
      await lastValueFrom(this.detail.update(payload));
    }
    this.router.navigate(['/iam/tag']);
  }
}
```

La pieza interesante es `pickModel`. El resolver devuelve la entidad completa (o `null` en modo nuevo); el formulario quiere una forma más estrecha con defaults. `pickModel` conecta las dos sin que escribas una función de mapeo a mano.

El template del botón lee `detail.loading()` para mostrar un spinner mientras la mutación está en vuelo — esa signal es la razón por la que el componente usa un composable en lugar de llamar a `mutateUpdate` directamente.

## Cómo elegir la capa adecuada

Cuando dudes, esta tabla sirve de brújula:

| Situación                                              | Capa         |
| ------------------------------------------------------ | ------------ |
| `ResolveFn` precargando datos para una ruta            | Fetcher      |
| Template reactivo que muestra `loading` / `item`       | Composable   |
| Rellenar un `<select>` con un diccionario pequeño      | Fetcher (`queryGet`) dentro de un resolver |
| Llamada puntual desde un servicio o una utilidad       | Fetcher      |
| Cualquier otra cosa dentro de un componente            | Composable   |

El test es simple: **¿necesitas una signal?** Si sí, composable. Si no, fetcher.

## Anti-patrones a evitar

- **`inject(HttpClient)` para una llamada GraphQL.** El stack usa Apollo; un cliente REST rompe la coherencia de la caché y salta los interceptores.
- **`new BehaviorSubject(...)` para estado local del componente.** El proyecto es signals-first. Usa `signal()`.
- **Literales de operador como `'[iLike]'`.** Importa `Operator` desde `@aurorajs.dev/core-common` y usa `Operator.iLike`. El literal se rompe en silencio ante un typo; el enum no.
- **Llamar a `useGraphqlList(CONFIG).paginate(...)` desde un resolver.** Eso instancia un composable de borrado que el resolver no necesita y lo acopla a un contrato que sólo aplica en componentes. Usa `queryPaginate` y desestructura.

## Relacionado

- [Historial de cambios: Añadir GraphQL Fetchers](../../../changes/catalyst/2026-04-22-query-mutate-layer-separation/) — la propuesta original y las notas de diseño.
- [Guías](../../../guides/) — recetas orientadas a tareas cuando ya manejes lo básico.
- [Referencia: API](../../../reference/api/) — la superficie TypeScript completa de `@aurora`.
