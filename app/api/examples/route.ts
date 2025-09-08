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
        crack_type,
        crack_width,
        crack_length,
        image_urls,
        processed_image_url,
        risk_level,
        created_at,
        crack_cause,
        repair_steps
      `)
      .not('image_urls', 'eq', '[]')
      .not('crack_type', 'is', null)
      .not('crack_cause', 'is', null)
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      console.error('Error fetching examples:', error)
      return NextResponse.json({ error: 'Failed to fetch examples' }, { status: 500 })
    }

    console.log('Raw analysis data:', analyses?.length, 'records')
    if (analyses && analyses.length > 0) {
      console.log('First record repair_steps:', analyses[0].repair_steps)
    }

    // Transform data to match expected frontend format
    const featuredExamples = analyses?.map(analysis => {
      // Create a descriptive title from crack_type
      let title = analysis.crack_type || 'Crack Analysis'
      if (title.length > 60) {
        title = title.substring(0, 60) + '...'
      }

      // Create description from crack cause (for card preview only)
      let description = ''
      if (analysis.crack_cause) {
        const cleanCause = analysis.crack_cause
          .replace(/\d+\)\s+[A-Z\s]+:/g, '')
          .replace(/\n+/g, ' ')
          .trim()
        description = cleanCause.substring(0, 120) + (cleanCause.length > 120 ? '...' : '')
      }

      // Prioritize processed images over original images
      let imageUrl = '/crack_example.jpg' // Default fallback
      
      // Use processed image first, then fall back to original images
      if (analysis.processed_image_url) {
        imageUrl = analysis.processed_image_url
      } else if (Array.isArray(analysis.image_urls) && analysis.image_urls.length > 0) {
        imageUrl = analysis.image_urls[0]
      }

      return {
        id: analysis.id,
        title,
        description,
        severity: analysis.risk_level as 'low' | 'moderate' | 'high',
        crack_type: analysis.crack_type || 'Unknown Type',
        crack_width: analysis.crack_width || undefined,
        crack_length: analysis.crack_length || undefined,
        image_url: imageUrl,
        analysis_summary: description,
        crack_cause: analysis.crack_cause || '',
        repair_steps: analysis.repair_steps || [],
        created_at: analysis.created_at
      }
    }) || []

    return NextResponse.json({ examples: featuredExamples })
  } catch (error) {
    console.error('Unexpected error fetching examples:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}