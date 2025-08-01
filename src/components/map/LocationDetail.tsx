'use client'

import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import VerticalImageList from "@/components/ui/VerticalImageList"

interface Store {
  id: string
  name: string
  address?: string | null
  city?: string | null
  state?: string | null
  region?: 'hong-kong-island' | 'kowloon' | 'new-territories' | null
  location?: {
    coordinates: [number, number]
  } | [number, number] | null
  category?: string | null
  status: string
  analytics?: {
    averageRating?: number | null
    totalRatings?: number | null
    views?: number | null
    photoCount?: number | null
    checkIns?: number | null
    machineCount?: number | null
  }
  images?: Array<{
    image: {
      url?: string
    }
    caption?: string
    isPrimary?: boolean
  }>
  openingHours?: {
    monday?: string
    tuesday?: string
    wednesday?: string
    thursday?: string
    friday?: string
    saturday?: string
    sunday?: string
  }
  contact?: {
    phone?: string
  }
  pricing?: {
    priceRange?: 'budget' | 'moderate' | 'premium'
  }
}

interface LocationDetailProps {
  store: Store | null
  userLocation?: [number, number] | null
  isVisible: boolean
  onClose: () => void
}



const formatAddress = (store: Store) => {
  const parts = [store.address, store.city, store.state].filter(Boolean)
  return parts.join(', ')
}

export default function LocationDetail({ store, userLocation, isVisible, onClose }: LocationDetailProps) {

  if (!store) return null

  const rating = store.analytics?.averageRating || 4.5
  const totalRatings = store.analytics?.totalRatings || 0

  return (
    <div 
      className={`h-full w-full bg-background border-l border-border shadow-lg transition-all duration-300 ease-out overflow-hidden ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-foreground">{store.name} 店舖詳情</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 flex flex-col flex-1">
            {/* Store Info */}
            <div className="space-y-3 flex-shrink-0">
              {/* Address */}
              {formatAddress(store) && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  地址: {formatAddress(store)}
                </p>
              )}
              
              {/* Operating Hours */}
              <p className="text-sm text-foreground">
                營業時間: 10:00 - 22:00
              </p>
              
              {/* Rating */}
              <p className="text-sm text-foreground">
                評分: {rating.toFixed(1)}/5 ⭐⭐⭐⭐⭐
              </p>
            </div>

            {/* Vertical Image List - takes remaining space */}
            <VerticalImageList 
              images={store.images?.map(img => ({
                url: img.image.url || '',
                caption: img.caption,
                isPrimary: img.isPrimary
              })) || []}
              className="mt-4"
            />

          </div>
        </div>
      </div>
    </div>
  )
}