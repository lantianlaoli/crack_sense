'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Camera, History, Plus, Eye, Coins } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  const [credits, setCredits] = useState<number | null>(null)
  const [loadingCredits, setLoadingCredits] = useState(true)

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
        <Link 
          href="/dashboard/analyze"
          className="group block p-8 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-200"
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
        </Link>

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
              <span className="text-xs font-bold text-blue-600">GPT</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">GPT-4o Mini</div>
              <div className="text-sm text-gray-600">200 credits per analysis</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">GPT</span>
            </div>
            <div>
              <div className="font-medium text-gray-900">GPT-4o</div>
              <div className="text-sm text-gray-600">500 credits per analysis</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}