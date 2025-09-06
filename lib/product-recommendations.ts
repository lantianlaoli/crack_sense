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
 * MVP简化版产品推荐：只在低级别裂痕时推荐材料
 */
export class ProductRecommendationService {
  
  /**
   * 获取低级别裂痕的DIY修复产品推荐
   */
  async getRecommendationsForLowSeverity(
    userId: string,
    analysisId: string,
    userQuery?: string
  ): Promise<RecommendationResult> {
    try {
      // 1. 查询适合低级别的产品
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

      // 2. 构建推荐结果
      const recommendations: ProductRecommendation[] = products.map((product, index) => {
        const baseScore = Math.max(0.9 - (index * 0.1), 0.6) // 递减评分
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

      // 3. 保存推荐记录用于追踪
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
   * 基于查询文本搜索产品（聊天功能使用）
   */
  async searchProductsByQuery(
    query: string,
    userId: string,
    conversationId?: string
  ): Promise<RecommendationResult> {
    try {
      // 提取关键词
      const searchTerms = this.extractSearchKeywords(query)
      
      // 使用Supabase的文本搜索功能
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

      // 构建搜索推荐结果
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
        recommendation_reason: `匹配您的搜索："${query}" - ${item.product_type?.replace('_', ' ')} 产品`
      }))

      // 保存搜索推荐记录
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
   * 记录产品点击用于转化追踪
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
   * 保存推荐记录到数据库
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
   * 生成推荐理由
   */
  private generateRecommendationReason(product: any, rank: number): string {
    const reasons = [
      `顶级推荐 - 适合低级别裂痕DIY修复`,
      `高评分产品 - ${product.rating || 4}/5星评价`,
      `经济实用 - 性价比优秀的修复方案`,
      `易于使用 - 适合初学者DIY操作`,
      `备选方案 - 可靠的修复材料选择`
    ]
    
    let reason = reasons[rank - 1] || reasons[4]
    
    if (product.rating && product.rating >= 4.5) {
      reason += ` (${product.rating}星好评)`
    }
    
    return reason
  }

  /**
   * 提取搜索关键词
   */
  private extractSearchKeywords(query: string): string {
    // 移除常见停用词，保留关键词
    const stopWords = [
      '我', '需要', '想要', '买', '购买', '推荐', '什么', '怎么', '如何',
      '哪个', '哪种', '用', '使用', '修复', '修理', '材料', '产品'
    ]

    // 裂痕修复相关关键词
    const importantKeywords = [
      '裂痕', '裂缝', '缝隙', '修补', '填充', '密封', '胶', '膏', '贴'
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