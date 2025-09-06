'use client'

import { Eye, Download, Calendar, MessageSquare } from 'lucide-react'


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

interface NotionTableProps {
  analyses: Analysis[]
  onViewDetails: (analysis: Analysis) => void
}

export default function NotionTable({ analyses, onViewDetails }: NotionTableProps) {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }



  if (analyses.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Records</h3>
          <p className="text-gray-500">Upload your first crack image to start analysis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-white">
      {/* Table Header */}
      <div className="border-b border-gray-200">
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Analysis Records</h2>
          <p className="text-sm text-gray-500 mt-1">Total {analyses.length} records</p>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Images
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Analysis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {analyses.map((analysis) => (
              <tr 
                key={analysis.id} 
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onViewDetails(analysis)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDate(analysis.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {analysis.image_urls.slice(0, 3).map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Crack image ${index + 1}`}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />
                      </div>
                    ))}
                    {analysis.image_urls.length > 3 && (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">+{analysis.image_urls.length - 3}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {analysis.user_description || 'No description'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-md">
                    <div className="truncate mb-1">
                      {analysis.ai_analysis.analysis || 'Analysis result'}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        analysis.severity === 'low' ? 'bg-green-100 text-green-800' :
                        analysis.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {analysis.severity === 'low' ? 'Low' : 
                         analysis.severity === 'moderate' ? 'Moderate' : 'High'}
                      </span>
                      <span>Confidence: {analysis.ai_analysis.confidence}%</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewDetails(analysis)
                      }}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}