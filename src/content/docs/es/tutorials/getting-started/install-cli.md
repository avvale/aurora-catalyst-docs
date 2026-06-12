---
title: Instalar el CLI de Aurora Catalyst
description: Instala aurora-catalyst-cli de forma global para que el comando `catalyst` esté disponible antes de generar nada.
sidebar:
  order: 1
  hidden: true
---

Todo este recorrido se apoya en el **CLI de Aurora Catalyst** — el comando `catalyst` que genera proyectos, instala paquetes y genera código. Instálalo una sola vez, de forma global, antes que nada.

## 1. Instala el CLI de forma global

```bash
npm install -g @aurorajs.dev/catalyst-cli
```

Esto descarga [`@aurorajs.dev/catalyst-cli`](https://www.npmjs.com/package/@aurorajs.dev/catalyst-cli) desde npm y deja un ejecutable `catalyst` en tu `PATH`, de modo que puedas usarlo desde cualquier directorio.

:::note
El CLI requiere **Node.js ≥ 24**. Si prefieres otro gestor de paquetes, los equivalentes de instalación global también funcionan — `pnpm add -g @aurorajs.dev/catalyst-cli` o `yarn global add @aurorajs.dev/catalyst-cli`.
:::

## 2. Verifica la instalación

```bash
catalyst --version
```

Esto imprime la versión instalada. Para ver todos los comandos disponibles, ejecuta:

```bash
catalyst --help
```

Para la lista completa, mira la [referencia de comandos del CLI](/aurora-catalyst-docs/es/reference/cli-commands/).

## Siguiente

El CLI está listo. Ahora, [instala Aurora Catalyst](/aurora-catalyst-docs/es/tutorials/getting-started/install-aurora/) para generar tu hub.
