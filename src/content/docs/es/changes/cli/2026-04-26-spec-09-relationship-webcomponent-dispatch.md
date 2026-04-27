---
title: "Dispatch de widgets relacionales"
description: "El generador del form ahora dispatcha cada widget.type relacional a una partial Spartan, declara inputs Options por relación y los precarga en el resolver."
date: 2026-04-26
version: "Unreleased"
classification: feature
source_commit: "bb7e223b54e09d8bd4017dff57715fb9f25b3e99"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/bb7e223b54e09d8bd4017dff57715fb9f25b3e99/openspec/changes/archive/2026-04-26-spec-09-relationship-webcomponent-dispatch/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- `form-body.eta` ahora dispatcha las properties FK cuyo `widget.type` es `select`, `multiple-select`, `async-search-select`, `grid-select-element` o `grid-select-multiple-elements` a partials dedicadas bajo `partials/relationships/`. El filtro prematuro de `id` se relaja: los FK con un bloque `widget` llegan al dispatch.
- Cinco partials migradas a Spartan reemplazan a las legacy de Material: `select.eta` y `multiple-select.eta` emiten `<hlm-select>`; las otras tres emiten los componentes correspondientes de `@aurora/components` (entregados aparte por `add-relationship-components`).
- El `*-form.component.ts` generado declara un `<relSingularName>Options = input<Target[]>([])` por cada property relacional — y un input `<relSingularName>Columns` para los dos selectores grid. El route resolver precarga cada lista de opciones en paralelo vía `forkJoin` y el shell las reenvía al form.

## Por qué importa

La superficie relacional del generador era código muerto: el filtro de `id` descartaba `webComponent.type: select` y las partials incluidas apuntaban a ficheros que no existían. Todos los módulos CRUD con FKs se desbloquean. Los pivots y los módulos sin `widget` regeneran byte a byte idéntico, así que la adopción es gradual — declaras `widget.type` en el YAML y el form lo recoge en la siguiente regeneración.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/bb7e223b54e09d8bd4017dff57715fb9f25b3e99/openspec/changes/archive/2026-04-26-spec-09-relationship-webcomponent-dispatch/)
