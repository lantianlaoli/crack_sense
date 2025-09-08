import { Metadata } from 'next'
import { BookOpen } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import BlogCard from '@/components/BlogCard'
import type { Article } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

// Generate metadata for SEO
export const metadata: Metadata = {
  title: 'Expert Crack Analysis Insights | CrackSense Blog',
  description: 'Comprehensive guides and expert insights on identifying, analyzing, and addressing structural cracks. Learn from professional building inspectors and engineers.',
  keywords: ['crack analysis', 'building inspection', 'structural assessment', 'crack repair', 'building maintenance', 'structural engineering', 'property inspection'],
  openGraph: {
    title: 'Expert Crack Analysis Insights | CrackSense Blog',
    description: 'Comprehensive guides and expert insights on structural crack analysis and building inspection.',
    type: 'website',
    url: 'https://www.cracksense.online/blog',
    images: [
      {
        url: '/og-blog.jpg',
        width: 1200,
        height: 630,
        alt: 'CrackSense Blog - Expert Insights',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Expert Crack Analysis Insights | CrackSense Blog',
    description: 'Comprehensive guides and expert insights on structural crack analysis.',
    images: ['/twitter-blog.jpg'],
  },
  alternates: {
    canonical: 'https://www.cracksense.online/blog',
  },
}

// Function to fetch articles directly from Supabase
async function fetchArticles(): Promise<Article[]> {
  try {
    console.log('[Blog] Fetching articles directly from Supabase')
    // Skip querying when Supabase env is not configured (local/dev without DB)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('[Blog] Supabase env not configured, returning empty articles list')
      return []
    }
    
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) {
      console.error('[Blog] Supabase error:', error)
      return []
    }
    
    console.log('[Blog] Articles fetched:', articles?.length || 0)
    return articles || []
  } catch (error) {
    console.error('[Blog] Error fetching articles:', error)
    return []
  }
}

export default async function BlogPage() {
  const articles = await fetchArticles()

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'CrackSense Expert Blog',
    description: 'Expert insights and guides on structural crack analysis and building inspection',
    url: 'https://www.cracksense.online/blog',
    publisher: {
      '@type': 'Organization',
      name: 'CrackSense',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.cracksense.online/logo.png',
      },
    },
    inLanguage: 'en-US',
    about: {
      '@type': 'Thing',
      name: 'Crack Analysis and Building Inspection',
    },
    blogPost: articles.map(article => ({
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.excerpt,
      url: `https://www.cracksense.online/blog/${article.slug}`,
      datePublished: article.created_at,
      dateModified: article.updated_at || article.created_at,
      author: {
        '@type': 'Person',
        name: article.author_name,
      },
    })),
  }

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navigation />
      {/* Hero Section */}
      <div className="bg-white pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Expert Knowledge Base
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Crack Analysis Insights
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive guides and expert insights on identifying, analyzing, and addressing structural cracks
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No articles available
            </h3>
            <p className="text-gray-600 mb-6">
              Check back later for expert insights and guides
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <BlogCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
