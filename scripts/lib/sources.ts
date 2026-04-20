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
}

export const SOURCES: Source[] = [
  {
    slug: 'cli',
    repo: 'aurora-catalyst-cli',
    hasArchives: true,
    hasCli: true,
    hasApi: true,
    label: { en: 'Aurora Catalyst CLI', es: 'Aurora Catalyst CLI' },
    github: 'avvale',
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

export function findSource(slug: string): Source | undefined {
  return SOURCES.find((s) => s.slug === slug);
}

export function targetFor(locale: Locale, subdir: string): string {
  return path.join(DOCS_ROOT, 'src/content/docs', locale, subdir);
}

export function sourceArchiveUrl(source: Source, commit: string, slug: string): string {
  return `https://github.com/${source.github}/${source.repo}/tree/${commit}/openspec/changes/archive/${slug}/`;
}
