import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Local fallback examples for environments without Supabase/network
function getFallbackExamples() {
  const now = new Date().toISOString()
  return [
    {
      id: 'fallback-1',
      title: 'Diagonal tension crack near window corner',
      description:
        'Hairline diagonal crack at 45° from window corner. Likely due to localized tensile stress and minor settlement.',
      severity: 'low' as const,
      crack_type: 'Diagonal tension crack (45° orientation)',
      crack_width: '< 0.3 mm',
      crack_length: '15–25 cm',
      image_url: '/crack_example.jpg',
      analysis_summary:
        'Minor diagonal cracking consistent with stress concentration near openings. Monitor and seal to prevent moisture ingress.',
      crack_cause:
        '1) VISUAL ASSESSMENT: Hairline diagonal crack extending from window corner at ~45°.\n2) PROBABLE CAUSE: Localized tensile stress and minor differential settlement.\n3) RISK: Low; primarily aesthetic with limited structural impact.\n4) RECOMMENDATION: Seal with acrylic filler; monitor for widening.',
      repair_steps: [
        'Clean and dry the area; remove loose material.',
        'Apply acrylic crack filler suitable for hairline cracks.',
        'Feather and sand; prime and repaint to finish.',
        'Monitor for changes over 3–6 months.',
      ],
      created_at: now,
    },
    {
      id: 'fallback-2',
      title: 'Vertical shrinkage crack on plaster wall',
      description:
        'Narrow vertical crack typical of drying shrinkage in plaster; limited structural significance.',
      severity: 'low' as const,
      crack_type: 'Vertical shrinkage crack',
      crack_width: '≈ 0.5 mm',
      crack_length: '40–60 cm',
      image_url: '/crack_example.jpg',
      analysis_summary:
        'Drying/shrinkage-related cracking. Address with flexible filler and repaint; monitor for recurrence.',
      crack_cause:
        '1) VISUAL ASSESSMENT: Vertical fine crack without displacement.\n2) PROBABLE CAUSE: Material shrinkage from curing/drying.\n3) RISK: Low; mainly cosmetic.\n4) RECOMMENDATION: Flexible filler and repaint.',
      repair_steps: [
        'Open up the crack slightly to form a V-groove.',
        'Fill with flexible acrylic/latex compound; allow to cure.',
        'Sand smooth; apply primer and finish coat.',
      ],
      created_at: now,
    },
    {
      id: 'fallback-3',
      title: 'Horizontal crack along mortar joint',
      description:
        'Crack following mortar joint indicates thermal movement or minor support issues; inspect if widening.',
      severity: 'moderate' as const,
      crack_type: 'Horizontal mortar joint crack',
      crack_width: '0.5–1.0 mm',
      crack_length: '80+ cm',
      image_url: '/crack_example.jpg',
      analysis_summary:
        'Movement along masonry joint. Repoint with compatible mortar; assess support/anchorage if progression noted.',
      crack_cause:
        '1) VISUAL ASSESSMENT: Crack tracking along mortar bed joint.\n2) PROBABLE CAUSE: Thermal movement and minor differential support.\n3) RISK: Moderate if active movement persists.\n4) RECOMMENDATION: Rake and repoint with compatible mortar; monitor.',
      repair_steps: [
        'Rake out deteriorated mortar to appropriate depth.',
        'Repoint using compatible mortar; ensure proper curing.',
        'Install/verify movement joints where appropriate.',
        'Monitor for recurrence or widening (>2 mm).',
      ],
      created_at: now,
    },
  ]
}

export async function GET() {
  try {
    // If Supabase is not configured, return safe fallback data
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnon) {
      console.warn('Examples API: Supabase env not configured, returning fallback examples')
      return NextResponse.json({ examples: getFallbackExamples() })
    }

    // Query featured examples from crack_analyses table
    // Select analyses with images and good data for display
    const { data: analyses, error } = await supabase
      .from('crack_analyses')
      .select(`
        id,
        crack_type,
        crack_width,
        crack_length,
        image_urls,
        processed_image_url,
        risk_level,
        created_at,
        crack_cause,
        repair_steps
      `)
      .not('image_urls', 'eq', '[]')
      .not('crack_type', 'is', null)
      .not('crack_cause', 'is', null)
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      console.error('Error fetching examples:', error)
      // Graceful fallback when DB query fails (e.g., no network)
      return NextResponse.json({ examples: getFallbackExamples() })
    }

    console.log('Raw analysis data:', analyses?.length, 'records')
    if (analyses && analyses.length > 0) {
      console.log('First record repair_steps:', analyses[0].repair_steps)
    }

    // Transform data to match expected frontend format
    const featuredExamples = analyses?.map(analysis => {
      // Create a descriptive title from crack_type
      let title = analysis.crack_type || 'Crack Analysis'
      if (title.length > 60) {
        title = title.substring(0, 60) + '...'
      }

      // Create description from crack cause (for card preview only)
      let description = ''
      if (analysis.crack_cause) {
        const cleanCause = analysis.crack_cause
          .replace(/\d+\)\s+[A-Z\s]+:/g, '')
          .replace(/\n+/g, ' ')
          .trim()
        description = cleanCause.substring(0, 120) + (cleanCause.length > 120 ? '...' : '')
      }

      // Prioritize processed images over original images
      let imageUrl = '/crack_example.jpg' // Default fallback
      
      // Use processed image first, then fall back to original images
      if (analysis.processed_image_url) {
        imageUrl = analysis.processed_image_url
      } else if (Array.isArray(analysis.image_urls) && analysis.image_urls.length > 0) {
        imageUrl = analysis.image_urls[0]
      }

      return {
        id: analysis.id,
        title,
        description,
        severity: analysis.risk_level as 'low' | 'moderate' | 'high',
        crack_type: analysis.crack_type || 'Unknown Type',
        crack_width: analysis.crack_width || undefined,
        crack_length: analysis.crack_length || undefined,
        image_url: imageUrl,
        analysis_summary: description,
        crack_cause: analysis.crack_cause || '',
        repair_steps: analysis.repair_steps || [],
        created_at: analysis.created_at
      }
    }) || []

    return NextResponse.json({ examples: featuredExamples })
  } catch (error) {
    console.error('Unexpected error fetching examples:', error)
    // Final safety net: return fallback data instead of 500 to avoid UI errors
    return NextResponse.json({ examples: getFallbackExamples() })
  }
}
