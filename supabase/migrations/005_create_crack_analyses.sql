-- Create the optimized crack_analyses table with standardized and personalized fields
CREATE TABLE IF NOT EXISTS crack_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  conversation_id UUID REFERENCES conversations(id),
  
  -- Standardized classification fields (from templates)
  crack_cause_category TEXT NOT NULL CHECK (crack_cause_category IN ('settlement', 'thermal', 'moisture', 'structural', 'vibration', 'material_defect', 'other')),
  crack_type TEXT NOT NULL CHECK (crack_type IN ('horizontal', 'vertical', 'diagonal', 'stepped', 'random', 'hairline', 'wide')),
  crack_severity TEXT NOT NULL CHECK (crack_severity IN ('low', 'moderate', 'high')),
  
  -- Personalized analysis fields (specific to user's situation)
  personalized_analysis TEXT NOT NULL,
  structural_impact_assessment TEXT NOT NULL,
  immediate_actions_required TEXT[] NOT NULL DEFAULT '{}',
  long_term_recommendations TEXT[] NOT NULL DEFAULT '{}',
  monitoring_requirements TEXT NOT NULL,
  professional_consultation_needed BOOLEAN NOT NULL DEFAULT false,
  
  -- Technical analysis data
  confidence_level INTEGER NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 100),
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  
  -- User context (personalized input)
  user_question TEXT,
  additional_context TEXT,
  environmental_factors TEXT,
  building_age_type TEXT,
  previous_repairs TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crack_analyses_user_id ON crack_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_crack_analyses_conversation_id ON crack_analyses(conversation_id);
CREATE INDEX IF NOT EXISTS idx_crack_analyses_cause_category ON crack_analyses(crack_cause_category);
CREATE INDEX IF NOT EXISTS idx_crack_analyses_severity ON crack_analyses(crack_severity);
CREATE INDEX IF NOT EXISTS idx_crack_analyses_created_at ON crack_analyses(created_at DESC);

-- Enable RLS
ALTER TABLE crack_analyses ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own crack analyses" ON crack_analyses 
  FOR SELECT TO authenticated USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own crack analyses" ON crack_analyses 
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own crack analyses" ON crack_analyses 
  FOR UPDATE TO authenticated USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_crack_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_crack_analyses_updated_at_trigger
  BEFORE UPDATE ON crack_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_crack_analyses_updated_at();