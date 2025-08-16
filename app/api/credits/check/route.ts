import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserCredits } from '@/lib/credits'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await getUserCredits(userId)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    const credits = result.credits?.credits_remaining || 0

    return NextResponse.json({
      success: true,
      credits: credits,
      hasCredits: credits > 0
    })

  } catch (error) {
    console.error('Check credits error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check credits' },
      { status: 500 }
    )
  }
}