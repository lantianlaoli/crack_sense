// Credit costs for different AI models
export const CREDIT_COSTS = {
  'gpt-4o-mini': 200,
  'gpt-4o': 500,
} as const

// Package definitions (hardcoded)
export const PACKAGES = {
  starter: {
    name: 'Starter Pack',
    price: 8.99,
    credits: 8000,
    description: 'Perfect for personal use',
    features: [
      '8,000 credits included',
      '40 GPT-4o-mini analyses',
      'One-time purchase',
      'No subscription required'
    ]
  },
  pro: {
    name: 'Pro Pack', 
    price: 29.99,
    credits: 24000,
    description: 'Best value for professionals',
    features: [
      '24,000 credits included',
      '48 GPT-4o analyses',
      '120 GPT-4o-mini analyses',
      'One-time purchase',
      '40% better value per analysis'
    ]
  }
} as const

// Get package details by name
export function getPackageByName(packageName: 'starter' | 'pro') {
  return PACKAGES[packageName]
}

// Get credit cost for AI model
export function getCreditCost(model: keyof typeof CREDIT_COSTS): number {
  return CREDIT_COSTS[model]
}

// Map product_id to credits and package info
export function getCreditsFromProductId(productId: string): { credits: number; packageName: string } | null {
  // Get environment-specific product IDs
  const starterDevId = process.env.STARTER_PACK_CREEM_DEV_ID
  const starterProdId = process.env.STARTER_PACK_CREEM_PROD_ID
  const proDevId = process.env.PRO_PACK_CREEM_DEV_ID
  const proProdId = process.env.PRO_PACK_CREEM_PROD_ID

  if (productId === starterDevId || productId === starterProdId) {
    return {
      credits: PACKAGES.starter.credits,
      packageName: 'starter'
    }
  }
  
  if (productId === proDevId || productId === proProdId) {
    return {
      credits: PACKAGES.pro.credits,
      packageName: 'pro'
    }
  }

  return null
}