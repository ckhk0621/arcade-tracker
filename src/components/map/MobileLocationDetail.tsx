'use client'

import { useState } from 'react'
import { Star, MapPin, Clock, Phone, ExternalLink, Navigation, ChevronLeft } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

interface MobileLocationDetailProps {
  store: Store | null
  userLocation?: [number, number] | null
  onClose: () => void
  onBackToList: () => void
  className?: string
}

const calculateDistance = (
  point1: [number, number],
  point2: [number, number]
): number => {
  const [lat1, lon1] = point1
  const [lat2, lon2] = point2
  
  const R = 6371 // Earth's radius in kilometers
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
    arcade: '遊戲機中心',
    restaurant: '餐廳',
    entertainment: '娛樂中心',
    bowling: '保齡球館',
    family: 'family',
    bar: '酒廊/遊戲酒吧',
    mall: '商場遊戲區',
  }
  return labels[category || 'arcade'] || '遊戲機中心'
}

const getCategoryVariant = (category?: string): "arcade" | "restaurant" | "entertainment" | "bowling" | "family" | "bar" | "mall" => {
  const variants: Record<string, "arcade" | "restaurant" | "entertainment" | "bowling" | "family" | "bar" | "mall"> = {
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

const formatAddress = (store: Store) => {
  const parts = [store.address, store.city, store.state].filter(Boolean)
  return parts.join(', ')
}

const getDayName = (day: string) => {
  const days: Record<string, string> = {
    monday: '星期一',
    tuesday: '星期二',
    wednesday: '星期三',
    thursday: '星期四',
    friday: '星期五',
    saturday: '星期六',
    sunday: '星期日'
  }
  return days[day] || day
}

export default function MobileLocationDetail({
  store,
  userLocation,
  onClose,
  onBackToList,
  className
}: MobileLocationDetailProps) {
  const [showAllHours, setShowAllHours] = useState(false)

  if (!store) {
    return null
  }

  let distance: number | null = null
  let storeCoords: [number, number] | null = null

  if (userLocation) {
    if (Array.isArray(store.location)) {
      storeCoords = [store.location[1], store.location[0]]
    } else if (store.location?.coordinates) {
      storeCoords = [store.location.coordinates[1], store.location.coordinates[0]]
    }
    
    if (storeCoords) {
      distance = calculateDistance(userLocation, storeCoords)
    }
  }

  const primaryImage = store.images?.find(img => img.isPrimary)?.image?.url || 
                      store.images?.[0]?.image?.url

  const openingHours = store.openingHours
  const hasOpeningHours = openingHours && Object.values(openingHours).some(Boolean)

  const handleDirections = () => {
    if (!storeCoords) return
    
    const [lat, lng] = storeCoords
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    window.open(url, '_blank')
  }

  const handleCall = () => {
    if (store.contact?.phone) {
      window.location.href = `tel:${store.contact.phone}`
    }
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToList}
            className="p-2 h-10 w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">{store.name}</h1>
            {distance !== null && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Navigation className="w-4 h-4 mr-1" />
                <span>
                  {distance < 1 
                    ? `${Math.round(distance * 1000)}m 外`  
                    : `${distance.toFixed(1)}km 外`
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Image */}
        {primaryImage && (
          <div className="aspect-video w-full bg-muted">
            <img
              src={primaryImage}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-4 space-y-6">
          {/* Basic Info */}
          <div className="space-y-3">
            {/* Rating */}
            {store.analytics?.averageRating && store.analytics.averageRating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold">
                    {store.analytics.averageRating.toFixed(1)}
                  </span>
                </div>
                {store.analytics.totalRatings && (
                  <span className="text-muted-foreground">
                    ({store.analytics.totalRatings} 個評分)
                  </span>
                )}
              </div>
            )}

            {/* Category */}
            {store.category && (
              <div>
                <Badge variant={getCategoryVariant(store.category)} className="text-sm">
                  {getCategoryLabel(store.category)}
                </Badge>
              </div>
            )}

            {/* Address */}
            {formatAddress(store) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-base leading-relaxed">{formatAddress(store)}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {storeCoords && (
              <Button 
                onClick={handleDirections}
                className="flex-1 h-12"
                size="lg"
              >
                <Navigation className="w-5 h-5 mr-2" />
                導航
              </Button>
            )}
            {store.contact?.phone && (
              <Button 
                onClick={handleCall}
                variant="outline"
                className="flex-1 h-12"
                size="lg"
              >
                <Phone className="w-5 h-5 mr-2" />
                致電
              </Button>
            )}
          </div>

          {/* Opening Hours */}
          {hasOpeningHours && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    營業時間
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllHours(!showAllHours)}
                    className="text-sm text-primary"
                  >
                    {showAllHours ? '收起' : '展開'}
                  </Button>
                </div>

                <div className="space-y-2">
                  {Object.entries(openingHours || {}).map(([day, hours], index) => {
                    if (!hours) return null
                    if (!showAllHours && index >= 2) return null

                    return (
                      <div key={day} className="flex justify-between items-center">
                        <span className="text-muted-foreground">{getDayName(day)}</span>
                        <span className="font-medium">{hours}</span>
                      </div>
                    )
                  })}
                  
                  {!showAllHours && Object.values(openingHours || {}).filter(Boolean).length > 2 && (
                    <div className="text-sm text-muted-foreground text-center pt-2">
                      還有 {Object.values(openingHours || {}).filter(Boolean).length - 2} 天...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analytics */}
          {store.analytics && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">店舖資訊</h3>
                <div className="grid grid-cols-2 gap-4">
                  {store.analytics.views && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {store.analytics.views.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">瀏覽次數</div>
                    </div>
                  )}
                  {store.analytics.photoCount && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {store.analytics.photoCount}
                      </div>
                      <div className="text-sm text-muted-foreground">照片數量</div>
                    </div>
                  )}
                  {store.analytics.checkIns && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {store.analytics.checkIns}
                      </div>
                      <div className="text-sm text-muted-foreground">打卡次數</div>
                    </div>
                  )}
                  {store.analytics.machineCount && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {store.analytics.machineCount}
                      </div>
                      <div className="text-sm text-muted-foreground">遊戲機數量</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Images */}
          {store.images && store.images.length > 1 && (
            <div>
              <h3 className="font-semibold mb-3">更多照片</h3>
              <div className="grid grid-cols-3 gap-2">
                {store.images.slice(1, 7).map((image, index) => (
                  <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                    {image.image?.url && (
                      <img
                        src={image.image.url}
                        alt={image.caption || `${store.name} 照片 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
              {store.images.length > 7 && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  還有 {store.images.length - 7} 張照片...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}