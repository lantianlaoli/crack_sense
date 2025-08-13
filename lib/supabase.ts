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
}

// Database types for cracks table (existing)
export interface CrackRecord {
  id: string
  user_id: string
  description: string
  created_at: string
  image_urls: string[]
  ai_notes: string
  expert_notes?: string
  risk_level: 'low' | 'moderate' | 'high'
}