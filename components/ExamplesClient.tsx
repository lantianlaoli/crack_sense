'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Grid } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ExampleCard from '@/components/ExampleCard'
import { formatCrackCause } from '@/lib/format-crack-cause'

interface ExampleData {
  id: string
  title: string
  description: string
  severity: 'low' | 'moderate' | 'high'
  crack_type: string
  image_url: string
  analysis_summary: string
  created_at: string
  crack_cause: string
  repair_steps: string[]
}

export default function ExamplesClient() {
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

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Crack Analysis Examples',
    description: 'Real examples of AI-powered crack analysis with professional assessments',
    url: 'https://www.cracksense.online/example',
    numberOfItems: examples.length,
    itemListElement: examples.map((example, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: example.title,
        description: example.description,
        about: {
          '@type': 'Thing',
          name: example.crack_type,
        },
        image: example.image_url,
        dateCreated: example.created_at,
      },
    })),
  }

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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


      {/* Modal for example details - Match landing page style */}
      {selectedExample && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-lg max-w-6xl w-full h-[85vh] overflow-hidden shadow-2xl border border-gray-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full p-1 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left Right Split Layout */}
            <div className="flex flex-col lg:flex-row h-full">
              {/* Left Side - Root Cause Analysis */}
              <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-gray-200">
                <div className="p-6 h-full flex flex-col">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex-shrink-0">
                    Root Cause Analysis
                  </h2>
                  <div className="flex-1 overflow-y-auto pr-2">
                    {selectedExample.crack_cause ? (
                      <div className="space-y-4">
                        {formatCrackCause(selectedExample.crack_cause).map((section, index) => (
                          <div key={index} className="space-y-2">
                            {section.header && (
                              <h3 className="text-sm font-semibold text-gray-900 bg-gray-50 px-3 py-2 rounded">
                                {section.header}
                              </h3>
                            )}
                            <div className="prose prose-sm max-w-none">
                              <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                                {section.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 leading-relaxed text-sm">
                          {selectedExample.analysis_summary}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side - Repair Recommendations */}
              <div className="w-full lg:w-1/2">
                <div className="p-6 h-full flex flex-col">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 flex-shrink-0">
                    Repair Recommendations
                  </h2>
                  <div className="flex-1 overflow-y-auto pr-2">
                    {selectedExample.repair_steps && selectedExample.repair_steps.length > 0 ? (
                      <div className="space-y-3">
                        {selectedExample.repair_steps.map((step, index) => (
                          <div key={index} className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center mt-0.5 font-medium">
                                {index + 1}
                              </span>
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                {step}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 italic">
                          No repair recommendations available for this analysis.
                          <br />
                          Debug info: repair_steps = {selectedExample.repair_steps ? `Array(${selectedExample.repair_steps.length})` : 'null'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}
