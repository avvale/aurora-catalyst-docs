/**
 * import-from-sources.ts
 *
 * Mirrors auto-generated content from sibling Aurora repos into the docs site,
 * grouped by source repo:
 *   - <source>/openspec/changes/archive/* → src/content/docs/<locale>/changes/<slug>/
 *   - <source>/docs/                       → src/content/docs/<locale>/reference/cli-commands/  (only slug=cli)
 *   - <source>/docs-api/                   → src/content/docs/<locale>/reference/api/<slug>/
 *
 * Human-curated pages (tutorials, guides, concepts, hand-written reference)
 * are NEVER touched by this script.
 *
 * Usage:
 *   pnpm sync                              # import from every source
 *   pnpm sync --source cli                 # only the CLI repo
 *   pnpm sync --skip-cli-commands          # keep existing cli-commands dir as-is
 *   pnpm sync --skip-api --skip-archives   # only refresh what's left
 *   pnpm sync --help
 */

import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── Paths & sources ─────────────────────────────────────────────────

const DOCS_ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const SIBLINGS_ROOT = path.resolve(DOCS_ROOT, '..');

const CONTENT_LOCALES = ['en', 'es'] as const;
type Locale = (typeof CONTENT_LOCALES)[number];

interface Source {
  /** Short identifier used in URLs and as a sidebar label. */
  slug: string;
  /** Repo folder name on disk (resolved relative to SIBLINGS_ROOT). */
  repo: string;
  hasArchives: boolean;
  hasCli: boolean;
  hasApi: boolean;
  /** Pretty label shown to the reader in index pages. */
  label: { en: string; es: string };
}

const SOURCES: Source[] = [
  {
    slug: 'cli',
    repo: 'aurora-catalyst-cli',
    hasArchives: true,
    hasCli: true,
    hasApi: true,
    label: { en: 'Aurora Catalyst CLI', es: 'Aurora Catalyst CLI' },
  },
  {
    slug: 'catalyst',
    repo: 'aurora-catalyst',
    hasArchives: true,
    hasCli: false,
    hasApi: false,
    label: { en: 'Aurora Catalyst Framework', es: 'Aurora Catalyst Framework' },
  },
];

function sourcePath(source: Source): string {
  return path.resolve(SIBLINGS_ROOT, source.repo);
}

// ─── Args ────────────────────────────────────────────────────────────

