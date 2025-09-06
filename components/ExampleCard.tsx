import Image from 'next/image'
import { Calendar, AlertTriangle, CheckCircle, Info, Eye } from 'lucide-react'

interface ExampleAnalysis {
  id: string
  title: string
  description: string
  severity: 'low' | 'moderate' | 'high'
  crack_type: string
  image_url: string
  analysis_summary: string
  created_at: string
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
      className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group ${className}`}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityColor(example.severity)}`}>
            {getSeverityIcon(example.severity)}
            <span className="ml-1 capitalize">{example.severity} Risk</span>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="mb-4">
        <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={example.image_url}
            alt={example.title}
            fill
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {example.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-3 mb-2">
          {example.description}
        </p>
        <div className="text-xs text-gray-500 mb-2">
          <span className="font-medium">Type:</span> {example.crack_type}
        </div>
        <p className="text-sm text-gray-700 line-clamp-2">
          {example.analysis_summary}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDate(example.created_at)}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4 border-t border-gray-100">
        <button className="w-full flex items-center justify-center text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors group-hover:text-gray-700">
          <Eye className="w-4 h-4 mr-2" />
          View Analysis Details
        </button>
      </div>
    </div>
  )
}