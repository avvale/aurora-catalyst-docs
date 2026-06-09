---
title: Instalar un satélite Aurora
description: Genera una segunda app Catalyst y delega todo su login en el hub mediante el flujo Authorization Code de OAuth 2.1 con PKCE.
sidebar:
  order: 4
---

Un **satélite** es una app Catalyst que no conserva formulario de login propio. Los usuarios no autenticados se redirigen al hub, el hub emite los tokens, y el satélite los valida contra el JWKS del hub. Este paso crea uno y lo conecta al hub de los pasos anteriores.

Esta guía asume el hub en `http://localhost:8080`, y el frontend del satélite en `http://localhost:4201` con su backend en `http://localhost:8081`. Ajusta a tu despliegue. Para los roles y el flujo de tokens detrás de estos pasos, mira [Estrategias de autenticación](/aurora-catalyst-docs/es/concepts/backend/authentication-strategies/).

## 1. Genera el satélite

```bash
catalyst new aurora-app1
```

Luego, en `backend/.env`, establece la conexión `DATABASE_*` (su **propia** base de datos — no la del hub) y activa la sincronización para que se creen las tablas:

```dotenv
DATABASE_SYNCHRONIZE = true
```

## 2. Añade el paquete Authorization Code del backend

```bash
catalyst add back
```

Cuando te pida *Select a package to add*, elige **Authorization Code**. Esto instala el paquete BFF que orquesta el ida y vuelta `/authorize` → `/callback` → token. Un satélite no necesita un paquete `iam`/`o-auth` propio — la identidad vive en el hub.

:::note
Un satélite en modo `aurora-hub` valida los tokens contra el JWKS del hub y **nunca firma nada**, así que — a diferencia del hub — **no** necesita `catalyst keys`. No hay par de claves local que generar.
:::

## 3. Registra el cliente del satélite en el hub

En el admin del hub, abre el diálogo *Editar Cliente* y crea un **OAuthClient**:

1. **Grant Type** → `Authorization Code`.
2. **Aplicaciones** → la aplicación a la que pertenece el satélite (p. ej. `Aurora`). Esto enlaza el cliente con la `OAuthApplication` cuyo `code` enviará el satélite.
3. **Nombre** → un nombre descriptivo para la app satélite.
4. **Redirigir** → el callback del satélite, **exacto**: `http://localhost:4201/callback`. Debe ser absoluto `http(s)` y sin fragmento final (`#`); el hub lo compara carácter a carácter tanto en `/authorize` como en el canje del token.
5. Configura las duraciones de token y **Activo = sí**, y guarda.

:::note
El seeder de arranque de un hub nuevo solo crea el cliente **Password**. Añade tú el cliente `Authorization Code`, como se indica arriba.
:::

:::caution[Qué secret usa el satélite]
El satélite se autentica con el `code` y el `secret` de la **aplicación** — *no* con el UUID del `OAuthClient` ni con el campo "Secreto" de este diálogo (ese es vestigial para el grant Authorization Code). El `client_id` es el `OAuthApplication.code` (`aurora`); el `client_secret` es el `OAuthApplication.secret` (el valor que el hub siembra vía `BOOTSTRAP_OAUTH_APP_SECRET`).
:::

## 4. Configura el `.env` del backend del satélite

En el `backend/.env` del satélite:

```dotenv
OAUTH_STRATEGY = aurora-hub
OAUTH_HUB_SERVER_URL = http://localhost:8080
OAUTH_APPLICATION_CODE = aurora
OAUTH_APPLICATION_SECRET = 'xxxxxxxxxxxxxxxxxxxx'
OAUTH_REDIRECT_URI = http://localhost:4201/callback
```

| Variable | Qué es |
| --- | --- |
| `OAUTH_STRATEGY` | `aurora-hub` selecciona el modo satélite. El default es `none` — tienes que ponerlo. |
| `OAUTH_HUB_SERVER_URL` | URL base del backend del **hub**. |
| `OAUTH_APPLICATION_CODE` | El `OAuthApplication.code` del hub. Se envía como `client_id`. |
| `OAUTH_APPLICATION_SECRET` | El `OAuthApplication.secret` del hub. Se usa solo en la cabecera HTTP Basic del backend — nunca llega al frontend. |
| `OAUTH_REDIRECT_URI` | El callback del satélite. Debe ser igual al **Redirigir** del cliente en el hub, exacto. |

