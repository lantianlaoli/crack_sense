import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkCredits, deductCredits } from '@/lib/credits'
import { getCreditCost } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { openRouterClient } from '@/lib/openrouter-client'

// OpenRouter analysis function
async function analyzeImages(imageUrls: string[], description?: string, additionalInfo?: string, model: 'gemini-2.0-flash' | 'gemini-2.5-flash' = 'gemini-2.0-flash') {
  const openRouterModel = model === 'gemini-2.5-flash' ? 'google/gemini-2.5-flash' : 'google/gemini-2.0-flash-001'
  const fullDescription = [description, additionalInfo].filter(Boolean).join(' ')
  
  const result = await openRouterClient.analyzeForHomeowner(imageUrls, fullDescription, openRouterModel)
  
  // Convert OpenRouter result to expected format
  return {
    summary: result.crack_cause,
    riskLevel: result.risk_level,
    findings: [{
      type: result.crack_type,
      severity: result.risk_level,
      width: result.crack_width,
      length: result.crack_length,
      description: result.crack_cause
    }],
    recommendations: result.repair_steps,
    confidence: 90
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { imageUrls, description, additionalInfo, model = 'gemini-2.0-flash', conversationId } = body

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json({ error: 'Image URLs are required' }, { status: 400 })
    }

    if (imageUrls.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 images allowed' }, { status: 400 })
    }

    if (!['gemini-2.0-flash', 'gemini-2.5-flash'].includes(model)) {
      return NextResponse.json({ error: 'Invalid model specified' }, { status: 400 })
    }

    // Check if user has enough credits
    const openRouterModel = model === 'gemini-2.5-flash' ? 'google/gemini-2.5-flash' : 'google/gemini-2.0-flash-001'
    const requiredCredits = getCreditCost(openRouterModel as 'google/gemini-2.0-flash-001' | 'google/gemini-2.5-flash' | 'anthropic/claude-sonnet-4')
    const creditCheck = await checkCredits(userId, requiredCredits)

    if (!creditCheck.success) {
      return NextResponse.json({ error: creditCheck.error }, { status: 500 })
    }

    if (!creditCheck.hasEnoughCredits) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        requiredCredits,
        currentCredits: creditCheck.currentCredits || 0
      }, { status: 402 })
    }

    // Deduct credits before analysis
    const deductResult = await deductCredits(userId, requiredCredits)
    if (!deductResult.success) {
      return NextResponse.json({ error: deductResult.error }, { status: 500 })
    }

    try {
      // Perform AI analysis
      const analysisResults = await analyzeImages(imageUrls, description, additionalInfo, model as 'gemini-2.0-flash' | 'gemini-2.5-flash')
      
      // Store analysis to database
      const { data: crack, error: dbError } = await supabase
        .from('cracks')
        .insert({
          user_id: userId,
          description: description || '',
          user_question: description,
          additional_info: additionalInfo,
          image_urls: imageUrls,
          ai_notes: analysisResults.summary,
          risk_level: analysisResults.riskLevel,
          detailed_analysis: analysisResults,
          conversation_id: conversationId || null
        })
        .select()
        .single()

      if (dbError) {
        console.error('Failed to save analysis to database:', dbError)
        // Still return the analysis even if database save fails
        return NextResponse.json({
          success: true,
          analysis: analysisResults,
          creditsUsed: requiredCredits,
          remainingCredits: deductResult.remainingCredits,
          warning: 'Analysis completed but failed to save to database'
        })
      }

      // Save conversation message if conversationId is provided
      if (conversationId) {
        await supabase
          .from('conversation_messages')
          .insert([
            {
              conversation_id: conversationId,
              message_type: 'user',
              content: description,
              images: imageUrls
            },
            {
              conversation_id: conversationId,
              message_type: 'assistant',
              analysis_data: analysisResults
            }
          ])
      }

      // Professional finder data (simplified)
      const professionalFinderData = null

      return NextResponse.json({
        success: true,
        analysis: analysisResults,
        enhancedAnalysis: null,
        professionalFinder: professionalFinderData,
        crack,
        creditsUsed: requiredCredits,
        remainingCredits: deductResult.remainingCredits
      })
    } catch (analysisError) {
      // If analysis fails, we should ideally refund the credits
      // For now, log the error and return failure
      console.error('Analysis failed after credit deduction:', analysisError)
      return NextResponse.json({ 
        error: 'Analysis failed. Credits have been deducted but analysis could not be completed.',
        creditsDeducted: requiredCredits
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in POST /api/analyze:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}