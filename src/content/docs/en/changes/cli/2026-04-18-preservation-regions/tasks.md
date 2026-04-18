---
title: "Tasks"
---

## 1. Core parsing primitives (lock-file.ts)

- [x] 1.1 Definir constantes: `NAME_PATTERN = '[A-Z][A-Z0-9]*(-[A-Z0-9]+)*'` y `HTML_TOKEN_RE = new RegExp(\`<!--[ \\t]*#(?<kind>region|endregion)[ \\t]+AURORA:(?<name>${NAME_PATTERN})-(?<suffix>START|END)[ \\t]*-->\`, 'g')` con named groups
- [x] 1.2 Implementar `extractPreservationRegions(content: string): Map<string, string>` con un parser lineal: usa `content.matchAll(HTML_TOKEN_RE)`, mantiene un stack de profundidad 1 (sólo una region abierta a la vez) y valida: (a) `kind=region` ⟺ `suffix=START`, (b) `kind=endregion` ⟺ `suffix=END`, (c) END cuyo `name` coincide con el START abierto, (d) no START con stack no vacío (nesting). Todos los errores incluyen número de línea computado desde el offset del match
- [x] 1.3 Implementar `stripPreservationRegions(content: string): string` reutilizando el escáner lineal: reemplaza el cuerpo entre pares START/END por cadena vacía, preservando los marcadores START/END en el resultado (para que renombrar una region invalide el hash)
- [x] 1.4 Implementar `sha1WithPreservation(content: string): string` como `sha1(stripPreservationRegions(content))`
- [x] 1.5 Implementar `normalizeRegionBody(body: string): string` = `body.replace(/\r\n/g, '\n').replace(/\s+$/, '')` y `hashRegionBodies(content: string): Record<string, string>` que itera sobre `extractPreservationRegions(content)` y devuelve objeto `{ name: sha1(normalizeRegionBody(body)) }` (objeto plano para serialización directa al lockfile)
- [x] 1.6 Implementar `mergePreservationRegions(newContent: string, existingContent: string, priorHashes?: Record<string, string>): { content: string; preserved: string[]; updated: string[]; dropped: string[] }` con la lógica per-region: si `priorHashes?.[name]` existe y `sha1(normalizeRegionBody(existingBody)) === priorHashes[name]` → usar body de `newContent`, si no → usar body de `existingContent`. Si `priorHashes` es ausente → usar siempre body de `existingContent` (fallback). Retorna también las listas de regions preservadas/actualizadas/dropped para logging
- [x] 1.7 Exportar las 5 funciones nuevas desde `lock-file.ts`. NO cambiar firmas existentes

## 2. LockFile model update

- [x] 2.1 En `src/generator/domain/model.ts`, añadir campo opcional `regions?: Record<string, string>` al tipo `LockFile`
- [x] 2.2 Verificar que `loadLockFiles` en `lock-file.ts` lee el campo sin validación estricta (es opcional; ausencia = lockfile legacy)

## 3. Integración en file-writer.ts

- [x] 3.1 Importar `sha1WithPreservation`, `mergePreservationRegions`, `hashRegionBodies` desde `lock-file.js`
- [x] 3.2 En `handleExistingFile`: antes de la comparación de hashes, obtener `priorHashes = lockEntry?.regions` y ejecutar `const mergeResult = mergePreservationRegions(params.contents, currentFile, priorHashes);`
- [x] 3.3 Cambiar la comparación de integridad a `sha1WithPreservation(currentFile)` y usar `mergeResult.content` en ambas ramas (overwrite y `.origin`), NO `params.contents` puro
- [x] 3.4 Bajo `params.verbose`, emitir `[REGION UPDATED] <file>: <name>` (magenta) por cada nombre en `mergeResult.updated` y `[REGION PRESERVED] <file>: <name>` (cyan) por cada uno en `mergeResult.preserved`
- [x] 3.5 SIEMPRE (sin `--verbose`), emitir `[REGION DROPPED] <file>: <name>` (redBright) por cada nombre en `mergeResult.dropped`
- [x] 3.6 En `writeFile`, antes del push a `ctx.result.lockFiles`: calcular `const finalContent = mergeResult?.content ?? params.contents` (o el contenido que realmente se escribió a disco) y usar `sha1WithPreservation(finalContent)` para `integrity`; calcular `regions` con `hashRegionBodies(finalContent)` y añadirlo a la entrada SÓLO si el map no está vacío
- [x] 3.7 Verificar que la rama de `FILE_TAGS.ignored*` (file-writer.ts:125-142) sigue saliendo ANTES de cualquier merge. Añadir comentario breve sobre por qué se mantiene `sha1(currentFile)` y no `sha1WithPreservation` en ese check
- [x] 3.8 Verificar que la rama "fichero nuevo" (file-writer.ts:85-90) NO ejecuta merge — escribe `contents` tal cual. El lockfile persistido ya usa `sha1WithPreservation` + `hashRegionBodies`, lo que garantiza que la próxima regeneración detecte regions si el template las incluyó

