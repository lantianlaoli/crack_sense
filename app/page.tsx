import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import ExamplesPreview from '@/components/ExamplesPreview'
import Pricing from '@/components/Pricing'
import Footer from '@/components/Footer'
import StructuredData from '@/components/StructuredData'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <StructuredData 
        type="website" 
        data={{
          name: 'CrackSense - AI-Powered Crack Analysis',
          alternateName: 'CrackSense',
          url: 'https://www.cracksense.online',
          description: 'Professional AI-powered crack analysis service for building inspection. Upload photos, get instant expert analysis, and receive repair recommendations.',
          inLanguage: 'en-US',
          isAccessibleForFree: false,
          keywords: 'crack analysis, building inspection, structural assessment, AI analysis, crack detection'
        }}
      />
      <StructuredData 
        type="organization" 
        data={{}}
      />
      <StructuredData 
        type="service" 
        data={{
          serviceOutput: 'Detailed crack analysis report',
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: '5',
            description: 'Basic crack analysis starting from $5'
          }
        }}
      />
      <Navigation />
      <Hero />
      <ExamplesPreview />
      <Pricing />
      <Footer />
    </main>
  )
}