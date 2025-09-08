import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkCredits } from '@/lib/credits'
import { supabase } from '@/lib/supabase'

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

// Helper function to get intent-specific system prompt (currently unused)
/*
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
*/

// Streaming chat function with CrackCheck AI priority response
// Simple chat function without complex agent system
async function* streamChat(
  message: string
) {
  try {
    console.log('Processing chat message:', message)
    
    // Always start with chat start signal
    yield JSON.stringify({
      type: 'chat_start'
    }) + '\n\n'
    
    // For now, provide a simple response
    const response = `Based on your message: "${message}", I'm here to help with crack analysis and structural concerns. While the advanced chat system is being updated, please use the image analysis feature for detailed crack assessments. I can provide general guidance on crack types, repair methods, and when to consult professionals.`
    
    yield JSON.stringify({
      type: 'chat_chunk',
      content: response
    }) + '\n\n'
    
    console.log('Chat processing completed')
  } catch (error) {
    console.error('Chat system error:', error)
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

    // Note: Chat is now free - only PDF export charges credits
    // Basic credit check to prevent abuse for users with 0 credits
    const creditCheck = await checkCredits(userId, 1)
    
    if (!creditCheck.success) {
      return NextResponse.json({ error: creditCheck.error }, { status: 500 })
    }

    if (!creditCheck.hasEnoughCredits) {
      return NextResponse.json({ 
        error: 'You need at least 1 credit to use chat features. Credits are only charged when exporting analysis to PDF.',
        currentCredits: creditCheck.currentCredits || 0
      }, { status: 402 })
    }

    try {
      // Create readable stream for streaming response
      const encoder = new TextEncoder()
      
      const stream = new ReadableStream({
        async start(controller) {
          let fullResponse = ''
          
          try {
            // Stream chat
            for await (const chunk of streamChat(
              message
            )) {
              fullResponse += chunk
              
              // Send chunk to client
              const data = JSON.stringify({
                success: true,
                chunk
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
      console.error('Chat failed:', chatError)
      return NextResponse.json({ 
        error: 'Chat failed. Please try again. No credits have been charged.',
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error in POST /api/chat:', error)
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}