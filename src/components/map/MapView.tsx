'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Navigation, ChevronLeft, ChevronRight } from 'lucide-react'
import { isLeafletReady } from '@/utils/client'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React Leaflet - only run on client side
if (isLeafletReady()) {
  try {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })
  } catch (error) {
    console.warn('Failed to configure Leaflet default markers:', error)
  }
}

interface Store {
  id: string
  name: string
  address?: string | null
  city?: string | null
  state?: string | null
  region?: 'hong-kong-island' | 'kowloon' | 'new-territories' | null
  location?:
    | {
        coordinates: [number, number]
      }
    | [number, number]
    | null
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

interface MapViewProps {
  stores: Store[]
  selectedStore?: Store | null
  onStoreSelect: (store: Store) => void
  userLocation?: [number, number] | null
  className?: string
  isStoreListCollapsed?: boolean
  onToggleStoreList?: () => void
  isDisabled?: boolean
}

// Enhanced custom pin icon with improved visual design and animations
const createCustomPinIcon = (
  region?: string | null,
  category: string = 'arcade',
  isSelected: boolean = false,
  isVisible: boolean = true,
  isPreviousSelected: boolean = false,
) => {
  // Ensure we're on the client side and Leaflet is available
  if (!isLeafletReady()) {
    return null
  }
  const getRegionColor = (reg?: string | null) => {
    switch (reg) {
      case 'hong-kong-island':
        return '#E11D48' // Rose-600 for Hong Kong Island
      case 'kowloon':
        return '#3B82F6' // Blue-500 for Kowloon
      case 'new-territories':
        return '#10B981' // Emerald-500 for New Territories
      default:
        return '#6B7280' // Gray-500 for unknown regions
    }
  }

  const getCategoryAccent = (cat: string) => {
    switch (cat) {
      case 'arcade':
        return 'rgba(255,255,255,0.95)'
      case 'restaurant':
        return 'rgba(251,191,36,0.95)' // Amber
      case 'entertainment':
        return 'rgba(168,85,247,0.95)' // Purple
      case 'bowling':
        return 'rgba(34,197,94,0.95)' // Green
      case 'bar':
        return 'rgba(239,68,68,0.95)' // Red
      default:
        return 'rgba(255,255,255,0.95)'
    }
  }

  const pinSize = isSelected ? 32 : 26
  const pinHeight = isSelected ? 40 : 34
  const shadowSize = isSelected ? 20 : 16
  const dotSize = isSelected ? 10 : 8

  return L.divIcon({
    html: `
      <div class="pin-container ${isSelected ? 'selected-pin' : ''} ${isPreviousSelected ? 'pin-previous-selected' : isVisible ? 'pin-visible' : 'pin-hidden'}" style="
        position: relative;
        width: ${pinSize + 8}px;
        height: ${pinHeight + 4}px;
        transform: translate(-50%, -100%);
        z-index: ${isSelected ? '1000' : '100'};
        opacity: ${isVisible ? '1' : '0'};
        transition: opacity ${isVisible ? '0.4s ease-in' : '0.3s ease-out'};
        pointer-events: ${isVisible ? 'auto' : 'none'};
      ">
        <!-- Enhanced pin shadow with gradient -->
        <div class="pin-shadow" style="
          position: absolute;
          bottom: 0px;
          left: 50%;
          transform: translateX(-50%);
          width: ${shadowSize}px;
          height: ${isSelected ? '12px' : '10px'};
          background: radial-gradient(ellipse, rgba(0,0,0,${isSelected ? '0.4' : '0.3'}) 0%, rgba(0,0,0,0.1) 70%, transparent 100%);
          border-radius: 50%;
          filter: blur(${isSelected ? '3px' : '2px'});
          transition: all 0.3s ease-out;
        "></div>
        
        <!-- Outer glow for selected pin -->
        ${
          isSelected
            ? `
        <div style="
          position: absolute;
          top: 4px;
          left: 50%;
          transform: translateX(-50%) rotate(-45deg);
          width: ${pinSize + 4}px;
          height: ${pinHeight - 8}px;
          background: ${getRegionColor(region)};
          border-radius: 50% 50% 50% 0;
          opacity: 0.3;
          filter: blur(4px);
          animation: pinGlow 2s ease-in-out infinite alternate;
        "></div>
        `
            : ''
        }
        
        <!-- Main pin with enhanced styling -->
        <div class="pin-main" style="
          position: absolute;
          top: 4px;
          left: 50%;
          transform: translateX(-50%) rotate(-45deg);
          width: ${pinSize}px;
          height: ${pinHeight - 8}px;
          background: linear-gradient(135deg, ${getRegionColor(region)} 0%, ${getRegionColor(region)}dd 100%);
          border: ${isSelected ? '4px' : '3px'} solid white;
          border-radius: 50% 50% 50% 0;
          box-shadow: 
            0 ${isSelected ? '8px' : '6px'} ${isSelected ? '24px' : '16px'} rgba(0,0,0,${isSelected ? '0.35' : '0.25'}),
            0 ${isSelected ? '4px' : '2px'} ${isSelected ? '12px' : '8px'} rgba(0,0,0,0.15),
            inset 0 1px 2px rgba(255,255,255,0.2);
          transition: all 0.3s ease-out;
          ${isSelected ? 'filter: brightness(1.1) saturate(1.1);' : ''}
        ">
          <!-- Enhanced pin center dot with ring -->
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            width: ${dotSize + 4}px;
            height: ${dotSize + 4}px;
            background: ${getCategoryAccent(category)};
            border: 2px solid rgba(255,255,255,0.8);
            border-radius: 50%;
            box-shadow: 
              inset 0 1px 3px rgba(0,0,0,0.2),
              0 0 0 1px rgba(0,0,0,0.1);
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: ${dotSize}px;
              height: ${dotSize}px;
              background: ${getCategoryAccent(category)};
              border-radius: 50%;
              opacity: 0.9;
            "></div>
          </div>
        </div>
      </div>
    `,
    className: `custom-pin-icon ${isSelected ? 'selected-pin' : ''}`,
    iconSize: [pinSize + 8, pinHeight + 4],
    iconAnchor: [(pinSize + 8) / 2, pinHeight + 4],
    popupAnchor: [0, -(pinHeight + 4)],
  })
}

// User location icon - only create on client side
const getUserLocationIcon = () => {
  if (!isLeafletReady()) {
    return null
  }

  return L.divIcon({
    html: `
      <div style="
        background-color: #3B82F6;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      </style>
    `,
    className: 'user-location-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

// Distance calculation function
const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
  const [lat1, lon1] = point1
  const [lat2, lon2] = point2

  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Component to handle map centering with callback support
function MapController({
  center,
  selectedStore,
  onCenteringComplete,
}: {
  center?: [number, number]
  selectedStore?: Store | null
  onCenteringComplete?: () => void
}) {
  const map = useMap()

  useEffect(() => {
    if (selectedStore?.location) {
      let coords: [number, number] | null = null

      if (Array.isArray(selectedStore.location)) {
        coords = [selectedStore.location[1], selectedStore.location[0]] // [lat, lng]
      } else if (selectedStore.location.coordinates) {
        coords = [selectedStore.location.coordinates[1], selectedStore.location.coordinates[0]] // [lat, lng]
      }

      if (coords) {
        // Use setView first to ensure immediate positioning, then flyTo for smooth animation
        map.setView(coords, 16)
        setTimeout(() => {
          map.flyTo(coords, 16, {
            animate: true,
            duration: 1.0, // Slightly shorter for snappier response
            easeLinearity: 0.5, // Smoother easing
          })
        }, 50) // Small delay to ensure proper positioning

        // Call completion callback after animation completes
        if (onCenteringComplete) {
          setTimeout(() => {
            onCenteringComplete()
          }, 1150) // Adjusted timing for new animation duration
        }
      }
    } else if (center) {
      map.setView(center, map.getZoom())
    }
  }, [map, center, selectedStore, onCenteringComplete])

  return null
}

export default function MapView({
  stores,
  selectedStore,
  onStoreSelect,
  userLocation,
  className,
  isStoreListCollapsed,
  onToggleStoreList,
  isDisabled = false,
}: MapViewProps) {
  const [mapReady, setMapReady] = useState(false)
  const [legendExpanded, setLegendExpanded] = useState(false)
  const [isCentering, setIsCentering] = useState(false)
  const [pinsVisible, setPinsVisible] = useState(true)
  const [previousSelectedStoreId, setPreviousSelectedStoreId] = useState<string | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({})

  // Default center (Hong Kong - Central area between all regions)
  const defaultCenter: [number, number] = [22.3193, 114.1694]
  const mapCenter = userLocation || defaultCenter

  // Ensure pins are visible on initial load
  useEffect(() => {
    if (mapReady && !selectedStore) {
      setPinsVisible(true)
    }
  }, [mapReady, selectedStore])

  // Handle map resize when store list collapses/expands
  useEffect(() => {
    if (mapRef.current) {
      // Use a slight delay to ensure the DOM has updated
      const timer = setTimeout(() => {
        mapRef.current?.invalidateSize()
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [isStoreListCollapsed])

  // Disable/enable map dragging based on isDisabled prop
  useEffect(() => {
    if (mapRef.current && mapReady) {
      const map = mapRef.current
      if (isDisabled) {
        // Disable all map interactions
        map.dragging.disable()
        map.touchZoom.disable()
        map.doubleClickZoom.disable()
        map.scrollWheelZoom.disable()
        map.boxZoom.disable()
        map.keyboard.disable()
        if ('tap' in map && (map as any).tap) (map as any).tap.disable()
      } else {
        // Re-enable all map interactions
        map.dragging.enable()
        map.touchZoom.enable()
        map.doubleClickZoom.enable()
        map.scrollWheelZoom.enable()
        map.boxZoom.enable()
        map.keyboard.enable()
        if ('tap' in map && (map as any).tap) (map as any).tap.enable()
      }
    }
  }, [isDisabled, mapReady])

  // Handle centering completion
  const handleCenteringComplete = useCallback(() => {
    setIsCentering(false)
    // Clear previous selection to prevent visual artifacts
    setPreviousSelectedStoreId(null)
    // Show pins again after centering completes with a smooth fade-in
    setTimeout(() => {
      setPinsVisible(true)
    }, 100) // Small delay before showing pins for smoother transition
  }, [])

  // Reset pin states when selected store changes
  useEffect(() => {
    if (selectedStore) {
      // Store previous selected store ID for proper pin management
      setPreviousSelectedStoreId(selectedStore.id)
      setIsCentering(true)
      // Hide ALL pins except the target pin during centering animation
      setPinsVisible(false)
    } else {
      // Clear previous selection when no store is selected
      setPreviousSelectedStoreId(null)
      // Ensure all pins are visible when no store is selected
      if (!isCentering) {
        setPinsVisible(true)
      }
    }
  }, [selectedStore])

  const handleStoreClick = (store: Store) => {
    // Handle deselection if clicking the same store
    if (selectedStore && selectedStore.id === store.id) {
      setPreviousSelectedStoreId(selectedStore.id)
      onStoreSelect(null as any) // Clear selection
      return
    }

    // Clear previous selection immediately when a new store is clicked
    if (selectedStore && selectedStore.id !== store.id) {
      setPreviousSelectedStoreId(selectedStore.id)
    }
    onStoreSelect(store)
  }

  const formatAddress = (store: Store) => {
    const parts = [store.address, store.city, store.state].filter(Boolean)
    return parts.join(', ')
  }

  const getCategoryLabel = (category?: string) => {
    const labels: Record<string, string> = {
      arcade: '冒險樂園',
      restaurant: '餐廳',
      entertainment: '娛樂中心',
      bowling: '保齡球館',
      family: '詳細',
      bar: '酒廊/遊戲酒吧',
      mall: '商場遊戲區',
    }
    return labels[category || 'arcade'] || '冒險樂園'
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ))
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Enhanced custom styles for pin interactions, animations, and popup styling */}
      <style jsx>{`
        :global(.custom-pin-icon) {
          transition: all 0.3s ease-out;
        }

        /* Pin visibility animation for centering */
        :global(.pin-hidden) {
          opacity: 0 !important;
          transition: opacity 0.2s ease-out !important;
          pointer-events: none !important;
          visibility: hidden !important;
        }

        :global(.pin-visible) {
          opacity: 1 !important;
          transition: opacity 0.4s ease-in 0.1s !important; /* Small delay for smoother appearance */
          pointer-events: auto !important;
          visibility: visible !important;
        }

        /* Ensure immediate hiding of previous selected pins */
        :global(.pin-previous-selected) {
          opacity: 0 !important;
          transition: opacity 0.1s ease-out !important;
          pointer-events: none !important;
          visibility: hidden !important;
        }

        /* Ensure pin transitions work well with existing animations */
        :global(.pin-container) {
          transition: opacity 0.3s ease-out;
        }

        :global(.custom-pin-icon:hover .pin-main) {
          transform: translateX(-50%) rotate(-45deg) scale(1.15) !important;
          box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.4) !important,
            0 4px 12px rgba(0, 0, 0, 0.2) !important;
          filter: brightness(1.2) saturate(1.2) !important;
        }

        :global(.custom-pin-icon:hover .pin-shadow) {
          width: 24px !important;
          height: 12px !important;
          filter: blur(3px) !important;
        }

        :global(.custom-pin-icon:hover) {
          z-index: 1000 !important;
        }

        :global(.leaflet-marker-icon.custom-pin-icon) {
          background: transparent !important;
          border: none !important;
        }

        /* Responsive pin scaling */
        @media (max-width: 768px) {
          :global(.custom-pin-icon .pin-container) {
            transform: translateX(-50%) scale(0.9);
          }
        }

        /* Enhanced pin pulse animation for selected store */
        :global(.selected-pin .pin-main) {
          animation: pinPulse 2.5s ease-in-out infinite;
        }

        @keyframes pinPulse {
          0% {
            transform: translateX(-50%) rotate(-45deg) scale(1);
            filter: brightness(1.1) saturate(1.1);
          }
          50% {
            transform: translateX(-50%) rotate(-45deg) scale(1.08);
            filter: brightness(1.2) saturate(1.2);
          }
          100% {
            transform: translateX(-50%) rotate(-45deg) scale(1);
            filter: brightness(1.1) saturate(1.1);
          }
        }

        /* Pin glow animation */
        @keyframes pinGlow {
          0% {
            opacity: 0.2;
            transform: translateX(-50%) rotate(-45deg) scale(1);
          }
          100% {
            opacity: 0.4;
            transform: translateX(-50%) rotate(-45deg) scale(1.05);
          }
        }

        /* Smooth transitions for pin interactions */
        :global(.pin-main),
        :global(.pin-shadow) {
          transition: all 0.3s ease-out;
        }

        /* Enhanced hover effects */
        :global(.custom-pin-icon:active .pin-main) {
          transform: translateX(-50%) rotate(-45deg) scale(0.95) !important;
        }
      `}</style>

      <MapContainer
        center={mapCenter}
        zoom={userLocation ? 15 : 12}
        className="w-full h-full"
        ref={(map) => {
          if (map) {
            mapRef.current = map
          }
        }}
        whenReady={() => setMapReady(true)}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        <MapController
          center={mapCenter}
          selectedStore={selectedStore}
          onCenteringComplete={handleCenteringComplete}
        />

        {/* User location marker */}
        {userLocation && getUserLocationIcon() && (
          <Marker position={userLocation} icon={getUserLocationIcon()!}></Marker>
        )}

        {/* Store markers */}
        {stores
          .filter((store) => store.location && store.status === 'active')
          .map((store) => {
            let coords: [number, number] | null = null

            if (Array.isArray(store.location)) {
              coords = [store.location[1], store.location[0]] // [lat, lng]
            } else if (store.location?.coordinates) {
              coords = [store.location.coordinates[1], store.location.coordinates[0]] // [lat, lng]
            }

            if (!coords) return null

            const [lat, lng] = coords
            const isSelected = selectedStore?.id === store.id
            // Check if this pin was previously selected
            const isPreviousSelected =
              isCentering && previousSelectedStoreId === store.id && !isSelected
            // Only show the target pin during centering, hide all others
            const pinVisible = isCentering ? isSelected : pinsVisible
            const customIcon = createCustomPinIcon(
              store.region,
              store.category || 'arcade',
              isSelected,
              pinVisible,
              isPreviousSelected,
            )

            // Skip marker if icon creation failed (e.g., on server side)
            if (!customIcon) return null

            return (
              <Marker
                key={store.id}
                position={[lat, lng]}
                icon={customIcon}
                ref={(el) => {
                  if (el) {
                    markerRefs.current[store.id] = el
                  }
                }}
                eventHandlers={{
                  click: () => handleStoreClick(store),
                }}
              ></Marker>
            )
          })}
      </MapContainer>

      {/* Custom zoom controls and collapse button - horizontal on mobile (top), vertical on desktop (top-right) */}
      <div className="absolute md:top-4 md:right-4 top-4 left-1/2 md:left-auto md:transform-none transform -translate-x-1/2 z-[1000] flex md:flex-col flex-row md:space-y-2 space-x-2 md:space-x-0">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="min-w-[48px] min-h-[48px] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 active:bg-gray-100 border border-gray-200/50 transition-all duration-200 hover:shadow-xl active:scale-95 touch-none"
          aria-label="放大地圖"
        >
          <span className="text-xl font-bold select-none">+</span>
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="min-w-[48px] min-h-[48px] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 active:bg-gray-100 border border-gray-200/50 transition-all duration-200 hover:shadow-xl active:scale-95 touch-none"
          aria-label="縮小地圖"
        >
          <span className="text-xl font-bold select-none">−</span>
        </button>

        {/* Collapse/Expand Button - Positioned under zoom controls */}
        {onToggleStoreList && (
          <button
            onClick={onToggleStoreList}
            className="min-w-[48px] min-h-[48px] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 active:bg-gray-100 border border-gray-200/50 transition-all duration-200 hover:shadow-xl active:scale-95 touch-none"
            title={isStoreListCollapsed ? '展開店舖列表' : '收起店舖列表'}
            aria-label={isStoreListCollapsed ? '展開店舖列表' : '收起店舖列表'}
          >
            {isStoreListCollapsed ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        )}

        {/* Center on location button - Positioned under toggle button */}
        {userLocation && (
          <button
            onClick={() => {
              if (mapRef.current) {
                // Clear any selected store and previous selection
                onStoreSelect(null as any) // This will clear selectedStore
                setPreviousSelectedStoreId(null)
                // Hide pins during user location centering
                setPinsVisible(false)
                mapRef.current.flyTo(userLocation, 15, {
                  duration: 1.0,
                  easeLinearity: 0.5,
                })
                // Show pins again after animation completes
                setTimeout(() => {
                  setPinsVisible(true)
                }, 1150) // Adjusted timing to match new flyTo animation
              }
            }}
            className="min-w-[48px] min-h-[48px] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 active:bg-gray-100 border border-gray-200/50 transition-all duration-200 hover:shadow-xl active:scale-95 touch-none"
            title="定位到您的位置"
            aria-label="定位到您的位置"
          >
            <Navigation className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Region Legend - Responsive */}
      <div className="absolute top-4 left-4 z-[1000]">
        {/* Desktop version - always expanded */}
        <div className="hidden md:block bg-white rounded-lg shadow-lg p-3 max-w-[200px]">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">香港地區</h4>
          <div className="space-y-1.5">
            <div className="flex items-center text-xs">
              <div
                className="w-4 h-4 rounded-full mr-2 border border-white shadow-sm"
                style={{ backgroundColor: '#E11D48' }}
              ></div>
              <span className="text-gray-700">香港島</span>
            </div>
            <div className="flex items-center text-xs">
              <div
                className="w-4 h-4 rounded-full mr-2 border border-white shadow-sm"
                style={{ backgroundColor: '#3B82F6' }}
              ></div>
              <span className="text-gray-700">九龍</span>
            </div>
            <div className="flex items-center text-xs">
              <div
                className="w-4 h-4 rounded-full mr-2 border border-white shadow-sm"
                style={{ backgroundColor: '#10B981' }}
              ></div>
              <span className="text-gray-700">新界</span>
            </div>
          </div>
        </div>

        {/* Mobile version - collapsible */}
        <div className="md:hidden">
          <button
            onClick={() => setLegendExpanded(!legendExpanded)}
            className="bg-white rounded-lg shadow-lg p-2 flex items-center justify-center min-w-[48px] min-h-[48px] touch-none"
            aria-label="Toggle region legend"
          >
            <div
              className="w-3 h-3 rounded-full border border-gray-300"
              style={{
                background: 'linear-gradient(120deg, #E11D48 33%, #3B82F6 33% 66%, #10B981 66%)',
              }}
            ></div>
          </button>

          {legendExpanded && (
            <div className="absolute top-12 left-0 bg-white rounded-lg shadow-lg p-3 w-48">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">香港地區</h4>
              <div className="space-y-1.5">
                <div className="flex items-center text-xs">
                  <div
                    className="w-4 h-4 rounded-full mr-2 border border-white shadow-sm"
                    style={{ backgroundColor: '#E11D48' }}
                  ></div>
                  <span className="text-gray-700">香港島</span>
                </div>
                <div className="flex items-center text-xs">
                  <div
                    className="w-4 h-4 rounded-full mr-2 border border-white shadow-sm"
                    style={{ backgroundColor: '#3B82F6' }}
                  ></div>
                  <span className="text-gray-700">九龍</span>
                </div>
                <div className="flex items-center text-xs">
                  <div
                    className="w-4 h-4 rounded-full mr-2 border border-white shadow-sm"
                    style={{ backgroundColor: '#10B981' }}
                  ></div>
                  <span className="text-gray-700">新界</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Centering indicator */}
      {isCentering && selectedStore && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1002] pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200/50 flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-700 font-medium">定位中...</span>
          </div>
        </div>
      )}
    </div>
  )
}
