'use client'

import * as React from 'react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Minus } from 'lucide-react'

export type BottomSheetState = 'collapsed' | 'peek' | 'half' | 'full'

interface MobileBottomSheetProps {
  children: React.ReactNode
  state: BottomSheetState
  onStateChange: (state: BottomSheetState) => void
  className?: string
  snapPoints?: {
    peek: number
    half: number
    full: number
  }
  dragThreshold?: number
  animationDuration?: number
}

const defaultSnapPoints = {
  peek: 160,  // Show first few stores
  half: 50,   // Half screen
  full: 90    // Almost full screen (leave space for status bar)
}

export function MobileBottomSheet({
  children,
  state,
  onStateChange,
  className,
  snapPoints = defaultSnapPoints,
  dragThreshold = 50,
  animationDuration = 300
}: MobileBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [sheetStartY, setSheetStartY] = useState(0)
  const [currentTranslateY, setCurrentTranslateY] = useState(0)

  // Calculate sheet position based on state
  const getSheetHeight = useCallback((sheetState: BottomSheetState) => {
    const vh = window.innerHeight
    switch (sheetState) {
      case 'collapsed':
        return 0
      case 'peek':
        return snapPoints.peek
      case 'half':
        return (vh * snapPoints.half) / 100
      case 'full':
        return (vh * snapPoints.full) / 100
      default:
        return snapPoints.peek
    }
  }, [snapPoints])

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!sheetRef.current) return
    
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStartY(touch.clientY)
    setSheetStartY(getSheetHeight(state))
    
    // Prevent scrolling while dragging
    e.preventDefault()
  }, [state, getSheetHeight])

  // Handle touch move with simple position tracking
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !sheetRef.current) return
    
    const touch = e.touches[0]
    const deltaY = dragStartY - touch.clientY
    const newTranslateY = Math.max(0, Math.min(
      window.innerHeight * 0.9,
      sheetStartY + deltaY
    ))
    
    setCurrentTranslateY(newTranslateY)
    
    // Update sheet position
    sheetRef.current.style.height = `${newTranslateY}px`
    sheetRef.current.style.transition = 'none'
    
    e.preventDefault()
  }, [isDragging, dragStartY, sheetStartY])

  // Handle touch end with simple position-based snapping
  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !sheetRef.current) return
    
    setIsDragging(false)
    
    // Determine which snap point to go to based on current position only
    const vh = window.innerHeight
    const currentHeight = currentTranslateY
    const peekHeight = snapPoints.peek
    const halfHeight = (vh * snapPoints.half) / 100
    const fullHeight = (vh * snapPoints.full) / 100
    
    let newState: BottomSheetState = state
    
    // Simple position-based snapping logic
    if (currentHeight < peekHeight / 2) {
      newState = 'collapsed'
    } else if (currentHeight < (peekHeight + halfHeight) / 2) {
      newState = 'peek'
    } else if (currentHeight < (halfHeight + fullHeight) / 2) {
      newState = 'half'
    } else {
      newState = 'full'
    }
    
    // Only change state if different
    if (newState !== state) {
      onStateChange(newState)
    }
    
    // Use simple ease-out transition
    sheetRef.current.style.transition = `height ${animationDuration}ms ease-out`
  }, [isDragging, currentTranslateY, snapPoints, state, onStateChange, animationDuration])

  // Handle drag handle click
  const handleDragHandleClick = useCallback(() => {
    if (state === 'collapsed') {
      onStateChange('peek')
    } else if (state === 'peek') {
      onStateChange('half')
    } else if (state === 'half') {
      onStateChange('full')
    } else {
      onStateChange('collapsed')
    }
  }, [state, onStateChange])

  // Set up touch event listeners
  useEffect(() => {
    const dragHandle = dragHandleRef.current
    if (!dragHandle) return

    dragHandle.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      dragHandle.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  // Update sheet height when state changes
  useEffect(() => {
    if (!sheetRef.current || isDragging) return
    
    const height = getSheetHeight(state)
    sheetRef.current.style.height = `${height}px`
    sheetRef.current.style.transition = `height ${animationDuration}ms ease-out`
  }, [state, getSheetHeight, animationDuration, isDragging])

  return (
    <>
      {/* Backdrop - only visible when sheet is open */}
      {state !== 'collapsed' && (
        <div
          className={cn(
            "fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity",
            state === 'peek' ? 'opacity-0 pointer-events-none' : 'opacity-100'
          )}
          onClick={() => onStateChange('collapsed')}
        />
      )}

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-background shadow-2xl",
          "border-t border-border/20",
          "rounded-t-xl overflow-hidden mobile-bottom-sheet",
          "transform transition-all duration-300 ease-out",
          state === 'collapsed' && 'translate-y-full',
          className
        )}
        style={{
          height: state === 'collapsed' ? 0 : getSheetHeight(state),
          transition: isDragging ? 'none' : `height ${animationDuration}ms ease-out`
        }}
      >
        {/* Drag Handle */}
        <div
          ref={dragHandleRef}
          className="flex justify-center items-center py-4 cursor-grab active:cursor-grabbing transition-colors duration-200 hover:bg-muted/30 mobile-touch-feedback drag-handle"
          onClick={handleDragHandleClick}
          style={{
            touchAction: 'none',
            minHeight: '60px', // Larger touch target size
            width: '100%'
          }}
        >
          <div className="w-20 h-2 bg-muted-foreground/40 rounded-full transition-colors duration-200 hover:bg-muted-foreground/60" />
        </div>

        {/* Sheet Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </>
  )
}

// Drag handle component for easy access
export function BottomSheetDragHandle({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center items-center py-3", className)}>
      <Minus className="w-6 h-1.5 text-muted-foreground/50" />
    </div>
  )
}