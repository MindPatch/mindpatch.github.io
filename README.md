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
# category: Malware · Supply chain     # label above the title; defaults to the first two tags
# ships: 2 YARA rules                  # what the post hands you, shown next to the date
# artifact:                            # a real snippet from the post, shown when it is the featured post
#   label: postinstall script
#   code: |-
#     exec("curl -L https://... | bash")
# chain:                               # the attack chain card at the top of the post
#   - { step: "npm install", note: "A typosquat of @angular/core" }
#   - { step: "CHAOS RAT", note: "Remote access on the host", hot: true }
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

### Attack chains

`chain` is optional. When a post has one, it shows as a numbered card at the top of that post, and nowhere else. `hot: true` paints a step red, so use it for the step that does the damage.

### Home page

Your name is the headline. The label above it, the one-line bio and the rows of the ID card live in `src/consts.ts` under `hero`; the card adds the post count and last post date itself. The newest post is featured under the name. Its left panel shows the post's `cover` if it has one, otherwise its `artifact` snippet, otherwise the text takes the full width.

### Images

Put images in `src/content/blog/images/` and link them with a relative path as above. They are resized and converted to WebP at build time, and every image in a post zooms when clicked. Alt text in `![...]` matters for accessibility and SEO.

`cover` is optional. When set, it is shown above the post and used as the social preview image; without it, posts share `public/og.png`.

## What you get

- Markdown posts with syntax highlighting, a language label and copy button on every code block, tables, quotes and lists
- A sticky "On this page" rail on posts with two or more sections
- Click-to-zoom images ([medium-zoom](https://github.com/francoischalifour/medium-zoom))
- SEO: canonical URLs, meta descriptions, Open Graph and Twitter cards, JSON-LD (`BlogPosting`, `Blog`, `Person`), `sitemap-index.xml`, `robots.txt`, RSS at `/rss.xml`
- Warm off-white on near-black with one signal yellow, filled hard-shadowed panels, big uppercase headlines, text greys at 4.5:1 or better: Archivo for text and headlines, IBM Plex Mono for code, dates and labels
- Self-hosted fonts, no client-side framework, zero JS on the page except image zoom, mermaid diagrams and the code copy buttons
- `/` is the index: your name, an ID card, the newest post featured and the rest listed; the full archive lives at `/blog/`

## Local development

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```
