import { notFound } from 'next/navigation'
import ArticleForm from '@/components/ArticleForm'
import { Article } from '@/lib/supabase'

async function getArticle(id: string): Promise<Article | null> {
  try {
    // Use server-side API call instead of HTTP request
    const { supabase } = await import('@/lib/supabase')
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
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

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = await getArticle(id)

  if (!article) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Article</h1>
        <p className="text-gray-600 mt-2">Make changes to "{article.title}"</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ArticleForm article={article} />
      </div>
    </div>
  )
}