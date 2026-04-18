---
title: "Spec: Preservation regions"
---

## ADDED Requirements

### Requirement: Canonical preservation region markers

El sistema SHALL reconocer preservation regions declaradas con marcadores namespaced `AURORA:<NAME>-START` / `AURORA:<NAME>-END` en comentarios HTML `<!-- -->`. El scope inicial es exclusivamente HTML (ficheros `.html` y template strings HTML embebidos en otros ficheros). Otros delimitadores (`/* */`, `#`) quedan fuera de scope y se podrán añadir en futuros changes sin cambios arquitectónicos.

El nombre de la region SHALL cumplir la gramática `[A-Z][A-Z0-9]*(-[A-Z0-9]+)*`: empieza con una letra mayúscula, continúa con mayúsculas o dígitos, y puede incluir guiones SIEMPRE que cada grupo separado por guión sea no vacío y no termine con guión.

El whitespace interno del marcador SHALL ser sólo espacios o tabs (`[ \t]*`), nunca newlines: un marcador partido en varias líneas NO se reconoce.

#### Scenario: HTML marker recognized

- **WHEN** un fichero contiene `<!-- #region AURORA:FORM-FIELDS-START -->foo<!-- #endregion AURORA:FORM-FIELDS-END -->`
- **THEN** el sistema extrae `FORM-FIELDS` como nombre de region y `foo` como cuerpo

#### Scenario: Marker inside embedded HTML template string

- **WHEN** un fichero `.ts` contiene `` @Component({ template: `<!-- #region AURORA:TEMPLATE-START -->x<!-- #endregion AURORA:TEMPLATE-END -->` }) ``
- **THEN** el sistema reconoce la region igual que en un `.html` puro (el parser busca el token, no depende de la extensión)

#### Scenario: Lowercase name rejected

- **WHEN** un fichero contiene `<!-- #region AURORA:form-fields-START -->x<!-- #endregion AURORA:form-fields-END -->`
- **THEN** el sistema NO lo trata como region válida y `x` entra al cálculo del hash como contenido normal (el marcador queda en el skeleton)

#### Scenario: Underscore in name rejected

- **WHEN** un fichero contiene `<!-- #region AURORA:FORM_FIELDS-START -->x<!-- ... -->`
- **THEN** el sistema NO lo reconoce como region válida

#### Scenario: Double dash in name rejected

- **WHEN** un fichero contiene `<!-- #region AURORA:FORM--FIELDS-START -->x<!-- ... -->`
- **THEN** el sistema NO lo reconoce (la gramática exige grupos no vacíos entre guiones)

#### Scenario: Multi-line marker rejected

- **WHEN** un fichero contiene un marcador partido entre líneas (ej. el `<!--` en una línea y el `#region` en la siguiente)
- **THEN** el sistema NO lo reconoce como marker válido

#### Scenario: Tolerates multiple internal spaces

- **WHEN** un marcador tiene dos o más espacios entre tokens (p. ej. `<!--  #region  AURORA:FORM-FIELDS-START  -->`)
- **THEN** el sistema lo reconoce como válido (`[ \t]*` tolera 0+ espacios/tabs)

#### Scenario: Non-namespaced marker ignored

- **WHEN** un fichero contiene `<!-- #region AI-generated code -->x<!-- #endregion -->`
- **THEN** el sistema NO lo trata como preservation region

### Requirement: Linear parser with stack, no backref regex

El sistema SHALL usar un parser lineal con stack de profundidad 1 para extraer regions. NO SHALL usar un regex global con backreference `\1`. El parser SHALL validar cuatro reglas y fallar con error descriptivo (incluyendo número de línea) ante cualquier violación: kind↔suffix consistency, balance START/END, no nesting, y matching names entre START/END.

#### Scenario: kind=region must end with -START

- **WHEN** un fichero contiene `<!-- #region AURORA:FOO-END -->`
- **THEN** el parser lanza error `Inconsistent marker: #region must end with -START` con la línea

#### Scenario: kind=endregion must end with -END