interface Options {
  only: null | string;
  skipApi: boolean;
  skipArchives: boolean;
  skipCliCommands: boolean;
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    only: null,
    skipApi: false,
    skipArchives: false,
    skipCliCommands: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--source') options.only = argv[++i];
    else if (arg === '--skip-archives') options.skipArchives = true;
    else if (arg === '--skip-cli-commands') options.skipCliCommands = true;
    else if (arg === '--skip-api') options.skipApi = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: pnpm sync [options]

Options:
  --source <slug>       Only import from this source (one of: ${SOURCES.map((s) => s.slug).join(', ')})
  --skip-archives       Skip openspec archive mirror
  --skip-cli-commands   Skip CLI reference generation
  --skip-api            Skip TypeDoc API generation
  --help                Show this help
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

function targetFor(locale: string, subdir: string): string {
  return path.join(DOCS_ROOT, 'src/content/docs', locale, subdir);
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

// ─── Frontmatter injection (openspec/oclif/TypeDoc output comes raw) ─

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

function yamlString(s: string): string {
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function titleForArchiveMd(filePath: string, locale: Locale): string {
  const base = path.basename(filePath, path.extname(filePath));
  const parent = path.basename(path.dirname(filePath));
  if (base === 'spec') return `${SPEC_LABEL[locale]}: ${humanize(parent)}`;
  const well = WELL_KNOWN_TITLES[base];
  if (well) return well[locale];
  return humanize(base);
}

async function ensureFrontmatter(filePath: string, title: string): Promise<void> {
  const raw = await readFile(filePath, 'utf8');
  if (raw.startsWith('---\n') || raw.startsWith('---\r\n')) return;
  const fm = `---\ntitle: ${yamlString(title)}\n---\n\n`;
  await writeFile(filePath, fm + raw, 'utf8');
}

/** Add a frontmatter with `title: humanize(basename)` to every .md in a dir. */
async function injectGenericFrontmatterUnder(dir: string): Promise<void> {
  const files = await walkMarkdown(dir);
  for (const file of files) {
    const base = path.basename(file, path.extname(file));
    const title = humanize(base === 'README' ? 'overview' : base);
    await ensureFrontmatter(file, title);
  }
}

// ─── Importers ───────────────────────────────────────────────────────

async function mirrorArchivesFor(source: Source): Promise<void> {
  const repoRoot = sourcePath(source);
  if (!existsSync(repoRoot)) {
    console.warn(`[skip] ${source.slug}: repo not found at ${repoRoot}`);
    return;
  }
  const sourceDir = path.join(repoRoot, 'openspec/changes/archive');
  if (!existsSync(sourceDir)) {
    console.warn(`[skip] ${source.slug}: no archives at ${sourceDir}`);
    return;
  }

  for (const locale of CONTENT_LOCALES) {
    const dest = targetFor(locale, path.join('changes', source.slug));
    await resetDir(dest);
    const entries = await readdir(sourceDir);

    for (const entry of entries) {
      const entrySrc = path.join(sourceDir, entry);
      const entryStat = await stat(entrySrc);
      if (!entryStat.isDirectory()) continue;
      const entryDst = path.join(dest, entry);
      await cp(entrySrc, entryDst, { recursive: true });

      const changeTitle = humanize(entry);
      await writeFile(
        path.join(entryDst, 'index.md'),
        `---\ntitle: ${yamlString(changeTitle)}\n---\n\nArchived change \`${entry}\` from \`${source.repo}\`.\n`,
        'utf8',
      );

      const mdFiles = await walkMarkdown(entryDst);
      for (const file of mdFiles) {
        await ensureFrontmatter(file, titleForArchiveMd(file, locale));
      }
    }

    // Landing index for this source's changes section.
    const title = source.label[locale];
    const description =
      locale === 'es'
        ? `Changes archivados de ${source.repo}. Autogenerado.`
        : `Archived changes from ${source.repo}. Auto-generated.`;
    await writeFile(
      path.join(dest, 'index.md'),
      `---\ntitle: ${yamlString(title)}\ndescription: ${yamlString(description)}\n---\n\nArchived changes imported from \`${source.repo}/openspec/changes/archive/\`.\n`,
      'utf8',
    );
    console.log(`[ok] ${source.slug} archives → ${path.relative(DOCS_ROOT, dest)}`);
  }
}

/** Write a top-level index.md at changes/ aggregating every source group. */
async function writeChangesLanding(activeSources: Source[]): Promise<void> {
  for (const locale of CONTENT_LOCALES) {
    const root = targetFor(locale, 'changes');
    await ensureDir(root);
    const title = locale === 'es' ? 'Historial de cambios' : 'Change history';
    const description =
      locale === 'es'
        ? 'Changes archivados en los repos de Aurora. Autogenerado por source.'
        : 'Archived changes across the Aurora repos. Auto-generated per source.';
    const lines = [
      `---`,
      `title: ${yamlString(title)}`,
      `description: ${yamlString(description)}`,
      `---`,
      ``,
      locale === 'es'
        ? 'Grupos por repo:'
        : 'Grouped by source repo:',
      ``,
      ...activeSources
        .filter((s) => s.hasArchives)
        .map((s) => `- **${s.label[locale]}** (\`${s.slug}\`) — \`${s.repo}\``),
      ``,
    ];
    await writeFile(path.join(root, 'index.md'), lines.join('\n'), 'utf8');
  }
}

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
    console.log(`[ok] ${source.slug} api → ${path.relative(DOCS_ROOT, dest)}`);
  }
}

// ─── Main ────────────────────────────────────────────────────────────

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

  for (const source of sources) {
    console.log(`\n→ ${source.slug} (${source.repo})`);
    if (!options.skipArchives && source.hasArchives) {
      await mirrorArchivesFor(source);
    }
    if (!options.skipCliCommands && source.hasCli) {
      await mirrorCliCommandsFor(source);
    }
    if (!options.skipApi && source.hasApi) {
      await mirrorApiFor(source);
    }
  }

  if (!options.skipArchives) {
    await writeChangesLanding(sources);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
