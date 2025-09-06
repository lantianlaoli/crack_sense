'use client'

import { useState } from 'react'
import { FileText, Calendar, Filter, Search, Eye, Download, Share2 } from 'lucide-react'

interface ReportsPageProps {
  analyses: any[]
  onSelectAnalysis: (analysis: any) => void
  selectedAnalysisId?: string
}

export default function ReportsPage({ analyses, onSelectAnalysis, selectedAnalysisId }: ReportsPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         analysis.user_description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === 'all' || analysis.severity === severityFilter
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'today' && isToday(new Date(analysis.created_at))) ||
                       (dateFilter === 'week' && isThisWeek(new Date(analysis.created_at))) ||
                       (dateFilter === 'month' && isThisMonth(new Date(analysis.created_at)))
    
    return matchesSearch && matchesSeverity && matchesDate
  })

  function isToday(date: Date): boolean {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  function isThisWeek(date: Date): boolean {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    return date >= weekAgo
  }

  function isThisMonth(date: Date): boolean {
    const today = new Date()
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  }

  return (
    <div className="flex-1 bg-notion-50 flex">
      {/* Reports List */}
      <div className="w-96 bg-white border-r border-notion-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-notion-200">
          <h2 className="text-xl font-semibold text-notion-900 mb-4">Analysis Reports</h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-notion-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-notion-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-notion-700 mb-1">Severity</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-notion-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-notion-700 mb-1">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-notion-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto">
          {filteredAnalyses.length > 0 ? (
            <div className="p-3 space-y-2">
              {filteredAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  onClick={() => onSelectAnalysis(analysis)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedAnalysisId === analysis.id
                      ? 'border-accent-blue bg-accent-blue/5'
                      : 'border-notion-200 hover:border-notion-300 hover:bg-notion-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-notion-500" />
                      <span className="text-sm font-medium text-notion-900">
                        #{analysis.id.slice(-8)}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      analysis.severity === 'low' ? 'bg-accent-green/10 text-accent-green' :
                      analysis.severity === 'moderate' ? 'bg-accent-yellow/10 text-accent-yellow' :
                      'bg-accent-red/10 text-accent-red'
                    }`}>
                      {analysis.severity === 'low' ? 'Low' : 
                       analysis.severity === 'moderate' ? 'Moderate' : 'High'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-notion-600 mb-2 line-clamp-2">
                    {analysis.user_description || 'No description provided'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-notion-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(analysis.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <span>{analysis.ai_analysis.confidence}% confidence</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <FileText className="w-12 h-12 mx-auto text-notion-400 mb-3" />
              <p className="text-notion-500">No reports found</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Details */}
      <div className="flex-1 bg-white">
        {selectedAnalysisId ? (
          <div className="h-full overflow-y-auto">
            <div className="p-8">
              {/* Report Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-notion-900 mb-2">Analysis Report</h1>
                  <p className="text-notion-600">
                    Generated on {new Date(analyses.find(a => a.id === selectedAnalysisId)?.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-notion-100 text-notion-700 rounded-lg hover:bg-notion-200 transition-colors">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-notion-100 text-notion-700 rounded-lg hover:bg-notion-200 transition-colors">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>

              {/* Report Content */}
              <div className="space-y-8">
                {/* Images */}
                <div>
                  <h2 className="text-lg font-semibold text-notion-900 mb-4">Uploaded Images</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {analyses.find(a => a.id === selectedAnalysisId)?.image_urls.map((url: string, index: number) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Analysis image ${index + 1}`}
                        className="w-full rounded-lg border border-notion-200"
                      />
                    ))}
                  </div>
                </div>

                {/* User Description */}
                {analyses.find(a => a.id === selectedAnalysisId)?.user_description && (
                  <div>
                    <h2 className="text-lg font-semibold text-notion-900 mb-4">User Description</h2>
                    <div className="bg-notion-50 rounded-lg p-4">
                      <p className="text-notion-700">
                        {analyses.find(a => a.id === selectedAnalysisId)?.user_description}
                      </p>
                    </div>
                  </div>
                )}

                {/* AI Analysis */}
                <div>
                  <h2 className="text-lg font-semibold text-notion-900 mb-4">AI Analysis Results</h2>
                  <div className="bg-accent-blue/5 rounded-lg p-6 border border-accent-blue/20">
                    <div className="flex items-center gap-4 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        analyses.find(a => a.id === selectedAnalysisId)?.severity === 'low' ? 'bg-accent-green/10 text-accent-green' :
                        analyses.find(a => a.id === selectedAnalysisId)?.severity === 'moderate' ? 'bg-accent-yellow/10 text-accent-yellow' :
                        'bg-accent-red/10 text-accent-red'
                      }`}>
                        {analyses.find(a => a.id === selectedAnalysisId)?.severity === 'low' ? 'Low Severity' : 
                         analyses.find(a => a.id === selectedAnalysisId)?.severity === 'moderate' ? 'Moderate Severity' : 'High Severity'}
                      </span>
                      <span className="text-sm text-notion-600">
                        Confidence: {analyses.find(a => a.id === selectedAnalysisId)?.ai_analysis.confidence}%
                      </span>
                    </div>
                    <div className="prose max-w-none">
                      <p className="text-notion-700 whitespace-pre-wrap">
                        {analyses.find(a => a.id === selectedAnalysisId)?.ai_analysis.analysis}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {analyses.find(a => a.id === selectedAnalysisId)?.ai_analysis.recommendations?.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-notion-900 mb-4">Professional Recommendations</h2>
                    <div className="space-y-3">
                      {analyses.find(a => a.id === selectedAnalysisId)?.ai_analysis.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 bg-notion-50 rounded-lg p-4 border border-notion-200">
                          <div className="w-6 h-6 bg-accent-blue/10 text-accent-blue rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-notion-700">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-notion-400" />
              <h3 className="text-lg font-medium text-notion-900 mb-2">Select a Report</h3>
              <p className="text-notion-500">Choose a report from the left panel to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
