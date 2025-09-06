'use client'

import { useState } from 'react'
import { Camera, X, Send, Zap, ChevronDown, Check, Coins } from 'lucide-react'

interface AnalysisSidebarProps {
  credits: number | null
  loadingCredits: boolean
  onAnalyze: (files: File[], questions: string[], model: 'gemini-2.0-flash' | 'gemini-2.5-flash') => void
  isAnalyzing: boolean
}

export default function AnalysisSidebar({ 
  credits, 
  loadingCredits, 
  onAnalyze, 
  isAnalyzing 
}: AnalysisSidebarProps) {
  const [files, setFiles] = useState<File[]>([])
  const [questions, setQuestions] = useState<string[]>(['', ''])
  const [selectedModel, setSelectedModel] = useState<'gemini-2.0-flash' | 'gemini-2.5-flash'>('gemini-2.0-flash')
  const [dragActive, setDragActive] = useState(false)
  const [showModelDropdown, setShowModelDropdown] = useState(false)

  const modelCosts = {
    'gemini-2.0-flash': 200,
    'gemini-2.5-flash': 500
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...selectedFiles].slice(0, 3))
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'))
    setFiles(prev => [...prev, ...imageFiles].slice(0, 3))
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleQuestionChange = (index: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => i === index ? value : q))
  }

  const handleSubmit = () => {
    if (files.length === 0 || isAnalyzing) return
    
    const nonEmptyQuestions = questions.filter(q => q.trim())
    onAnalyze(files, nonEmptyQuestions, selectedModel)
    
    // Reset form
    setFiles([])
    setQuestions(['', ''])
  }

  const canSubmit = files.length > 0 && !isAnalyzing && credits && credits >= modelCosts[selectedModel]

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Crack Analysis</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Coins className="w-4 h-4" />
          <span>{loadingCredits ? 'Loading...' : `${credits || 0} Credits`}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Upload Crack Images <span className="text-gray-400">(max 3)</span>
          </label>
          <div
            className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : files.length > 0
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300'
            }`}
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {files.length > 0 ? (
              <div className="space-y-3">
                <div className="text-center">
                  <span className="text-sm font-medium text-green-700">
                    Selected {files.length} images
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {files.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-16 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Camera className={`w-8 h-8 mx-auto mb-3 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className={`text-sm mb-2 ${dragActive ? 'text-blue-700' : 'text-gray-600'}`}>
                  {dragActive ? 'Release to upload images' : 'Drag images here'}
                </p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Select Files
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Your Questions <span className="text-gray-400">(max 2, optional)</span>
          </label>
          <div className="space-y-3">
            {questions.map((question, index) => (
              <div key={index}>
                <textarea
                  value={question}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  placeholder={`Question ${index + 1} (e.g., Does this crack need immediate repair?)`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  disabled={isAnalyzing}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            AI Model Selection
          </label>
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {selectedModel === 'gemini-2.0-flash' ? 'Gemini 2.0' : 'Gemini 2.5'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">({modelCosts[selectedModel]} credits)</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </button>

            {showModelDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-1">
                  <button
                    onClick={() => {
                      setSelectedModel('gemini-2.0-flash')
                      setShowModelDropdown(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedModel === 'gemini-2.0-flash'
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Gemini 2.0 Flash</div>
                        <div className="text-xs text-gray-500">Balanced performance</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{modelCosts['gemini-2.0-flash']} credits</span>
                        {selectedModel === 'gemini-2.0-flash' && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedModel('gemini-2.5-flash')
                      setShowModelDropdown(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedModel === 'gemini-2.5-flash'
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Gemini 2.5 Flash</div>
                        <div className="text-xs text-gray-500">Highest accuracy</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{modelCosts['gemini-2.5-flash']} credits</span>
                        {selectedModel === 'gemini-2.5-flash' && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
          {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
        </button>
        {!canSubmit && files.length > 0 && (
          <p className="text-xs text-red-600 mt-2 text-center">
            Insufficient credits, need {modelCosts[selectedModel]} credits
          </p>
        )}
      </div>
    </div>
  )
}