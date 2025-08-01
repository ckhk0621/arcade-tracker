'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { PhotoItemProps } from './types'

const PhotoItem: React.FC<PhotoItemProps> = ({
  photo,
  index,
  onClick,
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
  className = '',
  lazyLoading = true,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleClick = () => {
    if (onClick) {
      onClick(photo, index)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  const imageUrl = typeof photo.image === 'string' ? photo.image : photo.image.url
  const imageAlt = photo.alt || (typeof photo.image === 'object' ? photo.image.alt : `Photo ${index + 1}`)
  const imageWidth = typeof photo.image === 'object' ? photo.image.width : 800
  const imageHeight = typeof photo.image === 'object' ? photo.image.height : 600

  if (!imageUrl || imageError) {
    return (
      <div
        className={`group relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        style={{ aspectRatio: '4/3' }}
        role="img"
        aria-label="Failed to load image"
      >
        <div className="text-gray-400 dark:text-gray-500 text-center p-4">
          <svg
            className="w-12 h-12 mx-auto mb-2"
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
          <p className="text-sm">Failed to load image</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${className}`}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-label={`View ${imageAlt} in lightbox`}
      style={{ aspectRatio: '4/3' }}
    >
      {/* Loading skeleton while image loads */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      )}

      {/* Main image */}
      <Image
        src={imageUrl}
        alt={imageAlt}
        width={imageWidth || 800}
        height={imageHeight || 600}
        priority={priority}
        loading={lazyLoading && !priority ? 'lazy' : 'eager'}
        sizes={sizes}
        className={`object-cover w-full h-full transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        quality={85}
        placeholder="empty"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
          <svg
            className="w-6 h-6 text-gray-800 dark:text-gray-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
        </div>
      </div>

      {/* Caption/description overlay */}
      {(photo.caption || imageAlt) && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white text-sm font-medium leading-relaxed">
            {photo.caption || imageAlt}
          </p>
        </div>
      )}

      {/* Focus indicator for keyboard navigation */}
      <div className="absolute inset-0 ring-2 ring-transparent group-focus:ring-primary transition-all duration-200" />
    </div>
  )
}

export default PhotoItem