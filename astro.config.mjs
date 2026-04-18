// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Publishing to GitHub Pages as a project site:
//   https://<user>.github.io/<repo>/
// Update `site` and `base` with the real repository slug before first deploy.
const REPO_OWNER = 'avvale';
const REPO_NAME = 'aurora-catalyst-docs';

// `base` stays the same in dev and prod so hardcoded links in frontmatter
// (hero actions, etc.) work identically in both environments. The
// locale-aware root redirect lives in `src/pages/index.astro`.
export default defineConfig({
  site: `https://${REPO_OWNER}.github.io`,
  base: `/${REPO_NAME}`,
  integrations: [
    starlight({
      title: 'Aurora Catalyst',
      description:
        'Documentation for the Aurora Catalyst ecosystem — CLI, framework, and conventions.',
      defaultLocale: 'en',
      locales: {
        en: { label: 'English', lang: 'en' },
        es: { label: 'Español', lang: 'es' },
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: `https://github.com/${REPO_OWNER}/${REPO_NAME}`,
        },
      ],
      // Sidebar follows the Diátaxis framework:
      //   tutorials → learn by doing
      //   guides    → solve a concrete task
      //   reference → consult technical facts
      //   concepts  → understand the why
      sidebar: [
        {
          label: 'Tutorials',
          translations: { es: 'Tutoriales' },
          autogenerate: { directory: 'tutorials' },
        },
        {
          label: 'How-to guides',
          translations: { es: 'Guías' },
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'Reference',
          translations: { es: 'Referencia' },
          items: [
            { slug: 'reference' },
            {
              label: 'CLI Commands',
              translations: { es: 'Comandos CLI' },
              autogenerate: { directory: 'reference/cli-commands' },
            },
            {
              label: 'API',
              autogenerate: { directory: 'reference/api' },
              collapsed: true,
            },
          ],
        },
        {
          label: 'Concepts',
          translations: { es: 'Conceptos' },
          autogenerate: { directory: 'concepts' },
        },
        {
          label: 'Change history',
          translations: { es: 'Historial de cambios' },
          autogenerate: { directory: 'changes' },
          collapsed: true,
        },
      ],
      editLink: {
        baseUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/edit/main/`,
      },
      lastUpdated: true,
    }),
  ],
});