## 4. Config y versioning

- [x] 4.1 Bump `LOCK_JSON_VERSION` en `src/generator/domain/config.ts` de `'0.0.1'` a `'0.1.0'`
- [x] 4.2 Verificar si existen tests que dependan del valor literal `'0.0.1'`. Si existen, actualizarlos

## 5. Tests unitarios — parsing y hashing (test/generator/engine/lock-file.test.ts)

- [x] 5.1 Test `extractPreservationRegions`: fichero sin regions → Map vacío
- [x] 5.2 Test `extractPreservationRegions`: fichero con una region HTML → Map con `{ 'FORM-FIELDS': 'body' }`
- [x] 5.3 Test `extractPreservationRegions`: múltiples regions con nombres distintos → todas extraídas
- [x] 5.4 Test `extractPreservationRegions`: lowercase name NO se reconoce (pasa al skeleton)
- [x] 5.5 Test `extractPreservationRegions`: underscore en name NO se reconoce
- [x] 5.6 Test `extractPreservationRegions`: doble guión NO se reconoce
- [x] 5.7 Test `extractPreservationRegions`: marcador multi-línea NO se reconoce
- [x] 5.8 Test `extractPreservationRegions`: tolera múltiples espacios internos
- [x] 5.9 Test `extractPreservationRegions`: error `Inconsistent marker: #region must end with -START` cuando `region` + `-END`
- [x] 5.10 Test `extractPreservationRegions`: error `Inconsistent marker: #endregion must end with -END` cuando `endregion` + `-START`
- [x] 5.11 Test `extractPreservationRegions`: error `Unmatched START` cuando START sin END, con número de línea correcto
- [x] 5.12 Test `extractPreservationRegions`: error `Unmatched END` cuando END sin START
- [x] 5.13 Test `extractPreservationRegions`: error `Mismatched END: expected FOO, found BAR` cuando nombres no coinciden
- [x] 5.14 Test `extractPreservationRegions`: error `Nested regions not supported` con los dos nombres
- [x] 5.15 Test `stripPreservationRegions`: fichero sin regions → contenido idéntico
- [x] 5.16 Test `stripPreservationRegions`: fichero con region → cuerpo vaciado, marcadores START/END preservados
- [x] 5.17 Test `sha1WithPreservation`: mismo skeleton con distinto cuerpo de region → mismo hash
- [x] 5.18 Test `sha1WithPreservation`: mismo cuerpo de region con skeleton diferente → hashes distintos
- [x] 5.19 Test `sha1WithPreservation`: renombrar el marcador (cuerpo idéntico) → hash distinto
- [x] 5.20 Test `sha1WithPreservation`: fichero sin regions → idéntico a `sha1(fichero)` (backward compat)
- [x] 5.21 Test `normalizeRegionBody`: CRLF → LF
- [x] 5.22 Test `normalizeRegionBody`: trailing whitespace/newlines eliminados
- [x] 5.23 Test `hashRegionBodies`: CRLF y LF producen mismo hash para el mismo body lógico
- [x] 5.24 Test `hashRegionBodies`: trailing whitespace ignorado en el hash
- [x] 5.25 Test `hashRegionBodies`: body vacío produce hash estable
- [x] 5.26 Test `mergePreservationRegions`: `priorHashes` ausente → preserva todos los bodies de `existing`
- [x] 5.27 Test `mergePreservationRegions`: hash coincide → body de `newContent` (region en `updated`)
- [x] 5.28 Test `mergePreservationRegions`: hash no coincide → body de `existing` preservado byte-a-byte (region en `preserved`)
- [x] 5.29 Test `mergePreservationRegions`: region en `existing` pero no en `new` → `dropped` contiene nombre, contenido final = `new` tal cual
- [x] 5.30 Test `mergePreservationRegions`: region en `new` pero no en `existing` → body de `new` se conserva
- [x] 5.31 Test `mergePreservationRegions`: CRLF en body preservado respeta line endings del disco tras la escritura
- [x] 5.32 Test `mergePreservationRegions`: múltiples regions con distinto estado (una preservada, una actualizada, una dropped) se manejan independientemente

