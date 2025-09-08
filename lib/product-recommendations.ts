import { supabase } from './supabase'

export interface Product {
  id: string
  asin: string
  title: string
  url: string
  price: number | null
  rating: number | null
  image_url: string | null
}

export interface ProductRecommendation {
  product: Product
  recommendation_score: number
  recommendation_reason: string
}

export interface RecommendationResult {
  recommendations: ProductRecommendation[]
  total: number
}

/**
 * MVP simplified product recommendations: only recommend materials for low-level cracks
 */
export class ProductRecommendationService {
  
  /**
   * Get DIY repair product recommendations for low-level cracks
   */
  async getRecommendationsForLowSeverity(
    userId: string,
    analysisId: string,
    userQuery?: string
  ): Promise<RecommendationResult> {
    try {
      // 1. Query products suitable for low-level repairs
      const { data: products, error } = await supabase
        .from('repair_products')
        .select('*')
        .contains('suitable_for_severity', ['low'])
        .order('rating', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching low severity products:', error)
        return { recommendations: [], total: 0 }
      }

      if (!products || products.length === 0) {
        return { recommendations: [], total: 0 }
      }

      // 2. Build recommendation results
      const recommendations: ProductRecommendation[] = products.map((product, index) => {
        const baseScore = Math.max(0.9 - (index * 0.1), 0.6) // Decreasing score
        const ratingBonus = (product.rating || 4) / 5 * 0.1
        const finalScore = Math.min(baseScore + ratingBonus, 1.0)

        return {
          product: {
            id: product.id,
            asin: product.asin,
            title: product.title,
            url: product.url,
            price: product.price,
            rating: product.rating,
            image_url: product.image_url
          },
          recommendation_score: finalScore,
          recommendation_reason: this.generateRecommendationReason(product, index + 1)
        }
      })

      // 3. Save recommendation records for tracking
      await this.saveRecommendations(recommendations, userId, analysisId, userQuery)

      return {
        recommendations,
        total: recommendations.length
      }

    } catch (error) {
      console.error('Product recommendation error:', error)
      return { recommendations: [], total: 0 }
    }
  }

  /**
   * Search products based on query text (used by chat feature)
   */
  async searchProductsByQuery(
    query: string,
    userId: string,
    conversationId?: string
  ): Promise<RecommendationResult> {
    try {
      // Extract keywords
      const searchTerms = this.extractSearchKeywords(query)
      
      // Use Supabase's text search functionality
      const { data: products, error } = await supabase
        .rpc('search_products_by_text', {
          search_query: searchTerms,
          match_count: 5,
          min_rating: 3.0
        })

      if (error) {
        console.error('Error searching products:', error)
        return { recommendations: [], total: 0 }
      }

      if (!products || products.length === 0) {
        return { recommendations: [], total: 0 }
      }

      // Build search recommendation results
      const recommendations: ProductRecommendation[] = products.map((item: any, index: number) => ({
        product: {
          id: item.id,
          asin: item.asin,
          title: item.title,
          url: item.url,
          price: parseFloat(item.price) || null,
          rating: parseFloat(item.rating) || null,
          image_url: item.image_url
        },
        recommendation_score: Math.max(0.8 - (index * 0.1), 0.5),
        recommendation_reason: `Matches your search: "${query}" - ${item.product_type?.replace('_', ' ')} product`
      }))

      // Save search recommendation records
      await this.saveRecommendations(recommendations, userId, null, query)

      return {
        recommendations,
        total: recommendations.length
      }

    } catch (error) {
      console.error('Product search error:', error)
      return { recommendations: [], total: 0 }
    }
  }

  /**
   * Record product clicks for conversion tracking
   */
  async trackProductClick(recommendationId: string): Promise<void> {
    try {
      await supabase
        .from('product_recommendations')
        .update({ clicked_at: new Date().toISOString() })
        .eq('id', recommendationId)
    } catch (error) {
      console.error('Error tracking product click:', error)
    }
  }

  /**
   * Save recommendation records to database
   */
  private async saveRecommendations(
    recommendations: ProductRecommendation[],
    userId: string,
    analysisId?: string | null,
    userQuery?: string
  ): Promise<void> {
    try {
      const records = recommendations.map(rec => ({
        analysis_id: analysisId || null,
        user_id: userId,
        product_id: rec.product.id,
        recommendation_score: rec.recommendation_score,
        recommendation_reason: rec.recommendation_reason
      }))

      const { error } = await supabase
        .from('product_recommendations')
        .insert(records)

      if (error) {
        console.error('Failed to save recommendations:', error)
      }
    } catch (error) {
      console.error('Error saving recommendations:', error)
    }
  }

  /**
   * Generate recommendation reason
   */
  private generateRecommendationReason(product: any, rank: number): string {
    const reasons = [
      `Top recommendation - suitable for low-level crack DIY repair`,
      `High-rated product - ${product.rating || 4}/5 star rating`,
      `Economical and practical - excellent value repair solution`,
      `Easy to use - suitable for beginner DIY operation`,
      `Alternative option - reliable repair material choice`
    ]
    
    let reason = reasons[rank - 1] || reasons[4]
    
    if (product.rating && product.rating >= 4.5) {
      reason += ` (${product.rating} star reviews)`
    }
    
    return reason
  }

  /**
   * Extract search keywords
   */
  private extractSearchKeywords(query: string): string {
    // Remove common stop words, keep keywords
    const stopWords = [
      'I', 'need', 'want', 'buy', 'purchase', 'recommend', 'what', 'how',
      'which', 'use', 'repair', 'fix', 'material', 'product'
    ]

    // Crack repair related keywords
    const importantKeywords = [
      'crack', 'fissure', 'gap', 'repair', 'fill', 'seal', 'adhesive', 'paste', 'patch'
    ]

    const words = query.toLowerCase().split(/\s+/)
    const filteredWords = words
      .map(word => word.replace(/[^\w]/g, ''))
      .filter(word => {
        if (importantKeywords.includes(word)) return true
        return !stopWords.includes(word) && word.length > 1
      })
      .filter(word => word.length > 0)

    return filteredWords.join(' ')
  }
}

// Export singleton instance
export const productRecommendationService = new ProductRecommendationService()