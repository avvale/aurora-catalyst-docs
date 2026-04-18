---
title: "Design"
---

## Context

El engine de generación actual (`src/generator/engine/`) usa un pipeline determinista:

1. `template-engine.ts` renderiza el `.eta` en memoria.
2. `prettier-engine.ts` formatea el contenido.
3. `file-writer.ts` calcula `sha1(contents)` y lo compara contra el `integrity` del lockfile (`cliter/{bc}/.locks/{scope}/{module}.lock.json`).
4. Si coincide → overwrite. Si no → `.origin`.
5. `lock-file.ts` persiste los nuevos hashes tras la generación.

Este flujo garantiza no pisar trabajo del usuario, pero obliga a merge manual **siempre que el usuario toque algo**, aunque sólo haya añadido una línea en una zona designada para personalización. Queremos que esa zona sea contractualmente preservable: el usuario la escribe, el CLI no la toca al regenerar SI el usuario la tocó; pero SÍ la actualiza si el usuario no la tocó (para que mejoras del template se propaguen).

Stakeholders: (1) el mantenedor del CLI, que depende de que los templates generen output reproducible; (2) el desarrollador consumidor, que necesita poder personalizar regions dentro de ficheros regenerables sin perder el cambio al re-ejecutar `catalyst generate`; (3) la IA (Claude Code) que escribe dentro de regions siguiendo el contrato.

Constraints:

- Backward compatibility con lockfiles `0.0.1` existentes (proyectos ya en uso).
- Sin cambios disruptivos al shape `LockFile { integrity, path }`; añadir `regions?` como campo opcional.
- Mantener el contrato de `FILE_TAGS` (ficheros ignored se saltan entero).
- El merge es single-pass: no podemos pedirle al usuario que resuelva conflictos de regions; el contrato es "tu cuerpo sobrevive tal cual si lo tocaste, si no lo actualizo".

## Goals / Non-Goals

**Goals:**

- Preservation regions con marcadores canónicos `AURORA:<NAME>-START/END` en HTML.
- Hash de integridad region-aware (`sha1WithPreservation`) que ignora cuerpos de regions pero detecta cambios de skeleton y de nombres de marcadores.
- **Per-region hash tracking** que permite propagar mejoras del template cuando el usuario no tocó una region específica.
- Normalización de whitespace (`\r\n` → `\n`, trim trailing) antes de hashear cuerpos, para evitar falsos positivos por ruido del editor.
- Merge automático en regeneración: skeleton determinista + cuerpos según decisión per-region.
- Comportamiento intacto para ficheros sin regions (backward compat byte-a-byte).
- Errores claros ante marcadores malformados.
- Parser lineal con stack (no regex global con backref) para detectar marcadores desbalanceados, nesting y kind/suffix mismatch.

**Non-Goals:**

- **Adoptar regions en los templates existentes.** Este change sólo habilita la infraestructura; la marcación real de zonas customizables en cada `.eta` es trabajo posterior.
- **Soporte de `/* */` (TS/JS/CSS) o `#` (GraphQL/YAML)** en este change. Arquitectura preparada para añadirlos, pero fuera de scope.
- **Regions ad hoc del usuario** (tipo `CUSTOMIZABLE` sin declaración del template). Rechazado por el problema de anclaje: si el template no emite marcador, no hay posición canónica donde inyectar el body preservado en el newContent.
- **Nested regions.** Fuera de scope; se falla rápido si se detectan.
- **Migración automática de lockfiles**. El bump a `0.1.0` es informativo; no reescribimos lockfiles existentes hasta la siguiente regeneración. Lockfiles `0.0.1` sin campo `regions` caen al fallback "preservar todo".
- **Formatear el cuerpo de una region**. El usuario es dueño del formato dentro de sus regions (salvo por la normalización de `\r\n` y trailing whitespace, que se aplica al hash pero NO al contenido escrito en disco).
- **Resolver conflictos estructurales** (p. ej. region borrada del template con contenido custom en disco). Emitimos warning `[REGION DROPPED]` y seguimos; no bloqueamos la generación.
- **Rename de regions por el template**: operación disruptiva, responsabilidad del template author.

## Decisions

### Decisión 1: Formato canónico de marcador + scope HTML

