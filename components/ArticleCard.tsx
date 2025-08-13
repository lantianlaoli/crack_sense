import Link from 'next/link'
import { Article } from '@/lib/supabase'
import { formatDate, truncateContent } from '@/lib/markdown'

interface ArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Date */}
        <div className="text-sm text-gray-500 mb-3">
          {formatDate(article.created_at)}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600">
          <Link href={`/blog/${article.slug}`}>
            {article.title}
          </Link>
        </h3>

        {/* Content Preview */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {truncateContent(article.content)}
        </p>

        {/* Read More Link */}
        <Link 
          href={`/blog/${article.slug}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          Read more
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}