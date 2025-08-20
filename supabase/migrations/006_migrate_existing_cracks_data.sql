-- Migration script to populate crack_analyses table from existing cracks data
-- This will analyze existing crack data and categorize it using basic heuristics

-- First, let's create a temporary function to categorize existing cracks
CREATE OR REPLACE FUNCTION categorize_existing_crack(
  ai_notes TEXT,
  risk_level TEXT
) RETURNS TABLE (
  crack_cause_category TEXT,
  crack_type TEXT,
  crack_severity TEXT
) AS $$
BEGIN
  -- Initialize default values
  crack_cause_category := 'other';
  crack_type := 'random';
  crack_severity := CASE 
    WHEN risk_level = 'high' THEN 'high'
    WHEN risk_level = 'low' THEN 'low'
    ELSE 'moderate'
  END;

  -- Analyze AI notes for category keywords
  IF ai_notes ILIKE '%settlement%' OR ai_notes ILIKE '%foundation%' OR ai_notes ILIKE '%sinking%' THEN
    crack_cause_category := 'settlement';
  ELSIF ai_notes ILIKE '%thermal%' OR ai_notes ILIKE '%temperature%' OR ai_notes ILIKE '%expansion%' OR ai_notes ILIKE '%seasonal%' THEN
    crack_cause_category := 'thermal';
  ELSIF ai_notes ILIKE '%moisture%' OR ai_notes ILIKE '%water%' OR ai_notes ILIKE '%damp%' OR ai_notes ILIKE '%wet%' THEN
    crack_cause_category := 'moisture';
  ELSIF ai_notes ILIKE '%structural%' OR ai_notes ILIKE '%load%' OR ai_notes ILIKE '%beam%' OR ai_notes ILIKE '%support%' THEN
    crack_cause_category := 'structural';
  ELSIF ai_notes ILIKE '%vibration%' OR ai_notes ILIKE '%traffic%' OR ai_notes ILIKE '%construction%' THEN
    crack_cause_category := 'vibration';
  ELSIF ai_notes ILIKE '%material%' OR ai_notes ILIKE '%defect%' OR ai_notes ILIKE '%quality%' OR ai_notes ILIKE '%aging%' THEN
    crack_cause_category := 'material_defect';
  END IF;

  -- Analyze for crack type
  IF ai_notes ILIKE '%horizontal%' THEN
    crack_type := 'horizontal';
  ELSIF ai_notes ILIKE '%vertical%' THEN
    crack_type := 'vertical';
  ELSIF ai_notes ILIKE '%diagonal%' THEN
    crack_type := 'diagonal';
  ELSIF ai_notes ILIKE '%step%' OR ai_notes ILIKE '%stair%' THEN
    crack_type := 'stepped';
  ELSIF ai_notes ILIKE '%hairline%' OR ai_notes ILIKE '%fine%' THEN
    crack_type := 'hairline';
  ELSIF ai_notes ILIKE '%wide%' OR ai_notes ILIKE '%large%' THEN
    crack_type := 'wide';
  END IF;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Migrate existing cracks data to crack_analyses table
