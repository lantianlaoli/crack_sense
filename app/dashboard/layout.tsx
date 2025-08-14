'use client'

import { usePathname } from 'next/navigation'
import Navigation from '@/components/Navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAnalyzePage = pathname?.startsWith('/dashboard/analyze')

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      {isAnalyzePage ? (
        <main className="w-full">
          {children}
        </main>
      ) : (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      )}
    </div>
  )
}