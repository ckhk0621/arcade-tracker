'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, X, RotateCcw, Circle, Square } from 'lucide-react'

interface CameraCaptureProps {
  onCapture: (file: File) => void
  onClose: () => void
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [isCapturing, setIsCapturing] = useState(false)

  // Start camera stream
  const startCamera = useCallback(async (preferredFacingMode: 'user' | 'environment' = 'environment') => {
    try {
      setIsLoading(true)
      setError(null)

      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: preferredFacingMode,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      setFacingMode(preferredFacingMode)
    } catch (err) {
      console.error('Camera access error:', err)
      
      // Try fallback without facingMode constraint
      if (preferredFacingMode !== 'user') {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          })
          streamRef.current = fallbackStream
          
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream
            videoRef.current.play()
          }
          setFacingMode('user')
        } catch (fallbackErr) {
          setError('無法存取相機，請檢查權限設定')
        }
      } else {
        setError('Unable to access camera. Please check permissions.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initialize camera on mount
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('此瀏覽器不支援相機功能')
      setIsLoading(false)
      return
    }

    startCamera(facingMode)

    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [startCamera, facingMode])

  // Handle video load
  const handleVideoLoad = () => {
    setIsLoading(false)
  }

  // Flip camera
  const flipCamera = () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user'
    startCamera(newFacingMode)
  }

  // Capture photo
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return

    setIsCapturing(true)

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (!context) {
        throw new Error('Could not get canvas context')
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create image blob'))
          }
        }, 'image/jpeg', 0.9)
      })

      // Create file from blob
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const file = new File([blob], `photo-${timestamp}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      })

      onCapture(file)
    } catch (err) {
      console.error('Photo capture error:', err)
      setError('拍照失敗')
    } finally {
      setIsCapturing(false)
    }
  }

  // Handle close
  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 text-white">
        <h2 className="text-lg font-semibold">拍照</h2>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <Camera className="w-12 h-12 mx-auto mb-4 animate-pulse" />
              <p>Starting camera...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white max-w-sm px-4">
              <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => startCamera(facingMode)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={handleVideoLoad}
          className="w-full h-full object-cover"
        />

        {/* Capture overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Grid overlay for better composition */}
          <div className="absolute inset-4 border-2 border-white/30 rounded-lg">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border-r border-white/20 last:border-r-0" />
              ))}
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border-b border-white/20 last:border-b-0" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/50">
        <div className="flex items-center justify-center gap-8">
          {/* Flip camera button */}
          <button
            onClick={flipCamera}
            disabled={isLoading || isCapturing}
            className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          {/* Capture button */}
          <button
            onClick={capturePhoto}
            disabled={isLoading || isCapturing || !!error}
            className="relative p-4 bg-white hover:bg-gray-100 text-black rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCapturing ? (
              <Square className="w-8 h-8" />
            ) : (
              <Circle className="w-8 h-8" />
            )}
            {isCapturing && (
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Spacer */}
          <div className="w-12" />
        </div>

        <div className="text-center mt-4">
          <p className="text-white/70 text-sm">
            Tap the circle to capture • Use flip button to switch cameras
          </p>
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </div>
  )
}