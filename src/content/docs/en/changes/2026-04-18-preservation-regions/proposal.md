---
title: "Proposal"
---

## Why

El CLI genera código determinista pero no ofrece forma de convivir con código custom (escrito por el desarrollador o por IA) dentro de ficheros regenerables. Hoy, en cuanto el usuario toca un fichero generado, el flujo de regeneración lo marca como modificado y vuelca el nuevo output a `.origin`, obligando a un merge manual cada vez. Esto bloquea la estrategia híbrida (determinista + IA) y convierte la regeneración en un procedimiento de alto costo. Los formularios HTML son el sitio de cambio más frecuente (maquetación que el template no puede atinar al 100%). Necesitamos regiones protegidas cuyos cuerpos se preserven en disco **cuando el usuario los haya tocado**, pero que acepten mejoras del template cuando el usuario no haya tocado nada — para no congelar el código entre delimitadores en la versión del día 1.

## What Changes

- Añadir soporte de **preservation regions** al engine de generación mediante marcadores namespaced `AURORA:<NAME>-START/END` en comentarios HTML (`<!-- -->`).
- **Scope inicial = sólo HTML**. El marcador se reconoce tanto en ficheros `.html` como dentro de template strings HTML embebidos (p. ej. `.ts` con `@Component({ template: '...' })`). Otros lenguajes (TS/JS/CSS con `/* */`) quedan fuera de este change; el engine se diseña para que añadirlos en el futuro requiera sólo un patrón adicional, no cambios arquitectónicos.
- **Gramática del nombre de region**: `[A-Z][A-Z0-9]*(-[A-Z0-9]+)*` — sólo MAYÚSCULAS + dígitos + guiones entre grupos; sin lowercase, sin underscore, sin doble guión, no empieza ni termina con guión.
- Nuevas funciones en `lock-file.ts`:
  - `stripPreservationRegions(content)` — elimina cuerpos de regions preservando marcadores, para el hash del skeleton.
  - `extractPreservationRegions(content)` — parser lineal con stack de profundidad 1, NO regex global con backref; devuelve `Map<name, body>` o lanza errores con número de línea ante marcadores malformados.
  - `hashRegionBodies(content)` — devuelve `Map<name, sha1(normalized(body))>`, donde `normalized = body.replace(/\r\n/g, '\n').replace(/\s+$/, '')` (normaliza line endings + trim trailing whitespace, para evitar falsos positivos por ruido del editor).
  - `mergePreservationRegions(newContent, existingContent, priorHashes?)` — fusiona con semántica per-region hash (ver abajo).
  - `sha1WithPreservation(content)` — `sha1(stripPreservationRegions(content))` para el hash del skeleton.
- **Per-region hash tracking** en el lockfile: `LockFile.regions?: Record<string, string>` (campo opcional). Al regenerar, para cada region:
  - Si `sha1(normalized(existingBody)) === priorHashes[name]` → el usuario **NO tocó** → usar el body del `newContent` (mejoras del template se propagan).
  - Si no coincide → el usuario **SÍ tocó** → preservar el body de `existingContent` byte-a-byte.
  - Si el lockfile no tiene `regions` (lockfile viejo) → fallback seguro: preservar todo.
- Modificar `file-writer.ts`:
  - `writeFile` calcula `integrity` con `sha1WithPreservation` y `regions` con `hashRegionBodies` sobre el contenido final (post-merge).
  - `handleExistingFile` compara con hash region-aware y ejecuta `mergePreservationRegions` pasando `lockEntry.regions` como `priorHashes`.
  - Si el skeleton fue modificado a mano por el usuario → `.origin` se genera con `mergePreservationRegions(newContent, existingContent, priorHashes)` (ya con las regions mergeadas correctamente), no con `newContent` puro.
