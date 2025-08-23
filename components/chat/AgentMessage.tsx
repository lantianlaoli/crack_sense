'use client'

import React from 'react'
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  WrenchIcon,
  ShoppingCartIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import type { AgentResponse, InspectionResult, RecommendationResult, ProcurementResult } from '@/lib/agents/types'
import ProfessionalFinder from '@/components/ProfessionalFinder'

interface AgentMessageProps {
  agentResponse: AgentResponse
  className?: string
}

export default function AgentMessage({ agentResponse, className = '' }: AgentMessageProps) {
  const { agentType, status, data, message } = agentResponse

  if (status === 'error') {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-900">
              {getAgentDisplayName(agentType)} Error
            </h4>
            <p className="text-sm text-red-700 mt-1">{message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Agent Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          {getAgentIcon(agentType)}
          <h4 className="text-sm font-medium text-gray-900">
            {getAgentDisplayName(agentType)}
          </h4>
          <CheckCircleIcon className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Agent Content */}
      <div className="p-4">
        {agentType === 'inspection' && data && (
          <InspectionResultDisplay result={data as InspectionResult} />
        )}
        
        {agentType === 'recommendation' && data && (
          <RecommendationResultDisplay result={data as RecommendationResult} />
        )}
        
        {agentType === 'procurement' && data && (
          <ProcurementResultDisplay result={data as ProcurementResult} />
        )}
        
        {agentType === 'professional_finder' && data && (
          <ProfessionalFinderResultDisplay data={data as any} />
        )}
      </div>
    </div>
  )
}

function InspectionResultDisplay({ result }: { result: InspectionResult }) {

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
            Crack Type
          </label>
          <p className="text-sm text-gray-900 mt-1">{result.crackType}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
            Confidence
          </label>
          <p className="text-sm text-gray-900 mt-1">{result.confidence}%</p>
        </div>
      </div>

      {/* Severity Badges */}
      <div className="flex space-x-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          Severity: {result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          Risk: {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)}
        </span>
      </div>

      {/* Findings */}
      {result.findings && result.findings.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-900 mb-2">Key Findings</h5>
          <ul className="space-y-2">
            {result.findings.map((finding, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <span className="text-sm font-medium text-gray-700">{finding.type}</span>
                  <p className="text-sm text-gray-600">{finding.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-900 mb-2">Initial Recommendations</h5>
          <ul className="space-y-1">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                <span className="text-gray-400">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function RecommendationResultDisplay({ result }: { result: RecommendationResult }) {

  return (
    <div className="space-y-4">
      {/* Primary Recommendation */}
      <div>
        <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-800">
          <WrenchIcon className="w-4 h-4 mr-2 text-gray-600" />
          Recommended Action: {result.primaryRecommendation.toUpperCase()}
        </span>
      </div>

      {/* Reasoning */}
      <div>
        <h5 className="text-sm font-medium text-gray-900 mb-2">Why This Approach</h5>
        <p className="text-sm text-gray-700">{result.reasoning}</p>
      </div>

      {/* Steps */}
      {result.steps && result.steps.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-900 mb-2">Action Steps</h5>
          <ol className="space-y-2">
            {result.steps.map((step, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-5 h-5 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Timeframe and Warnings */}
      <div className="grid grid-cols-1 gap-3">
        {result.timeframe && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <h6 className="text-xs font-medium text-gray-700 uppercase tracking-wide">Timeframe</h6>
            <p className="text-sm text-gray-600 mt-1">{result.timeframe}</p>
          </div>
        )}
        
        {result.warnings && result.warnings.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h6 className="text-xs font-medium text-gray-700 uppercase tracking-wide">Important Notes</h6>
            <ul className="mt-1 space-y-1">
              {result.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start space-x-1">
                  <span>⚠️</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function ProcurementResultDisplay({ result }: { result: ProcurementResult }) {
  return (
    <div className="space-y-3">
      {/* Products Grid - Clean Notion Style */}
      <div className="space-y-3">
        {result.products.slice(0, 5).map((product) => (
          <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start space-x-4">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-gray-100"
                />
              )}
              <div className="flex-1 min-w-0">
                <h6 className="text-sm font-medium text-gray-900 leading-tight mb-2">
                  {product.title}
                </h6>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-lg font-semibold text-black">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.rating && (
                    <span className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                      ★ {product.rating}/5
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  {product.reason}
                </p>
                <a 
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-sm text-gray-900 hover:text-black border border-gray-300 hover:border-gray-400 px-3 py-1.5 rounded-md transition-colors"
                >
                  <ShoppingCartIcon className="w-4 h-4" />
                  <span>View on Amazon</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfessionalFinderResultDisplay({ data }: { data: any }) {
  if (data.requiresLocation) {
    return (
      <div className="space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <UserGroupIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="text-sm font-medium text-blue-900">Location Required</h5>
              <p className="text-sm text-blue-700 mt-1">{data.message}</p>
            </div>
          </div>
        </div>
        
        {data.examples && data.examples.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h6 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Examples:</h6>
            <ul className="space-y-1">
              {data.examples.map((example: string, index: number) => (
                <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                  <span className="text-gray-400">•</span>
                  <span>&quot;{example}&quot;</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  if (data.professionals && data.professionals.length > 0) {
    return (
      <div className="space-y-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">{data.message}</p>
        </div>
        
        <ProfessionalFinder 
          shouldShow={data.shouldShow}
          emergencyLevel={data.emergencyLevel}
          message={data.message}
          professionals={data.professionals}
          searchParams={data.searchParams}
          autoSearched={data.autoSearched}
          location={data.location}
        />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-sm text-gray-600">Professional finder ready to help when needed.</p>
    </div>
  )
}

function getAgentDisplayName(agentType: string): string {
  switch (agentType) {
    case 'inspection': return 'Inspection Agent'
    case 'recommendation': return 'Recommendation Agent'
    case 'procurement': return 'Procurement Agent'
    case 'monitoring': return 'Monitoring Agent'
    case 'professional_finder': return 'Professional Finder'
    default: return 'AI Assistant'
  }
}


function getAgentIcon(agentType: string) {
  switch (agentType) {
    case 'inspection':
      return <ExclamationTriangleIcon className="w-4 h-4 text-gray-600" />
    case 'recommendation':
      return <WrenchIcon className="w-4 h-4 text-gray-600" />
    case 'procurement':
      return <ShoppingCartIcon className="w-4 h-4 text-gray-600" />
    case 'professional_finder':
      return <UserGroupIcon className="w-4 h-4 text-gray-600" />
    default:
      return <CheckCircleIcon className="w-4 h-4 text-gray-600" />
  }
}