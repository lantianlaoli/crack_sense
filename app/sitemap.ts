import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.cracksense.online'
  
  // Static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dashboard/history`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/examples`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  // Add dynamic blog posts
  try {
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, updated_at, created_at')
      .order('created_at', { ascending: false })

    if (articles) {
      const blogRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
        url: `${baseUrl}/blogs/${article.slug}`,
        lastModified: new Date(article.updated_at || article.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))

      routes.push(...blogRoutes)
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error)
  }

  return routes
}