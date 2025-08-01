import { v2 as cloudinary } from 'cloudinary'
import type { CloudinaryUploadResponse } from '@/components/upload/types'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface CloudinaryUploadOptions {
  folder?: string
  transformation?: string
  public_id?: string
  tags?: string[]
  quality?: 'auto' | number
  format?: 'auto' | 'jpg' | 'png' | 'webp'
}

/**
 * Upload a file to Cloudinary
 */
export async function uploadToCloudinary(
  file: File,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResponse> {
  const {
    folder = 'arcade-tracker',
    transformation,
    public_id,
    tags = [],
    quality = 'auto',
    format = 'auto',
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      const uploadOptions = {
        folder,
        public_id,
        tags: [...tags, 'arcade-tracker'],
        quality,
        format,
        transformation,
        resource_type: 'image' as const,
      }

      cloudinary.uploader.upload(
        reader.result as string,
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(new Error(`Cloudinary upload failed: ${error.message}`))
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              url: result.url,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
              created_at: result.created_at,
            })
          } else {
            reject(new Error('No result from Cloudinary upload'))
          }
        }
      )
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(new Error(`Failed to delete from Cloudinary: ${error.message}`))
      } else {
        resolve()
      }
    })
  })
}

/**
 * Generate optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: 'auto' | number
    format?: 'auto' | 'jpg' | 'png' | 'webp'
    crop?: 'fill' | 'fit' | 'scale' | 'crop'
  } = {}
): string {
  const { width, height, quality = 'auto', format = 'auto', crop = 'fill' } = options

  let transformation = `q_${quality},f_${format}`
  
  if (width || height) {
    transformation += `,c_${crop}`
    if (width) transformation += `,w_${width}`
    if (height) transformation += `,h_${height}`
  }

  return cloudinary.url(publicId, {
    transformation,
    secure: true,
  })
}

export { cloudinary }