-- Create articles table for blog posts
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  author_name TEXT DEFAULT 'CrackSense Team',
  published BOOLEAN DEFAULT false,
  reading_time INTEGER, -- estimated reading time in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on slug for fast lookups
CREATE INDEX idx_articles_slug ON articles(slug);

-- Add index on published status for filtering
CREATE INDEX idx_articles_published ON articles(published);

-- Add index on created_at for ordering
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policy for reading published articles (public access)
CREATE POLICY "Anyone can read published articles" ON articles
  FOR SELECT
  USING (published = true);

-- Create policy for admins to manage articles (if admin system is implemented later)
-- For now, we'll handle article creation through direct database access or admin interface

-- Insert sample blog posts
INSERT INTO articles (title, slug, content, excerpt, cover_image, published, reading_time) VALUES
(
  'How to Identify Different Types of Wall Cracks',
  'identify-wall-crack-types',
  '# How to Identify Different Types of Wall Cracks

Wall cracks can appear for various reasons, and understanding their characteristics is crucial for determining the appropriate response. This comprehensive guide will help you identify different crack types and assess their potential severity.

## Common Types of Wall Cracks

### 1. Hairline Cracks
Hairline cracks are thin, superficial cracks that typically appear in painted surfaces. They are usually less than 1mm wide and often result from:
- Natural settling of the building
- Temperature fluctuations
- Moisture changes in the wall material

**Assessment**: Generally cosmetic and not structurally concerning.

### 2. Vertical Cracks
Vertical cracks run straight up and down the wall and can indicate:
- Normal settling (especially in new buildings)
- Foundation issues (if accompanied by other signs)
- Structural movement

**Assessment**: Usually low to moderate concern, but monitor for changes.

### 3. Horizontal Cracks
Horizontal cracks are more concerning as they may indicate:
- Foundation pressure issues
- Structural load problems
- Water damage or freeze-thaw cycles

**Assessment**: Moderate to high concern, especially if wide or growing.

### 4. Diagonal Cracks
Diagonal cracks often appear at 45-degree angles and may suggest:
- Foundation settlement (especially stair-step patterns)
- Structural stress
- Soil movement beneath the foundation

**Assessment**: Often indicates structural issues requiring attention.

### 5. Stair-Step Cracks
Common in brick or block walls, these follow the mortar joints in a step pattern:
- Usually indicates foundation settlement
- Can be serious if cracks are wide or growing
- Often appears at corners or openings

**Assessment**: Moderate to high concern, monitor closely.

## When to Be Concerned

Seek professional evaluation if you notice:
- Cracks wider than 1/4 inch (6mm)
- Rapidly growing cracks
- Cracks accompanied by doors/windows that stick
- Multiple cracks appearing simultaneously
- Cracks with separation or displacement

## Monitoring Crack Changes

- Photograph cracks regularly
- Measure and record crack width
- Note any changes in length or pattern
- Document environmental conditions when changes occur

## Professional Assessment

While this guide provides general information, every situation is unique. For accurate assessment and peace of mind, consider using professional crack analysis services like CrackSense, which provides AI-powered analysis to help you understand the severity and appropriate next steps for any crack you discover.',
  'Learn to identify different types of wall cracks and understand their potential severity levels for better home maintenance decisions.',
  '/blog/crack-types-guide.jpg',
  true,
  8
),
(
  'Home Crack Analysis: When to Be Concerned',
  'when-to-worry-about-cracks',
  '# Home Crack Analysis: When to Be Concerned

Not all cracks are created equal. Understanding when a crack requires immediate attention versus routine monitoring can save you both money and stress. This guide explains the warning signs that indicate professional intervention may be needed.

## Immediate Concern Indicators

### Size Matters
- **Width**: Cracks wider than 1/4 inch (6mm) typically indicate structural issues
- **Length**: Long cracks spanning multiple feet may suggest significant movement
- **Depth**: Cracks that go through the full thickness of the wall are more serious

### Rapid Changes
- Cracks that grow noticeably within days or weeks
- New cracks appearing frequently
- Existing cracks suddenly widening or lengthening

### Associated Problems
- Doors or windows that suddenly stick or won''t close properly
- Uneven floors or sloping surfaces
- Gaps appearing around window or door frames
- Visible bowing or bulging in walls

## Location-Specific Concerns

### Foundation Level
Cracks at foundation level are generally more serious because they can indicate:
- Settlement issues
- Hydrostatic pressure problems
- Structural integrity concerns

### Upper Floor Cracks
While often less concerning than foundation cracks, upper floor issues may indicate:
- Roof or structural load problems
- Excessive building movement
- Weather-related expansion/contraction issues

### Near Openings
Cracks near doors and windows often result from:
- Structural stress concentration
- Poor installation practices
- Building movement affecting rigid openings

## Seasonal Considerations

### Temperature-Related Cracks
- Common in extreme temperature changes
- Usually appear and disappear with seasons
- Generally less concerning if patterns are consistent

### Moisture-Related Issues
- Often worse during wet seasons
- May indicate drainage problems
- Can lead to more serious structural issues if unaddressed

## Documentation Best Practices

### Photography
- Take clear, well-lit photos
- Include reference objects for scale
- Photograph from multiple angles
- Date all images for comparison

### Measurements
- Record exact crack dimensions
- Note crack patterns and directions
- Track changes over time
- Document environmental conditions

## Professional Assessment Benefits

While general guidelines help, professional assessment provides:
- Accurate structural analysis
- Specific repair recommendations
- Peace of mind through expert evaluation
- Documentation for insurance purposes

Modern AI-powered tools like CrackSense can provide detailed analysis within minutes, helping you understand whether immediate action is needed or if monitoring is sufficient.

## Red Flags Requiring Immediate Professional Attention

Contact a structural engineer immediately if you observe:
- Cracks wider than 1/2 inch (12mm)
- Horizontal cracks in foundation walls
- Stair-step cracks in masonry that are growing
- Multiple new cracks appearing suddenly
- Cracks accompanied by other structural signs

Remember: when in doubt, seek professional evaluation. The cost of assessment is typically much less than the cost of delayed repairs.',
  'Understand the warning signs that indicate when wall cracks require professional attention versus routine monitoring.',
  '/blog/crack-concern-guide.jpg',
  true,
  6
),
(
  'DIY Crack Repair vs Professional Maintenance Guide',
  'diy-vs-professional-crack-repair',
  '# DIY Crack Repair vs Professional Maintenance Guide

Deciding whether to tackle crack repair yourself or hire professionals depends on several factors including crack severity, location, and your skill level. This guide helps you make informed decisions about crack repair approaches.

## When DIY Repair is Appropriate

### Cosmetic Hairline Cracks
**Characteristics:**
- Less than 1mm wide
- Superficial surface damage only
- Stable (not growing)
- Located in non-structural areas

**DIY Solutions:**
- High-quality paintable caulk
- Spackling paste for small areas
- Mesh tape for slightly larger cracks
- Basic tools: putty knife, sandpaper, primer

**Estimated Cost:** $10-30 for materials

### Small Settlement Cracks
**Characteristics:**
- 1-3mm wide
- Vertical orientation
- In drywall or plaster
- No associated structural issues

**DIY Approach:**
- Clean crack thoroughly
- Apply flexible caulk or compound
- Sand smooth when dry
- Prime and paint to match

**Estimated Cost:** $20-50 for materials

## When Professional Help is Essential

### Structural Cracks
**Indicators:**
- Wider than 6mm (1/4 inch)
- Growing or changing rapidly
- Horizontal foundation cracks
- Accompanied by other structural signs

**Why Professional:**
- Requires structural assessment
- May need specialized materials
- Could indicate foundation issues
- Warranty and insurance considerations

**Estimated Cost:** $200-2000+ depending on severity

### Complex Repair Situations
**Examples:**
- Brick or stone masonry work
- Load-bearing wall cracks
- Water damage-related issues
- Multiple interconnected cracks

## Cost-Benefit Analysis

### DIY Advantages
- Lower immediate cost
- Immediate action possible
- Learning experience
- Control over materials and timeline

### DIY Limitations
- Limited diagnostic capability
- Potential for inadequate repair
- No warranty coverage
- Risk of missing underlying issues

### Professional Advantages
- Accurate problem diagnosis
- Appropriate repair methods
- Warranty coverage
- Insurance documentation
- Long-term reliability

### Professional Considerations
- Higher upfront cost
- Scheduling requirements
- Less control over process
- Potential for over-recommendation

## Essential DIY Tools and Materials

### Basic Crack Repair Kit
- Flexible acrylic caulk
- Mesh tape (various widths)
- Spackling compound
- Putty knives (multiple sizes)
- Sandpaper (120 and 220 grit)
- Primer and paint

### Recommended Brands
- **Caulk**: DAP Alex Plus, GE Supreme Silicone
- **Compound**: 3M Patch Plus Primer, Bondo
- **Mesh Tape**: FibaTape, Saint-Gobain ADFORS

### Safety Equipment
- Safety glasses
- Dust mask
- Work gloves
- Drop cloths

## Step-by-Step DIY Process

### 1. Assessment
- Photograph the crack
- Measure dimensions
- Check for active movement
- Assess surrounding area

### 2. Preparation
- Clean crack thoroughly
- Remove loose material
- Protect surrounding surfaces
- Gather all materials

### 3. Repair
- Apply appropriate filler
- Allow proper curing time
- Sand smooth
- Prime affected area

### 4. Finishing
- Apply matching paint
- Inspect for completeness
- Document repair date
- Monitor for recurrence

## When to Escalate to Professional

Even after DIY repair, consider professional evaluation if:
- Crack reappears within 6 months
- New cracks develop nearby
- Original crack continues growing
- Associated problems develop

## Prevention Strategies

### Environmental Control
- Maintain consistent indoor humidity
- Ensure proper drainage around foundation
- Address water infiltration promptly
- Monitor seasonal movement patterns

### Regular Monitoring
- Quarterly visual inspections
- Photo documentation
- Measurement tracking
- Professional periodic assessment

## Decision Framework

**Choose DIY when:**
- Crack is clearly cosmetic
- You have appropriate skills/tools
- No time pressure exists
- Willing to monitor results

**Choose Professional when:**
- Structural concerns exist
- Complex repair required
- Insurance documentation needed
- Long-term warranty desired

Remember: accurate initial assessment is crucial for making the right repair decision. Tools like CrackSense can provide professional-grade analysis to help you determine the most appropriate repair approach for your specific situation.',
  'Learn when to handle crack repairs yourself versus when professional intervention is necessary, including cost considerations and safety factors.',
  '/blog/diy-vs-professional.jpg',
  true,
  10
);