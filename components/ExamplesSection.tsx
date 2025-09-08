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
  crack_width?: string
  crack_length?: string
  image_url: string
  analysis_summary: string
  crack_cause: string
  repair_steps: string[]
  created_at: string
}

// Helper function to format crack cause analysis
const formatCrackCause = (crackCause: string) => {
  if (!crackCause) return []
  
  // Split by numbered sections with headers (like "1) VISUAL ASSESSMENT:")
  const sectionRegex = /(\d+\)\s+[A-Z\s]+:)/g
  const parts = crackCause.split(sectionRegex).filter(part => part.trim())
  
  const formattedSections = []
  for (let i = 0; i < parts.length; i += 2) {
    if (parts[i] && parts[i + 1]) {
      const header = parts[i].trim()
      const content = parts[i + 1].trim()
      formattedSections.push({
        header,
        content
      })
    }
  }
  
  return formattedSections.length > 0 ? formattedSections : [{ 
    header: '', 
    content: crackCause.trim() 
  }]
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

      {/* Modal for example details - Simplified Report */}
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
    </section>
  )
}