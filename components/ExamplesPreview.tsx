import Link from 'next/link'
import ExampleCard from '@/components/ExampleCard'
import { supabase } from '@/lib/supabase'

async function getPreviewExamples() {
  const { data: cracks, error } = await supabase
    .from('cracks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3)

  if (error) {
    console.error('Error fetching preview cracks:', error)
    return []
  }

  return cracks || []
}

export default async function ExamplesPreview() {
  const cracks = await getPreviewExamples()

  return (
    <div className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Examples
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            See how our AI analyzes real wall cracks from different homes. Each case shows detailed risk assessment and repair recommendations from our expert system.
          </p>
        </div>

        {/* Examples Grid */}
        {cracks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {cracks.map((crack) => (
              <ExampleCard key={crack.id} crack={crack} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">
              Example cases coming soon. Check back for real crack analysis examples.
            </p>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/examples"
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors group"
          >
            View All Examples
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}