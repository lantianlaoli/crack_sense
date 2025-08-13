import Navigation from '@/components/Navigation'
import ArticleCard from '@/components/ArticleCard'
import { supabase, Article } from '@/lib/supabase'

async function getArticles(): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching articles:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

export default async function BlogPage() {
  const articles = await getArticles()

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold text-black leading-tight mb-6">
              CrackCheck Blog: Wall Crack Insights, Home Safety & AI Tips
            </h1>
            
            <h2 className="text-lg text-gray-600 leading-relaxed">
              Learn how to identify wall cracks, understand their risks, and use AI-powered analysis to keep your home safe.
            </h2>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {articles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                No articles published yet.
              </p>
              <p className="text-gray-500">
                Check back soon for insights about wall crack detection and home safety!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}