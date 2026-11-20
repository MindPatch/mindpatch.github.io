import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  // Any .md file in src/content/blog becomes a post; the file name is the URL slug.
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      draft: z.boolean().default(false),
      // Optional label above the title on listings, e.g. "Malware · Supply chain".
      // Falls back to the first two tags.
      category: z.string().optional(),
      // Optional attack chain, shown as a strip on listings and as a card on
      // the post and the homepage hero. `hot` marks the step that hurts.
      chain: z
        .array(z.object({ step: z.string(), note: z.string().optional(), hot: z.boolean().default(false) }))
        .default([]),
      // Optional one-liner for what the post hands you, e.g. "2 YARA rules".
      ships: z.string().optional(),
    }),
});

export const collections = { blog };
