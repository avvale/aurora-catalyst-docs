---
title: "Plugins"
---

`catalyst plugins`
==================

List installed plugins.

* [`catalyst plugins`](#catalyst-plugins)
* [`catalyst plugins add PLUGIN`](#catalyst-plugins-add-plugin)
* [`catalyst plugins:inspect PLUGIN...`](#catalyst-pluginsinspect-plugin)
* [`catalyst plugins install PLUGIN`](#catalyst-plugins-install-plugin)
* [`catalyst plugins link PATH`](#catalyst-plugins-link-path)
* [`catalyst plugins remove [PLUGIN]`](#catalyst-plugins-remove-plugin)
* [`catalyst plugins reset`](#catalyst-plugins-reset)
* [`catalyst plugins uninstall [PLUGIN]`](#catalyst-plugins-uninstall-plugin)
* [`catalyst plugins unlink [PLUGIN]`](#catalyst-plugins-unlink-plugin)
* [`catalyst plugins update`](#catalyst-plugins-update)

## `catalyst plugins`

List installed plugins.

```
USAGE
  $ catalyst plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ catalyst plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.56/src/commands/plugins/index.ts)_

## `catalyst plugins add PLUGIN`

Installs a plugin into catalyst.

```
USAGE
  $ catalyst plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into catalyst.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the CATALYST_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the CATALYST_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ catalyst plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ catalyst plugins add myplugin

  Install a plugin from a github url.

    $ catalyst plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ catalyst plugins add someuser/someplugin
```

## `catalyst plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ catalyst plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ catalyst plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.56/src/commands/plugins/inspect.ts)_

## `catalyst plugins install PLUGIN`

Installs a plugin into catalyst.

```
USAGE
  $ catalyst plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into catalyst.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the CATALYST_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the CATALYST_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ catalyst plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ catalyst plugins install myplugin

  Install a plugin from a github url.

    $ catalyst plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ catalyst plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.56/src/commands/plugins/install.ts)_

## `catalyst plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ catalyst plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ catalyst plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.56/src/commands/plugins/link.ts)_

## `catalyst plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ catalyst plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ catalyst plugins unlink
  $ catalyst plugins remove

EXAMPLES
  $ catalyst plugins remove myplugin
```

## `catalyst plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ catalyst plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.56/src/commands/plugins/reset.ts)_

## `catalyst plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ catalyst plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ catalyst plugins unlink
  $ catalyst plugins remove

EXAMPLES
  $ catalyst plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.56/src/commands/plugins/uninstall.ts)_

## `catalyst plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ catalyst plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ catalyst plugins unlink
  $ catalyst plugins remove

EXAMPLES
  $ catalyst plugins unlink myplugin
```

## `catalyst plugins update`

Update installed plugins.

```
USAGE
  $ catalyst plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.56/src/commands/plugins/update.ts)_
