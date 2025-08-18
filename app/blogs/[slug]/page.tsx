import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Article } from '@/lib/supabase'
import { formatDate } from '@/lib/markdown'

async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    // Use server-side API call instead of HTTP request
    const { supabase } = await import('@/lib/supabase')
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching article:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

async function getOtherArticles(currentSlug: string): Promise<Article[]> {
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .neq('slug', currentSlug)
      .limit(2)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching other articles:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching other articles:', error)
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    return {
      title: 'Article Not Found - CrackCheck Blogs',
      description: 'The requested article could not be found.'
    }
  }

  return {
    title: `${article.title} - CrackCheck Blogs`,
    description: article.content.substring(0, 160) + '...',
    openGraph: {
      title: article.title,
      description: article.content.substring(0, 160) + '...',
      type: 'article',
      publishedTime: article.created_at,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  const otherArticles = await getOtherArticles(slug)

  if (!article) {
    notFound()
  }

  return (
    <div className="bg-[#fafafa]">
      <Navigation />
      
      <div className="pt-32">
        {/* Article Header - Full Width */}
        <div className="mx-auto px-8 lg:px-12 w-full min-w-[900px] lg:min-w-[1100px] max-w-[1200px] mb-12">
          <h1 className="text-5xl lg:text-6xl font-semibold text-black leading-[0.9] mb-8" style={{letterSpacing: '-0.03em'}}>
            {article.title}
          </h1>
          
          {/* Author and Date */}
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <img 
              src="https://mperrwywxrkmqsglgvhw.supabase.co/storage/v1/object/public/images/founder/avatar.jpg" 
              alt="Aaron Sharma" 
              className="w-6 h-6 rounded-full object-cover"
            />
            <span>By</span>
            <span className="font-medium text-gray-900">Aaron Sharma</span>
            <span>/</span>
            <span>{formatDate(article.created_at)}</span>
          </div>
        </div>

        {/* Content Area - Two Columns */}
        <div className="mx-auto px-8 lg:px-12 w-full min-w-[900px] lg:min-w-[1100px] max-w-[1200px]">
          <div className="flex gap-16">
            {/* Left Column - Main Content */}
            <div className="flex-1 max-w-2xl">

              {/* Featured Image */}
              {article.thumbnail && (
                <div className="mb-12">
                  <div className="aspect-[3/2] bg-gray-900 rounded-2xl overflow-hidden">
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Article Content */}
              <div className="max-w-none">
                <MarkdownRenderer content={article.content} />
              </div>

            </div>

            {/* Right Column - Other Articles */}
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-32">
                <div className="flex flex-col gap-6">
                  {otherArticles.map((otherArticle) => (
                    <Link key={otherArticle.id} href={`/blogs/${otherArticle.slug}`}>
                      <div className="aspect-[4/3] bg-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                        {otherArticle.thumbnail ? (
                          <img
                            src={otherArticle.thumbnail}
                            alt={otherArticle.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center">
                            <svg className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  )
}