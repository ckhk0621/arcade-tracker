'use client'

import { useState, useEffect } from 'react'

/**
 * Hook that ensures hydration-safe rendering by showing fallback during SSR
 * and initial render, then showing the actual content after hydration
 * 
 * @param clientContent - Content to show after hydration
 * @param fallbackContent - Content to show during SSR and before hydration
 * @returns The appropriate content based on hydration state
 */
export function useHydrationSafe<T>(
  clientContent: T,
  fallbackContent: T
): T {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated ? clientContent : fallbackContent
}

/**
 * Component wrapper that safely renders client-only content
 * Prevents hydration mismatches by showing fallback during SSR
 */
interface HydrationSafeProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function HydrationSafe({ children, fallback = null }: HydrationSafeProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return <>{fallback}</>
  }

  return <>{children}</>
}