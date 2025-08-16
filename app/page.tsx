import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import Pricing from '@/components/Pricing'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <Pricing />
    </main>
  )
}