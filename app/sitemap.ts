import { MetadataRoute } from 'next'
import { blogPosts, BlogPost } from '../lib/blog-posts'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mindpatch.net'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  // Blog post pages
  const blogPages = blogPosts.map((post: BlogPost) => ({
    url: `${baseUrl}/blog/${post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...blogPages]
} 