'use server'

import { supabase } from './supabase'
// import { CrackAnalysis } from './supabase' // currently unused
import { generateRecommendationReason, applyContextFiltering } from './procurement-utils'

// Types for product recommendations
export interface RepairProduct {
  id: string
  asin: string
  title: string
  url: string
  price: number | null
  rating: number | null
  image_url: string | null
  product_type: string | null
  material_type: string | null
  suitable_for_severity: string[]
  suitable_for_crack_types: string[]
  skill_level: string | null
  coverage_area: string | null
  drying_time: string | null
}

export interface ProductRecommendation {
  product: RepairProduct
  recommendation_score: number
  recommendation_reason: string
  recommendation_type: 'analysis_based' | 'chat_based' | 'follow_up'
  vector_similarity_score?: number
}

export interface RecommendationContext {
  analysisId?: string
  conversationId?: string
  userId: string
  userQuery?: string
  crackSeverity?: 'low' | 'moderate' | 'high'
  crackType?: string
  budget?: number
  preferredSkillLevel?: 'beginner' | 'intermediate' | 'professional'
}

/**
 * Get product recommendations based on crack analysis
 */
export async function getAnalysisBasedRecommendations(
  analysisId: string,
  context: RecommendationContext
): Promise<{
  success: boolean
  recommendations?: ProductRecommendation[]
  error?: string
}> {
  try {
    // Use Supabase function for analysis-based recommendations
    const { data, error } = await supabase
      .rpc('get_analysis_product_recommendations', {
        analysis_id_param: analysisId,
        match_count: 5
      })

    if (error) {
      console.error('Error getting analysis recommendations:', error)
      return {
        success: false,
        error: 'Failed to get product recommendations'
      }
    }

    if (!data || data.length === 0) {
      return {
        success: true,
        recommendations: []
      }
    }

    // Transform the data to our recommendation format
    const recommendations: ProductRecommendation[] = data.map((item: any) => ({
      product: {
        id: item.product_id,
        asin: item.asin,
        title: item.title,
        url: item.url,
        price: item.price,
        rating: item.rating,
        image_url: item.image_url,
        product_type: item.product_type,
        material_type: null, // Not returned by the function
        suitable_for_severity: [],
        suitable_for_crack_types: [],
        skill_level: null,
        coverage_area: null,
        drying_time: null
      },
      recommendation_score: item.similarity_score || 0.85,
      recommendation_reason: item.recommendation_reason,
      recommendation_type: 'analysis_based' as const
    }))

    // Save recommendations to database for tracking
    await saveRecommendations(recommendations, context)

    return {
      success: true,
      recommendations
    }
  } catch (error) {
    console.error('Analysis recommendations error:', error)
    return {
      success: false,
      error: 'Something went wrong getting recommendations'
    }
  }
}

/**
 * Get product recommendations based on chat/text query
 */
export async function getChatBasedRecommendations(
  query: string,
  context: RecommendationContext
): Promise<{
  success: boolean
  recommendations?: ProductRecommendation[]
  error?: string
}> {
  try {
    // Use text search function
    const { data, error } = await supabase
      .rpc('search_products_by_text', {
        search_query: query,
        match_count: 8,
        min_rating: 3.0
      })

    if (error) {
      console.error('Error getting chat recommendations:', error)
      return {
        success: false,
        error: 'Failed to search products'
      }
    }

    if (!data || data.length === 0) {
      return {
        success: true,
        recommendations: []
      }
    }

    // Transform and enhance recommendations
    const recommendations: ProductRecommendation[] = data.map((item: any) => {
      const reason = generateRecommendationReason(item, query, context)
      
      return {
        product: {
          id: item.id,
          asin: item.asin,
          title: item.title,
          url: item.url,
          price: item.price,
          rating: item.rating,
          image_url: item.image_url,
          product_type: item.product_type,
          material_type: item.material_type,
          suitable_for_severity: [],
          suitable_for_crack_types: [],
          skill_level: item.skill_level,
          coverage_area: null,
          drying_time: null
        },
        recommendation_score: item.search_rank || 0.75,
        recommendation_reason: reason,
        recommendation_type: 'chat_based' as const
      }
    })

    // Apply filtering based on context
    const filteredRecommendations = applyContextFiltering(recommendations, context)

    // Save recommendations to database
    await saveRecommendations(filteredRecommendations, context)

    return {
      success: true,
      recommendations: filteredRecommendations.slice(0, 5) // Limit to top 5
    }
  } catch (error) {
    console.error('Chat recommendations error:', error)
    return {
      success: false,
      error: 'Something went wrong searching products'
    }
  }
}

/**
 * Get enhanced recommendations for low severity cracks (DIY focus)
 */
export async function getDIYRecommendations(
  analysisId: string,
  context: RecommendationContext
): Promise<{
  success: boolean
  recommendations?: ProductRecommendation[]
  error?: string
}> {
  try {
    // Get basic recommendations first
    const result = await getAnalysisBasedRecommendations(analysisId, context)
    
    if (!result.success || !result.recommendations) {
      return result
    }

    // Filter and enhance for DIY users
    const diyRecommendations = result.recommendations
      .filter(rec => {
        const product = rec.product
        return product.skill_level === 'beginner' || product.skill_level === null
      })
      .map(rec => ({
        ...rec,
        recommendation_reason: `${rec.recommendation_reason} - Perfect for DIY repair`,
        recommendation_score: Math.min(rec.recommendation_score + 0.1, 1.0)
      }))

    // If we don't have enough DIY products, get some general low-severity ones
    if (diyRecommendations.length < 3) {
      const { data: additionalProducts } = await supabase
        .from('repair_products')
        .select('*')
        .contains('suitable_for_severity', ['low'])
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
            price: product.price,
            rating: product.rating,
            image_url: product.image_url,
            product_type: product.product_type,
            material_type: product.material_type,
            suitable_for_severity: product.suitable_for_severity,
            suitable_for_crack_types: product.suitable_for_crack_types,
            skill_level: product.skill_level,
            coverage_area: product.coverage_area,
            drying_time: product.drying_time
          },
          recommendation_score: 0.8,
          recommendation_reason: 'Highly rated DIY-friendly crack repair solution',
          recommendation_type: 'analysis_based' as const
        }))

        diyRecommendations.push(...additionalRecs)
      }
    }

    return {
      success: true,
      recommendations: diyRecommendations.slice(0, 5)
    }
  } catch (error) {
    console.error('DIY recommendations error:', error)
    return {
      success: false,
      error: 'Something went wrong getting DIY recommendations'
    }
  }
}


/**
 * Save recommendations to database for tracking
 */
export async function saveRecommendations(
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
      vector_similarity_score: rec.vector_similarity_score || null
    }))

    const { error } = await supabase
      .from('product_recommendations')
      .insert(recommendationsToSave)

    if (error) {
      console.error('Failed to save recommendations:', error)
      // Don't throw error, just log it
    }
  } catch (error) {
    console.error('Error saving recommendations:', error)
    // Don't throw error, just log it
  }
}

/**
 * Track user interaction with recommendations
 */
export async function trackInteraction(
  recommendationId: string,
  interactionType: 'view' | 'click' | 'purchase'
): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .rpc('track_recommendation_interaction', {
        recommendation_id_param: recommendationId,
        interaction_type: interactionType
      })

    return { success: !error }
  } catch (error) {
    console.error('Error tracking interaction:', error)
    return { success: false }
  }
}

