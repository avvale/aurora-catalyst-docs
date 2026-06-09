---
title: Install Aurora Catalyst
description: Scaffold a new Catalyst monorepo and point its backend at a database.
sidebar:
  order: 2
---

With the CLI installed, this step scaffolds the project that will become your **hub**. The procedure is the same for any Catalyst app — the hub/satellite distinction comes later, from configuration.

## 1. Scaffold the project

```bash
catalyst new aurora-hub
```

This creates an Aurora monorepo (a `backend/` + `frontend/` workspace) named `aurora-hub`. See [`catalyst new`](/aurora-catalyst-docs/en/reference/cli-commands/new/).

## 2. Set the database connection

Open `backend/.env` and point the `DATABASE_*` block at a SQL database you can reach:

```dotenv
DATABASE_DIALECT = postgres
DATABASE_HOST = localhost
DATABASE_PORT = 5432
DATABASE_USER = postgres
DATABASE_PASSWORD = postgres
DATABASE_SCHEMA =
```

The scaffold defaults to PostgreSQL. Each Catalyst app needs its **own** database or schema — when you add a satellite later, give it a separate one so the two don't clash.

## 3. Let Catalyst create the tables

In the same `backend/.env`, turn schema synchronization on:

```dotenv
DATABASE_SYNCHRONIZE = true
```

With synchronize on, the ORM builds the schema from the entities at boot, so you don't have to write migrations just to get started.

:::caution
`DATABASE_SYNCHRONIZE = true` is for local development only. It can alter or drop columns to match the entities. Turn it off — and use migrations — before pointing the app at any shared or production database.
:::

## Next

Your project is scaffolded and wired to a database. Next, [add IAM + OAuth to the hub](/aurora-catalyst-docs/en/tutorials/getting-started/add-iam-oauth/) to turn it into an identity provider.
