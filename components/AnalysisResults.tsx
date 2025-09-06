'use client'

import { useState } from 'react'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download, 
  Eye,
  FileText,
  Activity,
  Target,
  Calendar,
  Camera,
  AlertCircle,
  Ruler,
  Layers,
  Star,
  Timer,
  CheckCircle2,
  XCircle,
  Minus,
  Plus,
  ChevronRight,
  Dot
} from 'lucide-react'
import { HomeownerCrackAnalysis } from '@/lib/types'

interface AnalysisResultsProps {
  analysis: HomeownerCrackAnalysis
  imageUrls: string[]
}

export default function AnalysisResults({ 
  analysis, 
  imageUrls
}: AnalysisResultsProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  // Use processed images if available, otherwise fall back to original images
  const displayImages = analysis.processed_images && analysis.processed_images.length > 0 
    ? analysis.processed_images 
    : imageUrls

  // Enhanced markdown parsing function
  const parseMarkdown = (text: string) => {
    if (!text || text.trim() === '') return '<p class="mb-4">No analysis data available</p>'
    
    try {
      let processed = text
        // Handle double line breaks for paragraphs
        .replace(/\n\n/g, '</p><p class="mb-4">')
        // Bold text **text** -> <strong>text</strong>
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        // Italic text *text* -> <em>text</em>
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        // Single line breaks -> <br />
        .replace(/\n/g, '<br />')
        // Numbered lists 1. item -> <ol><li>item</li></ol>
        .replace(/(\d+\.\s+[^\n]*(?:\n(?!\d+\.)[^\n]*)*)/g, (match) => {
          const items = match.split(/\n(?=\d+\.\s)/)
          const listItems = items.map(item => 
            `<li class="mb-1">${item.replace(/^\d+\.\s+/, '')}</li>`
          ).join('')
          return `<ol class="list-decimal list-inside space-y-1 my-3 pl-2">${listItems}</ol>`
        })
      
      // Only wrap in paragraph tags if not already wrapped and has content
      if (!processed.startsWith('<') && processed.trim()) {
        processed = `<p class="mb-4">${processed}</p>`
      } else if (processed.startsWith('<') && !processed.endsWith('>')) {
        processed += '</p>'
      }
      
      return processed
    } catch (error) {
      console.error('parseMarkdown error:', error)
      return `<p class="mb-4">${text}</p>`
    }
  }

  const getRiskLevel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return { label: 'Low Risk', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
      case 'moderate': return { label: 'Moderate Risk', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' }
      case 'high': return { label: 'High Risk', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
      default: return { label: 'Unknown Risk', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' }
    }
  }

  const getSimplifiedCrackType = (crackType: string) => {
    if (!crackType) return 'Unknown'
    
    // Extract key type from description
    const lowerType = crackType.toLowerCase()
    if (lowerType.includes('diagonal')) return 'Diagonal'
    if (lowerType.includes('vertical')) return 'Vertical' 
    if (lowerType.includes('horizontal')) return 'Horizontal'
    if (lowerType.includes('stair') || lowerType.includes('step')) return 'Stepped'
    if (lowerType.includes('settlement')) return 'Settlement'
    if (lowerType.includes('structural')) return 'Structural'
    if (lowerType.includes('thermal')) return 'Thermal'
    if (lowerType.includes('shrinkage')) return 'Shrinkage'
    
    // Fallback: take first word or simplified version
    const cleaned = crackType.replace(/crack/gi, '').replace(/\s+/g, ' ').trim()
    const firstWord = cleaned.split(' ')[0]
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase() || 'Structural'
  }


  return (
    <div className="p-6 space-y-6">
      {/* Main Content Grid - Optimized Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Main Content (80% of space) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Cause Analysis - Enhanced */}
          <div className="bg-gray-100 border-0 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Cause Analysis</h2>
            </div>
            <div className="prose prose-sm max-w-none">
              {analysis.crack_cause ? (
                <>
                  <div 
                    className="text-gray-700 leading-relaxed text-sm mb-4"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(analysis.crack_cause) }}
                  />
                  {/* Only show additional context if the analysis is brief */}
                  {analysis.crack_cause.length < 500 && (
                    <p className="text-gray-700 leading-relaxed text-sm mb-4">
                      Based on the structural engineering assessment, this crack pattern requires professional evaluation. The orientation and characteristics suggest specific structural causes that need detailed investigation.
                    </p>
                  )}
                </>
              ) : (
                <div className="text-gray-700 leading-relaxed text-sm mb-4">
                  <p className="mb-4">Analysis results are currently being processed. Please wait a moment for the detailed cause analysis to appear.</p>
                  <p className="text-gray-600 text-xs">If this issue persists, please try refreshing the page or contact support.</p>
                </div>
              )}
            </div>
          </div>

          {/* Repair Solutions - Enhanced */}
          <div className="bg-gray-100 border-0 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Repair Solutions</h2>
            </div>
            <div className="space-y-4">
              {/* Primary Action as Step 1 */}
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Immediate Action</h3>
                  <div className="text-gray-700 leading-relaxed text-sm">
                    {analysis.repair_steps && analysis.repair_steps.length > 0 ? (
                      <div className="space-y-2">
                        {analysis.repair_steps.slice(0, 3).map((step, index) => (
                          <div 
                            key={index}
                            className="border-l-2 border-gray-300 pl-3"
                            dangerouslySetInnerHTML={{ __html: parseMarkdown(step) }}
                          />
                        ))}
                      </div>
                    ) : (
                      <p>Consult with a professional structural engineer for specific repair recommendations.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Steps */}
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-900 font-bold text-xs">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Regular Monitoring</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">Take photos every 3 months to document crack progression and maintain a complete monitoring record.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-900 font-bold text-xs">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Professional Assessment</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {analysis.risk_level === 'high' 
                      ? 'Contact a professional structural engineer immediately for on-site evaluation to determine if emergency repairs are needed.'
                      : analysis.risk_level === 'moderate'
                      ? 'Schedule a detailed assessment with a professional structural engineer within 6 months.'
                      : 'Schedule a preventive inspection with a professional structural engineer within 1 year.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Compact Metrics (20% of space) */}
        <div className="lg:col-span-1 space-y-2">
          {/* Type */}
          <div className="bg-gray-200 rounded-lg p-2 h-16 flex flex-col justify-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-gray-600" />
              <h3 className="font-medium text-gray-900 text-base">Type</h3>
            </div>
            <div className="text-xl font-bold text-gray-900 text-center leading-tight">
              {getSimplifiedCrackType(analysis.crack_type)}
            </div>
          </div>

          {/* Width */}
          <div className="bg-gray-200 rounded-lg p-2 h-16 flex flex-col justify-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Ruler className="w-4 h-4 text-gray-600" />
              <h3 className="font-medium text-gray-900 text-base">Width</h3>
            </div>
            <div className="text-xl font-bold text-gray-900 text-center">
              {analysis.crack_width || 'Unknown'}
            </div>
          </div>

          {/* Length */}
          <div className="bg-gray-200 rounded-lg p-2 h-16 flex flex-col justify-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-gray-600" />
              <h3 className="font-medium text-gray-900 text-base">Length</h3>
            </div>
            <div className="text-xl font-bold text-gray-900 text-center">
              {analysis.crack_length ? 
                analysis.crack_length
                  .replace(/visible length/gi, '')
                  .replace(/approx\.?\s*/gi, '')
                  .replace(/approximately\s*/gi, '')
                  .trim() : 
                'Unknown'
              }
            </div>
          </div>

          {/* Risk Level */}
          <div className="bg-gray-200 rounded-lg p-2 h-16 flex flex-col justify-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              {analysis.risk_level === 'high' && <AlertTriangle className="w-4 h-4 text-gray-600" />}
              {analysis.risk_level === 'moderate' && <Clock className="w-4 h-4 text-gray-600" />}
              {analysis.risk_level === 'low' && <CheckCircle className="w-4 h-4 text-gray-600" />}
              <h3 className="font-medium text-gray-900 text-base">Risk</h3>
            </div>
            <div className="text-xl font-bold text-center text-gray-900">
              {analysis.risk_level === 'high' && 'High'}
              {analysis.risk_level === 'moderate' && 'Moderate'}
              {analysis.risk_level === 'low' && 'Low'}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Full size crack analysis"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}