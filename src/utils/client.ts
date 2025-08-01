/**
 * Client-side utilities for SSR-safe operations
 */

/**
 * Check if code is running on the client side
 * @returns {boolean} True if running in browser environment
 */
export const isClient = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * Check if a global library is available on the client
 * @param {string} globalName - Name of the global variable to check
 * @returns {boolean} True if the global is available
 */
export const isGlobalAvailable = (globalName: string): boolean => {
  if (!isClient()) return false
  return typeof (window as any)[globalName] !== 'undefined'
}

/**
 * Safely execute code only on the client side
 * @param {() => T} fn - Function to execute on client
 * @param {T} fallback - Fallback value for server-side
 * @returns {T} Result of function or fallback
 */
export const clientOnly = <T>(fn: () => T, fallback: T): T => {
  if (!isClient()) return fallback
  try {
    return fn()
  } catch (error) {
    console.warn('Client-only function failed:', error)
    return fallback
  }
}

/**
 * Check if Leaflet is properly loaded and available
 * @returns {boolean} True if Leaflet is ready to use
 */
export const isLeafletReady = (): boolean => {
  return isClient() && 
         isGlobalAvailable('L') && 
         typeof (window as any).L?.divIcon === 'function' &&
         typeof (window as any).L?.Icon?.Default !== 'undefined'
}

/**
 * Execute callback when DOM is ready
 * @param {() => void} callback - Function to execute when DOM is ready
 */
export const onDOMReady = (callback: () => void): void => {
  if (!isClient()) return
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback)
  } else {
    callback()
  }
}