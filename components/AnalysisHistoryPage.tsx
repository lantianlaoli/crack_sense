'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Eye,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Zap,
  Crown,
  Gauge
} from 'lucide-react'
import Image from 'next/image'


interface AnalysisRecord {
  id: string
  created_at: string
  updated_at: string
  image_urls: string[]
  user_description: string
  severity: 'low' | 'moderate' | 'high'
  crack_cause_category: string
  crack_type: string
  crack_severity: 'low' | 'moderate' | 'high'
  personalized_analysis: string
  structural_impact_assessment: string
  immediate_actions_required: string[]
  long_term_recommendations: string[]
  monitoring_requirements: string
  professional_consultation_needed: boolean
  model_used: string
  confidence_level: number
  user_question: string
}

interface AnalysisHistoryPageProps {
  onViewAnalysis?: (analysisId: string) => void
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'moderate':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'high':
      return <AlertTriangle className="w-4 h-4" />
    case 'moderate':
      return <Info className="w-4 h-4" />
    case 'low':
      return <CheckCircle className="w-4 h-4" />
    default:
      return <Info className="w-4 h-4" />
  }
}

const getModelIcon = (model: string) => {
  if (model.includes('claude')) return <Crown className="w-4 h-4" />
  if (model.includes('gemini-2.5')) return <Zap className="w-4 h-4" />
  return <Gauge className="w-4 h-4" />
}

