import { Calendar, Clock, User, ArrowLeft, Tag } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BlogPostClient from './BlogPostClient'
import { blogPosts, type BlogPost } from '../../../lib/blog-posts'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  return blogPosts.map((post) => {
    const titleSlug = post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    return {
      slug: titleSlug,
    }
  })
}

export default function BlogPostPage({ params }: PageProps) {
  // Convert URL slug back to match against titles
  const urlSlug = params.slug
  const post = blogPosts.find(p => {
    const titleSlug = p.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
    return titleSlug === urlSlug
  })

  if (!post) {
    notFound()
  }

  // Find related posts based on shared tags
  const relatedPosts = blogPosts
    .filter(p => p.slug !== post.slug) // Exclude current post
    .map(p => ({
      ...p,
      sharedTags: p.tags.filter(tag => post.tags.includes(tag)).length
    }))
    .filter(p => p.sharedTags > 0) // Only posts with shared tags
    .sort((a, b) => b.sharedTags - a.sharedTags) // Sort by most shared tags
    .slice(0, 4) // Limit to 4 related posts
    .map(({ sharedTags, ...p }) => p) // Remove the temporary sharedTags property

  return (
    <main className="min-h-screen bg-black text-cyber-green">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-sm border-b border-cyber-green/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="font-mono text-xl font-bold hover:text-white transition-colors">
            mindpatch@home:~$
          </Link>
          
          <div className="flex space-x-6 font-mono">
            <Link href="/" className="hover:text-white transition-colors">home</Link>
            <Link href="/about" className="hover:text-white transition-colors">about</Link>
            <Link href="/blog" className="hover:text-white transition-colors">blog</Link>
            <Link href="/contact" className="hover:text-white transition-colors">contact</Link>
          </div>
        </div>
      </nav>

      <BlogPostClient post={post} relatedPosts={relatedPosts} />

      {/* Footer */}
      <footer className="border-t border-cyber-green/20 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 font-mono">
            <span className="text-white">MindPatch</span> © 2025 | Built with Next.js & TypeScript
          </p>
        </div>
      </footer>
    </main>
  )
} 