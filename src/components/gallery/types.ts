import { Media, Store } from '@/payload-types'

export interface PhotoItem {
  id: string
  image: Media
  alt?: string
  caption?: string
}

export interface PhotoGalleryProps {
  photos: PhotoItem[]
  store?: Store
  className?: string
  columns?: {
    mobile: number
    tablet: number
    desktop: number
  }
  onPhotoClick?: (photo: PhotoItem, index: number) => void
  loading?: boolean
  lazyLoading?: boolean
}

export interface SkeletonLoaderProps {
  count?: number
  className?: string
  columns?: {
    mobile: number
    tablet: number
    desktop: number
  }
}

export interface LightboxProps {
  photos: PhotoItem[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
  className?: string
}

export interface PhotoItemProps {
  photo: PhotoItem
  index: number
  onClick?: (photo: PhotoItem, index: number) => void
  priority?: boolean
  sizes?: string
  className?: string
  lazyLoading?: boolean
}