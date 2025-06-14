'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, User, ArrowLeft, Tag } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import ImageZoom from './ImageZoom'

interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  content: string
  tags: string[]
  author: string
}

interface BlogPostClientProps {
  post: BlogPost
  relatedPosts: BlogPost[]
}

export default function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  const blogContentRef = useRef<HTMLDivElement>(null)

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
          className="my-8"
        />
      )
      
      // Remove the original image
      img.remove()
    })
  }, [post.content])

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-cyber-green hover:text-white transition-colors font-mono text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </motion.div>

        {/* Post Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-mono mb-6">
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

            <h1 className="text-4xl md:text-5xl font-bold font-mono text-white mb-6 leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-gray-300 font-mono leading-relaxed mb-8">
              {post.excerpt}
            </p>

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
          </div>

          {/* Post Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/30 border border-cyber-green/20 rounded-lg p-8"
          >
            <div 
              className="blog-content prose prose-invert prose-cyber max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
              ref={blogContentRef}
            />
          </motion.div>
        </motion.article>

        {/* Navigation to other posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border-t border-cyber-green/20 pt-8"
        >
          <div className="flex justify-between items-center mb-8">
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 text-cyber-green hover:text-white transition-colors font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              All Posts
            </Link>
            
            <div className="text-gray-400 font-mono text-sm">
              More posts coming soon...
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12"
            >
              <h3 className="text-2xl font-bold font-mono text-white mb-6">
                <span className="text-cyber-green">Related</span> Posts
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost, index) => (
                  <motion.article
                    key={relatedPost.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="bg-gray-900/30 border border-cyber-green/20 rounded-lg p-6 hover:border-cyber-green/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyber-green/10"
                  >
                    <div className="flex flex-wrap gap-2 mb-3">
                      {relatedPost.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-cyber-green/10 border border-cyber-green/20 rounded-full text-xs font-mono text-cyber-green"
                        >
                          <Tag className="w-2 h-2" />
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <Link href={`/blog/${relatedPost.slug}`}>
                      <h4 className="text-white font-mono font-semibold mb-3 line-clamp-2 hover:text-cyber-green transition-colors cursor-pointer">
                        {relatedPost.title}
                      </h4>
                    </Link>
                    
                    <p className="text-gray-400 text-sm font-mono line-clamp-3 mb-4">
                      {relatedPost.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                        <Calendar className="w-3 h-3" />
                        {new Date(relatedPost.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      
                      <Link 
                        href={`/blog/${relatedPost.slug}`}
                        className="text-cyber-green hover:text-white transition-colors font-mono text-xs"
                      >
                        Read →
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <style jsx global>{`
        .blog-content h1 {
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 2.5rem;
          font-weight: bold;
          margin: 2rem 0 1rem 0;
          line-height: 1.2;
        }
        
        .blog-content h2 {
          color: #00ff41;
          font-family: 'JetBrains Mono', monospace;
          font-size: 2rem;
          font-weight: bold;
          margin: 2rem 0 1rem 0;
          line-height: 1.3;
        }
        
        .blog-content h3 {
          color: #ffffff;
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.5rem 0 0.75rem 0;
        }
        
        .blog-content p {
          color: #d1d5db;
          font-family: 'JetBrains Mono', monospace;
          line-height: 1.7;
          margin: 1rem 0;
        }
        
        .blog-content ul, .blog-content ol {
          color: #d1d5db;
          font-family: 'JetBrains Mono', monospace;
          margin: 1rem 0;
          padding-left: 2rem;
        }
        
        .blog-content li {
          margin: 0.5rem 0;
          line-height: 1.6;
        }
        
        .blog-content pre {
          background: #2d2d2d !important;
          border: 1px solid rgba(0, 255, 65, 0.2);
          border-radius: 8px;
          padding: 1.5rem;
          overflow-x: auto;
          font-family: 'JetBrains Mono', monospace;
          margin: 1.5rem 0;
          position: relative;
        }
        
        .blog-content code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875em;
        }
        
        .blog-content pre code {
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
        
        .blog-content a {
          color: #00ff41;
          text-decoration: underline;
        }
        
        .blog-content a:hover {
          color: #ffffff;
        }
        
        .blog-content strong {
          color: #ffffff;
          font-weight: bold;
        }
        
        .blog-content hr {
          border: none;
          border-top: 1px solid rgba(0, 255, 65, 0.2);
          margin: 2rem 0;
        }
        
        .blog-content blockquote {
          border-left: 4px solid #00ff41;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #9ca3af;
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
    </div>
  )
} 