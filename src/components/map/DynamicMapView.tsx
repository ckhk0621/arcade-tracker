'use client'

import dynamic from 'next/dynamic'
import React, { ComponentType, useState, useEffect, ErrorInfo, ReactNode } from 'react'
import { MapPin, Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { isClient } from '@/utils/client'

// Interface for the Store type (must match MapView props)
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
}

// Map loading skeleton component
function MapLoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={`relative w-full h-full bg-gray-100 flex items-center justify-center ${className}`}>
      {/* Skeleton background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-gray-50 to-green-50">
        {/* Animated grid pattern to simulate map tiles */}
        <div className="absolute inset-0 opacity-30">
          <div className="grid grid-cols-6 gap-1 h-full">
            {Array.from({ length: 24 }).map((_, i) => (
              <div 
                key={i} 
                className="bg-gray-200 rounded-sm animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
        
        {/* Floating map elements */}
        <div className="absolute inset-0">
          {/* Simulated roads */}
          <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-gray-300 opacity-40 animate-pulse" />
          <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-gray-300 opacity-40 animate-pulse" />
          <div className="absolute left-1/4 top-0 bottom-0 w-0.5 bg-gray-300 opacity-40 animate-pulse" />
          <div className="absolute left-3/4 top-0 bottom-0 w-0.5 bg-gray-300 opacity-40 animate-pulse" />
          
          {/* Simulated location pins */}
          <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-3/4 left-2/3 w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/5 w-3 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }} />
        </div>
      </div>
      
      {/* Loading content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-4 text-gray-600">
        <div className="relative">
          <MapPin className="w-16 h-16 text-blue-500 animate-pulse" />
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin absolute -top-2 -right-2" />
        </div>
        <div className="text-center">
          <p className="text-xl font-medium text-gray-700 mb-2">載入互動地圖中</p>
          <p className="text-sm text-gray-500">Preparing location services...</p>
          <div className="flex space-x-1 mt-3 justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
      
      {/* Skeleton UI elements */}
      <div className="absolute top-4 right-4 space-y-2">
        <div className="w-10 h-10 bg-white rounded-lg shadow-lg animate-pulse" />
        <div className="w-10 h-10 bg-white rounded-lg shadow-lg animate-pulse" />
      </div>
      
      <div className="absolute top-4 left-4">
        <div className="bg-white rounded-lg shadow-lg p-3 w-48 animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-3" />
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-200 rounded-full mr-2" />
              <div className="h-3 bg-gray-200 rounded flex-1" />
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-200 rounded-full mr-2" />
              <div className="h-3 bg-gray-200 rounded flex-1" />
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-200 rounded-full mr-2" />
              <div className="h-3 bg-gray-200 rounded flex-1" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom user location button placeholder */}
      <div className="absolute bottom-4 right-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full shadow-lg animate-pulse" />
      </div>
    </div>
  )
}

// Map error fallback component
function MapErrorFallback({ 
  error, 
  retry, 
  className 
}: { 
  error: Error
  retry: () => void
  className?: string 
}) {
  return (
    <div className={`relative w-full h-full bg-gray-50 flex items-center justify-center ${className}`}>
      <div className="text-center p-8 max-w-md">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
地圖載入失敗
        </h3>
        <p className="text-gray-600 mb-4">
在載入互動地圖時遇到問題。您仍可以使用列表檢視瀏覽店舖。
        </p>
        <p className="text-sm text-gray-500 mb-6">
          錯誤： {error.message || '發生未知錯誤'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={retry}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  )
}

// React Error Boundary for map loading failures
class MapErrorBoundary extends React.Component<
  { children: ReactNode; fallback: (error: Error, retry: () => void) => ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback: (error: Error, retry: () => void) => ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Map Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error, () => {
        this.setState({ hasError: false, error: null })
      })
    }

    return this.props.children
  }
}

// Client-side utility is now imported from utils

// Dynamically import MapView with SSR disabled and enhanced error handling
const MapView = dynamic(
  () => import('./MapView').catch((error) => {
    console.error('Failed to load MapView:', error)
    // Return a fallback component if the dynamic import fails
    return Promise.resolve({
      default: () => (
        <MapErrorFallback 
          error={new Error('Failed to load map component')} 
          retry={() => window.location.reload()} 
        />
      )
    })
  }),
  {
    ssr: false,
    loading: () => <MapLoadingSkeleton />
  }
) as ComponentType<MapViewProps>

// Main dynamic map wrapper component
export default function DynamicMapView(props: MapViewProps) {
  const [clientReady, setClientReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  // Ensure we're on the client side with additional checks
  useEffect(() => {
    // Double-check client-side environment
    if (isClient() && typeof document !== 'undefined') {
      setClientReady(true)
    }
  }, [])

  // Reset error on retry
  const handleRetry = () => {
    setError(null)
    setRetryKey(prev => prev + 1)
  }

  // Enhanced error boundary logic for SSR and Leaflet issues
  useEffect(() => {
    if (!isClient()) return

    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message?.toLowerCase() || ''
      const filename = event.filename?.toLowerCase() || ''
      
      if (errorMessage.includes('window is not defined') || 
          errorMessage.includes('leaflet') ||
          errorMessage.includes('document is not defined') ||
          filename.includes('leaflet')) {
        setError(new Error('Map requires browser environment. Please ensure JavaScript is enabled.'))
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message?.toLowerCase() || ''
      
      if (reason.includes('leaflet') || 
          reason.includes('window is not defined') ||
          reason.includes('document is not defined')) {
        setError(new Error('Map loading failed due to environment issues. Please refresh to try again.'))
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  // Show loading skeleton during SSR or while client is not ready
  if (!clientReady || !isClient()) {
    return <MapLoadingSkeleton className={props.className} />
  }

  // Show error fallback if there's an error
  if (error) {
    return <MapErrorFallback error={error} retry={handleRetry} className={props.className} />
  }

  // Render the dynamic map with error boundary
  return (
    <MapErrorBoundary
      fallback={(error, retry) => (
        <MapErrorFallback error={error} retry={retry} className={props.className} />
      )}
    >
      <MapView key={retryKey} {...props} />
    </MapErrorBoundary>
  )
}