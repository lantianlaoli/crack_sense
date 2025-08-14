import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: crack, error } = await supabase
      .from('cracks')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Crack not found' }, { status: 404 })
      }
      console.error('Error fetching crack:', error)
      return NextResponse.json({ error: 'Failed to fetch crack' }, { status: 500 })
    }

    return NextResponse.json({ crack })
  } catch (error) {
    console.error('Error in GET /api/cracks/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { description, image_urls, ai_notes, expert_notes, risk_level } = body

    // Validate image_urls if provided
    if (image_urls && image_urls.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 images allowed' }, { status: 400 })
    }

    const { data: crack, error } = await supabase
      .from('cracks')
      .update({
        description,
        image_urls,
        ai_notes,
        expert_notes,
        risk_level,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Crack not found' }, { status: 404 })
      }
      console.error('Error updating crack:', error)
      return NextResponse.json({ error: 'Failed to update crack' }, { status: 500 })
    }

    return NextResponse.json({ crack })
  } catch (error) {
    console.error('Error in PUT /api/cracks/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('cracks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting crack:', error)
      return NextResponse.json({ error: 'Failed to delete crack' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Crack deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/cracks/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}