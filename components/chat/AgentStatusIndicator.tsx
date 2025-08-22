'use client'

import React from 'react'
import { 
  MagnifyingGlassIcon, 
  CogIcon, 
  ShoppingCartIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import type { AgentType, AgentStatus } from '@/lib/agents/types'

interface AgentStatusIndicatorProps {
  agentType: AgentType | null
  status: AgentStatus
  className?: string
}

const agentConfig = {
  inspection: {
    name: 'Inspection Agent',
    icon: MagnifyingGlassIcon,
    color: 'blue',
    description: 'Analyzing crack images and severity'
  },
  recommendation: {
    name: 'Recommendation Agent', 
    icon: CogIcon,
    color: 'green',
    description: 'Generating repair recommendations'
  },
  procurement: {
    name: 'Procurement Agent',
    icon: ShoppingCartIcon,
    color: 'orange',
    description: 'Finding suitable repair products'
  },
  monitoring: {
    name: 'Monitoring Agent',
    icon: MagnifyingGlassIcon,
    color: 'purple',
    description: 'Setting up crack monitoring'
  },
  professional_finder: {
    name: 'Professional Finder',
    icon: CogIcon,
    color: 'red',
    description: 'Finding qualified professionals'
  }
}

const statusConfig = {
  idle: { label: 'Ready', color: 'gray' },
  analyzing_intent: { label: 'Analyzing your request...', color: 'blue' },
  running_agent: { label: 'Working...', color: 'blue' },
  completed: { label: 'Complete', color: 'green' },
  error: { label: 'Error', color: 'red' }
}

export default function AgentStatusIndicator({ 
  agentType, 
  status, 
  className = '' 
}: AgentStatusIndicatorProps) {
  if (!agentType || status === 'idle') {
    return null
  }

  const agent = agentConfig[agentType]
  const statusInfo = statusConfig[status]
  const IconComponent = agent.icon

  return (
    <div className={`flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border ${className}`}>
      {/* Agent Icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-${agent.color}-100 flex items-center justify-center`}>
        {status === 'running_agent' ? (
          <div className={`w-4 h-4 border-2 border-${agent.color}-500 border-t-transparent rounded-full animate-spin`}></div>
        ) : status === 'completed' ? (
          <CheckCircleIcon className={`w-5 h-5 text-${agent.color}-600`} />
        ) : status === 'error' ? (
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
        ) : (
          <IconComponent className={`w-5 h-5 text-${agent.color}-600`} />
        )}
      </div>

      {/* Agent Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h4 className={`text-sm font-medium text-${agent.color}-900`}>
            {agent.name}
          </h4>
          <span className={`text-xs px-2 py-1 rounded-full bg-${statusInfo.color}-100 text-${statusInfo.color}-700`}>
            {statusInfo.label}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {agent.description}
        </p>
      </div>

      {/* Status Animation */}
      {status === 'running_agent' && (
        <div className="flex space-x-1">
          <div className={`w-2 h-2 bg-${agent.color}-400 rounded-full animate-bounce`}></div>
          <div className={`w-2 h-2 bg-${agent.color}-400 rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
          <div className={`w-2 h-2 bg-${agent.color}-400 rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
        </div>
      )}
    </div>
  )
}