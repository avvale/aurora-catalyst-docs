/**
 * import-from-catalyst.ts
 *
 * Mirrors auto-generated content from sibling Aurora repos into the docs site:
 *   - openspec/changes/archive/* → src/content/docs/changes/
 *   - oclif readme output        → src/content/docs/reference/cli-commands/
 *   - TypeDoc output              → src/content/docs/reference/api/
 *
 * Human-curated pages (tutorials, guides, concepts, hand-written reference)
 * are NEVER touched by this script.
 *
 * Usage:
 *   pnpm import                                   # default: ../aurora-catalyst-cli
 *   pnpm import --cli-path /abs/path/to/cli       # override location
 *   pnpm import --skip-cli-commands --skip-api    # only sync archives
 *
 * Run the equivalent Spanish mirror by setting CONTENT_LOCALES below.
 */

import { cp, mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── Paths ──────────────────────────────────────────────────────────

const DOCS_ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const DEFAULT_CLI_PATH = path.resolve(DOCS_ROOT, '..', 'aurora-catalyst-cli');

const CONTENT_LOCALES = ['en', 'es'] as const;

// ─── Args ───────────────────────────────────────────────────────────

interface Options {
  cliPath: string;
  skipApi: boolean;
  skipArchives: boolean;
  skipCliCommands: boolean;
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    cliPath: DEFAULT_CLI_PATH,
    skipApi: false,
    skipArchives: false,
    skipCliCommands: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--cli-path') options.cliPath = path.resolve(argv[++i]);
    else if (arg === '--skip-archives') options.skipArchives = true;
    else if (arg === '--skip-cli-commands') options.skipCliCommands = true;
    else if (arg === '--skip-api') options.skipApi = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: pnpm import [options]

Options:
  --cli-path <path>       Path to aurora-catalyst-cli (default: ${DEFAULT_CLI_PATH})
  --skip-archives         Skip openspec archive mirror
  --skip-cli-commands     Skip CLI reference generation
  --skip-api              Skip TypeDoc API generation
  --help                  Show this help
`);
      process.exit(0);
    }
  }
  return options;
}

// ─── Helpers ────────────────────────────────────────────────────────

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

async function resetDir(dir: string): Promise<void> {
  if (existsSync(dir)) await rm(dir, { force: true, recursive: true });
  await ensureDir(dir);
}

function targetFor(locale: string, subdir: string): string {
  return path.join(DOCS_ROOT, 'src/content/docs', locale, subdir);
}

// ─── Importers ──────────────────────────────────────────────────────

async function mirrorArchives(cliPath: string): Promise<void> {
  const source = path.join(cliPath, 'openspec/changes/archive');
  if (!existsSync(source)) {
    console.warn(`[skip] no archives at ${source}`);
    return;
  }
  for (const locale of CONTENT_LOCALES) {
    const dest = targetFor(locale, 'changes');
    await resetDir(dest);
    const entries = await readdir(source);
    for (const entry of entries) {
      const srcPath = path.join(source, entry);
      const entryStat = await stat(srcPath);
      if (!entryStat.isDirectory()) continue;
      const dstPath = path.join(dest, entry);
      await cp(srcPath, dstPath, { recursive: true });
      // Starlight needs a frontmatter title for the index page; add one if the
      // archive has a proposal.md and it lacks frontmatter.
      // (Left as TODO — the docs-from-spec skill can post-process.)
    }
    // Write a landing index so the sidebar has an entry.
    const localeLabel = locale === 'es' ? 'Historial de cambios' : 'Change history';
    const description =
      locale === 'es'
        ? 'Changes archivados desde los repos de código. Autogenerado.'
        : 'Archived changes from the source repos. Auto-generated.';
    await writeFile(
      path.join(dest, 'index.md'),
      `---\ntitle: ${localeLabel}\ndescription: ${description}\n---\n\nArchived changes imported from \`openspec/changes/archive/\` in the source repos.\n`,
      'utf8',
    );
    console.log(`[ok] archives → ${path.relative(DOCS_ROOT, dest)}`);
  }
}

async function generateCliCommands(cliPath: string): Promise<void> {
  // oclif readme writes to README.md by default; the multi-page output lives
  // under docs/ within the CLI repo. We import the per-topic pages.
  const source = path.join(cliPath, 'docs');
  if (!existsSync(source)) {
    console.warn(
      `[skip] no CLI docs at ${source}. Run \`pnpm oclif readme --multi\` in the CLI repo first.`,
    );
    return;
  }
  for (const locale of CONTENT_LOCALES) {
    const dest = targetFor(locale, 'reference/cli-commands');
    await resetDir(dest);
    await cp(source, dest, { recursive: true });
    console.log(`[ok] cli-commands → ${path.relative(DOCS_ROOT, dest)}`);
  }
}

async function generateApi(cliPath: string): Promise<void> {
  const source = path.join(cliPath, 'docs-api');
  if (!existsSync(source)) {
    console.warn(
      `[skip] no TypeDoc output at ${source}. Run TypeDoc in the CLI repo first.`,
    );
    return;
  }
  for (const locale of CONTENT_LOCALES) {
    const dest = targetFor(locale, 'reference/api');
    await resetDir(dest);
    await cp(source, dest, { recursive: true });
    console.log(`[ok] api → ${path.relative(DOCS_ROOT, dest)}`);
  }
}

// ─── Main ───────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  if (!existsSync(options.cliPath)) {
    console.error(
      `CLI repo not found at ${options.cliPath}. Pass --cli-path to override.`,
    );
    process.exit(1);
  }

  console.log(`Importing from ${options.cliPath}`);

  if (!options.skipArchives) await mirrorArchives(options.cliPath);
  if (!options.skipCliCommands) await generateCliCommands(options.cliPath);
  if (!options.skipApi) await generateApi(options.cliPath);

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
