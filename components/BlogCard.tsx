import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import type { Article } from '@/lib/supabase'

interface BlogCardProps {
  article: Article
  className?: string
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function BlogCard({ article, className = '' }: BlogCardProps) {
  return (
    <Link href={`/blog/${article.slug}`}>
      <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-gray-300 group ${className}`}>
        {/* Cover Image */}
        {article.cover_image && (
          <div className="relative aspect-[16/9] bg-gray-100">
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(article.created_at)}</span>
            </div>
            {article.reading_time && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{article.reading_time} min read</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors line-clamp-2">
            {article.title}
          </h3>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
              {article.excerpt}
            </p>
          )}

          {/* Author & Read More */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              By {article.author_name}
            </span>
            <div className="flex items-center gap-1.5 text-gray-700 group-hover:text-gray-900 transition-colors">
              <span className="text-sm font-medium">Read More</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}