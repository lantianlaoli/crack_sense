/**
 * Professional Finder集成工具 - 判断何时自动触发专业工程师推荐
 */

import type { CrackAnalysis } from './langchain-config'

export interface TriggerCondition {
  shouldTrigger: boolean
  emergencyLevel: 'low' | 'medium' | 'high' | 'critical'
  reason: string
  urgencyMessage: string
}

/**
 * 判断是否应该自动触发Professional Finder
 */
export function shouldTriggerProfessionalFinder(
  analysis: CrackAnalysis,
  severity: string,
  category: string
): TriggerCondition {
  // 1. 基于风险等级的判断
  if (analysis.riskLevel === 'high') {
    return {
      shouldTrigger: true,
      emergencyLevel: 'high',
      reason: 'High risk structural issue detected',
      urgencyMessage: '发现需要专业关注的结构问题，建议尽快联系专业工程师'
    }
  }

  // 2. 基于严重程度的判断
  if (severity === 'severe' || severity === 'critical') {
    return {
      shouldTrigger: true,
      emergencyLevel: severity === 'critical' ? 'critical' : 'high',
      reason: 'Severe crack severity level',
      urgencyMessage: '检测到严重裂痕，需要专业结构工程师评估'
    }
  }

  // 3. 基于置信度和风险的综合判断
  if (analysis.confidence >= 90 && analysis.riskLevel === 'moderate') {
    // 高置信度的中等风险也可能需要专业意见
    const hasStructuralKeywords = analysis.aiNotes.toLowerCase().includes('structural') ||
                                 analysis.aiNotes.toLowerCase().includes('foundation') ||
                                 analysis.aiNotes.toLowerCase().includes('load bearing') ||
                                 analysis.aiNotes.toLowerCase().includes('settlement')

    if (hasStructuralKeywords) {
      return {
        shouldTrigger: true,
        emergencyLevel: 'medium',
        reason: 'High confidence structural concern',
        urgencyMessage: '建议咨询专业结构工程师以获得专业意见'
      }
    }
  }

  // 4. 基于裂痕类别的特殊判断
  const highRiskCategories = [
    'foundation_settlement',
    'structural_movement', 
    'water_damage_structural',
    'seismic_damage',
    'load_bearing_failure'
  ]

  if (highRiskCategories.includes(category)) {
    return {
      shouldTrigger: true,
      emergencyLevel: 'high',
      reason: 'High-risk crack category detected',
      urgencyMessage: '检测到高风险类型的裂痕，强烈建议专业检查'
    }
  }

  // 5. 基于裂痕数量和范围的判断
  if (analysis.crackCount >= 3) {
    const hasMultipleTypes = analysis.findings.some(finding => 
      finding.severity === 'High'
    )

    if (hasMultipleTypes) {
      return {
        shouldTrigger: true,
        emergencyLevel: 'medium',
        reason: 'Multiple cracks with concerning characteristics',
        urgencyMessage: '发现多处裂痕，建议专业评估整体结构状况'
      }
    }
  }

  // 6. 基于AI分析中的关键词判断
  const emergencyKeywords = [
    'immediate attention',
    'urgent repair',
    'safety concern',
    'structural integrity',
    'consult engineer',
    'professional assessment'
  ]

  const criticalKeywords = [
    'danger',
    'unsafe',
    'collapse',
    'failure',
    'emergency'
  ]

  const aiNotesLower = analysis.aiNotes.toLowerCase()

  // 检查紧急关键词
  if (criticalKeywords.some(keyword => aiNotesLower.includes(keyword))) {
    return {
      shouldTrigger: true,
      emergencyLevel: 'critical',
      reason: 'Critical safety keywords detected in AI analysis',
      urgencyMessage: '⚠️ 紧急情况 - 检测到严重安全问题，请立即联系专业工程师'
    }
  }

  // 检查一般专业建议关键词
  if (emergencyKeywords.some(keyword => aiNotesLower.includes(keyword))) {
    return {
      shouldTrigger: true,
      emergencyLevel: 'medium',
      reason: 'Professional consultation recommended by AI',
      urgencyMessage: 'AI分析建议寻求专业工程师意见'
    }
  }

  // 默认不触发
  return {
    shouldTrigger: false,
    emergencyLevel: 'low',
    reason: 'No immediate professional consultation required',
    urgencyMessage: ''
  }
}

