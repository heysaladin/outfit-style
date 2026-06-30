import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Outfit Style',
  description: 'Your smart wardrobe planner',
  applicationName: 'Outfit Style',
  appleWebApp: {
    capable: true,
    title: 'Outfit Style',
    statusBarStyle: 'black-translucent',
    startupImage: [
      // iPhone 15 Pro Max / 14 Pro Max
      { url: '/startup-image?w=1290&h=2796', media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 15 Pro / 15 / 14 Pro
      { url: '/startup-image?w=1179&h=2556', media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 15 Plus / 14 Plus / 13 Pro Max / 12 Pro Max
      { url: '/startup-image?w=1284&h=2778', media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 14 / 13 Pro / 13 / 12 Pro / 12
      { url: '/startup-image?w=1170&h=2532', media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 13 mini / 12 mini
      { url: '/startup-image?w=1080&h=2340', media: '(device-width: 360px) and (device-height: 780px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 11 Pro Max / XS Max
      { url: '/startup-image?w=1242&h=2688', media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 11 / XR
      { url: '/startup-image?w=828&h=1792', media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)' },
      // iPhone 11 Pro / XS / X
      { url: '/startup-image?w=1125&h=2436', media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 8 Plus
      { url: '/startup-image?w=1242&h=2208', media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)' },
      // iPhone 8 / SE 3rd gen
      { url: '/startup-image?w=750&h=1334', media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)' },
      // iPhone SE 2nd gen
      { url: '/startup-image?w=640&h=1136', media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)' },
    ],
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0e1420' },
    { media: '(prefers-color-scheme: light)', color: '#fcfcfd' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
