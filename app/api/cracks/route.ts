import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: cracks, error } = await supabase
      .from('cracks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cracks:', error)
      return NextResponse.json({ error: 'Failed to fetch cracks' }, { status: 500 })
    }

    return NextResponse.json({ cracks })
  } catch (error) {
    console.error('Error in GET /api/cracks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { description, image_urls, ai_notes, expert_notes, risk_level } = body

    // Validate required fields
    if (!image_urls || image_urls.length === 0) {
      return NextResponse.json({ error: 'At least one image is required' }, { status: 400 })
    }

    if (image_urls.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 images allowed' }, { status: 400 })
    }

    const { data: crack, error } = await supabase
      .from('cracks')
      .insert([
        {
          user_id: userId,
          description: description || '',
          image_urls,
          ai_notes: ai_notes || null,
          expert_notes: expert_notes || null,
          risk_level: risk_level || null,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating crack:', error)
      return NextResponse.json({ error: 'Failed to create crack record' }, { status: 500 })
    }

    return NextResponse.json({ crack }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/cracks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}