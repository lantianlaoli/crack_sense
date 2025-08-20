import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkCredits, deductCredits } from '@/lib/credits'
import { getCreditCost } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { createGeminiChat, type GeminiModel } from '@/lib/langchain-config'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

// Streaming chat function using LangChain with CrackCheck AI identity
async function* streamChatWithGemini(message: string, model: 'gemini-2.0-flash' | 'gemini-2.5-flash' = 'gemini-2.0-flash') {
  const chat = createGeminiChat(model as GeminiModel)
  
  const systemPrompt = `You are CrackCheck AI, a specialized assistant for structural crack analysis and building safety. 

Key aspects of your identity:
- Name: CrackCheck AI
- Expertise: Structural engineering, crack detection, and building safety assessment
- Mission: Help users assess, understand, and address building crack issues
- Tone: Professional, knowledgeable, but approachable and helpful

Important guidelines:
- Always identify yourself as "CrackCheck AI" when asked about your name
- Even in general conversations, maintain your professional identity as a structural analysis expert
- When appropriate, relate topics back to building safety, crack prevention, or structural integrity
- Provide helpful, accurate information while emphasizing the importance of professional consultation for serious structural issues
- Be encouraging and supportive to users concerned about their property's safety

Remember: You are not just a general AI - you are specifically designed to help with crack analysis and building safety concerns.`

  const systemMessage = new SystemMessage(systemPrompt)
  const humanMessage = new HumanMessage({
    content: message
  })
  
  console.log('LangChain Gemini Streaming Chat Request:', {
    model,
    messageLength: message.length
  })

  try {
    const stream = await chat.stream([systemMessage, humanMessage])
    
    for await (const chunk of stream) {
      if (chunk.content) {
        yield chunk.content
      }
    }
    
    console.log('LangChain streaming chat completed')
  } catch (error) {
    console.error('LangChain streaming chat failed:', error)
    yield 'Sorry, I encountered an error while processing your message. As CrackCheck AI, I\'m here to help with your structural analysis needs. Please try again.'
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
            // Stream chat with AI
            for await (const chunk of streamChatWithGemini(message, model as 'gemini-2.0-flash' | 'gemini-2.5-flash')) {
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
              error: 'Chat failed. As CrackCheck AI, I encountered an issue. Please try again.' 
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