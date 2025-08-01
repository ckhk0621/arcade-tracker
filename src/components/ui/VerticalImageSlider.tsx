'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface ImageData {
  url: string
  caption?: string
  isPrimary?: boolean
}

interface VerticalImageSliderProps {
  images: ImageData[]
  className?: string
  autoPlay?: boolean
  autoPlayInterval?: number
}

const DUMMY_IMAGES = [
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
]

export default function VerticalImageSlider({ 
  images = [], 
  className = '',
  autoPlay = true,
  autoPlayInterval = 4000
}: VerticalImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Use provided images or fallback to dummy images
  const displayImages = images.length > 0 
    ? images.map(img => img.url).filter(Boolean)
    : DUMMY_IMAGES

  const totalImages = displayImages.length

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && !isHovered && totalImages > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalImages)
      }, autoPlayInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoPlay, isHovered, totalImages, autoPlayInterval])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalImages)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const handleImageError = (index: number) => {
    setImageLoadErrors(prev => new Set(prev).add(index))
  }

  if (totalImages === 0) {
    return (
      <div className={`w-full h-48 bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-muted-foreground text-sm">暫無圖片</p>
      </div>
    )
  }

  return (
    <div 
      className={`relative w-full h-48 rounded-lg overflow-hidden bg-muted group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative w-full h-full">
        {displayImages.map((imageUrl, index) => {
          const shouldShow = index === currentIndex && !imageLoadErrors.has(index)
          
          return (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                shouldShow ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            >
              {!imageLoadErrors.has(index) ? (
                <Image
                  src={imageUrl}
                  alt={images[index]?.caption || `店舖圖片 ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={() => handleImageError(index)}
                  sizes="(max-width: 768px) 100vw, 400px"
                  priority={index === 0}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">圖片載入失敗</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Navigation Arrows - Only show if more than 1 image */}
      {totalImages > 1 && (
        <>
          {/* Previous Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 left-1/2 transform -translate-x-1/2 h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            onClick={goToPrevious}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>

          {/* Next Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            onClick={goToNext}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dots Indicator - Only show if more than 1 image */}
      {totalImages > 1 && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1 z-10">
          {displayImages.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`前往第 ${index + 1} 張圖片`}
            />
          ))}
        </div>
      )}

      {/* Image Counter */}
      {totalImages > 1 && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {currentIndex + 1} / {totalImages}
        </div>
      )}

      {/* Touch/Swipe Support for Mobile */}
      <div 
        className="absolute inset-0 z-5"
        onTouchStart={(e) => {
          const touch = e.touches[0]
          e.currentTarget.dataset.startY = touch.clientY.toString()
        }}
        onTouchEnd={(e) => {
          const touch = e.changedTouches[0]
          const startY = parseFloat(e.currentTarget.dataset.startY || '0')
          const endY = touch.clientY
          const deltaY = startY - endY
          
          // Minimum swipe distance
          if (Math.abs(deltaY) > 50) {
            if (deltaY > 0) {
              goToNext() // Swipe up - next image
            } else {
              goToPrevious() // Swipe down - previous image
            }
          }
        }}
      />
    </div>
  )
}