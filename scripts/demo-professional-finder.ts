/**
 * Professional Finder演示脚本
 * 
 * 展示完整的Professional Finder工作流程，包括：
 * 1. 初始化演示数据
 * 2. 模拟裂痕分析触发
 * 3. 专业工程师搜索
 * 4. 结果展示
 */

import { supabase } from '../lib/supabase'
import { professionalFinderAgent } from '../lib/professional-finder-agent'
import { shouldTriggerProfessionalFinder, generateProfessionalFinderMessage, extractLocationInfo } from '../lib/professional-finder-integration'

// 演示用的裂痣分析结果
const demoAnalysisResults = [
  {
    id: 1,
    confidence: 92,
    riskLevel: 'high' as const,
    crackCount: 2,
    findings: [
      {
        type: 'Structural Crack',
        severity: 'High',
        length: '3 feet',
        width: '2mm',
        description: 'Horizontal crack in load-bearing wall'
      }
    ],
    recommendations: ['Immediate structural assessment required', 'Consult structural engineer'],
    aiNotes: 'High-confidence detection of structural damage requiring immediate professional attention. The horizontal crack pattern in the load-bearing wall suggests potential foundation settlement or structural movement.',
    category: 'structural_movement',
    severity: 'severe'
  },
  {
    id: 2,
    confidence: 88,
    riskLevel: 'moderate' as const,
    crackCount: 1,
    findings: [
      {
        type: 'Surface Crack',
        severity: 'Moderate',
        length: '1 foot',
        width: '1mm',
        description: 'Vertical hairline crack in drywall'
      }
    ],
    recommendations: ['Monitor for changes', 'Consider cosmetic repair'],
    aiNotes: 'Minor cosmetic crack likely due to normal settling. Recommend monitoring for changes.',
    category: 'cosmetic_settling',
    severity: 'minor'
  },
  {
    id: 3,
    confidence: 95,
    riskLevel: 'critical' as const,
    crackCount: 3,
    findings: [
      {
        type: 'Foundation Crack',
        severity: 'Severe',
        length: '4 feet',
        width: '5mm',
        description: 'Multiple intersecting cracks in foundation wall'
      }
    ],
    recommendations: ['URGENT: Evacuate affected area', 'Emergency structural assessment'],
    aiNotes: 'CRITICAL STRUCTURAL ISSUE DETECTED: Multiple foundation cracks indicate severe structural compromise. Immediate evacuation and emergency professional assessment required for safety.',
    category: 'foundation_settlement',
    severity: 'critical'
  }
]

// 演示用的专业工程师数据
const demoProfessionals = [
  {
    company_name: 'Trinity Engineering LLC',
    rating: 4.8,
    review_count: 70,
    hire_count: 118,
    is_top_pro: true,
    is_licensed: true,
    response_time_minutes: 41,
    estimate_fee_amount: 250,
    estimate_fee_waived_if_hired: true,
    description: 'Over 25 years of experience in structural engineering. Licensed PE in NY, NJ, MA. Specializing in residential and commercial structural analysis.',
    phone: '(555) 123-4567',
    primary_city: { city_name: 'Cedar Grove', state_code: 'NJ' },
    years_in_business: 5,
    employee_count: 4
  },
  {
    company_name: 'NYC Structural Solutions',
    rating: 4.9,
    review_count: 156,
    hire_count: 203,
    is_top_pro: true,
    is_licensed: true,
    response_time_minutes: 35,
    estimate_fee_amount: 200,
    estimate_fee_waived_if_hired: false,
    description: 'Premier structural engineering firm serving NYC area. Emergency services available 24/7.',
    phone: '(555) 987-6543',
    primary_city: { city_name: 'New York', state_code: 'NY' },
    years_in_business: 12,
    employee_count: 8
  },
  {
    company_name: 'Metro Foundation Experts',
    rating: 4.6,
    review_count: 89,
    hire_count: 67,
    is_top_pro: false,
    is_licensed: true,
    response_time_minutes: 120,
    estimate_fee_amount: 150,
    estimate_fee_waived_if_hired: true,
    description: 'Specialized in foundation issues and crack repair. Competitive pricing with quality service.',
    phone: '(555) 456-7890',
    primary_city: { city_name: 'Brooklyn', state_code: 'NY' },
    years_in_business: 8,
    employee_count: 3
  }
]