## 6. Tests de integración — file-writer (test/generator/engine/file-writer.test.ts)

- [x] 6.1 Test skeleton unchanged + region con hash que coincide → fichero resultante contiene el body del template (REGION UPDATED)
- [x] 6.2 Test skeleton unchanged + region con hash que NO coincide (usuario tocó) → body del disco preservado (REGION PRESERVED)
- [x] 6.3 Test skeleton modificado + regions mezcladas → `.origin` contiene el merge correcto per-region
- [x] 6.4 Test fichero sin regions → comportamiento idéntico pre-change
- [x] 6.5 Test fichero marcado con `FILE_TAGS.ignoredHtmlFile` + regions en el body → log `[IGNORED FILE]` y NO se ejecuta merge (verificar via spy o checking que el fichero en disco no cambió)
- [x] 6.6 Test generación de lockfile tras write → `integrity` con `sha1WithPreservation`, `regions` con `hashRegionBodies`, `version: "0.1.0"` en el JSON
- [x] 6.7 Test lockfile legacy `0.0.1` sin campo `regions` + fichero con regions en disco → fallback "preservar todo"; nuevo lockfile persiste con `regions` poblado
- [x] 6.8 Test region eliminada del template + `--verbose=false` → log `[REGION DROPPED]` visible siempre
- [x] 6.9 Test `--verbose=true` con 2 regions (una preservada, otra actualizada) → ambos mensajes `[REGION PRESERVED]` y `[REGION UPDATED]` aparecen
- [x] 6.10 Test `--verbose=false` con regions normales (sin dropped) → logs de region NO aparecen (sólo el mensaje principal del fichero)
- [x] 6.11 Test region declarada en template string HTML embebido en `.ts` → parser la reconoce igual que en `.html`

## 7. Documentación

- [x] 7.1 Añadir sección "Preservation Regions" al CLAUDE.md del CLI (o README.md) describiendo: formato de marcadores HTML, gramática del nombre, scope inicial HTML-only, constraint de no-nesting, semántica de rename de region, interacción con ignored files, `--verbose`
- [x] 7.2 Crear o actualizar una nota en `.claude/skills/eta-templating/SKILL.md` para template authors: cómo declarar una region en un template HTML, gramática, lista RECOMENDADA (no obligatoria) de nombres sugeridos (`FORM-FIELDS`, `VALIDATORS`, ejemplos); advertencia sobre rename como operación disruptiva
- [x] 7.3 Actualizar ROADMAP.md: marcar SPEC-01 como "en implementación", anotar que SPEC-04 descarta el formato `#region AI-generated code`, y que `/* */` (TS/JS/CSS) queda para un change futuro

## 8. Verificación final

- [x] 8.1 Ejecutar `npm run test` y confirmar que todos los tests (nuevos y existentes) pasan
- [x] 8.2 Ejecutar `npm run lint` y resolver cualquier warning nuevo
- [x] 8.3 Probar manualmente en un proyecto consumidor: generar un módulo con region `FORM-FIELDS` en un fichero HTML, añadir contenido dentro, regenerar, verificar que sobrevive (REGION PRESERVED)
- [x] 8.4 Probar manualmente: no tocar la region del paso anterior, cambiar el body de la region en el template, regenerar, verificar que se actualiza (REGION UPDATED)
- [x] 8.5 Probar manualmente: modificar skeleton a mano + region con contenido custom, regenerar, verificar que `.origin` contiene el body custom preservado
- [x] 8.6 Probar manualmente: quitar la declaración de region del template, regenerar, verificar `[REGION DROPPED]` siempre visible
