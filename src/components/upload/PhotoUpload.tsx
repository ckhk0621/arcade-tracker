'use client'

import React, { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  Camera, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Image as ImageIcon,
  Plus 
} from 'lucide-react'
import { PhotoPreview } from './PhotoPreview'
import { ProgressBar } from './ProgressBar'
import { CameraCapture } from './CameraCapture'
import type { 
  PhotoUploadComponentProps, 
  PhotoUploadFile, 
  UploadProgress,
  PayloadMediaDocument,
  VALIDATION_CONFIG,
  UPLOAD_MESSAGES 
} from './types'

export function PhotoUpload({
  onUploadComplete,
  onUploadProgress,
  onUploadError,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className = '',
  disabled = false,
  showPreviews = true,
  enableCamera = true,
}: PhotoUploadComponentProps) {
  const [files, setFiles] = useState<PhotoUploadFile[]>([])
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Create preview URLs for files
  const createPreviewUrl = useCallback((file: File): string => {
    return URL.createObjectURL(file)
  }, [])

  // Cleanup preview URLs
  const cleanupPreviewUrls = useCallback((filesToCleanup: PhotoUploadFile[]) => {
    filesToCleanup.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
  }, [])

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedFileTypes.includes(file.type)) {
      return `Invalid file type. Accepted types: ${acceptedFileTypes.join(', ')}`
    }
    if (file.size > maxFileSize) {
      return `File too large. Maximum size: ${(maxFileSize / (1024 * 1024)).toFixed(1)}MB`
    }
    return null
  }, [acceptedFileTypes, maxFileSize])

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles: File[]) => {
    setError(null)
    
    // Check total file count
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`Too many files. Maximum allowed: ${maxFiles}`)
      onUploadError?.(`Too many files. Maximum allowed: ${maxFiles}`)
      return
    }

    const validFiles: PhotoUploadFile[] = []
    const errors: string[] = []

    selectedFiles.forEach(file => {
      const validationError = validateFile(file)
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`)
      } else {
        const photoFile: PhotoUploadFile = Object.assign(file, {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          preview: createPreviewUrl(file),
        })
        validFiles.push(photoFile)
      }
    })

    if (errors.length > 0) {
      setError(errors.join('; '))
      onUploadError?.(errors.join('; '))
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
    }
  }, [files.length, maxFiles, validateFile, createPreviewUrl, onUploadError])

  // Handle dropzone
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => 
        `${file.name}: ${errors.map((e: any) => e.message).join(', ')}`
      )
      setError(errors.join('; '))
      onUploadError?.(errors.join('; '))
    }
    
    if (acceptedFiles.length > 0) {
      handleFileSelect(acceptedFiles)
    }
  }, [handleFileSelect, onUploadError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedFileTypes.map(type => `.${type.split('/')[1]}`),
    },
    maxSize: maxFileSize,
    maxFiles: maxFiles - files.length,
    disabled: disabled || isUploading,
    multiple: true,
  })

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
    setUploadProgress(prev => prev.filter(p => p.id !== fileId))
  }, [])

  // Upload files to server
  const uploadFiles = useCallback(async () => {
    if (files.length === 0 || isUploading) return

    setIsUploading(true)
    setError(null)

    // Initialize progress for all files
    const initialProgress: UploadProgress[] = files.map(file => ({
      id: file.id,
      progress: 0,
      status: 'pending' as const,
    }))
    setUploadProgress(initialProgress)
    onUploadProgress?.(initialProgress)

    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      // Update progress to uploading
      const uploadingProgress = initialProgress.map(p => ({
        ...p,
        status: 'uploading' as const,
        progress: 50,
      }))
      setUploadProgress(uploadingProgress)
      onUploadProgress?.(uploadingProgress)

      const response = await fetch('/api/upload/photos', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      // Update progress to complete
      const completeProgress = uploadingProgress.map(p => ({
        ...p,
        status: 'complete' as const,
        progress: 100,
      }))
      setUploadProgress(completeProgress)
      onUploadProgress?.(completeProgress)

      // Clean up and notify completion
      cleanupPreviewUrls(files)
      setFiles([])
      onUploadComplete?.(result.files as PayloadMediaDocument[])
    } catch (uploadError) {
      const errorMessage = uploadError instanceof Error ? uploadError.message : 'Upload failed'
      setError(errorMessage)
      onUploadError?.(errorMessage)

      // Update progress to error
      const errorProgress = uploadProgress.map(p => ({
        ...p,
        status: 'error' as const,
        error: errorMessage,
      }))
      setUploadProgress(errorProgress)
      onUploadProgress?.(errorProgress)
    } finally {
      setIsUploading(false)
    }
  }, [files, isUploading, uploadProgress, cleanupPreviewUrls, onUploadComplete, onUploadError, onUploadProgress])

  // Handle camera capture
  const handleCameraCapture = useCallback((file: File) => {
    setShowCamera(false)
    handleFileSelect([file])
  }, [handleFileSelect])

  // Clear all files
  const clearFiles = useCallback(() => {
    cleanupPreviewUrls(files)
    setFiles([])
    setUploadProgress([])
    setError(null)
  }, [files, cleanupPreviewUrls])

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Upload className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </div>
            
            {enableCamera && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowCamera(true)
                }}
                disabled={disabled || isUploading}
                className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Take photo with camera"
              >
                <Camera className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </button>
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {isDragActive ? 'Drop photos here...' : 'Drag & drop photos here'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              or click to select files {enableCamera && '• use camera button to take photos'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Max {maxFiles} files • {(maxFileSize / (1024 * 1024)).toFixed(1)}MB per file
            </p>
          </div>
        </div>
      </div>

      {/* File Previews */}
      {showPreviews && files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Selected Photos ({files.length})
            </h3>
            <button
              onClick={clearFiles}
              disabled={isUploading}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            >
              Clear all
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {files.map((file) => {
              const progress = uploadProgress.find(p => p.id === file.id)
              return (
                <PhotoPreview
                  key={file.id}
                  file={file}
                  onRemove={() => removeFile(file.id)}
                  progress={progress}
                  disabled={isUploading}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Upload Progress
          </h4>
          {uploadProgress.map((progress) => (
            <ProgressBar key={progress.id} progress={progress} />
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {files.length} file{files.length !== 1 ? 's' : ''} ready to upload
          </span>
          
          <button
            onClick={uploadFiles}
            disabled={isUploading || files.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Photos
              </>
            )}
          </button>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  )
}