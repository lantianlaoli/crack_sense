'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, CheckCircle, Info, Download, Share, Trash2, Edit } from 'lucide-react'
import ProductRecommendations from '@/components/ProductRecommendations'

interface Finding {
  id: number
  type: string
  severity: string
  length: string
  width: string
  description: string
}

export default function HistoryDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data - replace with real data from API based on params.id
  const analysisData = {
    id: params.id,
    date: '2024-01-15',
    location: 'Living room wall',
    riskLevel: 'moderate' as 'low' | 'moderate' | 'high',
    confidence: 87,
    crackCount: 3,
    totalLength: '2.3 meters',
    maxWidth: '1.2mm',
    description: 'Noticed these cracks appearing over the past few weeks near the window frame.',
    analysisDate: '2024-01-15',
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
    ],
    images: [
      '/api/placeholder/400/300',
      '/api/placeholder/400/300',
      '/api/placeholder/400/300'
    ]
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/dashboard/history"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{analysisData.location}</h1>
            <p className="text-gray-600">Analysis from {new Date(analysisData.date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Download
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Share className="w-4 h-4" />
            Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" />
            Delete
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

      {/* Original Images */}
      <div className="bg-white border border-gray-200 rounded-xl p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Original Images</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysisData.images.map((image, index) => (
            <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                Image {index + 1}
              </div>
            </div>
          ))}
        </div>
        {analysisData.description && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-600">{analysisData.description}</p>
          </div>
        )}
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
            {(analysisData.riskLevel === 'low' || analysisData.riskLevel === 'moderate') && (
              <button
                onClick={() => setActiveTab('products')}
                className={`pb-4 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Repair Materials
              </button>
            )}
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Analysis Summary</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our AI system detected {analysisData.crackCount} cracks in your {analysisData.location.toLowerCase()} with {analysisData.confidence}% confidence. 
                  The overall risk level is assessed as <strong>{analysisData.riskLevel}</strong>. The cracks span a total length of {analysisData.totalLength} 
                  with the widest crack measuring {analysisData.maxWidth}.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Analysis Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{analysisData.location}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Analysis Date:</span>
                    <span className="font-medium">{new Date(analysisData.analysisDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'detailed' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Crack Details</h3>
              {analysisData.findings.map((finding: Finding) => (
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

          {activeTab === 'products' && (
            <div>
              <ProductRecommendations
                analysisId={params.id as string}
                crackSeverity={analysisData.riskLevel}
                crackType={analysisData.findings[0]?.type?.toLowerCase().replace(' crack', '')}
                className="border-0 p-0 bg-transparent"
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Link
          href="/dashboard"
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          New Analysis
        </Link>
        <Link
          href="/dashboard/history"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Back to History
        </Link>
      </div>
    </div>
  )
}