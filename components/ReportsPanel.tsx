'use client'

import { FileText, Calendar, ImageIcon, ChevronRight } from 'lucide-react'

interface Analysis {
  id: string
  created_at: string
  image_urls: string[]
  user_description: string
  severity: 'low' | 'moderate' | 'high'
  ai_analysis: {
    confidence: number
    crackCount: number
    findings: any[]
    recommendations: string[]
    analysis: string
  }
  model_used: string
}

interface ReportsPanelProps {
  analyses: Analysis[]
  onSelectAnalysis: (analysis: Analysis) => void
  selectedAnalysisId?: string
}

export default function ReportsPanel({ 
  analyses, 
  onSelectAnalysis, 
  selectedAnalysisId 
}: ReportsPanelProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSeverityColor = (severity: 'low' | 'moderate' | 'high') => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'moderate': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityText = (severity: 'low' | 'moderate' | 'high') => {
    switch (severity) {
      case 'low': return 'Low'
      case 'moderate': return 'Moderate'
      case 'high': return 'High'
      default: return 'Unknown'
    }
  }

  if (analyses.length === 0) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Analysis History</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No history records</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Analysis History</h2>
        <p className="text-sm text-gray-500">{analyses.length} records</p>
      </div>

      {/* Reports List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              onClick={() => onSelectAnalysis(analysis)}
              className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedAnalysisId === analysis.id ? 'bg-blue-50 border border-blue-200' : ''
              }`}
            >
              {/* Header Row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {formatDate(analysis.created_at)}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              {/* Images Preview */}
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-gray-400" />
                <div className="flex -space-x-1">
                  {analysis.image_urls.slice(0, 2).map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-6 h-6 rounded border-2 border-white object-cover"
                    />
                  ))}
                  {analysis.image_urls.length > 2 && (
                    <div className="w-6 h-6 rounded bg-gray-100 border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-gray-500">+{analysis.image_urls.length - 2}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-2">
                <p className="text-sm text-gray-900 line-clamp-2">
                  {analysis.user_description || 'No description'}
                </p>
              </div>

              {/* Status & Confidence */}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(analysis.severity)}`}>
                  {getSeverityText(analysis.severity)}
                </span>
                <span className="text-xs text-gray-500">
                  {analysis.ai_analysis.confidence}% confidence
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}