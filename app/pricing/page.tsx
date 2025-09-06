import { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Pricing from '@/components/Pricing'
import Footer from '@/components/Footer'
import StructuredData from '@/components/StructuredData'

export const metadata: Metadata = {
  title: 'Pricing - CrackSense',
  description: 'Choose the perfect plan for your crack analysis needs. Starter plan at $29.9 with 250 credits, Pro plan at $59.9 with 600 credits. No hidden fees.',
  keywords: ['pricing', 'crack analysis pricing', 'AI analysis cost', 'building inspection pricing', 'structural assessment cost'],
  openGraph: {
    title: 'Pricing - CrackSense',
    description: 'Choose the perfect plan for your crack analysis needs. Starter plan at $29.9 with 250 credits, Pro plan at $59.9 with 600 credits.',
    url: 'https://www.cracksense.online/pricing',
  },
  twitter: {
    title: 'Pricing - CrackSense',
    description: 'Choose the perfect plan for your crack analysis needs. Starter plan at $29.9 with 250 credits, Pro plan at $59.9 with 600 credits.',
  },
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <StructuredData 
        type="website" 
        data={{
          name: 'CrackSense Pricing',
          url: 'https://www.cracksense.online/pricing',
          description: 'Choose the perfect plan for your crack analysis needs. Starter plan at $29.9 with 250 credits, Pro plan at $59.9 with 600 credits.',
          inLanguage: 'en-US',
        }}
      />
      <StructuredData 
        type="service" 
        data={{
          serviceOutput: 'Detailed crack analysis report',
          offers: [
            {
              '@type': 'Offer',
              priceCurrency: 'USD',
              price: '29.9',
              description: 'Starter plan with 250 credits'
            },
            {
              '@type': 'Offer',
              priceCurrency: 'USD',
              price: '59.9',
              description: 'Pro plan with 600 credits'
            }
          ]
        }}
      />
      <Navigation />
      <div className="pt-20">
        <Pricing />
      </div>
      <Footer />
    </main>
  )
}
