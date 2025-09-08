import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { exportPDFAndDeductCredits } from '@/lib/credits'
import { getCreditCost } from '@/lib/constants'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { analysisId } = body

    if (!analysisId) {
      return NextResponse.json({ error: 'Analysis ID is required' }, { status: 400 })
    }

    // Fetch the analysis to get the model used
    const { data: analysis, error: analysisError } = await supabase
      .from('crack_analyses')
      .select('model_used, user_id')
      .eq('id', analysisId)
      .single()

    if (analysisError || !analysis) {
      console.error('Failed to fetch analysis:', analysisError)
      return NextResponse.json({ 
        error: 'Analysis not found or access denied' 
      }, { status: 404 })
    }

    // Verify ownership
    if (analysis.user_id !== userId) {
      return NextResponse.json({ 
        error: 'Access denied - analysis belongs to another user' 
      }, { status: 403 })
    }

    // Get credit cost for the model used in the analysis
    const modelUsed = analysis.model_used || 'google/gemini-2.0-flash-001'
    const creditsRequired = getCreditCost(modelUsed as keyof typeof import('@/lib/constants').CREDIT_COSTS)

    // Try to export PDF and deduct credits (handles duplicate export check)
    const exportResult = await exportPDFAndDeductCredits(
      userId,
      analysisId,
      modelUsed,
      creditsRequired
    )

    if (!exportResult.success) {
      return NextResponse.json({ 
        error: exportResult.error 
      }, { status: 402 }) // Payment required for insufficient credits
    }

    if (exportResult.alreadyExported) {
      return NextResponse.json({
        success: true,
        alreadyExported: true,
        message: 'PDF was already exported for this analysis. No additional credits charged.',
        export: exportResult.export,
        creditsCharged: 0
      })
    }

    return NextResponse.json({
      success: true,
      alreadyExported: false,
      message: `PDF export successful. ${creditsRequired} credits charged.`,
      export: exportResult.export,
      creditsCharged: creditsRequired,
      remainingCredits: exportResult.remainingCredits
    })

  } catch (error) {
    console.error('Export PDF error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}