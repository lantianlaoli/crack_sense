import { IntentClassifier } from './intent-classifier'
import { InspectionAgent } from './inspection-agent'
import { RecommendationAgent } from './recommendation-agent'
import { ProcurementAgent } from './procurement-agent'
import { professionalFinderAgent } from '../professional-finder-agent'
import { extractLocationInfo, generateSearchParams } from '../professional-finder-integration'
import type { AgentResponse } from './types'

export class SimpleAgentCoordinator {
  private intentClassifier: IntentClassifier
  private inspectionAgent: InspectionAgent
  private recommendationAgent: RecommendationAgent
  private procurementAgent: ProcurementAgent

  constructor() {
    this.intentClassifier = new IntentClassifier()
    this.inspectionAgent = new InspectionAgent()
    this.recommendationAgent = new RecommendationAgent()
    this.procurementAgent = new ProcurementAgent()
  }

  async processMessage(
    message: string,
    userId: string,
    conversationId?: string
  ): Promise<{
    isAgentTriggered: boolean
    finalResponse?: string
    agentResponses: AgentResponse[]
    errors: string[]
  }> {
    const agentResponses: AgentResponse[] = []
    // const errors: string[] = [] // currently unused
    
    try {
      // Step 1: Classify intent
      const intent = await this.intentClassifier.classifyIntent(message)
      
      console.log('Detected intent:', intent)
      
      // Step 2: Route to appropriate agents based on intent
      switch (intent) {
        case 'crack_inspection':
          return await this.handleInspectionFlow(message, userId, agentResponses, conversationId)
          
        case 'repair_recommendation':
          return await this.handleRecommendationFlow(message, userId, agentResponses, conversationId)
          
        case 'product_procurement':
          return await this.handleProcurementFlow(message, userId, agentResponses, conversationId)
          
        case 'professional_finder':
          return await this.handleProfessionalFinderFlow(message, userId, agentResponses, conversationId)
          
        case 'general_chat':
        default:
          return {
            isAgentTriggered: false,
            agentResponses: [],
            errors: []
          }
      }
      
    } catch (error) {
      console.error('Agent coordination error:', error)
      return {
        isAgentTriggered: false,
        agentResponses: [],
        errors: ['Failed to process message with agent system']
      }
    }
  }

  private async handleInspectionFlow(
    message: string,
    userId: string,
    agentResponses: AgentResponse[],
    conversationId?: string
  ) {
    try {
      // Analyze from description (simplified - in real implementation would handle images)
      const inspectionResult = await this.inspectionAgent.analyzeFromDescription(message)
      
      agentResponses.push({
        agentType: 'inspection',
        status: 'success',
        data: inspectionResult,
        message: 'Crack inspection completed',
        timestamp: new Date()
      })

      // Determine next agent
      const nextAgent = this.inspectionAgent.getNextRecommendedAgent(inspectionResult)
      
      if (nextAgent === 'recommendation') {
        const recommendationResult = await this.recommendationAgent.generateRecommendations(
          inspectionResult,
          message
        )
        
        agentResponses.push({
          agentType: 'recommendation',
          status: 'success',
          data: recommendationResult,
          message: 'Repair recommendations generated',
          timestamp: new Date()
        })

        // Check if we should get products
        if (this.recommendationAgent.shouldTriggerProcurement(recommendationResult)) {
          const procurementResult = await this.procurementAgent.getProductRecommendations(
            message,
            userId,
            { inspectionResult, recommendationResult, conversationId }
          )
          
          agentResponses.push({
            agentType: 'procurement',
            status: 'success',
            data: procurementResult,
            message: 'Product recommendations generated',
            timestamp: new Date()
          })
        }
      }

      return {
        isAgentTriggered: true,
        finalResponse: this.generateFinalResponse(agentResponses),
        agentResponses,
        errors: []
      }

    } catch (error) {
      console.error('Inspection flow error:', error)
      return {
        isAgentTriggered: false,
        agentResponses: [],
        errors: ['Inspection analysis failed']
      }
    }
  }

  private async handleRecommendationFlow(
    message: string,
    userId: string,
    agentResponses: AgentResponse[],
    conversationId?: string
  ) {
    try {
      const recommendationResult = await this.recommendationAgent.generateQuickAdvice(message)
      
      agentResponses.push({
        agentType: 'recommendation',
        status: 'success',
        data: recommendationResult,
        message: 'Repair recommendations generated',
        timestamp: new Date()
      })

      // Check if we should get products
      if (this.recommendationAgent.shouldTriggerProcurement(recommendationResult)) {
        const procurementResult = await this.procurementAgent.getProductRecommendations(
          message,
          userId,
          { recommendationResult, conversationId }
        )
        
        agentResponses.push({
          agentType: 'procurement',
          status: 'success',
          data: procurementResult,
          message: 'Product recommendations generated',
          timestamp: new Date()
        })
      }

      return {
        isAgentTriggered: true,
        finalResponse: this.generateFinalResponse(agentResponses),
        agentResponses,
        errors: []
      }

    } catch (error) {
      console.error('Recommendation flow error:', error)
      return {
        isAgentTriggered: false,
        agentResponses: [],
        errors: ['Recommendation generation failed']
      }
    }
  }

