// @ts-check
import { existsSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import starlightLinksValidator from 'starlight-links-validator';
import sitemap from '@astrojs/sitemap';

// One map for every page: sources.json. The sidebar follows its groups and order.
const sources = JSON.parse(readFileSync(new URL('./sources.json', import.meta.url), 'utf8'));
const sitePages = { 'Why OpenMOCA': ['creators', 'people', 'answers', 'marks'], Learn: ['how'], Start: ['start', 'start/ai-assistant', 'start/open-a-package'], Specification: ['spec', 'spec/app-types', 'spec/node-types'], Tools: ['tools'], Project: ['about', 'releases', 'talks', 'contact', 'privacy'] };
const collapsed = new Set(['Project']);
// Groups in a set order, mixing the site's own pages with synced ones. Project: who we are, where it is going, how it
// is run and how to take part, what changed and how to upgrade, then contact and privacy.
const ORDER = {
  // For creators, then people, then the answers, then the two marks and the Commitment's full text.
  'Why OpenMOCA': ['creators', 'people', 'answers', 'marks', 'commitment'],
  // How it works first, for builders and organisations: today's technical overview.
  Learn: ['how', 'docs'],
  // The overview, then the MCP server most people need, then the tools that make a package in the order they are used.
  Tools: ['tools', 'tools/mcp', 'tools/convert', 'tools/moca-lint', 'tools/moca-sign', 'tools/moca-index', 'tools/moca-embed'],
  Project: [
    'about', 'releases', 'talks', 'project/roadmap', 'project/governance', 'project/contributing',
    'project/code-of-conduct', 'project/security', 'project/changelog', 'project/migrations', 'project/releasing',
    'contact', 'privacy',
  ],
};
const ordered = (group, slugs) => (ORDER[group] ? [...slugs].sort((a, b) => ORDER[group].indexOf(a) - ORDER[group].indexOf(b)) : slugs);
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
  integrations: [
    // The sitemap Starlight would add by itself, plus the talk slides: static pages in public/talks/ it cannot see.
    sitemap({ customPages: ['https://openmoca.org/talks/introduction-to-openmoca/'] }),
    // Mermaid diagrams in the docs, drawn in the browser from the bundled library, in the site's light or dark theme.
    // It must come before Starlight, so it takes the mermaid code blocks first.
    mermaid({ autoTheme: true, mermaidConfig: { fontFamily: 'Inter, system-ui, sans-serif' } }),
    starlight({
      title: 'OpenMOCA',
      description: "Your work. Your terms. Wherever it goes. OpenMOCA is an open standard that keeps a creator's credits, sources and terms with their work, so any app can read them and people can check where answers came from.",
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
        SocialIcons: './src/components/SocialIcons.astro',
      },
      sidebar,
      // Talk slides are static pages in public/talks/, outside the docs, so the validator cannot see them.
      plugins: [starlightLinksValidator({ errorOnRelativeLinks: true, exclude: ['/talks/**'] })],
    }),
  ],
});
