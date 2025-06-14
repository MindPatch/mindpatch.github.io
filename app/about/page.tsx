import { Metadata } from 'next'
import { motion } from 'framer-motion'
import { Shield, Code, Bug, Zap, Award, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About MindPatch - Cybersecurity Engineer & Penetration Tester',
  description: 'Learn about MindPatch, an offensive security professional specializing in penetration testing, bug hunting, and security automation. Discover skills, experience, and expertise.',
  keywords: ['about mindpatch', 'cybersecurity engineer', 'penetration tester', 'bug hunter', 'security professional', 'offensive security'],
  authors: [{ name: 'MindPatch' }],
  creator: 'MindPatch',
  publisher: 'MindPatch',
  openGraph: {
    title: 'About MindPatch - Cybersecurity Engineer',
    description: 'Offensive security professional specializing in penetration testing, bug hunting, and security automation.',
    url: 'https://www.mindpatch.net/about',
    siteName: 'MindPatch',
    locale: 'en_US',
    type: 'profile',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About MindPatch - Cybersecurity Engineer',
    description: 'Offensive security professional specializing in penetration testing, bug hunting, and security automation.',
    creator: '@mindpatch',
  },
  alternates: {
    canonical: 'https://www.mindpatch.net/about',
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

import AboutClient from './AboutClient'

export default function AboutPage() {
  // JSON-LD structured data for person/professional
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'MindPatch',
    jobTitle: 'Cybersecurity Engineer',
    description: 'Offensive security professional specializing in penetration testing, bug hunting, and security automation.',
    url: 'https://www.mindpatch.net',
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
      skills: [
        'Penetration Testing',
        'Vulnerability Assessment',
        'Security Research',
        'Bug Bounty Hunting',
        'CTF Competitions',
        'Security Automation',
      ],
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'knassar702@gmail.com',
      contactType: 'professional',
    },
  }

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient />
    </>
  )
} 