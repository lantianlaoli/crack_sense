import { SimpleAgentCoordinator } from './simple-agent-coordinator'
import type { AgentResponse } from './types'

export class AgentManager {
  private coordinator: SimpleAgentCoordinator

  constructor() {
    this.coordinator = new SimpleAgentCoordinator()
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
    return await this.coordinator.processMessage(message, userId, conversationId)
  }

  reset(): void {
    // Reset any internal state if needed
  }

  // Helper method to determine if a message should trigger agents
  static shouldUseAgents(message: string): boolean {
    const lowerMessage = message.toLowerCase()
    
    // Keywords that suggest crack-related queries
    const crackKeywords = [
      'crack', 'cracks', 'cracking', 'fracture', 'split', 'damage',
      'repair', 'fix', 'patch', 'seal', 'structural', 'foundation',
      'wall', 'ceiling', 'drywall', 'concrete', 'mortar', 'stucco',
      'material', 'product', 'buy', 'purchase', 'recommend', 'suggestion',
      'diy', 'professional', 'contractor', 'engineer'
    ]

    // Image-related keywords
    const imageKeywords = [
      'image', 'photo', 'picture', 'uploaded', 'attached', 'analyze', 'look at'
    ]

    return crackKeywords.some(keyword => lowerMessage.includes(keyword)) ||
           imageKeywords.some(keyword => lowerMessage.includes(keyword)) ||
           (lowerMessage.includes('what') && lowerMessage.includes('use')) ||
           (lowerMessage.includes('how') && lowerMessage.includes('fix'))
  }
}

// Global instance
let globalAgentManager: AgentManager | null = null

export function getAgentManager(): AgentManager {
  if (!globalAgentManager) {
    globalAgentManager = new AgentManager()
  }
  return globalAgentManager
}