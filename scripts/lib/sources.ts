import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DOCS_ROOT = path.resolve(fileURLToPath(import.meta.url), '../../..');
export const SIBLINGS_ROOT = path.resolve(DOCS_ROOT, '..');

export const CONTENT_LOCALES = ['en', 'es'] as const;
export type Locale = (typeof CONTENT_LOCALES)[number];

export interface Source {
  slug: string;
  repo: string;
  hasArchives: boolean;
  hasCli: boolean;
  hasApi: boolean;
  label: { en: string; es: string };
  /**
   * GitHub owner (org or user) for building `source_archive_url` links.
   * The full URL is `https://github.com/<github>/<repo>/tree/<commit>/openspec/changes/archive/<slug>/`.
   */
  github: string;
  /**
   * Subdirectory within `repo` where THIS source's CLI-specific build
   * artifacts live (oclif `docs/`, TypeDoc `docs-api/`). Omit when the
   * artifacts sit at the repo root.
   *
   * Applies ONLY to `sourceAssetsPath` (docs/docs-api). It never affects
   * `sourcePath` / archive scanning (`openspec/changes/archive/`) — that
   * always resolves from the repo root, so two sources can share one
   * monorepo's archive (see `cli` + `catalyst` below, both pointing at
   * `aurora-catalyst` since the CLI was consolidated into it).
   */
  assetsSubdir?: string;
}

export const SOURCES: Source[] = [
  {
    slug: 'cli',
    // `aurora-catalyst-cli` was consolidated into this monorepo as
    // `packages/cli` (archived change 2026-08-03-consolidate-cli-into-monorepo).
    // The standalone repo is frozen; treat it as historical only.
    repo: 'aurora-catalyst',
    hasArchives: true,
    hasCli: true,
    hasApi: true,
    label: { en: 'Aurora Catalyst CLI', es: 'Aurora Catalyst CLI' },
    github: 'avvale',
    assetsSubdir: 'packages/cli',
  },
  {
    slug: 'catalyst',
    repo: 'aurora-catalyst',
    hasArchives: true,
    hasCli: false,
    hasApi: false,
    label: { en: 'Aurora Catalyst Framework', es: 'Aurora Catalyst Framework' },
    github: 'avvale',
  },
];

export function sourcePath(source: Source): string {
  return path.resolve(SIBLINGS_ROOT, source.repo);
}

/**
 * Where THIS source's CLI-specific build artifacts (oclif `docs/`, TypeDoc
 * `docs-api/`) live — the repo root, or `assetsSubdir` under it when declared.
 * Never use this for archive scanning; use `sourcePath` for that.
 */
export function sourceAssetsPath(source: Source): string {
  return source.assetsSubdir
    ? path.join(sourcePath(source), source.assetsSubdir)
    : sourcePath(source);
}

export function findSource(slug: string): Source | undefined {
  return SOURCES.find((s) => s.slug === slug);
}

export function targetFor(locale: Locale, subdir: string): string {
  return path.join(DOCS_ROOT, 'src/content/docs', locale, subdir);
}

export function sourceArchiveUrl(source: Source, commit: string, slug: string): string {
  return `https://github.com/${source.github}/${source.repo}/tree/${commit}/openspec/changes/archive/${slug}/`;
}
