import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkCredits, deductCredits } from '@/lib/credits'
import { getCreditCost } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { openRouterClient } from '@/lib/openrouter-client'
import { kieClient } from '@/lib/kie-client'



export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { imageUrls, description, model = 'google/gemini-2.0-flash-001' } = body

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json({ error: 'Image URLs are required' }, { status: 400 })
    }

    if (imageUrls.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 images allowed' }, { status: 400 })
    }

    if (!['google/gemini-2.0-flash-001', 'google/gemini-2.5-flash', 'anthropic/claude-sonnet-4'].includes(model)) {
      return NextResponse.json({ error: 'Invalid model specified' }, { status: 400 })
    }

    // Check if user has enough credits
    const requiredCredits = getCreditCost(model as keyof typeof import('@/lib/constants').CREDIT_COSTS)
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
      console.log('Homeowner Analysis Request:', {
        model,
        imageCount: imageUrls.length,
        hasDescription: !!description
      })

      // Perform OpenRouter AI analysis
      const analysisResults = await openRouterClient.analyzeForHomeowner(
        imageUrls, 
        description, 
        model
      )

      console.log('OpenRouter analysis completed:', analysisResults)

      // Save analysis to database 
      const { data: savedAnalysis, error: dbError } = await supabase
        .from('crack_analyses')
        .insert({
          user_id: userId,
          user_description: description || 'Crack analysis request',
          severity: analysisResults.risk_level,
          crack_cause_category: analysisResults.crack_cause,
          crack_type: analysisResults.crack_type,
          crack_severity: analysisResults.risk_level,
          // Save OpenRouter results in the new fields
          crack_cause: analysisResults.crack_cause,
          crack_width: analysisResults.crack_width,
          crack_length: analysisResults.crack_length,
          repair_steps: analysisResults.repair_steps,
          risk_level: analysisResults.risk_level,
          personalized_analysis: `Crack Dimensions: ${analysisResults.crack_width} width × ${analysisResults.crack_length} length\n\nDetailed Analysis:\n${analysisResults.crack_cause}\n\nRepair Methodology:\n${analysisResults.repair_steps.join('\n• ')}`,
          structural_impact_assessment: `${analysisResults.crack_type} crack with ${analysisResults.risk_level} risk level`,
          immediate_actions_required: analysisResults.repair_steps,
          long_term_recommendations: ['Monitor crack progression', 'Document changes with photos'],
          monitoring_requirements: 'Check monthly for changes in width or length',
          professional_consultation_needed: analysisResults.risk_level === 'high',
          confidence_level: 90, // Default confidence for OpenRouter
          image_urls: imageUrls,
          user_question: description || '',
          model_used: model
        })
        .select()
        .single()

      if (dbError) {
        console.error('Failed to save analysis to database:', dbError)
        return NextResponse.json({
          success: true,
          analysis: analysisResults,
          warning: 'Analysis completed but not saved to database'
        })
      }

      // Start KIE image processing asynchronously
      const processImages = async () => {
        try {
          console.log('Starting KIE image processing with analysis data...')
          const processedImageUrls = await kieClient.processImage(imageUrls, {
            crack_width: analysisResults.crack_width,
            crack_length: analysisResults.crack_length,
            crack_type: analysisResults.crack_type,
            risk_level: analysisResults.risk_level
          })
          
          // Update database with processed images (preserve existing ai_analysis data)
          const { data: currentAnalysis } = await supabase
            .from('crack_analyses')
            .select('ai_analysis')
            .eq('id', savedAnalysis.id)
            .single()
            
          const updatedAiAnalysis = {
            ...(currentAnalysis?.ai_analysis || {}),
            processed_images: processedImageUrls,
            processed_at: new Date().toISOString()
          }
          
          await supabase
            .from('crack_analyses')
            .update({ ai_analysis: updatedAiAnalysis })
            .eq('id', savedAnalysis.id)
            
          console.log('KIE processing completed:', processedImageUrls)
        } catch (error) {
          console.error('KIE processing failed:', error)
          // Update database with error status (preserve existing ai_analysis data)  
          const { data: currentAnalysis } = await supabase
            .from('crack_analyses')
            .select('ai_analysis')
            .eq('id', savedAnalysis.id)
            .single()
            
          const updatedAiAnalysis = {
            ...(currentAnalysis?.ai_analysis || {}),
            processing_error: error instanceof Error ? error.message : 'Unknown error',
            processed_at: new Date().toISOString()
          }
          
          await supabase
            .from('crack_analyses')
            .update({ ai_analysis: updatedAiAnalysis })
            .eq('id', savedAnalysis.id)
        }
      }

      // Start image processing in background
      processImages()

      return NextResponse.json({
        success: true,
        analysis: analysisResults,
        analysisId: savedAnalysis.id,
        creditsUsed: requiredCredits,
        message: 'Analysis completed. AR-enhanced images are being processed and will be available shortly.'
      })

    } catch (analysisError) {
      console.error('Analysis failed:', analysisError)
      
      // Try to refund credits on analysis failure
      try {
        // This would require implementing a refund credits function
        console.log('Analysis failed, should refund credits:', requiredCredits)
      } catch (refundError) {
        console.error('Failed to refund credits:', refundError)
      }

      return NextResponse.json({
        error: 'AI analysis failed. Please try again.',
        details: analysisError instanceof Error ? analysisError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Request processing failed:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}