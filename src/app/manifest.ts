import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CDIN — Civic Integrity Blockchain Voting',
    short_name: 'CDIN Vote',
    description:
      'A citizen-owned cryptographic verification layer that ensures every vote can be independently verified.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#062018',
    theme_color: '#062018',
    categories: ['government', 'productivity', 'utilities'],
    icons: [
      { src: '/cdin-icon.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
      { src: '/cdin-icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
      { src: '/cdin-icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  }
}
