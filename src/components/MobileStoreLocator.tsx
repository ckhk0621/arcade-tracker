'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapView, StoreList, LocationDetail } from './map'
import MobileStoreList from './map/MobileStoreList'
import MobileLocationDetail from './map/MobileLocationDetail'
import { MobileBottomSheet, BottomSheetState } from './ui/mobile-bottom-sheet'
import { useClientStorage, useResponsive, useIsClient } from '@/hooks/useIsClient'

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
  const [_lastSelectedFromList, setLastSelectedFromList] = useState<string | null>(null)
  const [showLocationDetail, setShowLocationDetail] = useState(false)
  
  // Mobile-specific state
  const { isMobile, isTablet, isDesktop } = useResponsive()
  const isClient = useIsClient()
  const [mobileSheetState, setMobileSheetState] = useState<BottomSheetState>('collapsed')
  const [showMobileDetail, setShowMobileDetail] = useState(false)

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

  const handleStoreSelect = (store: Store, fromList: boolean = false) => {
    setSelectedStore(store)
    
    if (store) {
      if (isClient && isMobile) {
        // Mobile behavior - show detail in bottom sheet
        setShowMobileDetail(true)
        setMobileSheetState('full')
      } else {
        // Desktop behavior - show location detail panel when a store is selected AND store list is visible
        setShowLocationDetail(!isStoreListCollapsed)
        
        // Trigger map resize after the panel animation completes
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('resize'))
          }
        }, 350) // After 300ms transition completes
        
        if (fromList) {
          // When selected from list, center and show detail panel
          setLastSelectedFromList(store.id)
          
          // Auto-collapse store list on tablet for better map visibility
          if (typeof window !== 'undefined' && window.innerWidth <= 1024 && window.innerWidth > 640) {
            setTimeout(() => {
              setIsStoreListCollapsed(true)
              // Also hide the detail panel when auto-collapsing on tablet
              setShowLocationDetail(false)
            }, 800) // After centering animation
          }
        } else {
          // When selected from map
          setLastSelectedFromList(null)
        }
      }
    } else {
      // Hide location detail panel when no store is selected
      setShowLocationDetail(false)
      setShowMobileDetail(false)
    }
  }


  const toggleStoreListCollapse = () => {
    if (isClient && isMobile) {
      // Mobile behavior - toggle bottom sheet
      if (mobileSheetState === 'collapsed') {
        setMobileSheetState('peek')
      } else {
        setMobileSheetState('collapsed')
        setShowMobileDetail(false)
        setSelectedStore(null)
      }
      return
    }
    
    // Desktop behavior
    const newCollapsed = !isStoreListCollapsed
    setIsStoreListCollapsed(newCollapsed)
    
    // When collapsing the store list, also clear the selected store and hide the detail panel
    if (newCollapsed) {
      setSelectedStore(null)
      setShowLocationDetail(false)
      setLastSelectedFromList(null)
    } else {
      // When expanding the store list, keep detail panel hidden until a new location is selected
      setShowLocationDetail(false)
    }
    
    // Trigger map resize after animation completes to ensure proper rendering
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('resize'))
      }
    }, 350) // Slightly after the 300ms transition
  }

  const handleCloseLocationDetail = () => {
    setShowLocationDetail(false)
    setSelectedStore(null)
    
    // Trigger map resize after the panel animation completes
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('resize'))
      }
    }, 350) // After 300ms transition completes
  }

  // Mobile-specific handlers
  const handleMobileSheetStateChange = (state: BottomSheetState) => {
    setMobileSheetState(state)
    if (state === 'collapsed') {
      setShowMobileDetail(false)
      setSelectedStore(null)
    }
  }

  const handleBackToMobileList = () => {
    setShowMobileDetail(false)
    setMobileSheetState('half')
  }

  // Initialize mobile sheet on first load
  useEffect(() => {
    if (isClient && isMobile && stores.length > 0) {
      // Start with peek mode to show some stores
      setMobileSheetState('peek')
    }
  }, [isClient, isMobile, stores.length])

  // Don't render until we know if we're on mobile
  if (!isClient) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-screen bg-background relative overflow-hidden">
        {/* Location Error Banner - Fixed position */}
        {locationError && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between shadow-sm">
            <div className="flex items-center">
              <span className="text-sm text-amber-800">{locationError}</span>
            </div>
            <button
              onClick={requestLocation}
              className="text-sm text-amber-600 hover:text-amber-800 font-medium min-h-[44px] px-4"
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? '請求中...' : '重試'}
            </button>
          </div>
        )}

        {/* Full Screen Map */}
        <div className="h-full w-full">
          <MapView
            stores={stores}
            selectedStore={selectedStore}
            onStoreSelect={(store) => handleStoreSelect(store, false)}
            userLocation={userLocation}
            className="h-full"
            isStoreListCollapsed={true}
            onToggleStoreList={toggleStoreListCollapse}
          />
        </div>

        {/* Mobile Bottom Sheet */}
        <MobileBottomSheet
          state={mobileSheetState}
          onStateChange={handleMobileSheetStateChange}
          snapPoints={{
            peek: 200,
            half: 50,
            full: 90
          }}
        >
          {showMobileDetail ? (
            <MobileLocationDetail
              store={selectedStore}
              userLocation={userLocation}
              onClose={() => {
                setShowMobileDetail(false)
                setMobileSheetState('collapsed')
                setSelectedStore(null)
              }}
              onBackToList={handleBackToMobileList}
            />
          ) : (
            <MobileStoreList
              stores={stores}
              selectedStore={selectedStore}
              onStoreSelect={(store) => handleStoreSelect(store, true)}
              userLocation={userLocation}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              sheetState={mobileSheetState}
            />
          )}
        </MobileBottomSheet>
      </div>
    )
  }

  // Desktop Layout (existing)
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

      {/* Left Column - Map with dynamic width based on panel visibility */}
      <div className="relative map-container transition-all duration-300 flex-1">
        <MapView
          stores={stores}
          selectedStore={selectedStore}
          onStoreSelect={(store) => handleStoreSelect(store, false)}
          userLocation={userLocation}
          className="h-full"
          isStoreListCollapsed={isStoreListCollapsed}
          onToggleStoreList={toggleStoreListCollapse}
        />
      </div>

      {/* Middle Column - Location Detail Panel (slides in from right) */}
      <div 
        className={`location-detail-container transition-all duration-300 ease-out overflow-hidden ${
          showLocationDetail && !isStoreListCollapsed
            ? 'w-96 opacity-100' 
            : 'w-0 opacity-0'
        }`}
      >
        {showLocationDetail && !isStoreListCollapsed && (
          <LocationDetail
            store={selectedStore}
            userLocation={userLocation}
            isVisible={showLocationDetail && !isStoreListCollapsed}
            onClose={handleCloseLocationDetail}
          />
        )}
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
            onStoreSelect={(store) => handleStoreSelect(store, true)}
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