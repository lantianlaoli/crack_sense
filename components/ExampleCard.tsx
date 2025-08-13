import Image from 'next/image'
import Link from 'next/link'
import { CrackRecord } from '@/lib/supabase'

interface ExampleCardProps {
  crack: CrackRecord
}

function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel?.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getUserDisplayName(userId: string): string {
  if (userId.includes('@')) {
    // Extract domain from email for display
    const domain = userId.split('@')[1]
    return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
  }
  return 'Anonymous User'
}

export default function ExampleCard({ crack }: ExampleCardProps) {
  const displayName = getUserDisplayName(crack.user_id)
  const riskColorClass = getRiskLevelColor(crack.risk_level)
  const previewImage = crack.image_urls[0] || '/images/placeholder-crack.jpg'

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        <Image
          src={previewImage}
          alt={`Crack analysis example`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Risk Level Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${riskColorClass}`}>
            {crack.risk_level || 'Unknown'} Risk
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* User Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {displayName}
        </h3>

        {/* Description (truncated) */}
        <p className="text-gray-600 text-sm mb-4 truncate">
          {crack.description}
        </p>

        {/* AI Notes Preview */}
        {crack.ai_notes && (
          <p className="text-xs text-gray-500 mb-4 overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            AI Analysis: {crack.ai_notes}
          </p>
        )}

        {/* Date */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">
            {new Date(crack.created_at).toLocaleDateString()}
          </span>
          
          <Link 
            href={`/example/${crack.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  )
}