import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import ExamplesPreview from '@/components/ExamplesPreview'
import Pricing from '@/components/Pricing'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <ExamplesPreview />
      <Pricing />
      <Footer />
    </main>
  )
}