import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkCredits, deductCredits } from '@/lib/credits'
import { getCreditCost } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { getCrackCauseTemplates, categorizeCrackAnalysis, generatePersonalizedRecommendations, saveCrackAnalysis } from '@/lib/crack-analysis-utils'
import { createStructuredGeminiChat, type GeminiModel, type CrackAnalysis } from '@/lib/langchain-config'
import { HumanMessage } from '@langchain/core/messages'
import { shouldTriggerProfessionalFinder, generateProfessionalFinderMessage, extractLocationInfo, generateSearchParams } from '@/lib/professional-finder-integration'
import { professionalFinderAgent } from '@/lib/professional-finder-agent'

// LangChain Gemini analysis function
async function analyzeImages(imageUrls: string[], description?: string, additionalInfo?: string, model: 'gemini-2.0-flash' | 'gemini-2.5-flash' = 'gemini-2.0-flash'): Promise<CrackAnalysis> {
  // Create structured Gemini chat instance
  const structuredChat = createStructuredGeminiChat(model as GeminiModel)
  
  const prompt = `You are an expert structural engineer and building inspector. Analyze the provided images of wall cracks and provide a comprehensive assessment.

${description ? `User description: "${description}"` : ''}
${additionalInfo ? `Additional information: "${additionalInfo}"` : ''}

Please provide a detailed structural engineering analysis including:

1. Overall risk assessment and confidence level (85-99)
2. Detailed crack identification and measurements
3. Likely causes and structural implications
4. Professional recommendations and prioritized action items
5. Long-term monitoring suggestions

Analyze each crack found in the images and provide comprehensive professional engineering assessment.`

  // Create message with images for LangChain
  const messageContent = [
    { type: 'text', text: prompt },
    ...imageUrls.map(url => ({
      type: 'image_url',
      image_url: { url }
    }))
  ]
  
  const message = new HumanMessage({
    content: messageContent
  })
  
  console.log('LangChain Gemini Request:', {
    model,
    imageCount: imageUrls.length,
    hasDescription: !!description,
    hasAdditionalInfo: !!additionalInfo
  })

  try {
    // Use LangChain structured output - this automatically handles schema validation
    const result = await structuredChat.invoke([message])
    
    console.log('LangChain structured response received:', result)
    
    return result
  } catch (error) {
    console.error('LangChain analysis failed:', error)
    
    // Fallback response with proper typing
    const fallback: CrackAnalysis = {
      confidence: 85,
      riskLevel: 'moderate',
      crackCount: 1,
      findings: [{
        type: 'Analysis Result',
        severity: 'Moderate',
        length: 'Variable',
        width: 'Variable',
        description: 'Analysis failed - unable to process images with AI model'
      }],
      recommendations: ['Consult with a structural engineer', 'Monitor crack development manually'],
      aiNotes: 'Analysis could not be completed due to technical issues. Please retry or contact support.'
    }
    
    return fallback
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
    const requiredCredits = getCreditCost(model as 'gemini-2.0-flash' | 'gemini-2.5-flash')
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

      // Get crack cause templates for advanced categorization
      const templates = await getCrackCauseTemplates()
      
      // Categorize the crack analysis using AI response and templates
      const { category, crackType, severity, template } = categorizeCrackAnalysis(
        analysisResults.aiNotes,
        analysisResults.findings,
        templates
      )
      
      // Generate personalized recommendations based on template and context
      const recommendations = generatePersonalizedRecommendations(
        template,
        severity,
        {
          question: description,
          additionalInfo,
          buildingAge: additionalInfo, // Could be extracted more intelligently
          environmentalFactors: additionalInfo // Could be extracted more intelligently
        }
      )
      
      // Save to the new crack_analyses table
      const analysisId = await saveCrackAnalysis({
        user_id: userId,
        conversation_id: conversationId || undefined,
        crack_cause_category: category,
        crack_type: crackType,
        crack_severity: severity,
        personalized_analysis: analysisResults.aiNotes,
        structural_impact_assessment: template?.description || 'Analysis based on visual inspection of crack patterns and characteristics.',
        immediate_actions_required: recommendations.immediateActions,
        long_term_recommendations: recommendations.longTermRecommendations,
        monitoring_requirements: recommendations.monitoringRequirements,
        professional_consultation_needed: recommendations.consultationNeeded,
        confidence_level: analysisResults.confidence,
        image_urls: imageUrls,
        user_question: description,
        additional_context: additionalInfo
      })
      
      // Store to legacy cracks table for backward compatibility
      const { data: crack, error: dbError } = await supabase
        .from('cracks')
        .insert({
          user_id: userId,
          description: description || '',
          user_question: description,
          additional_info: additionalInfo,
          image_urls: imageUrls,
          ai_notes: analysisResults.aiNotes,
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

      // Check if Professional Finder should be triggered
      const triggerCondition = shouldTriggerProfessionalFinder(analysisResults, severity, category)
      const locationInfo = extractLocationInfo(description, additionalInfo)
      
      let professionalFinderData = null
      
      if (triggerCondition.shouldTrigger) {
        // Generate Professional Finder message
        const professionalMessage = generateProfessionalFinderMessage(triggerCondition, locationInfo.hasLocation)
        
        // If we have location info, automatically search for professionals
        if (locationInfo.zipCode) {
          try {
            const searchParams = generateSearchParams(triggerCondition, locationInfo)
            const professionals = await professionalFinderAgent.searchProfessionals(searchParams)
            
            professionalFinderData = {
              shouldShow: true,
              emergencyLevel: triggerCondition.emergencyLevel,
              message: professionalMessage,
              professionals: professionals.slice(0, 3), // 只显示前3个
              searchParams: searchParams,
              autoSearched: true
            }
          } catch (error) {
            console.error('Professional search failed:', error)
            // Still show the finder UI even if search fails
            professionalFinderData = {
              shouldShow: true,
              emergencyLevel: triggerCondition.emergencyLevel,
              message: professionalMessage,
              professionals: [],
              autoSearched: false,
              searchError: 'Failed to automatically search for professionals'
            }
          }
        } else {
          // Show finder UI but require manual search
          professionalFinderData = {
            shouldShow: true,
            emergencyLevel: triggerCondition.emergencyLevel,
            message: professionalMessage,
            professionals: [],
            autoSearched: false,
            requiresZipCode: true
          }
        }
      }

      return NextResponse.json({
        success: true,
        analysis: analysisResults,
        enhancedAnalysis: {
          category,
          crackType,
          severity,
          template: template ? {
            title: template.title,
            description: template.description,
            typical_characteristics: template.typical_characteristics
          } : null,
          personalizedRecommendations: recommendations,
          analysisId
        },
        professionalFinder: professionalFinderData,
        crack: crack,
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