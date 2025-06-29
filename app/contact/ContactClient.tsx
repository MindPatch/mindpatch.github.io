'use client'

import { motion } from 'framer-motion'
import { Mail, Github, Linkedin, MessageSquare, Send } from 'lucide-react'
import Link from 'next/link'

export default function ContactClient() {
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
            <Link href="/contact" className="text-white">contact</Link>
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
              <span className="text-white">Get In</span>{' '}
              <span className="text-cyber-green animate-glow">Touch</span>
            </h1>
            <p className="text-gray-400 text-xl font-mono max-w-2xl mx-auto leading-relaxed">
              Ready to collaborate on security projects or discuss vulnerabilities? Let&apos;s connect!
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              {/* Direct Contact */}
              <div className="bg-gray-900/50 border border-cyber-green/20 rounded-lg p-8">
                <h2 className="text-2xl font-bold font-mono text-white mb-6 flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-cyber-green" />
                  Direct Contact
                </h2>
                <div className="space-y-4">
                  <a
                    href="mailto:hello@mindpatch.net"
                    className="flex items-center gap-3 text-gray-300 hover:text-cyber-green transition-colors font-mono text-lg"
                  >
                    <Mail className="w-5 h-5" />
                    hello@mindpatch.net
                  </a>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-gray-900/50 border border-cyber-green/20 rounded-lg p-8">
                <h2 className="text-2xl font-bold font-mono text-white mb-6">
                  Connect Online
                </h2>
                <div className="space-y-4">
                  <a
                    href="https://github.com/mindPatch"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-400 hover:text-cyber-green transition-colors font-mono"
                  >
                    <Github className="w-5 h-5" />
                    GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/in/knassar702"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-400 hover:text-cyber-green transition-colors font-mono"
                  >
                    <Linkedin className="w-5 h-5" />
                    LinkedIn
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Availability & Services */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              {/* Availability */}
              <div className="bg-gray-900/50 border border-cyber-green/20 rounded-lg p-8">
                <h2 className="text-2xl font-bold font-mono text-white mb-6">
                  Available For
                </h2>
                <div className="space-y-3 text-gray-300 font-mono">
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyber-green rounded-full"></span>
                    Security consulting projects
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyber-green rounded-full"></span>
                    Penetration testing engagements
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyber-green rounded-full"></span>
                    Vulnerability research collaboration
                  </p>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-gray-900/50 border border-cyber-green/20 rounded-lg p-8">
                <h2 className="text-2xl font-bold font-mono text-white mb-6">
                  Response Time
                </h2>
                <div className="space-y-3 text-gray-300 font-mono">
                  <p>• General inquiries: 24-48 hours</p>
                  <p>• Security consultations: 1-2 business days</p>
                  <p>• Urgent security matters: Same day</p>
                </div>
              </div>
            </motion.div>
          </div>
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
    </main>
  )
} 