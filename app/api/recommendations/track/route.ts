import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { trackInteraction } from '@/lib/procurement-agent'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { recommendationId, interactionType } = body

    if (!recommendationId) {
      return NextResponse.json({ 
        error: 'Recommendation ID is required' 
      }, { status: 400 })
    }

    if (!['view', 'click', 'purchase'].includes(interactionType)) {
      return NextResponse.json({ 
        error: 'Invalid interaction type. Must be: view, click, or purchase' 
      }, { status: 400 })
    }

    const result = await trackInteraction(recommendationId, interactionType)

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Failed to track interaction' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${interactionType} tracked successfully`
    })

  } catch (error) {
    console.error('Error in POST /api/recommendations/track:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}