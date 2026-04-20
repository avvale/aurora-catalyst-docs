import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  describeChanges,
  detectNewSlugs,
  listArchiveSlugs,
} from '../changelog-detect.js';
import {
  makeDismissedEntry,
  makePublishedEntry,
  type Registry,
  setEntry,
} from '../changelog-registry.js';
import { type GitRunner } from '../changelog-git.js';
import { SOURCES } from '../sources.js';

const cliSource = SOURCES.find((s) => s.slug === 'cli')!;

async function makeArchive(root: string, slugs: string[]): Promise<void> {
  for (const slug of slugs) {
    const dir = path.join(root, 'openspec/changes/archive', slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'proposal.md'), `# ${slug}\n`, 'utf8');
    const specDir = path.join(dir, 'specs', 'cap-a');
    await mkdir(specDir, { recursive: true });
    await writeFile(
      path.join(specDir, 'spec.md'),
      `## ADDED Requirements\n\n### Requirement: X\n\n#### Scenario: Y\n- WHEN a\n- THEN b\n`,
      'utf8',
    );
  }
}

let fakeRepo: string;

beforeEach(async () => {
  fakeRepo = await mkdtemp(path.join(tmpdir(), 'changelog-detect-'));
});

describe('listArchiveSlugs', () => {
  it('returns [] when the archive dir does not exist', async () => {
    const slugs = await listArchiveSlugs(cliSource, fakeRepo);
    expect(slugs).toEqual([]);
  });

  it('returns sorted slug names of immediate child directories', async () => {
    await makeArchive(fakeRepo, ['2026-02-10-b', '2026-01-05-a', '2026-04-18-c']);
    const slugs = await listArchiveSlugs(cliSource, fakeRepo);
    expect(slugs).toEqual(['2026-01-05-a', '2026-02-10-b', '2026-04-18-c']);
  });
});

describe('detectNewSlugs', () => {
  it('returns only slugs absent from the registry (published or dismissed count as present)', async () => {
    await makeArchive(fakeRepo, ['slug-a', 'slug-b', 'slug-c']);

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
    registry = setEntry(
      registry,
      'cli',
      'slug-b',
      makeDismissedEntry({
        reason: 'refactor',
        source_commit: 'c2',
        classified_at: '2026-04-20T00:00:00.000Z',
      }),
    );

    const newSlugs = await detectNewSlugs(cliSource, registry, fakeRepo);
    expect(newSlugs).toEqual(['slug-c']);
  });

  it('does not mix repos in the registry check', async () => {
    await makeArchive(fakeRepo, ['shared-slug']);
    let registry: Registry = {};
    registry = setEntry(
      registry,
      'catalyst',
      'shared-slug',
      makePublishedEntry({
        classification: 'feature',
        source_commit: 'c1',
        classified_at: '2026-04-20T00:00:00.000Z',
      }),
    );
    const newSlugs = await detectNewSlugs(cliSource, registry, fakeRepo);
    expect(newSlugs).toEqual(['shared-slug']);
  });
});

describe('describeChanges', () => {
  it('resolves commit + version via the runner and collects proposal + spec paths', async () => {
    await makeArchive(fakeRepo, ['slug-one']);

    const calls: Array<{ args: string[]; cwd: string }> = [];
    const runner: GitRunner = async (args, cwd) => {
      calls.push({ args, cwd });
      if (args[0] === 'log') return 'abc123\n';
      if (args[0] === 'tag') return 'v1.2.0\n';
      return '';
    };

    const described = await describeChanges(cliSource, ['slug-one'], runner, fakeRepo);
    expect(described).toHaveLength(1);
    const change = described[0];
    expect(change.repo).toBe('cli');
    expect(change.slug).toBe('slug-one');
    expect(change.source_commit).toBe('abc123');
    expect(change.version).toBe('v1.2.0');
    expect(change.files.proposal).toBe(
      path.join(fakeRepo, 'openspec/changes/archive/slug-one/proposal.md'),
    );
    expect(change.files.specs).toEqual([
      path.join(fakeRepo, 'openspec/changes/archive/slug-one/specs/cap-a/spec.md'),
    ]);

    expect(calls.map((c) => c.args[0])).toEqual(['log', 'tag']);
    expect(calls.every((c) => c.cwd === fakeRepo)).toBe(true);
  });

  it('falls back to version="Unreleased" when the tag resolver returns empty', async () => {
    await makeArchive(fakeRepo, ['slug-two']);
    const runner: GitRunner = async (args) => {
      if (args[0] === 'log') return 'def456\n';
      return '\n';
    };
    const [change] = await describeChanges(cliSource, ['slug-two'], runner, fakeRepo);
    expect(change.version).toBe('Unreleased');
  });

  it('returns files.proposal=null when proposal.md is missing', async () => {
    const slug = 'slug-noproposal';
    const archiveDir = path.join(fakeRepo, 'openspec/changes/archive', slug);
    await mkdir(path.join(archiveDir, 'specs/cap-a'), { recursive: true });
    await writeFile(
      path.join(archiveDir, 'specs/cap-a/spec.md'),
      '## ADDED Requirements\n',
      'utf8',
    );

    const runner: GitRunner = async (args) => {
      if (args[0] === 'log') return 'ghi789\n';
      return 'v2.0.0\n';
    };

    const [change] = await describeChanges(cliSource, [slug], runner, fakeRepo);
    expect(change.files.proposal).toBeNull();
    expect(change.files.specs).toHaveLength(1);
  });
});
