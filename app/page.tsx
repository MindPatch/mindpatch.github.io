'use client'

import { motion } from 'framer-motion'
import { Terminal, Shield, Code, Bug, Zap, Github, Linkedin, Mail } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { blogPosts } from '../lib/blog-posts'

const TypingText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }
    }, 100 + delay)

    return () => clearTimeout(timer)
  }, [currentIndex, text, delay])

  return (
    <span className="font-mono">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

const MatrixRain = () => {
  const [drops, setDrops] = useState<number[]>([])

  useEffect(() => {
    // Check if we're in the browser before accessing window
    if (typeof window === 'undefined') return
    
    const columns = Math.floor(window.innerWidth / 20)
    const initialDrops = Array(columns).fill(1)
    setDrops(initialDrops)

    const interval = setInterval(() => {
      setDrops(prev => prev.map(drop => 
        drop * Math.random() > 0.975 ? 1 : drop + 1
      ))
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="matrix-bg">
      {drops.map((drop, i) => (
        <div
          key={i}
          className="absolute text-cyber-green opacity-20 font-mono text-sm"
          style={{
            left: i * 20,
            top: drop * 20,
            transform: `translateY(${drop * 20}px)`,
          }}
        >
          {String.fromCharCode(0x30A0 + Math.random() * 96)}
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  // JSON-LD structured data for homepage
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'MindPatch',
    jobTitle: 'Cybersecurity Engineer',
    description: 'Offensive security specialist focusing on penetration testing, bug hunting, and security automation',
    url: 'https://www.mindpatch.net',
    image: 'https://www.mindpatch.net/profile-image.jpg',
    sameAs: [
      'https://github.com/mindPatch',
      'https://www.linkedin.com/in/knassar702',
    ],
    knowsAbout: [
      'Cybersecurity',
      'Penetration Testing',
      'Bug Bounty Hunting',
      'Vulnerability Research',
      'Security Automation',
      'CTF Competitions',
    ],
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Cybersecurity Engineer',
      occupationLocation: {
        '@type': 'Place',
        name: 'Remote',
      },
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@mindpatch.net',
      contactType: 'professional',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://www.mindpatch.net',
    },
  }

  // Breadcrumb structured data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.mindpatch.net',
      },
    ],
  }

  return (
    <main className="min-h-screen bg-black text-cyber-green relative overflow-hidden">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <MatrixRain />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-sm border-b border-cyber-green/20" role="navigation" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-mono text-xl font-bold"
          >
            <Link href="/" aria-label="MindPatch Home">mindpatch@home:~$</Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex space-x-6 font-mono"
          >
            <Link href="/" className="hover:text-white transition-colors" aria-current="page">home</Link>
            <Link href="/about" className="hover:text-white transition-colors">about</Link>
            <Link href="/blog" className="hover:text-white transition-colors">blog</Link>
            <Link href="/contact" className="hover:text-white transition-colors">contact</Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4" role="banner">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 font-mono">
              <span className="text-white">Mind</span>
              <span className="text-cyber-green animate-glow">Patch</span>
            </h1>
            
            <div className="text-xl md:text-2xl mb-8 h-8">
              <TypingText text="Cybersecurity Engineer | Penetration Tester | Bug Hunter" />
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1 }}
              className="text-gray-400 text-lg max-w-2xl mx-auto font-mono"
            >
              Specializing in <Link href="/about" className="text-cyber-green hover:text-white transition-colors">offensive security</Link>, 
              <Link href="/blog" className="text-cyber-green hover:text-white transition-colors ml-1">vulnerability research</Link>, and 
              <Link href="/contact" className="text-cyber-green hover:text-white transition-colors ml-1">security automation</Link>.
              Breaking systems to make them stronger.
            </motion.p>
          </motion.div>

          {/* Skills Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            role="region"
            aria-label="Core Skills"
          >
            {[
              { icon: Shield, title: 'Penetration Testing', desc: 'Web, mobile, and network security assessment', link: '/about#penetration-testing' },
              { icon: Bug, title: 'CTF Competitions', desc: 'Solving security challenges and writeups', link: '/blog?tag=CTF' },
              { icon: Code, title: 'Security Automation', desc: 'Advanced tools and projects', link: '/about#automation' },
              { icon: Zap, title: 'Vulnerability Research', desc: 'Finding and analyzing security flaws', link: '/blog?tag=research' },
            ].map((skill, index) => (
              <motion.div
                key={skill.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + index * 0.2, duration: 0.6 }}
                className="bg-gray-900/50 border border-cyber-green/20 rounded-lg p-6 hover:border-cyber-green/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyber-green/10"
              >
                <skill.icon className="w-8 h-8 text-cyber-green mb-4" aria-hidden="true" />
                <h3 className="text-white font-mono font-semibold mb-2">
                  <Link href={skill.link} className="hover:text-cyber-green transition-colors">
                    {skill.title}
                  </Link>
                </h3>
                <p className="text-gray-400 text-sm font-mono">{skill.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Posts Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="mb-16"
            role="region"
            aria-label="Latest Blog Posts"
          >
            <h2 className="text-3xl font-bold font-mono mb-8 text-center">
              <Terminal className="inline-block w-8 h-8 mr-3" aria-hidden="true" />
              <Link href="/blog" className="hover:text-white transition-colors">Latest writeups</Link>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.slice(0, 3).map((post, index) => (
                <motion.article
                  key={post.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.5 + index * 0.2, duration: 0.6 }}
                  className="bg-gray-900/50 border border-cyber-green/20 rounded-lg p-6 hover:border-cyber-green/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyber-green/10"
                >
                  <time className="text-cyber-green text-sm font-mono mb-2 block" dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </time>
                  <Link href={`/blog/${post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}>
                    <h3 className="text-white font-mono font-semibold mb-3 line-clamp-2 hover:text-cyber-green transition-colors cursor-pointer">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-400 text-sm font-mono line-clamp-3">{post.excerpt}</p>
                  <Link href={`/blog/${post.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`} className="inline-block mt-4 text-cyber-green hover:text-white transition-colors font-mono text-sm">
                    Read more →
                  </Link>
                </motion.article>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link 
                href="/blog" 
                className="inline-flex items-center gap-2 bg-cyber-green/10 border border-cyber-green/20 text-cyber-green font-mono px-6 py-3 rounded-lg hover:bg-cyber-green/20 transition-colors"
              >
                View All Posts →
              </Link>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3, duration: 0.8 }}
            className="text-center"
            role="region"
            aria-label="Social Links"
          >
            <div className="flex justify-center space-x-6">
              <a
                href="https://github.com/mindPatch"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyber-green transition-colors"
                aria-label="GitHub Profile"
              >
                <Github className="w-6 h-6" aria-hidden="true" />
              </a>
              <a
                href="https://www.linkedin.com/in/knassar702"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyber-green transition-colors"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-6 h-6" aria-hidden="true" />
              </a>
              <a
                href="mailto:hello@mindpatch.net"
                className="text-gray-400 hover:text-cyber-green transition-colors"
                aria-label="Email Contact"
              >
                <Mail className="w-6 h-6" aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyber-green/20 py-8 px-4" role="contentinfo">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 font-mono">
            <span className="text-white">MindPatch</span> © 2025
          </p>
        </div>
      </footer>
    </main>
  )
} 