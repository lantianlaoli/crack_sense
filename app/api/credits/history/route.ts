import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCreditTransactionHistory } from '@/lib/credits'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const result = await getCreditTransactionHistory(userId, limit)

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      transactions: result.transactions || []
    })

  } catch (error) {
    console.error('Get credit history error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}