- **WHEN** un fichero contiene `<!-- #endregion AURORA:FOO-START -->`
- **THEN** el parser lanza error `Inconsistent marker: #endregion must end with -END` con la línea

#### Scenario: START without matching END

- **WHEN** un fichero contiene `<!-- #region AURORA:FOO-START -->` sin su `<!-- #endregion AURORA:FOO-END -->` correspondiente
- **THEN** `extractPreservationRegions` lanza error `Unmatched START: FOO` con la línea del START

#### Scenario: END without matching START

- **WHEN** un fichero contiene `<!-- #endregion AURORA:FOO-END -->` sin un START previo
- **THEN** `extractPreservationRegions` lanza error `Unmatched END: FOO` con la línea del END

#### Scenario: END name mismatches open START

- **WHEN** un fichero contiene `<!-- #region AURORA:FOO-START -->x<!-- #endregion AURORA:BAR-END -->`
- **THEN** el parser lanza error `Mismatched END: expected FOO, found BAR` con la línea del END

#### Scenario: Nested regions rejected

- **WHEN** un fichero contiene `AURORA:OUTER-START ... AURORA:INNER-START ...`
- **THEN** el parser lanza error `Nested regions not supported (OUTER, INNER)` con la línea del INNER

### Requirement: Region-aware integrity hash

El sistema SHALL calcular el hash de integridad del skeleton de ficheros generados usando `sha1WithPreservation`, que excluye los cuerpos de las preservation regions pero preserva los marcadores en el string hasheado. Ficheros sin regions SHALL producir el mismo hash que el `sha1` actual.

#### Scenario: Hash ignores region body content

- **WHEN** dos ficheros tienen idéntico skeleton y distinto contenido dentro de la misma region
- **THEN** `sha1WithPreservation` devuelve el mismo hash para ambos

#### Scenario: Hash detects skeleton changes

- **WHEN** dos ficheros tienen distinto contenido fuera de regions (aunque las regions sean iguales)
- **THEN** `sha1WithPreservation` devuelve hashes distintos

#### Scenario: Hash detects region marker rename

- **WHEN** en un fichero se renombra un marcador (p. ej. `AURORA:FORM-FIELDS` → `AURORA:LIST-BODY`) manteniendo cuerpo idéntico
- **THEN** `sha1WithPreservation` devuelve un hash distinto (los nombres de marcadores son parte del skeleton y se preservan al stripear)

#### Scenario: Backward compatibility for files without regions

- **WHEN** se calcula `sha1WithPreservation(contenido)` sobre un fichero que NO contiene ningún marcador `AURORA:`
- **THEN** el resultado es idéntico a `sha1(contenido)`

### Requirement: Region body hashing with normalization

El sistema SHALL proveer una función `hashRegionBodies(content)` que devuelve `Map<name, sha1(normalizedBody)>`. La normalización aplicada al body antes de hashear SHALL ser:

1. Reemplazar `\r\n` por `\n` (normaliza line endings Windows → Unix)
2. Eliminar trailing whitespace del body completo (`replace(/\s+$/, '')`)

La normalización SHALL aplicarse EXCLUSIVAMENTE al cálculo del hash; el contenido escrito en disco mantiene el formato original del body tal cual.

#### Scenario: CRLF and LF produce same hash

- **WHEN** dos ficheros contienen la misma region con cuerpo idéntico salvo por line endings (uno CRLF, otro LF)
- **THEN** `hashRegionBodies` devuelve el mismo hash para la region en ambos ficheros

#### Scenario: Trailing whitespace ignored in hash

- **WHEN** dos ficheros contienen la misma region pero uno tiene trailing newline/espacios al final del body y el otro no
- **THEN** `hashRegionBodies` devuelve el mismo hash

#### Scenario: Disk content preserves original formatting

- **WHEN** un body tiene CRLF y el merge lo preserva desde disco (caso "usuario tocó")
- **THEN** el fichero escrito mantiene los CRLF originales (la normalización fue sólo para comparar hashes)

### Requirement: Per-region hash tracking

