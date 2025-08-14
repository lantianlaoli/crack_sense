'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, CheckCircle, Info, Download, Share, Loader2 } from 'lucide-react'

export default function AnalysisResultPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const crackId = searchParams.get('id')

  useEffect(() => {
    if (crackId) {
      fetchAnalysisData(crackId)
    } else {
      setError('No analysis ID provided')
      setLoading(false)
    }
  }, [crackId])

  const fetchAnalysisData = async (id: string) => {
    try {
      const response = await fetch(`/api/cracks/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch analysis data')
      }
      const { crack } = await response.json()
      
      // Transform API data to component format
      const transformedData = {
        id: crack.id,
        riskLevel: crack.risk_level || 'moderate',
        confidence: 87, // This would come from AI analysis
        crackCount: 3, // This would come from AI analysis
        totalLength: '2.3 meters', // This would come from AI analysis
        maxWidth: '1.2mm', // This would come from AI analysis
        location: crack.description || 'Crack analysis',
        analysisDate: new Date(crack.created_at).toLocaleDateString(),
        aiNotes: crack.ai_notes,
        imageUrls: crack.image_urls,
        recommendations: [
          'Monitor crack progression weekly',
          'Check for moisture sources nearby',
          'Consider professional inspection within 3 months',
          'Apply flexible sealant if cracks expand'
        ],
        findings: [
          {
            id: 1,
            type: 'Horizontal Crack',
            severity: 'Moderate',
            length: '0.8m',
            width: '1.2mm',
            description: 'Horizontal crack along the wall junction, likely due to settling'
          },
          {
            id: 2,
            type: 'Vertical Crack',
            severity: 'Low',
            length: '0.6m',
            width: '0.5mm',
            description: 'Minor vertical crack, consistent with normal building movement'
          },
          {
            id: 3,
            type: 'Corner Crack',
            severity: 'Moderate',
            length: '0.9m',
            width: '0.8mm',
            description: 'Diagonal crack at corner junction, requires monitoring'
          }
        ]
      }
      
      setAnalysisData(transformedData)
    } catch (err) {
      setError('Failed to load analysis data')
      console.error('Error fetching analysis:', err)
    } finally {
      setLoading(false)
    }
  }

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
      case 'low': return <CheckCircle className="w-5 h-5" />
      case 'moderate': return <Info className="w-5 h-5" />
      case 'high': return <AlertTriangle className="w-5 h-5" />
      default: return <Info className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Analysis Results</h3>
          <p className="text-gray-600">Please wait while we fetch your crack analysis data...</p>
        </div>
      </div>
    )
  }

  if (error || !analysisData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Analysis</h3>
        <p className="text-gray-600 mb-6">{error || 'Analysis data not found'}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analysis Results</h1>
            <p className="text-gray-600">Completed on {analysisData.analysisDate}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Download Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Share className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* Risk Level Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Risk Assessment</h2>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${getRiskColor(analysisData.riskLevel)}`}>
            {getRiskIcon(analysisData.riskLevel)}
            {analysisData.riskLevel.charAt(0).toUpperCase() + analysisData.riskLevel.slice(1)} Risk
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-900">{analysisData.crackCount}</div>
            <div className="text-sm text-gray-600">Cracks Detected</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-900">{analysisData.totalLength}</div>
            <div className="text-sm text-gray-600">Total Length</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-900">{analysisData.maxWidth}</div>
            <div className="text-sm text-gray-600">Max Width</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-900">{analysisData.confidence}%</div>
            <div className="text-sm text-gray-600">Confidence</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-8 pt-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`pb-4 border-b-2 font-medium text-sm ${
                activeTab === 'detailed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Detailed Findings
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`pb-4 border-b-2 font-medium text-sm ${
                activeTab === 'recommendations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Recommendations
            </button>
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Analysis Summary</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our AI system has detected {analysisData.crackCount} cracks in your wall with {analysisData.confidence}% confidence. 
                  The overall risk level is assessed as <strong>{analysisData.riskLevel}</strong>. The cracks span a total length of {analysisData.totalLength} 
                  with the widest crack measuring {analysisData.maxWidth}.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Key Metrics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{analysisData.location}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Analysis Date:</span>
                    <span className="font-medium">{analysisData.analysisDate}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'detailed' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Crack Details</h3>
              {analysisData.findings.map((finding: any) => (
                <div key={finding.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{finding.type}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      finding.severity === 'Low' ? 'bg-green-100 text-green-800' :
                      finding.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {finding.severity}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-2 text-sm">
                    <div>
                      <span className="text-gray-600">Length: </span>
                      <span className="font-medium">{finding.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Width: </span>
                      <span className="font-medium">{finding.width}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{finding.description}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Action Items</h3>
              <div className="space-y-3">
                {analysisData.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Professional Consultation</h4>
                <p className="text-yellow-700 text-sm">
                  While our AI provides detailed analysis, we recommend consulting with a structural engineer 
                  for cracks larger than 2mm or if you notice rapid progression.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Link
          href="/dashboard/analyze"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          New Analysis
        </Link>
        <Link
          href="/dashboard/history"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          View All Results
        </Link>
      </div>
    </div>
  )
}