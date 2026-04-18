---
title: "Ai"
---

`catalyst ai`
=============

AI provider configuration sync (CLAUDE.md, AGENTS.md, skills symlinks)

* [`catalyst ai setup`](#catalyst-ai-setup)

## `catalyst ai setup`

Generate AI provider instruction files and skill symlinks from .ai/ source of truth.

```
USAGE
  $ catalyst ai setup [--all] [--dry-run] [-f] [-p claude|codex|copilot|gemini|opencode...] [-t <value>]

FLAGS
  -f, --force                 Overwrite existing files without confirmation
  -p, --provider=<option>...  Provider(s) to configure (repeatable)
                              <options: claude|codex|copilot|gemini|opencode>
  -t, --target=<value>        Generate only for a specific target directory
      --all                   Configure all available providers
      --dry-run               Show what would be generated without writing files

DESCRIPTION
  Generate AI provider instruction files and skill symlinks from .ai/ source of truth.

EXAMPLES
  $ catalyst ai setup --all

  $ catalyst ai setup --provider claude

  $ catalyst ai setup --provider claude --provider opencode

  $ catalyst ai setup --provider claude --target backend

  $ catalyst ai setup --all --dry-run

  $ catalyst ai setup --all --force
```

_See code: [src/commands/ai/setup.ts](https://github.com/avvale/aurora-catalyst-cli/blob/v1.0.0/src/commands/ai/setup.ts)_
