import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for articles table (based on actual table structure)
export interface Article {
  id: string
  title: string
  slug: string
  content: string
  created_at: string
  thumbnail?: string
}

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

// Database types for crack_analyses table
export interface CrackAnalysis {
  id: string
  user_id: string
  conversation_id?: string
  crack_cause_category: 'settlement' | 'thermal' | 'moisture' | 'structural' | 'vibration' | 'material_defect' | 'other'
  crack_type: 'horizontal' | 'vertical' | 'diagonal' | 'stepped' | 'random' | 'hairline' | 'wide'
  crack_severity: 'low' | 'moderate' | 'high'
  personalized_analysis: string
  structural_impact_assessment: string
  immediate_actions_required: string[]
  long_term_recommendations: string[]
  monitoring_requirements: string
  professional_consultation_needed: boolean
  confidence_level: number
  image_urls: string[]
  user_question?: string
  additional_context?: string
  environmental_factors?: string
  building_age_type?: string
  previous_repairs?: string
  created_at: string
  updated_at: string
}