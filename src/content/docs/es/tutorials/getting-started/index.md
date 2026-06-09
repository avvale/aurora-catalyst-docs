---
title: Visión general
description: Levanta un Aurora Hub que es dueño de la identidad y conecta una app satélite que delega su login en el hub.
sidebar:
  label: Visión general
  order: 0
---

Este recorrido te lleva de cero a **dos apps Aurora Catalyst en marcha**:

- Un **Aurora Hub** — una instancia Catalyst que es dueña de la identidad (IAM) y emite tokens OAuth.
- Un **satélite** — una segunda app Catalyst que no conserva formulario de login propio y delega toda la autenticación en el hub.

Al terminar habrás entrado en el hub como el admin sembrado y habrás hecho pasar el login de un satélite por el hub mediante el flujo Authorization Code de OAuth 2.1.

## El modelo mental

Cada backend Catalyst lee una sola variable — `OAUTH_STRATEGY` — para decidir su rol:

| Rol | `OAUTH_STRATEGY` | Qué hace |
| --- | --- | --- |
| **Hub** | `local-provider` | Es dueño de la identidad, firma sus propios tokens y expone un endpoint JWKS. |
| **Satélite** | `aurora-hub` | Confía en los tokens del hub (los valida contra el JWKS del hub) y no conserva usuarios locales. |

Para el cuadro completo de los tres modos y el flujo de tokens, mira [Estrategias de autenticación](/aurora-catalyst-docs/es/concepts/backend/authentication-strategies/).

## Requisitos previos

- Node.js ≥ 18 (y el `npm` que viene con él) — el CLI lo instalarás en el primer paso.
- Una base de datos SQL accesible para **cada** app — el hub y el satélite no deben compartir el mismo esquema.

## Los cuatro pasos

1. [Instalar el CLI de Aurora Catalyst](/aurora-catalyst-docs/es/tutorials/getting-started/install-cli/) — instala el comando `catalyst` de forma global.
2. [Instalar Aurora Catalyst](/aurora-catalyst-docs/es/tutorials/getting-started/install-aurora/) — genera el hub y apúntalo a una base de datos.
3. [Añadir IAM + OAuth al hub](/aurora-catalyst-docs/es/tutorials/getting-started/add-iam-oauth/) — instala los paquetes de identidad, genera las claves de firma y entra.
4. [Instalar un satélite Aurora](/aurora-catalyst-docs/es/tutorials/getting-started/install-satellite/) — genera una segunda app y delega su login en el hub.

Síguelos en orden — cada paso asume que el anterior está hecho.
