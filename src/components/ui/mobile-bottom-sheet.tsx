'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X, ChevronUp } from 'lucide-react'

export type BottomSheetState = 'hidden' | 'full'

interface MobileBottomSheetProps {
  children: React.ReactNode
  state: BottomSheetState
  onStateChange: (state: BottomSheetState) => void
  className?: string
  storeCount?: number
  title?: string
}

export function MobileBottomSheet({
  children,
  state,
  onStateChange,
  className,
  storeCount = 0,
  title = "附近店舖"
}: MobileBottomSheetProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Handle toggle button click - go directly to full
  const handleToggle = () => {
    if (state === 'hidden') {
      onStateChange('full')
    } else {
      onStateChange('hidden')
    }
  }

  // Handle close button click
  const handleClose = () => {
    onStateChange('hidden')
  }

  // Handle backdrop click (only in full mode)
  const handleBackdropClick = () => {
    if (state === 'full') {
      onStateChange('hidden')
    }
  }

  // Add transition handling
  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => setIsTransitioning(false), 300)
    return () => clearTimeout(timer)
  }, [state])

  return (
    <>
      {/* Backdrop - only in full mode with high z-index */}
      {state === 'full' && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity duration-300"
          onClick={handleBackdropClick}
        />
      )}

      {/* Floating Toggle Button - shown when hidden only */}
      {state === 'hidden' && (
        <button
          onClick={handleToggle}
          className={cn(
            "fixed bottom-4 left-4 right-4 z-50 bg-primary text-primary-foreground",
            "rounded-xl shadow-lg border border-primary/20",
            "flex items-center justify-between px-4 py-3",
            "transition-all duration-300 ease-out",
            "hover:bg-primary/90 active:scale-[0.98]",
            "mobile-touch-feedback touchable"
          )}
          style={{
            minHeight: '56px', // Large touch target
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-start">
              <span className="font-medium text-sm">{title}</span>
              {storeCount > 0 && (
                <span className="text-xs opacity-90">{storeCount} 個店舖</span>
              )}
            </div>
          </div>
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* Full Mode Sheet - Full Viewport with highest z-index */}
      {state === 'full' && (
        <div
          className={cn(
            "fixed inset-0 z-[9999] bg-background",
            "transition-all duration-300 ease-out",
            "flex flex-col",
            className
          )}
          style={{ height: '100vh' }}
        >
          {/* Full Mode Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/20 bg-background/95 backdrop-blur-sm">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">{title}</h2>
              {storeCount > 0 && (
                <span className="text-sm text-muted-foreground">{storeCount} 個店舖</span>
              )}
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-muted/50 transition-colors touchable"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Full Content */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      )}
    </>
  )
}

// Simple toggle button component for external use
export function BottomSheetToggle({ 
  onClick, 
  storeCount, 
  title = "附近店舖",
  className 
}: { 
  onClick: () => void
  storeCount?: number
  title?: string
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-4 left-4 right-4 z-50 bg-primary text-primary-foreground",
        "rounded-xl shadow-lg border border-primary/20",
        "flex items-center justify-between px-4 py-3",
        "transition-all duration-300 ease-out",
        "hover:bg-primary/90 active:scale-[0.98]",
        "mobile-touch-feedback touchable",
        className
      )}
      style={{ minHeight: '56px' }}
    >
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-start">
          <span className="font-medium text-sm">{title}</span>
          {storeCount && storeCount > 0 && (
            <span className="text-xs opacity-90">{storeCount} 個店舖</span>
          )}
        </div>
      </div>
      <ChevronUp className="w-5 h-5" />
    </button>
  )
}