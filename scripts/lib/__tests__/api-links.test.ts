import { describe, it, expect } from 'vitest';
import { slugifySegment, rewriteApiLinks } from '../api-links.js';

describe('slugifySegment', () => {
  it('lowercases', () => expect(slugifySegment('AdditionalApi')).toBe('additionalapi'));
  it('lowercases camelCase whole', () => expect(slugifySegment('generateFromTemplate')).toBe('generatefromtemplate'));
  it('strips dots', () => expect(slugifySegment('cicd.port')).toBe('cicdport'));
  it('keeps hyphens', () => expect(slugifySegment('lock-file')).toBe('lock-file'));
  it('maps README to readme', () => expect(slugifySegment('README')).toBe('readme'));
});

describe('rewriteApiLinks', () => {
  const en = { base: '/aurora-catalyst-docs', locale: 'en' };

  it('rewrites a sibling interface link to an absolute slugified URL', () => {
    const out = rewriteApiLinks(
      '- [AdditionalApi](interfaces/AdditionalApi.md)',
      { ...en, sourceRelPath: 'cli/generator/domain/model/README.md' },
    );
    expect(out).toBe('- [AdditionalApi](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/interfaces/additionalapi/)');
  });

  it('rewrites a README link to its /readme/ page', () => {
    const out = rewriteApiLinks(
      '- [deploy/domain/model](deploy/domain/model/README.md)',
      { ...en, sourceRelPath: 'cli/README.md' },
    );
    expect(out).toBe('- [deploy/domain/model](/aurora-catalyst-docs/en/reference/api/cli/deploy/domain/model/readme/)');
  });

  it('resolves ../ relative links against the source dir', () => {
    const out = rewriteApiLinks(
      '[**root**](../../../README.md)',
      { ...en, sourceRelPath: 'cli/generator/domain/model/README.md' },
    );
    expect(out).toBe('[**root**](/aurora-catalyst-docs/en/reference/api/cli/readme/)');
  });

  it('preserves a #hash fragment', () => {
    const out = rewriteApiLinks(
      '[X](interfaces/Foo.md#bar)',
      { ...en, sourceRelPath: 'cli/generator/domain/model/README.md' },
    );
    expect(out).toBe('[X](/aurora-catalyst-docs/en/reference/api/cli/generator/domain/model/interfaces/foo/#bar)');
  });

  it('strips dots in directory segments', () => {
    const out = rewriteApiLinks(
      '[cicd](deploy/ports/cicd.port/README.md)',
      { ...en, sourceRelPath: 'cli/README.md' },
    );
    expect(out).toBe('[cicd](/aurora-catalyst-docs/en/reference/api/cli/deploy/ports/cicdport/readme/)');
  });

  it('emits the locale segment', () => {
    const out = rewriteApiLinks(
      '[AdditionalApi](interfaces/AdditionalApi.md)',
      { base: '/aurora-catalyst-docs', locale: 'es', sourceRelPath: 'cli/generator/domain/model/README.md' },
    );
    expect(out).toContain('/aurora-catalyst-docs/es/reference/api/cli/generator/domain/model/interfaces/additionalapi/');
  });

  it('leaves external links untouched', () => {
    const md = '[ext](https://example.com/x.md)';
    expect(rewriteApiLinks(md, { ...en, sourceRelPath: 'cli/README.md' })).toBe(md);
  });

  it('leaves pure anchors and non-.md links untouched', () => {
    expect(rewriteApiLinks('[a](#sec)', { ...en, sourceRelPath: 'cli/README.md' })).toBe('[a](#sec)');
    expect(rewriteApiLinks('[i](./pic.png)', { ...en, sourceRelPath: 'cli/README.md' })).toBe('[i](./pic.png)');
  });
});
