# MindPatch - Cybersecurity Portfolio

A modern, visually stunning portfolio website for cybersecurity professionals built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- Modern terminal-inspired cybersecurity theme with smooth animations
- SEO optimized with proper meta tags and structured data
- Markdown blog with automatic HTML rendering
- GitHub Actions workflow for automatic deployment
- Static site generation for optimal performance
- Responsive design that works on all devices

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React
- Gray Matter + Remark for Markdown processing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Open http://localhost:3000

## Writing Blog Posts

Create Markdown files in the `posts/` directory:

```markdown
---
title: "Your Post Title"
date: "2025-01-15"
excerpt: "Brief description"
tags: ["Security", "Bug Bounty"]
author: "Your Name"
---

# Your Post Title

Your content here...
```

## Deployment

### GitHub Pages

1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. GitHub Actions will automatically deploy on push to main

### Manual Build

```bash
npm run build
```

Static files will be generated in the `out/` directory.

## Customization

- Update personal information in `app/about/page.tsx`
- Modify contact details in `app/contact/page.tsx`
- Change colors in `tailwind.config.js`
- Update SEO metadata in `app/layout.tsx`

## License

MIT License - see LICENSE file for details. 