---
title: "Campo de password rico por defecto"
description: "Los campos de password generados ahora emiten un aurora-password-input compartido con mostrar/ocultar, generador seguro y medidor de fuerza — sin cablear a mano."
date: 2026-06-17
version: "Unreleased"
classification: feature
source_commit: "49897aa3760888352f7db1b4d1c304418293528e"
source_archive_url: "https://github.com/avvale/aurora-catalyst-cli/tree/49897aa3760888352f7db1b4d1c304418293528e/openspec/changes/archive/2026-06-17-redesign-password-field-widget/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Un campo declarado `type: password` ahora genera un `<aurora-password-input>` compartido con botón de mostrar/ocultar y un generador de contraseñas seguro dentro del propio input, más un medidor de fuerza hermano.
- La experiencia rica de password pasa a ser la línea base del generador, no una excepción cosida a mano en cada formulario.

## Por qué importa

Hasta ahora solo el formulario de cuentas hand-authored tenía la UX rica de password; cualquier otro campo de password traía un `<input type="password">` pelado, y mejorar cualquiera de ellos obligaba a cablearlo a mano — justo el anti-patrón que Aurora existe para eliminar. Ahora cualquier campo `type: password` recibe el toggle, el generador cripto-seguro (`createPassword`) y el medidor de fuerza de forma automática. Las labels de accesibilidad viven en el namespace global de i18n. En la siguiente regeneración, los formularios de password muestran un `.origin` que aceptas por fichero.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst-cli/tree/49897aa3760888352f7db1b4d1c304418293528e/openspec/changes/archive/2026-06-17-redesign-password-field-widget/)
