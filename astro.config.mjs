import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { remarkMermaid } from './src/lib/remark-mermaid.mjs';

export default defineConfig({
  site: 'https://www.mindpatch.net',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  // The homepage is the blog; keep /blog/ working for old links.
  redirects: { '/blog': '/' },
  markdown: {
    remarkPlugins: [remarkMermaid],
    shikiConfig: { theme: 'github-dark-dimmed', wrap: false },
  },
});
