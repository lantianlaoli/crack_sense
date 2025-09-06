'use client'

import { BarChart3, TrendingUp, FileText, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

interface DashboardOverviewProps {
  analyses: any[]
  credits: number | null
}

export default function DashboardOverview({ analyses, credits }: DashboardOverviewProps) {
  const totalAnalyses = analyses.length
  const recentAnalyses = analyses.slice(0, 5)
  const highSeverityCount = analyses.filter(a => a.severity === 'high').length
  const moderateSeverityCount = analyses.filter(a => a.severity === 'moderate').length
  const lowSeverityCount = analyses.filter(a => a.severity === 'low').length

  const stats = [
    {
      label: 'Total Analyses',
      value: totalAnalyses,
      icon: FileText,
      color: 'text-accent-blue',
      bgColor: 'bg-accent-blue/10'
    },
    {
      label: 'High Severity',
      value: highSeverityCount,
      icon: AlertTriangle,
      color: 'text-accent-red',
      bgColor: 'bg-accent-red/10'
    },
    {
      label: 'Moderate Severity',
      value: moderateSeverityCount,
      icon: Clock,
      color: 'text-accent-yellow',
      bgColor: 'bg-accent-yellow/10'
    },
    {
      label: 'Low Severity',
      value: lowSeverityCount,
      icon: CheckCircle,
      color: 'text-accent-green',
      bgColor: 'bg-accent-green/10'
    }
  ]

  return (
    <div className="flex-1 bg-notion-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-notion-900 mb-2">Dashboard Overview</h1>
          <p className="text-notion-600">Monitor your crack analysis activities and insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-lg border border-notion-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-notion-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-notion-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Credits Card */}
        <div className="bg-white rounded-lg border border-notion-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-notion-900 mb-2">Credits Balance</h2>
              <p className="text-notion-600">Manage your analysis credits</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-accent-blue">{credits || 0}</div>
              <p className="text-sm text-notion-500">credits available</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors">
              Buy Credits
            </button>
            <button className="px-4 py-2 bg-notion-100 text-notion-700 rounded-lg hover:bg-notion-200 transition-colors">
              View History
            </button>
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="bg-white rounded-lg border border-notion-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-notion-900">Recent Analyses</h2>
            <button className="text-accent-blue hover:text-accent-blue/80 transition-colors">
              View All
            </button>
          </div>
          
          {recentAnalyses.length > 0 ? (
            <div className="space-y-4">
              {recentAnalyses.map((analysis, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-notion-50 rounded-lg border border-notion-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-notion-200 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-notion-600" />
                    </div>
                    <div>
                      <p className="font-medium text-notion-900">
                        Analysis #{analysis.id.slice(-8)}
                      </p>
                      <p className="text-sm text-notion-500">
                        {new Date(analysis.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      analysis.severity === 'low' ? 'bg-accent-green/10 text-accent-green' :
                      analysis.severity === 'moderate' ? 'bg-accent-yellow/10 text-accent-yellow' :
                      'bg-accent-red/10 text-accent-red'
                    }`}>
                      {analysis.severity === 'low' ? 'Low' : 
                       analysis.severity === 'moderate' ? 'Moderate' : 'High'}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-notion-900">
                        {analysis.ai_analysis.confidence}%
                      </div>
                      <div className="text-xs text-notion-500">confidence</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-notion-400 mb-4" />
              <h3 className="text-lg font-medium text-notion-900 mb-2">No analyses yet</h3>
              <p className="text-notion-500">Start your first crack analysis to see results here</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-lg border border-notion-200 p-6">
            <h3 className="text-lg font-semibold text-notion-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors">
                <BarChart3 className="w-5 h-5" />
                New Analysis
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-notion-100 text-notion-700 rounded-lg hover:bg-notion-200 transition-colors">
                <TrendingUp className="w-5 h-5" />
                View Reports
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-notion-200 p-6">
            <h3 className="text-lg font-semibold text-notion-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-notion-600">AI Analysis Service</span>
                <span className="px-2 py-1 bg-accent-green/10 text-accent-green text-xs rounded-full">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-notion-600">Image Processing</span>
                <span className="px-2 py-1 bg-accent-green/10 text-accent-green text-xs rounded-full">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-notion-600">Database</span>
                <span className="px-2 py-1 bg-accent-green/10 text-accent-green text-xs rounded-full">
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
