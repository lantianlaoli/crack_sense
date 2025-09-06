'use client'

import { Plus, Coins } from 'lucide-react'
import Link from 'next/link'

interface CreditsCardProps {
  credits?: number | null
  isCollapsed?: boolean
}

export default function CreditsCard({ credits = 0, isCollapsed = false }: CreditsCardProps) {
  if (isCollapsed) {
    return (
      <div className="flex justify-center p-2">
        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center border border-gray-300">
          <Coins className="w-4 h-4 text-gray-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-3 mb-3">
      <div className="bg-white border border-gray-200 rounded p-3 hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center border border-gray-300">
              <Coins className="w-3.5 h-3.5 text-gray-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">{credits}</div>
              <div className="text-xs text-gray-600">credits</div>
            </div>
          </div>
          <Link
            href="/pricing"
            className="w-6 h-6 bg-gray-900 text-white rounded flex items-center justify-center hover:bg-gray-800 transition-colors"
            title="Buy Credits"
          >
            <Plus className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
