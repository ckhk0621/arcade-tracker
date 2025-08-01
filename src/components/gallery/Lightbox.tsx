'use client'

import React, { useEffect, useCallback, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LightboxProps } from './types'

const Lightbox: React.FC<LightboxProps> = ({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  className = '',
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const currentPhoto = photos[currentIndex]
  const isFirstPhoto = currentIndex === 0
  const isLastPhoto = currentIndex === photos.length - 1

  // Reset image loaded state when photo changes
  useEffect(() => {
    setImageLoaded(false)
  }, [currentIndex])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          if (!isFirstPhoto) onPrevious()
          break
        case 'ArrowRight':
          if (!isLastPhoto) onNext()
          break
        default:
          break
      }
    },
    [isOpen, isFirstPhoto, isLastPhoto, onClose, onNext, onPrevious]
  )

  // Handle touch gestures for mobile
  const handleTouchStart = (event: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(event.targetTouches[0].clientX)
  }

  const handleTouchMove = (event: React.TouchEvent) => {
    setTouchEnd(event.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const minSwipeDistance = 50

    if (distance > minSwipeDistance && !isLastPhoto) {
      onNext()
    } else if (distance < -minSwipeDistance && !isFirstPhoto) {
      onPrevious()
    }
  }

  // Add/remove event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen || !currentPhoto) return null

  const imageUrl = typeof currentPhoto.image === 'string' ? currentPhoto.image : currentPhoto.image.url
  const imageAlt = currentPhoto.alt || (typeof currentPhoto.image === 'object' ? currentPhoto.image.alt : `Photo ${currentIndex + 1}`)
  const imageWidth = typeof currentPhoto.image === 'object' ? currentPhoto.image.width : 1200
  const imageHeight = typeof currentPhoto.image === 'object' ? currentPhoto.image.height : 800

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] w-full h-full bg-black/95 border-none p-0 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Photo Gallery - Image {currentIndex + 1} of {photos.length}</DialogTitle>
        </DialogHeader>

        {/* Navigation buttons */}
        <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none z-10">
          {/* Previous button */}
          {!isFirstPhoto && (
            <Button
              variant="secondary"
              size="icon"
              className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white border-none"
              onClick={(e) => {
                e.stopPropagation()
                onPrevious()
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          
          <div className="flex-1" />
          
          {/* Next button */}
          {!isLastPhoto && (
            <Button
              variant="secondary"
              size="icon"
              className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white border-none"
              onClick={(e) => {
                e.stopPropagation()
                onNext()
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}
        </div>

        {/* Close button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white border-none"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Image container */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Loading indicator */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}

          {/* Main image */}
          <Image
            src={imageUrl || ''}
            alt={imageAlt}
            width={imageWidth || 1200}
            height={imageHeight || 800}
            className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            priority
            quality={95}
            sizes="100vw"
          />

          {/* Image counter and caption */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 text-white">
            <div className="flex justify-between items-end">
              <div className="flex-1">
                {currentPhoto.caption && (
                  <p className="text-lg font-medium mb-2 leading-relaxed">
                    {currentPhoto.caption}
                  </p>
                )}
                <p className="text-sm opacity-75">
                  {imageAlt}
                </p>
              </div>
              <div className="text-sm opacity-75 ml-4">
                {currentIndex + 1} of {photos.length}
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard instructions (hidden but available for screen readers) */}
        <div className="sr-only">
          Use arrow keys to navigate between images, or press Escape to close the lightbox.
          Swipe left or right on mobile devices to navigate.
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Lightbox