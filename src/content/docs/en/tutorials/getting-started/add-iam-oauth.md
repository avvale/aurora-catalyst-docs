---
title: Add IAM + OAuth to the hub
description: Install the Identity packages, generate signing keys, run the hub, and log in as the seeded admin.
sidebar:
  order: 3
---

Now turn the bare project from the previous step into an **Aurora Hub**: a Catalyst instance that owns identity and signs its own OAuth tokens.

## 1. Add the backend Identity package

```bash
catalyst add back
```

When prompted to *Select a package to add*, choose **Identity (IAM + OAuth)**. This installs the `iam` and `o-auth` bounded contexts into the backend. See [`catalyst add`](/aurora-catalyst-docs/en/reference/cli-commands/add/).

## 2. Add the frontend Identity package

```bash
catalyst add front
```

Choose **Identity (IAM + OAuth)** again. This wires the matching login UI and IAM screens into the frontend.

## 3. Generate the signing keys

```bash
catalyst keys
```

This writes `oauth-private.key` and `oauth-public.key` under `backend/.keys/`. A hub signs its own tokens, so it **reads the private key at boot and will not start without it**. See [`catalyst keys`](/aurora-catalyst-docs/en/reference/cli-commands/keys/).

## 4. Select the hub strategy

In `backend/.env`, set the strategy to `local-provider` — this is what makes the app a hub:

```dotenv
OAUTH_STRATEGY = local-provider
```

The scaffold default is `none`, so you must set this explicitly.

## 5. Run the hub

```bash
pnpm dev
```

On first boot the bootstrap seeder creates the IAM/OAuth tables and populates them — the default admin account, roles, and the Password OAuth client.

## 6. Wire the frontend to the hub

Before you log in, align both ends of the connection: the frontend's OAuth credentials and the backend's allowed origin.

**Frontend — OAuth credentials.** The frontend logs in through the Password grant by presenting an OAuth **application code** and **secret**. These must match the OAuth application the seeder just registered in the database (step 5). Each environment file under `frontend/src/environments/` carries its own `oAuth` block:

```ts
// frontend/src/environments/environment.ts (and .local.ts, .dev.ts, .qa.ts, .prod.ts)
oAuth: {
  applicationCode: 'aurora',
  applicationSecret: 'aurora-dev-secret',
},
```

The scaffold ships these dev values already aligned with the seeded application, so local login works out of the box. When you register a different application — or override `BOOTSTRAP_OAUTH_APP_CODE` / `BOOTSTRAP_OAUTH_APP_SECRET` on the backend — set `applicationCode` and `applicationSecret` in **every** `environment.*.ts` to the values registered in the database, or the Password grant will be rejected.

**Backend — allowed origin (CORS).** In `backend/.env`, set `APP_CORS_ORIGIN` to the frontend URL that will call the hub:

```dotenv
APP_CORS_ORIGIN = http://localhost:4200
```

The scaffold leaves it empty, which enables open, credential-less CORS — enough for the local password login. But the hub's credentialed flows (the `hub_session` cookie of the Authorization Code flow) need an explicit allowlist — a wildcard is not allowed with credentials — so it's best to pin it to the real frontend origin from the start.

## 7. Log in

Open the frontend at [http://localhost:4200](http://localhost:4200) and sign in with the seeded admin:

| Field | Value |
| --- | --- |
| Email | `admin@aurora.dev` |
| Password | `admin1234` |

## 8. Allow your satellites through CORS

If you plan to add satellite apps (the next step), extend the `APP_CORS_ORIGIN` you set in step 6 with each frontend origin that will call this hub, comma-separated:

```dotenv
APP_CORS_ORIGIN = http://localhost:4200,http://localhost:4201
```

Keep the hub's own frontend (`:4200`) and add each satellite frontend (e.g. `:4201`).

## Next

The hub is running and owns identity. Next, [install an Aurora satellite](/aurora-catalyst-docs/en/tutorials/getting-started/install-satellite/) that delegates its login here.
