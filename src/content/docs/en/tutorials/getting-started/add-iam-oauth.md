---
title: Add IAM + OAuth to the hub
description: Install the Identity packages, generate signing keys, run the hub, and log in as the seeded admin.
sidebar:
  order: 2
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

## 6. Log in

Open the frontend at [http://localhost:4200](http://localhost:4200) and sign in with the seeded admin:

| Field | Value |
| --- | --- |
| Email | `admin@aurora.dev` |
| Password | `admin1234` |

## 7. Allow your satellites through CORS

If you plan to add satellite apps (the next step), list every frontend origin that will call this hub in `backend/.env`:

```dotenv
APP_CORS_ORIGIN = http://localhost:4200,http://localhost:4201
```

The scaffold default is `*`, which is fine for a quick local run but should be narrowed to the real origins. Include the hub's own frontend (`:4200`) and each satellite frontend (e.g. `:4201`).

## Next

The hub is running and owns identity. Next, [install an Aurora satellite](/aurora-catalyst-docs/en/tutorials/getting-started/install-satellite/) that delegates its login here.
