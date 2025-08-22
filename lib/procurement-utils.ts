import type { ProductRecommendation, RecommendationContext } from './procurement-agent'

/**
 * Generate contextual recommendation reason
 */
export function generateRecommendationReason(
  product: any,
  query: string,
  _context: RecommendationContext
): string {
  const reasons = []

  if (product.rating && product.rating >= 4.5) {
    reasons.push('highly rated')
  }

  if (product.price && product.price < 15) {
    reasons.push('budget-friendly')
  } else if (product.price && product.price < 10) {
    reasons.push('very affordable')
  }

  if (product.skill_level === 'beginner') {
    reasons.push('easy to use')
  }

  if (query.toLowerCase().includes('quick') || query.toLowerCase().includes('fast')) {
    reasons.push('quick application')
  }

  if (query.toLowerCase().includes('small') || query.toLowerCase().includes('minor')) {
    reasons.push('perfect for minor repairs')
  }

  const baseReason = reasons.length > 0 
    ? `Recommended because it's ${reasons.join(', ')}`
    : 'Good match for your crack repair needs'

  return baseReason
}

/**
 * Apply context-based filtering
 */
export function applyContextFiltering(
  recommendations: ProductRecommendation[],
  context: RecommendationContext
): ProductRecommendation[] {
  let filtered = recommendations

  // Filter by budget
  if (context.budget) {
    filtered = filtered.filter(rec => 
      !rec.product.price || rec.product.price <= context.budget!
    )
  }

  // Filter by preferred skill level
  if (context.preferredSkillLevel) {
    filtered = filtered.filter(rec => 
      !rec.product.skill_level || rec.product.skill_level === context.preferredSkillLevel
    )
  }

  // Sort by recommendation score
  return filtered.sort((a, b) => b.recommendation_score - a.recommendation_score)
}

/**
 * Helper function to determine if product recommendations should be shown
 */
export function shouldShowProductRecommendations(
  crackSeverity: 'low' | 'moderate' | 'high'
): boolean {
  // Only show for low and moderate severity cracks (DIY appropriate)
  return crackSeverity === 'low' || crackSeverity === 'moderate'
}

/**
 * Helper function to get recommendation display text
 */
export function getRecommendationDisplayText(
  crackSeverity: 'low' | 'moderate' | 'high'
): { title: string; subtitle: string } {
  switch (crackSeverity) {
    case 'low':
      return {
        title: 'DIY Repair Materials',
        subtitle: 'These products can help you fix minor cracks yourself'
      }
    case 'moderate':
      return {
        title: 'Recommended Repair Materials',
        subtitle: 'Professional-grade materials for effective crack repair'
      }
    default:
      return {
        title: 'Repair Materials',
        subtitle: 'Consider these materials for your repair project'
      }
  }
}