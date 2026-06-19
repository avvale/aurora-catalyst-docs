# Internal Link Checker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fail CI (and offer a local command) when a rendered internal link points at a non-existent page.

**Architecture:** A tsx script spawns `astro preview` (which serves `dist/` honoring the `/aurora-catalyst-docs` base), reads the served URL from the preview's stdout, crawls it with linkinator (`recurse`, same-domain only), skips external links, and exits non-zero on any `BROKEN` internal link. A new `ci.yml` runs it on PRs and pushes to `main`. Pure result-handling logic is isolated into a unit-tested helper module.

**Tech Stack:** Node ≥ 20, pnpm ≥ 9, TypeScript (ESM/NodeNext), tsx, vitest, `linkinator` (post-build crawler), Astro + Starlight, GitHub Actions.

## Global Constraints

- Node ≥ 20; pnpm ≥ 9. CI uses `node-version: 24` and `pnpm/action-setup@v5`, mirroring `.github/workflows/deploy.yml`.
- ESM import style: import local modules with the `.js` extension even from `.ts` sources (e.g. `from './lib/link-check.js'`); use inline `import { type X, y }` for type+value imports. Matches `scripts/changelog-sync.ts`.
- Vitest test glob is `scripts/**/__tests__/**/*.test.ts`; `environment: 'node'`, `globals: false` (import `describe/it/expect` from `vitest`).
- Shell: use `rg`/`fd`/`bat`/`sd`/`eza`, never `grep`/`find`/`cat`/`sed`/`ls`.
- Never hand-edit files under `reference/cli-commands/`, `reference/api/`, or `changes/<repo>/`. Generated reference is refreshed with `pnpm sync`; changelog via the `catalyst-changelog-sync` skill.
- Every EN page under `src/content/docs/en/` has an ES counterpart at the same path, and vice versa — content fixes ship in both locales.
- External links (`http(s)://`) and anchor fragments (`#heading`) are OUT of scope.
- Commit trailer on every commit: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- Work happens on branch `ci/internal-link-checker` (already created; design doc already committed there).

---

### Task 1: Pure result-handling helpers

**Files:**
- Create: `scripts/lib/link-check.ts`
- Test: `scripts/lib/__tests__/link-check.test.ts`

**Interfaces:**
- Consumes: nothing (leaf module).
- Produces:
  - `interface LinkLike { url: string; state: string; status?: number; parent?: string }`
  - `const EXTERNAL_SKIP: string` — regex source string passed to linkinator's `linksToSkip`. Matches (→ skips) any URL not served from the local preview origin.
  - `function selectBroken(links: LinkLike[]): LinkLike[]`
  - `function formatReport(broken: LinkLike[]): string`

- [ ] **Step 1: Write the failing test**

Create `scripts/lib/__tests__/link-check.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  EXTERNAL_SKIP,
  selectBroken,
  formatReport,
  type LinkLike,
} from '../link-check.js';

describe('EXTERNAL_SKIP', () => {
  const re = new RegExp(EXTERNAL_SKIP);

  it('matches (skips) external links', () => {
    expect(re.test('https://example.com/docs')).toBe(true);
    expect(re.test('http://github.com/avvale')).toBe(true);
  });

  it('does not match (keeps) local preview links', () => {
    expect(re.test('http://localhost:4321/aurora-catalyst-docs/en/')).toBe(false);
    expect(re.test('http://localhost:5000/aurora-catalyst-docs/es/guides/')).toBe(false);
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test`
Expected: FAIL — `Cannot find module '../link-check.js'` (or equivalent resolution error).

- [ ] **Step 3: Write the minimal implementation**

Create `scripts/lib/link-check.ts`:

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test`
Expected: PASS — all cases in `link-check.test.ts` green.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/link-check.ts scripts/lib/__tests__/link-check.test.ts
git commit -m "feat(ci): add pure helpers for internal link checker

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Orchestration entrypoint + dependency + scripts

**Files:**
- Create: `scripts/check-links.ts`
- Modify: `package.json` (add `linkinator` devDependency + `check:links` and `verify` scripts)

**Interfaces:**
- Consumes: `EXTERNAL_SKIP`, `selectBroken`, `formatReport`, `type LinkLike` from `./lib/link-check.js`; `LinkChecker` from `linkinator`.
- Produces: an executable script. `pnpm check:links` exits `0` when no broken internal links, `1` otherwise. `pnpm verify` = `pnpm build && pnpm check:links`.

- [ ] **Step 1: Add the linkinator dependency**

Run: `pnpm add -D linkinator`
Expected: `package.json` `devDependencies` gains `linkinator`; lockfile updated. Verify the binary resolves:
Run: `pnpm exec linkinator --version`
Expected: prints a version (6.x or newer).

- [ ] **Step 2: Add package.json scripts**

In `package.json`, add to `"scripts"` (after the existing `"sync:changelog"` line):

```json
    "check:links": "tsx scripts/check-links.ts",
    "verify": "pnpm build && pnpm check:links",
