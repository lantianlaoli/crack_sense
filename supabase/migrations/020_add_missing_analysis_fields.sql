-- Add missing fields needed for OpenRouter analysis results
ALTER TABLE crack_analyses 
ADD COLUMN IF NOT EXISTS crack_cause TEXT,
ADD COLUMN IF NOT EXISTS crack_width TEXT,
ADD COLUMN IF NOT EXISTS crack_length TEXT,
ADD COLUMN IF NOT EXISTS repair_steps TEXT[],
ADD COLUMN IF NOT EXISTS risk_level TEXT,
ADD COLUMN IF NOT EXISTS model_used TEXT,
ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS severity TEXT;

-- Update existing records to set defaults
UPDATE crack_analyses 
SET 
  risk_level = crack_severity,
  crack_cause = personalized_analysis,
  repair_steps = immediate_actions_required || long_term_recommendations
WHERE crack_cause IS NULL OR risk_level IS NULL;

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_crack_analyses_risk_level ON crack_analyses(risk_level);
CREATE INDEX IF NOT EXISTS idx_crack_analyses_ai_analysis ON crack_analyses USING gin(ai_analysis);

-- Update the view to include the new fields
DROP VIEW IF EXISTS combined_crack_analyses;
CREATE OR REPLACE VIEW combined_crack_analyses AS
SELECT 
  ca.id,
  ca.user_id,
  ca.conversation_id,
  COALESCE(ca.crack_cause, ca.personalized_analysis) as ai_notes,
  COALESCE(ca.risk_level, ca.crack_severity) as risk_level,
  ca.crack_cause,
  ca.crack_width,
  ca.crack_length,
  ca.crack_type,
  ca.repair_steps,
  ca.image_urls,
  ca.user_question,
  ca.additional_context as additional_info,
  ca.created_at,
  ca.ai_analysis,
  jsonb_build_object(
    'confidence', ca.confidence_level,
    'riskLevel', COALESCE(ca.risk_level, ca.crack_severity),
    'crackCount', 1,
    'findings', '[]'::jsonb,
    'recommendations', to_jsonb(COALESCE(ca.repair_steps, ca.immediate_actions_required || ca.long_term_recommendations)),
    'aiNotes', COALESCE(ca.crack_cause, ca.personalized_analysis),
    'enhancedAnalysis', jsonb_build_object(
      'category', ca.crack_cause_category,
      'crackType', ca.crack_type,
      'severity', COALESCE(ca.risk_level, ca.crack_severity),
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
    ),
    'processed_images', COALESCE(ca.ai_analysis->'processed_images', '[]'::jsonb)
  ) as detailed_analysis
FROM crack_analyses ca
LEFT JOIN crack_cause_templates cct ON cct.category = ca.crack_cause_category;

-- Grant appropriate permissions
GRANT SELECT ON combined_crack_analyses TO authenticated;

-- Add comment to track this migration
COMMENT ON COLUMN crack_analyses.ai_analysis IS 'JSON field for storing additional AI analysis data including processed images';
COMMENT ON COLUMN crack_analyses.crack_cause IS 'Detailed explanation of crack cause from AI analysis';
COMMENT ON COLUMN crack_analyses.crack_width IS 'Measured or estimated crack width';
COMMENT ON COLUMN crack_analyses.crack_length IS 'Measured or estimated crack length';
COMMENT ON COLUMN crack_analyses.repair_steps IS 'Detailed repair steps from AI analysis';
COMMENT ON COLUMN crack_analyses.risk_level IS 'Risk level assessment (low/moderate/high)';