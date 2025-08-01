'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageData {
  url: string
  caption?: string
  isPrimary?: boolean
}

interface HorizontalImageListProps {
  images: ImageData[]
  className?: string
}

const DUMMY_IMAGES = [
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1560472355-109703aa3edc?w=400&h=300&fit=crop',
]

export default function HorizontalImageList({ 
  images = [], 
  className = ''
}: HorizontalImageListProps) {
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set())

  // Use provided images or fallback to dummy images
  const displayImages = images.length > 0 
    ? images.map(img => img.url).filter(Boolean)
    : DUMMY_IMAGES

  const handleImageError = (index: number) => {
    setImageLoadErrors(prev => new Set(prev).add(index))
  }

  if (displayImages.length === 0) {
    return (
      <div className={`w-full h-32 bg-muted rounded-lg flex items-center justify-center border ${className}`}>
        <p className="text-muted-foreground text-sm">暫無圖片</p>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Horizontal scrolling container */}
      <div className="overflow-x-auto overflow-y-hidden horizontal-scroll custom-scrollbar">
        <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
          {displayImages.map((imageUrl, index) => (
            <div
              key={index}
              className="w-40 h-32 relative rounded-md overflow-hidden bg-muted border border-border/50 flex-shrink-0 mobile-touch-feedback"
            >
              {!imageLoadErrors.has(index) ? (
                <Image
                  src={imageUrl}
                  alt={images[index]?.caption || `店舖圖片 ${index + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-200"
                  onError={() => handleImageError(index)}
                  sizes="160px"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground text-xs">圖片載入失敗</p>
                </div>
              )}
              
              {/* Optional caption overlay */}
              {images[index]?.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2">
                  {images[index].caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}