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

import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
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

// ─── Frontmatter injection (openspec archives come without it) ──────

type Locale = (typeof CONTENT_LOCALES)[number];

const WELL_KNOWN_TITLES: Record<string, Record<Locale, string>> = {
  design: { en: 'Design', es: 'Diseño' },
  proposal: { en: 'Proposal', es: 'Propuesta' },
  tasks: { en: 'Tasks', es: 'Tareas' },
};

const SPEC_LABEL: Record<Locale, string> = { en: 'Spec', es: 'Spec' };

/** Convert a kebab-case slug to sentence case, stripping a YYYY-MM-DD- prefix. */
function humanize(slug: string): string {
  const stripped = slug.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  const words = stripped.split('-').filter(Boolean);
  if (words.length === 0) return slug;
  return words
    .map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/** Escape a string to safely appear as a YAML scalar in double quotes. */
function yamlString(s: string): string {
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function titleForMdFile(filePath: string, locale: Locale): string {
  const base = path.basename(filePath, path.extname(filePath));
  const parent = path.basename(path.dirname(filePath));
  if (base === 'spec') return `${SPEC_LABEL[locale]}: ${humanize(parent)}`;
  const well = WELL_KNOWN_TITLES[base];
  if (well) return well[locale];
  return humanize(base);
}

async function ensureFrontmatter(
  filePath: string,
  title: string,
): Promise<void> {
  const raw = await readFile(filePath, 'utf8');
  if (raw.startsWith('---\n') || raw.startsWith('---\r\n')) return;
  const fm = `---\ntitle: ${yamlString(title)}\n---\n\n`;
  await writeFile(filePath, fm + raw, 'utf8');
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

      // Write an index.md for the change directory (human title from slug).
      const changeTitle = humanize(entry);
      await writeFile(
        path.join(dstPath, 'index.md'),
        `---\ntitle: ${yamlString(changeTitle)}\n---\n\nArchived change \`${entry}\`.\n`,
        'utf8',
      );

      // Inject frontmatter into every .md/.mdx that does not have it.
      const mdFiles = await walkMarkdown(dstPath);
      for (const file of mdFiles) {
        await ensureFrontmatter(file, titleForMdFile(file, locale));
      }
    }

    // Landing index for the /changes/ section as a whole.
    const sectionTitle = locale === 'es' ? 'Historial de cambios' : 'Change history';
    const description =
      locale === 'es'
        ? 'Changes archivados desde los repos de código. Autogenerado.'
        : 'Archived changes from the source repos. Auto-generated.';
    await writeFile(
      path.join(dest, 'index.md'),
      `---\ntitle: ${yamlString(sectionTitle)}\ndescription: ${yamlString(description)}\n---\n\nArchived changes imported from \`openspec/changes/archive/\` in the source repos.\n`,
      'utf8',
    );
    console.log(`[ok] archives → ${path.relative(DOCS_ROOT, dest)}`);
  }
}

/** Add a frontmatter with `title: humanize(basename)` to every .md in a dir. */
async function injectFrontmatterUnder(dir: string): Promise<void> {
  const files = await walkMarkdown(dir);
  for (const file of files) {
    const base = path.basename(file, path.extname(file));
    const title = humanize(base === 'README' ? 'overview' : base);
    await ensureFrontmatter(file, title);
  }
}

async function generateCliCommands(cliPath: string): Promise<void> {
  // oclif readme writes to README.md by default; the multi-page output lives
  // under docs/ within the CLI repo. We import the per-topic pages.
  const source = path.join(cliPath, 'docs');
  if (!existsSync(source)) {
    console.warn(
      `[skip] no CLI docs at ${source}. Run \`oclif readme --multi\` in the CLI repo first.`,
    );
    return;
  }
  for (const locale of CONTENT_LOCALES) {
    const dest = targetFor(locale, 'reference/cli-commands');
    await resetDir(dest);
    await cp(source, dest, { recursive: true });
    await injectFrontmatterUnder(dest);
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
    await injectFrontmatterUnder(dest);
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
