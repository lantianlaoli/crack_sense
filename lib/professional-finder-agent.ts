/**
 * Professional Finder Agent - 为高危裂痕情况寻找专业工程师
 * 
 * 功能：
 * 1. 根据用户位置（邮编/城市）查找当地结构工程师
 * 2. 基于裂痕分析结果推荐合适的专业人员
 * 3. 提供专业人员的详细信息和联系方式
 * 4. 支持紧急情况的快速响应
 */

import { supabase } from './supabase'
import { getCityFromZipCode, getZipCodeFromCoordinates } from './location-utils'

export interface ProfessionalSearchParams {
  zipCode?: string
  cityId?: number
  latitude?: number
  longitude?: number
  serviceType?: string
  emergencyLevel?: 'low' | 'medium' | 'high' | 'critical'
  maxDistance?: number // 最大距离（英里）
  minRating?: number
  maxResponseTime?: number // 最大响应时间（分钟）
}

export interface Professional {
  id: number
  company_name: string
  rating: number
  review_count: number
  hire_count: number
  is_top_pro: boolean
  is_licensed: boolean
  response_time_minutes: number
  estimate_fee_amount: number
  estimate_fee_waived_if_hired: boolean
  description: string
  phone: string
  email: string
  website_url: string
  thumbtack_url?: string
  service_areas: string[]
  primary_city: {
    city_name: string
    state_code: string
  }
  services?: Array<{
    service_name: string
    project_types: string[]
    property_types: string[]
  }>
  credentials?: Array<{
    credential_type: string
    credential_name: string
    license_number: string
    states_valid: string[]
  }>
  recent_reviews?: Array<{
    reviewer_name: string
    rating: number
    review_text: string
    review_date: string
  }>
  distance?: number
}

export class ProfessionalFinderAgent {
  private supabase = supabase

  /**
   * 根据裂痕分析结果查找合适的专业人员
   */
  async findProfessionalsForCrackAnalysis(
    crackAnalysisId: number,
    userLocation: ProfessionalSearchParams
  ): Promise<Professional[]> {
    // 1. 获取裂痕分析结果
    const { data: crackAnalysis } = await this.supabase
      .from('crack_analyses')
      .select('*')
      .eq('id', crackAnalysisId)
      .single()

    if (!crackAnalysis) {
      throw new Error('Crack analysis not found')
    }

    // 2. 根据危险等级确定搜索参数
    const searchParams = this.getSearchParamsForCrack(crackAnalysis, userLocation)

    // 3. 查找专业人员
    const professionals = await this.searchProfessionals(searchParams)

    // 4. 记录搜索日志
    await this.logSearch({
      crack_analysis_id: crackAnalysisId,
      search_params: searchParams,
      results_count: professionals.length
    })

    return professionals
  }

  /**
   * 搜索专业人员
   */
  async searchProfessionals(params: ProfessionalSearchParams): Promise<Professional[]> {
    console.log('searchProfessionals called with params:', params)

    // 首先根据邮编查找城市
    let cityId = params.cityId
    if (!cityId && params.zipCode) {
      const city = await getCityFromZipCode(params.zipCode)
      console.log('City lookup result for zipCode', params.zipCode, ':', city)
      if (city) {
        cityId = city.id
      }
    }

    if (!cityId) {
      console.log('No cityId found, returning empty array')
      return []
    }

    console.log('Searching with cityId:', cityId)

    let query = this.supabase
      .from('professionals')
      .select('*')
      .eq('is_active', true)
      .eq('primary_city_id', Number(cityId))

    // 应用过滤条件 - temporarily disabled for debugging
    // if (params.minRating) {
    //   query = query.gte('rating', params.minRating.toString())
    // }

    // if (params.maxResponseTime && params.maxResponseTime > 0) {
    //   query = query.lte('response_time_minutes', params.maxResponseTime)
    // }

    // 按评分和Top Pro状态排序
    query = query.order('is_top_pro', { ascending: false })
             .order('rating', { ascending: false })
             .order('hire_count', { ascending: false })
             .limit(20)

    const { data: professionals, error } = await query

    if (error) {
      console.error('Professional search error:', error)
      throw new Error(`Failed to search professionals: ${error.message}`)
    }

    console.log('Professional search result:', { professionals, count: professionals?.length || 0 })

    // 添加城市信息到每个专业人员
    if (professionals && professionals.length > 0) {
      const { data: cityData } = await this.supabase
        .from('us_cities')
        .select('city_name, state_code')
        .eq('id', cityId)
        .single()

      const professionalsWithCity = professionals.map(p => ({
        ...p,
        primary_city: cityData || { city_name: 'Unknown', state_code: 'Unknown' }
      }))

      console.log('Final professionals with city data:', professionalsWithCity)
      return professionalsWithCity
    }

    return professionals || []
  }

