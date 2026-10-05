# mindpatch.net

Personal site and blog of Khaled Nassar (MindPatch), built with [Astro](https://astro.build) and deployed to GitHub Pages on every push to `master`.

## Writing a post

Add a markdown file to `src/content/blog/`. The file name becomes the URL, so `src/content/blog/my-first-cve.md` is published at `/blog/my-first-cve/`.

```md
---
title: "My first CVE"
description: "One or two sentences. Used for search results, social cards and RSS."
pubDate: 2026-10-05 
tags: [web, xss]
# optional:
# updatedDate: 2026-10-10
# cover: ./images/my-first-cve-cover.png
# coverAlt: "What the cover image shows"
# draft: true
---

Your post in markdown.

![Burp request showing the payload](./images/my-first-cve-burp.png)
```

Commit and push. GitHub Actions builds the site and publishes it in a minute or two.

Or let the helper write the front matter for you:

```sh
npm run new "My first CVE"
```

That creates the file as a draft. Drafts are visible in `npm run dev` but never published; set `draft: false` (or delete the line) when it is ready.

### Images

Put images in `src/content/blog/images/` and link them with a relative path as above. They are resized and converted to WebP at build time, and every image in a post zooms when clicked. Alt text in `![...]` matters for accessibility and SEO.

`cover` is optional. When set, it is shown above the post and used as the social preview image; without it, posts share `public/og.png`.

## What you get

- Markdown posts with syntax highlighting, tables, quotes and lists
- Click-to-zoom images ([medium-zoom](https://github.com/francoischalifour/medium-zoom))
- SEO: canonical URLs, meta descriptions, Open Graph and Twitter cards, JSON-LD (`BlogPosting`, `Blog`, `Person`), `sitemap-index.xml`, `robots.txt`, RSS at `/rss.xml`
- Readable fonts (Inter, Space Grotesk, JetBrains Mono for code); the pixel font is kept for the logo only
- Self-hosted fonts, no client-side framework, zero JS on the page except the homepage animation and image zoom

## Local development

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```
