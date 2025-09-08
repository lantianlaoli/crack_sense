'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Plus, Minus, RefreshCw, Calendar, FileText } from 'lucide-react'
import { CreditTransaction } from '@/lib/supabase'

interface CreditsHistoryPageProps {
  userId?: string
}

export default function CreditsHistoryPage({ userId }: CreditsHistoryPageProps) {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (!userId) return

      try {
        setLoading(true)
        const response = await fetch('/api/credits/history')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch credit history')
        }

        if (data.success) {
          setTransactions(data.transactions)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transaction history'
        setError(errorMessage)
        console.error('Error fetching credit history:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactionHistory()
  }, [userId])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'add':
        return <Plus className="w-4 h-4 text-green-600" />
      case 'deduct':
        return <Minus className="w-4 h-4 text-red-600" />
      case 'refund':
        return <RefreshCw className="w-4 h-4 text-blue-600" />
      case 'initial':
        return <CreditCard className="w-4 h-4 text-purple-600" />
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'add':
        return 'text-green-600'
      case 'deduct':
        return 'text-red-600'
      case 'refund':
        return 'text-blue-600'
      case 'initial':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Credits History</h1>
            <p className="text-gray-500 text-sm">View your credit transaction history</p>
          </div>
          
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mr-3" />
            <span className="text-gray-500">Loading credits history...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Credits History</h1>
            <p className="text-gray-500 text-sm">View your credit transaction history</p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 font-medium">Loading Failed</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Credits History</h1>
          <p className="text-gray-500 text-sm">View your credit transaction history</p>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Credit Records</h3>
            <p className="text-gray-500">Start using CrackSense for analysis and your credit history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTransactionIcon(transaction.transaction_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.description}
                      </p>
                      {transaction.model_used && (
                        <p className="text-xs text-gray-500 mt-1">
                          Model: {transaction.model_used}
                        </p>
                      )}
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(transaction.created_at)}
                        {transaction.related_analysis_id && (
                          <>
                            <FileText className="w-3 h-3 ml-3 mr-1" />
                            <span>Analysis ID: {transaction.related_analysis_id.slice(0, 8)}...</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`flex-shrink-0 text-right ${getTransactionColor(transaction.transaction_type)}`}>
                    <div className="text-lg font-semibold">
                      {transaction.transaction_type === 'add' || transaction.transaction_type === 'refund' ? '+' : '-'}
                      {Math.abs(transaction.amount)}
                    </div>
                    <div className="text-xs">credits</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-blue-600 mr-3 mt-0.5">ℹ️</div>
            <div>
              <h3 className="text-blue-800 font-medium text-sm">Credit Usage Information</h3>
              <p className="text-blue-600 text-xs mt-1">
                Credits are only charged when exporting PDF reports. AI analysis and chat features are free to use. Re-exporting the same analysis won&apos;t charge credits again.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}