import { describe, expect, it, vi } from 'vitest';

import {
  type GitRunner,
  resolveArchiveCommit,
  resolveVersionTag,
} from '../changelog-git.js';

describe('resolveVersionTag', () => {
  it('returns the first non-empty tag line', async () => {
    const runner: GitRunner = vi.fn(async () => 'v1.2.0\nv1.3.0\nv2.0.0\n');
    const tag = await resolveVersionTag('abc123', '/repo', runner);
    expect(tag).toBe('v1.2.0');
    expect(runner).toHaveBeenCalledWith(
      ['tag', '--contains', 'abc123', '--sort=v:refname'],
      '/repo',
    );
  });

  it('returns Unreleased when git returns nothing', async () => {
    const runner: GitRunner = async () => '\n\n';
    const tag = await resolveVersionTag('abc123', '/repo', runner);
    expect(tag).toBe('Unreleased');
  });

  it('trims whitespace from tag lines', async () => {
    const runner: GitRunner = async () => '   \n v1.0.0  \n';
    const tag = await resolveVersionTag('abc', '/repo', runner);
    expect(tag).toBe('v1.0.0');
  });
});

describe('resolveArchiveCommit', () => {
  it('returns the first SHA of git log for that path', async () => {
    const runner: GitRunner = vi.fn(async () => 'a1b2c3d4e5\n');
    const sha = await resolveArchiveCommit(
      'openspec/changes/archive/2026-04-18-foo',
      '/repo',
      runner,
    );
    expect(sha).toBe('a1b2c3d4e5');
    expect(runner).toHaveBeenCalledWith(
      [
        'log',
        '-n',
        '1',
        '--format=%H',
        '--',
        'openspec/changes/archive/2026-04-18-foo',
      ],
      '/repo',
    );
  });

  it('throws when git returns empty output', async () => {
    const runner: GitRunner = async () => '';
    await expect(
      resolveArchiveCommit('missing/path', '/repo', runner),
    ).rejects.toThrow(/Could not resolve commit/);
  });
});
