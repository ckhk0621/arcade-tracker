'use client'

import React from 'react'
import { SkeletonLoaderProps } from '../gallery/types'

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 6,
  className = '',
  columns = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
}) => {
  const skeletonItems = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className="group relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse-soft"
      style={{ aspectRatio: '4/3' }}
    >
      {/* Image skeleton */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
      
      {/* Loading shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Caption skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
        <div className="h-4 bg-white/30 rounded animate-pulse mb-1" />
        <div className="h-3 bg-white/20 rounded w-3/4 animate-pulse" />
      </div>
    </div>
  ))

  return (
    <div
      className={`grid gap-4 w-full ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns.mobile}, minmax(0, 1fr))`,
      }}
      role="status"
      aria-label="Loading gallery images"
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
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
      {skeletonItems}
      <span className="sr-only">Loading gallery images...</span>
    </div>
  )
}

export default SkeletonLoader