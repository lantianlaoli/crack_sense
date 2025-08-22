import Image from 'next/image'
import Link from 'next/link'
import { CrackRecord } from '@/lib/supabase'

interface ExampleCardProps {
  crack: CrackRecord
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
  const previewImage = crack.image_urls[0] || '/images/placeholder-crack.jpg'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden group">
      {/* Risk Level Badge */}
      <div className="p-6 pb-4">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm ${
          crack.risk_level === 'high' ? 'bg-red-50 border-red-200 text-red-700' : 
          crack.risk_level === 'moderate' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 
          'bg-green-50 border-green-200 text-green-700'
        } mb-4`}>
          <div className={`w-2 h-2 rounded-full ${
            crack.risk_level === 'high' ? 'bg-red-500' : 
            crack.risk_level === 'moderate' ? 'bg-yellow-500' : 
            'bg-green-500'
          }`}></div>
          <span className="text-sm font-medium">
            {crack.risk_level ? crack.risk_level.charAt(0).toUpperCase() + crack.risk_level.slice(1) : 'Unknown'} Risk
          </span>
        </div>
      </div>

      {/* Image */}
      <div className="px-6 pb-6">
        <div className="relative h-48 bg-gray-900 rounded-xl overflow-hidden border-4 border-gray-900 group-hover:scale-105 transition-transform duration-300">
          <Image
            src={previewImage}
            alt={`Crack analysis example`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6">
        {/* Case Title */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {displayName} Case
          </h3>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          {crack.description}
        </p>

        {/* Access Button */}
        <Link 
          href={`/examples/${crack.id}`}
          className="inline-flex items-center justify-center w-full bg-black text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
        >
          View Analysis
          <div className="ml-2 relative w-4 h-4">
            {/* Original single arrow */}
            <svg className="w-4 h-4 absolute inset-0 group-hover:translate-x-full group-hover:opacity-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {/* New double arrow that slides in from right */}
            <svg className="w-4 h-4 absolute inset-0 translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 7l5 5-5 5" />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  )
}