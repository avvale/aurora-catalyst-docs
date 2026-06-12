---
title: Instalar Aurora Catalyst
description: Genera un nuevo monorepo Catalyst y apunta su backend a una base de datos.
sidebar:
  order: 2
---

Con el CLI ya instalado, este paso genera el proyecto que se convertirá en tu **hub**. El procedimiento es el mismo para cualquier app Catalyst — la distinción hub/satélite llega después, desde la configuración.

## 1. Genera el proyecto

```bash
catalyst new aurora-hub
```

Esto crea un monorepo Aurora (un workspace `backend/` + `frontend/`) llamado `aurora-hub`. Mira [`catalyst new`](/aurora-catalyst-docs/es/reference/cli-commands/new/).

## 2. Establece la conexión a la base de datos

Abre `backend/.env` y apunta el bloque `DATABASE_*` a una base de datos SQL que puedas alcanzar:

```dotenv
DATABASE_DIALECT = postgres
DATABASE_HOST = localhost
DATABASE_PORT = 5432
DATABASE_USER = postgres
DATABASE_PASSWORD = postgres
DATABASE_SCHEMA = database-schema
```

El scaffold usa PostgreSQL por defecto. Cada app Catalyst necesita su **propia** base de datos o esquema — cuando añadas un satélite más adelante, dale uno separado para que no choquen.

## 3. Deja que Catalyst cree las tablas

En el mismo `backend/.env`, activa la sincronización del esquema:

```dotenv
DATABASE_SYNCHRONIZE = true
```

Con la sincronización activada, el ORM construye el esquema a partir de las entidades al arrancar, así no tienes que escribir migraciones solo para empezar.

:::caution
`DATABASE_SYNCHRONIZE = true` es solo para desarrollo local. Puede alterar o borrar columnas para que cuadren con las entidades. Desactívalo — y usa migraciones — antes de apuntar la app a cualquier base de datos compartida o de producción.
:::

## Siguiente

Tu proyecto está generado y conectado a una base de datos. Ahora, [añade IAM + OAuth al hub](/aurora-catalyst-docs/es/tutorials/getting-started/add-iam-oauth/) para convertirlo en un proveedor de identidad.
