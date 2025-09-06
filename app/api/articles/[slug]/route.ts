import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug is required' },
        { status: 400 }
      )
    }

    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Article not found' },
          { status: 404 }
        )
      }
      
      console.error('Error fetching article:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch article' },
        { status: 500 }
      )
    }

    // Fetch related articles (same author or similar topics)
    const { data: relatedArticles } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt, cover_image, created_at, reading_time')
      .neq('id', article.id)
      .limit(3)

    return NextResponse.json({
      success: true,
      article,
      relatedArticles: relatedArticles || []
    })
  } catch (error) {
    console.error('Article API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}