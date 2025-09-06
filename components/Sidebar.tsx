'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  FileText, 
  Settings, 
  CreditCard, 
  Upload, 
  History, 
  Users, 
  HelpCircle,
  ChevronRight,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    description: 'Overview and analytics'
  },
  {
    id: 'analysis',
    label: 'Crack Analysis',
    icon: Upload,
    description: 'Upload and analyze images'
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileText,
    description: 'View analysis reports'
  },
  {
    id: 'history',
    label: 'History',
    icon: History,
    description: 'Analysis history'
  },
  {
    id: 'professionals',
    label: 'Professionals',
    icon: Users,
    description: 'Find experts'
  },
  {
    id: 'credits',
    label: 'Credits',
    icon: CreditCard,
    description: 'Manage your credits'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'Account preferences'
  },
  {
    id: 'help',
    label: 'Help',
    icon: HelpCircle,
    description: 'Support and documentation'
  }
]

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={`bg-notion-900 text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-notion-800">
        {!isCollapsed && (
          <h1 className="text-lg font-semibold text-white">CrackSense</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-notion-800 rounded-md transition-colors"
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${
            isCollapsed ? 'rotate-180' : ''
          }`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <div className="px-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group ${
                  isActive 
                    ? 'bg-notion-700 text-white' 
                    : 'text-notion-300 hover:bg-notion-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? 'text-accent-blue' : 'text-notion-400 group-hover:text-white'
                }`} />
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-notion-500 group-hover:text-notion-300">
                      {item.description}
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="px-3 mt-6">
            <div className="text-xs font-medium text-notion-500 uppercase tracking-wider mb-3">
              Quick Actions
            </div>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-accent-blue text-white rounded-md hover:bg-accent-blue/90 transition-colors">
              <Plus className="w-4 h-4" />
              <span className="font-medium">New Analysis</span>
            </button>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-notion-800 p-4">
        {!isCollapsed && (
          <div className="text-center">
            <div className="text-xs text-notion-500 mb-2">Powered by AI</div>
            <div className="text-xs text-notion-400">CrackSense v1.0</div>
          </div>
        )}
      </div>
    </div>
  )
}
