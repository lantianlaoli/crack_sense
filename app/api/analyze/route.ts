import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkCredits, deductCredits } from '@/lib/credits'
import { getCreditCost } from '@/lib/constants'

// OpenRouter AI analysis function
async function analyzeImages(imageUrls: string[], description?: string, model: 'gpt-4o-mini' | 'gpt-4o' = 'gpt-4o-mini') {
  const openrouterApiKey = process.env.OPENROUTER_API_KEY
  if (!openrouterApiKey) {
    throw new Error('OpenRouter API key not configured')
  }

  const prompt = `You are an expert structural engineer and building inspector. Analyze the provided images of wall cracks and provide a comprehensive assessment.

${description ? `User description: "${description}"` : ''}

Please analyze the images and provide:
1. Overall risk level (low, moderate, high)
2. Confidence level in your analysis (percentage)
3. Number of distinct cracks visible
4. Detailed findings for each crack identified
5. Specific recommendations for action

Format your response as JSON with this structure:
{
  "confidence": number (85-99),
  "riskLevel": "low" | "moderate" | "high",
  "crackCount": number,
  "findings": [
    {
      "type": "string (e.g., Horizontal Crack, Vertical Crack, etc.)",
      "severity": "Low" | "Moderate" | "High",
      "length": "string with units (e.g., 1.2m)",
      "width": "string with units (e.g., 2.5mm)",
      "description": "detailed description of the crack and likely cause"
    }
  ],
  "recommendations": ["array of specific action items"],
  "aiNotes": "detailed professional analysis summary"
}`

  const messages = [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        ...imageUrls.map(url => ({
          type: 'image_url',
          image_url: { url }
        }))
      ]
    }
  ]

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openrouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://crackcheck.com',
      'X-Title': 'CrackCheck AI Analysis',
    },
    body: JSON.stringify({
      model: `openai/${model}`,
      messages,
      temperature: 0.1,
      max_tokens: 2000,
    })
  })

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('No response content from OpenRouter')
  }

  try {
    // Try to parse JSON response
    return JSON.parse(content)
  } catch {
    // If JSON parsing fails, return structured fallback
    return {
      confidence: 85,
      riskLevel: 'moderate' as const,
      crackCount: 1,
      findings: [{
        type: 'Analysis Result',
        severity: 'Moderate',
        length: 'Variable',
        width: 'Variable',
        description: content
      }],
      recommendations: ['Consult with a structural engineer', 'Monitor for changes'],
      aiNotes: content
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { imageUrls, description, model = 'gpt-4o-mini' } = body

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
      const analysisResults = await analyzeImages(imageUrls, description, model as 'gpt-4o-mini' | 'gpt-4o')

      return NextResponse.json({
        success: true,
        analysis: analysisResults,
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