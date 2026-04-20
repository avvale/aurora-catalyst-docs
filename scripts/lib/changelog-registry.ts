import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { DOCS_ROOT } from './sources.js';

export const DEFAULT_REGISTRY_PATH = path.join(DOCS_ROOT, 'scripts/changelog-registry.json');

export type Classification = 'feature' | 'breaking' | 'deprecation';

export interface OverrideRecord {
  by: 'user';
  at: string;
  previous_status: 'published' | 'dismissed';
}

export interface PublishedEntry {
  status: 'published';
  classification: Classification;
  classified_at: string;
  source_commit: string;
  override: OverrideRecord | null;
}

export interface DismissedEntry {
  status: 'dismissed';
  reason: string;
  classified_at: string;
  source_commit: string;
  override: OverrideRecord | null;
}

export type RegistryEntry = PublishedEntry | DismissedEntry;

export type Registry = Record<string, Record<string, RegistryEntry>>;

export async function loadRegistry(
  registryPath: string = DEFAULT_REGISTRY_PATH,
): Promise<Registry> {
  if (!existsSync(registryPath)) return {};
  const raw = await readFile(registryPath, 'utf8');
  const trimmed = raw.trim();
  if (trimmed === '') return {};
  return JSON.parse(trimmed) as Registry;
}

export async function saveRegistry(
  registry: Registry,
  registryPath: string = DEFAULT_REGISTRY_PATH,
): Promise<void> {
  const sorted = sortRegistry(registry);
  await writeFile(registryPath, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
}

function sortRegistry(registry: Registry): Registry {
  const out: Registry = {};
  for (const repo of Object.keys(registry).sort()) {
    const slugs = registry[repo];
    const sortedSlugs: Record<string, RegistryEntry> = {};
    for (const slug of Object.keys(slugs).sort()) {
      sortedSlugs[slug] = slugs[slug];
    }
    out[repo] = sortedSlugs;
  }
  return out;
}

export function getEntry(
  registry: Registry,
  repoSlug: string,
  changeSlug: string,
): RegistryEntry | undefined {
  return registry[repoSlug]?.[changeSlug];
}

export function hasEntry(
  registry: Registry,
  repoSlug: string,
  changeSlug: string,
): boolean {
  return Boolean(registry[repoSlug]?.[changeSlug]);
}

export function setEntry(
  registry: Registry,
  repoSlug: string,
  changeSlug: string,
  entry: RegistryEntry,
): Registry {
  const next: Registry = { ...registry, [repoSlug]: { ...(registry[repoSlug] ?? {}) } };
  next[repoSlug][changeSlug] = entry;
  return next;
}

export function publishedSlugs(
  registry: Registry,
  repoSlug: string,
): string[] {
  const bucket = registry[repoSlug];
  if (!bucket) return [];
  return Object.entries(bucket)
    .filter(([, entry]) => entry.status === 'published')
    .map(([slug]) => slug)
    .sort();
}

export function dismissedSlugs(
  registry: Registry,
  repoSlug: string,
): string[] {
  const bucket = registry[repoSlug];
  if (!bucket) return [];
  return Object.entries(bucket)
    .filter(([, entry]) => entry.status === 'dismissed')
    .map(([slug]) => slug)
    .sort();
}

export function makePublishedEntry(params: {
  classification: Classification;
  source_commit: string;
  classified_at?: string;
  override?: OverrideRecord | null;
}): PublishedEntry {
  return {
    status: 'published',
    classification: params.classification,
    classified_at: params.classified_at ?? new Date().toISOString(),
    source_commit: params.source_commit,
    override: params.override ?? null,
  };
}

export function makeDismissedEntry(params: {
  reason: string;
  source_commit: string;
  classified_at?: string;
  override?: OverrideRecord | null;
}): DismissedEntry {
  return {
    status: 'dismissed',
    reason: params.reason,
    classified_at: params.classified_at ?? new Date().toISOString(),
    source_commit: params.source_commit,
    override: params.override ?? null,
  };
}
