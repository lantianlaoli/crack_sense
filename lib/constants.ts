// Credit costs for different AI models
export const CREDIT_COSTS = {
  'google/gemini-2.0-flash-001': 15,
  'google/gemini-2.5-flash': 25,
  'anthropic/claude-sonnet-4': 50,
} as const

// Package definitions (hardcoded)
export const PACKAGES = {
  starter: {
    name: 'Starter',
    price: 29.9,
    credits: 250,
    description: 'Individuals & small teams',
    features: [
      '250 credits included',
      'Claude 4: 5 calls',
      'Gemini 2.5: 12 calls', 
      'Gemini 2.0: 20 calls',
      'Flexible allocation across models'
    ]
  },
  pro: {
    name: 'Pro', 
    price: 59.9,
    credits: 600,
    description: 'Professionals & creators',
    features: [
      '600 credits included',
      'Claude 4: 12 calls',
      'Gemini 2.5: 25 calls',
      'Gemini 2.0: 40 calls', 
      'High-frequency usage'
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