import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  dismissedSlugs,
  getEntry,
  hasEntry,
  loadRegistry,
  makeDismissedEntry,
  makePublishedEntry,
  publishedSlugs,
  type Registry,
  saveRegistry,
  setEntry,
} from '../changelog-registry.js';

let tmpDir: string;
let registryPath: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), 'changelog-registry-'));
  registryPath = path.join(tmpDir, 'registry.json');
});

afterEach(async () => {
  // tmpdir cleanup is best-effort; let OS handle it.
});

describe('loadRegistry', () => {
  it('returns {} when the file does not exist', async () => {
    const registry = await loadRegistry(registryPath);
    expect(registry).toEqual({});
  });

  it('returns {} when the file is empty or whitespace', async () => {
    await writeFile(registryPath, '   \n  \t ', 'utf8');
    const registry = await loadRegistry(registryPath);
    expect(registry).toEqual({});
  });

  it('parses an existing registry', async () => {
    const registry: Registry = {
      cli: {
        'slug-a': makePublishedEntry({
          classification: 'feature',
          source_commit: 'abc',
          classified_at: '2026-04-20T00:00:00.000Z',
        }),
      },
    };
    await writeFile(registryPath, JSON.stringify(registry), 'utf8');
    const loaded = await loadRegistry(registryPath);
    expect(loaded).toEqual(registry);
  });
});

describe('saveRegistry', () => {
  it('persists a registry with sorted top-level and slug keys', async () => {
    let registry: Registry = {};
    registry = setEntry(
      registry,
      'catalyst',
      'zzz-slug',
      makePublishedEntry({
        classification: 'feature',
        source_commit: 'c1',
        classified_at: '2026-04-20T00:00:00.000Z',
      }),
    );
    registry = setEntry(
      registry,
      'cli',
      'bbb-slug',
      makeDismissedEntry({
        reason: 'refactor only',
        source_commit: 'c2',
        classified_at: '2026-04-20T00:00:00.000Z',
      }),
    );
    registry = setEntry(
      registry,
      'cli',
      'aaa-slug',
      makePublishedEntry({
        classification: 'breaking',
        source_commit: 'c3',
        classified_at: '2026-04-20T00:00:00.000Z',
      }),
    );

    await saveRegistry(registry, registryPath);

    const raw = await readFile(registryPath, 'utf8');
    const parsed = JSON.parse(raw);
    expect(Object.keys(parsed)).toEqual(['catalyst', 'cli']);
    expect(Object.keys(parsed.cli)).toEqual(['aaa-slug', 'bbb-slug']);
    expect(raw.endsWith('\n')).toBe(true);
  });
});

describe('entry shapes', () => {
  it('makePublishedEntry stores classification and default override=null', () => {
    const entry = makePublishedEntry({
      classification: 'feature',
      source_commit: 'sha1',
      classified_at: '2026-04-20T00:00:00.000Z',
    });
    expect(entry).toEqual({
      status: 'published',
      classification: 'feature',
      classified_at: '2026-04-20T00:00:00.000Z',
      source_commit: 'sha1',
      override: null,
    });
  });

  it('makeDismissedEntry stores reason and default override=null', () => {
    const entry = makeDismissedEntry({
      reason: 'internal perf',
      source_commit: 'sha2',
      classified_at: '2026-04-20T00:00:00.000Z',
    });
    expect(entry).toEqual({
      status: 'dismissed',
      reason: 'internal perf',
      classified_at: '2026-04-20T00:00:00.000Z',
      source_commit: 'sha2',
      override: null,
    });
    expect('classification' in entry).toBe(false);
  });
});

describe('registry queries', () => {
  let registry: Registry = {};

  beforeEach(() => {
    registry = {};
    registry = setEntry(
      registry,
      'cli',
      'slug-p',
      makePublishedEntry({
        classification: 'feature',
        source_commit: 'c1',
        classified_at: '2026-04-20T00:00:00.000Z',
      }),
    );
    registry = setEntry(
      registry,
      'cli',
      'slug-d',
      makeDismissedEntry({
        reason: 'refactor',
        source_commit: 'c2',
        classified_at: '2026-04-20T00:00:00.000Z',
      }),
    );
  });

  it('hasEntry reports presence', () => {
    expect(hasEntry(registry, 'cli', 'slug-p')).toBe(true);
    expect(hasEntry(registry, 'cli', 'missing')).toBe(false);
    expect(hasEntry(registry, 'other', 'slug-p')).toBe(false);
  });

  it('getEntry returns the matching entry', () => {
    expect(getEntry(registry, 'cli', 'slug-p')?.status).toBe('published');
    expect(getEntry(registry, 'cli', 'slug-d')?.status).toBe('dismissed');
    expect(getEntry(registry, 'cli', 'missing')).toBeUndefined();
  });

  it('publishedSlugs and dismissedSlugs return sorted slug arrays', () => {
    expect(publishedSlugs(registry, 'cli')).toEqual(['slug-p']);
    expect(dismissedSlugs(registry, 'cli')).toEqual(['slug-d']);
    expect(publishedSlugs(registry, 'missing')).toEqual([]);
  });
});
