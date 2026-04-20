import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

/**
 * Frontmatter fields added to changelog entries under `changes/<repo>/<slug>.md`.
 * Every field is optional at the schema level — only the pages produced by the
 * `catalyst-changelog-sync` skill populate them. Other docs keep the plain
 * Starlight schema.
 */
const changelogEntryFields = z.object({
  date: z.coerce.date().optional(),
  version: z.string().optional(),
  classification: z.enum(['feature', 'breaking', 'deprecation']).optional(),
  source_commit: z.string().optional(),
  source_archive_url: z.string().url().optional(),
});

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({ extend: changelogEntryFields }),
  }),
};
