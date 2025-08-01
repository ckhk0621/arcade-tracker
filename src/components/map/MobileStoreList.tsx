'use client'

import { useState, useMemo } from 'react'
import { MapPin, Star, Navigation, MessageSquare, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

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
}

interface MobileStoreListProps {
  stores: Store[]
  selectedStore?: Store | null
  onStoreSelect: (store: Store) => void
  userLocation?: [number, number] | null
  className?: string
  onRefresh?: () => void
  isRefreshing?: boolean
  isLoading?: boolean
  compact?: boolean
  sheetState?: 'hidden' | 'full'
}

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

const getCategoryLabel = (category?: string) => {
  const labels: Record<string, string> = {
    arcade: '冒險樂園',
    restaurant: '餐廳',
    entertainment: '娛樂中心',
    bowling: '保齡球館',
    family: 'family',
    bar: '酒廊/遊戲酒吧',
    mall: '商場遊戲區',
  }
  return labels[category || 'arcade'] || '冒險樂園'
}

const getCategoryVariant = (
  category?: string,
): 'arcade' | 'restaurant' | 'entertainment' | 'bowling' | 'family' | 'bar' | 'mall' => {
  const variants: Record<
    string,
    'arcade' | 'restaurant' | 'entertainment' | 'bowling' | 'family' | 'bar' | 'mall'
  > = {
    arcade: 'arcade',
    restaurant: 'restaurant',
    entertainment: 'entertainment',
    bowling: 'bowling',
    family: 'family',
    bar: 'bar',
    mall: 'mall',
  }
  return variants[category || 'arcade'] || 'arcade'
}

