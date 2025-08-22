import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import type { AgentIntent, IntentClassifierConfig } from './types'

export class IntentClassifier {
  private llm: ChatOpenAI
  private config: IntentClassifierConfig

  constructor() {
    this.llm = new ChatOpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
      },
      model: 'google/gemini-2.0-flash-exp:free',
      temperature: 0.1,
    })

    this.config = {
      threshold: 0.7,
      keywords: {
        general_chat: ['hello', 'hi', 'how', 'what', 'why', 'when', 'where', 'help', 'thanks'],
        crack_inspection: ['crack', 'analyze', 'inspection', 'examine', 'photo', 'image', 'picture'],
        repair_recommendation: ['fix', 'repair', 'how to', 'should i', 'recommend', 'advice', 'solution'],
        product_procurement: ['buy', 'purchase', 'product', 'material', 'tool', 'equipment', 'amazon', 'store'],
        monitoring_request: ['monitor', 'track', 'watch', 'check regularly', 'remind', 'schedule'],
        professional_finder: ['professional', 'expert', 'engineer', 'contractor', 'inspector', 'company']
      },
      patterns: {
        general_chat: [/^(hi|hello|thanks)/i, /what (is|are|can)/i],
        crack_inspection: [/analyze.*(crack|wall|image)/i, /what.*(crack|damage)/i],
        repair_recommendation: [/how.*(fix|repair)/i, /should.*(repair|fix)/i],
        product_procurement: [/(recommend|suggest).*(product|material)/i, /where.*(buy|purchase)/i],
        monitoring_request: [/monitor|track.*(crack|damage)/i, /remind.*(check|photo)/i],
        professional_finder: [/find.*(professional|expert)/i, /contact.*(engineer|contractor)/i]
      }
    }
  }

  async classifyIntent(userInput: string, context?: { hasImages?: boolean }): Promise<AgentIntent> {
    try {
      // First try fast classification based on keywords and patterns
      const quickClassification = this.quickClassify(userInput, context)
      if (quickClassification !== 'general_chat') {
        return quickClassification
      }

      // If fast classification is uncertain, use LLM for more precise classification
      return await this.llmClassify(userInput, context)
    } catch (error) {
      console.error('Intent classification error:', error)
      return 'general_chat'
    }
  }

  private quickClassify(userInput: string, context?: { hasImages?: boolean }): AgentIntent {
    const input = userInput.toLowerCase()

    // If there are images, likely an inspection request
    if (context?.hasImages) {
      return 'crack_inspection'
    }

    // Check keyword matching
    for (const [intent, keywords] of Object.entries(this.config.keywords)) {
      for (const keyword of keywords) {
        if (input.includes(keyword.toLowerCase())) {
          // Special logic: if product/material keywords mentioned, prioritize procurement
          if (intent === 'product_procurement' || 
              (intent === 'repair_recommendation' && this.hasProductKeywords(input))) {
            return 'product_procurement'
          }
          return intent as AgentIntent
        }
      }
    }

    // Check regex patterns
    for (const [intent, patterns] of Object.entries(this.config.patterns)) {
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          return intent as AgentIntent
        }
      }
    }

    return 'general_chat'
  }

  private hasProductKeywords(input: string): boolean {
    const productKeywords = ['material', 'product', 'buy', 'purchase', 'recommend', 'suggest', 'tool', 'equipment']
    return productKeywords.some(keyword => input.includes(keyword))
  }

  private async llmClassify(userInput: string, context?: { hasImages?: boolean }): Promise<AgentIntent> {
    const prompt = PromptTemplate.fromTemplate(`
You are an intent classifier for a crack inspection and repair system. Analyze the user input and classify it into one of these categories:

Categories:
- general_chat: General questions, greetings, or casual conversation
- crack_inspection: Requests to analyze cracks, examine photos, or assess damage
- repair_recommendation: Asking for repair advice, how to fix something, or solution guidance
- product_procurement: Asking for product recommendations, materials to buy, or shopping guidance
- monitoring_request: Requests to track changes, set reminders, or monitor progress
- professional_finder: Looking for professional help, contractors, or expert services

User input: "{userInput}"
Context: {context}

Important: If the user is asking about materials, products, or what to buy for repairs, classify as "product_procurement".

Respond with only the category name (no explanations):
`)

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser())
    
    const result = await chain.invoke({
      userInput,
      context: context ? JSON.stringify(context) : 'No additional context'
    })

    const classification = result.trim().toLowerCase()
    
    // Validate classification result
    const validIntents: AgentIntent[] = [
      'general_chat', 'crack_inspection', 'repair_recommendation', 
      'product_procurement', 'monitoring_request', 'professional_finder'
    ]
    
    if (validIntents.includes(classification as AgentIntent)) {
      return classification as AgentIntent
    }

    return 'general_chat'
  }

  // Get intent confidence (for debugging and optimization)
  getIntentConfidence(userInput: string, intent: AgentIntent): number {
    const input = userInput.toLowerCase()
    const keywords = this.config.keywords[intent] || []
    const patterns = this.config.patterns[intent] || []

    let score = 0
    const maxScore = keywords.length + patterns.length

    // Keyword matching score
    for (const keyword of keywords) {
      if (input.includes(keyword.toLowerCase())) {
        score += 1
      }
    }

    // Pattern matching score
    for (const pattern of patterns) {
      if (pattern.test(input)) {
        score += 1
      }
    }

    return maxScore > 0 ? score / maxScore : 0
  }
}