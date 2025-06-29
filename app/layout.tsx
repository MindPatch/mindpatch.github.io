import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import './prism-cyber-theme.css'

const inter = Inter({ subsets: ['latin'] })
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mindpatch.net'),
  title: {
    default: 'MindPatch - Cybersecurity Engineer & Penetration Tester',
    template: '%s | MindPatch'
  },
  description: 'MindPatch is an offensive security specialist focusing on penetration testing, bug hunting, vulnerability research, and security automation. Expert in CTF competitions and cybersecurity consulting.',
  keywords: [
    'cybersecurity', 
    'penetration testing', 
    'bug bounty', 
    'security research', 
    'vulnerability assessment',
    'ethical hacking',
    'security automation',
    'CTF competitions',
    'offensive security',
    'mindpatch'
  ],
  authors: [{ name: 'MindPatch', url: 'https://www.mindpatch.net' }],
  creator: 'MindPatch',
  publisher: 'MindPatch',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.mindpatch.net',
    siteName: 'MindPatch',
    title: 'MindPatch - Cybersecurity Engineer & Penetration Tester',
    description: 'Offensive security specialist focusing on penetration testing, bug hunting, and security automation. Expert cybersecurity consulting and vulnerability research.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MindPatch - Cybersecurity Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MindPatch - Cybersecurity Engineer',
    description: 'Offensive security specialist focusing on penetration testing, bug hunting, and security automation.',
    creator: '@mindpatch',
    images: ['/og-image.png'],
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: 'https://www.mindpatch.net',
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // JSON-LD structured data for organization
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MindPatch',
    url: 'https://www.mindpatch.net',
    logo: 'https://www.mindpatch.net/logo.png',
    description: 'Cybersecurity consulting and offensive security services',
    founder: {
      '@type': 'Person',
      name: 'MindPatch',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@mindpatch.net',
      contactType: 'customer service',
    },
    sameAs: [
      'https://github.com/mindPatch',
      'https://www.linkedin.com/in/knassar702',
    ],
    knowsAbout: [
      'Cybersecurity',
      'Penetration Testing',
      'Vulnerability Assessment',
      'Bug Bounty Hunting',
      'Security Automation',
    ],
  }

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MindPatch',
    url: 'https://www.mindpatch.net',
    description: 'Cybersecurity engineer specializing in penetration testing and security research',
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.mindpatch.net/blog?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <html lang="en" className="dark">
      <head>
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* Additional meta tags */}
        <meta name="theme-color" content="#00ff41" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} ${jetbrainsMono.variable} bg-black text-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
} 