Si el satélite corre en el **mismo host** que el hub, dale puertos distintos para que no choquen:

```dotenv
APP_URL = http://localhost:8081
APP_FRONTEND_URL = http://localhost:4201
APP_PORT = 8081
```

:::caution[El problema del `$`]
El secret de la aplicación es una cadena con formato bcrypt que contiene `$`. Enciérrala entre **comillas simples** en `.env`; en `docker-compose` escapa cada `$` como `$$`. Tras cargarla, comprueba que el valor tiene 60 caracteres — un secret truncado da `401 invalid_client`.
:::

## 5. Apunta el frontend del satélite al modo hub

En el fichero de entorno activo (`frontend/src/environments/environment.ts`):

```ts
authStrategy: 'authorization-code',
api: {
  graphql: 'http://localhost:8081/graphql',
  rest: 'http://localhost:8081/api',
},
```

- `authStrategy` pasa del default del scaffold `'password'` a `'authorization-code'`. Este único campo es la fuente de verdad: selecciona el guard de código, quita el formulario de login local y dirige el sign-out a una página terminal.
- Los endpoints `api` apuntan al backend **propio** del satélite (el BFF) en `:8081` — **no** al hub. El ida y vuelta de `/callback` hace POST aquí.

La ruta `/callback` viene precableada y sin guard; no le añadas un guard de autenticación.

Después, fija el puerto de desarrollo del frontend del satélite en `frontend/package.json` para que no choque con el `:4200` del hub:

```json
"start:local": "ng serve --configuration local --port 4201"
```

## 6. Reinicia y arranca

Reinicia el backend del satélite (la estrategia se lee una sola vez al arrancar) y levanta las dos apps.

## 7. Verifica que funciona

Abre una ruta protegida del satélite y observa el ida y vuelta:

1. El navegador se redirige al backend del satélite `…/api/auth/login`, que hace 302 al `…/api/o-auth/authorize` del hub con `code_challenge` y `code_challenge_method=S256`.
2. Te identificas en el **hub**, que redirige a `http://localhost:4201/callback?code=…&state=…`.
3. El callback hace POST a `…/api/auth/token` del satélite, se guardan los tokens y entras autenticado.

Checklist en verde: sin `invalid_request` (el PKCE viajó), sin llamada a `/credentials` (lo heredado desapareció), sin `401` (el secret de la aplicación coincidió), sin bucle de redirección, y el sign-out llega a la página terminal sin rebotar al hub.

## Resolución de problemas

| Síntoma | Causa probable | Arreglo |
| --- | --- | --- |
| `400 invalid_request` | Falta PKCE, o el `client_id` es un UUID (BFF heredado) | Vuelve a traer el BFF (`catalyst add back --force`); pon `OAUTH_APPLICATION_CODE` con el `code` de la aplicación. |
| `400 redirect_uri mismatch` | El **Redirigir** del cliente ≠ `OAUTH_REDIRECT_URI` | Hazlos idénticos — absoluto, sin fragmento. |
| `401 invalid_client` | `OAUTH_APPLICATION_SECRET` incorrecto o truncado | Usa el secret de la aplicación; cuida el escape del `$`; confirma 60 caracteres. |
| `429 ThrottlerException` | Un bucle de redirección martilleando el hub | Arregla el 4xx de fondo y reinicia el hub (el contador del throttle es en memoria). |
| Página en blanco / `NG04002` | Ruta de sign-in del hub mal configurada | Revisa el `OAUTH_SIGN_IN_PATH` del hub (default `/auth/sign-in`). |

## Relacionado

- [Estrategias de autenticación](/aurora-catalyst-docs/es/concepts/backend/authentication-strategies/) — los tres modos y el flujo de tokens.
- [`catalyst add`](/aurora-catalyst-docs/es/reference/cli-commands/add/) — añade el paquete Authorization Code.
