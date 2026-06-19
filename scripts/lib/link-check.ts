/**
 * Pure helpers for the post-build link checker (scripts/check-links.ts).
 * Kept free of process/IO so they can be unit-tested.
 */

/** Subset of linkinator's LinkResult that our reporting relies on. */
export interface LinkLike {
  url: string;
  state: string;
  status?: number;
  parent?: string;
}

/**
 * linksToSkip regex source. A link is skipped when it MATCHES this pattern.
 * The negative lookahead matches every URL that does NOT start with the local
 * preview origin, so all external (http/https) links are skipped while the
 * localhost preview links (any port) are still validated.
 */
export const EXTERNAL_SKIP = '^(?!http://localhost)';

/** Keep only the links linkinator flagged as broken. */
export function selectBroken(links: LinkLike[]): LinkLike[] {
  return links.filter((link) => link.state === 'BROKEN');
}

/** Human-readable report: one block per broken link. */
export function formatReport(broken: LinkLike[]): string {
  return broken
    .map((link) => {
      const parent = link.parent ?? '(unknown page)';
      const status = link.status ?? '?';
      return `  ✖ ${link.url}\n      found on: ${parent}  [status ${status}]`;
    })
    .join('\n');
}