const getModelName = (model: string) => {
  if (model.includes('claude')) return 'Claude 4'
  if (model.includes('gemini-2.5')) return 'Gemini 2.5'
  if (model.includes('gemini-2.0')) return 'Gemini 2.0'
  return model
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function AnalysisHistoryPage({ onViewAnalysis }: AnalysisHistoryPageProps) {
  const { user } = useUser()
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null)
  const [filter, setFilter] = useState<'all' | 'high' | 'moderate' | 'low'>('all')

  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchAnalyses = async () => {
      if (!user?.id) return
      
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch('/api/analyses')
        const data = await response.json()
        
        if (data.success) {
          setAnalyses(data.analyses)
        } else {
          setError('Failed to fetch analysis history')
        }
      } catch (err) {
        console.error('Error fetching analyses:', err)
        setError('Failed to fetch analysis history')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyses()
  }, [user?.id])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedAnalysis) {
        handleCloseModal()
      }
    }

    if (selectedAnalysis) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedAnalysis])

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesFilter = filter === 'all' || analysis.crack_severity === filter
    const matchesSearch = searchQuery === '' || 
      analysis.personalized_analysis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      analysis.crack_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      analysis.crack_cause_category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      analysis.user_description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const handleViewAnalysis = (analysis: AnalysisRecord) => {
    setSelectedAnalysis(analysis)
    onViewAnalysis?.(analysis.id)
  }

  const handleCloseModal = () => {
    setSelectedAnalysis(null)
  }



  if (loading) {
    return (
      <div className="bg-gray-50 p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis History</h1>
            <p className="text-gray-600">View your analysis records</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-gray-600">Loading your analysis history...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-50 p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis History</h1>
            <p className="text-gray-600">View your analysis records</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <h3 className="text-red-800 font-medium">Error Loading History</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis History</h1>
          <p className="text-gray-600">
            {analyses.length === 0 
              ? 'No analysis records found' 
              : `You have ${analyses.length} analysis record${analyses.length === 1 ? '' : 's'}${
                  filteredAnalyses.length !== analyses.length 
                    ? ` (${filteredAnalyses.length} shown)` 
                    : ''
                }`
            }
          </p>
        </div>

        {analyses.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Records</h3>
            <p className="text-gray-600 mb-6">
              You haven&apos;t performed any crack analyses yet. Start by uploading an image for analysis.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Start Analysis
            </button>
          </div>
        ) : (
          <>
            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search analyses by description, type, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-1 bg-white rounded-lg p-1 border border-gray-200 w-fit">
                {[
                  { key: 'all', label: 'All', count: analyses.length },
                  { key: 'high', label: 'High', count: analyses.filter(a => a.crack_severity === 'high').length },
                  { key: 'moderate', label: 'Moderate', count: analyses.filter(a => a.crack_severity === 'moderate').length },
                  { key: 'low', label: 'Low', count: analyses.filter(a => a.crack_severity === 'low').length }
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as any)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filter === key
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {label} ({count})
                  </button>
                ))}
              </div>
            </div>

            {/* Analysis Grid */}
            {filteredAnalyses.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery ? 
                    `No analyses match your search for "${searchQuery}"` :
                    `No analyses found with ${filter} severity level`
                  }
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setFilter('all')
                  }}
                  className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewAnalysis(analysis)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityColor(analysis.crack_severity)}`}>
                        {getSeverityIcon(analysis.crack_severity)}
                        <span className="ml-1 capitalize">{analysis.crack_severity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  {analysis.image_urls && analysis.image_urls.length > 0 && (
                    <div className="mb-4">
                      <div className="grid grid-cols-1 gap-2">
                        {analysis.image_urls.slice(0, 1).map((url, index) => (
                          <div key={index} className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={url}
                              alt={`Analysis image ${index + 1}`}
                              fill
                              className="object-cover w-full h-full"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                        ))}
                        {analysis.image_urls.length > 1 && (
                          <div className="flex items-center justify-center text-sm text-gray-500 bg-gray-50 rounded-lg py-2">
                            <span>+{analysis.image_urls.length - 1} more image{analysis.image_urls.length > 2 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Analysis Summary */}
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {analysis.crack_type ? `${analysis.crack_type} crack` : 'Crack Analysis'}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {analysis.personalized_analysis || analysis.user_description || 'No description available'}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(analysis.created_at)}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="w-full flex items-center justify-center text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Analysis Detail Modal */}
        {selectedAnalysis && (
          <div 
            className="fixed inset-0 bg-gray-50/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={handleCloseModal}
          >
            <div 
              className="bg-white/95 backdrop-blur-md rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Analysis Details</h2>
                    <p className="text-gray-600">{formatDate(selectedAnalysis.created_at)}</p>
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

                {/* Analysis Overview */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Images */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Images</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedAnalysis.image_urls.map((url, index) => (
                        <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={url}
                            alt={`Analysis image ${index + 1}`}
                            fill
                            className="object-cover w-full h-full"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Analysis Summary */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Analysis Summary</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Severity:</span>
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityColor(selectedAnalysis.crack_severity)}`}>
                          {getSeverityIcon(selectedAnalysis.crack_severity)}
                          <span className="ml-1 capitalize">{selectedAnalysis.crack_severity}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {selectedAnalysis.crack_type || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Category:</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {selectedAnalysis.crack_cause_category || 'Other'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div className="space-y-6">
                  {selectedAnalysis.personalized_analysis && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Personalized Analysis</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedAnalysis.personalized_analysis}</p>
                    </div>
                  )}

                  {selectedAnalysis.structural_impact_assessment && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Structural Impact Assessment</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedAnalysis.structural_impact_assessment}</p>
                    </div>
                  )}

                  {selectedAnalysis.immediate_actions_required && selectedAnalysis.immediate_actions_required.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Immediate Actions Required</h3>
                      <ul className="space-y-2">
                        {selectedAnalysis.immediate_actions_required.map((action, index) => (
                          <li key={index} className="flex items-start">
                            <AlertTriangle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedAnalysis.long_term_recommendations && selectedAnalysis.long_term_recommendations.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Long-term Recommendations</h3>
                      <ul className="space-y-2">
                        {selectedAnalysis.long_term_recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedAnalysis.monitoring_requirements && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Monitoring Requirements</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedAnalysis.monitoring_requirements}</p>
                    </div>
                  )}

                  {selectedAnalysis.professional_consultation_needed && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-yellow-800">Professional Consultation Recommended</h4>
                          <p className="text-yellow-700 text-sm mt-1">
                            Based on the analysis, we recommend consulting with a structural engineer or qualified professional.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>

                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
