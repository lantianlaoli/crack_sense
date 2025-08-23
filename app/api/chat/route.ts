import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkCredits, deductCredits } from '@/lib/credits'
import { getCreditCost } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { createGeminiChat } from '@/lib/langchain-config'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { getAgentManager, AgentManager } from '@/lib/agents/agent-manager'

// Helper function to create general chat response (currently unused)
/*
async function* generateGeneralChatResponse(message: string) {
  const chat = createGeminiChat('gemini-2.0-flash')
  
  const systemPrompt = `You are CrackSense AI, a specialized assistant for structural crack analysis and building safety assessment.

Your expertise includes:
- Structural engineering and crack detection
- Building safety assessment
- Repair material recommendations
- DIY vs professional repair guidance

Guidelines:
- Provide helpful, accurate information about crack analysis and repair
- Emphasize safety first and recommend professional consultation for serious structural issues
- Be supportive for DIY repairs of low/moderate severity cracks
- Maintain a professional but approachable tone
- Focus on practical, actionable advice

Never introduce yourself by name in responses - users already know who they're talking to.`

  const systemMessage = new SystemMessage(systemPrompt)
  const humanMessage = new HumanMessage({ content: message })
  
  const stream = await chat.stream([systemMessage, humanMessage])
  
  for await (const chunk of stream) {
    if (chunk.content) {
      yield chunk.content
    }
  }
}
*/

// Helper function to get intent-specific system prompt
function getIntentSpecificPrompt(intent: string | null): string {
  const basePrompt = `You are CrackSense AI, a specialized assistant for structural crack analysis and building safety assessment.

Your expertise includes:
- Structural engineering and crack detection
- Building safety assessment
- Repair material recommendations
- DIY vs professional repair guidance

Guidelines:
- Provide helpful, accurate information about crack analysis and repair
- Emphasize safety first and recommend professional consultation for serious structural issues
- Be supportive for DIY repairs of low/moderate severity cracks
- Maintain a professional but approachable tone
- Focus on practical, actionable advice

Never introduce yourself by name in responses - users already know who they're talking to.`

  switch (intent) {
    case 'product_procurement':
      return basePrompt + `

CONTEXT: The user is asking for material or product recommendations for crack repair.

Your response should:
- Explain different repair material types and their applications (fillers, sealants, patches, etc.)
- Discuss when to use different materials based on crack type and location
- Provide general guidance on material selection criteria
- Mention that specific product recommendations with prices and ratings will be provided shortly
- Be educational about the "why" behind material choices

Focus on helping the user understand their options rather than listing specific products.`

    case 'crack_inspection':
      return basePrompt + `

CONTEXT: The user is asking for crack analysis or inspection guidance.

Your response should:
- Explain how to assess crack severity and type
- Discuss signs that indicate professional inspection is needed
- Provide guidance on monitoring crack progression
- Mention safety considerations for structural assessment
- Note that detailed technical analysis tools will provide specific findings

Focus on empowering the user with knowledge while emphasizing safety.`

    case 'repair_recommendation':
      return basePrompt + `

CONTEXT: The user is seeking repair advice and guidance.

Your response should:
- Explain general repair approaches for different crack types
- Discuss DIY vs professional repair decision factors
- Provide step-by-step thinking for repair planning
- Mention timing and preparation considerations
- Note that specific technical guidance will follow

Focus on helping the user understand the repair process and make informed decisions.`

    case 'monitoring_request':
      return basePrompt + `

CONTEXT: The user wants to monitor cracks over time.

Your response should:
- Explain the importance of crack monitoring
- Discuss what changes to look for
- Suggest monitoring frequency and methods
- Mention documentation and measurement techniques
- Note that monitoring tools and systems will be recommended

Focus on helping the user establish an effective monitoring routine.`

    case 'professional_finder':
      return basePrompt + `

CONTEXT: The user is looking for professional help.

Your response should:
- Explain when professional consultation is recommended
- Discuss different types of professionals (structural engineers, contractors, etc.)
- Mention what to look for in qualified professionals
- Discuss questions to ask potential contractors
- Note that professional referral resources will be provided

Focus on helping the user understand their professional service options.`

    default:
      return basePrompt + `

CONTEXT: General crack-related inquiry.

Your response should:
- Provide helpful general information about structural cracks
- Ask clarifying questions if needed to better assist
- Offer multiple aspects of guidance (analysis, repair, monitoring)
- Be educational and supportive
- Note that specialized tools are available for specific needs

Focus on being comprehensively helpful while identifying the user's specific needs.`
  }
}

