import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { UserInitializer } from '@/components/UserInitializer'
import AdminButton from '@/components/AdminButton'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.cracksense.online'),
  title: {
    default: 'CrackSense - AI-Powered Crack Analysis for Buildings & Structures',
    template: '%s | CrackSense'
  },
  description: 'Professional AI-powered crack analysis service for building inspection. Upload photos, get instant expert analysis, and receive repair recommendations. Trusted by engineers and property owners.',
  keywords: ['crack analysis', 'building inspection', 'structural assessment', 'AI analysis', 'crack detection', 'property inspection', 'structural engineering', 'building safety'],
  authors: [{ name: 'CrackSense Team' }],
  creator: 'CrackSense',
  publisher: 'CrackSense',
  category: 'Construction & Engineering',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.cracksense.online',
    siteName: 'CrackSense',
    title: 'CrackSense - AI-Powered Crack Analysis for Buildings & Structures',
    description: 'Professional AI-powered crack analysis service for building inspection. Upload photos, get instant expert analysis, and receive repair recommendations.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CrackSense - AI-Powered Crack Analysis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CrackSense - AI-Powered Crack Analysis',
    description: 'Professional AI-powered crack analysis service for building inspection. Get instant expert analysis and repair recommendations.',
    images: ['/twitter-image.jpg'],
    creator: '@cracksense',
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
    google: 'N9NbVNRoubthe37dOw_61l7v-aVfz5rgfLpez_e03xs',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <GoogleAnalytics trackingId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ''} />
          <UserInitializer />
          <AdminButton />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}