'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Grid, ArrowRight, Loader2 } from 'lucide-react'
import ExampleCard from './ExampleCard'

interface ExampleData {
  id: string
  title: string
  description: string
  severity: 'low' | 'moderate' | 'high'
  crack_type: string
  image_url: string
  analysis_summary: string
  created_at: string
}

export default function ExamplesSection() {
  const [selectedExample, setSelectedExample] = useState<ExampleData | null>(null)
  const [featuredExamples, setFeaturedExamples] = useState<ExampleData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExamples = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/examples')
        
        if (!response.ok) {
          throw new Error('Failed to fetch examples')
        }
        
        const data = await response.json()
        setFeaturedExamples(data.examples || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching examples:', err)
        setError('Failed to load examples')
        // Fallback to empty array if fetch fails
        setFeaturedExamples([])
      } finally {
        setLoading(false)
      }
    }

    fetchExamples()
  }, [])

  const handleViewDetails = (example: ExampleData) => {
    setSelectedExample(example)
  }

  const handleCloseModal = () => {
    setSelectedExample(null)
  }

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Grid className="w-4 h-4" />
            Featured Analysis Examples
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Real Crack Analysis Cases
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how our AI analyzes different types of cracks with detailed assessments and professional recommendations
          </p>
        </div>

        {/* Example Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-gray-900 hover:text-gray-700 underline"
              >
                Try again
              </button>
            </div>
          ) : featuredExamples.length === 0 ? (
            // No data state
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No examples available at the moment.</p>
            </div>
          ) : (
            // Actual data
            featuredExamples.map((example) => (
              <ExampleCard 
                key={example.id} 
                example={example} 
                onViewDetails={handleViewDetails}
              />
            ))
          )}
        </div>

        {/* View All CTA */}
        <div className="text-center">
          <Link
            href="/example"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            View All Example
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Modal for example details */}
      {selectedExample && (
        <div 
          className="fixed inset-0 bg-gray-50/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white/95 backdrop-blur-md rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedExample.title}</h2>
                  <p className="text-gray-600">{selectedExample.crack_type}</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700">{selectedExample.description}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">AI Analysis Summary</h3>
                  <p className="text-gray-700">{selectedExample.analysis_summary}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Severity Level</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                    selectedExample.severity === 'high' 
                      ? 'text-red-600 bg-red-50 border-red-200'
                      : selectedExample.severity === 'moderate'
                      ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
                      : 'text-green-600 bg-green-50 border-green-200'
                  }`}>
                    {selectedExample.severity} Risk
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Analyze Your Crack
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}