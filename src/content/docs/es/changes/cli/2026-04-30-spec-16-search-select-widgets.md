---
title: "Familia de widgets search-select"
description: "Tres widgets search-select sync/multi nuevos, el componente existente se renombra a la convención `au-*` y los cuatro wrappers ganan un output `touched`."
date: 2026-04-30
version: "Unreleased"
classification: breaking
source_commit: "a66d99c7b089c5241889331a97e0dc144feaf090"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/a66d99c7b089c5241889331a97e0dc144feaf090/openspec/changes/archive/2026-04-30-spec-16-search-select-widgets/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- BREAKING — `aurora-async-select-search` se renombra a `<au-async-search-select>`. La carpeta, la clase (`AsyncSelectSearchComponent` → `AsyncSearchSelectComponent`), el selector, las stories, el spec y el barrel export cambian. Los módulos con `widget.type: async-search-select` regeneran emitiendo el tag nuevo — sin tocar el YAML.
- Tres widget types nuevos en el YAML — `search-select`, `multiple-search-select`, `async-multiple-search-select` — cubren el hueco entre el `select` de 20 opciones y el `async-search-select` de 1000+. Las variantes sync precargan todas las opciones y se apoyan en el filter cliente de Spartan; la async-multi añade búsqueda debounced y multi-selección.
- Los cuatro wrappers ganan un `touched: output<void>()` que se dispara al cerrar el combobox, arreglando el gotcha de "abrir y cerrar sin seleccionar" no marca touched. La librería Aurora publica también la key transloco `Aurora.NoResults` para que el estado vacío no requiera traducciones por bounded context.

## Por qué importa

Para consumidores que solo tocan YAML, regenerar cualquier módulo con `widget.type: async-search-select` es toda la migración. Los importadores manuales de la clase renombrada actualizan el símbolo (`AsyncSelectSearchComponent` → `AsyncSearchSelectComponent`) y el selector del tag (`aurora-async-select-search` → `au-async-search-select`). El flujo de async refetch vive ahora a nivel de shell — el form emite `<relSingular>Search` y el shell aloja un handler `on<RelPascal>Search` que llama a `queryPaginate`. Cualquier shell con cableado custom de búsqueda necesita un regen para recoger el handler nuevo. Los tres widget types nuevos son puramente aditivos: declaras en YAML, regeneras, listo.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/a66d99c7b089c5241889331a97e0dc144feaf090/openspec/changes/archive/2026-04-30-spec-16-search-select-widgets/)
