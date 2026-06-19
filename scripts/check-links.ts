/**
 * Post-build internal link checker.
 *
 * Spawns `astro preview` (serves dist/ under the configured base), discovers
 * the served URL from the preview's own stdout, crawls it with linkinator
 * (same-domain recursion), skips external links, and exits non-zero when any
 * internal link is broken. astro preview is required because it honors the
 * `base` path — serving the flat dist/ at `/` would break the absolute
 * `/aurora-catalyst-docs/...` hrefs Starlight emits.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { LinkChecker } from 'linkinator';
import {
  EXTERNAL_SKIP,
  selectBroken,
  formatReport,
  type LinkLike,
} from './lib/link-check.js';

const READY_TIMEOUT_MS = 60_000;
// Matches the "Local  http://localhost:<port>/aurora-catalyst-docs/" line.
const PREVIEW_URL_RE = /(https?:\/\/localhost:\d+\/[^\s]*)/;
const ANSI_RE = /\x1b\[[0-9;]*m/g;

interface Preview {
  url: string;
  stop: () => void;
}

function startPreview(): Promise<Preview> {
  return new Promise((resolve, reject) => {
    const child: ChildProcess = spawn('pnpm', ['exec', 'astro', 'preview'], {
      detached: true,
    });

    const stop = () => {
      if (child.pid) {
        try {
          // Kill the whole process group (detached spawn => child is leader).
          process.kill(-child.pid, 'SIGTERM');
        } catch {
          // already gone
        }
      }
    };

    let settled = false;
    const onData = (buf: Buffer) => {
      const line = buf.toString().replace(ANSI_RE, '');
      const match = line.match(PREVIEW_URL_RE);
      if (match && !settled) {
        settled = true;
        clearTimeout(timer);
        resolve({ url: match[1], stop });
      }
    };

    child.stdout?.on('data', onData);
    child.stderr?.on('data', onData);
    child.on('exit', (code) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(new Error(`astro preview exited (code ${code}) before becoming ready`));
      }
    });

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        stop();
        reject(new Error(`astro preview did not become ready within ${READY_TIMEOUT_MS / 1000}s`));
      }
    }, READY_TIMEOUT_MS);
  });
}

async function main(): Promise<number> {
  const { url, stop } = await startPreview();
  console.log(`Crawling ${url} for broken internal links…`);
  try {
    const checker = new LinkChecker();
    const result = await checker.check({
      path: url,
      recurse: true,
      linksToSkip: [EXTERNAL_SKIP],
    });

    const broken = selectBroken(result.links as LinkLike[]);
    if (broken.length === 0) {
      console.log(`✓ No broken internal links (${result.links.length} links checked).`);
      return 0;
    }

    console.error(`\n${formatReport(broken)}`);
    console.error(`\n✖ ${broken.length} broken internal link(s) found.`);
    return 1;
  } finally {
    stop();
  }
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
