import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import type { InspectionResult } from './types'

export class InspectionAgent {
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENROUTER_API_KEY,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
      },
      model: 'google/gemini-2.5-flash',
      temperature: 0.1,
    })
  }

  async analyzeImages(
    images: string[], // base64 encoded images
    userDescription?: string
  ): Promise<InspectionResult> {
    try {
      const systemPrompt = `You are a structural engineering expert specializing in crack analysis. 
Analyze the provided images and user description to assess crack severity and provide recommendations.

Your analysis should include:
1. Crack type identification (hairline, settlement, structural, thermal, etc.)
2. Severity assessment (low, moderate, high)
3. Risk level evaluation
4. Confidence level in your assessment
5. Specific findings for each crack observed
6. Recommended actions

Respond in this JSON format:
{
  "crackType": "string",
  "severity": "low|moderate|high", 
  "riskLevel": "low|moderate|high",
  "confidence": number (0-100),
  "findings": [
    {
      "type": "string",
      "severity": "string", 
      "description": "string"
    }
  ],
  "recommendations": ["string"]
}

Guidelines:
- Low severity: Cosmetic cracks, hairline, no structural concern
- Moderate severity: Visible cracks that need monitoring or minor repair
- High severity: Structural concerns requiring professional assessment`

      const userContent = [
        { type: 'text' as const, text: userDescription || 'Please analyze these crack images' },
        ...images.map(imageData => ({
          type: 'image_url' as const,
          image_url: { url: imageData }
        }))
      ]

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage({ content: userContent })
      ]

      const response = await this.llm.invoke(messages)
      
      // Parse JSON response
      const result = this.parseAnalysisResult(response.content as string)
      return result

    } catch (error) {
      console.error('Inspection agent error:', error)
      throw new Error('Failed to analyze crack images')
    }
  }

  async analyzeFromDescription(description: string): Promise<InspectionResult> {
    try {
      const systemPrompt = `You are a structural engineering expert. Based on the user's description of cracks, 
provide a preliminary assessment. Since you cannot see images, provide conservative recommendations.

Respond in the same JSON format as image analysis, but note the limitations of text-only analysis.`

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(`Analyze this crack description: ${description}`)
      ]

      const response = await this.llm.invoke(messages)
      const result = this.parseAnalysisResult(response.content as string)
      
      // Lower confidence since based only on description
      result.confidence = Math.min(result.confidence * 0.6, 60)
      
      return result

    } catch (error) {
      console.error('Description analysis error:', error)
      throw new Error('Failed to analyze crack description')
    }
  }

  private parseAnalysisResult(content: string): InspectionResult {
    try {
      // Extract JSON part
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      // Validate required fields
      const required = ['crackType', 'severity', 'riskLevel', 'confidence', 'findings', 'recommendations']
      for (const field of required) {
        if (!(field in parsed)) {
          throw new Error(`Missing required field: ${field}`)
        }
      }

      return {
        crackType: parsed.crackType,
        severity: parsed.severity,
        riskLevel: parsed.riskLevel, 
        confidence: Math.min(Math.max(parsed.confidence, 0), 100),
        findings: parsed.findings || [],
        recommendations: parsed.recommendations || []
      }

    } catch (error) {
      console.error('Failed to parse analysis result:', error)
      
      // Return safe default result
      return {
        crackType: 'Unknown',
        severity: 'moderate',
        riskLevel: 'moderate',
        confidence: 30,
        findings: [{
          type: 'Unknown crack',
          severity: 'Moderate',
          description: 'Unable to analyze crack details. Professional inspection recommended.'
        }],
        recommendations: [
          'Professional inspection recommended due to analysis limitations',
          'Monitor crack for changes',
          'Document crack with photos and measurements'
        ]
      }
    }
  }

  // Get recommended next Agent
  getNextRecommendedAgent(result: InspectionResult): 'recommendation' | 'professional_finder' | null {
    if (result.riskLevel === 'high' || result.severity === 'high') {
      return 'professional_finder'
    }
    
    if (result.riskLevel === 'low' || result.riskLevel === 'moderate') {
      return 'recommendation'
    }
    
    return null
  }
}