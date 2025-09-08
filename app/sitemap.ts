import { MetadataRoute } from 'next'

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
      url: `${baseUrl}/example`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  // Fetch dynamic blog articles
  try {
    const response = await fetch(`${baseUrl}/api/articles`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })
    
    if (response.ok) {
      const data = await response.json()
      
      if (data.success && data.articles) {
        const blogRoutes: MetadataRoute.Sitemap = data.articles.map((article: any) => ({
          url: `${baseUrl}/blog/${article.slug}`,
          lastModified: new Date(article.updated_at || article.created_at),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }))
        
        routes.push(...blogRoutes)
      }
    }
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error)
  }

  return routes
}