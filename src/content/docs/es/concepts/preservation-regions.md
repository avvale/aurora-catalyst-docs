---
title: Preservation regions
description: Cómo Aurora te deja adueñarte de un pedazo de un fichero generado — y por qué ese pedazo sobrevive a las regeneraciones.
---

## Por qué existe

Generar código es una bendición hasta que tocas el output por primera vez. La mayoría de los generadores hacen una de dos cosas: corren una vez y te quedas con el resultado (scaffolding), o corren siempre y te sometes a lo que producen (determinismo puro). Aurora quiere las dos cosas — regeneración determinista que mantenga el proyecto alineado con el template **y** la libertad de customizar lo que el generador no puede acertar.

Los formularios son donde más duele. Un template puede acertar el 80% de los inputs, pero el último 20% — el layout exacto, los campos extra, los validators custom — necesita mano humana. Antes de las preservation regions, cualquier edición dentro de un fichero generado obligaba a Aurora a escribir un `.origin` al lado del original y a delegarte el merge. Hazlo diez veces en un sprint y dejas de regenerar.

Las preservation regions te dan un contrato: **marcas una zona y te adueñas de ella para siempre**. El CLI regenera todo lo que está afuera. Adentro, tu código sobrevive.

## Cómo funciona

Una preservation region es un bloque de comentario HTML que emite el template:

```html
<!-- #region AURORA:FORM-FIELDS-START -->
<input name="displayName" />
<!-- #endregion AURORA:FORM-FIELDS-END -->
```

Pasan dos cosas al regenerar.

**El check de integridad del skeleton ignora los cuerpos de las regions.** Cuando Aurora calcula el hash de un fichero generado, borra todo lo que está entre los marcadores START y END. Mientras no hayas editado la estructura alrededor de tus regions, el fichero se considera "limpio" — y el CLI puede reescribir el skeleton con el nuevo output del template sin preguntarte nada.

**El cuerpo adentro de cada region pasa por una decisión per-region.** El lockfile guarda el hash de lo que el template produjo la última vez en cada region. Al regenerar:

- Si el cuerpo en disco coincide con ese hash → no lo tocaste → Aurora escribe el nuevo cuerpo del template. Las mejoras del template se propagan.
- Si no coincide → lo tocaste → Aurora preserva tu trabajo byte a byte.

Ya está. No hay merge de tres vías, ni marcadores de conflicto, ni reconciliación manual. La region pertenece al template o a ti, y el hash le dice a Aurora cuál.

Si el skeleton mismo fue editado a mano (no sólo el cuerpo de una region), Aurora vuelve al comportamiento viejo del `.origin` — pero con un twist: el `.origin` ya lleva tus regions preservadas, así que el diff que revisas se concentra sólo en los cambios de skeleton.

## Cuándo aplica

Te vas a cruzar con preservation regions en estos momentos:

- Abres un formulario HTML generado y ves `<!-- #region AURORA:FORM-FIELDS-START -->` envolviendo el bloque de inputs. Ese es el contrato. Todo entre ese comentario y el END es tuyo.
- Editas el formulario, regeneras con `catalyst generate`, y el CLI loguea `[REGION PRESERVED] my-form.component.html: FORM-FIELDS`. Tu edición sobrevivió.
- El template se actualiza (un nuevo tipo de campo, mejores atributos de accesibilidad). Regeneras y ves `[REGION UPDATED] my-form.component.html: FORM-FIELDS`. No tenías cambios custom ahí, así que el nuevo cuerpo del template entra transparentemente.
- Ves `[REGION DROPPED] my-form.component.html: OLD-NAME`. Un template que estás consumiendo dejó de declarar esa region. Lo que tenías ahí se perdió — revisa git si lo quieres recuperar.
- Tu lockfile en `cliter/<bc>/.locks/<scope>/<module>.lock.json` gana un campo `regions` por entrada, mapeando nombres de region a hashes. `LOCK_JSON_VERSION` sube de `0.0.1` a `0.1.0`.

## Trade-offs y límites

Las preservation regions se construyeron alrededor de un puñado de decisiones explícitas que conviene tener presentes:

- **Sólo HTML (por ahora).** El scope v1 son los marcadores `<!-- -->`. Los template strings dentro de ficheros `.ts` cuentan — cualquier HTML dentro de una backtick template literal se reconoce. TypeScript plano, CSS, GraphQL, YAML: todavía no. La arquitectura está lista para sumarlos; los tests no.
- **Nada de regions anidadas.** Una region dentro de otra se rechaza al parsear con un error claro. Si necesitas dos zonas customizables cerca, decláralas como hermanas con nombres distintos.
- **Nada de regions libres del usuario.** No puedes meter `AURORA:MI-CUSTOMIZACION` en un template que no la emite. Las preservation regions son un contrato que controla el template — él decide dónde están las costuras. Es un límite deliberado: sin que el template declare el marcador, Aurora no tiene un ancla para volver a inyectar tu cuerpo en el nuevo skeleton en la próxima regeneración.
- **Renombrar es destructivo.** Si el mantenedor de un template renombra `FORM-FIELDS` a `FORM-BODY`, tu contenido existente bajo `FORM-FIELDS` aparece como `[REGION DROPPED]` en la próxima regeneración. La region nueva arranca vacía. Eso es un tema de versionado del template, no una feature del engine.
- **El ruido de whitespace puede costarte updates.** Aurora normaliza los line endings y el trailing whitespace antes de hashear los cuerpos de las regions, lo cual cubre el 90% de los casos (autoguardado del editor, checkouts entre sistemas). Si tu editor reformatea agresivamente el interior de una region, el hash no va a coincidir y vas a "adueñar" esa region aunque no lo hayas querido. Default seguro, pero conviene saberlo.

## Relacionado

- Cómo hacer: Customizar un formulario preservando el layout *(pronto)*
- Cómo hacer: Añadir una preservation region a tu propio template *(pronto)*
- Referencia: [API de `lock-file.ts`](/aurora-catalyst-docs/es/reference/api/cli/generator/engine/lock-file/)
- Referencia: formato del lockfile *(pronto)*