**Elegido:** `<!-- #region AURORA:<NAME>-START -->` / `<!-- #endregion AURORA:<NAME>-END -->` con `<NAME>` siguiendo la gramática `[A-Z][A-Z0-9]*(-[A-Z0-9]+)*`. Scope inicial: sólo HTML.

**Alternativa descartada 1:** `#region AI-generated code` (propuesta en SPEC-04 del ROADMAP).

- Sin namespace → colisiona con convenciones VS Code nativas.
- Sin diferenciación START/END → si un fichero tiene varias regions del mismo nombre, el matcher no distingue pares.
- Sin nombre discriminador → no podemos extraer múltiples regions diferenciadas por nombre.

**Alternativa descartada 2:** Nombre FIJO único (`AURORA:CUSTOMIZABLE-START/END`).

- Imposibilita per-region hash tracking cuando hay varias regions en un mismo fichero (no hay forma estable de distinguir region 1 de region 2 salvo por índice posicional, que es frágil).
- Limita a una region por fichero, insuficiente para formularios complejos.

**Alternativa descartada 3:** Soportar `/* */` (TS/JS/CSS) en este change.

- Incrementa la superficie de tests sin aportar valor inmediato (los templates de arranque sólo taggearán HTML). Se deja la puerta abierta: añadir un patrón de tokens más es trivial.

**Rationale:** El formato elegido es compatible con `#region` de VS Code (que muestra fold arrows), namespaced (inconfundible con código de usuario), y permite múltiples regions diferenciadas por nombre. La gramática `[A-Z][A-Z0-9]*(-[A-Z0-9]+)*` garantiza nombres bien formados sin ambigüedad con el sufijo `-START`/`-END`.

### Decisión 2: Parser lineal con stack, NO regex global con backref

**Elegido:** Un único regex (con named groups) reconoce un token START o END individual. Un parser lineal itera con `matchAll`, mantiene un stack de profundidad 1 y valida consistencia kind↔suffix.

```
NAME = [A-Z][A-Z0-9]*(-[A-Z0-9]+)*
TOKEN_HTML = /<!--[ \t]*#(?<kind>region|endregion)[ \t]+AURORA:(?<name>[A-Z][A-Z0-9]*(-[A-Z0-9]+)*)-(?<suffix>START|END)[ \t]*-->/g
```

Reglas del parser:
- `kind=region` ⟹ `suffix=START`, si no → error `Inconsistent marker: #region must end with -START`.
- `kind=endregion` ⟹ `suffix=END`, si no → error `Inconsistent marker: #endregion must end with -END`.
- START con stack no vacío → error `Nested regions not supported (<outer>, <inner>)`.
- END con stack vacío → error `Unmatched END: <name>`.
- END cuyo `name` no coincide con el START abierto → error `Mismatched END: expected <outer>, found <name>`.
- Fin de archivo con stack no vacío → error `Unmatched START: <name>`.
- Todos los errores incluyen número de línea del token ofensor.

**Alternativa descartada:** Regex global con backreference `\1`.

- `/<!--\s*#region\s+AURORA:(\w[\w-]*)-START\s*-->[\s\S]*?<!--\s*#endregion\s+AURORA:\1-END\s*-->/g`
- Problema 1: si los marcadores están desbalanceados (`START(FOO) ... END(BAR)`), el regex no matchea → el extractor devuelve Map vacío silenciosamente. No detecta errores.
- Problema 2: el lazy `[\s\S]*?` no permite detectar nesting.
- Problema 3: `\w[\w-]*` admite lowercase y underscore, violando la gramática spec.

**Rationale:** Errores de marcadores son bugs de templates que deben salir rápido y claro. Parser lineal es el único mecanismo que permite esto.

### Decisión 3: Algoritmo de `stripPreservationRegions`

**Elegido:** Reemplazar el **cuerpo** entre marcadores por cadena vacía, **preservando los marcadores** en el string hasheado. Esto implica que renombrar un marcador invalida el hash, pero cambiar su cuerpo no.

**Alternativa descartada:** Eliminar marcadores y cuerpo.

- Si borramos los marcadores, renombrar una region no se detectaría → el merge intentaría inyectar el cuerpo viejo en una region con nombre distinto, perdiéndolo silenciosamente.

**Rationale:** Los nombres de regions son parte del contrato del skeleton. Cambiarlos es cambio estructural y debe invalidar la integridad.

