'use client'

import React from 'react'
import { X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import type { PhotoUploadFile, UploadProgress } from './types'

interface PhotoPreviewProps {
  file: PhotoUploadFile
  onRemove: () => void
  progress?: UploadProgress
  disabled?: boolean
}

export function PhotoPreview({ 
  file, 
  onRemove, 
  progress, 
  disabled = false 
}: PhotoPreviewProps) {
  const getStatusIcon = () => {
    if (!progress) return null
    
    switch (progress.status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    if (!progress) return 'border-gray-200 dark:border-gray-700'
    
    switch (progress.status) {
      case 'uploading':
        return 'border-blue-400'
      case 'complete':
        return 'border-green-400'
      case 'error':
        return 'border-red-400'
      default:
        return 'border-gray-200 dark:border-gray-700'
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className={`relative group bg-white dark:bg-gray-800 rounded-lg border-2 ${getStatusColor()} overflow-hidden transition-all duration-200`}>
      {/* Image Preview */}
      <div className="aspect-square relative overflow-hidden">
        <img
          src={file.preview}
          alt={file.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Overlay for uploading state */}
        {progress?.status === 'uploading' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <div className="text-sm">{progress.progress}%</div>
            </div>
          </div>
        )}
        
        {/* Progress bar */}
        {progress && progress.status === 'uploading' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        )}
        
        {/* Remove button */}
        <button
          onClick={onRemove}
          disabled={disabled}
          className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          title="Remove photo"
        >
          <X className="w-3 h-3" />
        </button>
        
        {/* Status indicator */}
        {progress && (
          <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-800/90 rounded-full p-1">
            {getStatusIcon()}
          </div>
        )}
      </div>
      
      {/* File info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p 
              className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
              title={file.name}
            >
              {file.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(file.size)}
            </p>
            
            {/* Error message */}
            {progress?.status === 'error' && progress.error && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1" title={progress.error}>
                {progress.error.length > 30 ? `${progress.error.substring(0, 30)}...` : progress.error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}