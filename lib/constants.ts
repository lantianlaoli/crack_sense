// Credit costs for different AI models
export const CREDIT_COSTS = {
  'gemini-2.0-flash': 200,
  'gemini-2.5-flash': 500,
} as const

// Package definitions (hardcoded)
export const PACKAGES = {
  starter: {
    name: 'Starter',
    price: 8.99,
    credits: 8000,
    description: 'Individuals & small teams',
    features: [
      '8,000 credits included',
      '40 analyses',
      'Structural engineer support'
    ]
  },
  pro: {
    name: 'Pro', 
    price: 29.99,
    credits: 24000,
    description: 'Professionals & creators',
    features: [
      '24,000 credits included',
      '120 analyses',
      'Structural engineer support'
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