```

- [ ] **Step 3: Write the orchestration script**

Create `scripts/check-links.ts`:

```ts
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
```

- [ ] **Step 4: Build the site so dist/ exists**

Run: `pnpm build`
Expected: `astro check` passes, `astro build` writes `dist/`.

- [ ] **Step 5: Run the checker end-to-end**

Run: `pnpm check:links`
Expected: prints `Crawling http://localhost:4321/aurora-catalyst-docs/ …`, crawls, and ends with either `✓ No broken internal links (...)` (exit 0) or a list of broken links + `✖ N broken internal link(s) found.` (exit 1). EITHER outcome means the script works — a non-zero exit here means it found real broken links, which is triaged in Task 3. Confirm no `astro preview` process is left running afterwards:
Run: `pgrep -fl "astro preview" || echo "no orphan preview"`
Expected: `no orphan preview`.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml scripts/check-links.ts
git commit -m "feat(ci): add post-build internal link checker script

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: First-run triage (verification checkpoint)

**Files:** depends on findings — none, or content fixes under `src/content/docs/{en,es}/`, or a `linksToSkip` addition in `scripts/check-links.ts`.

**Interfaces:** consumes the working checker from Task 2.

This task resolves whatever the first real run surfaces so the CI added in Task 4 can pass. It is a decision checkpoint, not fixed code — **stop and present findings to the user before mass-editing content.**

- [ ] **Step 1: Capture the broken-link list**

Run: `pnpm build && pnpm check:links`
If exit 0 (no broken links): mark this task done and proceed to Task 4.
If exit 1: copy the reported list (each `✖ url` + `found on:` page).

- [ ] **Step 2: Classify each broken link**

For every reported broken link, assign one bucket:
- **Hand-written content bug** (`found on:` page is under `guides/`, `concepts/`, `tutorials/`, `reference/index`, `reference/frontend/`): a real docs bug. Fix the link in BOTH locales (EN + ES counterpart). Use `rg` to locate the source markdown.
- **Generated reference** (`found on:` page under `reference/api/` or `reference/cli-commands/`): do NOT hand-edit. Either refresh with `pnpm sync` (if the sibling source repo is in scope) or, if the breakage is inherent to generated output, add a targeted pattern to `linksToSkip` in `scripts/check-links.ts` with an explanatory comment.
- **False positive** (link is actually valid, e.g. a redirect the crawler mishandles): add a precise pattern to `linksToSkip` with a comment explaining why.

- [ ] **Step 3: Present findings to the user and get direction**

Show the classified list and the proposed action per bucket. Wait for confirmation before editing content files (CLAUDE.md requires EN/ES parity and forbids hand-editing generated dirs).

- [ ] **Step 4: Apply the agreed fixes and re-run**

Apply fixes, then:
Run: `pnpm build && pnpm check:links`
Expected: exit 0, `✓ No broken internal links`.

- [ ] **Step 5: Commit (only if fixes were made)**

```bash
# stage exactly the files you changed (content fixes and/or check-links.ts)
git add <changed files>
git commit -m "fix(docs): repair broken internal links surfaced by link checker

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: CI workflow + docs

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `CLAUDE.md` (Common Commands table)

**Interfaces:** consumes `pnpm check:links` from Task 2.

- [ ] **Step 1: Create the CI workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  link-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout docs repo
        uses: actions/checkout@v6

      - name: Setup pnpm
        uses: pnpm/action-setup@v5

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build Astro site
        run: pnpm build

      - name: Check internal links
        run: pnpm check:links
```

- [ ] **Step 2: Verify the workflow YAML is well-formed**

Run: `pnpm exec astro --version > /dev/null; node -e "const f=require('node:fs').readFileSync('.github/workflows/ci.yml','utf8'); require('node:assert').ok(f.includes('pnpm check:links')); console.log('ci.yml OK')"`
Expected: `ci.yml OK` (sanity check that the file exists and wires the step). If a YAML linter is available (`pnpm dlx yaml-lint .github/workflows/ci.yml`), run it; otherwise the structure mirrors the known-good `deploy.yml`.

- [ ] **Step 3: Add the command to CLAUDE.md**

In `CLAUDE.md`, under the **Common Commands** table, add a row after the `Preview build` row:

```markdown
| Check internal links (post-build)  | `pnpm check:links`                            |
```

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml CLAUDE.md
git commit -m "ci: validate internal links on PRs and pushes to main

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- Goal (fail CI on broken internal links) → Tasks 2 + 4. ✓
- Post-build crawler with linkinator over previewed dist → Task 2. ✓
- Internal-only (skip externals) → `EXTERNAL_SKIP`, Task 1, tested. ✓
- New `ci.yml` on PRs + push to main, `deploy.yml` untouched → Task 4. ✓
- Standalone `pnpm check:links` (+ `verify`) → Task 2. ✓
- Pure helpers unit-tested per repo convention → Task 1. ✓
- Known risk: pre-existing breakage in generated tree → Task 3 triage with escape hatch. ✓
- Docs: command added to CLAUDE.md → Task 4. ✓
- Out of scope (external links, anchors) → respected; no task adds them. ✓

**Placeholder scan:** No TBD/TODO/"handle edge cases". Task 3 is intentionally data-dependent but specifies exact classification rules and commands, not vague placeholders. ✓

**Type consistency:** `LinkLike` defined in Task 1 and imported in Task 2; `selectBroken`/`formatReport`/`EXTERNAL_SKIP` names match between definition (Task 1) and use (Task 2). linkinator `result.links` cast to `LinkLike[]` (structural subset). ✓