export default function MobileStoreList({
  stores,
  selectedStore,
  onStoreSelect,
  userLocation,
  className,
  onRefresh,
  isRefreshing,
  isLoading = false,
  sheetState = 'hidden',
}: MobileStoreListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'name'>('distance')

  const filteredAndSortedStores = useMemo(() => {
    let filtered = stores.filter(
      (store) =>
        store.status === 'active' &&
        (selectedRegion === 'all' || store.region === selectedRegion) &&
        (searchQuery === '' ||
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.city?.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    // Add distance calculation if user location is available
    if (userLocation) {
      filtered = filtered.map((store) => {
        let storeCoords: [number, number] | null = null

        if (Array.isArray(store.location)) {
          storeCoords = [store.location[1], store.location[0]]
        } else if (store.location?.coordinates) {
          storeCoords = [store.location.coordinates[1], store.location.coordinates[0]]
        }

        const storeWithDistance = {
          ...store,
          distance: storeCoords ? calculateDistance(userLocation, storeCoords) : Infinity,
        }
        return storeWithDistance as Store & { distance: number }
      })
    }

    // Sort stores
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (!userLocation) return a.name.localeCompare(b.name)
          const aDistance = (a as Store & { distance?: number }).distance || Infinity
          const bDistance = (b as Store & { distance?: number }).distance || Infinity
          return aDistance - bDistance
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
  }, [stores, searchQuery, selectedRegion, sortBy, userLocation])

  const formatAddress = (store: Store) => {
    const parts = [store.address, store.city, store.state].filter(Boolean)
    return parts.join(', ')
  }

  // Show all items in full mode, none in hidden mode
  const displayStores = sheetState === 'full' ? filteredAndSortedStores : []

  const showFilters = sheetState === 'full'

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Compact Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 p-3 space-y-3">
        {/* Title and Count */}
        <div className="flex items-center justify-between">
          {showFilters ? (
            <h2 className="text-sm font-medium text-foreground">冒險樂園搜尋</h2>
          ) : (
            <h3 className="text-base font-medium text-foreground">附近店舖</h3>
          )}
          <span className="text-sm text-muted-foreground">
            {filteredAndSortedStores.length} 個店舖
          </span>
        </div>

        {showFilters && (
          <>
            {/* Hong Kong Regions - Compact Pills */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedRegion('all')}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 clickable touchable',
                  selectedRegion === 'all'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                )}
              >
                全部
              </button>
              <button
                onClick={() => setSelectedRegion('hong-kong-island')}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 clickable touchable',
                  selectedRegion === 'hong-kong-island'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200',
                )}
              >
                香港島
              </button>
              <button
                onClick={() => setSelectedRegion('kowloon')}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 clickable touchable',
                  selectedRegion === 'kowloon'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200',
                )}
              >
                九龍
              </button>
              <button
                onClick={() => setSelectedRegion('new-territories')}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 clickable touchable',
                  selectedRegion === 'new-territories'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200',
                )}
              >
                新界
              </button>
            </div>

            {/* Search Bar - Compact */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
              <Input
                type="text"
                placeholder="搜尋店舖..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm bg-muted/30 border-muted-foreground/20 focus:bg-background"
              />
            </div>

            {/* Sort - Inline */}
            <div className="flex items-center justify-end">
              <Select
                value={sortBy}
                onValueChange={(value: 'distance' | 'rating' | 'name') => setSortBy(value)}
              >
                <SelectTrigger 
                  className="w-24 h-7 text-xs border-muted-foreground/20 !text-white [&>span]:!text-white"
                  style={{ color: 'white' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userLocation && <SelectItem value="distance">距離</SelectItem>}
                  <SelectItem value="rating">評分</SelectItem>
                  <SelectItem value="name">名稱</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* Store List */}
      <div
        className="flex-1 overflow-y-auto overscroll-y-contain scroll-smooth store-list-scrollable"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain',
        }}
      >
        {/* Pull to refresh indicator */}
        {isRefreshing && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}

        {isLoading ? (
          // Loading skeleton
          <div className="space-y-1 p-2 min-h-full">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="border-border/30">
                <CardContent className="p-2.5">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayStores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <MapPin className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">沒有找到店舖</p>
            <p className="text-sm">請嘗試調整搜索條件或篩選器</p>
          </div>
        ) : (
          <div className="space-y-1 p-2 min-h-full">
            {displayStores.map((store) => {
              const isSelected = selectedStore?.id === store.id
              let distance: number | null = null

              if (userLocation) {
                if (Array.isArray(store.location)) {
                  distance = calculateDistance(userLocation, [store.location[1], store.location[0]])
                } else if (store.location?.coordinates) {
                  distance = calculateDistance(userLocation, [
                    store.location.coordinates[1],
                    store.location.coordinates[0],
                  ])
                }
              }

              return (
                <Card
                  key={store.id}
                  onClick={() => onStoreSelect(store)}
                  className={cn(
                    'cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-accent/50 border-border/30 hover:border-border/50 group clickable touchable',
                    'min-h-[56px] active:scale-[0.98] active:shadow-sm transform mobile-touch-feedback', // Touch-friendly minimum height with press animation
                    isSelected &&
                      'ring-1 ring-primary bg-accent/30 border-primary/30 shadow-sm scale-[1.02]',
                  )}
                >
                  <CardContent className="p-2.5">
                    <div className="space-y-1">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-base leading-tight truncate flex-1 text-foreground">
                          {store.name}
                        </h3>
                        {distance !== null && (
                          <div className="flex items-center text-sm text-muted-foreground flex-shrink-0">
                            <Navigation className="w-4 h-4 mr-1" />
                            <span className="font-medium">
                              {distance < 1
                                ? `${Math.round(distance * 1000)}m`
                                : `${distance.toFixed(1)}km`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Address Row */}
                      {formatAddress(store) && (
                        <p className="text-xs text-muted-foreground truncate leading-tight">
                          {formatAddress(store)}
                        </p>
                      )}

                      {/* Rating & Category Row */}
                      <div className="flex items-center justify-between">
                        {store.analytics?.averageRating && store.analytics.averageRating > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs font-medium text-foreground">
                              {store.analytics.averageRating.toFixed(1)}
                            </span>
                            {store.analytics.totalRatings && (
                              <span className="text-xs text-muted-foreground">
                                ({store.analytics.totalRatings})
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">沒有評分</div>
                        )}

                        {store.category &&
                          (store.category === 'family' ? (
                            <div
                              className="p-1 rounded-md hover:bg-muted/80 transition-colors cursor-pointer group-hover:bg-muted clickable touchable"
                              onClick={(e) => {
                                e.stopPropagation()
                                onStoreSelect(store)
                              }}
                            >
                              <MessageSquare className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                            </div>
                          ) : (
                            <Badge variant={getCategoryVariant(store.category)} className="text-xs">
                              {getCategoryLabel(store.category)}
                            </Badge>
                          ))}
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