class ProfessionalFinderDemo {
  private supabase = supabase

  async runDemo(): Promise<void> {
    console.log('🎯 Professional Finder Agent演示')
    console.log('=======================================\n')

    // 1. 演示不同风险等级的裂痕分析
    for (const [index, analysis] of demoAnalysisResults.entries()) {
      console.log(`\n📊 演示案例 ${index + 1}: ${analysis.riskLevel.toUpperCase()}风险等级`)
      console.log('─'.repeat(50))
      
      await this.demonstrateAnalysis(analysis)
      
      if (index < demoAnalysisResults.length - 1) {
        console.log('\n' + '='.repeat(60))
      }
    }

    console.log('\n🎉 演示完成！')
    console.log('\n📝 总结：')
    console.log('• 高危和严重风险等级自动触发Professional Finder')
    console.log('• 自动识别用户位置信息（邮编）')
    console.log('• 根据紧急程度调整搜索参数')
    console.log('• 提供个性化的专业工程师推荐')
    console.log('• 支持一键联系和详细信息查看')
  }

  private async demonstrateAnalysis(analysis: any): Promise<void> {
    console.log(`🔍 AI分析结果：`)
    console.log(`   信心度: ${analysis.confidence}%`)
    console.log(`   风险等级: ${analysis.riskLevel}`)
    console.log(`   裂痕数量: ${analysis.crackCount}`)
    console.log(`   AI备注: ${analysis.aiNotes.substring(0, 100)}...`)

    // 检查是否触发Professional Finder
    const triggerCondition = shouldTriggerProfessionalFinder(
      analysis,
      analysis.severity,
      analysis.category
    )

    console.log(`\n🤖 Professional Finder判断：`)
    console.log(`   是否触发: ${triggerCondition.shouldTrigger ? '✅ 是' : '❌ 否'}`)
    
    if (!triggerCondition.shouldTrigger) {
      console.log(`   原因: ${triggerCondition.reason}`)
      return
    }

    console.log(`   紧急等级: ${triggerCondition.emergencyLevel}`)
    console.log(`   触发原因: ${triggerCondition.reason}`)

    // 模拟用户位置信息
    const locationScenarios = [
      { description: 'Located in New York City, zip code 10001', zipCode: '10001' },
      { description: 'I live in Manhattan', zipCode: undefined },
      { description: 'No location provided', zipCode: undefined }
    ]

    const scenario = locationScenarios[0] // 使用第一个场景
    const locationInfo = extractLocationInfo(scenario.description)

    console.log(`\n📍 位置信息：`)
    console.log(`   用户描述: "${scenario.description}"`)
    console.log(`   提取的邮编: ${locationInfo.zipCode || '未提取到'}`)
    console.log(`   有位置信息: ${locationInfo.hasLocation ? '是' : '否'}`)

    // 生成推荐消息
    const message = generateProfessionalFinderMessage(triggerCondition, locationInfo.hasLocation)
    console.log(`\n💬 推荐消息：`)
    console.log(`   ${message}`)

    // 如果有位置信息，展示专业工程师搜索结果
    if (locationInfo.zipCode) {
      console.log(`\n👷 推荐的专业工程师：`)
      
      // 模拟搜索结果（实际情况下会从数据库查询）
      const relevantProfessionals = this.filterProfessionalsByEmergency(
        demoProfessionals,
        triggerCondition.emergencyLevel
      )

      relevantProfessionals.slice(0, 3).forEach((prof, index) => {
        console.log(`\n   ${index + 1}. ${prof.company_name}`)
        console.log(`      ⭐ ${prof.rating}/5.0 (${prof.review_count}条评价)`)
        console.log(`      ${prof.is_top_pro ? '🏆 Top Pro ' : ''}${prof.is_licensed ? '📜 已认证' : ''}`)
        console.log(`      ⏱️ 约${prof.response_time_minutes}分钟响应`)
        console.log(`      💰 评估费用: $${prof.estimate_fee_amount}${prof.estimate_fee_waived_if_hired ? ' (雇佣后免费)' : ''}`)
        console.log(`      📍 ${prof.primary_city.city_name}, ${prof.primary_city.state_code}`)
        console.log(`      📞 ${prof.phone}`)
      })

      // 展示搜索参数
      console.log(`\n⚙️ 搜索参数：`)
      console.log(`   最大距离: ${triggerCondition.emergencyLevel === 'critical' ? '25' : '50'} 英里`)
      console.log(`   最低评分: ${triggerCondition.emergencyLevel === 'critical' ? '4.5' : '4.0'}`)
      console.log(`   最大响应时间: ${triggerCondition.emergencyLevel === 'critical' ? '60' : '120'} 分钟`)
    }
  }

