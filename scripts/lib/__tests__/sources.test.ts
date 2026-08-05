import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  findSource,
  SIBLINGS_ROOT,
  sourceArchiveUrl,
  sourceAssetsPath,
  sourcePath,
} from '../sources.js';

describe('SOURCES — cli consolidated into the aurora-catalyst monorepo', () => {
  const cli = findSource('cli')!;
  const catalyst = findSource('catalyst')!;

  it('cli and catalyst both resolve to the same monorepo (aurora-catalyst-cli is frozen)', () => {
    expect(cli.repo).toBe('aurora-catalyst');
    expect(catalyst.repo).toBe('aurora-catalyst');
  });

  it('cli declares an assetsSubdir pointing at packages/cli; catalyst declares none', () => {
    expect(cli.assetsSubdir).toBe('packages/cli');
    expect(catalyst.assetsSubdir).toBeUndefined();
  });
});

describe('sourcePath — always the repo root, regardless of assetsSubdir', () => {
  it('cli and catalyst resolve to the exact same path (shared archive root)', () => {
    const cli = findSource('cli')!;
    const catalyst = findSource('catalyst')!;
    expect(sourcePath(cli)).toBe(sourcePath(catalyst));
    expect(sourcePath(cli)).toBe(path.resolve(SIBLINGS_ROOT, 'aurora-catalyst'));
  });
});

describe('sourceAssetsPath — repo root + assetsSubdir when declared', () => {
  it('cli resolves under packages/cli', () => {
    const cli = findSource('cli')!;
    expect(sourceAssetsPath(cli)).toBe(
      path.join(sourcePath(cli), 'packages/cli'),
    );
  });

  it('catalyst falls back to the repo root when no assetsSubdir is declared', () => {
    const catalyst = findSource('catalyst')!;
    expect(sourceAssetsPath(catalyst)).toBe(sourcePath(catalyst));
  });
});

describe('sourceArchiveUrl — points at the monorepo for cli too', () => {
  it('builds a URL against avvale/aurora-catalyst for the cli source', () => {
    const cli = findSource('cli')!;
    const url = sourceArchiveUrl(cli, 'abc123', '2026-08-03-consolidate-cli-into-monorepo');
    expect(url).toBe(
      'https://github.com/avvale/aurora-catalyst/tree/abc123/openspec/changes/archive/2026-08-03-consolidate-cli-into-monorepo/',
    );
  });

  it('still builds a URL against avvale/aurora-catalyst for the catalyst source', () => {
    const catalyst = findSource('catalyst')!;
    const url = sourceArchiveUrl(catalyst, 'def456', 'some-slug');
    expect(url).toBe(
      'https://github.com/avvale/aurora-catalyst/tree/def456/openspec/changes/archive/some-slug/',
    );
  });
});
