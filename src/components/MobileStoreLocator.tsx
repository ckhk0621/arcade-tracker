'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapView, StoreList } from './map'
import { useClientStorage } from '@/hooks/useIsClient'

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

interface MobileStoreLocatorProps {
  initialStores: Store[]
  onRefresh?: () => Promise<Store[]>
}

export default function MobileStoreLocator({ initialStores, onRefresh }: MobileStoreLocatorProps) {
  const [stores, setStores] = useState<Store[]>(initialStores)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isStoreListCollapsed, setIsStoreListCollapsed] = useClientStorage('storeListCollapsed', false, 'session')

  // Request user location
  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('此瀏覽器不支援地理位置功能')
      return
    }

    setIsLoadingLocation(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude])
        setLocationError(null)
        setIsLoadingLocation(false)
      },
      (error) => {
        let errorMessage = '無法獲取您的位置'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '位置存取被拒絕'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置資訊不可用'
            break
          case error.TIMEOUT:
            errorMessage = '位置請求超時'
            break
        }
        setLocationError(errorMessage)
        setIsLoadingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }, [])

  // Request location on mount (only on client)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      requestLocation()
    }
  }, [requestLocation])

  // Handle store refresh
  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) return
    
    setIsRefreshing(true)
    try {
      const updatedStores = await onRefresh()
      setStores(updatedStores)
    } catch (error) {
      console.error('Failed to refresh stores:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [onRefresh, isRefreshing])

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store)
  }

  const toggleStoreListCollapse = () => {
    const newCollapsed = !isStoreListCollapsed
    setIsStoreListCollapsed(newCollapsed)
    
    // Trigger map resize after animation completes to ensure proper rendering
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('resize'))
      }
    }, 350) // Slightly after the 300ms transition
  }

  return (
    <div className="h-screen bg-background flex relative overflow-hidden">
      {/* Ensure full background coverage during transitions */}
      <div className="absolute inset-0 bg-background -z-10" />
      {/* Location Error Banner - Fixed position */}
      {locationError && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            <span className="text-sm text-amber-800">{locationError}</span>
          </div>
          <button
            onClick={requestLocation}
            className="text-sm text-amber-600 hover:text-amber-800 font-medium"
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? '請求中...' : '重試'}
          </button>
        </div>
      )}

      {/* Left Column - Fixed Map */}
      <div className="flex-1 relative map-container">
        <MapView
          stores={stores}
          selectedStore={selectedStore}
          onStoreSelect={handleStoreSelect}
          userLocation={userLocation}
          className="h-full"
          isStoreListCollapsed={isStoreListCollapsed}
          onToggleStoreList={toggleStoreListCollapse}
        />
      </div>


      {/* Right Column - Scrollable Store List - Responsive width with collapse animation */}
      <div 
        className={`store-list-container ${
          isStoreListCollapsed 
            ? 'w-0 opacity-0 pointer-events-none overflow-hidden store-list-collapsed' 
            : 'w-80 lg:w-80 md:w-72 sm:w-60 xs:w-56 opacity-100'
        }`}
      >
        <div className={`h-full store-list-inner ${
          isStoreListCollapsed 
            ? 'opacity-0 scale-95 store-list-collapsed' 
            : 'opacity-100 scale-100 border-l border-border/50 bg-background shadow-lg store-list-backdrop'
        }`}>
          <StoreList
            stores={stores}
            selectedStore={selectedStore}
            onStoreSelect={handleStoreSelect}
            userLocation={userLocation}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            className="h-full"
            compact={true}
          />
        </div>
      </div>
    </div>
  )
}