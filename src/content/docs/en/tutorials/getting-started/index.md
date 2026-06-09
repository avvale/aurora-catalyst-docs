---
title: Overview
description: Stand up an Aurora Hub that owns identity, then connect a satellite app that delegates its login to the hub.
sidebar:
  label: Overview
  order: 0
---

This walkthrough takes you from zero to **two running Aurora Catalyst apps**:

- An **Aurora Hub** — a Catalyst instance that owns identity (IAM) and issues OAuth tokens.
- A **satellite** — a second Catalyst app that keeps no login form of its own and delegates all authentication to the hub.

By the end you will have logged into the hub as the seeded admin and bounced a satellite's login through the hub via the OAuth 2.1 Authorization Code flow.

## The mental model

Every Catalyst backend reads one variable — `OAUTH_STRATEGY` — to decide its role:

| Role | `OAUTH_STRATEGY` | What it does |
| --- | --- | --- |
| **Hub** | `local-provider` | Owns identity, signs its own tokens, exposes a JWKS endpoint. |
| **Satellite** | `aurora-hub` | Trusts the hub's tokens (validates them against the hub's JWKS) and keeps no local users. |

For the full picture of the three modes and the token flow, see [Authentication strategies](/aurora-catalyst-docs/en/concepts/backend/authentication-strategies/).

## Prerequisites

- Node.js ≥ 18 and a recent `aurora-catalyst-cli`.
- A reachable SQL database for **each** app — the hub and the satellite must not share the same schema.

## The three steps

1. [Install Aurora Catalyst](/aurora-catalyst-docs/en/tutorials/getting-started/install-aurora/) — scaffold the hub and point it at a database.
2. [Add IAM + OAuth to the hub](/aurora-catalyst-docs/en/tutorials/getting-started/add-iam-oauth/) — install the identity packages, generate signing keys, and log in.
3. [Install an Aurora satellite](/aurora-catalyst-docs/en/tutorials/getting-started/install-satellite/) — scaffold a second app and delegate its login to the hub.

Follow them in order — each step assumes the previous one is done.
