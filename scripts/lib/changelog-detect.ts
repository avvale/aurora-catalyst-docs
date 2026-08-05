import { readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { type Registry, hasEntry } from './changelog-registry.js';
import {
  defaultGitRunner,
  type GitRunner,
  resolveArchiveCommit,
  resolveVersionTag,
} from './changelog-git.js';
import { SOURCES, type Source, sourcePath } from './sources.js';

export interface DetectedChange {
  repo: string;
  slug: string;
  archiveAbsPath: string;
  archiveRelPath: string;
  files: {
    proposal: string | null;
    specs: string[];
  };
  source_commit: string;
  version: string;
}

/**
 * Resolve `<repo>/openspec/changes/archive/` for a source. ALWAYS built from
 * `sourcePath` (the repo root) — NEVER `sourceAssetsPath` — because the
 * archive is shared across every source pointing at the same repo,
 * regardless of where that source's own CLI build artifacts live (e.g.
 * `cli`'s `assetsSubdir: 'packages/cli'` does not apply here).
 *
 * `repoRootOverride` allows tests to point at a temporary fixture repo; the
 * no-override branch (`?? sourcePath(source)`) is what real callers hit, so
 * it must be exercised directly by a test that does NOT pass an override.
 */
export function resolveArchiveDir(source: Source, repoRootOverride?: string): string {
  const repoRoot = repoRootOverride ?? sourcePath(source);
  return path.join(repoRoot, 'openspec/changes/archive');
}

/**
 * List every slug under `<repo>/openspec/changes/archive/`.
 * `repoRootOverride` allows tests to point at a temporary fixture repo.
 */
export async function listArchiveSlugs(
  source: Source,
  repoRootOverride?: string,
): Promise<string[]> {
  const archiveDir = resolveArchiveDir(source, repoRootOverride);
  if (!existsSync(archiveDir)) return [];
  const entries = await readdir(archiveDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/**
 * Return only the slugs that are not yet present in the registry for ANY
 * source sharing this source's `repo`. Two sources can point at the same
 * repo (e.g. `cli` + `catalyst` both resolve to `aurora-catalyst` since the
 * CLI was consolidated into it) and therefore share ONE archive; per the
 * `catalyst-changelog-sync` skill's routing rule a change is registered as
 * either published or (scope-)dismissed in EVERY sibling source — "never
 * both" published, but always accounted for somewhere. A slug is only
 * genuinely "new" when NONE of those sibling registries has an entry yet.
 */
export async function detectNewSlugs(
  source: Source,
  registry: Registry,
  repoRootOverride?: string,
): Promise<string[]> {
  const all = await listArchiveSlugs(source, repoRootOverride);
  const siblingSlugs = SOURCES.filter((s) => s.repo === source.repo).map((s) => s.slug);
  return all.filter(
    (slug) => !siblingSlugs.some((repoSlug) => hasEntry(registry, repoSlug, slug)),
  );
}

/**
 * For each new slug, resolve its source commit, containing tag, and the paths
 * of the files the LLM needs to read (proposal.md + specs/*.md).
 */
export async function describeChanges(
  source: Source,
  slugs: string[],
  runner: GitRunner = defaultGitRunner,
  repoRootOverride?: string,
): Promise<DetectedChange[]> {
  const repoRoot = repoRootOverride ?? sourcePath(source);
  const archiveDir = resolveArchiveDir(source, repoRootOverride);
  const out: DetectedChange[] = [];

  for (const slug of slugs) {
    const archiveAbsPath = path.join(archiveDir, slug);
    if (!existsSync(archiveAbsPath)) continue;

    const relPath = path.relative(repoRoot, archiveAbsPath);
    const commit = await resolveArchiveCommit(relPath, repoRoot, runner);
    const version = await resolveVersionTag(commit, repoRoot, runner);

    const proposalPath = path.join(archiveAbsPath, 'proposal.md');
    const specs = await collectSpecFiles(archiveAbsPath);

    out.push({
      repo: source.slug,
      slug,
      archiveAbsPath,
      archiveRelPath: relPath,
      files: {
        proposal: existsSync(proposalPath) ? proposalPath : null,
        specs,
      },
      source_commit: commit,
      version,
    });
  }

  return out;
}

async function collectSpecFiles(archiveDir: string): Promise<string[]> {
  const specsRoot = path.join(archiveDir, 'specs');
  if (!existsSync(specsRoot)) return [];
  const out: string[] = [];
  const capabilities = await readdir(specsRoot, { withFileTypes: true });
  for (const cap of capabilities) {
    if (!cap.isDirectory()) continue;
    const specFile = path.join(specsRoot, cap.name, 'spec.md');
    try {
      const info = await stat(specFile);
      if (info.isFile()) out.push(specFile);
    } catch {
      // skip missing spec.md
    }
  }
  return out.sort();
}
