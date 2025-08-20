import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

// GET - Get all conversations for the user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch conversations:', error)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    return NextResponse.json({ success: true, conversations })

  } catch (error) {
    console.error('Error in GET /api/conversations:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title = 'New Conversation' } = body

    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create conversation:', error)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    return NextResponse.json({ success: true, conversation })

  } catch (error) {
    console.error('Error in POST /api/conversations:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}