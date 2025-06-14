# Automated Blog System Setup

This project includes an automated blog system that generates blog posts from Markdown files using GitHub Actions.

## 🚀 How It Works

1. **Write**: Create markdown files in the `posts/` directory
2. **Push**: Commit and push your changes to GitHub
3. **Build**: GitHub Actions automatically processes the markdown files
4. **Deploy**: Your new blog posts appear on the website automatically

## 📝 Creating a New Blog Post

### Step 1: Create a New Markdown File

1. Navigate to the `posts/` directory
2. Create a new file with a descriptive name: `your-post-title.md`
3. Use the template from `posts/_template.md`

### Step 2: Add Frontmatter

Every blog post must start with YAML frontmatter:

```yaml
---
title: "Your Blog Post Title"
date: "2025-01-15"
excerpt: "A brief description that appears in the blog listing"
tags: ["Security", "Bug Bounty", "XSS"]
author: "MindPatch"
---
```

**Required Fields:**
- `title`: The blog post title
- `date`: Publication date (YYYY-MM-DD format)
- `excerpt`: Short description for the blog listing
- `tags`: Array of relevant tags
- `author`: Author name

### Step 3: Write Your Content

Use standard Markdown syntax for your content:

```markdown
# Main Heading

## Section Heading

### Subsection

**Bold text** and *italic text*

- Bullet points
- Work great

1. Numbered lists
2. Are also supported

```javascript
// Code blocks with syntax highlighting
function example() {
    console.log("Hello, world!");
}
```

> Blockquotes for important information

[Links work too](https://example.com)
```

## 🔄 Automated Workflow

### GitHub Actions Workflow

The system uses `.github/workflows/build-blog.yml` which:

1. **Triggers** on pushes to `posts/**/*.md` files
2. **Processes** markdown files into HTML
3. **Generates** a TypeScript file with all blog data
4. **Commits** the generated file back to the repository
5. **Builds** and deploys the Next.js application

### Local Development

To test locally before pushing:

```bash
# Generate blog posts from markdown
npm run generate-blog

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 File Structure

```
posts/
├── _template.md              # Template for new posts
├── your-first-post.md        # Your blog posts
└── another-post.md

lib/
└── blog-posts.ts            # Auto-generated (don't edit)

scripts/
└── generate-blog-posts.mjs  # Blog generation script

.github/workflows/
└── build-blog.yml           # GitHub Actions workflow
```

## 🎯 Best Practices

### File Naming
- Use kebab-case: `my-awesome-post.md`
- Be descriptive but concise
- Avoid special characters

### Content Guidelines
- Start with an engaging introduction
- Use clear headings for structure
- Include code examples when relevant
- End with a strong conclusion
- Add relevant tags for discoverability

### Date Format
- Always use YYYY-MM-DD format
- Use future dates for scheduled posts
- Keep chronological order for better organization

## 🔧 Customization

### Adding New Fields

To add new frontmatter fields:

1. Update the `BlogPost` interface in `lib/markdown.ts`
2. Modify the generation script in `scripts/generate-blog-posts.mjs`
3. Update the blog components to use the new fields

### Styling

Blog content styling is defined in:
- `app/blog/[slug]/BlogPostClient.tsx` (individual posts)
- `app/blog/page.tsx` (blog listing)

### URL Structure

Currently uses title-based URLs:
- `Legacy SDK Flaws` → `/blog/legacy-sdk-flaws`
- Automatically converts titles to URL-safe slugs

## 🚨 Troubleshooting

### Common Issues

1. **Build fails**: Check frontmatter syntax
2. **Missing posts**: Ensure `.md` extension
3. **Broken links**: Verify markdown syntax
4. **Date errors**: Use YYYY-MM-DD format

### Debugging

```bash
# Check generated blog data
cat lib/blog-posts.ts

# Test markdown processing
npm run generate-blog

# View build logs
npm run build
```

## 📚 Markdown Reference

### Supported Features

- Headers (H1-H6)
- Bold and italic text
- Code blocks with syntax highlighting
- Lists (ordered and unordered)
- Links and images
- Blockquotes
- Horizontal rules
- Tables

### Code Syntax Highlighting

Supported languages include:
- `javascript`
- `python`
- `bash`
- `sql`
- `html`
- `css`
- `json`
- And many more...

## 🎉 Getting Started

1. Copy `posts/_template.md` to create your first post
2. Fill in the frontmatter with your post details
3. Write your content using Markdown
4. Commit and push to GitHub
5. Watch the magic happen! ✨

Your blog post will automatically appear on the website within a few minutes of pushing to GitHub.

## 🔗 Useful Links

- [Markdown Guide](https://www.markdownguide.org/)
- [YAML Frontmatter](https://jekyllrb.com/docs/front-matter/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions) 