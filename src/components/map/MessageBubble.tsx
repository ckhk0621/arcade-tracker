'use client'

import { useEffect, useState } from 'react'
import { X, Clock, Star, Navigation, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface MessageBubbleProps {
  store: Store
  position: { x: number; y: number }
  isVisible: boolean
  onClose: () => void
  userLocation?: [number, number] | null
}

const calculateDistance = (
  point1: [number, number],
  point2: [number, number]
): number => {
  const [lat1, lon1] = point1
  const [lat2, lon2] = point2
  
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

const generateDummyData = (store: Store, userLocation?: [number, number] | null) => {
  // Calculate distance if user location is available
  let distance: string | null = null
  if (userLocation && store.location) {
    let storeCoords: [number, number] | null = null
    
    if (Array.isArray(store.location)) {
      storeCoords = [store.location[1], store.location[0]]
    } else if (store.location.coordinates) {
      storeCoords = [store.location.coordinates[1], store.location.coordinates[0]]
    }
    
    if (storeCoords) {
      const dist = calculateDistance(userLocation, storeCoords)
      distance = dist < 1 
        ? `${Math.round(dist * 1000)}米`  
        : `${dist.toFixed(1)}公里`
    }
  }

  return {
    name: store.name,
    operatingHours: '營業時間: 10:00 - 22:00',
    rating: store.analytics?.averageRating 
      ? `評分: ${store.analytics.averageRating.toFixed(1)}/5 ${Array.from({ length: Math.round(store.analytics.averageRating) }, () => '⭐').join('')}`
      : '評分: 4.5/5 ⭐⭐⭐⭐⭐',
    distance: distance || '距離: 1.2公里',
    description: '熱門的蹦床公園，適合全家大小一起玩樂'
  }
}

export default function MessageBubble({
  store,
  position,
  isVisible,
  onClose,
  userLocation
}: MessageBubbleProps) {
  const [show, setShow] = useState(false)
  const dummyData = generateDummyData(store, userLocation)

  useEffect(() => {
    if (isVisible) {
      // Enhanced smooth appearance with better timing
      const timer = setTimeout(() => setShow(true), 100)
      return () => clearTimeout(timer)
    } else {
      setShow(false)
    }
  }, [isVisible])

  useEffect(() => {
    if (isVisible) {
      // Auto-close after 7 seconds for better UX
      const timer = setTimeout(() => {
        onClose()
      }, 7000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  useEffect(() => {
    if (isVisible) {
      // Close on outside click
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (!target.closest('.message-bubble')) {
          onClose()
        }
      }

      // Small delay to avoid immediate closure
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 100)

      return () => {
        clearTimeout(timer)
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  // Calculate optimal position to avoid screen edges
  const adjustedPosition = {
    x: Math.min(Math.max(position.x, 20), typeof window !== 'undefined' ? window.innerWidth - 320 : position.x), // Bubble width ~300px + margin
    y: Math.max(position.y - 200, 20) // Position above the pin, with top margin
  }

  // Check if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640

  return (
    <div
      className={cn(
        "message-bubble fixed z-[1001] pointer-events-auto",
        "transition-all duration-500 ease-out",
        show 
          ? "opacity-100 scale-100 translate-y-0" 
          : "opacity-0 scale-90 translate-y-4"
      )}
      style={isMobile ? {
        left: '1rem',
        right: '1rem',
        top: `${Math.max(adjustedPosition.y, 20)}px`,
        width: 'calc(100vw - 2rem)'
      } : {
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }}
    >
      {/* Enhanced arrow pointing to pin - Hide on mobile */}
      {!isMobile && (
        <div className="relative">
          {/* Shadow for arrow */}
          <div 
            className="absolute w-0 h-0 border-l-[10px] border-r-[10px] border-t-[15px] border-l-transparent border-r-transparent border-t-black/10"
            style={{
              left: `${Math.min(Math.max(position.x - adjustedPosition.x, 20), 280)}px`,
              top: '100%',
              transform: 'translate(-50%, 1px)'
            }}
          />
          {/* Main arrow */}
          <div 
            className="absolute w-0 h-0 border-l-[9px] border-r-[9px] border-t-[14px] border-l-transparent border-r-transparent border-t-white"
            style={{
              left: `${Math.min(Math.max(position.x - adjustedPosition.x, 20), 280)}px`,
              top: '100%',
              transform: 'translate(-50%, 0)',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))'
            }}
          />
        </div>
      )}
      
      {/* Enhanced main bubble */}
      <div className={cn(
        "bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/60 p-5",
        "bg-gradient-to-br from-white/100 to-white/95",
        isMobile ? "w-full" : "max-w-[320px] min-w-[300px]"
      )}>
        {/* Enhanced header with close button */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-bold text-xl text-gray-900 leading-tight pr-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {dummyData.name}
          </h3>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-gray-100/80 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="關閉"
          >
            <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Enhanced content */}
        <div className="space-y-3">
          {/* Operating Hours */}
          <div className="flex items-center text-sm text-gray-700 bg-gray-50/80 rounded-lg p-2.5 transition-colors hover:bg-gray-100/80">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium">{dummyData.operatingHours}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center text-sm text-gray-700 bg-yellow-50/80 rounded-lg p-2.5 transition-colors hover:bg-yellow-100/80">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <Star className="w-4 h-4 text-yellow-600 fill-current" />
            </div>
            <span className="font-medium">{dummyData.rating}</span>
          </div>

          {/* Distance */}
          <div className="flex items-center text-sm text-gray-700 bg-green-50/80 rounded-lg p-2.5 transition-colors hover:bg-green-100/80">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <Navigation className="w-4 h-4 text-green-600" />
            </div>
            <span className="font-medium">{dummyData.distance}</span>
          </div>

          {/* Description */}
          <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-lg p-3 mt-4">
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              {dummyData.description}
            </p>
          </div>

          {/* Enhanced View Details Button */}
          <button
            onClick={() => {
              // Placeholder for view details functionality
              console.log('View details for store:', store.id)
              onClose()
            }}
            className="w-full mt-4 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 text-white text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>查看詳細</span>
            <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Enhanced overlay to capture outside clicks on mobile */}
      <div 
        className="fixed inset-0 z-[-1] md:hidden bg-black/10 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
    </div>
  )
}