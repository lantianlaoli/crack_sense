// Types for homeowner crack analysis
export interface HomeownerCrackAnalysis {
  crack_cause: string
  repair_steps: string[]
  risk_level: 'low' | 'moderate' | 'high'
  crack_type: string
  crack_width: string
  crack_length: string
  
  // Optional processed images from KIE
  processed_images?: string[]
  processing_error?: string
}