El sistema SHALL persistir un campo opcional `regions?: Record<string, string>` en cada entrada del lockfile, mapeando nombre de region a hash de su cuerpo normalizado en el momento de la escritura. Durante la regeneración, el sistema SHALL decidir per-region si propagar el body del template (hash coincide con el guardado, el usuario no tocó) o preservar el body del disco (hash no coincide, el usuario tocó).

#### Scenario: Region body preserved when user modified it

- **WHEN** el hash normalizado del body en disco NO coincide con `lockEntry.regions[name]`
- **THEN** el merge usa el body de `existingContent` byte-a-byte (el usuario tocó, se respeta)

#### Scenario: Region body updated when user did not modify it

- **WHEN** el hash normalizado del body en disco coincide con `lockEntry.regions[name]`
- **THEN** el merge usa el body de `newContent` (el usuario no tocó, se propaga la mejora del template)

#### Scenario: Legacy lockfile without regions field falls back to preserve-all

- **WHEN** el lockfile no tiene campo `regions` (lockfile `0.0.1` o entrada nueva sin actualizar)
- **THEN** el merge preserva el body de `existingContent` para TODAS las regions (fallback seguro)

#### Scenario: Region present in new but absent in existing

- **WHEN** una region existe en `newContent` pero no en `existingContent` (primera aparición tras un upgrade del template)
- **THEN** el merge deja el body de `newContent` sin modificar

#### Scenario: Region removed from template (dropped)

- **WHEN** una region existe en `existingContent` pero NO en `newContent` (el template dejó de declararla)
- **THEN** el merge devuelve `newContent` tal cual y el body custom se pierde. El sistema SHALL emitir `[REGION DROPPED] <filePath>: <regionName>` SIEMPRE (sin requerir `--verbose`)

#### Scenario: Multiple regions in same file tracked independently

- **WHEN** un fichero contiene varias regions con nombres distintos y el usuario tocó sólo una
- **THEN** las regions no tocadas reciben el body del template, la tocada se preserva, cada una según su propio hash

#### Scenario: Empty region body

- **WHEN** una region existe con cuerpo vacío entre marcadores
- **THEN** `extractPreservationRegions` devuelve una entrada con body `""` y el merge la trata normalmente (hash del string vacío es un valor estable)

### Requirement: Merge on regeneration

Durante la regeneración, cuando un fichero ya existe en disco y tiene entrada en el lockfile, el sistema SHALL comparar usando `sha1WithPreservation`. Si el skeleton NO fue modificado por el usuario, el sistema SHALL escribir el resultado de `mergePreservationRegions(newContent, existingContent, lockEntry.regions)`. Si el skeleton SÍ fue modificado, el sistema SHALL crear un fichero `.origin` que contenga ese mismo merge (no `newContent` puro) para que el merge manual ya incluya el trabajo custom del usuario.

#### Scenario: Skeleton unchanged, regions merged per-hash

- **WHEN** existe un fichero con `sha1WithPreservation(currentFile) === lockEntry.integrity`
- **THEN** el sistema sobreescribe el fichero con el merge resultado: skeleton nuevo + bodies decididos per-region según hash

#### Scenario: Skeleton modified, .origin includes merged regions

- **WHEN** existe un fichero con hash region-aware distinto al del lockfile (skeleton editado a mano)
- **THEN** el sistema crea `<filename>.origin.<ext>` con `mergePreservationRegions(newContent, existingContent, lockEntry.regions).content` y NO toca el fichero original

#### Scenario: File without regions behaves as before

- **WHEN** se regenera un fichero que no contiene ninguna preservation region
- **THEN** el comportamiento es idéntico al previo al change: comparación por hash, overwrite si coincide, `.origin` si no

### Requirement: Interaction with ignored files

El sistema SHALL respetar la semántica existente de `FILE_TAGS.ignoredFile`, `ignoredGraphQLFile`, `ignoredHtmlFile`: ficheros marcados como ignored SHALL saltarse el pipeline COMPLETO, sin intentar extraer ni mergear preservation regions. La detección de ignored SHALL seguir ejecutándose con `sha1(currentFile)` (no region-aware), porque compara hashes estáticos de cabeceras del fichero completo.

