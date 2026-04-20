/**
 * changelog-sync.ts
 *
 * Deterministic helper invoked by the `changelog-sync` skill. Handles
 * detection, registry I/O, tag resolution, and consistency checks. LLM-driven
 * classification and bilingual authoring happen in the skill itself, not here.
 *
 * Subcommands:
 *   detect [--source <slug>]                     Print JSON of new changes
 *   commit --decisions <path>                    Apply decisions JSON to registry (and delete orphaned files)
 *   check                                        Consistency check (exit 1 if issues found)
 *   resolve-tag <sha> --source <slug>            Print the semver tag containing this commit, else "Unreleased"
 *   list [--status published|dismissed] [--source <slug>]
 */

import { readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import {
  type Classification,
  DEFAULT_REGISTRY_PATH,
  type DismissedEntry,
  type OverrideRecord,
  type PublishedEntry,
  type RegistryEntry,
  getEntry,
  loadRegistry,
  makeDismissedEntry,
  makePublishedEntry,
  saveRegistry,
  setEntry,
} from './lib/changelog-registry.js';
import {
  describeChanges,
  detectNewSlugs,
} from './lib/changelog-detect.js';
import {
  findConsistencyIssues,
  formatIssues,
} from './lib/changelog-consistency.js';
import {
  defaultGitRunner,
  resolveVersionTag,
} from './lib/changelog-git.js';
import {
  CONTENT_LOCALES,
  type Locale,
  type Source,
  SOURCES,
  findSource,
  sourcePath,
  targetFor,
} from './lib/sources.js';

// ─── CLI parsing ─────────────────────────────────────────────────────

interface ParsedArgs {
  command: string;
  positional: string[];
  flags: Record<string, string | boolean>;
}

function parseArgs(argv: string[]): ParsedArgs {
  const [command, ...rest] = argv;
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg.startsWith('--')) {
      const name = arg.slice(2);
      const next = rest[i + 1];
      if (next === undefined || next.startsWith('--')) {
        flags[name] = true;
      } else {
        flags[name] = next;
        i += 1;
      }
    } else {
      positional.push(arg);
    }
  }
  return { command: command ?? 'help', positional, flags };
}

function resolveSources(flag: string | boolean | undefined): Source[] {
  if (typeof flag !== 'string') return SOURCES;
  const match = findSource(flag);
  if (!match) {
    console.error(
      `Unknown source: ${flag}. Known: ${SOURCES.map((s) => s.slug).join(', ')}`,
    );
    process.exit(1);
  }
  return [match];
}

// ─── Commands ────────────────────────────────────────────────────────

async function cmdDetect(flags: ParsedArgs['flags']): Promise<void> {
  const sources = resolveSources(flags.source);
  const registry = await loadRegistry();
  const results = [];
  for (const source of sources) {
    const newSlugs = await detectNewSlugs(source, registry);
    if (newSlugs.length === 0) continue;
    const described = await describeChanges(source, newSlugs);
    results.push(...described);
  }
  console.log(JSON.stringify(results, null, 2));
}

interface Decision {
  repo: string;
  slug: string;
  status: 'published' | 'dismissed';
  classification?: Classification;
  reason?: string;
  source_commit: string;
  override?: OverrideRecord | null;
}

function validateDecision(decision: Decision): void {
  if (!decision.repo || !decision.slug || !decision.source_commit) {
    throw new Error(
      `Decision missing repo/slug/source_commit: ${JSON.stringify(decision)}`,
    );
  }
  if (decision.status === 'published' && !decision.classification) {
    throw new Error(
      `Published decision for ${decision.repo}/${decision.slug} needs classification.`,
    );
  }
  if (decision.status === 'dismissed' && !decision.reason) {
    throw new Error(
      `Dismissed decision for ${decision.repo}/${decision.slug} needs reason.`,
    );
  }
  if (!findSource(decision.repo)) {
    throw new Error(
      `Decision references unknown source repo: ${decision.repo}.`,
    );
  }
}

function entryFilePath(locale: Locale, repoSlug: string, changeSlug: string): string {
  return path.join(targetFor(locale, path.join('changes', repoSlug)), `${changeSlug}.md`);
}

async function deleteEntryFiles(repoSlug: string, changeSlug: string): Promise<void> {
  for (const locale of CONTENT_LOCALES) {
    const filePath = entryFilePath(locale, repoSlug, changeSlug);
    if (existsSync(filePath)) {
      await rm(filePath);
    }
  }
}

