export interface PhotoUploadFile extends File {
  id: string
  preview?: string
}

export interface UploadProgress {
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
}

export interface CloudinaryUploadResponse {
  public_id: string
  secure_url: string
  url: string
  width: number
  height: number
  format: string
  bytes: number
  created_at: string
}

export interface PayloadMediaDocument {
  id: string
  alt: string
  url: string
  filename: string
  mimeType: string
  filesize: number
  width: number
  height: number
  cloudinary_public_id: string
}

export interface PhotoUploadComponentProps {
  onUploadComplete?: (files: PayloadMediaDocument[]) => void
  onUploadProgress?: (progress: UploadProgress[]) => void
  onUploadError?: (error: string, file?: PhotoUploadFile) => void
  maxFiles?: number
  maxFileSize?: number // in bytes
  acceptedFileTypes?: string[]
  className?: string
  disabled?: boolean
  showPreviews?: boolean
  enableCamera?: boolean
}

// Validation constants
export const VALIDATION_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_FILES: 10,
} as const

export const UPLOAD_MESSAGES = {
  DRAG_ACTIVE: 'Drop photos here...',
  DRAG_INACTIVE: 'Drag & drop photos here, or click to select',
  FILE_TOO_LARGE: 'File is too large',
  INVALID_TYPE: 'Invalid file type',
  TOO_MANY_FILES: 'Too many files selected',
  UPLOAD_ERROR: 'Upload failed',
  CAMERA_NOT_SUPPORTED: 'Camera access not supported',
} as const