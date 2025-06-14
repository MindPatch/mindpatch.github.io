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
  return (
    <main className="min-h-screen bg-black text-cyber-green relative overflow-hidden">
      <MatrixRain />
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-sm border-b border-cyber-green/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-mono text-xl font-bold"
          >
            mindpatch@home:~$
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex space-x-6 font-mono"
          >
            <Link href="/" className="hover:text-white transition-colors">home</Link>
            <Link href="/about" className="hover:text-white transition-colors">about</Link>
            <Link href="/blog" className="hover:text-white transition-colors">blog</Link>
            <Link href="/contact" className="hover:text-white transition-colors">contact</Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
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
              Specializing in offensive security, vulnerability research, and security automation.
              Breaking systems to make them stronger.
            </motion.p>
          </motion.div>

          {/* Skills Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {[
              { icon: Shield, title: 'Penetration Testing', desc: 'Web, mobile, and network security assessment' },
              { icon: Bug, title: 'CTF Competitions', desc: 'Solving security challenges and writeups' },
              { icon: Code, title: 'Security Automation', desc: 'Advanced tools and projects' },
              { icon: Zap, title: 'Vulnerability Research', desc: 'Finding and analyzing security flaws' },
            ].map((skill, index) => (
              <motion.div
                key={skill.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + index * 0.2, duration: 0.6 }}
                className="bg-gray-900/50 border border-cyber-green/20 rounded-lg p-6 hover:border-cyber-green/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyber-green/10"
              >
                <skill.icon className="w-8 h-8 text-cyber-green mb-4" />
                <h3 className="text-white font-mono font-semibold mb-2">{skill.title}</h3>
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
          >
            <h2 className="text-3xl font-bold font-mono mb-8 text-center">
              <Terminal className="inline-block w-8 h-8 mr-3" />
              Latest writeups
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post, index) => (
                <motion.article
                  key={post.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.5 + index * 0.2, duration: 0.6 }}
                  className="bg-gray-900/50 border border-cyber-green/20 rounded-lg p-6 hover:border-cyber-green/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyber-green/10"
                >
                  <div className="text-cyber-green text-sm font-mono mb-2">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
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
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3, duration: 0.8 }}
            className="text-center"
          >
            <div className="flex justify-center space-x-6">
              <a
                href="https://github.com/mindPatch"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyber-green transition-colors"
              >
                <Github className="w-6 h-6" />
              </a>
              <a
                href="https://www.linkedin.com/in/knassar702"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyber-green transition-colors"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a
                href="mailto:knassar702@gmail.com"
                className="text-gray-400 hover:text-cyber-green transition-colors"
              >
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

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