import { supabase } from '../supabase'
import type { ProcurementResult, InspectionResult, RecommendationResult } from './types'

interface ProductRecommendation {
  product: {
    id: string
    asin: string
    title: string
    url: string
    price: number
    rating: number
    image_url?: string
    product_type: string
    material_type?: string
    skill_level?: string
  }
  recommendation_score: number
  recommendation_reason: string
  recommendation_type: 'analysis_based' | 'chat_based' | 'follow_up'
}

interface RecommendationContext {
  analysisId?: string
  conversationId?: string
  userId: string
  userQuery?: string
  crackSeverity?: 'low' | 'moderate' | 'high'
  crackType?: string
  budget?: number
  preferredSkillLevel?: 'beginner' | 'intermediate' | 'professional'
}

export class ProcurementAgent {
  async getProductRecommendations(
    query: string,
    userId: string,
    options: {
      inspectionResult?: InspectionResult
      recommendationResult?: RecommendationResult
      conversationId?: string
      budget?: number
      skillLevel?: 'beginner' | 'intermediate' | 'expert'
    } = {}
  ): Promise<ProcurementResult> {
    try {
      const context: RecommendationContext = {
        userId,
        userQuery: query,
        conversationId: options.conversationId,
        crackSeverity: options.inspectionResult?.severity,
        crackType: options.inspectionResult?.crackType,
        budget: options.budget,
        preferredSkillLevel: this.mapSkillLevel(options.skillLevel)
      }

      // Select search strategy based on recommendation type
      let recommendations: ProductRecommendation[]

      if (options.recommendationResult?.primaryRecommendation === 'diy') {
        recommendations = await this.getDIYFocusedProducts(query, context)
      } else {
        recommendations = await this.getChatBasedProducts(query, context)
      }

      // Convert to ProcurementResult format
      const result: ProcurementResult = {
        products: recommendations.map(rec => ({
          id: rec.product.id,
          title: rec.product.title,
          price: rec.product.price,
          rating: rec.product.rating,
          url: rec.product.url,
          image_url: rec.product.image_url,
          reason: rec.recommendation_reason
        })),
        totalRecommendations: recommendations.length,
        category: this.determineCategoryFromQuery(query, options.inspectionResult)
      }

      // Save recommendation record
      await this.saveRecommendations(recommendations, context)

      return result

    } catch (error) {
      console.error('Procurement agent error:', error)
      throw new Error('Failed to get product recommendations')
    }
  }

  private async getChatBasedProducts(
    query: string,
    context: RecommendationContext
  ): Promise<ProductRecommendation[]> {
    // Extract key terms from natural language query
    const searchQuery = this.extractSearchKeywords(query)
    
    const { data, error } = await supabase
      .rpc('search_products_by_text', {
        search_query: searchQuery,
        match_count: 8,
        min_rating: 3.0
      })

    if (error) {
      throw new Error('Failed to search products')
    }

    if (!data || data.length === 0) {
      return []
    }

    const recommendations: ProductRecommendation[] = data.map((item: any) => {
      const reason = `Suitable for ${query.toLowerCase()} - ${item.product_type?.replace('_', ' ')} with ${item.rating || 4}/5 rating`
      
      return {
        product: {
          id: item.id,
          asin: item.asin,
          title: item.title,
          url: item.url,
          price: parseFloat(item.price) || 0,
          rating: parseFloat(item.rating) || 0,
          image_url: item.image_url,
          product_type: item.product_type,
          material_type: item.material_type,
          skill_level: item.skill_level
        },
        recommendation_score: parseFloat(item.search_rank) || 0.75,
        recommendation_reason: reason,
        recommendation_type: 'chat_based'
      }
    })

    return recommendations.slice(0, 5)
  }

  private async getDIYFocusedProducts(
    query: string,
    context: RecommendationContext
  ): Promise<ProductRecommendation[]> {
    // First get basic recommendations
    const baseRecommendations = await this.getChatBasedProducts(query, context)
    
    // Filter products suitable for DIY
    const diyRecommendations = baseRecommendations
      .filter(rec => {
        const product = rec.product
        return product.skill_level === 'beginner' || product.skill_level === null
      })
      .map(rec => ({
        ...rec,
        recommendation_reason: `${rec.recommendation_reason} - Perfect for DIY repair`,
        recommendation_score: Math.min(rec.recommendation_score + 0.1, 1.0)
      }))

    // If not enough DIY products, get more beginner-friendly products
    if (diyRecommendations.length < 3) {
      const { data: additionalProducts } = await supabase
        .from('repair_products')
        .select('*')
        .contains('suitable_for_severity', [context.crackSeverity || 'low'])
        .eq('skill_level', 'beginner')
        .order('rating', { ascending: false })
        .limit(5)

      if (additionalProducts) {
        const additionalRecs: ProductRecommendation[] = additionalProducts.map(product => ({
          product: {
            id: product.id,
            asin: product.asin,
            title: product.title,
            url: product.url,
            price: parseFloat(product.price),
            rating: parseFloat(product.rating),
            image_url: product.image_url,
            product_type: product.product_type,
            material_type: product.material_type,
            skill_level: product.skill_level
          },
          recommendation_score: 0.8,
          recommendation_reason: 'Highly rated DIY-friendly crack repair solution',
          recommendation_type: 'analysis_based'
        }))

        diyRecommendations.push(...additionalRecs)
      }
    }

    return diyRecommendations.slice(0, 5)
  }

