/**
 * Professional Finder Component - Find and connect with structural engineers
 * 
 * Automatically displayed for high-risk crack analysis results
 */

'use client'

import { useState } from 'react'
import { 
  MapPinIcon, 
  StarIcon, 
  ClockIcon, 
  ShieldCheckIcon, 
  TrophyIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Professional {
  id: number
  company_name: string
  rating: number
  review_count: number
  is_top_pro: boolean
  is_licensed: boolean
  response_time_minutes: number
  estimate_fee_amount: number
  estimate_fee_waived_if_hired: boolean
  description: string
  phone: string
  thumbtack_url?: string
  primary_city: {
    city_name: string
    state_code: string
  }
  distance?: number
}

interface ProfessionalFinderProps {
  shouldShow: boolean
  emergencyLevel: 'low' | 'medium' | 'high' | 'critical'
  message?: string
  professionals?: Professional[]
  searchParams?: {
    zipCode?: string
    maxDistance?: number
    minRating?: number
    maxResponseTime?: number
  }
  autoSearched?: boolean
  location?: {
    zipCode?: string
    hasLocation: boolean
  }
  className?: string
}

export default function ProfessionalFinder({
  shouldShow,
  emergencyLevel,
  message,
  professionals = [],
  autoSearched = false,
  location,
  className = ''
}: ProfessionalFinderProps) {

  const getEmergencyLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-50 text-red-800 border-red-200'
      case 'high': return 'bg-orange-50 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-50 text-yellow-800 border-yellow-200'
      default: return 'bg-blue-50 text-blue-800 border-blue-200'
    }
  }

  const getEmergencyIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      default:
        return <CheckCircleIcon className="h-4 w-4" />
    }
  }

  const handleContactProfessional = (professional: Professional) => {
    // Try to open Thumbtack profile, fallback to phone
    if (professional.thumbtack_url) {
      window.open(professional.thumbtack_url, '_blank')
    } else if (professional.phone) {
      window.open(`tel:${professional.phone}`, '_self')
    }
  }

  if (!shouldShow) {
    return null
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Emergency Level Alert */}
      {message && !message.includes('Based on your request, I found local structural engineers') && (
        <div className={`rounded-lg border p-4 ${getEmergencyLevelColor(emergencyLevel)}`}>
          <div className="flex items-center gap-2">
            {getEmergencyIcon(emergencyLevel)}
            <div className="font-medium">
              {message}
            </div>
          </div>
        </div>
      )}

      {/* Professional Engineers List */}
      {professionals.length > 0 && (
        <div className="space-y-3">
            {professionals.map((professional) => (
              <div key={professional.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-all duration-200 hover:border-gray-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Company Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">
                          {professional.company_name}
                        </h4>
                        <div className="flex items-center gap-1">
                          {professional.is_top_pro && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              <TrophyIcon className="h-3 w-3 mr-1" />
                              Top Pro
                            </span>
                          )}
                          {professional.is_licensed && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                              <ShieldCheckIcon className="h-3 w-3 mr-1" />
                              Licensed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Rating and Location */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      {professional.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <StarIcon className="h-4 w-4 text-amber-400 fill-current" />
                          <span className="font-medium text-gray-900">{professional.rating.toFixed(1)}</span>
                          <span className="text-gray-500">({professional.review_count} reviews)</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        <span>
                          {professional.primary_city.city_name}, {professional.primary_city.state_code}
                        </span>
                        {professional.distance && (
                          <span className="text-gray-500">
                            • {professional.distance.toFixed(1)} miles
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Service Details */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      {professional.response_time_minutes && (
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>
                            Responds in ~{Math.round(professional.response_time_minutes / 60)}h
                          </span>
                        </div>
                      )}
                      
                      {professional.estimate_fee_amount && (
                        <div className="flex items-center gap-1">
                          <CurrencyDollarIcon className="h-4 w-4" />
                          <span>
                            Estimate: ${professional.estimate_fee_amount}
                            {professional.estimate_fee_waived_if_hired && (
                              <span className="text-green-600"> (waived if hired)</span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {professional.description && (
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">
                        {professional.description}
                      </p>
                    )}

                    {/* Action Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleContactProfessional(professional)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        View Details
                        <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* No Results State */}
      {professionals.length === 0 && autoSearched && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-800 mb-1">
                No engineers found in your area
              </h3>
              <p className="text-sm text-amber-700">
                Try expanding your search radius or contact local building authorities for recommendations.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}