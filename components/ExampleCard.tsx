import Image from 'next/image'
import { Calendar, AlertTriangle, CheckCircle, Info, Eye } from 'lucide-react'

interface ExampleAnalysis {
  id: string
  title: string
  description: string
  severity: 'low' | 'moderate' | 'high'
  crack_type: string
  crack_width?: string
  crack_length?: string
  image_url: string
  analysis_summary: string
  created_at: string
  crack_cause: string
  repair_steps: string[]
}

interface ExampleCardProps {
  example: ExampleAnalysis
  onViewDetails?: (example: ExampleAnalysis) => void
  className?: string
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'moderate':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'high':
      return <AlertTriangle className="w-4 h-4" />
    case 'moderate':
      return <Info className="w-4 h-4" />
    case 'low':
      return <CheckCircle className="w-4 h-4" />
    default:
      return <Info className="w-4 h-4" />
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function ExampleCard({ example, onViewDetails, className = '' }: ExampleCardProps) {
  const handleClick = () => {
    onViewDetails?.(example)
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group ${className}`}
      onClick={handleClick}
    >
      {/* Image Section - First like in reference */}
      <div className="relative aspect-[4/3] bg-gray-50">
        <Image
          src={example.image_url}
          alt={example.title}
          fill
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Tags Section - Second like price/top selling in reference */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2 mb-4">
          {/* Severity Tag - Same size as other tags */}
          <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getSeverityColor(example.severity)}`}>
            {getSeverityIcon(example.severity)}
            <span className="ml-1 uppercase tracking-wide">{example.severity}</span>
          </div>
          
          {/* Dimensions Tags - Same size as severity tag */}
          <div className="flex items-center gap-2">
            {example.crack_width && (
              <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border">
                W: {example.crack_width}
              </div>
            )}
            {example.crack_length && (
              <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border">
                L: {example.crack_length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section - Third like Notionary title/description */}
      <div className="px-4 pb-4">
        {/* Title - Similar to "Notionary" */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
          {example.crack_type || 'Crack Analysis'}
        </h3>
        
        {/* Description - Similar to "An all-in-one..." */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {example.description}
        </p>

        {/* Action Button - Similar to "View Template" */}
        <button className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg py-3 text-gray-900 font-medium text-sm transition-colors group-hover:bg-gray-100">
          View Analysis Details
        </button>
      </div>
    </div>
  )
}