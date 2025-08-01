'use client'

import { MobileStoreLocator } from '@/components'

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
      initialStores={initialStores}
      onRefresh={handleRefresh}
    />
  )
}