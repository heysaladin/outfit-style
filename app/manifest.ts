import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Interestory',
    short_name: 'Interestory',
    description: 'Log what you\'re into. Build the story of your interests over time.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0A0A0A',
    theme_color: '#0A0A0A',
    categories: ['lifestyle', 'utilities'],
    icons: [
      { src: '/icon/192', sizes: '192x192', type: 'image/png' },
      { src: '/icon/512', sizes: '512x512', type: 'image/png' },
      { src: '/icon/512-maskable', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
