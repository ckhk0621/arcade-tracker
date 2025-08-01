'use client'

import { useState, useEffect, useCallback } from 'react'
import { Map, List, X, Menu, RefreshCw } from 'lucide-react'
import { MapView, StoreList } from './map'

interface Store {
  id: string
  name: string
  address?: string
  city?: string
  state?: string
  location?: {
    coordinates: [number, number]
  }
  category?: string
  status: string
  analytics?: {
    averageRating?: number
    totalRatings?: number
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

type ViewMode = 'map' | 'list' | 'split'

export default function MobileStoreLocator({ initialStores, onRefresh }: MobileStoreLocatorProps) {
  const [stores, setStores] = useState<Store[]>(initialStores)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [showBottomSheet, setShowBottomSheet] = useState(false)
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
    if (viewMode === 'list') {
      setViewMode('split')
      setShowBottomSheet(true)
    }
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    if (mode === 'list') {
      setShowBottomSheet(true)
    } else if (mode === 'map') {
      setShowBottomSheet(false)
    }
  }

  // Get responsive classes based on view mode
  const getContainerClasses = () => {
    switch (viewMode) {
      case 'map':
        return 'grid-rows-1'
      case 'list':
        return 'grid-rows-1'
      case 'split':
        return 'grid-rows-2 md:grid-rows-1 md:grid-cols-2'
      default:
        return 'grid-rows-2'
    }
  }

  const getMapClasses = () => {
    if (viewMode === 'list') return 'hidden'
    return 'row-span-1'
  }

  const getListClasses = () => {
    if (viewMode === 'map') return 'hidden'
    return 'row-span-1'
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold text-gray-900">Arcade Finder</h1>
          {userLocation && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Location Active
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
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('map')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'map' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Map view"
            >
              <Map className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('split')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'split' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Split view"
            >
              <Menu className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
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

        {/* List View */}
        <div className={getListClasses()}>
          <StoreList
            stores={stores}
            selectedStore={selectedStore}
            onStoreSelect={handleStoreSelect}
            userLocation={userLocation}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            className="h-full"
          />
        </div>
      </div>

      {/* Mobile Bottom Sheet for Split View */}
      {viewMode === 'split' && (
        <div className="md:hidden">
          {/* Bottom Sheet Overlay */}
          {showBottomSheet && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-25 z-30"
              onClick={() => setShowBottomSheet(false)}
            />
          )}

          {/* Bottom Sheet */}
          <div 
            className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-40 transform transition-transform duration-300 ${
              showBottomSheet ? 'translate-y-0' : 'translate-y-full'
            }`}
            style={{ height: '60vh' }}
          >
            {/* Handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {stores.filter(s => s.status === 'active').length} Locations
              </h2>
              <button
                onClick={() => setShowBottomSheet(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-hidden">
              <StoreList
                stores={stores}
                selectedStore={selectedStore}
                onStoreSelect={handleStoreSelect}
                userLocation={userLocation}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                className="h-full"
              />
            </div>
          </div>

          {/* Bottom Sheet Trigger */}
          {!showBottomSheet && (
            <button
              onClick={() => setShowBottomSheet(true)}
              className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-full px-6 py-3 flex items-center space-x-2 z-30 border border-gray-200"
            >
              <List className="w-4 h-4" />
              <span className="font-medium">View List</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}