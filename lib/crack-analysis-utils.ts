import { supabase } from './supabase'
import { CrackCauseTemplate, CrackAnalysis } from './supabase'

// Function to get all crack cause templates
export async function getCrackCauseTemplates(): Promise<CrackCauseTemplate[]> {
  try {
    const { data, error } = await supabase
      .from('crack_cause_templates')
      .select('*')
      .order('category')
    
    if (error) {
      console.error('Error fetching crack cause templates:', error)
      return []
    }
    
    console.log('Fetched crack cause templates:', data)
    return data || []
  } catch (err) {
    console.error('Exception in getCrackCauseTemplates:', err)
    return []
  }
}

// Function to analyze crack cause based on AI response and return categorized analysis
export function categorizeCrackAnalysis(
  aiResponse: string,
  findings: Array<{ severity: string }>,
  templates: CrackCauseTemplate[]
): {
  category: CrackAnalysis['crack_cause_category']
  crackType: CrackAnalysis['crack_type']
  severity: CrackAnalysis['crack_severity']
  template: CrackCauseTemplate | null
} {
  const response = aiResponse.toLowerCase()
  
  // Determine crack cause category based on keywords and context
  let category: CrackAnalysis['crack_cause_category'] = 'other'
  let template: CrackCauseTemplate | null = null
  
  // Settlement indicators
  if (response.includes('settlement') || response.includes('foundation') || 
      response.includes('uneven') || response.includes('sinking') ||
      response.includes('diagonal') && response.includes('corner')) {
    category = 'settlement'
  }
  // Thermal indicators
  else if (response.includes('thermal') || response.includes('temperature') ||
           response.includes('expansion') || response.includes('contraction') ||
           response.includes('seasonal') || response.includes('weather')) {
    category = 'thermal'
  }
  // Moisture indicators
  else if (response.includes('moisture') || response.includes('water') ||
           response.includes('damp') || response.includes('wet') ||
           response.includes('leak') || response.includes('freeze')) {
    category = 'moisture'
  }
  // Structural indicators
  else if (response.includes('structural') || response.includes('load') ||
           response.includes('beam') || response.includes('support') ||
           response.includes('bearing') || response.includes('stress')) {
    category = 'structural'
  }
  // Vibration indicators
  else if (response.includes('vibration') || response.includes('traffic') ||
           response.includes('construction') || response.includes('machinery') ||
           response.includes('seismic') || response.includes('earthquake')) {
    category = 'vibration'
  }
  // Material defect indicators
  else if (response.includes('material') || response.includes('defect') ||
           response.includes('quality') || response.includes('aging') ||
           response.includes('deterioration') || response.includes('construction')) {
    category = 'material_defect'
  }
  
  // Find the corresponding template
  template = templates.find(t => t.category === category) || null
  
  // Determine crack type based on description
  let crackType: CrackAnalysis['crack_type'] = 'random'
  if (response.includes('horizontal')) crackType = 'horizontal'
  else if (response.includes('vertical')) crackType = 'vertical'
  else if (response.includes('diagonal')) crackType = 'diagonal'
  else if (response.includes('step') || response.includes('stair')) crackType = 'stepped'
  else if (response.includes('hairline') || response.includes('fine')) crackType = 'hairline'
  else if (response.includes('wide') || response.includes('large')) crackType = 'wide'
  
  // Determine severity based on findings and keywords
  let severity: CrackAnalysis['crack_severity'] = 'moderate'
  
  // High severity indicators
  if (response.includes('severe') || response.includes('critical') ||
      response.includes('immediate') || response.includes('urgent') ||
      response.includes('structural') || response.includes('unsafe') ||
      category === 'structural') {
    severity = 'high'
  }
  // Low severity indicators
  else if (response.includes('minor') || response.includes('cosmetic') ||
           response.includes('surface') || response.includes('hairline') ||
           response.includes('no concern')) {
    severity = 'low'
  }
  
  // Also check findings for severity clues
  if (findings && findings.length > 0) {
    const highSeverityCount = findings.filter(f => f.severity === 'High').length
    const lowSeverityCount = findings.filter(f => f.severity === 'Low').length
    
    if (highSeverityCount > 0) {
      severity = 'high'
    } else if (lowSeverityCount === findings.length) {
      severity = 'low'
    }
  }
  
  return { category, crackType, severity, template }
}

// Function to generate personalized recommendations based on template and user context
export function generatePersonalizedRecommendations(
  template: CrackCauseTemplate | null,
  severity: CrackAnalysis['crack_severity'],
  userContext: {
    question?: string
    additionalInfo?: string
    buildingAge?: string
    environmentalFactors?: string
  }
): {
  immediateActions: string[]
  longTermRecommendations: string[]
  monitoringRequirements: string
  consultationNeeded: boolean
} {
  console.log('generatePersonalizedRecommendations called with:', { template, severity, userContext })
  
  let immediateActions: string[] = []
  let longTermRecommendations: string[] = []
  let monitoringRequirements = 'Monitor crack width and length monthly for any changes'
  let consultationNeeded = false
  
  // Base recommendations from template
  if (template && template.standard_recommendations && Array.isArray(template.standard_recommendations)) {
    console.log('Using template recommendations:', template.standard_recommendations)
    immediateActions = [...template.standard_recommendations.slice(0, 2)]
    longTermRecommendations = [...template.standard_recommendations.slice(2)]
  } else {
    console.log('Template or standard_recommendations not available:', { 
      template: !!template, 
      hasRecommendations: template?.standard_recommendations,
      isArray: Array.isArray(template?.standard_recommendations)
    })
  }
  
  // Severity-based adjustments
  if (severity === 'high') {
    immediateActions.unshift('Immediate professional structural assessment required')
    consultationNeeded = true
    monitoringRequirements = 'Daily monitoring required - measure and photograph cracks'
  } else if (severity === 'low') {
    monitoringRequirements = 'Quarterly monitoring sufficient - check for any growth or new cracks'
  }
  
  // Context-based personalizations
  if (userContext.buildingAge && userContext.buildingAge.includes('old')) {
    longTermRecommendations.push('Consider comprehensive building condition assessment due to age')
  }
  
  if (userContext.environmentalFactors && userContext.environmentalFactors.includes('moisture')) {
    immediateActions.push('Address moisture sources immediately')
    longTermRecommendations.push('Implement long-term moisture control strategy')
  }
  
  // Ensure we have meaningful recommendations
  if (immediateActions.length === 0) {
    immediateActions = [
      'Document current crack condition with photos and measurements',
      'Monitor crack for any immediate changes or growth'
    ]
  }
  
  if (longTermRecommendations.length === 0) {
    longTermRecommendations = [
      'Schedule periodic inspection by qualified professional',
      'Address underlying causes if identified',
      'Consider preventive maintenance measures'
    ]
  }
  
  console.log('Final recommendations:', { immediateActions, longTermRecommendations, monitoringRequirements, consultationNeeded })
  
  return {
    immediateActions,
    longTermRecommendations,
    monitoringRequirements,
    consultationNeeded
  }
}

// Function to save analysis to new crack_analyses table
export async function saveCrackAnalysis(analysisData: Omit<CrackAnalysis, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
  const { data, error } = await supabase
    .from('crack_analyses')
    .insert(analysisData)
    .select('id')
    .single()
  
  if (error) {
    console.error('Error saving crack analysis:', error)
    return null
  }
  
  return data?.id || null
}