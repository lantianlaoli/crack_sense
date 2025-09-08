'use client'

import { useState } from 'react'
import { 
  Home, 
  History, 
  ChevronRight,
  ChevronDown,
  Plus,
  Handshake,
  Coins,
  Crown,
  Zap,
  Gauge,
  User,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Logo from './Logo'
import UserProfile from './UserProfile'
import CreditsCard from './CreditsCard'
import ModelSelector from './ModelSelector'

interface DashboardSidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  userEmail?: string
  userImageUrl?: string
  userName?: string
  credits?: number | null
  selectedModel?: string
  onModelChange?: (model: string) => void
  onCollapsedChange?: (collapsed: boolean) => void
}

const navigationItems = [
  {
    id: 'analysis',
    label: 'Check My Home',
    icon: Home
  },
  {
    id: 'history',
    label: 'Past Reports',
    icon: History
  },
  {
    id: 'credits',
    label: 'Credits History',
    icon: CreditCard
  }
]



export default function DashboardSidebar({ 
  currentPage, 
  onPageChange, 
  userEmail,
  userImageUrl,
  userName,
  credits,
  selectedModel = 'google/gemini-2.0-flash-001',
  onModelChange,
  onCollapsedChange
}: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  return (
    <div className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col z-30 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!isCollapsed ? (
          <Logo size="md" />
        ) : (
          <Logo size="sm" showText={false} />
        )}
        <button
          onClick={() => {
            const newCollapsed = !isCollapsed
            setIsCollapsed(newCollapsed)
            onCollapsedChange?.(newCollapsed)
          }}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Toggle sidebar"
        >
          <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${
            isCollapsed ? 'rotate-180' : ''
          }`} />
        </button>
      </div>

      {/* User Profile Section */}
      <UserProfile 
        userName={userName}
        userEmail={userEmail}
        userImageUrl={userImageUrl}
        isCollapsed={isCollapsed}
      />

      {/* Credits Card */}
      <CreditsCard 
        credits={credits}
        isCollapsed={isCollapsed}
      />

      {/* AI Model Selector */}
      <ModelSelector 
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        isCollapsed={isCollapsed}
      />

      {/* Main Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-colors ${
                  isActive 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-gray-500'
                }`} />
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{item.label}</div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 p-3 space-y-1 flex-shrink-0">
        {/* Talk to Us */}
        <button
          onClick={() => onPageChange('support')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-colors ${
            currentPage === 'support' 
              ? 'bg-gray-900 text-white' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Handshake className={`w-4 h-4 ${
            currentPage === 'support' ? 'text-white' : 'text-gray-500'
          }`} />
          {!isCollapsed && <span className="font-medium">Talk to Us</span>}
        </button>
        
        {/* Home Lobby */}
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded transition-colors"
        >
          <Home className="w-4 h-4 text-gray-500" />
          {!isCollapsed && <span className="font-medium">Home Lobby</span>}
        </Link>
      </div>
    </div>
  )
}
