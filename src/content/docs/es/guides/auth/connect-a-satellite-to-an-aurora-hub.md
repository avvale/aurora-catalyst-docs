---
title: Conectar un satélite a un Aurora Hub
description: Configura una app Catalyst como satélite que delega el login en un Aurora Hub mediante el flujo Authorization Code con PKCE.
---

## Objetivo

Configurar una app Catalyst para que delegue **todo** el login en un Aurora Hub externo, usando el flujo Authorization Code con PKCE de OAuth 2.1. La app no conserva formulario de login propio — los usuarios no autenticados se redirigen al hub, y el hub emite los tokens.

Para entender los roles y el flujo de tokens detrás de estos pasos, mira [Estrategias de autenticación](/aurora-catalyst-docs/es/concepts/backend/authentication-strategies/).

## Antes de empezar

- Un **Aurora Hub en marcha** — una instancia Catalyst en modo `local-provider` — accesible tanto desde el navegador como desde el backend del satélite. Debe exponer `GET /api/o-auth/authorize`, `POST /api/o-auth/token`, `POST /api/o-auth/session`, `GET /.well-known/jwks.json` y `/graphql`.
- El **código** de la `OAuthApplication` del hub (p. ej. `aurora`) y su **secret** (el valor que el hub siembra vía `BOOTSTRAP_OAUTH_APP_SECRET`).
- Un satélite generado por un CLI reciente — incluye el paquete BFF `authorization-code` y el gating por `authStrategy` en el front. Si tu app es anterior, vuelve a traerlos con `catalyst add back --force`.
- Las URLs que vas a usar. Esta guía asume el hub en `http://localhost:8080`, el frontend del satélite en `http://localhost:4201` y el backend del satélite en `http://localhost:8081`. Ajusta a tu despliegue.

## Pasos

### 1. Registra un cliente Authorization Code en el hub

En el admin del hub, crea un **OAuthClient** (el diálogo *Editar Cliente*):

1. **Grant Type** → `Código de autorización`.
2. **Aplicaciones** → la aplicación a la que pertenece el satélite (p. ej. `Aurora`). Esto enlaza el cliente con la `OAuthApplication` cuyo `code` enviará el satélite.
3. **Redirigir** → el callback del satélite, **exacto**: `http://localhost:4201/callback`. Debe ser absoluto `http(s)`, sin fragmento final (`#`). El hub compara esta cadena carácter a carácter tanto en `/authorize` como en el canje del token.
4. Configura las duraciones de token y **Activo = sí**, y guarda.

:::caution[Qué secret usa el satélite]
El satélite se autentica con el `code` y el `secret` de la **aplicación** — *no* con el UUID del `OAuthClient` ni con el campo "Secreto" de este diálogo (ese es vestigial para el grant Authorization Code). El `client_id` es el `OAuthApplication.code` (`aurora`); el `client_secret` es el `OAuthApplication.secret`.
:::

:::note
El seeder de arranque de un hub nuevo solo crea el cliente **Password**. Añade tú el cliente `AUTHORIZATION_CODE` (admin o GraphQL) como se indica arriba.
:::

### 2. Genera el par de claves RSA en el satélite

```bash
catalyst keys --out ./backend/.keys/
```

Esto escribe `oauth-private.key` y `oauth-public.key`. El modo hub valida los tokens contra el JWKS del hub y nunca firma nada — pero el backend igualmente lee la clave privada al arrancar y revienta sin ella, así que este paso es obligatorio incluso aquí. Mira [`catalyst keys`](/aurora-catalyst-docs/es/reference/cli-commands/keys/).

### 3. Configura el `.env` del backend del satélite

En `backend/.env`:

| Variable | Ejemplo | Qué es |
| --- | --- | --- |
| `OAUTH_STRATEGY` | `aurora-hub` | Selecciona el modo hub. El default es `none` — tienes que ponerlo. |
| `OAUTH_HUB_SERVER_URL` | `http://localhost:8080` | URL base del backend del hub. |
| `OAUTH_APPLICATION_CODE` | `aurora` | El `OAuthApplication.code` del hub. Se envía como `client_id`. |
| `OAUTH_APPLICATION_SECRET` | `'$2y$10$EOA/…'` | El `OAuthApplication.secret` del hub. Se usa solo en la cabecera HTTP Basic del backend — nunca llega al frontend. |
| `OAUTH_REDIRECT_URI` | `http://localhost:4201/callback` | El callback del satélite. Debe ser igual al **Redirigir** del cliente en el hub, exacto. |
| `APP_FRONTEND_URL` | `http://localhost:4201` | URL base del frontend del satélite. |
| `OAUTH_PRIVATE_KEY_PATH` | `./.keys/oauth-private.key` | Su default es este — solo ponlo si guardas las claves en otro sitio. |

:::caution[El problema del `$`]
El secret de la aplicación es una cadena con formato bcrypt que contiene `$`. Enciérrala entre **comillas simples** en `.env`; en `docker-compose` escapa cada `$` como `$$`. Tras cargarla, comprueba que el valor tiene 60 caracteres — un secret truncado da `401 invalid_client`.
:::

### 4. Apunta el frontend del satélite al modo hub

En tu fichero de entorno activo (`frontend/src/environments/environment.ts`):

- Pon **`authStrategy: 'authorization-code'`**. Este único campo es la fuente de verdad: selecciona el guard de código, quita el formulario de login local y dirige el sign-out a una página terminal. El default del scaffold es `'password'`, así que tienes que cambiarlo.
- Pon **`api.rest`** al backend propio del satélite (el BFF), p. ej. `http://localhost:8081/api` — **no** al hub. El ida y vuelta de `/callback` hace POST a este backend.

La ruta `/callback` viene precableada y sin guard; no le añadas un guard de autenticación.

### 5. Reinicia y arranca

Reinicia el backend del satélite (la estrategia se lee una sola vez al arrancar) y levanta las dos apps.

## Verifica que funciona

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
- [`catalyst keys`](/aurora-catalyst-docs/es/reference/cli-commands/keys/) — genera el par de claves RSA.
