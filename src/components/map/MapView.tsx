'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Navigation, ChevronLeft, ChevronRight } from 'lucide-react'
import { isLeafletReady } from '@/utils/client'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React Leaflet - only run on client side
if (isLeafletReady()) {
  try {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
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

interface MapViewProps {
  stores: Store[]
  selectedStore?: Store | null
  onStoreSelect: (store: Store) => void
  userLocation?: [number, number] | null
  className?: string
  isStoreListCollapsed?: boolean
  onToggleStoreList?: () => void
}

// Custom pin icon for arcade locations with region-based colors
const createCustomPinIcon = (region?: string | null, category: string = 'arcade', isSelected: boolean = false) => {
  // Ensure we're on the client side and Leaflet is available
  if (!isLeafletReady()) {
    return null
  }
  const getRegionColor = (reg?: string | null) => {
    switch (reg) {
      case 'hong-kong-island': return '#E11D48' // Rose-600 for Hong Kong Island
      case 'kowloon': return '#3B82F6' // Blue-500 for Kowloon  
      case 'new-territories': return '#10B981' // Emerald-500 for New Territories
      default: return '#6B7280' // Gray-500 for unknown regions
    }
  }

  const getCategoryAccent = (cat: string) => {
    switch (cat) {
      case 'arcade': return 'rgba(255,255,255,0.9)'
      case 'restaurant': return 'rgba(251,191,36,0.9)' // Amber
      case 'entertainment': return 'rgba(168,85,247,0.9)' // Purple
      case 'bowling': return 'rgba(34,197,94,0.9)' // Green
      case 'bar': return 'rgba(239,68,68,0.9)' // Red
      default: return 'rgba(255,255,255,0.9)'
    }
  }

  return L.divIcon({
    html: `
      <div class="pin-container ${isSelected ? 'selected-pin' : ''}" style="
        position: relative;
        width: 40px;
        height: 50px;
        transform: translateX(-50%);
      ">
        <!-- Pin shadow -->
        <div style="
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: ${isSelected ? '24px' : '20px'};
          height: ${isSelected ? '10px' : '8px'};
          background: rgba(0,0,0,${isSelected ? '0.3' : '0.2'});
          border-radius: 50%;
          filter: blur(2px);
          transition: all 0.2s ease;
        "></div>
        
        <!-- Main pin -->
        <div class="pin-main" style="
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 40px;
          background: ${getRegionColor(region)};
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: translateX(-50%) rotate(-45deg);
          box-shadow: 0 4px 12px rgba(0,0,0,${isSelected ? '0.35' : '0.25'});
          transition: all 0.2s ease;
          ${isSelected ? 'filter: brightness(1.1);' : ''}
        ">
          <!-- Pin center dot -->
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            width: 12px;
            height: 12px;
            background: ${getCategoryAccent(category)};
            border-radius: 50%;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
          "></div>
        </div>
      </div>
    `,
    className: `custom-pin-icon ${isSelected ? 'selected-pin' : ''}`,
    iconSize: [40, 50],
    iconAnchor: [20, 45],
    popupAnchor: [0, -45],
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

// Component to handle map centering
function MapController({ center, selectedStore }: { center?: [number, number], selectedStore?: Store | null }) {
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
        map.flyTo(coords, 16, {
          animate: true,
          duration: 1.0
        })
      }
    } else if (center) {
      map.setView(center, map.getZoom())
    }
  }, [map, center, selectedStore])

  return null
}

export default function MapView({ stores, selectedStore, onStoreSelect, userLocation, className, isStoreListCollapsed, onToggleStoreList }: MapViewProps) {
  const [mapReady, setMapReady] = useState(false)
  const [legendExpanded, setLegendExpanded] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  
  // Default center (Hong Kong - Central area between all regions)
  const defaultCenter: [number, number] = [22.3193, 114.1694]
  const mapCenter = userLocation || defaultCenter

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

  const handleStoreClick = (store: Store) => {
    onStoreSelect(store)
  }

  const formatAddress = (store: Store) => {
    const parts = [store.address, store.city, store.state].filter(Boolean)
    return parts.join(', ')
  }

  const getCategoryLabel = (category?: string) => {
    const labels: Record<string, string> = {
      arcade: '遊戲機中心',
      restaurant: '餐廳',
      entertainment: '娛樂中心',
      bowling: '保齡球館',
      family: '親子遊樂場',
      bar: '酒廊/遊戲酒吧',
      mall: '商場遊戲區',
    }
    return labels[category || 'arcade'] || '遊戲機中心'
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
      {/* Custom styles for pin interactions */}
      <style jsx>{`
        :global(.custom-pin-icon) {
          transition: all 0.2s ease;
        }
        
        :global(.custom-pin-icon:hover .pin-main) {
          transform: translateX(-50%) rotate(-45deg) scale(1.1) !important;
          box-shadow: 0 6px 20px rgba(0,0,0,0.35) !important;
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
        
        /* Pin pulse animation for selected store */
        :global(.selected-pin .pin-main) {
          animation: pinPulse 2s infinite;
        }
        
        @keyframes pinPulse {
          0% { transform: translateX(-50%) rotate(-45deg) scale(1); }
          50% { transform: translateX(-50%) rotate(-45deg) scale(1.05); }
          100% { transform: translateX(-50%) rotate(-45deg) scale(1); }
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
        
        <MapController center={mapCenter} selectedStore={selectedStore} />

        {/* User location marker */}
        {userLocation && getUserLocationIcon() && (
          <Marker position={userLocation} icon={getUserLocationIcon()!}>
            <Popup>
              <div className="text-center">
                <Navigation className="w-4 h-4 inline mr-1" />
                您的位置
              </div>
            </Popup>
          </Marker>
        )}

        {/* Store markers */}
        {stores
          .filter(store => 
            store.location && 
            store.status === 'active'
          )
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
            const customIcon = createCustomPinIcon(store.region, store.category || 'arcade', isSelected)
            
            // Skip marker if icon creation failed (e.g., on server side)
            if (!customIcon) return null
            
            return (
              <Marker
                key={store.id}
                position={[lat, lng]}
                icon={customIcon}
                eventHandlers={{
                  click: () => handleStoreClick(store),
                }}
              >
                <Popup>
                  <div className="min-w-[200px] max-w-[280px]">
                    {/* Store image */}
                    {store.images?.find(img => img.isPrimary)?.image?.url && (
                      <img
                        src={store.images.find(img => img.isPrimary)!.image.url}
                        alt={store.name}
                        className="w-full h-32 object-cover rounded-t-lg mb-2"
                      />
                    )}
                    
                    {/* Store info */}
                    <div className="p-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {store.name}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {getCategoryLabel(store.category || undefined)}
                      </p>

                      {formatAddress(store) && (
                        <p className="text-sm text-gray-700 mb-2 flex items-start">
                          <MapPin className="w-3 h-3 mt-0.5 mr-1 flex-shrink-0" />
                          {formatAddress(store)}
                        </p>
                      )}

                      {/* Rating */}
                      {store.analytics?.averageRating && store.analytics.averageRating > 0 && (
                        <div className="flex items-center text-sm mb-2">
                          {renderStars(Math.round(store.analytics.averageRating))}
                          <span className="ml-1 text-gray-600">
                            ({store.analytics.averageRating.toFixed(1)})
                          </span>
                        </div>
                      )}

                      <button
                        onClick={() => handleStoreClick(store)}
                        className="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        查看詳情
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
      </MapContainer>

      {/* Custom zoom controls and collapse button positioned for mobile */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 active:bg-gray-100 border border-gray-200/50 transition-all duration-200 hover:shadow-xl active:scale-95"
          aria-label="放大地圖"
        >
          <span className="text-lg font-bold">+</span>
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 active:bg-gray-100 border border-gray-200/50 transition-all duration-200 hover:shadow-xl active:scale-95"
          aria-label="縮小地圖"
        >
          <span className="text-lg font-bold">−</span>
        </button>
        
        {/* Collapse/Expand Button - Positioned under zoom controls */}
        {onToggleStoreList && (
          <button
            onClick={onToggleStoreList}
            className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 active:bg-gray-100 border border-gray-200/50 transition-all duration-200 hover:shadow-xl active:scale-95"
            title={isStoreListCollapsed ? "展開店舖列表" : "收起店舖列表"}
            aria-label={isStoreListCollapsed ? "展開店舖列表" : "收起店舖列表"}
          >
            {isStoreListCollapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
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
              <div className="w-4 h-4 rounded-full mr-2 border border-white shadow-sm" style={{ backgroundColor: '#E11D48' }}></div>
              <span className="text-gray-700">香港島</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-4 h-4 rounded-full mr-2 border border-white shadow-sm" style={{ backgroundColor: '#3B82F6' }}></div>
              <span className="text-gray-700">九龍</span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-4 h-4 rounded-full mr-2 border border-white shadow-sm" style={{ backgroundColor: '#10B981' }}></div>
              <span className="text-gray-700">新界</span>
            </div>
          </div>
        </div>
        
        {/* Mobile version - collapsible */}
        <div className="md:hidden">
          <button
            onClick={() => setLegendExpanded(!legendExpanded)}
            className="bg-white rounded-lg shadow-lg p-2 flex items-center justify-center w-10 h-10"
            aria-label="Toggle region legend"
          >
            <div className="w-3 h-3 rounded-full border border-gray-300" style={{ 
              background: 'linear-gradient(120deg, #E11D48 33%, #3B82F6 33% 66%, #10B981 66%)' 
            }}></div>
          </button>
          
          {legendExpanded && (
            <div className="absolute top-12 left-0 bg-white rounded-lg shadow-lg p-3 w-48">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">香港地區</h4>
              <div className="space-y-1.5">
                <div className="flex items-center text-xs">
                  <div className="w-4 h-4 rounded-full mr-2 border border-white shadow-sm" style={{ backgroundColor: '#E11D48' }}></div>
                  <span className="text-gray-700">香港島</span>
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-4 h-4 rounded-full mr-2 border border-white shadow-sm" style={{ backgroundColor: '#3B82F6' }}></div>
                  <span className="text-gray-700">九龍</span>
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-4 h-4 rounded-full mr-2 border border-white shadow-sm" style={{ backgroundColor: '#10B981' }}></div>
                  <span className="text-gray-700">新界</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location button */}
      {userLocation && (
        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.flyTo(userLocation, 15)
            }
          }}
          className="absolute bottom-4 right-4 z-[1000] w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 active:bg-blue-800"
          aria-label="Center on your location"
        >
          <Navigation className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}