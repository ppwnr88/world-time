import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://world-time-app.vercel.app'),
  title: 'World Time — Current Time Around the World',
  description:
    'Track the current time in any city worldwide. Free world clock with live updates, timezone converter, multiple city comparison, analog & digital display.',
  keywords: [
    'world time', 'current time', 'world clock', 'timezone', 'city time',
    'time zone converter', 'international time', 'global clock',
  ],
  authors: [{ name: 'World Time App' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'World Time — Current Time Around the World',
    description: 'Track the current time in any city worldwide with live updates.',
    siteName: 'World Time',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'World Time — Global Clock',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'World Time — Current Time Around the World',
    description: 'Track the current time in any city worldwide with live updates.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#030712' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* Prevent flash of unstyled content for dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme');
                var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (t === 'dark' || (!t && d)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9540032299322636"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
