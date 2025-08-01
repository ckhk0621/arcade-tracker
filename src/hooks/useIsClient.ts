'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to safely detect if code is running on the client side
 * Prevents hydration mismatches by ensuring the initial render matches server
 * 
 * @returns {boolean} True if running in browser environment after hydration
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Hook to safely access localStorage/sessionStorage
 * Returns null during SSR and initial render to prevent hydration mismatches
 * 
 * @param key - Storage key to read
 * @param defaultValue - Default value if key doesn't exist
 * @param storageType - 'local' or 'session' storage
 * @returns [value, setValue] tuple similar to useState
 */
export function useClientStorage<T>(
  key: string,
  defaultValue: T,
  storageType: 'local' | 'session' = 'local'
): [T, (value: T) => void] {
  const isClient = useIsClient()
  const [value, setValue] = useState<T>(defaultValue)

  useEffect(() => {
    if (!isClient) return

    try {
      const storage = storageType === 'local' ? localStorage : sessionStorage
      const item = storage.getItem(key)
      if (item !== null) {
        setValue(JSON.parse(item))
      }
    } catch (error) {
      console.warn(`Failed to read from ${storageType}Storage:`, error)
    }
  }, [key, storageType, isClient])

  const setStoredValue = (newValue: T) => {
    setValue(newValue)
    
    if (isClient) {
      try {
        const storage = storageType === 'local' ? localStorage : sessionStorage
        storage.setItem(key, JSON.stringify(newValue))
      } catch (error) {
        console.warn(`Failed to write to ${storageType}Storage:`, error)
      }
    }
  }

  return [value, setStoredValue]
}