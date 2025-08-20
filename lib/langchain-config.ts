import { ChatOpenAI } from "@langchain/openai"
import { z } from "zod"

// Gemini model mapping (keeping your existing configuration)
const modelMapping = {
  'gemini-2.0-flash': 'google/gemini-2.0-flash-001',
  'gemini-2.5-flash': 'google/gemini-2.5-flash-lite'
} as const

export type GeminiModel = keyof typeof modelMapping

// Create Gemini chat instance via OpenRouter
export function createGeminiChat(model: GeminiModel) {
  const openrouterApiKey = process.env.OPENROUTER_API_KEY
  
  if (!openrouterApiKey) {
    throw new Error('OpenRouter API key not configured')
  }

  return new ChatOpenAI({
    modelName: modelMapping[model],
    apiKey: openrouterApiKey,
    temperature: 0.1,
    maxTokens: 2000,
    streaming: true,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://crackcheck.com",
        "X-Title": "CrackCheck AI Analysis"
      }
    }
  })
}

// Zod schema for crack analysis structured output
export const CrackAnalysisSchema = z.object({
  confidence: z.number()
    .min(85, "Confidence must be at least 85")
    .max(99, "Confidence must not exceed 99")
    .describe("Analysis confidence level"),
    
  riskLevel: z.enum(["low", "moderate", "high"])
    .describe("Overall risk assessment level"),
    
  crackCount: z.number()
    .min(0, "Crack count cannot be negative")
    .describe("Number of cracks identified"),
    
  findings: z.array(
    z.object({
      type: z.string().describe("Type of crack (e.g., Horizontal Crack, Vertical Crack, Settlement Crack)"),
      severity: z.enum(["Low", "Moderate", "High"]).describe("Severity level of this specific crack"),
      length: z.string().describe("Crack length with units (e.g., 1.2m, 60cm)"),
      width: z.string().describe("Crack width with units (e.g., 2.5mm, 0.5mm)"),
      description: z.string().describe("Detailed technical description of the crack, location, pattern, and likely structural cause")
    })
  ).describe("Detailed findings for each crack identified"),
  
  recommendations: z.array(z.string())
    .min(1, "At least one recommendation is required")
    .describe("Array of specific technical recommendations and action items"),
    
  aiNotes: z.string()
    .min(1, "Analysis notes are required")
    .describe("Comprehensive professional structural engineering analysis summary")
})

export type CrackAnalysis = z.infer<typeof CrackAnalysisSchema>

// Create structured Gemini chat for crack analysis
export function createStructuredGeminiChat(model: GeminiModel) {
  const chat = createGeminiChat(model)
  return chat.withStructuredOutput(CrackAnalysisSchema)
}