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
# tldr:
#   - "One short point."
#   - "Another one."
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

`cover` is optional. When set, it is shown on the post, as the thumbnail in post lists and as the social preview image. Without it, a title card is generated at build time (`/covers/<slug>.png`) from the title, category and tags, and used in the same places.

`tldr` is optional too: a list of short points (or one paragraph) shown as a card at the top of the post, and published as a shareable image at `/covers/<slug>-tldr.png` (the card's "Save as image" link). Without it, the description is used.

## What you get

- Markdown posts with syntax highlighting, a language label and copy button on every code block, tables, quotes and lists
- Generated cover images and a TL;DR card per post, both also published as 1200×630 PNGs (`src/lib/cards.ts`, built with satori and resvg)
- A thin reading progress line, hover links on section headings that copy the URL, and a quiet cross-page transition (the cover grows from its thumbnail) in browsers that support view transitions
- An "On this page" list in the sidebar of posts with two or more sections (wide screens)
- Click-to-zoom images ([medium-zoom](https://github.com/francoischalifour/medium-zoom))
- SEO: canonical URLs, meta descriptions, Open Graph and Twitter cards, JSON-LD (`BlogPosting`, `Blog`, `Person`), `sitemap-index.xml`, `robots.txt`, RSS at `/rss.xml`
- A calm, minimal true-black theme: Inter for text, JetBrains Mono for code and small labels
- Self-hosted fonts, no client-side framework, zero JS on the page except image zoom, mermaid diagrams and the code copy buttons
- `/` is a short profile page with the latest posts; the full list lives at `/blog/`

## Local development

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```
