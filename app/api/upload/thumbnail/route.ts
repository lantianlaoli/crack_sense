import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/admin'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (5MB max for thumbnails)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `blog_thumbnails/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    try {
      // Convert File to ArrayBuffer then to Uint8Array
      const arrayBuffer = await file.arrayBuffer()
      const fileBuffer = new Uint8Array(arrayBuffer)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Supabase upload error:', error)
        return NextResponse.json({ error: 'Failed to upload thumbnail' }, { status: 500 })
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(data.path)

      return NextResponse.json({ 
        message: 'Thumbnail uploaded successfully',
        url: publicUrlData.publicUrl 
      })
    } catch (uploadError) {
      console.error('File upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to process thumbnail' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in POST /api/upload/thumbnail:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}