'use client'

import { useState, useMemo } from 'react'
import { Search, MapPin, Star, Clock, Phone, Filter, ChevronDown, Navigation } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

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
      filtered = filtered.map(store => {
        let storeCoords: [number, number] | null = null
        
        if (Array.isArray(store.location)) {
          storeCoords = [store.location[1], store.location[0]]
        } else if (store.location?.coordinates) {
          storeCoords = [store.location.coordinates[1], store.location.coordinates[0]]
        }
        
        return {
          ...store,
          distance: storeCoords ? calculateDistance(userLocation, storeCoords) : Infinity
        }
      })
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
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Search and Filter Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search stores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Toggle and Sort */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-1"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={cn("w-3 h-3 transition-transform", showFilters && "rotate-180")} />
          </Button>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              {userLocation && (
                <SelectItem value="distance">By Distance</SelectItem>
              )}
              <SelectItem value="rating">By Rating</SelectItem>
              <SelectItem value="name">By Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="space-y-3 pt-2 border-t">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
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
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <MapPin className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No stores found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {filteredAndSortedStores.map((store) => {
              const isSelected = selectedStore?.id === store.id
              let distance: number | null = null
              
              if (userLocation) {
                if (Array.isArray(store.location)) {
                  distance = calculateDistance(userLocation, [store.location[1], store.location[0]])
                } else if (store.location?.coordinates) {
                  distance = calculateDistance(userLocation, [store.location.coordinates[1], store.location.coordinates[0]])
                }
              }
              
              return (
                <Card
                  key={store.id}
                  onClick={() => onStoreSelect(store)}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    isSelected && "ring-2 ring-primary"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      {/* Store Image */}
                      <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-lg overflow-hidden">
                        {store.images?.find(img => img.isPrimary)?.image?.url ? (
                          <img
                            src={store.images.find(img => img.isPrimary)!.image.url}
                            alt={store.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Store Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold truncate pr-2">
                            {store.name}
                          </h3>
                          {distance !== null && (
                            <div className="flex items-center text-xs text-muted-foreground flex-shrink-0">
                              <Navigation className="w-3 h-3 mr-1" />
                              {distance < 1 
                                ? `${Math.round(distance * 5280)} ft`  
                                : `${distance.toFixed(1)} mi`
                              }
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(store.category || undefined)}`}>
                            {getCategoryLabel(store.category || undefined)}
                          </span>
                          {store.pricing?.priceRange && (
                            <span className="text-sm text-muted-foreground">
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
                            <span className="ml-1 text-sm text-muted-foreground">
                              {store.analytics.averageRating.toFixed(1)} 
                              {store.analytics.totalRatings && (
                                <span className="text-muted-foreground/70"> ({store.analytics.totalRatings})</span>
                              )}
                            </span>
                          </div>
                        )}

                        {/* Address */}
                        {formatAddress(store) && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {formatAddress(store)}
                          </p>
                        )}

                        {/* Hours and Phone */}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
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
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}