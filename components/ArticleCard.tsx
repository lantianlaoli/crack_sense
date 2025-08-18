import Link from 'next/link'
import { Article } from '@/lib/supabase'
import { formatDate } from '@/lib/markdown'

interface ArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden group cursor-pointer">
      <Link href={`/blogs/${article.slug}`}>
        {/* Article Image */}
        <div className="aspect-[4/3] bg-gray-900 overflow-hidden">
          {article.thumbnail ? (
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Article Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-gray-600 transition-colors leading-tight line-clamp-2">
            {article.title}
          </h3>

          {/* Author and Date */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span>By</span>
              <span className="font-semibold">lantianlaoli</span>
            </div>
            <div className="flex items-center gap-1">
              <span>On</span>
              <span className="font-semibold">{formatDate(article.created_at)}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}