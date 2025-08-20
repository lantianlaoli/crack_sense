-- Create crack cause templates table with standardized categories
CREATE TABLE IF NOT EXISTS crack_cause_templates (
  id SERIAL PRIMARY KEY,
  category TEXT UNIQUE NOT NULL CHECK (category IN ('settlement', 'thermal', 'moisture', 'structural', 'vibration', 'material_defect', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  typical_characteristics TEXT NOT NULL,
  risk_indicators TEXT NOT NULL,
  standard_recommendations TEXT[] NOT NULL,
  severity_factors TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert standardized crack cause templates
INSERT INTO crack_cause_templates (category, title, description, typical_characteristics, risk_indicators, standard_recommendations, severity_factors) VALUES
('settlement', 'Foundation Settlement', 'Cracks caused by uneven settlement of the building foundation, typically occurring when soil conditions change or the foundation was inadequately designed.', 'Diagonal cracks at corners of openings, step-like cracks in masonry, horizontal cracks near foundation level', 'Progressive widening, doors/windows misalignment, uneven floors', ARRAY['Monitor crack width over time', 'Check foundation drainage', 'Consult structural engineer if cracks exceed 5mm', 'Address underlying soil/water issues'], 'Width >5mm requires immediate attention. Multiple cracks indicate widespread settlement.'),

('thermal', 'Thermal Expansion/Contraction', 'Cracks resulting from temperature-induced expansion and contraction of building materials, especially common in areas with significant temperature variations.', 'Horizontal cracks at floor levels, vertical cracks at material interfaces, recurring seasonal patterns', 'Seasonal crack opening/closing, cracks at material junctions, building orientation correlation', ARRAY['Install expansion joints where needed', 'Improve insulation to reduce temperature differential', 'Monitor seasonal changes', 'Consider flexible sealants for minor cracks'], 'Generally less concerning unless combined with structural movement. Width >3mm may need attention.'),

('moisture', 'Moisture-Related Damage', 'Cracks caused by moisture infiltration, freeze-thaw cycles, or differential moisture content in materials leading to swelling and shrinkage.', 'Random pattern cracks, surface scaling, discoloration around cracks, basement/foundation cracks', 'Water stains, efflorescence, mold growth, basement flooding history', ARRAY['Improve drainage and waterproofing', 'Repair leaks immediately', 'Install proper vapor barriers', 'Monitor humidity levels', 'Address ice dam formation'], 'Moisture-related cracks can lead to structural deterioration. Any active water intrusion requires immediate action.'),

('structural', 'Structural Overload', 'Cracks resulting from loads exceeding the structural capacity of the building elements, indicating potential structural failure.', 'Diagonal shear cracks, vertical cracks in load-bearing elements, sagging or deflection', 'Increasing crack width under load, structural deformation, unusual sounds/vibrations', ARRAY['Immediate structural engineering assessment required', 'Temporary load reduction if possible', 'Monitor for progressive failure', 'Evacuate if severe structural distress observed'], 'HIGH PRIORITY: Any structural cracking requires immediate professional evaluation. Safety risk present.'),

('vibration', 'Vibration-Induced Damage', 'Cracks caused by dynamic loading from traffic, machinery, construction activities, or seismic events causing repetitive stress.', 'Fine hairline cracks that propagate over time, cracks near vibration sources, fatigue patterns', 'Proximity to roads/railways/airports, construction activity, machinery operation', ARRAY['Identify and minimize vibration sources', 'Install vibration isolation if needed', 'Monitor crack progression', 'Strengthen affected areas if necessary'], 'Usually progressive. Monitor rate of propagation. Sudden appearance after seismic events requires immediate assessment.'),

('material_defect', 'Material Defect/Deterioration', 'Cracks resulting from inherent material defects, poor construction practices, or natural aging and deterioration of building materials.', 'Random cracking patterns, surface defects, premature aging signs, construction joint failures', 'Poor construction quality, material age, environmental exposure', ARRAY['Assess material quality and remaining service life', 'Plan for material replacement if needed', 'Improve maintenance practices', 'Consider protective coatings'], 'Varies by material type and defect severity. Some defects may indicate broader construction quality issues.'),

('other', 'Other/Unknown Causes', 'Cracks that do not fit standard categories or have multiple contributing factors requiring detailed investigation.', 'Variable patterns, complex crack networks, unusual characteristics not fitting standard categories', 'Multiple potential causes, unusual environmental conditions, complex loading scenarios', ARRAY['Comprehensive structural investigation required', 'Professional assessment needed', 'Monitor closely until cause determined', 'Address known contributing factors'], 'Unknown causes require professional evaluation to ensure safety and appropriate remediation.');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crack_cause_templates_category ON crack_cause_templates(category);

-- Enable RLS
ALTER TABLE crack_cause_templates ENABLE ROW LEVEL SECURITY;

-- RLS policy - allow read access to authenticated users
CREATE POLICY "Allow read access to crack_cause_templates" ON crack_cause_templates FOR SELECT TO authenticated USING (true);