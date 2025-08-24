import { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import ExamplesContent from '@/components/ExamplesContent'
import Footer from '@/components/Footer'
import StructuredData from '@/components/StructuredData'
import { supabase } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'Crack Analysis Examples - Real Case Studies & Results',
  description: 'See real crack analysis examples and AI assessment results. Browse professional case studies showing how CrackSense identifies different types of cracks in buildings and structures.',
  keywords: ['crack analysis examples', 'case studies', 'crack detection results', 'building inspection examples', 'structural assessment samples', 'crack types'],
  openGraph: {
    title: 'Crack Analysis Examples - Real Case Studies',
    description: 'Browse real crack analysis examples and see how AI identifies different types of structural cracks.',
    type: 'website',
    images: [
      {
        url: '/examples-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CrackSense Examples - Real Crack Analysis Case Studies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crack Analysis Examples - Real Case Studies',
    description: 'Browse real crack analysis examples and see how AI identifies different types of structural cracks.',
    images: ['/examples-twitter-image.jpg'],
  },
}

async function getCrackExamples() {
  const { data: cracks, error } = await supabase
    .from('cracks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching cracks:', error)
    return []
  }

  return cracks || []
}

export default async function ExamplesPage() {
  const cracks = await getCrackExamples()

  return (
    <div className="min-h-screen bg-white">
      <StructuredData 
        type="website" 
        data={{
          '@type': 'CollectionPage',
          name: 'Crack Analysis Examples',
          description: 'Real crack analysis examples and case studies showing AI-powered structural assessment',
          url: 'https://www.cracksense.online/examples',
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: cracks.map((crack, index) => ({
              '@type': 'CreativeWork',
              position: index + 1,
              name: `Crack Analysis Case Study ${index + 1}`,
              description: crack.analysis || 'Professional crack analysis result',
              url: `https://www.cracksense.online/examples#case-${crack.id}`,
              author: {
                '@type': 'Organization',
                name: 'CrackSense'
              }
            }))
          }
        }}
      />
      <Navigation />
      <ExamplesContent cracks={cracks} />
      <Footer />
    </div>
  )
}