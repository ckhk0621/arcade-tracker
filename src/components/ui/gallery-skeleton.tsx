'use client'

import React from 'react'
import { Skeleton } from "./skeleton"
import { cn } from "@/lib/utils"

interface GallerySkeletonProps {
  count?: number
  className?: string
  columns?: {
    mobile: number
    tablet: number
    desktop: number
  }
}

const GallerySkeleton: React.FC<GallerySkeletonProps> = ({
  count = 6,
  className = '',
  columns = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
}) => {
  const skeletonItems = Array.from({ length: count }, (_, index) => (
    <div key={index} className="space-y-3">
      {/* Image skeleton */}
      <Skeleton 
        className="w-full aspect-[4/3] rounded-lg" 
      />
      
      {/* Caption skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  ))

  return (
    <div
      className={cn(
        "grid gap-4 w-full",
        `grid-cols-${columns.mobile}`,
        `md:grid-cols-${columns.tablet}`,
        `lg:grid-cols-${columns.desktop}`,
        className
      )}
      role="status"
      aria-label="Loading gallery images"
    >
      {skeletonItems}
      <span className="sr-only">Loading gallery images...</span>
    </div>
  )
}

export default GallerySkeleton