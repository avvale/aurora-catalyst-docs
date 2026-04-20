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
import { type Source, sourcePath } from './sources.js';

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
 * List every slug under `<repo>/openspec/changes/archive/`.
 * `repoRootOverride` allows tests to point at a temporary fixture repo.
 */
export async function listArchiveSlugs(
  source: Source,
  repoRootOverride?: string,
): Promise<string[]> {
  const repoRoot = repoRootOverride ?? sourcePath(source);
  const archiveDir = path.join(repoRoot, 'openspec/changes/archive');
  if (!existsSync(archiveDir)) return [];
  const entries = await readdir(archiveDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/**
 * Return only the slugs that are not yet present in the registry for this repo.
 */
export async function detectNewSlugs(
  source: Source,
  registry: Registry,
  repoRootOverride?: string,
): Promise<string[]> {
  const all = await listArchiveSlugs(source, repoRootOverride);
  return all.filter((slug) => !hasEntry(registry, source.slug, slug));
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
  const out: DetectedChange[] = [];

  for (const slug of slugs) {
    const archiveAbsPath = path.join(repoRoot, 'openspec/changes/archive', slug);
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
