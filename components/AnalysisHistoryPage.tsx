'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Download,
  Image as ImageIcon,
  Zap,
  Crown,
  Gauge
} from 'lucide-react'
import Image from 'next/image'
import { getCreditCost } from '@/lib/constants'
import { checkPDFExportExists } from '@/lib/credits'
import { generatePDFReport, convertToPDFData } from '@/lib/pdf-utils'


interface AnalysisRecord {
  id: string
  created_at: string
  image_urls: string[]
  crack_type: string
  crack_cause: string
  crack_width: string
  crack_length: string
  repair_steps: string[]
  risk_level: 'low' | 'moderate' | 'high'
  processed_image_url?: string
  model_used: string
}

interface AnalysisHistoryPageProps {
  onViewAnalysis?: (analysisId: string) => void
}

interface PDFExportStatus {
  [analysisId: string]: {
    exported: boolean
    loading: boolean
  }
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

// Helper function to format crack cause analysis like ExamplesSection
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

export default function AnalysisHistoryPage({ onViewAnalysis }: AnalysisHistoryPageProps) {
  const { user } = useUser()
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null)
  const [filter, setFilter] = useState<'all' | 'high' | 'moderate' | 'low'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [pdfExportStatus, setPdfExportStatus] = useState<PDFExportStatus>({})

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
          // Check PDF export statuses after loading analyses
          await checkPDFExportStatuses(data.analyses)
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
    const matchesFilter = filter === 'all' || analysis.risk_level === filter
    const matchesSearch = searchQuery === '' || 
      analysis.crack_cause?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      analysis.crack_type?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const handleViewAnalysis = (analysis: AnalysisRecord) => {
    setSelectedAnalysis(analysis)
    onViewAnalysis?.(analysis.id)
  }

  const handleCloseModal = () => {
    setSelectedAnalysis(null)
  }

  // Check PDF export status for all analyses
  const checkPDFExportStatuses = async (analyses: AnalysisRecord[]) => {
    if (!user?.id) return

    const statusChecks = analyses.map(async (analysis) => {
      try {
        const result = await checkPDFExportExists(user.id, analysis.id)
        return {
          analysisId: analysis.id,
          exported: result.success && (result.exists || false)
        }
      } catch (error) {
        console.error(`Failed to check PDF export status for ${analysis.id}:`, error)
        return {
          analysisId: analysis.id,
          exported: false
        }
      }
    })

    const statuses = await Promise.all(statusChecks)
    const statusMap: PDFExportStatus = {}
    
    statuses.forEach(({ analysisId, exported }) => {
      statusMap[analysisId] = { exported, loading: false }
    })

    setPdfExportStatus(statusMap)
  }

  // Handle PDF export
  const handleExportPDF = async (analysis: AnalysisRecord, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent opening modal
    
    if (!user?.id) return

    // Set loading state
    setPdfExportStatus(prev => ({
      ...prev,
      [analysis.id]: { ...prev[analysis.id], loading: true }
    }))

    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analysisId: analysis.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to export PDF')
      }

      // Update status to exported
      setPdfExportStatus(prev => ({
        ...prev,
        [analysis.id]: { exported: true, loading: false }
      }))

      // Show success message and trigger PDF generation
      if (result.alreadyExported) {
        console.log('PDF was already exported, generating download...')
      } else {
        console.log(`PDF export successful! ${result.creditsCharged} credits charged.`)
      }

      // Generate and download the actual PDF file
      const pdfData = convertToPDFData({
        crack_type: analysis.crack_type,
        crack_cause: analysis.crack_cause,
        crack_width: analysis.crack_width,
        crack_length: analysis.crack_length,
        repair_steps: analysis.repair_steps,
        risk_level: analysis.risk_level,
        processed_images: []
      }, [])

