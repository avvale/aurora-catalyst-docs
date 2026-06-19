import { describe, it, expect } from 'vitest';
import {
  isExternalTo,
  selectBroken,
  formatReport,
  type LinkLike,
} from '../link-check.js';

describe('isExternalTo', () => {
  const origin = 'http://localhost:4322';
  it('treats different-origin URLs as external (skipped)', () => {
    expect(isExternalTo(origin, 'https://example.com/docs')).toBe(true);
    expect(isExternalTo(origin, 'http://github.com/avvale')).toBe(true);
    expect(isExternalTo(origin, 'http://localhost:9999/x')).toBe(true);
  });
  it('treats same-origin URLs as internal (validated)', () => {
    expect(isExternalTo(origin, 'http://localhost:4322/aurora-catalyst-docs/en/')).toBe(false);
    expect(isExternalTo(origin, 'http://localhost:4322/aurora-catalyst-docs/es/guides/')).toBe(false);
  });
});

describe('selectBroken', () => {
  it('returns only links whose state is BROKEN', () => {
    const links: LinkLike[] = [
      { url: 'a', state: 'OK' },
      { url: 'b', state: 'BROKEN', status: 404, parent: 'p' },
      { url: 'c', state: 'SKIPPED' },
      { url: 'd', state: 'BROKEN', status: 500, parent: 'q' },
    ];
    const broken = selectBroken(links);
    expect(broken.map((l) => l.url)).toEqual(['b', 'd']);
  });
});

describe('formatReport', () => {
  it('renders url, parent page and status for each broken link', () => {
    const report = formatReport([
      { url: 'http://localhost:4321/aurora-catalyst-docs/en/guides/missing/', state: 'BROKEN', status: 404, parent: 'http://localhost:4321/aurora-catalyst-docs/en/guides/' },
    ]);
    expect(report).toContain('/en/guides/missing/');
    expect(report).toContain('/en/guides/');
    expect(report).toContain('404');
  });

  it('falls back gracefully when parent or status are missing', () => {
    const report = formatReport([{ url: 'x', state: 'BROKEN' }]);
    expect(report).toContain('x');
    expect(report).not.toContain('undefined');
  });
});