#### Scenario: Ignored file skips merge

- **WHEN** un fichero existente tiene primera línea cuyo hash coincide con `FILE_TAGS.ignoredHtmlFile` y contiene además preservation regions
- **THEN** el sistema registra `[IGNORED FILE]` y NO ejecuta `extractPreservationRegions` ni `mergePreservationRegions`

### Requirement: Lockfile version bump

El sistema SHALL incrementar `LOCK_JSON_VERSION` de `0.0.1` a `0.1.0`. Lockfiles con versión `0.0.1` SHALL seguir siendo leídos correctamente; la ausencia del campo `regions` en entradas viejas SHALL disparar el fallback "preservar todo".

#### Scenario: New lockfile emits new version

- **WHEN** se genera un lockfile nuevo tras este change
- **THEN** el campo `version` del lockfile es `"0.1.0"` y las entradas con regions incluyen el campo `regions: Record<string, string>`

#### Scenario: Legacy lockfile still validates files without regions

- **WHEN** existe un lockfile con `version: "0.0.1"` y el fichero asociado no contiene preservation regions
- **THEN** la comparación de integridad sigue pasando sin falso positivo

#### Scenario: Legacy lockfile with file that gained regions after upgrade

- **WHEN** existe un lockfile `0.0.1` (sin campo `regions`) y el fichero en disco ahora tiene regions con bodies custom del usuario
- **THEN** el sistema cae al fallback "preservar todo" y guarda el nuevo lockfile `0.1.0` con el campo `regions` poblado

### Requirement: Prettier interaction

El sistema SHALL ejecutar Prettier sobre el contenido renderizado ANTES del merge. El merge SHALL copiar el body de cada region preservada (caso "usuario tocó") desde el fichero en disco **byte a byte**, sin reformatearlo. El body de regions actualizadas (caso "usuario no tocó") viene de `newContent` y ya está formateado por Prettier (porque corrió sobre todo `newContent`).

#### Scenario: Prettier does not reformat preserved region bodies

- **WHEN** el body preservado viene del disco y tiene formato irregular
- **THEN** el body permanece exactamente igual tras la escritura

#### Scenario: Updated region bodies carry Prettier formatting

- **WHEN** una region se actualiza desde `newContent` (usuario no tocó)
- **THEN** el body escrito respeta el formato de Prettier aplicado al `newContent` completo

### Requirement: Logging UX

El sistema SHALL mantener consistencia con los mensajes existentes del CLI (`[FILE OVERWRITE]`, `[FILE CREATED]`, etc.) y SHALL añadir los siguientes mensajes:

- `[REGION UPDATED] <file>: <name>` — bajo `--verbose` únicamente. Color magenta (mismo que `FILE OVERWRITE`). Se emite cuando el body de una region se actualiza desde el template.
- `[REGION PRESERVED] <file>: <name>` — bajo `--verbose` únicamente. Color cyan. Se emite cuando el body se preserva porque el usuario lo tocó.
- `[REGION DROPPED] <file>: <name>` — SIEMPRE visible (no requiere `--verbose`). Color redBright. Se emite cuando el template ya no declara una region que existe en disco.

#### Scenario: Verbose shows per-region detail

- **WHEN** se regenera un fichero con 2 regions, el usuario tocó una, la otra no, con `--verbose`
- **THEN** el log muestra `[FILE OVERWRITE] <file>`, `[REGION PRESERVED] <file>: <tocada>` y `[REGION UPDATED] <file>: <no-tocada>`

#### Scenario: Dropped region always logged

- **WHEN** se regenera un fichero donde el template dejó de declarar una region que existe en disco, SIN `--verbose`
- **THEN** el log muestra `[REGION DROPPED] <file>: <nombre>` (además de `[FILE OVERWRITE]`)

#### Scenario: No noise without verbose for normal regions

- **WHEN** se regenera un fichero con regions, todas se preservan o actualizan normalmente, SIN `--verbose`
- **THEN** el log muestra sólo el mensaje principal del fichero (`[FILE OVERWRITE]` etc.); los `[REGION ...]` no aparecen
