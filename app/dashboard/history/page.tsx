'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Filter, Calendar, AlertTriangle, CheckCircle, Info, Eye, Loader2 } from 'lucide-react'

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState('all')
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalysisHistory()
  }, [])

  const fetchAnalysisHistory = async () => {
    try {
      const response = await fetch('/api/cracks')
      if (!response.ok) {
        throw new Error('Failed to fetch analysis history')
      }
      const { cracks } = await response.json()
      
      // Transform API data to component format
      const transformedHistory = cracks.map((crack: any) => ({
        id: crack.id,
        date: crack.created_at,
        location: crack.description || 'Crack analysis',
        riskLevel: crack.risk_level || 'moderate',
        crackCount: 3, // This would come from AI analysis metadata
        confidence: 87, // This would come from AI analysis metadata
        status: 'completed'
      }))
      
      setAnalysisHistory(transformedHistory)
    } catch (err) {
      setError('Failed to load analysis history')
      console.error('Error fetching history:', err)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for fallback - remove when API is working
  const mockAnalysisHistory = [
    {
      id: 'analysis-123',
      date: '2024-01-15',
      location: 'Living room wall',
      riskLevel: 'moderate',
      crackCount: 3,
      confidence: 87,
      status: 'completed'
    },
    {
      id: 'analysis-122',
      date: '2024-01-10',
      location: 'Bedroom ceiling',
      riskLevel: 'low',
      crackCount: 1,
      confidence: 92,
      status: 'completed'
    },
    {
      id: 'analysis-121',
      date: '2024-01-05',
      location: 'Kitchen wall',
      riskLevel: 'high',
      crackCount: 5,
      confidence: 95,
      status: 'completed'
    },
    {
      id: 'analysis-120',
      date: '2023-12-28',
      location: 'Bathroom wall',
      riskLevel: 'low',
      crackCount: 2,
      confidence: 89,
      status: 'completed'
    }
  ]

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'moderate': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-4 h-4" />
      case 'moderate': return <Info className="w-4 h-4" />
      case 'high': return <AlertTriangle className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const filteredHistory = analysisHistory.filter(analysis => {
    const matchesSearch = analysis.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterRisk === 'all' || analysis.riskLevel === filterRisk
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Link 
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
            <p className="text-gray-600">View and manage your previous crack analyses</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Analysis History</h3>
            <p className="text-gray-600">Please wait while we fetch your analysis records...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link 
          href="/dashboard"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
          <p className="text-gray-600">View and manage your previous crack analyses</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Risk Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="moderate">Moderate Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing {filteredHistory.length} of {analysisHistory.length} analyses
        </p>
        <Link
          href="/dashboard/analyze"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          New Analysis
        </Link>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterRisk !== 'all' 
                ? 'No analyses match your current filters.' 
                : 'You haven\'t created any analyses yet.'
              }
            </p>
            <Link
              href="/dashboard/analyze"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create First Analysis
            </Link>
          </div>
        ) : (
          filteredHistory.map((analysis) => (
            <div key={analysis.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{analysis.location}</h3>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(analysis.riskLevel)}`}>
                      {getRiskIcon(analysis.riskLevel)}
                      {analysis.riskLevel.charAt(0).toUpperCase() + analysis.riskLevel.slice(1)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(analysis.date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">{analysis.crackCount}</span> cracks detected
                    </div>
                    <div>
                      <span className="font-medium">{analysis.confidence}%</span> confidence
                    </div>
                    <div className="capitalize">
                      Status: <span className="font-medium">{analysis.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/dashboard/history/${analysis.id}`}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredHistory.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <button className="px-3 py-2 border border-gray-300 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors cursor-not-allowed" disabled>
            Previous
          </button>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">
            1
          </button>
          <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-not-allowed" disabled>
            Next
          </button>
        </div>
      )}
    </div>
  )
}