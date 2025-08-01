'use client'

import React, { useState } from 'react'
import { PhotoUpload } from '@/components/upload/PhotoUpload'
import type { PayloadMediaDocument, UploadProgress } from '@/components/upload/types'

export default function UploadDemoPage() {
  const [uploadedFiles, setUploadedFiles] = useState<PayloadMediaDocument[]>([])
  const [currentProgress, setCurrentProgress] = useState<UploadProgress[]>([])
  const [message, setMessage] = useState<string>('')

  const handleUploadComplete = (files: PayloadMediaDocument[]) => {
    setUploadedFiles(prev => [...prev, ...files])
    setMessage(`Successfully uploaded ${files.length} file(s)!`)
    setTimeout(() => setMessage(''), 5000)
  }

  const handleUploadProgress = (progress: UploadProgress[]) => {
    setCurrentProgress(progress)
  }

  const handleUploadError = (error: string) => {
    setMessage(`Upload error: ${error}`)
    setTimeout(() => setMessage(''), 5000)
  }

  const clearUploaded = () => {
    setUploadedFiles([])
    setMessage('')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Photo Upload Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Test the photo upload component with drag & drop, camera capture, and Cloudinary integration
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('error') || message.includes('Error')
              ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
          }`}>
            {message}
          </div>
        )}

        {/* Upload Component */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Upload Photos
          </h2>
          <PhotoUpload
            onUploadComplete={handleUploadComplete}
            onUploadProgress={handleUploadProgress}
            onUploadError={handleUploadError}
            maxFiles={10}
            maxFileSize={10 * 1024 * 1024} // 10MB
            acceptedFileTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
            showPreviews={true}
            enableCamera={true}
          />
        </div>

        {/* Uploaded Files Gallery */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Uploaded Photos ({uploadedFiles.length})
              </h2>
              <button
                onClick={clearUploaded}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear all
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={file.url}
                      alt={file.alt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate" title={file.filename}>
                      {file.filename}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {file.width} × {file.height}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {(file.filesize / 1024).toFixed(1)} KB • {file.mimeType}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Features Included
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Upload Features</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Drag and drop interface</li>
                <li>• Multiple file selection</li>
                <li>• File type validation</li>
                <li>• File size validation</li>
                <li>• Upload progress tracking</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Mobile Features</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Camera access</li>
                <li>• Front/back camera switching</li>
                <li>• Touch-friendly interface</li>
                <li>• Responsive design</li>
                <li>• Mobile optimized previews</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Integration</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Cloudinary storage</li>
                <li>• PayloadCMS media collection</li>
                <li>• Automatic image optimization</li>
                <li>• Metadata preservation</li>
                <li>• Error handling</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-white">User Experience</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Image previews</li>
                <li>• Loading states</li>
                <li>• Error messages</li>
                <li>• Success feedback</li>
                <li>• Dark mode support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}