  private async saveRecommendations(
    recommendations: ProductRecommendation[],
    context: RecommendationContext
  ): Promise<void> {
    try {
      const recommendationsToSave = recommendations.map(rec => ({
        analysis_id: context.analysisId || null,
        conversation_id: context.conversationId || null,
        user_id: context.userId,
        product_id: rec.product.id,
        recommendation_score: rec.recommendation_score,
        recommendation_reason: rec.recommendation_reason,
        recommendation_type: rec.recommendation_type,
        user_query: context.userQuery || null,
        vector_similarity_score: null
      }))

      const { error } = await supabase
        .from('product_recommendations')
        .insert(recommendationsToSave)

      if (error) {
        console.error('Failed to save recommendations:', error)
      }
    } catch (error) {
      console.error('Error saving recommendations:', error)
    }
  }

  private mapSkillLevel(skillLevel?: 'beginner' | 'intermediate' | 'expert'): 'beginner' | 'intermediate' | 'professional' | undefined {
    switch (skillLevel) {
      case 'beginner': return 'beginner'
      case 'intermediate': return 'intermediate'
      case 'expert': return 'professional'
      default: return undefined
    }
  }

  private extractSearchKeywords(query: string): string {
    // Remove common stop words and extract relevant keywords
    const stopWords = [
      'i', 'have', 'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'what', 'how', 'when', 'where', 'why', 'who', 'which', 'should', 'could', 'would',
      'to', 'for', 'of', 'in', 'on', 'at', 'by', 'with', 'from', 'up', 'about', 'into',
      'through', 'during', 'before', 'after', 'above', 'below', 'under', 'between',
      'and', 'or', 'but', 'if', 'then', 'else', 'so', 'than', 'such', 'both', 'either',
      'do', 'does', 'did', 'will', 'can', 'may', 'must', 'shall', 'might', 'ought',
      'it', 'its', 'they', 'them', 'their', 'this', 'that', 'these', 'those',
      'buy', 'purchase', 'get', 'use', 'need', 'want', 'kind', 'type', 'sort'
    ]

    // Keywords relevant to crack repair
    const importantKeywords = [
      'crack', 'cracks', 'hairline', 'small', 'large', 'structural',
      'drywall', 'wall', 'ceiling', 'concrete', 'foundation', 'plaster',
      'repair', 'fix', 'patch', 'seal', 'fill', 'mend',
      'product', 'products', 'material', 'materials', 'kit', 'paste', 'compound',
      'vertical', 'horizontal', 'diagonal', 'settlement', 'stress'
    ]

    const words = query.toLowerCase().split(/\s+/)
    const filteredWords = words
      .map(word => word.replace(/[^\w]/g, '')) // Clean punctuation first
      .filter(cleanWord => {
        // Keep important keywords even if they're in stop words
        if (importantKeywords.includes(cleanWord)) {
          return true
        }
        
        // Remove stop words and short words
        return !stopWords.includes(cleanWord) && cleanWord.length > 2
      })
      .filter(word => word.length > 0) // Remove empty strings

    return filteredWords.join(' ')
  }

  private determineCategoryFromQuery(query: string, inspectionResult?: InspectionResult): string {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('spackle') || lowerQuery.includes('filler')) {
      return 'Spackling & Fillers'
    }
    if (lowerQuery.includes('caulk') || lowerQuery.includes('sealant')) {
      return 'Sealants & Caulks'
    }
    if (lowerQuery.includes('patch') || lowerQuery.includes('kit')) {
      return 'Repair Kits'
    }
    if (lowerQuery.includes('paint') || lowerQuery.includes('primer')) {
      return 'Paint & Primer'
    }
    if (lowerQuery.includes('tool')) {
      return 'Tools & Equipment'
    }
    
    // Infer category based on inspection results
    if (inspectionResult) {
      if (inspectionResult.severity === 'low') {
        return 'DIY Repair Materials'
      }
      if (inspectionResult.severity === 'moderate') {
        return 'Professional Grade Materials'
      }
    }
    
    return 'General Repair Materials'
  }
}