async function cmdCommit(flags: ParsedArgs['flags']): Promise<void> {
  const decisionsPath = typeof flags.decisions === 'string' ? flags.decisions : '';
  if (!decisionsPath) {
    console.error('commit requires --decisions <path>');
    process.exit(1);
  }
  const decisions = JSON.parse(await readFile(decisionsPath, 'utf8')) as Decision[];
  if (!Array.isArray(decisions)) {
    console.error('decisions file must contain a JSON array');
    process.exit(1);
  }

  let registry = await loadRegistry();

  for (const decision of decisions) {
    validateDecision(decision);

    const previous = getEntry(registry, decision.repo, decision.slug);
    const override = resolveOverride(decision, previous);

    let nextEntry: RegistryEntry;
    if (decision.status === 'published') {
      nextEntry = makePublishedEntry({
        classification: decision.classification!,
        source_commit: decision.source_commit,
        override,
      }) satisfies PublishedEntry;
    } else {
      nextEntry = makeDismissedEntry({
        reason: decision.reason!,
        source_commit: decision.source_commit,
        override,
      }) satisfies DismissedEntry;
    }

    if (
      previous &&
      previous.status === 'published' &&
      decision.status === 'dismissed'
    ) {
      await deleteEntryFiles(decision.repo, decision.slug);
    }

    registry = setEntry(registry, decision.repo, decision.slug, nextEntry);
  }

  await saveRegistry(registry);
  console.log(
    `Wrote ${decisions.length} decision(s) to ${path.relative(process.cwd(), DEFAULT_REGISTRY_PATH)}`,
  );
}

function resolveOverride(
  decision: Decision,
  previous: RegistryEntry | undefined,
): OverrideRecord | null {
  if (decision.override !== undefined) return decision.override;
  if (!previous) return null;
  if (previous.status === decision.status) {
    return previous.override ?? null;
  }
  return {
    by: 'user',
    at: new Date().toISOString(),
    previous_status: previous.status,
  };
}

async function cmdCheck(flags: ParsedArgs['flags']): Promise<void> {
  const sources = resolveSources(flags.source);
  const registry = await loadRegistry();
  const issues = await findConsistencyIssues(
    registry,
    sources.map((s) => s.slug),
  );
  console.log(formatIssues(issues));
  if (issues.length > 0) process.exit(1);
}

async function cmdResolveTag(args: ParsedArgs): Promise<void> {
  const sha = args.positional[0];
  const sourceFlag = args.flags.source;
  if (!sha) {
    console.error('resolve-tag requires a commit SHA as positional arg');
    process.exit(1);
  }
  if (typeof sourceFlag !== 'string') {
    console.error('resolve-tag requires --source <slug>');
    process.exit(1);
  }
  const source = findSource(sourceFlag);
  if (!source) {
    console.error(
      `Unknown source: ${sourceFlag}. Known: ${SOURCES.map((s) => s.slug).join(', ')}`,
    );
    process.exit(1);
  }
  const tag = await resolveVersionTag(sha, sourcePath(source), defaultGitRunner);
  console.log(tag);
}

async function cmdList(flags: ParsedArgs['flags']): Promise<void> {
  const sources = resolveSources(flags.source);
  const statusFilter =
    flags.status === 'published' || flags.status === 'dismissed' ? flags.status : undefined;
  const registry = await loadRegistry();
  const rows: Array<{
    repo: string;
    slug: string;
    status: string;
    detail: string;
    override: boolean;
  }> = [];
  for (const source of sources) {
    const bucket = registry[source.slug] ?? {};
    for (const [slug, entry] of Object.entries(bucket)) {
      if (statusFilter && entry.status !== statusFilter) continue;
      rows.push({
        repo: source.slug,
        slug,
        status: entry.status,
        detail:
          entry.status === 'published' ? entry.classification : entry.reason,
        override: entry.override !== null,
      });
    }
  }
  rows.sort((a, b) => a.slug.localeCompare(b.slug));
  console.log(JSON.stringify(rows, null, 2));
}

function cmdHelp(): void {
  console.log(`
Usage: pnpm sync:changelog <command> [options]

Commands:
  detect [--source <slug>]
      Print JSON of archived changes not yet recorded in the registry.

  commit --decisions <path>
      Apply decisions JSON to the registry. On a publish→dismiss override,
      deletes the EN + ES entry files for that slug.

  check [--source <slug>]
      Consistency check: registry 'published' entries must have EN + ES files,
      and every file must have a 'published' registry entry. Exits 1 on issues.

  resolve-tag <sha> --source <slug>
      Print the first semver tag containing the commit, else "Unreleased".

  list [--status published|dismissed] [--source <slug>]
      List registry entries as JSON.
`);
}

// ─── Entry ───────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  switch (args.command) {
    case 'detect':
      await cmdDetect(args.flags);
      return;
    case 'commit':
      await cmdCommit(args.flags);
      return;
    case 'check':
      await cmdCheck(args.flags);
      return;
    case 'resolve-tag':
      await cmdResolveTag(args);
      return;
    case 'list':
      await cmdList(args.flags);
      return;
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      cmdHelp();
      return;
    default:
      console.error(`Unknown command: ${args.command}`);
      cmdHelp();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
