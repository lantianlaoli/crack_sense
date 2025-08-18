import Navigation from '@/components/Navigation'
import ExamplesContent from '@/components/ExamplesContent'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'

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
      <Navigation />
      <ExamplesContent cracks={cracks} />
      <Footer />
    </div>
  )
}