  /**
   * 根据裂痕分析结果确定搜索参数
   */
  private getSearchParamsForCrack(
    crackAnalysis: any,
    userLocation: ProfessionalSearchParams
  ): ProfessionalSearchParams {
    const baseParams = {
      ...userLocation,
      serviceType: 'structural-engineering'
    }

    // 根据危险等级调整搜索参数
    const riskLevel = crackAnalysis.risk_level || 'medium'

    switch (riskLevel) {
      case 'critical':
        return {
          ...baseParams,
          emergencyLevel: 'critical',
          maxResponseTime: 60, // 1小时内响应
          minRating: 4.5
        }
      
      case 'high':
        return {
          ...baseParams,
          emergencyLevel: 'high',
          maxResponseTime: 120, // 2小时内响应
          minRating: 4.0
        }
      
      case 'medium':
        return {
          ...baseParams,
          emergencyLevel: 'medium',
          maxResponseTime: 480, // 8小时内响应
          minRating: 3.5
        }
      
      default:
        return {
          ...baseParams,
          emergencyLevel: 'low',
          minRating: 3.0
        }
    }
  }

  /**
   * 获取专业人员详细信息
   */
  async getProfessionalDetails(professionalId: number): Promise<Professional | null> {
    const { data, error } = await this.supabase
      .from('professionals')
      .select(`
        *,
        primary_city:us_cities!primary_city_id(city_name, state_code, latitude, longitude),
        services:professional_services(
          service_type:service_types(service_name, description),
          project_types,
          property_types
        ),
        credentials:professional_credentials(*),
        reviews:professional_reviews(
          reviewer_name,
          rating,
          review_text,
          review_date,
          project_details,
          professional_reply
        ),
        media:professional_media(
          media_type,
          media_url,
          thumbnail_url,
          caption
        )
      `)
      .eq('id', professionalId)
      .single()

    if (error) {
      throw new Error(`Failed to get professional details: ${error.message}`)
    }

    return data
  }

  /**
   * 记录搜索日志
   */
  private async logSearch(params: {
    crack_analysis_id?: number
    search_params: ProfessionalSearchParams
    results_count: number
    selected_professional_id?: number
  }): Promise<void> {
    await this.supabase
      .from('professional_search_logs')
      .insert({
        crack_analysis_id: params.crack_analysis_id,
        search_query: 'structural-engineer',
        zip_code: params.search_params.zipCode,
        results_count: params.results_count,
        selected_professional_id: params.selected_professional_id,
        search_context: params.search_params
      })
  }

  /**
   * Get emergency recommendation message based on severity
   */
  getEmergencyRecommendationMessage(emergencyLevel: string): string {
    switch (emergencyLevel) {
      case 'critical':
        return '⚠️ **Critical Issue** - Serious structural problems detected. Contact a professional structural engineer immediately for assessment. Avoid the affected area for safety.'
      
      case 'high':
        return '🔶 **High Priority** - Structural issues requiring professional attention found. Contact a structural engineer within 24 hours for inspection.'
      
      case 'medium':
        return '🔷 **Needs Attention** - Recommend contacting a professional structural engineer for evaluation to determine if repairs are needed.'
      
      default:
        return '💡 **Professional Consultation** - If you need professional advice, these engineers can provide consultation services.'
    }
  }

  /**
   * 格式化专业人员信息用于显示
   */
  formatProfessionalForDisplay(professional: Professional): string {
    const rating = professional.rating ? `⭐ ${professional.rating}/5.0` : '暂无评分'
    const reviews = professional.review_count ? `(${professional.review_count}条评价)` : ''
    const responseTime = professional.response_time_minutes 
      ? `约${professional.response_time_minutes}分钟响应` 
      : '响应时间未知'
    
    const badges = []
    if (professional.is_top_pro) badges.push('🏆 Top Pro')
    if (professional.is_licensed) badges.push('📜 已认证')
    
    const location = professional.primary_city 
      ? `${professional.primary_city.city_name}, ${professional.primary_city.state_code}`
      : '位置未知'

    return `**${professional.company_name}**
${rating} ${reviews} ${badges.join(' ')}
📍 服务地区: ${location}
⏱️ ${responseTime}
💰 现场评估: ${professional.estimate_fee_amount ? `$${professional.estimate_fee_amount}` : '免费'}
${professional.estimate_fee_waived_if_hired ? '(雇佣后免费)' : ''}

${professional.description || '专业结构工程服务'}

📞 联系方式: ${professional.phone || '请通过平台联系'}
${professional.website_url ? `🌐 网站: ${professional.website_url}` : ''}`
  }
}

// 导出单例实例
export const professionalFinderAgent = new ProfessionalFinderAgent()