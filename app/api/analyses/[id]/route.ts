import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: analysisId } = await params

    // Get the analysis from database
    const { data: analysis, error } = await supabase
      .from('crack_analyses')
      .select('*')
      .eq('id', analysisId)
      .single()

    if (error) {
      console.error('Error fetching analysis:', error)
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    // Extract processed images from ai_analysis field
    const processed_images = analysis.ai_analysis?.processed_images || []

    // Return the analysis with processed images
    return NextResponse.json({
      id: analysis.id,
      crack_type: analysis.crack_type,
      crack_width: analysis.crack_width,
      crack_length: analysis.crack_length,
      crack_cause: analysis.crack_cause,
      repair_steps: analysis.repair_steps,
      risk_level: analysis.risk_level,
      processed_images,
      created_at: analysis.created_at,
    })

  } catch (error) {
    console.error('Error in analyses API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}