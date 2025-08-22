import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { 
  getAnalysisBasedRecommendations,
  getChatBasedRecommendations,
  getDIYRecommendations,
  RecommendationContext 
} from '@/lib/procurement-agent'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      analysisId, 
      conversationId, 
      userQuery,
      crackSeverity,
      crackType,
      budget,
      preferredSkillLevel,
      recommendationType = 'analysis_based'
    } = body

    // Validate required parameters based on recommendation type
    if (recommendationType === 'analysis_based' && !analysisId) {
      return NextResponse.json({ 
        error: 'Analysis ID is required for analysis-based recommendations' 
      }, { status: 400 })
    }

    if (recommendationType === 'chat_based' && !userQuery) {
      return NextResponse.json({ 
        error: 'User query is required for chat-based recommendations' 
      }, { status: 400 })
    }

    // Build recommendation context
    const context: RecommendationContext = {
      analysisId,
      conversationId,
      userId,
      userQuery,
      crackSeverity,
      crackType,
      budget: budget ? parseFloat(budget) : undefined,
      preferredSkillLevel
    }

    let result

    // Get recommendations based on type
    switch (recommendationType) {
      case 'analysis_based':
        result = await getAnalysisBasedRecommendations(analysisId, context)
        break
      
      case 'diy_focused':
        result = await getDIYRecommendations(analysisId, context)
        break
      
      case 'chat_based':
        result = await getChatBasedRecommendations(userQuery, context)
        break
      
      default:
        return NextResponse.json({ 
          error: 'Invalid recommendation type' 
        }, { status: 400 })
    }

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Failed to get recommendations' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      recommendations: result.recommendations || [],
      context: {
        recommendationType,
        analysisId,
        conversationId,
        userQuery,
        totalResults: result.recommendations?.length || 0
      }
    })

  } catch (error) {
    console.error('Error in POST /api/recommendations:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const analysisId = searchParams.get('analysisId')
    const conversationId = searchParams.get('conversationId')
    const query = searchParams.get('query')
    const type = searchParams.get('type') || 'analysis_based'

    // Handle GET requests for quick recommendations
    if (type === 'chat_based' && query) {
      const context: RecommendationContext = {
        userId,
        conversationId: conversationId || undefined,
        userQuery: query
      }

      const result = await getChatBasedRecommendations(query, context)
      
      return NextResponse.json({
        success: result.success,
        recommendations: result.recommendations || [],
        error: result.error
      })
    }

    if (type === 'analysis_based' && analysisId) {
      const context: RecommendationContext = {
        userId,
        analysisId,
        conversationId: conversationId || undefined
      }

      const result = await getAnalysisBasedRecommendations(analysisId, context)
      
      return NextResponse.json({
        success: result.success,
        recommendations: result.recommendations || [],
        error: result.error
      })
    }

    return NextResponse.json({ 
      error: 'Invalid parameters for GET request' 
    }, { status: 400 })

  } catch (error) {
    console.error('Error in GET /api/recommendations:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}