INSERT INTO crack_analyses (
  user_id,
  conversation_id,
  crack_cause_category,
  crack_type,
  crack_severity,
  personalized_analysis,
  structural_impact_assessment,
  immediate_actions_required,
  long_term_recommendations,
  monitoring_requirements,
  professional_consultation_needed,
  confidence_level,
  image_urls,
  user_question,
  additional_context,
  created_at
)
SELECT 
  c.user_id,
  c.conversation_id,
  cat.crack_cause_category,
  cat.crack_type,
  cat.crack_severity,
  COALESCE(c.ai_notes, 'Migrated analysis from legacy system'),
  CASE 
    WHEN cat.crack_cause_category = 'settlement' THEN 'Potential foundation settlement issues requiring monitoring'
    WHEN cat.crack_cause_category = 'thermal' THEN 'Temperature-related expansion/contraction effects'
    WHEN cat.crack_cause_category = 'moisture' THEN 'Moisture infiltration and related structural impacts'
    WHEN cat.crack_cause_category = 'structural' THEN 'Structural loading concerns requiring evaluation'
    WHEN cat.crack_cause_category = 'vibration' THEN 'Dynamic loading effects from external sources'
    WHEN cat.crack_cause_category = 'material_defect' THEN 'Material or construction quality concerns'
    ELSE 'General structural assessment based on visual inspection'
  END,
  CASE 
    WHEN c.risk_level = 'high' THEN ARRAY['Immediate professional assessment required', 'Monitor for changes daily']
    WHEN c.risk_level = 'low' THEN ARRAY['Document current condition', 'Monitor periodically']
    ELSE ARRAY['Monitor crack development', 'Consider professional consultation if changes occur']
  END,
  CASE 
    WHEN c.risk_level = 'high' THEN ARRAY['Comprehensive structural evaluation', 'Address underlying causes', 'Implement immediate stabilization if needed']
    ELSE ARRAY['Regular monitoring program', 'Address environmental factors contributing to cracking']
  END,
  CASE 
    WHEN c.risk_level = 'high' THEN 'Daily monitoring with measurements and photos required'
    WHEN c.risk_level = 'low' THEN 'Monthly visual inspection sufficient'
    ELSE 'Weekly monitoring recommended'
  END,
  CASE WHEN c.risk_level = 'high' THEN true ELSE false END,
  COALESCE((c.detailed_analysis->>'confidence')::integer, 85),
  COALESCE(c.image_urls, '{}'),
  c.user_question,
  c.additional_info,
  c.created_at
FROM cracks c
CROSS JOIN LATERAL categorize_existing_crack(c.ai_notes, c.risk_level) cat
WHERE NOT EXISTS (
  -- Avoid duplicates if migration runs multiple times
  SELECT 1 FROM crack_analyses ca 
  WHERE ca.user_id = c.user_id 
  AND ca.created_at = c.created_at 
  AND ca.image_urls = c.image_urls
);

-- Clean up temporary function
DROP FUNCTION IF EXISTS categorize_existing_crack(TEXT, TEXT);

-- Add comment to track migration
COMMENT ON TABLE crack_analyses IS 'Enhanced crack analysis table with standardized categorization and personalized recommendations. Migrated from legacy cracks table.';

-- Create a view to combine legacy and new data for backward compatibility
CREATE OR REPLACE VIEW combined_crack_analyses AS
SELECT 
  ca.id,
  ca.user_id,
  ca.conversation_id,
  ca.personalized_analysis as ai_notes,
  ca.crack_severity as risk_level,
  ca.image_urls,
  ca.user_question,
  ca.additional_context as additional_info,
  ca.created_at,
  jsonb_build_object(
    'confidence', ca.confidence_level,
    'riskLevel', ca.crack_severity,
    'crackCount', 1,
    'findings', '[]'::jsonb,
    'recommendations', to_jsonb(ca.immediate_actions_required || ca.long_term_recommendations),
    'aiNotes', ca.personalized_analysis,
    'enhancedAnalysis', jsonb_build_object(
      'category', ca.crack_cause_category,
      'crackType', ca.crack_type,
      'severity', ca.crack_severity,
      'template', jsonb_build_object(
        'title', cct.title,
        'description', cct.description
      ),
      'personalizedRecommendations', jsonb_build_object(
        'immediateActions', ca.immediate_actions_required,
        'longTermRecommendations', ca.long_term_recommendations,
        'monitoringRequirements', ca.monitoring_requirements,
        'consultationNeeded', ca.professional_consultation_needed
      )
    )
  ) as detailed_analysis
FROM crack_analyses ca
LEFT JOIN crack_cause_templates cct ON cct.category = ca.crack_cause_category;

-- Grant appropriate permissions
GRANT SELECT ON combined_crack_analyses TO authenticated;