import { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact MindPatch - Get In Touch for Security Projects',
  description: 'Contact MindPatch for cybersecurity consulting, penetration testing, vulnerability research collaboration, and security automation projects.',
  keywords: ['contact mindpatch', 'cybersecurity consulting', 'penetration testing services', 'security collaboration', 'vulnerability research'],
  authors: [{ name: 'MindPatch' }],
  creator: 'MindPatch',
  publisher: 'MindPatch',
  openGraph: {
    title: 'Contact MindPatch - Security Consulting & Collaboration',
    description: 'Get in touch for cybersecurity consulting, penetration testing, and security automation projects.',
    url: 'https://mindpatch.net/contact',
    siteName: 'MindPatch',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact MindPatch - Security Consulting',
    description: 'Get in touch for cybersecurity consulting, penetration testing, and security automation projects.',
    creator: '@mindpatch',
  },
  alternates: {
    canonical: 'https://mindpatch.net/contact',
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

export default function ContactPage() {
  return <ContactClient />
} 