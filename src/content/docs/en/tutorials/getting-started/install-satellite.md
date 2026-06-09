---
title: Install an Aurora satellite
description: Scaffold a second Catalyst app and delegate all of its login to the hub via the OAuth 2.1 Authorization Code flow with PKCE.
sidebar:
  order: 4
---

A **satellite** is a Catalyst app that keeps no login form of its own. Unauthenticated users are bounced to the hub, the hub issues the tokens, and the satellite validates them against the hub's JWKS. This step builds one and wires it to the hub from the previous steps.

This guide assumes the hub at `http://localhost:8080`, and the satellite frontend at `http://localhost:4201` with its backend at `http://localhost:8081`. Adjust to your deployment. For the roles and token flow behind these steps, see [Authentication strategies](/aurora-catalyst-docs/en/concepts/backend/authentication-strategies/).

## 1. Scaffold the satellite

```bash
catalyst new aurora-app1
```

Then, in `backend/.env`, set the `DATABASE_*` connection (its **own** database — not the hub's) and turn synchronization on so the tables are created:

```dotenv
DATABASE_SYNCHRONIZE = true
```

## 2. Add the Authorization Code backend package

```bash
catalyst add back
```

When prompted to *Select a package to add*, choose **Authorization Code**. This installs the BFF package that drives the `/authorize` → `/callback` → token round-trip. A satellite needs no `iam`/`o-auth` package of its own — identity lives on the hub.

:::note
A satellite in `aurora-hub` mode validates tokens against the hub's JWKS and **never signs anything**, so — unlike the hub — it does **not** need `catalyst keys`. There is no local key pair to generate.
:::

## 3. Register the satellite's client on the hub

In the hub admin, open the *Edit client* dialog and create an **OAuthClient**:

1. **Grant Type** → `Authorization Code`.
2. **Applications** → the application the satellite belongs to (e.g. `Aurora`). This links the client to the `OAuthApplication` whose `code` the satellite will send.
3. **Name** → a descriptive name for the satellite app.
4. **Redirect** → the satellite's callback, **exactly**: `http://localhost:4201/callback`. It must be absolute `http(s)` with no trailing fragment (`#`); the hub matches it character-for-character at both `/authorize` and the token exchange.
5. Set token lifetimes and **Active = on**, then save.

:::note
A fresh hub's bootstrap seeder only creates the **Password** client. Add the `Authorization Code` client yourself, as above.
:::

:::caution[Which secret the satellite uses]
The satellite authenticates with the **application's** `code` and `secret` — *not* the `OAuthClient` UUID and *not* the client's own "Secret" field in this dialog (that one is vestigial for the Authorization Code grant). `client_id` is the `OAuthApplication.code` (`aurora`); `client_secret` is the `OAuthApplication.secret` (the value the hub seeds via `BOOTSTRAP_OAUTH_APP_SECRET`).
:::

## 4. Configure the satellite backend `.env`

In the satellite's `backend/.env`:

```dotenv
OAUTH_STRATEGY = aurora-hub
OAUTH_HUB_SERVER_URL = http://localhost:8080
OAUTH_APPLICATION_CODE = aurora
OAUTH_APPLICATION_SECRET = 'xxxxxxxxxxxxxxxxxxxx'
OAUTH_REDIRECT_URI = http://localhost:4201/callback
```

| Variable | What it is |
| --- | --- |
| `OAUTH_STRATEGY` | `aurora-hub` selects satellite mode. The default is `none` — you must set it. |
| `OAUTH_HUB_SERVER_URL` | Base URL of the **hub** backend. |
| `OAUTH_APPLICATION_CODE` | The hub `OAuthApplication.code`. Sent as `client_id`. |
| `OAUTH_APPLICATION_SECRET` | The hub `OAuthApplication.secret`. Used only in the backend's HTTP Basic header — never shipped to the frontend. |
| `OAUTH_REDIRECT_URI` | The satellite callback. Must equal the hub client's **Redirect** exactly. |

If the satellite runs on the **same host** as the hub, give it distinct ports so the two don't collide:

```dotenv
APP_URL = http://localhost:8081
APP_FRONTEND_URL = http://localhost:4201
APP_PORT = 8081
```

:::caution[The `$` gotcha]
The application secret is a bcrypt-format string containing `$`. Wrap it in **single quotes** in `.env`; in `docker-compose` escape each `$` as `$$`. After loading, confirm the value is 60 characters — a truncated secret yields `401 invalid_client`.
:::

## 5. Point the satellite frontend at hub mode

In the active environment file (`frontend/src/environments/environment.ts`):

```ts
authStrategy: 'authorization-code',
api: {
  graphql: 'http://localhost:8081/graphql',
  rest: 'http://localhost:8081/api',
},
```

- `authStrategy` flips from the scaffold default `'password'` to `'authorization-code'`. This single field is the source of truth: it selects the code guard, drops the local login form, and routes sign-out to a terminal page.
- The `api` endpoints point at the satellite's **own** backend (the BFF) on `:8081` — **not** the hub. The `/callback` round-trip POSTs here.

The `/callback` route ships pre-wired and unguarded; do not add an auth guard to it.

Then set the satellite frontend's dev port in `frontend/package.json` so it doesn't clash with the hub's `:4200`:

```json
"start:local": "ng serve --configuration local --port 4201"
```

## 6. Restart and run

Restart the satellite backend (the strategy is read once at boot), then start both apps.

## 7. Verify it worked

Open a protected route on the satellite and watch the round-trip:

1. The browser is redirected to the satellite backend `…/api/auth/login`, which 302s to the hub `…/api/o-auth/authorize` with `code_challenge` and `code_challenge_method=S256`.
2. You log in on the **hub**, which redirects to `http://localhost:4201/callback?code=…&state=…`.
3. The callback POSTs to the satellite `…/api/auth/token`, tokens are stored, and you land authenticated.

Green checklist: no `invalid_request` (PKCE travelled), no call to `/credentials` (legacy gone), no `401` (the application secret matched), no redirect loop, and sign-out reaches the terminal page without bouncing back to the hub.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `400 invalid_request` | PKCE missing, or `client_id` is a UUID (legacy BFF) | Re-pull the BFF (`catalyst add back --force`); set `OAUTH_APPLICATION_CODE` to the application `code`. |
| `400 redirect_uri mismatch` | Hub client **Redirect** ≠ `OAUTH_REDIRECT_URI` | Make them identical — absolute, no fragment. |
| `401 invalid_client` | `OAUTH_APPLICATION_SECRET` wrong or truncated | Use the application secret; mind the `$` quoting; confirm 60 chars. |
| `429 ThrottlerException` | A redirect loop hammering the hub | Fix the underlying 4xx, then restart the hub (the throttle counter is in-memory). |
| Blank page / `NG04002` | Hub sign-in path misconfigured | Check the hub's `OAUTH_SIGN_IN_PATH` (default `/auth/sign-in`). |

## Related

- [Authentication strategies](/aurora-catalyst-docs/en/concepts/backend/authentication-strategies/) — the three modes and the token flow.
- [`catalyst add`](/aurora-catalyst-docs/en/reference/cli-commands/add/) — add the Authorization Code package.
