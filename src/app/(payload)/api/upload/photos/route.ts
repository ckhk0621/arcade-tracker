import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { PayloadMediaDocument } from '@/components/upload/types'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const formData = await request.formData()
    
    const files = formData.getAll('files') as File[]
    const uploadedFiles: PayloadMediaDocument[] = []

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Process each file
    for (const file of files) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`Invalid file type: ${file.type}`)
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('File too large')
        }

        // Create a buffer from the file for PayloadCMS
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Create media document in PayloadCMS with the file
        const mediaDoc = await payload.create({
          collection: 'media',
          data: {
            alt: file.name.split('.')[0], // Use filename without extension as alt text
            tags: [{ tag: 'upload' }, { tag: 'photo' }],
          },
          file: {
            data: buffer,
            mimetype: file.type,
            name: file.name,
            size: file.size,
          },
        })

        uploadedFiles.push({
          id: mediaDoc.id as string,
          alt: mediaDoc.alt as string,
          url: mediaDoc.url as string,
          filename: mediaDoc.filename as string,
          mimeType: mediaDoc.mimeType as string,
          filesize: mediaDoc.filesize as number,
          width: (mediaDoc.width as number) || 0,
          height: (mediaDoc.height as number) || 0,
          cloudinary_public_id: '', // Will be updated when Cloudinary is configured
        })
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError)
        // Continue processing other files, but log the error
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: 'No files were successfully uploaded' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('mediaId')

    if (!mediaId) {
      return NextResponse.json(
        { error: 'Missing mediaId' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    // Delete from PayloadCMS (this will also handle file cleanup)
    await payload.delete({
      collection: 'media',
      id: mediaId,
    })

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}