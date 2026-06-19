import path from 'node:path';
import { slug } from 'github-slugger';

/** Slugify a single path segment the way Starlight derives content-route slugs. */
export function slugifySegment(segment: string): string {
  return slug(segment);
}

export interface RewriteCtx {
  /** POSIX path of the source file relative to the reference/api root,
   *  including the source slug — e.g. "cli/generator/domain/model/README.md". */
  sourceRelPath: string;
  base: string;   // e.g. "/aurora-catalyst-docs"
  locale: string; // e.g. "en"
}

const INLINE_LINK = /\]\(([^)\s]+)\)/g;
const EXTERNAL = /^(?:[a-z]+:|\/\/)/i; // http:, https:, mailto:, protocol-relative

/**
 * Rewrite TypeDoc-relative markdown links that point at `.md` pages into
 * root-absolute slugified URLs that resolve in the rendered Starlight site.
 * External links, pure anchors, and non-.md links are left unchanged.
 */
export function rewriteApiLinks(markdown: string, ctx: RewriteCtx): string {
  const dir = path.posix.dirname(ctx.sourceRelPath);
  return markdown.replace(INLINE_LINK, (whole, target: string) => {
    if (EXTERNAL.test(target) || target.startsWith('#')) return whole;
    const [p, hash] = target.split('#');
    if (!p.endsWith('.md')) return whole;
    const resolved = path.posix.normalize(path.posix.join(dir, p)); // relative to api root
    if (resolved.startsWith('..')) return whole; // escapes the tree; leave it
    const slugPath = resolved
      .replace(/\.md$/, '')
      .split('/')
      .map(slugifySegment)
      .join('/');
    const url = `${ctx.base}/${ctx.locale}/reference/api/${slugPath}/${hash ? `#${hash}` : ''}`;
    return `](${url})`;
  });
}
