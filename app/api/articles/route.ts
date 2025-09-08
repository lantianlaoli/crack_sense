import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''

    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`)
    }

    const { data: articles, error, count } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching articles:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch articles' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      articles,
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('Articles API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
