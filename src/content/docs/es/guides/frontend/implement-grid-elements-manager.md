---
title: Implementar un widget grid-elements-manager
description: "Embebe el CRUD de un módulo hijo dentro del detail del padre usando `widget.type: grid-elements-manager`, de extremo a extremo — desde los flags YAML hasta las keys de traducción."
---

## Objetivo

Que el usuario gestione los hijos del padre directamente desde la vista de detail del padre. El widget renderiza la lista del hijo (filtrada al padre actual) y un botón "+ New" que abre el form del hijo en un diálogo — sin salir del padre.

## Antes de empezar

- Un proyecto Catalyst con dos módulos frontend ya scaffoldeados — un padre (p. ej. `iam/bounded-context`) y un hijo (p. ej. `iam/permission`).
- El YAML del hijo declara una relación `many-to-one` apuntando de vuelta al padre — esa es la FK que el codegen lee para cablear el widget. La mayoría de los módulos hijos ya la tienen.
- El `front.detailMode` del padre está sin declarar o en `view`. El modo dialog no puede alojar el widget — el codegen avisa y lo omite para no anidar un diálogo dentro de otro diálogo.
- Puedes ejecutar `catalyst load front module --force` localmente.

## Pasos

1. **Activa el modo embed en el hijo.** En el YAML del hijo, declara `front.embedSupport: true`. Sin el flag, el codegen emite los ficheros de siempre y el regen del padre falla al intentar dispatchar el widget.

   ```yaml
   # cliter/iam/permission.aurora.yaml
   front:
     embedSupport: true
   ```

2. **Regenera el hijo.**

   ```bash
   catalyst load front module --name=iam/permission --force
   ```

   Aparecen tres artefactos nuevos:

   - `iam-permission-form-embed.component.ts` — variante del form cuya FK al padre se inyecta en `submit()`, no se declara como `FormControl`. El input requerido `[parentValue]` lo cablea la lista embebida automáticamente.
   - Factory `getIamPermissionEmbedColumns(...)` en `iam-permission.columns.ts` — las mismas columnas que `Standalone`, menos la del FK al padre (todas las filas en vista embed comparten el mismo padre, así que la columna sería redundante).
   - El list component gana inputs `mode`, `parentFilter`, `parentDefaults` y renderiza sin header ni breadcrumb cuando `mode="embed"`.

3. **Declara el widget en la property del padre.** En el YAML del padre, la property de relación que apunta al hijo recibe `widget.type: grid-elements-manager`. Opcionalmente ubícalo dentro de un tab.

   ```yaml
   # cliter/iam/bounded-context.aurora.yaml
   aggregateProperties:
     - name: permissions
       type: relationship
       relationship:
         type: one-to-many
         singularName: permission
         aggregateName: IamPermission
         modulePath: iam/permission
       widget:
         type: grid-elements-manager
         tab: permissions   # opcional
   ```

   `widget.detailSort` y `widget.isDetailHidden` aplican con normalidad — el widget se trata como un campo lógico a efectos de orden y visibilidad. `widget.span` se ignora: el widget siempre renderiza a ancho completo.

4. **Regenera el padre.**

   ```bash
   catalyst load front module --name=iam/bounded-context --force
   ```

   El codegen lee `iam/permission.aurora.yaml`, encuentra la property cuya `relationship.type === 'many-to-one'` y `relationship.modulePath === 'iam/bounded-context'` (p. ej. `boundedContextId`) y emite la partial dentro del detail shell del padre — envuelta en `@if (mode() === 'edit')` para que solo aparezca cuando el padre ya tiene id. La lista embebida recibe `parentFilter: { field: 'boundedContextId', value: bcId() }` y `parentDefaults: { boundedContextId: bcId() }`.

5. **Añade la key de traducción.** El título de la card del widget usa una key derivada del nombre plural del agregado hijo:

   ```text
   <bcKebab>.<childModKebab>.<ChildAggregatePluralPascal>
   ```

   Para `iam/bounded-context.permissions` → `iam.permission.Permissions`. Añade la entrada a tus ficheros de traducción; el codegen no genera el valor.

## Verifica que funcionó

- Abre el detail del padre en modo `edit` (`/iam/bounded-context/edit/<id>`). Debajo del card del form (o dentro del tab declarado) aparece una sección nueva con la lista de filas hijas filtrada al padre actual.
- Clica "+ New" dentro de la lista embebida. Se abre un diálogo con el form-embed; al guardar crea un hijo cuya FK al padre se setea automáticamente — aunque el FK no tenga campo en el form.
- Abre el padre en modo `new` (`/iam/bounded-context/new`). El widget no aparece — el padre todavía no tiene id, así que no hay con qué asociar hijos.
- La superficie standalone del hijo (`/iam/permission`, `/iam/permission/new`, `/iam/permission/edit/:id`) sigue funcionando sin cambios.

## Troubleshooting

**El regen del padre falla con "target lacks `embedSupport: true`".**
El codegen lee el YAML del hijo para validar la embedabilidad. Añade `front.embedSupport: true` al YAML del hijo y regenera el hijo primero (pasos 1–2), después relanza el regen del padre.

**El regen falla con "child has no many-to-one back-reference".**
El codegen no encontró la property FK en el YAML del hijo. Confirma que el hijo declara un `aggregateProperty` con `relationship.type: many-to-one` y `relationship.modulePath` apuntando al path del padre.

**El widget no aparece.**
Comprueba el `front.detailMode` del padre: si es `dialog`, el codegen registra un warning y omite el widget para no apilar un diálogo dentro de otro diálogo. Cambia a `view` y regenera.

**El widget aparece pero las filas se ven mal.**
La lista embebida reusa la factory `getXEmbedColumns(...)` del hijo. Si personalizaste las columnas del hijo asumiendo que solo existía la factory standalone, revisa que tus ediciones no rompan la factory embed — ambas viven en el mismo fichero `*.columns.ts`.

**`widget.span` no afecta al layout.**
Es lo esperado. El widget es una sección, no un campo — `widget.span` se ignora sobre `grid-elements-manager` y el codegen emite un warning cuando lo declaras.

## Relacionado

- [Widget grid-elements-manager](../../../changes/cli/2026-04-30-spec-15-grid-elements-manager-widget/) — el cambio que introdujo el widget.
- [Detail mode: view o dialog](../../../concepts/frontend/detail-mode/) — por qué el modo dialog no puede alojar el widget.
- [Ancho de campos en formulario](../../../concepts/frontend/form-field-widths/) — el grid que usa el form del padre; el widget renderiza como sección hermana, no como campo.
- [Referencia de `catalyst load`](../../../reference/cli-commands/load/) — cada flag y argumento.
