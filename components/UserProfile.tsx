'use client'

import Image from 'next/image'
import { User } from 'lucide-react'

interface UserProfileProps {
  userName?: string
  userEmail?: string
  userImageUrl?: string
  isCollapsed?: boolean
}

export default function UserProfile({ 
  userName, 
  userEmail, 
  userImageUrl, 
  isCollapsed = false 
}: UserProfileProps) {
  const displayName = userName || userEmail || 'User'
  const initials = displayName.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-200">
      {/* Avatar */}
      <div className="relative">
        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center overflow-hidden border border-gray-300">
          {userImageUrl ? (
            <Image 
              src={userImageUrl} 
              alt="User Avatar" 
              width={32} 
              height={32} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">
              {initials}
            </div>
          )}
        </div>
        {/* Online indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></div>
      </div>
      
      {/* User Info */}
      {!isCollapsed && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {displayName}
          </p>
          <p className="text-xs text-gray-600 truncate">
            {userEmail && userName ? userEmail : 'Active now'}
          </p>
        </div>
      )}
    </div>
  )
}