  private filterProfessionalsByEmergency(professionals: any[], emergencyLevel: string): any[] {
    switch (emergencyLevel) {
      case 'critical':
        return professionals.filter(p => p.rating >= 4.5 && p.response_time_minutes <= 60)
      case 'high':
        return professionals.filter(p => p.rating >= 4.0 && p.response_time_minutes <= 120)
      case 'medium':
        return professionals.filter(p => p.rating >= 3.5)
      default:
        return professionals
    }
  }

  async initializeDemoData(): Promise<void> {
    console.log('🔧 初始化演示数据...')

    try {
      // 检查是否已有城市数据
      const { count } = await this.supabase
        .from('us_cities')
        .select('*', { count: 'exact', head: true })

      if (!count || count === 0) {
        console.log('💡 提示：请先运行 init-us-cities.ts 脚本初始化城市数据')
        console.log('   pnpm tsx scripts/init-us-cities.ts')
        return
      }

      console.log(`✅ 找到 ${count} 个城市记录`)

      // 检查是否已有专业人员数据
      const { count: profCount } = await this.supabase
        .from('professionals')
        .select('*', { count: 'exact', head: true })

      if (!profCount || profCount === 0) {
        console.log('💡 提示：数据库中没有专业人员数据')
        console.log('   可以运行爬虫脚本或手动添加演示数据')
      } else {
        console.log(`✅ 找到 ${profCount} 个专业人员记录`)
      }

      console.log('✅ 演示数据检查完成\n')

    } catch (error) {
      console.error('❌ 演示数据初始化失败:', error)
    }
  }

  async testSearchFunctionality(): Promise<void> {
    console.log('\n🧪 测试搜索功能...')

    try {
      // 测试位置工具函数
      const testDescriptions = [
        'I live in 10001',
        'My house is in New York, NY',
        'Located in Manhattan area',
        'No location provided'
      ]

      for (const desc of testDescriptions) {
        const locationInfo = extractLocationInfo(desc)
        console.log(`"${desc}" -> 邮编: ${locationInfo.zipCode || '无'}, 有位置: ${locationInfo.hasLocation}`)
      }

      console.log('\n✅ 搜索功能测试完成')

    } catch (error) {
      console.error('❌ 搜索功能测试失败:', error)
    }
  }
}

// 主执行函数
async function main() {
  const demo = new ProfessionalFinderDemo()

  try {
    await demo.initializeDemoData()
    await demo.testSearchFunctionality()
    await demo.runDemo()

  } catch (error) {
    console.error('❌ 演示运行失败:', error)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

export default ProfessionalFinderDemo