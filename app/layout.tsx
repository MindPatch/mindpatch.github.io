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
  title: 'MindPatch - Cybersecurity Engineer',
  description: 'Offensive security specialist focusing on penetration testing, bug hunting, and security automation. Vulnerability research and security insights.',
  keywords: ['cybersecurity', 'penetration testing', 'bug bounty', 'security research', 'vulnerability assessment'],
  authors: [{ name: 'MindPatch' }],
  creator: 'MindPatch',
  publisher: 'MindPatch',
  openGraph: {
    title: 'MindPatch - Cybersecurity Engineer',
    description: 'Offensive security specialist focusing on penetration testing, bug hunting, and security automation.',
    url: 'https://mindpatch.net',
    siteName: 'MindPatch',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MindPatch - Cybersecurity Engineer',
    description: 'Offensive security specialist focusing on penetration testing, bug hunting, and security automation.',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${jetbrainsMono.variable} bg-black text-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
} 