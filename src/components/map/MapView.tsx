'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Navigation } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

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

interface MapViewProps {
  stores: Store[]
  selectedStore?: Store | null
  onStoreSelect: (store: Store) => void
  userLocation?: [number, number] | null
  className?: string
}

// Custom icon for arcade locations
const createCustomIcon = (category: string = 'arcade') => {
  const getIconColor = (cat: string) => {
    switch (cat) {
      case 'arcade': return '#3B82F6'
      case 'restaurant': return '#F59E0B'
      case 'entertainment': return '#10B981'
      case 'bowling': return '#8B5CF6'
      case 'bar': return '#EF4444'
      default: return '#6B7280'
    }
  }

  return L.divIcon({
    html: `
      <div style="
        background-color: ${getIconColor(category)};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

// User location icon
const userLocationIcon = L.divIcon({
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

export default function MapView({ stores, selectedStore, onStoreSelect, userLocation, className }: MapViewProps) {
  const [mapReady, setMapReady] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  
  // Default center (San Francisco Bay Area)
  const defaultCenter: [number, number] = [37.7749, -122.4194]
  const mapCenter = userLocation || defaultCenter

  const handleStoreClick = (store: Store) => {
    onStoreSelect(store)
  }

  const formatAddress = (store: Store) => {
    const parts = [store.address, store.city, store.state].filter(Boolean)
    return parts.join(', ')
  }

  const getCategoryLabel = (category?: string) => {
    const labels: Record<string, string> = {
      arcade: 'Arcade',
      restaurant: 'Restaurant',
      entertainment: 'Entertainment Center',
      bowling: 'Bowling Alley',
      family: 'Family Fun Center',
      bar: 'Bar/Barcade',
      mall: 'Mall Arcade',
    }
    return labels[category || 'arcade'] || 'Arcade'
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
      <MapContainer
        center={mapCenter}
        zoom={userLocation ? 13 : 10}
        className="w-full h-full"
        ref={mapRef}
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
        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>
              <div className="text-center">
                <Navigation className="w-4 h-4 inline mr-1" />
                Your Location
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
            
            return (
              <Marker
                key={store.id}
                position={[lat, lng]}
                icon={createCustomIcon(store.category || 'arcade')}
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
                        View Details
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
      </MapContainer>

      {/* Custom zoom controls positioned for mobile */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 active:bg-gray-100"
          aria-label="Zoom in"
        >
          <span className="text-lg font-bold">+</span>
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 active:bg-gray-100"
          aria-label="Zoom out"
        >
          <span className="text-lg font-bold">−</span>
        </button>
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