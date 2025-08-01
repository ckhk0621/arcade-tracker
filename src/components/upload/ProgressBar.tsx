'use client'

import React from 'react'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import type { UploadProgress } from './types'

interface ProgressBarProps {
  progress: UploadProgress
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'pending':
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
    }
  }

  const getStatusText = () => {
    switch (progress.status) {
      case 'pending':
        return 'Pending...'
      case 'uploading':
        return `Uploading... ${progress.progress}%`
      case 'complete':
        return 'Complete!'
      case 'error':
        return progress.error || 'Upload failed'
    }
  }

  const getProgressBarColor = () => {
    switch (progress.status) {
      case 'uploading':
        return 'bg-blue-600'
      case 'complete':
        return 'bg-green-600'
      case 'error':
        return 'bg-red-600'
      default:
        return 'bg-gray-300'
    }
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      {/* Status Icon */}
      <div className="flex-shrink-0">
        {getStatusIcon()}
      </div>
      
      {/* Progress Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            File {progress.id.split('-')[0]}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getStatusText()}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
            style={{ 
              width: `${progress.status === 'pending' ? 0 : progress.progress}%` 
            }}
          />
        </div>
        
        {/* Error Details */}
        {progress.status === 'error' && progress.error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {progress.error}
          </p>
        )}
      </div>
    </div>
  )
}