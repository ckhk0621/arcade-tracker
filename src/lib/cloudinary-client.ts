/**
 * Client-side Cloudinary upload utilities
 * This uses the unsigned upload API which doesn't require API secrets on the client
 */

export interface CloudinaryClientUploadResponse {
  public_id: string
  secure_url: string
  url: string
  width: number
  height: number
  format: string
  bytes: number
  created_at: string
  signature: string
  version: number
}

export interface CloudinaryClientUploadOptions {
  folder?: string
  transformation?: string
  public_id?: string
  tags?: string[]
  quality?: 'auto' | number
  format?: 'auto' | 'jpg' | 'png' | 'webp'
}

/**
 * Upload a file to Cloudinary using unsigned upload
 * Requires an unsigned upload preset configured in Cloudinary dashboard
 */
export async function uploadToCloudinaryClient(
  file: File,
  uploadPreset: string,
  cloudName: string,
  options: CloudinaryClientUploadOptions = {}
): Promise<CloudinaryClientUploadResponse> {
  const {
    folder = 'arcade-tracker',
    transformation,
    public_id,
    tags = [],
    quality = 'auto',
    format = 'auto',
  } = options

  const formData = new FormData()
  
  // Required fields
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  
  // Optional fields
  if (folder) formData.append('folder', folder)
  if (public_id) formData.append('public_id', public_id)
  if (tags.length > 0) formData.append('tags', tags.join(','))
  if (transformation) formData.append('transformation', transformation)
  
  // Quality and format
  if (quality !== 'auto') formData.append('quality', quality.toString())
  if (format !== 'auto') formData.append('format', format)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
    throw new Error(`Cloudinary upload failed: ${error.error?.message || response.statusText}`)
  }

  const result = await response.json()
  return result as CloudinaryClientUploadResponse
}

/**
 * Generate optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  cloudName: string,
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

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`
}

/**
 * Validate Cloudinary configuration
 */
export function validateCloudinaryConfig(cloudName?: string, uploadPreset?: string): boolean {
  if (!cloudName) {
    console.error('Cloudinary cloud name is required')
    return false
  }
  
  if (!uploadPreset) {
    console.error('Cloudinary upload preset is required')
    return false
  }
  
  return true
}