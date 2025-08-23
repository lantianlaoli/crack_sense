import Navigation from '@/components/Navigation'
import ArticleCard from '@/components/ArticleCard'
import Footer from '@/components/Footer'
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

export default async function BlogsPage() {
  const articles = await getArticles()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gray-50 pt-40 pb-24">
        <div className="mx-auto px-8 lg:px-12 w-full min-w-[900px] lg:min-w-[1100px] max-w-[1200px]">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-black leading-tight mb-8">
              Thoughts on CrackSense
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Explore CrackSense in-depth guides, curated templates, and practical tips to help you plan 
              smarter, stay organized, and build systems that truly work for your lifestyle.
            </p>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="bg-gray-50 flex-1 pb-20">
        <div className="mx-auto px-8 lg:px-12 w-full min-w-[900px] lg:min-w-[1100px] max-w-[1200px]">
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

      <Footer />
    </div>
  )
}