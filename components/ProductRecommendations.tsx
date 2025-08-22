'use client'

import React, { useState, useEffect } from 'react'
import { ProductRecommendation } from '@/lib/procurement-agent'
import { shouldShowProductRecommendations, getRecommendationDisplayText } from '@/lib/procurement-utils'
import { ArrowTopRightOnSquareIcon, StarIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface ProductRecommendationsProps {
  analysisId?: string
  conversationId?: string
  crackSeverity: 'low' | 'moderate' | 'high'
  crackType?: string
  userQuery?: string
  className?: string
}

interface ProductCardProps {
  recommendation: ProductRecommendation
  onInteraction: (type: 'view' | 'click') => void
}

function ProductCard({ recommendation, onInteraction }: ProductCardProps) {
  const { product } = recommendation
  
  const handleClick = () => {
    onInteraction('click')
    // Open Amazon link in new tab
    window.open(product.url, '_blank', 'noopener,noreferrer')
  }

  const handleView = () => {
    onInteraction('view')
  }

  useEffect(() => {
    // Track view when component mounts
    handleView()
  }, [])


  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 group overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Product Image */}
        <div className="relative bg-gray-50 overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                // Show fallback div
                const fallback = target.nextElementSibling as HTMLElement
                if (fallback) {
                  fallback.style.display = 'flex'
                }
              }}
            />
          ) : null}
          
          {/* Fallback for missing or failed images */}
          <div 
            className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
            style={{ display: product.image_url ? 'none' : 'flex' }}
          >
            <div className="text-center">
              <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <span className="text-sm text-gray-500">Product Image</span>
            </div>
          </div>
          
          {/* Top Rated Badge */}
          {product.rating && product.rating >= 4.5 && (
            <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
              Top Rated
            </div>
          )}
        </div>

        <div className="p-6 flex-1 flex flex-col">
          {/* Product Title */}
          <h4 className="text-lg font-semibold text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
            {product.title}
          </h4>

          {/* Rating and Price Row */}
          <div className="flex items-center justify-between mb-4">
            {product.rating && (
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <React.Fragment key={i}>
                      {i < Math.floor(product.rating!) ? (
                        <StarIconSolid className="h-4 w-4 text-yellow-400" />
                      ) : (
                        <StarIcon className="h-4 w-4 text-gray-300" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <span className="text-sm text-gray-700 font-medium">
                  ⭐ {product.rating.toFixed(1)}/5
                </span>
              </div>
            )}
            
            {product.price && (
              <div className="text-right">
                <span className="text-2xl font-bold text-green-600">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Product Type Badge */}
          {product.product_type && (
            <div className="mb-4">
              <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium capitalize">
                {product.product_type.replace('_', ' ')}
              </span>
            </div>
          )}

          {/* Recommendation Reason */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 flex-1">
            <p className="text-sm text-gray-800 leading-relaxed">
              <span className="font-medium text-gray-900">Why recommended:</span> {recommendation.recommendation_reason}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleClick}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            <span>View on Amazon</span>
            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProductRecommendations({
  analysisId,
  conversationId,
  crackSeverity,
  crackType,
  userQuery,
  className = ''
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendationIds,] = useState<{[key: string]: string}>({})

  const shouldShow = shouldShowProductRecommendations(crackSeverity)
  const { title, subtitle } = getRecommendationDisplayText(crackSeverity)

  const fetchRecommendations = async () => {
    if (!analysisId && !userQuery) return

    setLoading(true)
    setError(null)

    try {
      const endpoint = '/api/recommendations'
      const requestData = {
        analysisId,
        conversationId,
        userQuery,
        crackSeverity,
        crackType,
        recommendationType: crackSeverity === 'low' ? 'diy_focused' : 'analysis_based'
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to get recommendations')
      }

      setRecommendations(data.recommendations || [])
    } catch (err) {
      console.error('Failed to fetch recommendations:', err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (shouldShow) {
      fetchRecommendations()
    }
  }, [analysisId, userQuery, crackSeverity, shouldShow])

  const handleProductInteraction = async (productId: string, type: 'view' | 'click') => {
    // For now, we'll track without recommendation ID since we don't have it easily accessible
    // In a more sophisticated implementation, we'd store recommendation IDs from the API response
    try {
      await fetch('/api/recommendations/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recommendationId: recommendationIds[productId] || 'unknown',
          interactionType: type
        })
      })
    } catch (error) {
      console.error('Failed to track interaction:', error)
      // Don't show error to user for tracking failures
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
        <div className="p-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-700 text-lg">{subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
                <div className="bg-gray-200 h-56"></div>
                <div className="p-6">
                  <div className="bg-gray-200 rounded h-6 mb-4"></div>
                  <div className="bg-gray-200 rounded h-4 w-3/4 mb-4"></div>
                  <div className="bg-gray-200 rounded-lg h-20 mb-4"></div>
                  <div className="bg-gray-200 rounded-lg h-12 w-full"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-gray-600 animate-pulse">Finding the best products for your repair...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-red-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Recommendations</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchRecommendations}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Don't show recommendations for high severity cracks
  if (!shouldShow) {
    return null
  }

  if (recommendations.length === 0) {
    return null // Don't show empty state
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div className="p-8">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-700 text-lg">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {recommendations.map((recommendation) => (
            <ProductCard
              key={recommendation.product.id}
              recommendation={recommendation}
              onInteraction={(type) => handleProductInteraction(recommendation.product.id, type)}
            />
          ))}
        </div>

        <div className="pt-6 border-t border-gray-200">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              AI-powered recommendations based on your crack analysis
            </p>
            <p className="text-xs text-gray-500">
              Prices and availability may vary. We may earn a commission from purchases made through these links.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}