'use client'

import { useState, useEffect, useCallback } from 'react'
import { Map, List, RefreshCw } from 'lucide-react'
import { MapView, StoreList } from './map'

interface Store {
  id: string
  name: string
  address?: string | null
  city?: string | null
  state?: string | null
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

type ViewMode = 'map' | 'list'

export default function MobileStoreLocator({ initialStores, onRefresh }: MobileStoreLocatorProps) {
  const [stores, setStores] = useState<Store[]>(initialStores)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('map')
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  // Request user location
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser')
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
        let errorMessage = 'Unable to get your location'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
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

  // Request location on mount
  useEffect(() => {
    requestLocation()
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

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
  }

  // Get responsive classes based on view mode
  const getContainerClasses = () => {
    if (viewMode === 'map') {
      return 'md:grid-cols-[1fr_400px] grid-rows-1'
    }
    return 'grid-rows-1'
  }

  const getMapClasses = () => {
    if (viewMode === 'list') return 'hidden'
    return 'row-span-1 relative'
  }

  const getListClasses = () => {
    if (viewMode === 'map') {
      return 'hidden md:block md:border-l md:border-border'
    }
    return 'row-span-1'
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border px-4 py-2 flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-semibold text-foreground">Arcade Finder</h1>
          {userLocation && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
              📍
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Refresh stores"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('map')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'map' 
                  ? 'bg-background text-primary shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Map view"
            >
              <Map className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-background text-primary shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Location Error Banner */}
      {locationError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm text-amber-800">{locationError}</span>
          </div>
          <button
            onClick={requestLocation}
            className="text-sm text-amber-600 hover:text-amber-800 font-medium"
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? 'Requesting...' : 'Retry'}
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 grid ${getContainerClasses()}`}>
        {/* Map View */}
        <div className={getMapClasses()}>
          <MapView
            stores={stores}
            selectedStore={selectedStore}
            onStoreSelect={handleStoreSelect}
            userLocation={userLocation}
            className="h-full"
          />
        </div>

        {/* List View - Sticky on desktop when in map mode */}
        <div className={getListClasses()}>
          <StoreList
            stores={stores}
            selectedStore={selectedStore}
            onStoreSelect={handleStoreSelect}
            userLocation={userLocation}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            className="h-full"
            compact={viewMode === 'map'}
          />
        </div>
      </div>
    </div>
  )
}