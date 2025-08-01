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
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
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
  const { toast } = useToast()

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
      return `無效的檔案類型。接受的類型： ${acceptedFileTypes.join(', ')}`
    }
    if (file.size > maxFileSize) {
      return `檔案過大。最大大小： ${(maxFileSize / (1024 * 1024)).toFixed(1)}MB`
    }
    return null
  }, [acceptedFileTypes, maxFileSize])

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles: File[]) => {
    setError(null)
    
    // Check total file count
    if (files.length + selectedFiles.length > maxFiles) {
      const errorMsg = `檔案數量過多。最大允許： ${maxFiles} 個`
      setError(errorMsg)
      onUploadError?.(errorMsg)
      toast({
        variant: "destructive",
        title: "上傳錯誤",
        description: errorMsg,
      })
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
      const errorMsg = errors.join('; ')
      setError(errorMsg)
      onUploadError?.(errorMsg)
      toast({
        variant: "destructive",
        title: "檔案驗證錯誤",
        description: errorMsg,
      })
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
      
      toast({
        title: "上傳成功",
        description: `成功上傳 ${files.length} 張照片`,
      })
    } catch (uploadError) {
      const errorMessage = uploadError instanceof Error ? uploadError.message : 'Upload failed'
      setError(errorMessage)
      onUploadError?.(errorMessage)
      
      toast({
        variant: "destructive",
        title: "上傳失敗",
        description: errorMessage,
      })

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
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-2 p-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto h-auto p-1 text-destructive hover:text-destructive/80"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dropzone */}
      <Card
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          isDragActive 
            ? 'border-primary bg-primary/10' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          (disabled || isUploading) && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-muted rounded-full">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            
            {enableCamera && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowCamera(true)
                }}
                disabled={disabled || isUploading}
                className="p-3 h-auto w-auto rounded-full"
                title="使用相機拍照"
              >
                <Camera className="w-8 h-8" />
              </Button>
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? '將照片放置於此...' : '拖放照片到此處'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              或點擊選擇檔案 {enableCamera && '• 使用相機按鈕拍照'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              最多 {maxFiles} 個檔案 • 單檔 {(maxFileSize / (1024 * 1024)).toFixed(1)}MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File Previews */}
      {showPreviews && files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
已選擇照片 ({files.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFiles}
              disabled={isUploading}
              className="text-muted-foreground hover:text-foreground"
            >
              清除全部
            </Button>
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
        <Card>
          <CardContent className="space-y-3 p-4">
            <h4 className="text-sm font-medium">
              上傳進度
            </h4>
            {uploadProgress.map((progress) => (
              <ProgressBar key={progress.id} progress={progress} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            {files.length} 個檔案準備上傳
          </span>
          
          <Button
            onClick={uploadFiles}
            disabled={isUploading || files.length === 0}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                上傳中...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                上傳照片
              </>
            )}
          </Button>
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