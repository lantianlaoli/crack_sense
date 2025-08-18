'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Camera, History, Plus, Eye, Coins, Upload, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  const router = useRouter()
  const [credits, setCredits] = useState<number | null>(null)
  const [loadingCredits, setLoadingCredits] = useState(true)
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [description, setDescription] = useState('')
  const [selectedModel, setSelectedModel] = useState<'gemini-2.0-flash' | 'gemini-2.5-flash'>('gemini-2.0-flash')
  const [showAnalyzer, setShowAnalyzer] = useState(false)

  // Credit costs
  const modelCosts = {
    'gemini-2.0-flash': 200,
    'gemini-2.5-flash': 500
  }

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user?.id) return
      
      try {
        const response = await fetch('/api/credits/check')
        const data = await response.json()
        
        if (data.success) {
          setCredits(data.credits)
        }
      } catch (error) {
        console.error('Failed to fetch credits:', error)
      } finally {
        setLoadingCredits(false)
      }
    }

    fetchCredits()
  }, [user?.id])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      )
      setFiles(prev => [...prev, ...newFiles].slice(0, 3))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/')
      )
      setFiles(prev => [...prev, ...newFiles].slice(0, 3))
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleAnalyze = async () => {
    if (files.length === 0) return

    // Check if user has enough credits
    const requiredCredits = modelCosts[selectedModel]
    if (credits !== null && credits < requiredCredits) {
      alert(`Insufficient credits. You need ${requiredCredits} credits but only have ${credits}.`)
      return
    }

    setIsAnalyzing(true)
    try {
      // Step 1: Upload images
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload images')
      }

      const { urls: imageUrls } = await uploadResponse.json()

      // Step 2: Analyze images
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrls,
          description,
          model: selectedModel,
        }),
      })

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json()
        if (analysisResponse.status === 402) {
          alert(`Insufficient credits. You need ${errorData.requiredCredits} credits but only have ${errorData.currentCredits}.`)
          return
        }
        throw new Error(errorData.error || 'Analysis failed')
      }

      const { analysis, remainingCredits } = await analysisResponse.json()

      // Update credits display
      setCredits(remainingCredits)

      // Step 3: Save to database
      const saveResponse = await fetch('/api/cracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          image_urls: imageUrls,
          ai_notes: analysis.aiNotes,
          risk_level: analysis.riskLevel,
        }),
      })

      if (!saveResponse.ok) {
        throw new Error('Failed to save analysis')
      }

      const { crack } = await saveResponse.json()

      // Step 4: Redirect to results page with the analysis data
      router.push(`/dashboard/history/${crack.id}`)
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header with Credits */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'User'}
          </h1>
          <p className="text-gray-600">
            Analyze wall cracks and track your property&apos;s condition over time.
          </p>
        </div>
        
        {/* Credits Display */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 min-w-48">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Available Credits</div>
              <div className="text-2xl font-bold text-gray-900">
                {loadingCredits ? '...' : credits?.toLocaleString() || 0}
              </div>
            </div>
          </div>
          {credits !== null && credits < 500 && (
            <Link 
              href="/#pricing"
              className="mt-3 block w-full bg-blue-600 text-white text-sm text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buy More Credits
            </Link>
          )}
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* New Analysis Card */}
        <button 
          onClick={() => setShowAnalyzer(true)}
          className="group block p-8 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-200 w-full text-left"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">New Analysis</h3>
              <p className="text-gray-600">Upload photos for AI crack detection</p>
            </div>
          </div>
          <div className="flex items-center text-blue-600 font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Start analyzing
          </div>
        </button>

        {/* History Card */}
        <Link 
          href="/dashboard/history"
          className="group block p-8 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors">
              <History className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Analysis History</h3>
              <p className="text-gray-600">View past crack analysis reports</p>
            </div>
          </div>
          <div className="flex items-center text-gray-600 font-medium">
            <Eye className="w-4 h-4 mr-2" />
            View history
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Total Analyses</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">High Risk Cracks</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {loadingCredits ? '...' : credits?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600">Available Credits</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">-</div>
            <div className="text-sm text-gray-600">Last Analysis</div>
          </div>
        </div>
      </div>

      {/* AI Model Costs Info */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis Costs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">GM</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">Gemini 2.0 Flash</div>
              <div className="text-sm text-gray-600">200 credits per analysis</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">GM</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">Gemini 2.5 Flash</div>
              <div className="text-sm text-gray-600">500 credits per analysis</div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Modal */}
      {showAnalyzer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Crack Analysis</h2>
              <button
                onClick={() => {
                  setShowAnalyzer(false)
                  setFiles([])
                  setDescription('')
                }}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-8">
              {/* Credits Display */}
              <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Coins className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Available Credits:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {loadingCredits ? '...' : credits?.toLocaleString() || 0}
                  </span>
                </div>
                {credits !== null && credits < 500 && (
                  <Link 
                    href="/#pricing"
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Buy More
                  </Link>
                )}
              </div>

              {/* Upload Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Images</h3>
                
                {files.length === 0 ? (
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      dragActive 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Drop images here or click to upload
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Support JPG, PNG files. Maximum 3 images.
                    </p>
                    <label className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Choose Files
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div
                    className={`border-2 border-dashed rounded-xl p-4 transition-colors ${
                      dragActive 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {files.map((file, index) => (
                        <div key={index} className="relative border border-gray-200 rounded-lg p-3">
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md mb-2"
                          />
                          <p className="text-xs text-gray-600 truncate">{file.name}</p>
                        </div>
                      ))}
                      
                      {files.length < 3 && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 flex items-center justify-center hover:border-gray-400 transition-colors">
                          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-24 text-gray-500 hover:text-gray-700">
                            <Plus className="w-6 h-6 mb-1" />
                            <span className="text-xs font-medium">Add More</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Description Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description (Optional)</h3>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the location of the cracks, when you first noticed them, or any other relevant details..."
                  className="w-full h-24 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                />
              </div>

              {/* AI Model Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model Selection</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedModel === 'gemini-2.0-flash' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedModel('gemini-2.0-flash')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Gemini 2.0 Flash</h4>
                      <div className="flex items-center space-x-1">
                        <Coins className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">200</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Fast and cost-effective analysis</p>
                  </div>

                  <div 
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedModel === 'gemini-2.5-flash' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedModel('gemini-2.5-flash')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Gemini 2.5 Flash</h4>
                      <div className="flex items-center space-x-1">
                        <Coins className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">500</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Advanced analysis with higher accuracy</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Analysis cost:</span>
                  <div className="flex items-center space-x-1">
                    <Coins className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900">{modelCosts[selectedModel]} credits</span>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowAnalyzer(false)
                      setFiles([])
                      setDescription('')
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={
                      files.length === 0 || 
                      isAnalyzing || 
                      (credits !== null && credits < modelCosts[selectedModel])
                    }
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? 'Analyzing...' : 
                     credits !== null && credits < modelCosts[selectedModel] ? 'Insufficient Credits' :
                     'Start Analysis'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}