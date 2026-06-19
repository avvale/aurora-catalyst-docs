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
 * Whether `url` is external to the crawl — i.e. not served from `origin`
 * (the resolved preview origin, e.g. "http://localhost:4322"). Passed to
 * linkinator's linksToSkip so only same-origin internal links are validated,
 * regardless of the scheme/host/port the preview actually advertised.
 */
export function isExternalTo(origin: string, url: string): boolean {
  return !url.startsWith(origin);
}

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
