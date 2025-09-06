'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { FaThreads } from 'react-icons/fa6'
import DashboardSidebar from '@/components/DashboardSidebar'
import AnalysisPage from '@/components/AnalysisPage'
import AnalysisHistoryPage from '@/components/AnalysisHistoryPage'
import ToastContainer, { useToast } from '@/components/ToastContainer'

interface Analysis {
  id: string
  created_at: string
  image_urls: string[]
  user_description: string
  severity: 'low' | 'moderate' | 'high'
  ai_analysis: {
    confidence: number
    crackCount: number
    findings: any[]
    recommendations: string[]
    analysis: string
  }
  model_used: string
}

export default function Dashboard() {
  const { user } = useUser()
  const [credits, setCredits] = useState<number | null>(null)
  const [loadingCredits, setLoadingCredits] = useState(true)
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loadingAnalyses, setLoadingAnalyses] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>('google/gemini-2.0-flash-001')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentPage, setCurrentPage] = useState('analysis')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { toasts, removeToast } = useToast()

  // Fetch user credits
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
        console.error('Error fetching credits:', error)
      } finally {
        setLoadingCredits(false)
      }
    }

    fetchCredits()
  }, [user?.id])

  // Fetch user analyses
  useEffect(() => {
    const fetchAnalyses = async () => {
      if (!user?.id) return
      
      setLoadingAnalyses(true)
      try {
        const response = await fetch('/api/analyses')
        const data = await response.json()
        
        if (data.success) {
          setAnalyses(data.analyses)
        }
      } catch (error) {
        console.error('Error fetching analyses:', error)
      } finally {
        setLoadingAnalyses(false)
      }
    }

    fetchAnalyses()
  }, [user?.id])


  const renderAnalysisPage = () => {
    // Implementation for handleAnalyze function
    const handleAnalyze = async (
      files: File[], 
      description: string
    ) => {
      setIsAnalyzing(true)
      try {
        // Upload files to get URLs
        const formData = new FormData()
        files.forEach((file, index) => {
          formData.append(`file${index}`, file)
        })

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload images')
        }

        const uploadData = await uploadResponse.json()
        if (!uploadData.success) {
          throw new Error(uploadData.error || 'Upload failed')
        }

        // Perform homeowner-friendly analysis
        const analysisResponse = await fetch('/api/analyze-homeowner', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imageUrls: uploadData.urls,
            description,
            model: selectedModel
          })
        })

        if (!analysisResponse.ok) {
          const errorData = await analysisResponse.json()
          throw new Error(errorData.error || 'Analysis failed')
        }

        const analysisData = await analysisResponse.json()
        if (!analysisData.success) {
          throw new Error(analysisData.error || 'Analysis failed')
        }

        return {
          ...analysisData,
          uploadedImageUrls: uploadData.urls
        }
      } finally {
        setIsAnalyzing(false)
      }
    }

    return (
      <AnalysisPage
        credits={credits}
        loadingCredits={loadingCredits}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
      />
    )
  }

  const renderHistoryPage = () => (
    <AnalysisHistoryPage 
      onViewAnalysis={(analysisId) => {
        // TODO: Implement navigation to detailed analysis view
        console.log('View analysis:', analysisId)
      }}
    />
  )

  const renderSupportPage = () => {
    // Get contact information from environment variables
    const contactInfo = {
      twitter: process.env.NEXT_PUBLIC_X || 'https://x.com/lantianlaoli',
      linkedin: process.env.NEXT_PUBLIC_LINKEDIN || 'https://linkedin.com/company/cracksense',
      tiktok: process.env.NEXT_PUBLIC_TIKTOK || 'https://www.tiktok.com/@laolilantian',
      threads: process.env.NEXT_PUBLIC_THREADS || 'https://www.threads.com/@lantianlaoli'
    }

    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-2xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Support & Contact</h1>
            <p className="text-gray-500 text-sm">Get help and connect with our team</p>
          </div>

          {/* Contact Methods */}
          <div className="space-y-1">
            <a
              href={contactInfo.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">Twitter</div>
                <div className="text-gray-500 text-xs">Follow us for updates and announcements</div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>

            <a
              href={contactInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">LinkedIn</div>
                <div className="text-gray-500 text-xs">Connect with us professionally</div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>

            <a
              href={contactInfo.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">TikTok</div>
                <div className="text-gray-500 text-xs">Follow us for short videos and updates</div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>

            <a
              href={contactInfo.threads}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <FaThreads className="w-5 h-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">Threads</div>
                <div className="text-gray-500 text-xs">Connect with us on Meta&apos;s Threads</div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          </div>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'analysis':
        return renderAnalysisPage()
      case 'history':
        return renderHistoryPage()
      case 'support':
        return renderSupportPage()
      default:
        return renderAnalysisPage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Left Sidebar */}
      <DashboardSidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        userEmail={user?.emailAddresses?.[0]?.emailAddress}
        userImageUrl={user?.imageUrl || undefined}
        userName={user?.fullName || user?.firstName || undefined}
        credits={credits}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content with dynamic margin for sidebar */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {renderPage()}
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
