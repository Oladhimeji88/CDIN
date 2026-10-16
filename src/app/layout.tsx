import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar'

export const metadata: Metadata = {
  title: 'CDIN · Civic Integrity Voting',
  description:
    'A citizen-owned cryptographic verification layer for transparent, tamper-proof elections.',
  manifest: '/manifest.webmanifest',
  applicationName: 'CDIN Vote',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CDIN Vote',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/cdin-icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#062018',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  )
}
