---
title: Añadir IAM + OAuth al hub
description: Instala los paquetes de Identidad, genera las claves de firma, arranca el hub y entra como el admin sembrado.
sidebar:
  order: 3
---

Ahora convierte el proyecto vacío del paso anterior en un **Aurora Hub**: una instancia Catalyst que es dueña de la identidad y firma sus propios tokens OAuth.

## 1. Añade el paquete Identity del backend

```bash
catalyst add back
```

Cuando te pida *Select a package to add*, elige **Identity (IAM + OAuth)**. Esto instala los bounded contexts `iam` y `o-auth` en el backend. Mira [`catalyst add`](/aurora-catalyst-docs/es/reference/cli-commands/add/).

## 2. Añade el paquete Identity del frontend

```bash
catalyst add front
```

Elige otra vez **Identity (IAM + OAuth)**. Esto cablea la UI de login y las pantallas de IAM correspondientes en el frontend.

## 3. Genera las claves de firma

```bash
catalyst keys
```

Esto escribe `oauth-private.key` y `oauth-public.key` en `backend/.keys/`. Un hub firma sus propios tokens, así que **lee la clave privada al arrancar y no levanta sin ella**. Mira [`catalyst keys`](/aurora-catalyst-docs/es/reference/cli-commands/keys/).

## 4. Selecciona la estrategia de hub

En `backend/.env`, pon la estrategia en `local-provider` — esto es lo que convierte a la app en un hub:

```dotenv
OAUTH_STRATEGY = local-provider
```

El default del scaffold es `none`, así que tienes que ponerlo explícitamente.

## 5. Arranca el hub

```bash
pnpm dev
```

En el primer arranque, el seeder de bootstrap crea las tablas de IAM/OAuth y las puebla — la cuenta admin por defecto, los roles y el cliente OAuth Password.

## 6. Conecta el frontend con el hub

Antes de entrar, alinea las dos puntas de la conexión: las credenciales OAuth del frontend y el origen permitido en el backend.

**Frontend — credenciales OAuth.** El frontend inicia sesión mediante el grant de tipo Password presentando un **código de aplicación** y un **secreto** OAuth. Estos tienen que coincidir con la aplicación OAuth que el seeder acaba de registrar en la base de datos (paso 5). Cada fichero de entorno bajo `frontend/src/environments/` lleva su propio bloque `oAuth`:

```ts
// frontend/src/environments/environment.ts (y .local.ts, .dev.ts, .qa.ts, .prod.ts)
oAuth: {
  applicationCode: 'aurora',
  applicationSecret: 'aurora-dev-secret',
},
```

El scaffold trae estos valores de desarrollo ya alineados con la aplicación sembrada, así que el login local funciona tal cual. Cuando registres una aplicación distinta —o sobrescribas `BOOTSTRAP_OAUTH_APP_CODE` / `BOOTSTRAP_OAUTH_APP_SECRET` en el backend— define `applicationCode` y `applicationSecret` en **cada** `environment.*.ts` con los datos registrados en la base de datos, o el grant Password será rechazado.

**Backend — origen permitido (CORS).** En `backend/.env`, pon `APP_CORS_ORIGIN` con la URL del frontend que va a llamar al hub:

```dotenv
APP_CORS_ORIGIN = http://localhost:4200
```

El scaffold lo deja vacío, lo que habilita un CORS abierto sin credenciales: suficiente para el login local por password. Pero los flujos con credenciales del hub (la cookie `hub_session` del Authorization Code) necesitan una allowlist explícita —un comodín no vale con credenciales—, así que conviene fijarlo al origen real del frontend desde el principio.

## 7. Entra

Abre el frontend en [http://localhost:4200](http://localhost:4200) e inicia sesión con el admin sembrado:

| Campo | Valor |
| --- | --- |
| Email | `admin@aurora.dev` |
| Contraseña | `admin1234` |

## 8. Permite tus satélites en CORS

Si vas a añadir apps satélite (el siguiente paso), amplía el `APP_CORS_ORIGIN` que fijaste en el paso 6 con el origen de cada frontend que vaya a llamar a este hub, separados por comas:

```dotenv
APP_CORS_ORIGIN = http://localhost:4200,http://localhost:4201
```

Mantén el propio frontend del hub (`:4200`) y suma el de cada satélite (p. ej. `:4201`).

## Siguiente

El hub está en marcha y es dueño de la identidad. Ahora, [instala un satélite Aurora](/aurora-catalyst-docs/es/tutorials/getting-started/install-satellite/) que delegue su login aquí.
