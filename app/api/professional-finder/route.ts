/**
 * Professional Finder API - 专业工程师查找接口
 * 
 * 集成到现有的CrackCheck系统中，为高危裂痕提供专业工程师推荐
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { professionalFinderAgent } from '@/lib/professional-finder-agent'
import { isValidUSZipCode, normalizeZipCode } from '@/lib/location-utils'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      crackAnalysisId,
      zipCode,
      latitude,
      longitude,
      emergencyLevel,
      maxDistance = 50
    } = body

    // 验证必需参数
    if (!crackAnalysisId) {
      return NextResponse.json(
        { error: 'Crack analysis ID is required' },
        { status: 400 }
      )
    }

    // 验证位置信息
    const locationParams: any = {}
    
    if (zipCode) {
      if (!isValidUSZipCode(zipCode)) {
        return NextResponse.json(
          { error: 'Invalid ZIP code format' },
          { status: 400 }
        )
      }
      locationParams.zipCode = normalizeZipCode(zipCode)
    } else if (latitude && longitude) {
      locationParams.latitude = parseFloat(latitude)
      locationParams.longitude = parseFloat(longitude)
    } else {
      return NextResponse.json(
        { error: 'Either ZIP code or coordinates are required' },
        { status: 400 }
      )
    }

    // 添加其他搜索参数
    if (emergencyLevel) {
      locationParams.emergencyLevel = emergencyLevel
    }
    locationParams.maxDistance = maxDistance

    // 查找专业工程师
    const professionals = await professionalFinderAgent.findProfessionalsForCrackAnalysis(
      crackAnalysisId,
      locationParams
    )

    // 获取推荐消息
    const recommendationMessage = professionalFinderAgent.getEmergencyRecommendationMessage(
      emergencyLevel || 'medium'
    )

    return NextResponse.json({
      success: true,
      data: {
        recommendation_message: recommendationMessage,
        professionals: professionals.map(prof => ({
          id: prof.id,
          company_name: prof.company_name,
          rating: prof.rating,
          review_count: prof.review_count,
          is_top_pro: prof.is_top_pro,
          is_licensed: prof.is_licensed,
          response_time_minutes: prof.response_time_minutes,
          estimate_fee_amount: prof.estimate_fee_amount,
          estimate_fee_waived_if_hired: prof.estimate_fee_waived_if_hired,
          description: prof.description,
          phone: prof.phone,
          thumbtack_url: prof.thumbtack_url,
          primary_city: prof.primary_city,
          distance: prof.distance,
          formatted_display: professionalFinderAgent.formatProfessionalForDisplay(prof)
        })),
        search_metadata: {
          search_location: locationParams.zipCode || `${locationParams.latitude}, ${locationParams.longitude}`,
          results_count: professionals.length,
          emergency_level: emergencyLevel || 'medium',
          max_distance: maxDistance
        }
      }
    })

  } catch (error) {
    console.error('Professional finder error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to find professionals',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const professionalId = searchParams.get('id')
    
    if (!professionalId) {
      return NextResponse.json(
        { error: 'Professional ID is required' },
        { status: 400 }
      )
    }

    // 获取专业工程师详细信息
    const professional = await professionalFinderAgent.getProfessionalDetails(
      parseInt(professionalId)
    )

    if (!professional) {
      return NextResponse.json(
        { error: 'Professional not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: professional
    })

  } catch (error) {
    console.error('Get professional details error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get professional details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}