### Decisión 4: Per-region hash tracking con normalización

**Elegido:** `LockFile.regions?: Record<string, string>` opcional. `hashRegionBodies(content)` normaliza cada body antes de hashear:

```typescript
function normalizeBody(body: string): string {
  return body.replace(/\r\n/g, '\n').replace(/\s+$/, '');
}
function hashRegionBodies(content: string): Map<string, string> {
  const map = new Map();
  for (const [name, body] of extractPreservationRegions(content)) {
    map.set(name, sha1(normalizeBody(body)));
  }
  return map;
}
```

`mergePreservationRegions(newContent, existingContent, priorHashes?)` decide per-region:

```
para cada region (name, body) en existingContent:
  si priorHashes existe y priorHashes[name] existe:
    si sha1(normalizeBody(body)) === priorHashes[name]:
      → usar body de newContent (usuario no tocó, propagar mejora)
    si no:
      → usar body de existingContent (usuario tocó, preservar)
  si priorHashes no existe o no tiene entrada para name:
    → usar body de existingContent (fallback seguro, backward compat)
```

**Alternativa descartada 1:** No hacer per-region hash (approach simple).

- Congela la region en la versión del día 1. Si el template mejora un input dentro de region y el usuario no tocó nada, se pierde la mejora. Incoherente con el flujo normal del CLI.

**Alternativa descartada 2:** Hashear sin normalizar.

- Cualquier guardado del editor (trailing newline, CRLF) cambiaría el hash → el CLI creería que el usuario tocó → no recibiría updates aunque no hubiera tocado nada.

**Rationale:** El coste es ~130 líneas + tests. A cambio, el template puede iterar y el usuario recibe mejoras transparentemente mientras no haya customizado esa region específica. La normalización cubre el 90% del ruido típico del editor; casos extremos (usuario reformatea a mano) se tratan como "sí tocó" → safe default.

### Decisión 5: Orden Prettier ↔ merge

**Elegido:** Prettier formatea `newContent` completo, luego `mergePreservationRegions` sustituye cuerpos de regions según decisión per-region. Cuando el body preservado viene de `existingContent`, se copia **byte a byte** sin pasar por Prettier. Cuando viene del `newContent` (usuario no tocó), ya está formateado porque Prettier corrió sobre todo el `newContent`.

**Alternativa descartada:** Prettier después del merge.

- Prettier podría reformatear el cuerpo custom del usuario, rompiendo el contrato "tu cuerpo sobrevive tal cual".

**Rationale:** Prettier es responsabilidad del template/CLI; el cuerpo de una region preservada es responsabilidad del usuario. Separar ambas fases mantiene el contrato limpio.

### Decisión 6: `.origin` file incluye regions mergeadas

**Elegido:** Cuando el skeleton fue modificado, el `.origin` contiene `mergePreservationRegions(newContent, existingContent, priorHashes).content`, no `newContent` puro. Usa la misma lógica per-region que el overwrite.

**Alternativa descartada:** `.origin` = `newContent` puro.

- Obligaría al usuario a copiar manualmente sus regions custom. Duplicación innecesaria de trabajo.

**Rationale:** El `.origin` es el punto de partida del merge manual; debe ya contener el trabajo custom del usuario para que el merge se centre en resolver los cambios de skeleton.

### Decisión 7: Region borrada del template → warning, no error

**Elegido:** Si una region existe en disco pero no en `newContent`, emitir `[REGION DROPPED] <filePath>: <regionName>` SIEMPRE (incluso sin `--verbose`) y seguir. El body se pierde; el usuario lo recupera desde git si lo necesita.

**Alternativa descartada:** Fallar la generación.

- Un template puede legítimamente dejar de declarar una region (refactor). Bloquear la generación forzaría al usuario a hackear el template.

**Rationale:** Pérdida de información que merece visibilidad, pero no es bug del engine.

### Decisión 8: Bump `LOCK_JSON_VERSION` a `0.1.0`

**Elegido:** Subir la minor; mantener backward compat. Lockfiles `0.0.1` sin campo `regions` caen al fallback "preservar todo" (opción conservadora).

**Rationale:** Coste cero, permite diagnósticos futuros.

### Decisión 9: Ignored files saltan el pipeline completo

