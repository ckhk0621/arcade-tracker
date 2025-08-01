'use client'

import { useState, useMemo } from 'react'
import { Search, MapPin, Star, Clock, Phone, Filter, ChevronDown, Navigation } from 'lucide-react'

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

interface StoreListProps {
  stores: Store[]
  selectedStore?: Store | null
  onStoreSelect: (store: Store) => void
  userLocation?: [number, number] | null
  className?: string
  onRefresh?: () => void
  isRefreshing?: boolean
}

const calculateDistance = (
  point1: [number, number],
  point2: [number, number]
): number => {
  const [lat1, lon1] = point1
  const [lat2, lon2] = point2
  
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
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

const getCategoryColor = (category?: string) => {
  const colors: Record<string, string> = {
    arcade: 'bg-blue-100 text-blue-800',
    restaurant: 'bg-amber-100 text-amber-800',
    entertainment: 'bg-emerald-100 text-emerald-800',
    bowling: 'bg-purple-100 text-purple-800',
    family: 'bg-pink-100 text-pink-800',
    bar: 'bg-red-100 text-red-800',
    mall: 'bg-gray-100 text-gray-800',
  }
  return colors[category || 'arcade'] || 'bg-gray-100 text-gray-800'
}

const getPriceRangeDisplay = (priceRange?: string) => {
  const ranges: Record<string, string> = {
    budget: '$',
    moderate: '$$',
    premium: '$$$',
  }
  return ranges[priceRange || 'moderate'] || '$$'
}

const getTodayHours = (openingHours?: Store['openingHours']) => {
  if (!openingHours) return null
  
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const today = days[new Date().getDay()]
  
  return openingHours[today as keyof typeof openingHours] || null
}

export default function StoreList({ 
  stores, 
  selectedStore, 
  onStoreSelect, 
  userLocation, 
  className,
  onRefresh,
  isRefreshing 
}: StoreListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance')
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'arcade', label: 'Arcade' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'entertainment', label: 'Entertainment Center' },
    { value: 'bowling', label: 'Bowling Alley' },
    { value: 'family', label: 'Family Fun Center' },
    { value: 'bar', label: 'Bar/Barcade' },
    { value: 'mall', label: 'Mall Arcade' },
  ]

  const filteredAndSortedStores = useMemo(() => {
    let filtered = stores.filter(store => 
      store.status === 'active' &&
      (selectedCategory === 'all' || store.category === selectedCategory) &&
      (searchQuery === '' || 
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.city?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )

    // Add distance calculation if user location is available
    if (userLocation) {
      filtered = filtered.map(store => ({
        ...store,
        distance: store.location?.coordinates 
          ? calculateDistance(userLocation, [store.location.coordinates[1], store.location.coordinates[0]])
          : Infinity
      }))
    }

    // Sort stores
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (!userLocation) return a.name.localeCompare(b.name)
          return ((a as any).distance || Infinity) - ((b as any).distance || Infinity)
        case 'rating':
          const ratingA = a.analytics?.averageRating || 0
          const ratingB = b.analytics?.averageRating || 0
          return ratingB - ratingA
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return filtered
  }, [stores, searchQuery, selectedCategory, sortBy, userLocation])

  const formatAddress = (store: Store) => {
    const parts = [store.address, store.city, store.state].filter(Boolean)
    return parts.join(', ')
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const handlePullToRefresh = (e: React.TouchEvent) => {
    // Simple pull-to-refresh implementation
    const startY = e.touches[0].clientY
    
    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY
      const diff = currentY - startY
      
      if (diff > 100 && onRefresh && !isRefreshing) {
        onRefresh()
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
    
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
  }

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Search and Filter Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Filter Toggle and Sort */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {userLocation && <option value="distance">By Distance</option>}
            <option value="rating">By Rating</option>
            <option value="name">By Name</option>
          </select>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          {filteredAndSortedStores.length} store{filteredAndSortedStores.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Store List */}
      <div 
        className="flex-1 overflow-y-auto"
        onTouchStart={handlePullToRefresh}
      >
        {/* Pull to refresh indicator */}
        {isRefreshing && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}

        {filteredAndSortedStores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <MapPin className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No stores found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredAndSortedStores.map((store) => {
              const isSelected = selectedStore?.id === store.id
              const distance = userLocation && store.location?.coordinates 
                ? calculateDistance(userLocation, [store.location.coordinates[1], store.location.coordinates[0]])
                : null
              
              return (
                <div
                  key={store.id}
                  onClick={() => onStoreSelect(store)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50 active:bg-gray-100'
                  }`}
                >
                  <div className="flex space-x-3">
                    {/* Store Image */}
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {store.images?.find(img => img.isPrimary)?.image?.url ? (
                        <img
                          src={store.images.find(img => img.isPrimary)!.image.url}
                          alt={store.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Store Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-gray-900 truncate pr-2">
                          {store.name}
                        </h3>
                        {distance !== null && (
                          <div className="flex items-center text-xs text-gray-500 flex-shrink-0">
                            <Navigation className="w-3 h-3 mr-1" />
                            {distance < 1 
                              ? `${Math.round(distance * 5280)} ft`  
                              : `${distance.toFixed(1)} mi`
                            }
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(store.category)}`}>
                          {getCategoryLabel(store.category)}
                        </span>
                        {store.pricing?.priceRange && (
                          <span className="text-sm text-gray-600">
                            {getPriceRangeDisplay(store.pricing.priceRange)}
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      {store.analytics?.averageRating && store.analytics.averageRating > 0 && (
                        <div className="flex items-center mt-1">
                          <div className="flex items-center">
                            {renderStars(Math.round(store.analytics.averageRating))}
                          </div>
                          <span className="ml-1 text-sm text-gray-600">
                            {store.analytics.averageRating.toFixed(1)} 
                            {store.analytics.totalRatings && (
                              <span className="text-gray-400"> ({store.analytics.totalRatings})</span>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Address */}
                      {formatAddress(store) && (
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {formatAddress(store)}
                        </p>
                      )}

                      {/* Hours and Phone */}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        {getTodayHours(store.openingHours) && (
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {getTodayHours(store.openingHours)}
                          </div>
                        )}
                        {store.contact?.phone && (
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {store.contact.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}