/**
 * 根据用户位置信息生成Professional Finder的推荐消息
 */
export function generateProfessionalFinderMessage(
  condition: TriggerCondition,
  hasLocationInfo: boolean
): string {
  if (!condition.shouldTrigger) {
    return ''
  }

  let baseMessage = condition.urgencyMessage

  if (hasLocationInfo) {
    baseMessage += '\n\n我们已经为您推荐了附近的专业结构工程师，您可以直接联系他们进行专业评估。'
  } else {
    baseMessage += '\n\n请提供您的邮编，我们将为您推荐附近的专业结构工程师。'
  }

  // 根据紧急程度添加额外建议
  switch (condition.emergencyLevel) {
    case 'critical':
      baseMessage += '\n\n⚠️ 鉴于问题的严重性，请避免在受影响区域活动，并尽快采取行动。'
      break
    case 'high':
      baseMessage += '\n\n🔶 建议在24-48小时内联系专业工程师进行检查。'
      break
    case 'medium':
      baseMessage += '\n\n💡 虽然不是紧急情况，但专业评估将有助于确定最佳的维修方案。'
      break
  }

  return baseMessage
}

/**
 * 判断用户是否提供了位置信息
 */
export function extractLocationInfo(
  description?: string,
  additionalInfo?: string
): { zipCode?: string; hasLocation: boolean } {
  const text = `${description || ''} ${additionalInfo || ''}`.toLowerCase()
  
  // 查找美国邮编模式
  const zipCodePattern = /\b\d{5}(-\d{4})?\b/g
  const zipCodeMatch = text.match(zipCodePattern)
  
  if (zipCodeMatch && zipCodeMatch.length > 0) {
    return {
      zipCode: zipCodeMatch[0].split('-')[0], // 标准化为5位数字
      hasLocation: true
    }
  }

  // 查找城市和州的模式
  const cityStatePattern = /\b[a-z\s]+,\s*[a-z]{2}\b/g
  const cityStateMatch = text.match(cityStatePattern)
  
  if (cityStateMatch && cityStateMatch.length > 0) {
    return {
      hasLocation: true
    }
  }

  // 查找常见城市名称模式
  const majorCities = [
    'manhattan', 'brooklyn', 'queens', 'bronx', 'new york', 'nyc',
    'los angeles', 'san francisco', 'chicago', 'houston', 'miami',
    'seattle', 'boston', 'philadelphia', 'atlanta', 'dallas',
    'detroit', 'denver', 'phoenix', 'las vegas'
  ]

  const cityMentioned = majorCities.some(city => {
    const cityPattern = new RegExp(`\\b${city}\\b`, 'i')
    return cityPattern.test(text)
  })

  if (cityMentioned) {
    // 对于著名城市，我们可以推断邮编
    if (text.includes('manhattan') || text.includes('new york') || text.includes('nyc')) {
      return {
        zipCode: '10001', // 默认Manhattan邮编
        hasLocation: true
      }
    }
    
    return {
      hasLocation: true
    }
  }

  // 查找位置指示语言
  const locationIndicators = [
    'i live in', 'located in', 'my house is in', 'i am in',
    'we are in', 'property is in', 'building is in', 'home is in'
  ]

  const hasLocationIndicator = locationIndicators.some(indicator =>
    text.includes(indicator)
  )

  if (hasLocationIndicator) {
    return {
      hasLocation: true
    }
  }

  return { hasLocation: false }
}

/**
 * 生成Professional Finder的搜索参数
 */
export function generateSearchParams(
  condition: TriggerCondition,
  locationInfo: { zipCode?: string; hasLocation: boolean }
) {
  return {
    emergencyLevel: condition.emergencyLevel,
    zipCode: locationInfo.zipCode,
    maxDistance: condition.emergencyLevel === 'critical' ? 25 : 
                 condition.emergencyLevel === 'high' ? 35 : 50,
    minRating: condition.emergencyLevel === 'critical' ? 4.5 :
               condition.emergencyLevel === 'high' ? 4.0 : 3.5,
    maxResponseTime: condition.emergencyLevel === 'critical' ? 60 :
                     condition.emergencyLevel === 'high' ? 120 : 480
  }
}