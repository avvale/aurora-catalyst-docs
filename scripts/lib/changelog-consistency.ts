import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import {
  CONTENT_LOCALES,
  DOCS_ROOT,
  type Locale,
} from './sources.js';
import { type Registry, publishedSlugs } from './changelog-registry.js';

export interface ConsistencyIssue {
  kind: 'missing_file' | 'orphan_file';
  repoSlug: string;
  changeSlug: string;
  locale: Locale;
  path: string;
}

function changesDir(docsRoot: string, locale: Locale, repoSlug: string): string {
  return path.join(docsRoot, 'src/content/docs', locale, 'changes', repoSlug);
}

function entryPath(
  docsRoot: string,
  locale: Locale,
  repoSlug: string,
  changeSlug: string,
): string {
  return path.join(changesDir(docsRoot, locale, repoSlug), `${changeSlug}.md`);
}

async function listEntryFileSlugs(
  docsRoot: string,
  locale: Locale,
  repoSlug: string,
): Promise<string[]> {
  const dir = changesDir(docsRoot, locale, repoSlug);
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'index.md')
    .map((e) => e.name.replace(/\.md$/, ''));
}

/**
 * Compare the published registry against the files on disk. Every published
 * slug must have EN + ES entry files; every entry file must have a published
 * registry entry.
 */
export async function findConsistencyIssues(
  registry: Registry,
  repoSlugs: string[],
  docsRootOverride?: string,
): Promise<ConsistencyIssue[]> {
  const docsRoot = docsRootOverride ?? DOCS_ROOT;
  const issues: ConsistencyIssue[] = [];

  for (const repoSlug of repoSlugs) {
    const published = new Set(publishedSlugs(registry, repoSlug));

    for (const locale of CONTENT_LOCALES) {
      for (const changeSlug of published) {
        const expected = entryPath(docsRoot, locale, repoSlug, changeSlug);
        if (!existsSync(expected)) {
          issues.push({
            kind: 'missing_file',
            repoSlug,
            changeSlug,
            locale,
            path: expected,
          });
        }
      }

      const diskSlugs = await listEntryFileSlugs(docsRoot, locale, repoSlug);
      for (const slug of diskSlugs) {
        if (!published.has(slug)) {
          issues.push({
            kind: 'orphan_file',
            repoSlug,
            changeSlug: slug,
            locale,
            path: entryPath(docsRoot, locale, repoSlug, slug),
          });
        }
      }
    }
  }

  return issues;
}

export function formatIssues(issues: ConsistencyIssue[]): string {
  if (issues.length === 0) return 'OK — registry and files are in sync.';
  const lines = [`Found ${issues.length} issue(s):`];
  for (const issue of issues) {
    const prefix = issue.kind === 'missing_file' ? 'MISSING' : 'ORPHAN ';
    lines.push(
      `  [${prefix}] ${issue.repoSlug}/${issue.changeSlug} (${issue.locale}) → ${issue.path}`,
    );
  }
  return lines.join('\n');
}
