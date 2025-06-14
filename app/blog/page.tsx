import { Metadata } from 'next'
import { Suspense } from 'react'
import { blogPosts } from '../../lib/blog-posts'
import BlogClient from './BlogClient'

export const metadata: Metadata = {
  title: 'Security Blog - Cybersecurity Insights & Writeups | MindPatch',
  description: 'Explore cybersecurity insights, vulnerability research, CTF writeups, and security automation tutorials. Stay updated with the latest in offensive security.',
  keywords: ['cybersecurity blog', 'security writeups', 'vulnerability research', 'CTF writeups', 'penetration testing', 'bug bounty', 'security insights'],
  authors: [{ name: 'MindPatch' }],
  creator: 'MindPatch',
  publisher: 'MindPatch',
  openGraph: {
    title: 'Security Blog - Cybersecurity Insights & Writeups',
    description: 'Explore cybersecurity insights, vulnerability research, CTF writeups, and security automation tutorials.',
    url: 'https://mindpatch.net/blog',
    siteName: 'MindPatch',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Security Blog - Cybersecurity Insights & Writeups',
    description: 'Explore cybersecurity insights, vulnerability research, CTF writeups, and security automation tutorials.',
    creator: '@mindpatch',
  },
  alternates: {
    canonical: 'https://mindpatch.net/blog',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function BlogPage() {
  // JSON-LD structured data for blog
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'MindPatch Security Blog',
    description: 'Cybersecurity insights, vulnerability research, and security automation tutorials',
    url: 'https://mindpatch.net/blog',
    author: {
      '@type': 'Person',
      name: 'MindPatch',
      url: 'https://mindpatch.net/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MindPatch',
      url: 'https://mindpatch.net',
    },
    blogPost: blogPosts.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      author: {
        '@type': 'Person',
        name: post.author,
      },
      url: `https://mindpatch.net/blog/${post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`,
      keywords: post.tags.join(', '),
    })),
    inLanguage: 'en-US',
  }

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Suspense fallback={
        <main className="min-h-screen bg-black text-cyber-green flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-cyber-green border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="font-mono">Loading blog...</p>
          </div>
        </main>
      }>
        <BlogClient />
      </Suspense>
    </>
  )
} 