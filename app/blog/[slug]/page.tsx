import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, ArrowRight } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import BlogCard from '@/components/BlogCard'
import type { Article } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

// Function to fetch article data (query Supabase directly in server component)
async function fetchArticle(slug: string): Promise<{ article: Article | null; relatedArticles: Article[] }> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('[Blog slug] Supabase env not configured; no article can be fetched')
      return { article: null, relatedArticles: [] }
    }

    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error || !article) {
      if (error) console.error('[Blog slug] Supabase error:', error)
      return { article: null, relatedArticles: [] }
    }

    const { data: related, error: relatedError } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt, cover_image, created_at, reading_time')
      .eq('published', true)
      .neq('id', article.id)
      .order('created_at', { ascending: false })
      .limit(3)

    if (relatedError) {
      console.warn('[Blog slug] Related articles fetch warning:', relatedError)
    }

    return { article, relatedArticles: related || [] }
  } catch (error) {
    console.error('Error fetching article:', error)
    return { article: null, relatedArticles: [] }
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { article } = await fetchArticle(slug)
  
  if (!article) {
    return {
      title: 'Article Not Found | CrackSense Blog',
      description: 'The article you are looking for could not be found.',
    }
  }

  const description = article.excerpt || `Read about ${article.title} on CrackSense blog - professional insights into crack analysis and building inspection.`
  
  return {
    title: `${article.title} | CrackSense Blog`,
    description,
    keywords: ['crack analysis', 'building inspection', 'structural assessment'],
    authors: [{ name: article.author_name }],
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      publishedTime: article.created_at,
      modifiedTime: article.updated_at || article.created_at,
      authors: [article.author_name],
      url: `https://www.cracksense.online/blog/${article.slug}`,
      images: [
        {
          url: `/og-blog-${article.slug}.jpg`,
          width: 1200,
          height: 630,
          alt: article.title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: [`/twitter-blog-${article.slug}.jpg`],
    },
    alternates: {
      canonical: `https://www.cracksense.online/blog/${article.slug}`,
    },
  }
}

// Generate static params for static generation
export async function generateStaticParams() {
  // This would need to fetch all article slugs from your database
  // For now, we'll let Next.js generate them on demand
  return []
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const { article, relatedArticles } = await fetchArticle(slug)

  if (!article) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || `Professional insights about ${article.title}`,
    author: {
      '@type': 'Person',
      name: article.author_name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'CrackSense',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.cracksense.online/logo.png',
      },
    },
    datePublished: article.created_at,
    dateModified: article.updated_at || article.created_at,
    url: `https://www.cracksense.online/blog/${article.slug}`,
    image: [`https://www.cracksense.online/og-blog-${article.slug}.jpg`],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.cracksense.online/blog/${article.slug}`,
    },
    keywords: ['crack analysis', 'building inspection', 'structural assessment'],
    about: {
      '@type': 'Thing',
      name: 'Crack Analysis and Building Inspection',
    },
    articleSection: 'Building Inspection',
    inLanguage: 'en-US',
    wordCount: article.content?.length || 0,
  }

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
