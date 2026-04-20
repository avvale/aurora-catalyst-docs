/**
 * import-from-sources.ts
 *
 * Mirrors auto-generated content from sibling Aurora repos into the docs site,
 * grouped by source repo:
 *   - <source>/docs/                       → src/content/docs/<locale>/reference/cli-commands/  (only slug=cli)
 *   - <source>/docs-api/                   → src/content/docs/<locale>/reference/api/<slug>/
 *
 * Changelog entries (from `openspec/changes/archive/`) are NOT handled here —
 * they are produced by the `changelog-sync` skill, which requires LLM reasoning
 * (classification + bilingual authoring) and therefore lives outside this
 * purely-deterministic script. See `scripts/changelog-sync.ts`.
 *
 * Human-curated pages (tutorials, guides, concepts, hand-written reference)
 * are NEVER touched by this script.
 *
 * Usage:
 *   pnpm sync                              # import every supported section from every source
 *   pnpm sync --source cli                 # only the CLI repo
 *   pnpm sync --skip-cli-commands          # keep existing cli-commands dir as-is
 *   pnpm sync --skip-api                   # keep existing api dir as-is
 *   pnpm sync --help
 */

import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import {
  CONTENT_LOCALES,
  DOCS_ROOT,
  type Locale,
  type Source,
  SOURCES,
  sourcePath,
  targetFor,
} from './lib/sources.js';

// ─── Args ────────────────────────────────────────────────────────────

interface Options {
  only: null | string;
  skipApi: boolean;
  skipCliCommands: boolean;
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    only: null,
    skipApi: false,
    skipCliCommands: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--source') options.only = argv[++i];
    else if (arg === '--skip-cli-commands') options.skipCliCommands = true;
    else if (arg === '--skip-api') options.skipApi = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: pnpm sync [options]

Options:
  --source <slug>       Only import from this source (one of: ${SOURCES.map((s) => s.slug).join(', ')})
  --skip-cli-commands   Skip CLI reference generation
  --skip-api            Skip TypeDoc API generation
  --help                Show this help

Note: changelog entries are produced by the changelog-sync skill, not by this script.
`);
      process.exit(0);
    }
  }
  return options;
}

// ─── FS helpers ──────────────────────────────────────────────────────

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

async function resetDir(dir: string): Promise<void> {
  if (existsSync(dir)) await rm(dir, { force: true, recursive: true });
  await ensureDir(dir);
}

async function walkMarkdown(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walkMarkdown(full)));
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      out.push(full);
    }
  }
  return out;
}

// ─── Frontmatter injection (oclif/TypeDoc output comes raw) ──────────

const TRANSLATION_NOTE: Record<Locale, string> = {
  en: [
    ':::note[Auto-generated reference]',
    'This section is auto-generated from the source code in the linked repo. The surrounding wrappers (titles, breadcrumbs, landings) are localized, but the technical content itself is kept in the source language to stay in sync with the source. Industry standard for technical reference.',
    ':::',
  ].join('\n'),
  es: [
    ':::note[Referencia autogenerada]',
    'Esta sección se genera automáticamente desde el código fuente del repo vinculado. Los envoltorios (títulos, breadcrumbs, landings) están localizados, pero el contenido técnico se mantiene en el idioma de la fuente para estar sincronizado con ella. Es el estándar de la industria para referencia técnica.',
    ':::',
  ].join('\n'),
};

function humanize(slug: string): string {
  const stripped = slug.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  const words = stripped.split('-').filter(Boolean);
  if (words.length === 0) return slug;
  return words
    .map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function yamlString(s: string): string {
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

async function ensureFrontmatter(filePath: string, title: string): Promise<void> {
  const raw = await readFile(filePath, 'utf8');
  if (raw.startsWith('---\n') || raw.startsWith('---\r\n')) return;
  const fm = `---\ntitle: ${yamlString(title)}\n---\n\n`;
  await writeFile(filePath, fm + raw, 'utf8');
}

async function injectGenericFrontmatterUnder(dir: string): Promise<void> {
  const files = await walkMarkdown(dir);
  for (const file of files) {
    const base = path.basename(file, path.extname(file));
    const title = humanize(base === 'README' ? 'overview' : base);
    await ensureFrontmatter(file, title);
  }
}

// ─── Importers ───────────────────────────────────────────────────────

async function mirrorCliCommandsFor(source: Source): Promise<void> {
  const repoRoot = sourcePath(source);
  if (!existsSync(repoRoot)) {
    console.warn(`[skip] ${source.slug}: repo not found at ${repoRoot}`);
    return;
  }
  const sourceDir = path.join(repoRoot, 'docs');
  if (!existsSync(sourceDir)) {
    console.warn(
      `[skip] ${source.slug}: no CLI docs at ${sourceDir}. Run \`oclif readme --multi\` in ${source.repo}.`,
    );
    return;
  }
  for (const locale of CONTENT_LOCALES) {
    const dest = targetFor(locale, 'reference/cli-commands');
    await resetDir(dest);
    await cp(sourceDir, dest, { recursive: true });
    await injectGenericFrontmatterUnder(dest);

    const title = locale === 'es' ? 'Comandos del CLI' : 'CLI commands';
    const description =
      locale === 'es'
        ? `Referencia de los comandos de \`${source.repo}\`. Generada por \`oclif readme --multi\`.`
        : `Reference for the \`${source.repo}\` commands. Produced by \`oclif readme --multi\`.`;
    const intro =
      locale === 'es'
        ? `Cada página describe un topic de \`catalyst\` con sus flags, args y ejemplos.`
        : `Each page describes a \`catalyst\` topic with its flags, args and examples.`;
    await writeFile(
      path.join(dest, 'index.md'),
      [
        `---`,
        `title: ${yamlString(title)}`,
        `description: ${yamlString(description)}`,
        `---`,
        ``,
        intro,
        ``,
        TRANSLATION_NOTE[locale],
        ``,
      ].join('\n'),
      'utf8',
    );
    console.log(`[ok] ${source.slug} cli-commands → ${path.relative(DOCS_ROOT, dest)}`);
  }
}

