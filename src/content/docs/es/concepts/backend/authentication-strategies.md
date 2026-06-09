---
title: Estrategias de autenticación
description: Los tres modos de OAUTH_STRATEGY — none, local-provider, aurora-hub — el patrón BFF y cómo fluyen los tokens entre un hub y sus satélites.
---

## Por qué existe

Todo backend de Catalyst resuelve una pregunta al arrancar: **¿quién es la autoridad de identidad?** La respuesta es la variable de entorno `OAUTH_STRATEGY`. Se lee una sola vez en el arranque (`resolveAuthenticationMode`) y queda fija durante toda la vida del proceso — no hay cambio por petición. Tiene tres valores, y cada uno le da al backend un rol distinto.

Un valor ausente o vacío usa `none` por defecto, y un valor no reconocido revienta la app al arrancar con un mensaje que lista las opciones válidas. El default cambió a `none` precisamente para que una instalación nueva arranque sin infraestructura de identidad — pero se registra un aviso prominente hasta que elijas un proveedor real.

## Cómo funciona

| `OAUTH_STRATEGY` | Rol | Qué hace el backend |
| --- | --- | --- |
| `none` | sin autoridad | Cada petición llega como una cuenta anónima sin permisos. Los endpoints que no declaran permiso son públicos. Es un estado de arranque transitorio — no para producción. |
| `local-provider` | **la** autoridad (un hub) | Emite sus propios tokens en `POST /api/o-auth/token` (grants Password, Refresh Token y Authorization Code) y publica su clave pública en `GET /.well-known/jwks.json` para que otros los verifiquen. |
| `aurora-hub` | un consumidor (un satélite) | No emite nada. Valida los Bearer entrantes contra el JWKS de un hub externo e hidrata la cuenta desde el hub. El login se delega por completo en el hub. |

Un despliegue con una identidad central y varias apps que delegan es simplemente un hub más uno o varios satélites:

```
        ┌─────────────────────────────┐
        │  HUB   OAUTH_STRATEGY =      │   emite tokens, sirve JWKS,
        │        local-provider        │   es dueño del login
        └──────────────┬──────────────┘
                       │ JWKS + iamMeAccount
        ┌──────────────┴──────────────┐
        │              │              │
   ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
   │satélite │    │satélite │    │satélite │   OAUTH_STRATEGY = aurora-hub
   └─────────┘    └─────────┘    └─────────┘   (delegan el login en el hub)
```

### El flujo Authorization Code

Cuando un satélite delega el login usa el flujo **Authorization Code con PKCE** de OAuth 2.1. El backend del satélite actúa como **Backend-for-Frontend (BFF)**: es el cliente OAuth confidencial, así que el client secret vive solo en el backend del satélite y nunca llega al navegador.

```
SPA ─/auth/login─▶ BFF satélite ──302 /authorize?code_challenge,client_id=aurora,state─▶ HUB
                   (guarda el code_verifier por state)                                    │
HUB (sin sesión) ─302─▶ HUB /sign-in?continue=…  → el usuario entra → cookie hub_session  │
HUB ──302 redirect_uri=…/callback?code=&state=────────────────────────────────────────────┘
SPA /callback ─POST {code,state}─▶ BFF ──POST /token (form, Basic, code, redirect_uri, verifier)─▶ HUB
HUB ──{ access_token, refresh_token }──▶ BFF ──▶ token store del SPA
```

Dos decisiones lo mantienen seguro:

- **PKCE S256 es obligatorio.** El BFF genera un `code_verifier`, envía al hub solo su `code_challenge` SHA-256 y guarda el verifier en el servidor indexado por `state`. El verifier nunca toca el navegador; el hub rechaza un challenge ausente o `plain`.
- **La sesión del hub es una cookie, no un token en una URL.** Tras el login el hub fija una cookie JWT RS256 `httpOnly` (`hub_session`, ~8h) para que el usuario no tenga que volver a identificarse en el siguiente `/authorize`. El token se envía por POST para establecerla — nunca en un query string.

### Cómo lee la identidad un satélite

En modo `aurora-hub` el satélite no emite nada. En cada petición valida el Bearer contra el `/.well-known/jwks.json` del hub (RS256) e hidrata la cuenta llamando a la query GraphQL `iamMeAccount` del hub con el token del usuario. La autorización se resuelve entonces desde `dPermissions` — el `scope` de OAuth es un passthrough cosmético y no concede nada en este modelo de primera parte.

## Cuándo aplica

- Ves el aviso de arranque de que `OAUTH_STRATEGY=none` y necesitas elegir un proveedor real.
- Estás conectando una app nueva para que delegue el login en un hub existente — mira [Conectar un satélite a un Aurora Hub](/aurora-catalyst-docs/es/tutorials/getting-started/install-satellite/).
- Estás depurando un `401 invalid_client` o un `400 invalid_request` durante el ida y vuelta del Authorization Code.

## Concesiones y límites

- **`none` es solo para arranque.** Existe para que una instalación limpia arranque; si lo llevas a producción, todo endpoint sin permiso declarado queda abierto.
- **`aurora-hub` sigue leyendo una clave privada al arrancar.** Aunque un satélite valida vía el JWKS del hub y nunca firma nada, el firmador de JWT se construye al arrancar y lee `OAUTH_PRIVATE_KEY_PATH` en cualquier modo distinto de `none`. Por eso un satélite necesita `.keys/oauth-private.key` presente o revienta al arrancar — genérala con [`catalyst keys`](/aurora-catalyst-docs/es/reference/cli-commands/keys/) incluso en modo hub.
- **Un redirect URI por cliente.** `OAuthClient.redirect` es una sola cadena y se compara de forma exacta; un cliente sirve un único callback de satélite.
- **El almacén del verifier PKCE es en memoria.** Es correcto para un satélite de instancia única; detrás de varias réplicas, un verifier guardado en una instancia es invisible para otra, así que hace falta un almacén compartido antes de escalar horizontalmente.
- **La revocación de tokens tiene un retardo de caché.** La caché de validación del hub retiene una cuenta unos minutos, así que los cambios de permisos no son estrictamente instantáneos.

## Relacionado

- [Conectar un satélite a un Aurora Hub](/aurora-catalyst-docs/es/tutorials/getting-started/install-satellite/) — la receta práctica.
- [`catalyst keys`](/aurora-catalyst-docs/es/reference/cli-commands/keys/) — genera el par de claves RSA.