      generatePDFReport(pdfData)
      
    } catch (error) {
      console.error('PDF export failed:', error)
      // Reset loading state on error
      setPdfExportStatus(prev => ({
        ...prev,
        [analysis.id]: { ...prev[analysis.id], loading: false }
      }))
      
      // Show error message
      alert(error instanceof Error ? error.message : 'Failed to export PDF')
    }
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
                  { key: 'high', label: 'High', count: analyses.filter(a => a.risk_level === 'high').length },
                  { key: 'moderate', label: 'Moderate', count: analyses.filter(a => a.risk_level === 'moderate').length },
                  { key: 'low', label: 'Low', count: analyses.filter(a => a.risk_level === 'low').length }
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as 'all' | 'high' | 'moderate' | 'low')}
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
              <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredAnalyses.map((analysis) => {
                  const exportStatus = pdfExportStatus[analysis.id]
                  const creditCost = getCreditCost(analysis.model_used as keyof typeof import('@/lib/constants').CREDIT_COSTS)
                  
                  return (
                    <div
                      key={analysis.id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                      onClick={() => handleViewAnalysis(analysis)}
                    >
                      {/* Image Section - First like ExampleCard */}
                      {analysis.image_urls && analysis.image_urls.length > 0 && (
                        <div className="relative aspect-[4/3] bg-gray-50">
                          <Image
                            src={analysis.image_urls[0]}
                            alt={`${analysis.crack_type || 'Crack'} analysis`}
                            fill
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      )}

                      {/* Tags Section - Second like ExampleCard */}
                      <div className="p-4 pb-3">
                        <div className="flex items-center gap-2 mb-4">
                          {/* Severity Tag */}
                          <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getSeverityColor(analysis.risk_level)}`}>
                            {getSeverityIcon(analysis.risk_level)}
                            <span className="ml-1 uppercase tracking-wide">{analysis.risk_level}</span>
                          </div>
                          
                          {/* Dimensions Tags */}
                          <div className="flex items-center gap-2">
                            {analysis.crack_width && (
                              <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border">
                                W: {analysis.crack_width}
                              </div>
                            )}
                            {analysis.crack_length && (
                              <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border">
                                L: {analysis.crack_length}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content Section - Third like ExampleCard */}
                      <div className="px-4 pb-4">
                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                          {analysis.crack_type || 'Crack Analysis'}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {analysis.crack_cause || 'Comprehensive crack analysis with detailed findings and recommendations'}
                        </p>

                        {/* Date */}
                        <div className="flex items-center text-xs text-gray-500 mb-4">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(analysis.created_at)}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          {/* View Details Button */}
                          <button 
                            className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg py-3 text-gray-900 font-medium text-sm transition-colors group-hover:bg-gray-100"
                            onClick={() => handleViewAnalysis(analysis)}
                          >
                            View Analysis Details
                          </button>
                          
                          {/* Export PDF Button */}
                          <button
                            onClick={(e) => handleExportPDF(analysis, e)}
                            disabled={exportStatus?.loading}
                            className={`w-full rounded-lg py-3 text-sm font-medium transition-colors ${
                              exportStatus?.exported
                                ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                                : exportStatus?.loading
                                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                                : 'bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700'
                            }`}
                          >
                            {exportStatus?.loading ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                                Exporting PDF...
                              </div>
                            ) : exportStatus?.exported ? (
                              <div className="flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                PDF Downloaded
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                <Download className="w-4 h-4 mr-2" />
                                Export PDF ({creditCost} credits)
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Analysis Detail Modal - ExamplesSection Style */}
        {selectedAnalysis && (
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
                      {selectedAnalysis.crack_cause ? (
                        <div className="space-y-4">
                          {formatCrackCause(selectedAnalysis.crack_cause).map((section, index) => (
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
                            No detailed cause analysis available for this crack analysis.
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
                      {selectedAnalysis.repair_steps && selectedAnalysis.repair_steps.length > 0 ? (
                        <div className="space-y-3">
                          {selectedAnalysis.repair_steps.map((step, index) => (
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
                            No specific repair recommendations available for this analysis.
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
      </div>
    </div>
  )
}
