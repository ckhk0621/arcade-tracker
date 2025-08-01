'use client'

import { MobileStoreLocator } from '@/components'

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

interface StoreLocatorWrapperProps {
  initialStores: Store[]
}

export default function StoreLocatorWrapper({ initialStores }: StoreLocatorWrapperProps) {
  const handleRefresh = async (): Promise<Store[]> => {
    try {
      const response = await fetch('/api/stores', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch stores')
      }
      
      const data = await response.json()
      return data.docs || []
    } catch (error) {
      console.error('Error refreshing stores:', error)
      return initialStores
    }
  }

  return (
    <MobileStoreLocator 
      initialStores={initialStores as any}
      onRefresh={handleRefresh as any}
    />
  )
}