---
title: "Permisos frescos al emitir tokens"
description: "Cada login y renovación de token recalcula ahora el snapshot dPermissions de la cuenta desde sus roles actuales, así los cambios de permisos llegan de verdad a los usuarios."
date: 2026-06-11
version: "Unreleased"
classification: feature
source_commit: "15878aea6259969da06ee4aeec8eb2574e17e4a2"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/15878aea6259969da06ee4aeec8eb2574e17e4a2/openspec/changes/archive/2026-06-11-refresh-dpermissions-on-token-issuance/"
---

> Generado automáticamente desde el archivo fuente. No editar a mano — vuelve a ejecutar `catalyst-changelog-sync`.

## Qué cambió

- Los tres grants de OAuth (password, authorization_code, refresh_token) refrescan ahora el snapshot denormalizado `dPermissions` de la cuenta desde sus roles y permisos actuales al emitir tokens, persistiéndolo solo si realmente cambió.
- El account loader cross-BC (`IAccountLoader.loadById`) gana una opción opt-in `refreshPermissions`; sin ella, el comportamiento es exactamente el de antes.
- El refresco es fail-soft: si el recálculo o su persistencia fallan, los tokens se emiten igualmente con el snapshot almacenado — un login nunca se bloquea por este paso de mantenimiento.

## Por qué importa

Conceder o revocar un permiso en un rol antes no llegaba nunca a las cuentas con ese rol: el snapshot solo se recalculaba al editar la propia cuenta, así que la autorización corría contra datos obsoletos indefinidamente. Ahora el contrato es simple — un cambio en los permisos de un rol surte efecto en el siguiente login o renovación de token del usuario, más como mucho los cinco minutos de la caché del guard. Las respuestas de token, los claims del JWT y todas las validaciones de los grants no cambian.

---

[Ver propuesta original](https://github.com/avvale/aurora-catalyst/tree/15878aea6259969da06ee4aeec8eb2574e17e4a2/openspec/changes/archive/2026-06-11-refresh-dpermissions-on-token-issuance/)
