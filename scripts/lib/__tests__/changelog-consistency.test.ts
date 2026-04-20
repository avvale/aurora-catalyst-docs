import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import { findConsistencyIssues } from '../changelog-consistency.js';
import {
  makeDismissedEntry,
  makePublishedEntry,
  type Registry,
  setEntry,
} from '../changelog-registry.js';

let fakeDocsRoot: string;

beforeEach(async () => {
  fakeDocsRoot = await mkdtemp(path.join(tmpdir(), 'changelog-consistency-'));
});

function changesDirFor(locale: 'en' | 'es', repoSlug: string): string {
  return path.join(fakeDocsRoot, 'src/content/docs', locale, 'changes', repoSlug);
}

async function makeEntry(locale: 'en' | 'es', repoSlug: string, changeSlug: string): Promise<void> {
  const dir = changesDirFor(locale, repoSlug);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${changeSlug}.md`), `---\ntitle: ${changeSlug}\n---\n`, 'utf8');
}

describe('findConsistencyIssues', () => {
  it('returns [] when every published entry has EN and ES files and no orphans exist', async () => {
    let registry: Registry = {};
    registry = setEntry(
      registry,
      'cli',
      'slug-a',
      makePublishedEntry({
        classification: 'feature',
        source_commit: 'c1',
        classified_at: '2026-04-20T00:00:00.000Z',
      }),
    );
    await makeEntry('en', 'cli', 'slug-a');
    await makeEntry('es', 'cli', 'slug-a');

    const issues = await findConsistencyIssues(registry, ['cli'], fakeDocsRoot);
    expect(issues).toEqual([]);
  });

  it('reports missing_file when a published entry lacks one locale', async () => {
    let registry: Registry = {};
    registry = setEntry(
      registry,
      'cli',
      'slug-b',
      makePublishedEntry({
        classification: 'feature',
        source_commit: 'c2',
        classified_at: '2026-04-20T00:00:00.000Z',
      }),
    );
    await makeEntry('en', 'cli', 'slug-b');

    const issues = await findConsistencyIssues(registry, ['cli'], fakeDocsRoot);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      kind: 'missing_file',
      repoSlug: 'cli',
      changeSlug: 'slug-b',
      locale: 'es',
    });
  });

  it('reports orphan_file when a file exists without a published registry entry', async () => {
    const registry: Registry = {};
    await makeEntry('en', 'cli', 'slug-orphan');
    await makeEntry('es', 'cli', 'slug-orphan');

    const issues = await findConsistencyIssues(registry, ['cli'], fakeDocsRoot);
    const kinds = issues.map((i) => i.kind);
    expect(kinds).toEqual(['orphan_file', 'orphan_file']);
    expect(issues.every((i) => i.changeSlug === 'slug-orphan')).toBe(true);
  });

  it('treats a dismissed registry entry with a file on disk as an orphan', async () => {
    let registry: Registry = {};
    registry = setEntry(
      registry,
      'cli',
      'slug-dismissed',
      makeDismissedEntry({
        reason: 'refactor',
        source_commit: 'c3',
        classified_at: '2026-04-20T00:00:00.000Z',
      }),
    );
    await makeEntry('en', 'cli', 'slug-dismissed');

    const issues = await findConsistencyIssues(registry, ['cli'], fakeDocsRoot);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      kind: 'orphan_file',
      locale: 'en',
      changeSlug: 'slug-dismissed',
    });
  });

  it('ignores index.md files and only considers <slug>.md', async () => {
    const registry: Registry = {};
    const dir = changesDirFor('en', 'cli');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.md'), '---\ntitle: Index\n---\n', 'utf8');

    const issues = await findConsistencyIssues(registry, ['cli'], fakeDocsRoot);
    expect(issues).toEqual([]);
  });
});
