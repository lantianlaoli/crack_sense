import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's analysis history
    const { data: analyses, error } = await supabase
      .from('crack_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching analyses:', error)
      return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      analyses: analyses || []
    })
  } catch (error) {
    console.error('Error in GET /api/analyses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}