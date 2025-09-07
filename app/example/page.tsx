'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Grid } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ExampleCard from '@/components/ExampleCard'

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

export default function ExamplesPage() {
  const [examples, setExamples] = useState<ExampleData[]>([])
  const [filteredExamples, setFilteredExamples] = useState<ExampleData[]>([])
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'moderate' | 'low'>('all')
  const [selectedExample, setSelectedExample] = useState<ExampleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch examples data on component mount
  useEffect(() => {
    const fetchExamples = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/examples')
        
        if (!response.ok) {
          throw new Error('Failed to fetch examples')
        }
        
        const data = await response.json()
        setExamples(data.examples || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching examples:', err)
        setError('Failed to load examples')
        setExamples([])
      } finally {
        setLoading(false)
      }
    }

    fetchExamples()
  }, [])

  // Filter examples based on severity
  useEffect(() => {
    let filtered = examples

    // Apply severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(example => example.severity === severityFilter)
    }

    setFilteredExamples(filtered)
  }, [examples, severityFilter])

  const handleViewDetails = (example: any) => {
    setSelectedExample(example)
  }

  const handleCloseModal = () => {
    setSelectedExample(null)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Grid className="w-4 h-4" />
            Analysis Examples
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Real Crack Analysis Cases
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explore detailed examples of our AI-powered crack analysis with professional assessments and recommendations
          </p>

          {/* Filter Tabs */}
          <div className="flex justify-center">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
              {[
                { key: 'all', label: 'All Cases', count: examples.length },
                { key: 'high', label: 'High Risk', count: examples.filter(e => e.severity === 'high').length },
                { key: 'moderate', label: 'Moderate Risk', count: examples.filter(e => e.severity === 'moderate').length },
                { key: 'low', label: 'Low Risk', count: examples.filter(e => e.severity === 'low').length }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setSeverityFilter(key as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    severityFilter === key
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Examples Grid */}
        {loading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div></div>
        ) : filteredExamples.length === 0 ? (
          <div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExamples.map((example) => (
              <ExampleCard 
                key={example.id} 
                example={example} 
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>


      {/* Modal for example details */}
      {selectedExample && (
        <div 
          className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white/95 backdrop-blur-md rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedExample.title}</h2>
                  <p className="text-lg text-gray-600">{selectedExample.crack_type}</p>
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
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedExample.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Analysis Summary</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedExample.analysis_summary}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Crack Type</h3>
                    <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedExample.crack_type}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Risk Level</h3>
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
              </div>

              {/* Modal Footer */}
              <div className="mt-12 pt-8 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Analyze Your Crack
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}