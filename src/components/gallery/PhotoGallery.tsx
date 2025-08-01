'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { PhotoGalleryProps, PhotoItem as PhotoItemType } from './types'
import PhotoItem from './PhotoItem'
import Lightbox from './Lightbox'
import GallerySkeleton from '../ui/gallery-skeleton'

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  store,
  className = '',
  columns = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
  onPhotoClick,
  loading = false,
  lazyLoading = true,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Memoize processed photos to avoid unnecessary re-renders
  const processedPhotos = useMemo(() => {
    if (!photos || photos.length === 0) return []
    
    return photos.map((photo, index) => ({
      ...photo,
      id: photo.id || `photo-${index}`,
    }))
  }, [photos])

  // Handle photo click - open lightbox
  const handlePhotoClick = useCallback((photo: PhotoItemType, index: number) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
    
    // Call external onClick handler if provided
    if (onPhotoClick) {
      onPhotoClick(photo, index)
    }
  }, [onPhotoClick])

  // Lightbox navigation handlers
  const handleLightboxClose = useCallback(() => {
    setLightboxOpen(false)
  }, [])

  const handleLightboxNext = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev < processedPhotos.length - 1 ? prev + 1 : prev
    )
  }, [processedPhotos.length])

  const handleLightboxPrevious = useCallback(() => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }, [])

  // Show loading state
  if (loading) {
    return (
      <div className={`w-full ${className}`} role="status" aria-label="Loading gallery">
        <GallerySkeleton count={6} columns={columns} />
      </div>
    )
  }

  // Show empty state
  if (!processedPhotos || processedPhotos.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
          <svg
            className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No photos available
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            {store 
              ? `No photos have been uploaded for ${store.name} yet.`
              : 'No photos have been uploaded yet.'
            }
          </p>
        </div>
      </div>
    )
  }

  // Generate responsive grid styles
  const gridStyle = {
    display: 'grid',
    gap: '1rem',
    gridTemplateColumns: `repeat(${columns.mobile}, minmax(0, 1fr))`,
  }

  return (
    <>
      {/* Gallery Header */}
      {store && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {store.name} Photo Gallery
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {processedPhotos.length} photo{processedPhotos.length !== 1 ? 's' : ''}
            {store.description && (
              <span className="block mt-1 text-sm">{store.description}</span>
            )}
          </p>
        </div>
      )}

      {/* Gallery Grid */}
      <div
        className={`w-full ${className}`}
        style={gridStyle}
        role="grid"
        aria-label={store ? `Photo gallery for ${store.name}` : 'Photo gallery'}
      >
        <style jsx>{`
          @media (min-width: 768px) {
            div {
              grid-template-columns: repeat(${columns.tablet}, minmax(0, 1fr));
            }
          }
          @media (min-width: 1024px) {
            div {
              grid-template-columns: repeat(${columns.desktop}, minmax(0, 1fr));
            }
          }
        `}</style>

        {processedPhotos.map((photo, index) => (
          <div key={photo.id} role="gridcell">
            <PhotoItem
              photo={photo}
              index={index}
              onClick={handlePhotoClick}
              priority={index < 4} // Prioritize loading first 4 images
              lazyLoading={lazyLoading && index >= 4} // Lazy load images beyond first 4
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="animate-slide-up"
            />
          </div>
        ))}
      </div>

      {/* Gallery Stats */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {processedPhotos.length} photo{processedPhotos.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Lightbox Modal */}
      <Lightbox
        photos={processedPhotos}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={handleLightboxClose}
        onNext={handleLightboxNext}
        onPrevious={handleLightboxPrevious}
      />

      {/* Keyboard Instructions (for screen readers) */}
      <div className="sr-only">
        Use Tab to navigate between photos, Enter or Space to open lightbox view.
        In lightbox: use arrow keys to navigate, Escape to close.
      </div>
    </>
  )
}

export default PhotoGallery