  private async handleProcurementFlow(
    message: string,
    userId: string,
    agentResponses: AgentResponse[],
    conversationId?: string
  ) {
    try {
      const procurementResult = await this.procurementAgent.getProductRecommendations(
        message,
        userId,
        { conversationId }
      )
      
      agentResponses.push({
        agentType: 'procurement',
        status: 'success',
        data: procurementResult,
        message: 'Product recommendations generated',
        timestamp: new Date()
      })

      return {
        isAgentTriggered: true,
        finalResponse: this.generateFinalResponse(agentResponses),
        agentResponses,
        errors: []
      }

    } catch (error) {
      console.error('Procurement flow error:', error)
      return {
        isAgentTriggered: false,
        agentResponses: [],
        errors: ['Product recommendation failed']
      }
    }
  }

  private async handleProfessionalFinderFlow(
    message: string,
    userId: string,
    agentResponses: AgentResponse[],
    conversationId?: string
  ) {
    try {
      // Extract location information from message
      const locationInfo = extractLocationInfo(message)
      console.log('Location extraction result:', locationInfo, 'for message:', message)
      
      if (!locationInfo.hasLocation) {
        // Return guidance on how to get location-based help
        const guidance = {
          message: 'I can help you find local structural engineers! To provide the most relevant professionals in your area, could you please share your location (city, state, or zip code)?',
          requiresLocation: true,
          examples: [
            'I live in Manhattan, New York',
            'Located in 10001',
            'My house is in Los Angeles, CA'
          ]
        }
        
        agentResponses.push({
          agentType: 'professional_finder',
          status: 'success',
          data: guidance,
          message: 'Location guidance provided',
          timestamp: new Date()
        })

        return {
          isAgentTriggered: true,
          finalResponse: this.generateFinalResponse(agentResponses),
          agentResponses,
          errors: []
        }
      }

      // Generate search parameters for professional search
      const searchParams = generateSearchParams(
        { 
          emergencyLevel: 'medium', 
          shouldTrigger: true, 
          reason: 'User requested professional help',
          urgencyMessage: '用户主动请求专业帮助'
        },
        locationInfo
      )

      // Search for professionals
      console.log('Searching professionals with params:', searchParams)
      const professionals = await professionalFinderAgent.searchProfessionals(searchParams)
      console.log('Found professionals:', professionals.length, professionals)

      const professionalFinderData = {
        shouldShow: true,
        emergencyLevel: 'medium',
        message: 'Based on your request, I found local structural engineers who can help you:',
        professionals: professionals.slice(0, 5),
        searchParams: searchParams,
        autoSearched: true,
        location: {
          zipCode: locationInfo.zipCode,
          hasLocation: true
        }
      }
      
      agentResponses.push({
        agentType: 'professional_finder',
        status: 'success',
        data: professionalFinderData,
        message: `Found ${professionals.length} local professionals`,
        timestamp: new Date()
      })

      return {
        isAgentTriggered: true,
        finalResponse: this.generateFinalResponse(agentResponses),
        agentResponses,
        errors: []
      }

    } catch (error) {
      console.error('Professional finder flow error:', error)
      return {
        isAgentTriggered: false,
        agentResponses: [],
        errors: ['Professional finder failed']
      }
    }
  }

  private generateFinalResponse(agentResponses: AgentResponse[]): string {
    let response = ''
    
    for (const agentResponse of agentResponses) {
      switch (agentResponse.agentType) {
        case 'inspection':
          if (agentResponse.data) {
            response += `## Crack Analysis Complete\n\n`
            response += `**Type:** ${agentResponse.data.crackType}\n`
            response += `**Severity:** ${agentResponse.data.severity}\n`
            response += `**Risk Level:** ${agentResponse.data.riskLevel}\n\n`
          }
          break
          
        case 'recommendation':
          if (agentResponse.data) {
            response += `## Repair Recommendations\n\n`
            response += `**Recommended Action:** ${agentResponse.data.primaryRecommendation.toUpperCase()}\n\n`
            response += `${agentResponse.data.reasoning}\n\n`
          }
          break
          
        case 'procurement':
          if (agentResponse.data) {
            response += `## Product Recommendations\n\n`
            response += `Found ${agentResponse.data.totalRecommendations} suitable products in ${agentResponse.data.category}.\n\n`
          }
          break
          
        case 'professional_finder':
          if (agentResponse.data) {
            if (agentResponse.data.requiresLocation) {
              response += `## Professional Help Available\n\n`
              response += `${agentResponse.data.message}\n\n`
            } else if (agentResponse.data.professionals && agentResponse.data.professionals.length > 0) {
              response += `## Local Structural Engineers\n\n`
              response += `${agentResponse.data.message}\n\n`
              response += `Found ${agentResponse.data.professionals.length} qualified professionals in your area.\n\n`
            }
          }
          break
      }
    }

    return response || 'Analysis complete. Please see the detailed results above.'
  }
}