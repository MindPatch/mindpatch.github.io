import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { remarkMermaid } from './src/lib/remark-mermaid.mjs';

export default defineConfig({
  site: 'https://www.mindpatch.net',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkMermaid],
    shikiConfig: {
      theme: 'github-dark-default',
      wrap: false,
      // No YARA grammar ships with Shiki: render it as plain text but keep
      // "yara" as the language so the code block's label says so.
      langAlias: { yara: 'text' },
    },
  },
});
