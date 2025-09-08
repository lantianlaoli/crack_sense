import { Metadata } from 'next'
import ExamplesClient from '@/components/ExamplesClient'

export const metadata: Metadata = {
  title: 'Real Crack Analysis Examples | CrackSense',
  description: 'Explore detailed examples of our AI-powered crack analysis with professional assessments and recommendations. See real cases analyzed by our expert system.',
  keywords: ['crack analysis examples', 'building inspection cases', 'structural assessment samples', 'crack detection results', 'AI analysis examples', 'crack severity assessment'],
  openGraph: {
    title: 'Real Crack Analysis Examples | CrackSense',
    description: 'Explore detailed examples of AI-powered crack analysis with professional assessments.',
    type: 'website',
    url: 'https://www.cracksense.online/example',
    images: [
      {
        url: '/og-examples.jpg',
        width: 1200,
        height: 630,
        alt: 'CrackSense Analysis Examples',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Real Crack Analysis Examples | CrackSense',
    description: 'Explore detailed examples of AI-powered crack analysis with professional assessments.',
    images: ['/twitter-examples.jpg'],
  },
  alternates: {
    canonical: 'https://www.cracksense.online/example',
  },
}

export default function ExamplesPage() {
  return <ExamplesClient />
}