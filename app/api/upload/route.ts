import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files: File[] = []
    
    // Collect files from file0, file1, file2 format
    for (let i = 0; i < 3; i++) {
      const file = formData.get(`file${i}`) as File
      if (file && file.size > 0) {
        files.push(file)
      }
    }

    console.log('Upload request:', {
      userId,
      fileCount: files?.length || 0,
      files: files?.map(f => ({ name: f.name, size: f.size, type: f.type })) || []
    })

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (files.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 files allowed' }, { status: 400 })
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
      }

      // Generate unique filename with cracks prefix
      const fileExt = file.name.split('.').pop()
      const fileName = `cracks/${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      try {
        // Convert File to ArrayBuffer then to Uint8Array
        const arrayBuffer = await file.arrayBuffer()
        const fileBuffer = new Uint8Array(arrayBuffer)

        console.log('Starting upload:', {
          fileName,
          bufferSize: fileBuffer.length,
          contentType: file.type
        })

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('images')
          .upload(fileName, fileBuffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('Supabase upload error:', {
            error,
            fileName,
            fileSize: file.size,
            fileType: file.type,
            bucket: 'images'
          })
          return NextResponse.json({ 
            error: `Failed to upload ${file.name}: ${error.message}`,
            details: error
          }, { status: 500 })
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('images')
          .getPublicUrl(data.path)

        console.log('File uploaded successfully:', {
          fileName,
          originalName: file.name,
          path: data.path,
          publicUrl: publicUrlData.publicUrl
        })

        uploadedUrls.push(publicUrlData.publicUrl)
      } catch (uploadError) {
        console.error('File upload error:', uploadError)
        return NextResponse.json({ error: `Failed to process ${file.name}` }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Files uploaded successfully',
      urls: uploadedUrls 
    })
  } catch (error) {
    console.error('Error in POST /api/upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}