// Streaming chat function with CrackCheck AI priority response
async function* streamChatWithAgents(
  message: string, 
  userId: string,
  conversationId?: string
) {
  try {
    const agentManager = getAgentManager()
    
    console.log('Processing message with agent system:', message)
    
    // Check if we should use agents
    const shouldUseAgents = AgentManager.shouldUseAgents(message)
    
    // Get intent classification if agents will be triggered
    let detectedIntent: string | null = null
    if (shouldUseAgents) {
      // Use the intent classifier to determine the user's intent
      const { IntentClassifier } = await import('@/lib/agents/intent-classifier')
      const classifier = new IntentClassifier()
      try {
        detectedIntent = await classifier.classifyIntent(message)
        console.log('Detected intent:', detectedIntent)
      } catch (intentError) {
        console.error('Intent classification failed:', intentError)
        detectedIntent = 'general_chat'
      }
    }
    
    // Always start with CrackCheck AI response first
    yield JSON.stringify({
      type: 'chat_start'
    }) + '\n\n'
    
    // Generate personalized CrackCheck AI response based on detected intent
    const aiSystemPrompt = getIntentSpecificPrompt(detectedIntent)

    // Generate CrackCheck AI response with customized prompt
    const chat = createGeminiChat('gemini-2.0-flash')
    const systemMessage = new SystemMessage(aiSystemPrompt)
    const humanMessage = new HumanMessage({ content: message })
    const stream = await chat.stream([systemMessage, humanMessage])
    
    // Stream CrackCheck AI response
    for await (const chunk of stream) {
      if (chunk.content) {
        yield JSON.stringify({
          type: 'chat_chunk',
          content: chunk.content
        }) + '\n\n'
      }
    }
    
    // If agents should be triggered, process in parallel after AI response
    if (shouldUseAgents) {
      console.log('Triggering agent system after AI response')
      
      // Process with agent system (this runs after AI response completes)
      const result = await agentManager.processMessage(message, userId, conversationId)
      
      if (result.isAgentTriggered && result.agentResponses.length > 0) {
        // Yield agent responses
        for (const response of result.agentResponses) {
          if (response.status === 'success' && response.data) {
            yield JSON.stringify({
              type: 'agent_result',
              agentType: response.agentType,
              data: response.data,
              message: response.message
            }) + '\n\n'
          }
        }
        
        // Note: Removed final_response to prevent overwriting CrackCheck AI content
        // Agent results will be displayed independently via AgentMessage components
      }
    }
    
    console.log('Chat processing completed')
  } catch (error) {
    console.error('Agent system error:', error)
    yield JSON.stringify({
      type: 'error',
      message: 'Sorry, I encountered an error while processing your message. Please try again.'
    }) + '\n\n'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, model = 'gemini-2.0-flash', conversationId } = body

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!['gemini-2.0-flash', 'gemini-2.5-flash'].includes(model)) {
      return NextResponse.json({ error: 'Invalid model specified' }, { status: 400 })
    }

    // Check if user has enough credits (use same cost as image analysis for simplicity)
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

    // Deduct credits before chat
    const deductResult = await deductCredits(userId, requiredCredits)
    if (!deductResult.success) {
      return NextResponse.json({ error: deductResult.error }, { status: 500 })
    }

    try {
      // Create readable stream for streaming response
      const encoder = new TextEncoder()
      
      const stream = new ReadableStream({
        async start(controller) {
          let fullResponse = ''
          
          try {
            // Stream chat with agent system
            for await (const chunk of streamChatWithAgents(
              message,
              userId,
              conversationId
            )) {
              fullResponse += chunk
              
              // Send chunk to client
              const data = JSON.stringify({
                success: true,
                chunk,
                creditsUsed: requiredCredits,
                remainingCredits: deductResult.remainingCredits
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
            
            // Save conversation message if conversationId is provided
            if (conversationId && fullResponse) {
              await supabase
                .from('conversation_messages')
                .insert([
                  {
                    conversation_id: conversationId,
                    message_type: 'user',
                    content: message
                  },
                  {
                    conversation_id: conversationId,
                    message_type: 'assistant',
                    content: fullResponse
                  }
                ])
            }
            
            // Send final completion signal
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
            controller.close()
          } catch (error) {
            console.error('Streaming error:', error)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              error: 'Chat failed. Please try again.' 
            })}\n\n`))
            controller.close()
          }
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      })
    } catch (chatError) {
      console.error('Chat failed after credit deduction:', chatError)
      return NextResponse.json({ 
        error: 'Chat failed. Credits have been deducted but chat could not be completed.',
        creditsDeducted: requiredCredits
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in POST /api/chat:', error)
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}