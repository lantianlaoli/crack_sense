import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    // Get crack analyses for this conversation
    const { data: analyses, error } = await supabase
      .from('crack_analyses')
      .select(`
        *,
        crack_cause_templates!inner(
          title,
          description,
          typical_characteristics,
          risk_indicators,
          standard_recommendations,
          severity_factors
        )
      `)
      .eq('conversation_id', id)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching analyses:', error)
      return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      analyses: analyses || []
    })

  } catch (error) {
    console.error('Error in GET /api/conversations/[id]/analyses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}