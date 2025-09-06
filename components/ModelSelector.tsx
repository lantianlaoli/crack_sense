'use client'

import { useState } from 'react'
import { ChevronDown, Coins, Crown, Zap, Gauge } from 'lucide-react'

interface Model {
  id: string
  name: string
  icon: any
  credits: number
  description: string
}

interface ModelSelectorProps {
  selectedModel?: string
  onModelChange?: (model: string) => void
  isCollapsed?: boolean
}

const aiModels: Model[] = [
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude 4',
    icon: Crown,
    credits: 50,
    description: 'Most Powerful'
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5',
    icon: Zap,
    credits: 25,
    description: 'Balanced'
  },
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0',
    icon: Gauge,
    credits: 15,
    description: 'Fast'
  }
]

export default function ModelSelector({ 
  selectedModel = 'google/gemini-2.0-flash-001', 
  onModelChange,
  isCollapsed = false 
}: ModelSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const currentModel = aiModels.find(model => model.id === selectedModel) || aiModels[2]

  if (isCollapsed) {
    return (
      <div className="flex justify-center p-2">
        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center border border-gray-300">
          <currentModel.icon className="w-4 h-4 text-gray-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-3 mb-3">
      <div className="bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full p-3 text-left hover:bg-gray-50 rounded transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center border border-gray-300">
                <currentModel.icon className="w-3.5 h-3.5 text-gray-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">{currentModel.name}</div>
                <div className="text-xs text-gray-600">{currentModel.description}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-200 rounded px-2 py-1 border border-gray-300">
                <Coins className="w-3 h-3 text-gray-600" />
                <span className="text-xs font-bold text-gray-900">{currentModel.credits}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} />
            </div>
          </div>
        </button>
        
        {isDropdownOpen && (
          <div className="border-t border-gray-200">
            {aiModels.map((model) => {
              const ModelIcon = model.icon
              const isSelected = model.id === selectedModel
              
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange?.(model.id)
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full p-3 hover:bg-gray-100 transition-colors text-left ${
                    isSelected ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded flex items-center justify-center border ${
                        isSelected 
                          ? 'bg-gray-900 border-gray-900' 
                          : 'bg-gray-200 border-gray-300'
                      }`}>
                        <ModelIcon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{model.name}</div>
                        <div className="text-xs text-gray-600">{model.description}</div>
                      </div>
                    </div>
                    <div className={`rounded px-2 py-1 border ${
                      isSelected 
                        ? 'bg-gray-900 border-gray-900' 
                        : 'bg-gray-200 border-gray-300'
                    }`}>
                      <div className="flex items-center gap-1">
                        <Coins className="w-3 h-3 text-white" />
                        <span className="text-xs font-bold text-white">{model.credits}</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