**Elegido:** La detección de `FILE_TAGS.ignoredFile/ignoredGraphQLFile/ignoredHtmlFile` sigue usando `sha1(currentFile)` (full-file hash, no region-aware) y sale antes de cualquier intento de merge de regions.

**Rationale:** Ortogonalidad. Ignored = "no tocar"; regions = "regenerar preservando cuerpos". No se mezclan.

### Decisión 10: Nesting y solapamiento → error duro

**Elegido:** El parser lineal detecta nesting (START con stack no vacío) y lanza error con los nombres de ambos markers.

**Rationale:** KISS. Documentamos la limitación en el SKILL de eta-templating.

### Decisión 11: Logging UX

**Elegido:** Conciliación con los mensajes existentes del CLI.

- El mensaje principal del fichero se mantiene: `[FILE OVERWRITE]`, `[FILE CREATED]`, `[ORIGIN FILE CREATED]`, `[IGNORED FILE]`, `[INFO]`.
- Bajo `--verbose`, anotaciones adicionales por region:
  - `[REGION UPDATED] <file>: <name>` — hash coincide, se propagó body del template.
  - `[REGION PRESERVED] <file>: <name>` — hash no coincide, se respetó body del usuario.
- SIEMPRE visible (no requiere `--verbose`):
  - `[REGION DROPPED] <file>: <name>` — template ya no emite esta region, se pierde body de disco.
- Colores (consistente con el resto del CLI):
  - UPDATED: magenta (como `FILE OVERWRITE`)
  - PRESERVED: cyan (informativo)
  - DROPPED: redBright (warning)

**Rationale:** Mantiene consistencia visual. El usuario que no usa `--verbose` no ve ruido, pero siempre ve los casos de pérdida potencial de datos.

## Risks / Trade-offs

- **Regex con `[\s\S]*?`** → Mitigación: reemplazado por parser lineal con stack.
- **Backref `\1` oculta errores** → Mitigación: parser lineal valida consistencia explícitamente.
- **Whitespace noise del editor** → Mitigación: normalización (`\r\n` → `\n`, trim trailing) antes de hashear. Cubre ~90% de casos. Usuarios que reformatean a mano caen en "sí tocó", safe default.
- **Regions con cuerpo que contenga el propio delimitador** (p. ej. un string con `-->` dentro de una region HTML) → Mitigación: el parser busca el token completo `<!-- #region AURORA:...-START -->`, no caracteres sueltos. Documentar como constraint: el cuerpo no puede contener el token END válido del mismo nombre.
- **Fichero borrado del disco** → Mitigación: la rama "fichero nuevo" de `writeFile` escribe `newContent` tal cual sin merge. Las regions custom se pierden porque el usuario borró el fichero — caso explícito.
- **Performance** → Mitigación: el parser es O(n). Despreciable comparado con Prettier.
- **Lockfile `0.0.1` + fichero con regions ya escritas antes del upgrade** → Mitigación: fallback "preservar todo" protege al usuario. La siguiente regeneración guardará `regions` en el lockfile `0.1.0` y a partir de ahí funciona per-region.
- **Rename de regions por el template** → Mitigación: no lo manejamos. Documentación en el SKILL avisa al template author. Si ocurre, la region vieja sale como `[REGION DROPPED]` y la nueva se trata como primera generación.

## Migration Plan

1. Merge del change a `main`. No requiere migración activa de proyectos consumidores.
2. Al próximo `catalyst generate` en un proyecto ya existente:
   - Los ficheros sin regions siguen validando contra su hash `0.0.1`.
   - El nuevo lockfile se persiste con `version: "0.1.0"` e incluye `regions` por fichero (si hay regions).
3. Los templates se van anotando con regions progresivamente (fuera de scope). En cuanto un template emite una region y el usuario añade contenido dentro, el ciclo de preservación entra en juego.

**Rollback:** Revertir el change. Lockfiles `0.1.0` siguen siendo legibles por el código viejo (`loadLockFiles` sólo lee `.files`; ignora `.regions`). Para ficheros sin regions, nada cambia. Para ficheros con regions ya preservadas, el hash calculado por el código viejo NO coincidirá con el guardado → se generará `.origin`. Pérdida de ergonomía, pero no de datos.

## Open Questions

Ninguna pendiente. Todas las decisiones del review y las aclaraciones posteriores están codificadas en las Decisiones 1-11.
