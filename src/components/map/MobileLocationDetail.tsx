'use client'

import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import HorizontalImageList from '@/components/ui/HorizontalImageList'

interface Store {
  id: string
  name: string
  address?: string | null
  city?: string | null
  state?: string | null
  region?: 'hong-kong-island' | 'kowloon' | 'new-territories' | null
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
}

interface MobileLocationDetailProps {
  store: Store | null
  onBackToList: () => void
  className?: string
}

const formatAddress = (store: Store) => {
  const parts = [store.address, store.city, store.state].filter(Boolean)
  return parts.join(', ')
}


export default function MobileLocationDetail({
  store,
  onBackToList,
  className,
}: MobileLocationDetailProps) {
  if (!store) {
    return null
  }

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4">
        <div className="flex items-center gap-2 pb-2">
          <Button variant="ghost" size="sm" onClick={onBackToList} className="px-2 h-6 w-6">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{store.name} 店舖詳情</h3>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Store Info - matching desktop structure */}
          <div className="space-y-3">
            {/* Address */}
            {formatAddress(store) && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                地址: {formatAddress(store)}
              </p>
            )}

            {/* Operating Hours */}
            <p className="text-sm text-foreground">營業時間: 10:00 - 22:00</p>

            {/* Rating */}
            <p className="text-sm text-foreground">
              評分: {(store.analytics?.averageRating || 4.5).toFixed(1)}/5 ⭐⭐⭐⭐⭐
            </p>
          </div>

          {/* Horizontal Image List - matching desktop image functionality */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">店舖圖片</h3>
            <HorizontalImageList
              images={
                store.images?.map((img) => ({
                  url: img.image.url || '',
                  caption: img.caption,
                  isPrimary: img.isPrimary,
                })) || []
              }
              className=""
            />
          </div>

          {/* Detailed Opening Hours */}
          {/* {hasOpeningHours && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    詳細營業時間
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

                  {!showAllHours &&
                    Object.values(openingHours || {}).filter(Boolean).length > 2 && (
                      <div className="text-sm text-muted-foreground text-center pt-2">
                        還有 {Object.values(openingHours || {}).filter(Boolean).length - 2} 天...
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )} */}

          {/* Analytics - matching desktop style */}
          {/* {store.analytics && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">店舖統計</h3>
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
          )} */}
        </div>
      </div>
    </div>
  )
}
