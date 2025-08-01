import { Store, Media } from '@/payload-types'
import { PhotoItem } from '@/components/gallery/types'

// Base URL for API calls - adjust this based on your deployment
const API_BASE_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:4400'

/**
 * Fetch all stores with their images populated
 */
export async function getStores(): Promise<Store[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stores?depth=2`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch stores: ${response.statusText}`)
    }

    const data = await response.json()
    return data.docs || []
  } catch (error) {
    console.error('Error fetching stores:', error)
    return []
  }
}

/**
 * Fetch a single store by ID with images populated
 */
export async function getStore(id: string): Promise<Store | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stores/${id}?depth=2`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch store: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching store ${id}:`, error)
    return null
  }
}

/**
 * Fetch all media items
 */
export async function getMediaItems(): Promise<Media[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/media`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.statusText}`)
    }

    const data = await response.json()
    return data.docs || []
  } catch (error) {
    console.error('Error fetching media:', error)
    return []
  }
}

/**
 * Convert store images to PhotoItem format for the gallery
 */
export function convertStoreImagesToPhotoItems(store: Store): PhotoItem[] {
  if (!store.images || store.images.length === 0) {
    return []
  }

  return store.images
    .map((imageItem, index) => {
      if (!imageItem.image) return null

      const media = typeof imageItem.image === 'string' ? null : imageItem.image

      return {
        id: imageItem.id || `${store.id}-image-${index}`,
        image: imageItem.image,
        alt: media?.alt || `${store.name} - Photo ${index + 1}`,
        caption: media?.alt || `Photo from ${store.name}`,
      } as PhotoItem
    })
    .filter((item): item is PhotoItem => item !== null)
}

/**
 * Convert media items to PhotoItem format for a general gallery
 */
export function convertMediaToPhotoItems(mediaItems: Media[]): PhotoItem[] {
  return mediaItems.map((media, index) => ({
    id: media.id,
    image: media,
    alt: media.alt || `Photo ${index + 1}`,
    caption: media.alt,
  }))
}

/**
 * Get optimized image URL for different sizes
 */
export function getOptimizedImageUrl(
  media: Media | string,
  size: 'thumbnail' | 'medium' | 'large' | 'original' = 'medium'
): string {
  if (typeof media === 'string') {
    return media
  }

  const baseUrl = media.url || ''
  
  // If PayloadCMS is configured with image sizes, use them
  // Otherwise, return the original URL
  switch (size) {
    case 'thumbnail':
      return media.thumbnailURL || baseUrl
    case 'medium':
      // You can add medium size URL if configured in PayloadCMS
      return baseUrl
    case 'large':
      // You can add large size URL if configured in PayloadCMS
      return baseUrl
    case 'original':
    default:
      return baseUrl
  }
}

/**
 * Build image src set for responsive images
 */
export function buildImageSrcSet(media: Media | string): string {
  if (typeof media === 'string') {
    return media
  }

  const _originalUrl = media.url || ''
  
  // Build srcset based on available sizes
  // Adjust this based on your PayloadCMS image configuration
  const srcSet = [
    `${getOptimizedImageUrl(media, 'thumbnail')} 300w`,
    `${getOptimizedImageUrl(media, 'medium')} 600w`,
    `${getOptimizedImageUrl(media, 'large')} 1200w`,
    `${getOptimizedImageUrl(media, 'original')} ${media.width || 1920}w`,
  ].join(', ')

  return srcSet
}