async function mirrorApiFor(source: Source): Promise<void> {
  const repoRoot = sourcePath(source);
  if (!existsSync(repoRoot)) {
    console.warn(`[skip] ${source.slug}: repo not found at ${repoRoot}`);
    return;
  }
  const sourceDir = path.join(repoRoot, 'docs-api');
  if (!existsSync(sourceDir)) {
    console.warn(
      `[skip] ${source.slug}: no TypeDoc output at ${sourceDir}. Run the TypeDoc script in ${source.repo}.`,
    );
    return;
  }
  for (const locale of CONTENT_LOCALES) {
    const dest = targetFor(locale, path.join('reference/api', source.slug));
    await resetDir(dest);
    await cp(sourceDir, dest, { recursive: true });
    await injectGenericFrontmatterUnder(dest);

    const title =
      locale === 'es' ? `API · ${source.label.es}` : `API · ${source.label.en}`;
    const description =
      locale === 'es'
        ? `Superficie TypeScript pública de \`${source.repo}\`. Generada por TypeDoc.`
        : `Public TypeScript surface of \`${source.repo}\`. Produced by TypeDoc.`;
    const intro =
      locale === 'es'
        ? `Cada página corresponde a un módulo, interfaz, función o tipo exportado desde \`${source.repo}\`.`
        : `Each page corresponds to a module, interface, function, or type exported from \`${source.repo}\`.`;
    await writeFile(
      path.join(dest, 'index.md'),
      [
        `---`,
        `title: ${yamlString(title)}`,
        `description: ${yamlString(description)}`,
        `---`,
        ``,
        intro,
        ``,
        TRANSLATION_NOTE[locale],
        ``,
      ].join('\n'),
      'utf8',
    );
    console.log(`[ok] ${source.slug} api → ${path.relative(DOCS_ROOT, dest)}`);
  }
}

// ─── Main ────────────────────────────────────────────────────────────

async function resetAutoGenRoots(
  options: Options,
  sources: Source[],
): Promise<void> {
  for (const locale of CONTENT_LOCALES) {
    if (!options.skipCliCommands && sources.some((s) => s.hasCli)) {
      await resetDir(targetFor(locale, 'reference/cli-commands'));
    }
    if (!options.skipApi && sources.some((s) => s.hasApi)) {
      await resetDir(targetFor(locale, 'reference/api'));
    }
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const sources = options.only
    ? SOURCES.filter((s) => s.slug === options.only)
    : SOURCES;

  if (options.only && sources.length === 0) {
    console.error(
      `Unknown source: ${options.only}. Known: ${SOURCES.map((s) => s.slug).join(', ')}`,
    );
    process.exit(1);
  }

  await resetAutoGenRoots(options, sources);

  for (const source of sources) {
    console.log(`\n→ ${source.slug} (${source.repo})`);
    if (!options.skipCliCommands && source.hasCli) {
      await mirrorCliCommandsFor(source);
    }
    if (!options.skipApi && source.hasApi) {
      await mirrorApiFor(source);
    }
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
