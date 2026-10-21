import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { remarkMermaid } from './src/lib/remark-mermaid.mjs';

export default defineConfig({
  site: 'https://www.mindpatch.net',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkMermaid],
    shikiConfig: { theme: 'github-dark', wrap: false },
  },
});
