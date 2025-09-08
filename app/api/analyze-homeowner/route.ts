import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkCredits } from '@/lib/credits'
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

    // Note: Credit deduction now happens only during PDF export
    // We still check if user has credits to prevent abuse, but don't deduct yet
    const requiredCredits = getCreditCost(model as keyof typeof import('@/lib/constants').CREDIT_COSTS)
    const creditCheck = await checkCredits(userId, requiredCredits)

    if (!creditCheck.success) {
      return NextResponse.json({ error: creditCheck.error }, { status: 500 })
    }

    if (!creditCheck.hasEnoughCredits) {
      return NextResponse.json({ 
        error: 'Insufficient credits for PDF export. Credits will only be charged when you export the analysis as PDF.',
        requiredCredits,
        currentCredits: creditCheck.currentCredits || 0
      }, { status: 402 })
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
          crack_type: analysisResults.crack_type,
          crack_cause: analysisResults.crack_cause,
          crack_width: analysisResults.crack_width,
          crack_length: analysisResults.crack_length,
          repair_steps: analysisResults.repair_steps,
          risk_level: analysisResults.risk_level,
          image_urls: imageUrls,
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
          
          // Update database with processed images using the correct column
          const { data: updateData, error: updateError } = await supabase
            .from('crack_analyses')
            .update({ processed_image_url: processedImageUrls[0] || null })
            .eq('id', savedAnalysis.id)
            
          if (updateError) {
            console.error('Failed to update database with processed images:', updateError)
            throw new Error(`Database update failed: ${updateError.message}`)
          }
          
          console.log('Database updated successfully with processed image URL')
          console.log('Update data:', updateData)
          console.log('Saved processed_image_url:', processedImageUrls[0])
          console.log('KIE processing completed:', processedImageUrls)
          
          // Verify the data was saved correctly
          const { data: verifyData, error: verifyError } = await supabase
            .from('crack_analyses')
            .select('processed_image_url')
            .eq('id', savedAnalysis.id)
            .single()
            
          if (verifyError) {
            console.error('Failed to verify saved data:', verifyError)
          } else {
            console.log('Verification: processed_image_url in database:', verifyData?.processed_image_url)
          }
        } catch (error) {
          console.error('KIE processing failed:', error)
          // Note: Could optionally store error in a separate field if needed
          // For now, just log the error - the analysis is still valid without processed image
        }
      }

      // Start image processing in background
      processImages()

      return NextResponse.json({
        success: true,
        analysis: analysisResults,
        analysisId: savedAnalysis.id,
        modelUsed: model,
        creditsRequired: requiredCredits,
        message: 'Analysis completed. AR-enhanced images are being processed and will be available shortly. Credits will be charged only when you export to PDF.'
      })

    } catch (analysisError) {
      console.error('Analysis failed:', analysisError)

      return NextResponse.json({
        error: 'AI analysis failed. Please try again. No credits have been charged.',
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