'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'
import BlogCard from './BlogCard'
import type { Article } from '@/lib/supabase'

export default function BlogSection() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles?limit=3')
        const data = await response.json()
        
        if (data.success) {
          setArticles(data.articles)
        }
      } catch (error) {
        console.error('Error fetching articles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  if (loading) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              Latest Insights
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Expert Crack Analysis Guides
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn from our comprehensive guides on identifying, analyzing, and addressing different types of structural cracks
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="aspect-[16/9] bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Latest Insights
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Expert Crack Analysis Guides
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn from our comprehensive guides on identifying, analyzing, and addressing different types of structural cracks
          </p>
        </div>

        {/* Blog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {articles.map((article) => (
            <BlogCard key={article.id} article={article} />
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-medium border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
          >
            View All Articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}