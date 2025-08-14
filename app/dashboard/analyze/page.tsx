'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Upload, X, Camera, Plus } from 'lucide-react'
import Image from 'next/image'

export default function AnalyzePage() {
  const { user } = useUser()
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [description, setDescription] = useState('')

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
        }),
      })

      if (!analysisResponse.ok) {
        throw new Error('Analysis failed')
      }

      const { analysis } = await analysisResponse.json()

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
      router.push(`/dashboard/analyze/result?id=${crack.id}`)
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="bg-white">
      {/* Main Content - Left Right Layout */}
      <div className="w-full">
        <div className="grid lg:grid-cols-2 min-h-[calc(100vh-80px)]">
          {/* Left Side - Content */}
          <div className="bg-white px-16 py-20 flex flex-col justify-center">
            <div>
              <h2 className="text-6xl font-bold text-black mb-6 leading-tight">
                We'd Love to<br />Hear From You
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Reach out to us through the form below, and we'll get back to you as soon as possible.
              </p>
              <p className="text-lg text-gray-600">
                Prefer email? Reach us directly at{' '}
                <a 
                  href="mailto:lantianlaoli@gmail.com" 
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  lantianlaoli@gmail.com
                </a>
              </p>
            </div>

            {/* Illustration */}
            <div className="mt-12">
              <Image
                src="/illustrations/analysis.png"
                alt="Analysis illustration"
                width={400}
                height={300}
                className="w-full max-w-md h-auto"
              />
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="bg-white px-16 py-20 flex items-center justify-center">
            <div className="w-full max-w-2xl">
              {/* Form Container with Gray Background */}
              <div className="bg-gray-50 rounded-3xl p-12 space-y-10">
                {/* Upload Section */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Upload Images</h3>
                
                  {/* File Upload Area */}
                  {files.length === 0 ? (
                    <div
                      className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors bg-white ${
                        dragActive 
                          ? 'border-blue-400 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-medium text-gray-900 mb-3">
                      Drop images here or click to upload
                    </h4>
                    <p className="text-gray-600 mb-6">
                      Support JPG, PNG files. Maximum 3 images.
                    </p>
                    <label className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors cursor-pointer">
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
                    className={`border-2 border-dashed rounded-2xl p-6 transition-colors ${
                      dragActive 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                      {files.map((file, index) => (
                        <div key={index} className="relative border border-gray-200 rounded-2xl p-4">
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-36 object-cover rounded-xl mb-3"
                          />
                          <p className="text-sm text-gray-600 truncate">{file.name}</p>
                        </div>
                      ))}
                      
                      {/* Add More Button */}
                      {files.length < 3 && (
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 flex items-center justify-center hover:border-gray-400 transition-colors">
                          <label className="cursor-pointer flex flex-col items-center justify-center w-full h-36 text-gray-500 hover:text-gray-700">
                            <Plus className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">Add More</span>
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
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Description (Optional)</h3>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the location of the cracks, when you first noticed them, or any other relevant details..."
                    className="w-full h-32 p-4 bg-white border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-2">
                  <button
                    onClick={handleAnalyze}
                    disabled={files.length === 0 || isAnalyzing}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}