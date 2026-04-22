---
title: Scaffolding de un módulo
description: Qué genera el CLI de Catalyst para un módulo backend y cómo el lockfile controla las ediciones manuales.
---

## Por qué existe

Un módulo backend de Catalyst siempre tiene la misma forma: un controlador REST, un resolver de GraphQL, un handler de capa de aplicación, un service, un DTO, un fragmento de esquema GraphQL, un modelo de Sequelize, un repositorio, un field schema y un seed — un juego por operación. Un módulo con seis operaciones CRUD supera rápido los treinta archivos, todos con convenciones estrictas de nombres, capas y decoradores. Escribir eso a mano es repetitivo y hace que la forma se vaya desviando entre módulos.

Catalyst trata el archivo `*.aurora.yaml` del módulo como la única fuente de verdad. El CLI lee la YAML y emite el árbol completo de manera determinista. Cuando el módulo tiene que evolucionar, editas la YAML — no el TypeScript generado — y vuelves a generar.

## Cómo funciona

Cada módulo vive en `cliter/<bounded-context>/<module>.aurora.yaml`. Al ejecutar:

```bash
catalyst load back module --name=<bounded-context>/<module> --force
```

el CLI emite archivos en todas las capas del backend:

| Capa                                                  | Archivos                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------- |
| `@api/<bc>/<mod>/controllers/`                        | Un controlador REST por operación                                   |
| `@api/<bc>/<mod>/resolvers/`                          | Un resolver de GraphQL por operación                                |
| `@api/<bc>/<mod>/dto/` y `@api/<bc>/<mod>/graphql/`   | DTOs de entrada y salida y el fragmento de esquema GraphQL          |
| `@app/<bc>/<mod>/application/<op>/`                   | Handler + service por operación                                     |
| `@app/<bc>/<mod>/domain/`                             | Entidad, value objects, field schema, interfaz del repositorio      |
| `@app/<bc>/<mod>/infrastructure/`                     | Modelo de Sequelize, implementación del repositorio, seed           |

El comando también ejecuta `pnpm back:graphql:types` por defecto, así los tipos GraphQL quedan alineados con la YAML. Usa `--noGraphQLTypes` (`-g`) para omitir ese paso. Consulta la [referencia de `catalyst load`](../../reference/cli-commands/load/) para el listado completo de flags.

### Operaciones que el CLI reconoce

Cada operación se mapea a un conjunto handler + service + resolver + controller. Lo que aparece en la lista `operations` del módulo, o simplemente no está en `excludedOperations`, se emite.

| Operación             | Genera                                                     |
| --------------------- | ---------------------------------------------------------- |
| `count`               | Contar filas que cumplan un filtro                         |
| `create`              | Crear una fila                                             |
| `createBatch`         | Crear varias filas en una sola llamada                     |
| `delete`              | Borrar varias filas por filtro                             |
| `deleteById`          | Borrar una fila por id                                     |
| `find`                | Buscar una fila por filtro                                 |
| `findById`            | Buscar una fila por id                                     |
| `get`                 | Obtener varias filas por filtro                            |
| `getRaw`              | Obtener filas con forma SQL en crudo (sin `@Format`)       |
| `paginate`            | Listado paginado                                           |
| `update`              | Actualizar varias filas por filtro                         |
| `updateAndIncrement`  | Actualizar con incremento atómico de un contador           |
| `updateById`          | Actualizar una fila por id                                 |
| `upsert`              | Insertar o actualizar según la presencia de la clave       |
| `max` / `min` / `sum` | Agregados sobre una columna numérica                       |

Los verbos personalizados que no encajan en el vocabulario CRUD — `activate`, `approve`, `cancel`, `check-unique-<field>` — viven en una lista aparte, `additionalApis`, dentro de la misma YAML, y generan un scaffold más ligero de tres archivos (controller + resolver + handler) que luego completas tú.

### Lockfile y archivos `.origin`

Cada archivo generado tiene una entrada de lockfile que guarda el SHA-1 del contenido emitido por el CLI. Al regenerar, el CLI compara el hash de integridad del archivo que encuentra en disco contra el del lockfile:

- **Los hashes coinciden** → no hay ediciones manuales. El CLI sobreescribe el archivo con la nueva salida.
- **Los hashes difieren** → el archivo tiene ediciones manuales. El CLI escribe la nueva salida en `<archivo>.origin` al lado del tuyo y te deja a ti resolver la discrepancia.

La flag `--noReview` omite la revisión interactiva al final del proceso.

Editar el cuerpo de `main()` de un handler es seguro: el scaffold alrededor queda intacto, así que la siguiente regeneración produce un `.origin` prácticamente idéntico a tu archivo. Editar decoradores, imports o firmas de métodos es lo que genera conflictos reales en el `.origin`.

## Cuándo aplica

- Scaffoldeas un módulo nuevo, agregas un campo o agregas una operación — editas la YAML, ejecutas `catalyst load …` y commiteas tanto la YAML como los archivos generados.
- Ves un archivo `.origin` después de regenerar — una edición a mano divergió del scaffold anterior; decide qué versión queda y borra el `.origin`.
- Quieres un verbo personalizado — decláralo en `additionalApis`, regenera y completa el stub que el CLI produce.
- Quieres omitir operaciones o archivos específicos — consulta [Excluir APIs](../../guides/backend/exclude-generated-apis/).

## Trade-offs y límites

- **El CLI no borra archivos huérfanos.** Quitar una operación de la YAML no elimina los archivos que ya emitió — bórralos a mano después.
- **Las ediciones estructurales cuestan caras.** Cambiar decoradores, firmas de métodos o imports de un archivo generado convierte cada regeneración futura en una revisión de `.origin`. Cuando se pueda, expresa el cambio en la YAML.
- **El vocabulario CRUD es cerrado.** La tabla de operaciones de arriba es el conjunto completo; cualquier otra cosa va en `additionalApis`.

## Relacionado

- [Excluir APIs](../../guides/backend/exclude-generated-apis/) — cómo funcionan `excludedOperations` y `excludedFiles` en la práctica.
- [Referencia de `catalyst load`](../../reference/cli-commands/load/) — cada flag y argumento.
- [Regiones de preservación](../frontend/preservation-regions/) — cómo proteger código personalizado dentro de una plantilla generada.
