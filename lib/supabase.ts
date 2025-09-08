import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


// Database types for cracks table (extended for conversation support)
export interface CrackRecord {
  id: string
  user_id: string
  description: string
  created_at: string
  image_urls: string[]
  ai_notes: string
  expert_notes?: string
  risk_level: 'low' | 'moderate' | 'high'
  conversation_id?: string
  detailed_analysis?: DetailedAnalysis
  user_question?: string
  additional_info?: string
}

// Detailed analysis structure
export interface DetailedAnalysis {
  confidence: number
  riskLevel: 'low' | 'moderate' | 'high'
  crackCount: number
  findings: CrackFinding[]
  recommendations: string[]
  aiNotes: string
}

export interface CrackFinding {
  type: string
  severity: 'Low' | 'Moderate' | 'High'
  length: string
  width: string
  description: string
}

// Database types for conversations table
export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

// Database types for conversation_messages table
export interface ConversationMessage {
  id: string
  conversation_id: string
  message_type: 'user' | 'assistant'
  content?: string
  images?: string[]
  analysis_data?: DetailedAnalysis
  created_at: string
}

// Database types for user_credits table
export interface UserCredits {
  id: string
  user_id: string
  credits_remaining: number
  creem_id?: string
}

// Database types for crack_cause_templates table
export interface CrackCauseTemplate {
  id: number
  category: 'settlement' | 'thermal' | 'moisture' | 'structural' | 'vibration' | 'material_defect' | 'other'
  title: string
  description: string
  typical_characteristics: string
  risk_indicators: string
  standard_recommendations: string[]
  severity_factors: string
  created_at: string
}

// Database types for crack_analyses table (simplified with essential fields only)
export interface CrackAnalysis {
  id: string
  user_id: string
  crack_type?: string
  crack_cause?: string
  crack_width?: string
  crack_length?: string
  repair_steps?: string[]
  risk_level?: string
  image_urls: string[]
  processed_image_url?: string
  model_used?: string
  created_at: string
}

// Database types for repair_products table
export interface RepairProduct {
  id: string
  asin: string
  title: string
  url: string
  price: number | null
  before_price: number | null
  price_symbol: string
  rating: number | null
  reviews: string | null
  amazon_prime: boolean
  amazon_choice: boolean
  best_seller: boolean
  image_url: string | null
  product_type: 'spackling_paste' | 'patch_kit' | 'caulk' | 'mesh_tape' | 'primer' | 'paint' | 'tools' | 'other' | null
  material_type: 'acrylic' | 'vinyl' | 'plaster' | 'mesh' | 'fiberglass' | 'compound' | 'other' | null
  suitable_for_severity: string[]
  suitable_for_crack_types: string[]
  search_keywords: string[] | null
  application_areas: string[] | null
  skill_level: 'beginner' | 'intermediate' | 'professional' | null
  coverage_area: string | null
  drying_time: string | null
  original_keyword: string
  position: number | null
  created_at: string
  updated_at: string
}

// Database types for product_recommendations table
export interface ProductRecommendation {
  id: string
  analysis_id: string | null
  conversation_id: string | null
  user_id: string
  product_id: string
  recommendation_score: number
  recommendation_reason: string
  recommendation_type: 'analysis_based' | 'chat_based' | 'follow_up'
  viewed_at: string | null
  clicked_at: string | null
  purchased_at: string | null
  user_query: string | null
  matched_analysis_terms: string[] | null
  vector_similarity_score: number | null
  created_at: string
}

// Database types for articles table
export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  cover_image?: string
  author_name: string
  reading_time?: number
  created_at: string
  updated_at: string
}

// Database types for credit transactions table
export interface CreditTransaction {
  id: string
  user_id: string
  transaction_type: 'deduct' | 'add' | 'refund' | 'initial'
  amount: number
  description: string
  related_analysis_id?: string
  pdf_export_id?: string
  model_used?: string
  created_at: string
}

// Database types for PDF exports table
export interface PDFExport {
  id: string
  user_id: string
  analysis_id: string
  model_used: string
  credits_charged: number
  exported_at: string
}
