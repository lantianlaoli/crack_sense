import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Query featured examples from crack_analyses table
    // Select analyses with images and good data for display
    const { data: analyses, error } = await supabase
      .from('crack_analyses')
      .select(`
        id,
        user_description,
        severity,
        crack_type,
        image_urls,
        ai_analysis,
        personalized_analysis,
        created_at,
        crack_cause
      `)
      .not('image_urls', 'eq', '[]')
      .not('crack_type', 'is', null)
      .not('personalized_analysis', 'is', null)
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      console.error('Error fetching examples:', error)
      return NextResponse.json({ error: 'Failed to fetch examples' }, { status: 500 })
    }

    // Transform data to match expected frontend format
    const featuredExamples = analyses?.map(analysis => {
      // Extract a summary from personalized_analysis (first 200 chars)
      let analysisSummary = ''
      if (analysis.personalized_analysis) {
        const cleanText = analysis.personalized_analysis
          .replace(/\d+\)\s+[A-Z\s]+:/g, '') // Remove section headers like "1) VISUAL ASSESSMENT:"
          .replace(/\n+/g, ' ') // Replace newlines with spaces
          .trim()
        analysisSummary = cleanText.substring(0, 200) + (cleanText.length > 200 ? '...' : '')
      }

      // Create a descriptive title from crack_type or user_description
      let title = analysis.crack_type || analysis.user_description || 'Crack Analysis'
      if (title.length > 60) {
        title = title.substring(0, 60) + '...'
      }

      // Create description from crack cause or analysis
      let description = ''
      if (analysis.crack_cause) {
        const cleanCause = analysis.crack_cause
          .replace(/\d+\)\s+[A-Z\s]+:/g, '')
          .replace(/\n+/g, ' ')
          .trim()
        description = cleanCause.substring(0, 120) + (cleanCause.length > 120 ? '...' : '')
      } else {
        description = analysisSummary.substring(0, 120) + (analysisSummary.length > 120 ? '...' : '')
      }

      // Prioritize KIE rendered images over original images
      let imageUrl = '/crack_example.jpg' // Default fallback
      
      // Check for KIE processed images first
      try {
        let aiAnalysisData = null
        
        // Handle both string and object formats for ai_analysis
        if (analysis.ai_analysis) {
          if (typeof analysis.ai_analysis === 'string') {
            aiAnalysisData = JSON.parse(analysis.ai_analysis)
          } else {
            aiAnalysisData = analysis.ai_analysis
          }
        }
        
        if (aiAnalysisData && 
            aiAnalysisData.processed_images && 
            Array.isArray(aiAnalysisData.processed_images) && 
            aiAnalysisData.processed_images.length > 0) {
          imageUrl = aiAnalysisData.processed_images[0]
        } 
        // Fall back to original images
        else if (Array.isArray(analysis.image_urls) && analysis.image_urls.length > 0) {
          imageUrl = analysis.image_urls[0]
        }
      } catch (error) {
        console.error('Error parsing ai_analysis:', error)
        // Fall back to original images if parsing fails
        if (Array.isArray(analysis.image_urls) && analysis.image_urls.length > 0) {
          imageUrl = analysis.image_urls[0]
        }
      }

      return {
        id: analysis.id,
        title,
        description,
        severity: analysis.severity as 'low' | 'moderate' | 'high',
        crack_type: analysis.crack_type || 'Unknown Type',
        image_url: imageUrl,
        analysis_summary: analysisSummary,
        created_at: analysis.created_at
      }
    }) || []

    return NextResponse.json({ examples: featuredExamples })
  } catch (error) {
    console.error('Unexpected error fetching examples:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}