'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { isAdmin } from '@/lib/admin'

export default function AdminButton() {
  const { user } = useUser()

  if (!isAdmin(user)) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Link 
        href="/admin"
        className="bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors shadow-lg border border-gray-700"
      >
        Admin
      </Link>
    </div>
  )
}
