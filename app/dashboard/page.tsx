'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Camera, History, Plus, Eye } from 'lucide-react'

export default function Dashboard() {
  const { user } = useUser()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName || 'User'}
        </h1>
        <p className="text-gray-600">
          Analyze wall cracks and track your property's condition over time.
        </p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Total Analyses</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">High Risk Cracks</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">-</div>
            <div className="text-sm text-gray-600">Last Analysis</div>
          </div>
        </div>
      </div>
    </div>
  )
}