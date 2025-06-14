'use client'

import { motion } from 'framer-motion'
import { Search, Calendar, Clock, Tag, User } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { blogPosts, type BlogPost } from '../../lib/blog-posts'
import ImageZoom from './[slug]/ImageZoom'

export default function BlogClient() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const blogContentRef = useRef<HTMLDivElement>(null)

  // Get all unique tags
  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags)))

  // Filter posts based on search and tag
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = selectedTag === '' || post.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  // Replace images with ImageZoom components
  useEffect(() => {
    if (!blogContentRef.current) return

    const images = blogContentRef.current.querySelectorAll('img')
    
    images.forEach((img) => {
      // Create a wrapper div for the React component
      const wrapper = document.createElement('div')
      wrapper.className = 'image-zoom-wrapper'
      
      // Insert wrapper before the image
      img.parentNode?.insertBefore(wrapper, img)
      
      // Create React root and render ImageZoom component
      const root = createRoot(wrapper)
      root.render(
        <ImageZoom 
          src={img.src} 
          alt={img.alt || ''} 
          className="my-4"
        />
      )
      
      // Remove the original image
      img.remove()
    })
  }, [filteredPosts])

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
            <Link href="/blog" className="text-white">blog</Link>
            <Link href="/contact" className="hover:text-white transition-colors">contact</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto" ref={blogContentRef}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold font-mono mb-6">
              <span className="text-white">Security</span>{' '}
              <span className="text-cyber-green animate-glow">Blog</span>
            </h1>
            <p className="text-gray-400 text-xl font-mono max-w-2xl mx-auto leading-relaxed">
              Vulnerability research and cybersecurity insights from the field.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12 space-y-6"
          >
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900/50 border border-cyber-green/20 rounded-lg pl-12 pr-4 py-3 text-white font-mono focus:outline-none focus:border-cyber-green/50 transition-colors"
              />
            </div>

            {/* Tag Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag('')}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                  selectedTag === '' 
                    ? 'bg-cyber-green text-black' 
                    : 'bg-gray-900/50 border border-cyber-green/20 text-cyber-green hover:bg-cyber-green/10'
                }`}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                    selectedTag === tag 
                      ? 'bg-cyber-green text-black' 
                      : 'bg-gray-900/50 border border-cyber-green/20 text-cyber-green hover:bg-cyber-green/10'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Blog Posts */}
          <div className="space-y-8">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-gray-900/50 border border-cyber-green/20 rounded-lg overflow-hidden hover:border-cyber-green/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyber-green/10"
              >
                {/* Post Header */}
                <div className="p-8">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-mono mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {Math.ceil(post.content.length / 1000)} min read
                    </div>
                  </div>

                  <Link href={`/blog/${post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`} className="text-left w-full group block">
                    <h2 className="text-2xl font-bold font-mono text-white mb-4 group-hover:text-cyber-green transition-colors">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-gray-300 font-mono leading-relaxed mb-6">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-cyber-green/10 border border-cyber-green/20 rounded-full text-xs font-mono text-cyber-green"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/blog/${post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}
                      className="flex items-center gap-2 text-cyber-green hover:text-white transition-colors font-mono text-sm"
                    >
                      Read Full Post →
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-400 font-mono text-lg">
                No posts found matching your criteria.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-cyber-green/20 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 font-mono">
            <span className="text-white">MindPatch</span> © 2025
          </p>
        </div>
      </footer>

      <style jsx global>{`
        .animate-glow {
          animation: glow 2s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from {
            text-shadow: 0 0 5px #00ff41, 0 0 10px #00ff41, 0 0 15px #00ff41;
          }
          to {
            text-shadow: 0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41;
          }
        }

        .blog-content h1 {
          @apply text-3xl font-bold text-white mb-6 font-mono;
        }
        
        .blog-content h2 {
          @apply text-2xl font-bold text-cyber-green mb-4 font-mono;
        }
        
        .blog-content h3 {
          @apply text-xl font-bold text-white mb-3 font-mono;
        }
        
        .blog-content p {
          @apply text-gray-300 mb-4 font-mono leading-relaxed;
        }
        
        .blog-content ul, .blog-content ol {
          @apply text-gray-300 mb-4 font-mono pl-6;
        }
        
        .blog-content li {
          @apply mb-2;
        }

        .blog-content ul li {
          @apply list-disc;
        }

        .blog-content ol li {
          @apply list-decimal;
        }
        
        .blog-content pre {
          @apply bg-gray-900 border border-cyber-green/20 rounded-lg p-4 mb-4 overflow-x-auto;
          background: #2d2d2d !important;
          border: 1px solid rgba(0, 255, 65, 0.2);
          border-radius: 8px;
          padding: 1.5rem;
          font-family: 'JetBrains Mono', monospace;
          margin: 1.5rem 0;
          position: relative;
        }
        
        .blog-content code {
          @apply text-cyber-green font-mono text-sm;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875em;
        }
        
        .blog-content pre code {
          @apply text-gray-300;
          background: transparent !important;
          padding: 0;
          border-radius: 0;
          color: inherit;
        }
        
        .blog-content :not(pre) > code {
          background: #161b22;
          padding: 2px 6px;
          border-radius: 4px;
          color: #00ff41;
          border: 1px solid rgba(0, 255, 65, 0.2);
        }

        .blog-content blockquote {
          @apply border-l-4 border-cyber-green pl-4 italic text-gray-400 mb-4;
        }
        
        .blog-content a {
          @apply text-cyber-green hover:text-white transition-colors underline;
        }
        
        .blog-content hr {
          @apply border-cyber-green/20 my-8;
        }
        
        .blog-content strong {
          @apply text-white font-bold;
        }

        .blog-content em {
          @apply text-gray-400 italic;
        }

        .blog-content img {
          display: block;
          margin: 2rem auto;
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          border: 1px solid rgba(0, 255, 65, 0.2);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          object-fit: contain;
          max-height: 500px;
        }
        
        .blog-content figure {
          text-align: center;
          margin: 2rem 0;
        }
        
        .blog-content figcaption {
          color: #9ca3af;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          font-style: italic;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .image-zoom-wrapper {
          display: block;
          margin: 2rem auto;
          max-width: 100%;
          text-align: center;
        }
        
        .image-zoom-wrapper img {
          max-height: 400px;
          width: auto;
          object-fit: contain;
        }
      `}</style>
    </main>
  )
} 