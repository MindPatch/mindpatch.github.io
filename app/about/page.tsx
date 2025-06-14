'use client'

import { motion } from 'framer-motion'
import { Shield, Code, Bug, Award, Users, Globe } from 'lucide-react'
import Link from 'next/link'

const skills = [
  { name: 'Web Application Security', level: 95 },
  { name: 'Programming (Rust, Python, Node.js)', level: 90 },
  { name: 'Security Tools & Automation', level: 85 },
  { name: 'Vulnerability Assessment', level: 80 },
  { name: 'CTF Competitions', level: 90 },
  { name: 'Network Security Fundamentals', level: 75 },
  { name: 'Security Research', level: 80 },
]

export default function AboutPage() {
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
            <Link href="/about" className="text-white">about</Link>
            <Link href="/blog" className="hover:text-white transition-colors">blog</Link>
            <Link href="/contact" className="hover:text-white transition-colors">contact</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold font-mono mb-6">
              <span className="text-white">About</span>{' '}
              <span className="text-cyber-green animate-glow">MindPatch</span>
            </h1>
            <p className="text-gray-400 text-xl font-mono max-w-2xl mx-auto leading-relaxed">
              Offensive security professional specializing in penetration testing, bug hunting, and security automation.
            </p>
          </motion.div>

          {/* Bio Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <div className="bg-gray-900/50 border border-cyber-green/20 rounded-lg p-8">
              <h2 className="text-2xl font-bold font-mono text-white mb-6 flex items-center gap-3">
                <Shield className="w-6 h-6 text-cyber-green" />
                Professional Background
              </h2>
              <div className="space-y-4 text-gray-300 font-mono leading-relaxed">
                <p>
                  I work in offensive security, focusing on penetration testing, bug hunting, and security automation. 
                  My experience includes assessing web, mobile, and network security, as well as developing tools to 
                  improve security workflows.
                </p>
                <p>
                  I enjoy building and automating security solutions, researching vulnerabilities, and sharing what I learn. 
                  This blog is a space to document security insights, techniques, and projects that might be useful 
                  to others in the field.
                </p>
                <p>
                  Feel free to explore and reach out on LinkedIn.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Skills Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold font-mono text-white mb-8 flex items-center gap-3">
              <Code className="w-6 h-6 text-cyber-green" />
              Technical Skills
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-gray-900/50 border border-cyber-green/20 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-white">{skill.name}</span>
                    <span className="font-mono text-cyber-green text-sm">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                      className="bg-cyber-green h-2 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Contact CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="bg-gray-900/50 border border-cyber-green/20 rounded-lg p-8">
              <h2 className="text-2xl font-bold font-mono text-white mb-4">
                Let&apos;s Connect
              </h2>
              <p className="text-gray-400 font-mono mb-6">
                Interested in collaboration, security consulting, or just want to chat about cybersecurity?
              </p>
              <Link
                href="/contact"
                className="inline-block bg-cyber-green text-black font-mono font-bold px-6 py-3 rounded-lg hover:bg-white transition-colors"
              >
                Get In Touch
              </Link>
            </div>
          </motion.section>
        </div>
      </div>

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