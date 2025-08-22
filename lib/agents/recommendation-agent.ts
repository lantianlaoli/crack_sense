import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import type { InspectionResult, RecommendationResult } from './types'

export class RecommendationAgent {
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENROUTER_API_KEY,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
      },
      model: 'google/gemini-2.0-flash',
      temperature: 0.2,
    })
  }

  async generateRecommendations(
    inspectionResult?: InspectionResult,
    userQuery?: string,
    userSkillLevel?: 'beginner' | 'intermediate' | 'expert'
  ): Promise<RecommendationResult> {
    try {
      const prompt = PromptTemplate.fromTemplate(`
You are a structural repair expert providing practical recommendations for crack repair.

Analysis Data:
{analysisData}

User Query: {userQuery}
User Skill Level: {skillLevel}

Based on this information, provide repair recommendations in this JSON format:
{{
  "primaryRecommendation": "diy|monitor|professional",
  "reasoning": "explanation of why this approach is recommended",
  "steps": ["step 1", "step 2", "step 3"],
  "timeframe": "when to take action",
  "warnings": ["warning 1", "warning 2"]
}}

Decision Guidelines:
- DIY: Low severity cracks, cosmetic issues, user has appropriate skill level
- Monitor: Moderate severity, stable cracks that need observation
- Professional: High severity, structural concerns, or user lacks confidence

Always prioritize safety. When in doubt, recommend professional consultation.
`)

      const analysisData = inspectionResult ? {
        crackType: inspectionResult.crackType,
        severity: inspectionResult.severity,
        riskLevel: inspectionResult.riskLevel,
        confidence: inspectionResult.confidence,
        findings: inspectionResult.findings
      } : 'No inspection data available'

      const chain = prompt.pipe(this.llm).pipe(new StringOutputParser())
      
      const result = await chain.invoke({
        analysisData: JSON.stringify(analysisData, null, 2),
        userQuery: userQuery || 'General repair guidance needed',
        skillLevel: userSkillLevel || 'beginner'
      })

      return this.parseRecommendationResult(result)

    } catch (error) {
      console.error('Recommendation agent error:', error)
      throw new Error('Failed to generate recommendations')
    }
  }

  async generateQuickAdvice(userQuery: string): Promise<RecommendationResult> {
    try {
      const prompt = PromptTemplate.fromTemplate(`
You are a repair expert providing quick advice for crack-related questions.

User Question: {userQuery}

Provide practical advice in JSON format:
{{
  "primaryRecommendation": "diy|monitor|professional",
  "reasoning": "brief explanation",
  "steps": ["practical step 1", "practical step 2"],
  "timeframe": "recommended timeline",
  "warnings": ["important safety note"]
}}

Keep advice practical and safety-focused. When specific crack details are unknown, err on the side of caution.
`)

      const chain = prompt.pipe(this.llm).pipe(new StringOutputParser())
      
      const result = await chain.invoke({
        userQuery
      })

      return this.parseRecommendationResult(result)

    } catch (error) {
      console.error('Quick advice error:', error)
      throw new Error('Failed to generate quick advice')
    }
  }

  private parseRecommendationResult(content: string): RecommendationResult {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      return {
        primaryRecommendation: parsed.primaryRecommendation || 'professional',
        reasoning: parsed.reasoning || 'Professional assessment recommended for safety',
        steps: parsed.steps || ['Consult with a structural engineer'],
        timeframe: parsed.timeframe || 'As soon as possible',
        warnings: parsed.warnings || ['Safety first - when in doubt, seek professional help']
      }

    } catch (error) {
      console.error('Failed to parse recommendation result:', error)
      
      return {
        primaryRecommendation: 'professional',
        reasoning: 'Unable to generate specific recommendations. Professional consultation advised for safety.',
        steps: [
          'Document the crack with photos and measurements',
          'Contact a structural engineer or qualified contractor',
          'Avoid DIY repairs until professional assessment is complete'
        ],
        timeframe: 'Within 1-2 weeks',
        warnings: ['Do not attempt repairs without professional guidance']
      }
    }
  }

  // Determine if Procurement Agent should be triggered
  shouldTriggerProcurement(result: RecommendationResult): boolean {
    return result.primaryRecommendation === 'diy' || 
           (result.primaryRecommendation === 'monitor' && 
            result.steps.some(step => 
              step.toLowerCase().includes('material') || 
              step.toLowerCase().includes('product') ||
              step.toLowerCase().includes('sealant') ||
              step.toLowerCase().includes('filler')
            ))
  }

  // Generate query for Procurement Agent
  generateProcurementQuery(result: RecommendationResult, inspectionResult?: InspectionResult): string {
    const severity = inspectionResult?.severity || 'moderate'
    const crackType = inspectionResult?.crackType || 'general crack'
    
    if (result.primaryRecommendation === 'diy') {
      return `DIY repair materials for ${severity} severity ${crackType} repair`
    }
    
    if (result.primaryRecommendation === 'monitor') {
      return `Monitoring and minor repair materials for ${crackType}`
    }
    
    return `General crack repair materials`
  }
}