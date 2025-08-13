import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import Navigation from '@/components/Navigation'
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

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug)

  if (!article) {
    return {
      title: 'Article Not Found - CrackCheck Blog',
      description: 'The requested article could not be found.'
    }
  }

  return {
    title: `${article.title} - CrackCheck Blog`,
    description: article.content.substring(0, 160) + '...',
    openGraph: {
      title: article.title,
      description: article.content.substring(0, 160) + '...',
      type: 'article',
      publishedTime: article.created_at,
    },
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug)

  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Article Header */}
      <div className="bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link href="/blog" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Back to Blog
            </Link>
          </nav>

          {/* Title and Date */}
          <header>
            <h1 className="text-3xl lg:text-4xl font-bold text-black leading-tight mb-4">
              {article.title}
            </h1>
            <div className="text-gray-600">
              Published on {formatDate(article.created_at)}
            </div>
          </header>
        </div>
      </div>

      {/* Article Content */}
      <article className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:text-blue-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[
                rehypeHighlight,
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: 'wrap' }]
              ]}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>

      {/* Back to Blog */}
      <div className="bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            href="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
        </div>
      </div>
    </div>
  )
}