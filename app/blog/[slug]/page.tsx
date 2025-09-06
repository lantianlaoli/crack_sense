'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, BookOpen, ArrowRight } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import BlogCard from '@/components/BlogCard'
import type { Article } from '@/lib/supabase'

export default function BlogPostPage() {
  const params = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticle = async () => {
      if (!params.slug) return
      
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/articles/${params.slug}`)
        const data = await response.json()
        
        if (data.success) {
          setArticle(data.article)
          setRelatedArticles(data.relatedArticles || [])
        } else {
          setError(data.error || 'Article not found')
        }
      } catch (err) {
        console.error('Error fetching article:', err)
        setError('Failed to load article')
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [params.slug])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
          {/* Back Link */}
          <div className="mb-8">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>

          {/* Article Header */}
          <div className="mb-12">
            <div className="h-8 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6 animate-pulse"></div>
            <div className="flex items-center gap-6 mb-8">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen -mt-20">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error === 'Article not found' ? 'Article Not Found' : 'Something went wrong'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error === 'Article not found' 
              ? 'The article you\'re looking for doesn\'t exist or has been removed.'
              : 'We encountered an error while loading the article. Please try again later.'
            }
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex items-center gap-6 text-gray-500 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(article.created_at)}</span>
            </div>
            {article.reading_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.reading_time} min read</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span>By {article.author_name}</span>
            </div>
          </div>

          {article.excerpt && (
            <div className="bg-gray-50 border-l-4 border-gray-900 pl-6 py-4 mb-8">
              <p className="text-lg text-gray-700 italic leading-relaxed">
                {article.excerpt}
              </p>
            </div>
          )}
        </div>

        {/* Article Content */}
        <div className="mb-16">
          <MarkdownRenderer content={article.content} />
        </div>

        {/* Author Info */}
        <div className="bg-gray-50 rounded-lg p-6 mb-16">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {article.author_name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {article.author_name}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Expert in structural analysis and crack assessment, providing professional insights 
                on building safety and maintenance through comprehensive crack analysis.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="border-t border-gray-200 pt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {relatedArticles.map((relatedArticle) => (
                <BlogCard key={relatedArticle.id} article={relatedArticle} />
              ))}
            </div>
            <div className="text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                View All Articles
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gray-900 rounded-lg p-8 text-center text-white mt-16">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Analyze Your Own Cracks?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Get professional AI-powered crack analysis in minutes. Upload your photos and receive 
            detailed assessments with repair recommendations.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Start Analysis Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}