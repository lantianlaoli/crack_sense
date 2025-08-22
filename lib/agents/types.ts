// Core type definitions for the Agent system

export interface AgentState {
  // User input and conversation information
  userInput: string
  userId: string
  conversationId?: string
  messageHistory: ChatMessage[]
  
  // Agent identification and routing
  detectedIntent: AgentIntent | null
  activeAgent: AgentType | null
  agentStatus: AgentStatus
  
  // Agent results
  inspectionResult?: InspectionResult
  recommendationResult?: RecommendationResult
  procurementResult?: ProcurementResult
  
  // Final response
  finalResponse: string
  agentResponses: AgentResponse[]
  
  // Error handling
  errors: string[]
}

export type AgentIntent = 
  | 'general_chat'
  | 'crack_inspection'
  | 'repair_recommendation' 
  | 'product_procurement'
  | 'monitoring_request'
  | 'professional_finder'

export type AgentType =
  | 'inspection'
  | 'recommendation'
  | 'procurement'
  | 'monitoring'
  | 'professional_finder'

export type AgentStatus = 
  | 'idle'
  | 'analyzing_intent'
  | 'running_agent'
  | 'completed'
  | 'error'

export interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'agent'
  content: string
  timestamp: Date
  agentType?: AgentType
  agentData?: any
}

export interface AgentResponse {
  agentType: AgentType
  status: 'success' | 'error'
  data?: any
  message: string
  timestamp: Date
}

// Inspection Agent related types
export interface InspectionResult {
  crackType: string
  severity: 'low' | 'moderate' | 'high'
  riskLevel: 'low' | 'moderate' | 'high'
  confidence: number
  findings: Array<{
    type: string
    severity: string
    description: string
  }>
  recommendations: string[]
}

// Recommendation Agent related types
export interface RecommendationResult {
  primaryRecommendation: 'diy' | 'monitor' | 'professional'
  reasoning: string
  steps: string[]
  timeframe?: string
  warnings?: string[]
}

// Procurement Agent related types
export interface ProcurementResult {
  products: Array<{
    id: string
    title: string
    price: number
    rating: number
    url: string
    image_url?: string
    reason: string
  }>
  totalRecommendations: number
  category: string
}

// Intent classifier configuration
export interface IntentClassifierConfig {
  threshold: number
  keywords: Record<AgentIntent, string[]>
  patterns: Record<AgentIntent, RegExp[]>
}