---
title: Install Aurora Catalyst
description: Scaffold a new Catalyst monorepo and point its backend at a database.
sidebar:
  order: 2
  hidden: true
---

With the CLI installed, this step scaffolds a new Aurora Catalyst project. The procedure is the same for any Catalyst app — the role it plays is decided later, from configuration.

## 1. Scaffold the project

```bash
catalyst new my-project
```

This creates an Aurora monorepo (a `backend/` + `frontend/` workspace) named `my-project`. See [`catalyst new`](/aurora-catalyst-docs/en/reference/cli-commands/new/).

## 2. Set the database connection

Open `backend/.env` and point the `DATABASE_*` block at a SQL database you can reach:

```dotenv
DATABASE_DIALECT = postgres
DATABASE_HOST = localhost
DATABASE_PORT = 5432
DATABASE_USER = postgres
DATABASE_PASSWORD = postgres
DATABASE_SCHEMA = database-schema
```

The scaffold defaults to PostgreSQL. Each Catalyst app needs its **own** database or schema — if you run more than one app, give each its own so they don't clash.

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

Your project is scaffolded and wired to a database. Next, [add IAM + OAuth](/aurora-catalyst-docs/en/tutorials/getting-started/add-iam-oauth/) to turn it into an identity provider.
