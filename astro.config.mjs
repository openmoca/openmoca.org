// @ts-check
import { existsSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import starlightLinksValidator from 'starlight-links-validator';
import sitemap from '@astrojs/sitemap';

// One map for every page: sources.json. The sidebar follows its groups and order.
const sources = JSON.parse(readFileSync(new URL('./sources.json', import.meta.url), 'utf8'));
// The site's two zones (zones.json): the main site, full width with a top navigation bar, and the docs, with the
// sidebar. Pages that moved get a redirect page here, and a permanent redirect in worker/index.js.
const zones = JSON.parse(readFileSync(new URL('./zones.json', import.meta.url), 'utf8'));
// The site's own pages in the docs' sidebar, by group. The main site's pages are never in the sidebar.
const sitePages = {
  Learn: ['docs/how-openmoca-works'],
  Guides: ['start', 'docs/guides/open-a-package', 'docs/guides/ai-assistant'],
  Specification: ['spec', 'spec/app-types', 'spec/node-types'],
  Tools: ['tools'],
  Project: ['releases'],
};
const collapsed = new Set(['Project']);
// Groups in a set order, mixing the site's own pages with synced ones. A page not listed keeps its place after the
// listed ones. Project: where it is going, how it is run and how to take part, what changed and how to upgrade.
const ORDER = {
  // How OpenMOCA works first, then the documentation index and the rest of Learn as sources.json lists them.
  Learn: ['docs/how-openmoca-works', 'docs'],
  // Get started and the three Readers' guides first, then the guides.
  Guides: ['start', 'start/typescript', 'start/dotnet', 'start/python', 'docs/guides/open-a-package', 'docs/guides/ai-assistant'],
  // The overview, then the MCP server most people need, then the tools that make a package in the order they are used.
  Tools: ['tools', 'tools/mcp', 'tools/convert', 'tools/moca-lint', 'tools/moca-sign', 'tools/moca-index', 'tools/moca-embed'],
  Project: [
    'releases', 'project/commitment', 'project/roadmap', 'project/governance', 'project/contributing', 'project/code-of-conduct',
    'project/security', 'project/changelog', 'project/migrations', 'project/releasing',
  ],
};
const rank = (group, slug) => {
  const i = (ORDER[group] ?? []).indexOf(slug);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
};
const ordered = (group, slugs) => [...slugs].sort((a, b) => rank(group, a) - rank(group, b));
const sidebar = sources.groups
  .map((group) => ({
    label: group,
    collapsed: collapsed.has(group),
    items: ordered(group, [
      // The site's own pages, once they exist (src/site-pages/, copied in by the sync).
      ...(sitePages[group] ?? []).filter((slug) => ['.md', '.mdx'].some((ext) => existsSync(new URL(`./src/content/docs/${slug}${ext}`, import.meta.url)) || existsSync(new URL(`./src/content/docs/${slug}/index${ext}`, import.meta.url)))),
      ...sources.pages.filter((p) => p.group === group).map((p) => p.route),
    ]).map((slug) => ({ slug })),
  }))
  .filter((g) => g.items.length > 0);

export default defineConfig({
  site: 'https://openmoca.org',
  trailingSlash: 'always',
  // Pages that moved in 0.7.0, so old links still land. The Worker answers them with a 301 first.
  redirects: Object.fromEntries(Object.entries(zones.moved).map(([from, to]) => [from.replace(/\/$/, ''), to])),
  integrations: [
    // The sitemap Starlight would add by itself, plus the talk slides: static pages in public/talks/ it cannot see.
    sitemap({ customPages: ['https://openmoca.org/talks/introduction-to-openmoca/'] }),
    // Mermaid diagrams in the docs, drawn in the browser from the bundled library, in the site's light or dark theme.
    // It must come before Starlight, so it takes the mermaid code blocks first.
    mermaid({ autoTheme: true, mermaidConfig: { fontFamily: 'Inter, system-ui, sans-serif' } }),
    starlight({
      title: 'OpenMOCA',
      description: 'Knowledge that travels with its context. The open standard for portable, attributable and trustworthy knowledge.',
      logo: {
        light: './src/assets/openmoca-logo-horizontal-ink.svg',
        dark: './src/assets/openmoca-logo-horizontal-cream.svg',
        replacesTitle: true,
      },
      favicon: '/favicon.svg',
      head: [
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon.ico', sizes: '32x32' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
        { tag: 'meta', attrs: { property: 'og:image', content: 'https://openmoca.org/og-image.png' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
      ],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/openmoca' }],
      customCss: [
        '@fontsource/inter/400.css',
        '@fontsource/inter/500.css',
        '@fontsource/inter/600.css',
        '@fontsource/jetbrains-mono/400.css',
        './src/styles/base.css',
        './src/styles/openmoca.css',
        './src/styles/starlight-theme.css',
      ],
      components: {
        ThemeProvider: './src/components/ThemeProvider.astro',
        Head: './src/components/Head.astro',
        Footer: './src/components/Footer.astro',
        Header: './src/components/Header.astro',
        PageTitle: './src/components/PageTitle.astro',
        SocialIcons: './src/components/SocialIcons.astro',
      },
      sidebar,
      // Talk slides are static pages in public/talks/, outside the docs, so the validator cannot see them.
      plugins: [starlightLinksValidator({ errorOnRelativeLinks: true, exclude: ['/talks/**'] })],
    }),
  ],
});
