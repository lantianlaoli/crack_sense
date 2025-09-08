'use client'

import { useState } from 'react'
import { Camera, X, Upload, FileText, AlertCircle, ArrowLeft, Home, RefreshCw, Eye, Download, Coins } from 'lucide-react'
import AnalysisResults from './AnalysisResults'
import { HomeownerCrackAnalysis } from '@/lib/types'
import { useToast } from './ToastContainer'
import { generatePDFReport, convertToPDFData } from '@/lib/pdf-utils'
import { getCreditCost } from '@/lib/constants'

interface AnalysisPageProps {
  credits: number | null
  loadingCredits: boolean
  onAnalyze: (files: File[], description: string) => Promise<{
    success: boolean
    analysis: HomeownerCrackAnalysis
    analysisId: string
    modelUsed: string
    creditsRequired: number
    uploadedImageUrls: string[]
  }>
  isAnalyzing: boolean
}

export default function AnalysisPage({ 
  credits, 
  loadingCredits, 
  onAnalyze, 
  isAnalyzing 
}: AnalysisPageProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<HomeownerCrackAnalysis | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [modelUsed, setModelUsed] = useState<string | null>(null)

  const [analysisStep, setAnalysisStep] = useState<'idle' | 'expanding' | 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'step6' | 'complete'>('idle')
  const [textVisible, setTextVisible] = useState(true)
  const [isCheckingProcessedImages, setIsCheckingProcessedImages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageKey, setImageKey] = useState(0)
  const { showError, showSuccess } = useToast()

  // Function to check for processed images
  const checkForProcessedImages = async (analysisId: string, maxAttempts: number = 15) => {
    setIsCheckingProcessedImages(true)
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`/api/analyses/${analysisId}`)
        if (response.ok) {
          const updatedAnalysis = await response.json()
          console.log('API Response received:', updatedAnalysis)
          console.log('processed_images in response:', updatedAnalysis.processed_images)
          if (updatedAnalysis.processed_images && updatedAnalysis.processed_images.length > 0) {
            // Only update processed_images, preserve all other analysis data
            setAnalysisResult(prev => {
              const newState = prev ? {
                ...prev,
                processed_images: updatedAnalysis.processed_images
              } : updatedAnalysis
              console.log('Updating analysisResult with processed images:', newState.processed_images)
              console.log('Previous state had processed images:', prev?.processed_images)
              return newState
            })
            setIsCheckingProcessedImages(false)
            setImageKey(prev => prev + 1) // Force image re-render
            showSuccess('Image Enhanced', 'AR measurements and overlays have been added to your crack analysis!')
            console.log('Processed images loaded:', updatedAnalysis.processed_images)
            console.log('Original analysis data preserved')
            return
          } else {
            console.log('No processed_images found in response yet, attempt:', attempt + 1)
          }
        } else {
          console.error('Non-200 response from API:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error checking for processed images:', error)
      }
      
      // Wait 2 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    setIsCheckingProcessedImages(false)
    console.log('Processed images check timeout')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      setFiles([selectedFiles[0]]) // Only keep the first file
      setAnalysisStep('idle') // Reset analysis step when switching photos
      setTextVisible(true) // Reset text visibility
    }
    setError(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'))
    if (imageFiles.length > 0) {
      setFiles([imageFiles[0]]) // Only keep the first file
      setAnalysisStep('idle') // Reset analysis step when dropping new photos
      setTextVisible(true) // Reset text visibility
    }
    setError(null)
  }

  const removeFile = () => {
    setFiles([])
    setAnalysisStep('idle')
    setTextVisible(true)
  }

  const handleAnalyze = async () => {
    if (files.length === 0) {
      showError('Upload Required', 'Please upload at least one crack image to get started.')
      return
    }
    
    try {
      // Start the animation sequence
      setAnalysisStep('expanding')
      
      // Create object URLs for the images to display in results
      const urls = files.map(file => URL.createObjectURL(file))
      setImageUrls(urls)
      
      // Start actual analysis in parallel with animation
      const analysisPromise = onAnalyze(files, '')
      
      // Animation sequence that runs in parallel with API call
      const animationSequence = async () => {
        // Step 1: Initial analysis (after expansion animation)
        await new Promise(resolve => setTimeout(resolve, 2000))
        setTextVisible(false)
        await new Promise(resolve => setTimeout(resolve, 250))
        setAnalysisStep('step1')
        setTextVisible(true)
        
        // Step 2: Deep pattern recognition
        await new Promise(resolve => setTimeout(resolve, 2500))
        setTextVisible(false)
        await new Promise(resolve => setTimeout(resolve, 250))
        setAnalysisStep('step2')
        setTextVisible(true)
        
        // Step 3: Precise measurements
        await new Promise(resolve => setTimeout(resolve, 2500))
        setTextVisible(false)
        await new Promise(resolve => setTimeout(resolve, 250))
        setAnalysisStep('step3')
        setTextVisible(true)
        
        // Step 4: Risk assessment
        await new Promise(resolve => setTimeout(resolve, 2500))
        setTextVisible(false)
        await new Promise(resolve => setTimeout(resolve, 250))
        setAnalysisStep('step4')
        setTextVisible(true)
        
        // Step 5: Professional recommendations
        await new Promise(resolve => setTimeout(resolve, 2500))
        setTextVisible(false)
        await new Promise(resolve => setTimeout(resolve, 250))
        setAnalysisStep('step5')
        setTextVisible(true)
        
        // Step 6: Finalizing your report
        await new Promise(resolve => setTimeout(resolve, 2500))
        setTextVisible(false)
        await new Promise(resolve => setTimeout(resolve, 250))
        setAnalysisStep('step6')
        setTextVisible(true)
        
        // Keep showing step 6 until API completes
        await new Promise(resolve => setTimeout(resolve, 2000))
        setTextVisible(false)
        await new Promise(resolve => setTimeout(resolve, 250))
        setAnalysisStep('step6')
        setTextVisible(true)
      }
      
      // Run animation and API call in parallel
      const [, apiResult] = await Promise.all([animationSequence(), analysisPromise])
      
      // Show completion immediately when API is done
      console.log('Full API result:', apiResult)
      console.log('Setting analysis result:', apiResult.analysis)
      console.log('Analysis result type:', typeof apiResult.analysis)
      console.log('Analysis result keys:', apiResult.analysis ? Object.keys(apiResult.analysis) : 'null')
      
      if (apiResult.analysis) {
        setAnalysisResult(apiResult.analysis)
        setAnalysisId(apiResult.analysisId)
        setModelUsed(apiResult.modelUsed)
        setAnalysisStep('complete')
        showSuccess('Analysis Complete', 'Your crack analysis report is ready!')
        
        // Start checking for processed images if analysisId is available
        if (apiResult.analysisId) {
          checkForProcessedImages(apiResult.analysisId)
        }
      } else {
        console.error('No analysis data in API response')
        throw new Error('No analysis data received')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed. Please try again.'
      showError('Analysis Failed', errorMessage)
      setAnalysisStep('idle')
      setTextVisible(true)
      // Clean up object URLs on error
      imageUrls.forEach(url => URL.revokeObjectURL(url))
      setImageUrls([])
    }
  }




  const handleStartNew = () => {
    // Clean up object URLs
    imageUrls.forEach(url => URL.revokeObjectURL(url))
    
    // Reset state
    setFiles([])
    setAnalysisResult(null)
    setImageUrls([])
    setIsExportingPDF(false)
    setAnalysisId(null)
    setModelUsed(null)
    setError(null)
    setAnalysisStep('idle')
    setTextVisible(true)
    setImageKey(0)
    setIsCheckingProcessedImages(false)
  }

  const handleExportPDF = async () => {
    if (!analysisResult || !analysisId) {
      showError('Export Failed', 'No analysis data available for export')
      return
    }

    try {
      setIsExportingPDF(true)
      
      // Call the new PDF export API that handles credit deduction
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analysisId
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to export PDF')
      }

      if (result.alreadyExported) {
        showSuccess('Export Ready', 'PDF was already exported for this analysis. Generating download...')
      } else {
        showSuccess('Export Complete', `PDF exported successfully! ${result.creditsCharged} credits charged. ${result.remainingCredits} credits remaining.`)
      }

      // Now generate and download the actual PDF file
      const exportImageUrls = analysisResult.processed_images && analysisResult.processed_images.length > 0 
        ? analysisResult.processed_images
        : imageUrls

      const pdfData = convertToPDFData(analysisResult, exportImageUrls)
      generatePDFReport(pdfData)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export PDF report'
      showError('Export Failed', errorMessage)
    } finally {
      setIsExportingPDF(false)
    }
  }

  const canAnalyze = files.length > 0 && !isAnalyzing && credits && credits >= 15
  
  // Calculate credit cost for PDF export based on model used
  const pdfExportCredits = modelUsed ? getCreditCost(modelUsed as 'google/gemini-2.0-flash-001' | 'google/gemini-2.5-flash' | 'anthropic/claude-sonnet-4') : 15

  // Show integrated image and results layout
  if (analysisResult) {
    console.log('Rendering analysis results with:', { 
      analysisResult, 
      imageUrls: imageUrls.length,
      files: files.length
    })
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="p-8 pb-4">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-gray-900" />
              <h1 className="text-3xl font-bold text-gray-900">Analysis complete. Take a look.</h1>
            </div>
          </div>

          {/* Main Content with Sidebar */}
          <div className="px-8 pb-8">
            <div className="flex gap-6">
              {/* Main Content Area */}
              <div className="flex-1">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Image Section */}
                  <div className="p-4 relative">
                    <div className="w-full h-80 bg-gray-50 rounded-lg overflow-hidden relative">
                      <img
                        key={`analysis-image-${imageKey}`}
                        src={
                          (analysisResult?.processed_images && analysisResult.processed_images[0]) ||
                          URL.createObjectURL(files[0])
                        }
                        alt="Crack analysis with AR overlay"
                        className={`w-full h-full object-cover transition-all duration-1000 ${
                          isCheckingProcessedImages && !(analysisResult?.processed_images && analysisResult.processed_images.length > 0) 
                            ? 'blur-sm' 
                            : ''
                        }`}
                        onLoad={() => console.log('Image loaded:', (analysisResult?.processed_images && analysisResult.processed_images[0]) || 'original image')}
                      />
                      
                      {/* AR Processing Status - Full Overlay with Center Indicator */}
                      {isCheckingProcessedImages && !(analysisResult?.processed_images && analysisResult.processed_images.length > 0) && (
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <div className="bg-white rounded-xl shadow-lg px-8 py-6 flex flex-col items-center gap-4 max-w-xs text-center">
                            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">Enhancing Image</h3>
                              <p className="text-sm text-gray-600">Adding AR-style measurements and overlays...</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Analysis Results - Seamlessly integrated */}
                  <div className="transition-all duration-1000 ease-in-out">
                    <AnalysisResults
                      analysis={analysisResult}
                      imageUrls={
                        analysisResult.processed_images && analysisResult.processed_images.length > 0 
                          ? analysisResult.processed_images
                          : imageUrls
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Fixed Action Buttons Sidebar */}
              <div className="w-64 flex-shrink-0">
                <div className="sticky top-8 space-y-4">

                  <button
                    onClick={handleStartNew}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-lg"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Continue Detection
                  </button>

                  <button
                    onClick={handleExportPDF}
                    disabled={isExportingPDF}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white border border-gray-900 rounded-lg hover:bg-gray-800 transition-colors font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExportingPDF ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Exporting PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Export PDF Report</span>
                        <div className="flex items-center gap-1 text-yellow-300">
                          <Coins className="w-3 h-3" />
                          <span className="text-xs">{pdfExportCredits}</span>
                        </div>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show upload interface
  return (
    <div className="bg-gray-50 p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your home deserves peace of mind — start with a photo</h1>
        </div>




        {/* Upload Area */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="block cursor-pointer"
          >
            <div
              className={`transition-colors ${
                files.length > 0 
                  ? 'aspect-[16/9] max-h-[32rem]' 
                  : `aspect-[16/9] max-h-[32rem] border-4 border-dashed ${
                      dragActive 
                        ? 'border-gray-600 bg-gray-50' 
                        : 'border-gray-500 hover:border-gray-600 hover:bg-gray-50'
                    }`
              }`}
              onDragEnter={(e) => {
                e.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setDragActive(false)
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {files.length > 0 ? (
                // Show uploaded image
                <div className="w-full h-full">
                  <img
                    src={URL.createObjectURL(files[0])}
                    alt="Uploaded crack photo"
                    className="w-full h-full object-contain bg-gray-50 rounded-lg"
                  />
                </div>
              ) : (
                // Show upload prompt
                <div className="flex flex-col items-center justify-center gap-6 h-full">
                  <Camera className="w-16 h-16 text-gray-500" />
                  <div className="text-center">
                    <p className="text-xl font-medium text-gray-900">
                      Drag your crack photo here — like showing a friend.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </label>

          {/* Action Buttons */}
          {files.length > 0 && (
            <div className="p-4 bg-gray-50">
              <div className={`flex h-[3.5rem] items-stretch transition-all duration-1000 ease-in-out ${
                analysisStep === 'idle' || analysisStep === 'complete' ? 'gap-4' : 'gap-0'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload-switch"
                />
                <label
                  htmlFor="file-upload-switch"
                  className={`flex items-center justify-center gap-2 rounded-lg font-medium bg-gray-900 text-white hover:bg-gray-800 cursor-pointer transition-all duration-1000 ease-in-out h-full ${
                    analysisStep === 'idle' || analysisStep === 'complete' 
                      ? 'flex-1' 
                      : 'w-0 opacity-0 overflow-hidden'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Switch Photo
                </label>
                <button
                  onClick={handleAnalyze}
                  disabled={!canAnalyze || (analysisStep !== 'idle' && analysisStep !== 'complete')}
                  className={`flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-1000 ease-in-out flex-1 h-full ${
                    analysisStep === 'expanding' || analysisStep === 'step1' || analysisStep === 'step2' || analysisStep === 'step3' || analysisStep === 'step4' || analysisStep === 'step5' || analysisStep === 'step6'
                      ? 'bg-gray-900 text-white cursor-pointer'
                      : canAnalyze
                        ? 'bg-gray-900 text-white hover:bg-gray-800 cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {analysisStep === 'idle' || analysisStep === 'complete' ? (
                    <>
                      <FileText className="w-4 h-4" />
                      {isAnalyzing ? 'Getting your report...' : 'Get My Report'}
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span className={`transition-all duration-300 ease-in-out ${
                        textVisible ? 'opacity-100' : 'opacity-0'
                      }`}>
                        {analysisStep === 'expanding' && 'Initializing analysis...'}
                        {analysisStep === 'step1' && 'Processing image data...'}
                        {analysisStep === 'step2' && 'Analyzing crack patterns...'}
                        {analysisStep === 'step3' && 'Measuring dimensions...'}
                        {analysisStep === 'step4' && 'Assessing structural impact...'}
                        {analysisStep === 'step5' && 'Generating recommendations...'}
                        {analysisStep === 'step6' && 'Finalizing report...'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  )
}