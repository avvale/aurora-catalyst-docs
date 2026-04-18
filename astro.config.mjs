// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Publishing to GitHub Pages as a project site:
//   https://<user>.github.io/<repo>/
// Update `site` and `base` with the real repository slug before first deploy.
const REPO_OWNER = 'avvale';
const REPO_NAME = 'aurora-catalyst-docs';

export default defineConfig({
  site: `https://${REPO_OWNER}.github.io`,
  base: `/${REPO_NAME}`,
  // Redirect the bare base URL to the default locale so visitors never land
  // on an empty page. Astro does NOT prepend `base` to redirect targets, so
  // we include it manually to keep the URL working both locally and on Pages.
  redirects: {
    '/': `/${REPO_NAME}/en/`,
  },
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
          autogenerate: { directory: 'reference' },
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