- **Descarta** el formato alternativo `#region AI-generated code` mencionado en SPEC-04 del ROADMAP (sin namespace, sin delimitadores START/END diferenciados, incompatible con múltiples regions por fichero).
- **Bump `LOCK_JSON_VERSION`** de `0.0.1` → `0.1.0`. Backward compat: lockfiles `0.0.1` sin campo `regions` siguen validándose; el engine cae al fallback "preservar todo" hasta la primera regeneración bajo la nueva versión.
- **Prettier**: corre sobre el `newContent` completo antes del merge; el body de una region NUNCA pasa por Prettier (el merge lo copia byte-a-byte desde el lugar que corresponda según la decisión per-region).
- Coexistencia con `FILE_TAGS.ignoredFile/ignoredGraphQLFile/ignoredHtmlFile`: ficheros ignored siguen saltándose el pipeline completo, SIN merge de regions.
- **Logging UX**: nuevos mensajes bajo `--verbose` para detalle por region (`[REGION UPDATED]` cuando se propaga mejora del template, `[REGION PRESERVED]` cuando se respeta el trabajo del usuario). `[REGION DROPPED]` se emite SIEMPRE (no sólo verbose) porque indica pérdida potencial de datos.
- **Adopción por templates (fuera de scope de este change)**: inicialmente sólo los templates de formularios HTML emitirán marcadores (el sitio de cambio más frecuente). Se documenta una lista RECOMENDADA de nombres en el SKILL de eta-templating (p. ej. `FORM-FIELDS`, `VALIDATORS`) — no obligatoria, el template author elige.
- Tests unitarios para las 5 funciones nuevas + tests de integración para los escenarios críticos.

## Capabilities

### New Capabilities

- `preservation-regions`: Marcadores de zonas protegidas en ficheros generados, scope HTML. Define el formato de marcadores, la gramática del nombre, el parser lineal con detección de marcadores malformados, la semántica de hash region-aware, el per-region hash tracking para decidir cuándo propagar mejoras del template, la interacción con `.origin` files y ficheros ignored, y los mensajes de log del pipeline.

### Modified Capabilities

<!-- No hay specs previos en openspec/specs/ -->

## Impact

- **Código afectado**:
  - `src/generator/engine/lock-file.ts` — 5 funciones nuevas, ninguna firma existente cambia.
  - `src/generator/engine/file-writer.ts` — `writeFile` y `handleExistingFile` pasan a usar `sha1WithPreservation`, a persistir `regions` en el lockfile y a ejecutar merge per-region-hash.
  - `src/generator/domain/config.ts` — bump de `LOCK_JSON_VERSION`.
  - `src/generator/domain/model.ts` — añadir campo opcional `regions?: Record<string, string>` al tipo `LockFile`.
- **Backward compatible**: lockfiles existentes sin regiones y sin campo `regions` siguen validándose correctamente; el fallback "preservar todo" protege a usuarios con regions ya escritas antes del upgrade.
- **Templates**: habilita a los templates `.eta` que emiten HTML a declarar regions. La adopción efectiva (qué templates emiten qué regions) es fuera de scope. El engine ignora regions declaradas en contextos no-HTML (si alguien pega marcadores `<!-- -->` en un fichero `.ts` fuera de un template string, el parser igual los reconoce — es decisión del template author usarlos responsablemente).
- **CLI behaviour externo**: sin cambios en flags ni comandos. Nuevos mensajes de log bajo `--verbose` y `[REGION DROPPED]` siempre visible.
- **Rename de regions por el template**: operación disruptiva (lockfile tiene hash de la region vieja, en disco aparece la nueva → se trata como region nueva y la vieja como DROPPED). Responsabilidad del template author documentarlo y avisar a usuarios. No se maneja en engine.
- **Riesgos**:
  - Regex naïve con backref oculta marcadores desbalanceados → mitigado con parser lineal con stack.
  - Ruido de whitespace en el editor del usuario genera falsos positivos "usuario tocó" → mitigado con normalización (`\r\n` → `\n`, trim trailing whitespace) antes del hash.
  - Nesting de regions no soportado → error duro con número de línea.
- **Puerta abierta a futuros delimitadores**: añadir soporte de `/* */` (TS/JS/CSS) o `#` (GraphQL/YAML) implicará añadir un patrón de tokens más al parser y nada más. La estructura `LockFile.regions` y el algoritmo de merge son agnósticos al delimitador.
