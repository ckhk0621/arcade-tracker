# Photo Upload Component

A comprehensive photo upload component with drag & drop, camera capture, and cloud storage integration for React/Next.js applications.

## Features

### 🚀 Core Features
- **Drag & Drop Interface** - Intuitive file dropping with visual feedback
- **Multiple File Selection** - Upload multiple photos simultaneously  
- **Image Previews** - Preview images before upload with file information
- **Upload Progress** - Real-time progress tracking with visual indicators
- **File Validation** - Type, size, and count validation with error messages

### 📱 Mobile Features
- **Camera Access** - Direct camera capture on mobile devices
- **Front/Back Camera** - Switch between device cameras
- **Touch-Friendly** - Optimized for mobile interactions
- **Responsive Design** - Works seamlessly across all screen sizes

### ☁️ Cloud Integration
- **Cloudinary Support** - Automatic image optimization and CDN delivery
- **PayloadCMS Integration** - Store media references in your CMS
- **Metadata Preservation** - Maintains image dimensions, file size, and type
- **Error Handling** - Robust error recovery and user feedback

### 🎨 User Experience
- **Dark Mode Support** - Automatic theme switching
- **Loading States** - Clear visual feedback during operations
- **Error Messages** - Helpful validation and error messages
- **Success Feedback** - Confirmation of successful uploads
- **Accessibility** - WCAG compliant with screen reader support

## Installation

The component requires these dependencies:

```bash
pnpm add react-dropzone lucide-react cloudinary
```

## Environment Setup

Add these environment variables to your `.env.local`:

```env
# Cloudinary Configuration (Optional - for advanced features)
CLOUDINARY_CLOUD_NAME=your-cloud-name  
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# PayloadCMS (Required)
DATABASE_URI=your-mongodb-connection-string
PAYLOAD_SECRET=your-secret-key
```

## Basic Usage

```tsx
import { PhotoUpload } from '@/components/upload'
import type { PayloadMediaDocument } from '@/components/upload/types'

function MyUploadPage() {
  const handleUploadComplete = (files: PayloadMediaDocument[]) => {
    console.log('Uploaded files:', files)
    // Handle successful uploads
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
    // Handle errors
  }

  return (
    <PhotoUpload
      onUploadComplete={handleUploadComplete}
      onUploadError={handleUploadError}
      maxFiles={10}
      maxFileSize={10 * 1024 * 1024} // 10MB
      enableCamera={true}
      showPreviews={true}
    />
  )
}
```

## Component Props

```tsx
interface PhotoUploadComponentProps {
  // Event Handlers
  onUploadComplete?: (files: PayloadMediaDocument[]) => void
  onUploadProgress?: (progress: UploadProgress[]) => void  
  onUploadError?: (error: string, file?: PhotoUploadFile) => void

  // Configuration
  maxFiles?: number                // Default: 10
  maxFileSize?: number            // Default: 10MB in bytes
  acceptedFileTypes?: string[]    // Default: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  // UI Options
  className?: string              // Additional CSS classes
  disabled?: boolean             // Disable the component
  showPreviews?: boolean         // Show image previews (default: true)
  enableCamera?: boolean         // Enable camera capture (default: true)
}
```

## Advanced Configuration

### Custom File Validation

```tsx
<PhotoUpload
  maxFiles={5}
  maxFileSize={5 * 1024 * 1024} // 5MB
  acceptedFileTypes={['image/jpeg', 'image/png']}
  onUploadError={(error, file) => {
    if (file) {
      console.log(`Error with file ${file.name}: ${error}`)
    }
  }}
/>
```

### Progress Tracking

```tsx
function UploadWithProgress() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])

  return (
    <PhotoUpload
      onUploadProgress={setUploadProgress}
      onUploadComplete={(files) => {
        console.log(`Uploaded ${files.length} files successfully`)
      }}
    />
  )
}
```

### Custom Styling

```tsx
<PhotoUpload
  className="my-custom-upload-area"
  // Component uses Tailwind classes that can be customized
/>
```

## API Integration

The component expects an API endpoint at `/api/upload/photos` that:

1. Accepts `FormData` with `files` field
2. Returns `{ success: true, files: PayloadMediaDocument[] }`
3. Handles errors with `{ error: string }` response

Example API route structure:
```
src/app/(payload)/api/upload/photos/route.ts
```

## PayloadCMS Setup

Ensure your Media collection includes these fields:

```typescript
// collections/Media.ts
export const Media: CollectionConfig = {
  slug: 'media',
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'cloudinary_public_id', 
      type: 'text',
    },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text' }],
    },
  ],
  upload: true,
}
```

## Components Structure

```
src/components/upload/
├── PhotoUpload.tsx          # Main upload component
├── PhotoPreview.tsx         # Individual file preview
├── ProgressBar.tsx          # Upload progress indicator  
├── CameraCapture.tsx        # Mobile camera interface
├── types.ts                 # TypeScript definitions
├── index.ts                 # Exports
└── README.md               # This documentation
```

## Mobile Camera Usage

The camera feature requires HTTPS in production and asks for camera permissions. It provides:

- Front/back camera switching
- Touch capture interface
- Grid overlay for better composition
- High-resolution photo capture
- Automatic file naming with timestamps

## Error Handling

The component handles various error scenarios:

- **File too large** - Shows size limit message
- **Invalid file type** - Lists accepted formats
- **Too many files** - Indicates file count limit
- **Camera not supported** - Fallback to file selection
- **Upload failures** - Network or server errors
- **Permission denied** - Camera access issues

## Accessibility Features

- **Keyboard Navigation** - Full keyboard support
- **Screen Reader** - ARIA labels and descriptions
- **Focus Management** - Proper focus indicators
- **Color Contrast** - WCAG AA compliant colors
- **Error Announcements** - Screen reader error notifications

## Browser Support

- **Modern Browsers** - Chrome, Firefox, Safari, Edge
- **Mobile Browsers** - iOS Safari, Chrome Mobile
- **Camera API** - Modern browsers with getUserMedia support
- **Drag & Drop** - All modern browsers

## Troubleshooting

### Camera Not Working
- Ensure HTTPS in production
- Check browser permissions
- Verify getUserMedia API support

### Upload Failures
- Check API endpoint configuration
- Verify PayloadCMS setup
- Review file size and type limits
- Check network connectivity

### Styling Issues
- Ensure Tailwind CSS is configured
- Check for CSS conflicts
- Verify dark mode setup

## Demo

Visit `/upload-demo` to see the component in action with all features enabled.

## License

This component is part of the Arcade Tracker project and follows the project's MIT license.