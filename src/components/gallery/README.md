# Photo Gallery Component

A responsive, accessible photo gallery component built with Next.js, Tailwind CSS, and TypeScript. Optimized for performance with lazy loading, skeleton states, and mobile-first design.

## Features

- ✅ **Responsive Grid Layout** - Mobile-first design with customizable breakpoints
- ✅ **Next.js Image Optimization** - Automatic image optimization and lazy loading
- ✅ **Lightbox Modal** - Full-screen image viewing with navigation
- ✅ **Dark Mode Support** - System-aware dark mode with smooth transitions
- ✅ **Accessibility First** - WCAG 2.1 compliant with keyboard navigation
- ✅ **Touch Gestures** - Mobile swipe navigation in lightbox
- ✅ **Loading States** - Skeleton loaders and progressive image loading
- ✅ **PayloadCMS Integration** - Built for PayloadCMS Media collection

## Components

### PhotoGallery

Main gallery component that displays photos in a responsive grid.

```tsx
import { PhotoGallery } from '@/components/gallery'

<PhotoGallery
  photos={photos}
  store={store}
  columns={{
    mobile: 1,
    tablet: 2,
    desktop: 3,
  }}
  lazyLoading={true}
  onPhotoClick={(photo, index) => console.log('Photo clicked:', photo)}
/>
```

**Props:**
- `photos: PhotoItem[]` - Array of photo items to display
- `store?: Store` - Optional store information for context
- `columns?` - Grid columns for different breakpoints (default: mobile: 1, tablet: 2, desktop: 3)
- `onPhotoClick?` - Callback when photo is clicked
- `loading?: boolean` - Show loading state
- `lazyLoading?: boolean` - Enable lazy loading (default: true)
- `className?: string` - Additional CSS classes

### PhotoItem

Individual photo component with hover effects and optimization.

```tsx
import { PhotoItem } from '@/components/gallery'

<PhotoItem
  photo={photo}
  index={index}
  onClick={handleClick}
  priority={false}
  lazyLoading={true}
/>
```

**Props:**
- `photo: PhotoItem` - Photo data
- `index: number` - Photo index
- `onClick?` - Click handler
- `priority?: boolean` - Load image with priority (default: false)
- `lazyLoading?: boolean` - Enable lazy loading (default: true)
- `sizes?: string` - Responsive image sizes
- `className?: string` - Additional CSS classes

### Lightbox

Full-screen modal for viewing images with navigation.

```tsx
import { Lightbox } from '@/components/gallery'

<Lightbox
  photos={photos}
  currentIndex={currentIndex}
  isOpen={isOpen}
  onClose={handleClose}
  onNext={handleNext}
  onPrevious={handlePrevious}
/>
```

**Props:**
- `photos: PhotoItem[]` - Array of photos
- `currentIndex: number` - Current photo index
- `isOpen: boolean` - Modal open state
- `onClose: () => void` - Close handler
- `onNext: () => void` - Next photo handler
- `onPrevious: () => void` - Previous photo handler
- `className?: string` - Additional CSS classes

### SkeletonLoader

Loading skeleton for gallery items.

```tsx
import { SkeletonLoader } from '@/components/ui'

<SkeletonLoader
  count={6}
  columns={{
    mobile: 1,
    tablet: 2,
    desktop: 3,
  }}
/>
```

## Usage with PayloadCMS

### 1. Setup Store Images

```tsx
import { getStore, convertStoreImagesToPhotoItems } from '@/lib/payload'

export default async function StorePage({ params }: { params: { id: string } }) {
  const store = await getStore(params.id)
  const photos = store ? convertStoreImagesToPhotoItems(store) : []

  return (
    <PhotoGallery
      photos={photos}
      store={store}
      columns={{
        mobile: 1,
        tablet: 2,
        desktop: 3,
      }}
    />
  )
}
```

### 2. Setup Media Gallery

```tsx
import { getMediaItems, convertMediaToPhotoItems } from '@/lib/payload'

export default async function MediaPage() {
  const mediaItems = await getMediaItems()
  const photos = convertMediaToPhotoItems(mediaItems)

  return (
    <PhotoGallery
      photos={photos}
      columns={{
        mobile: 2,
        tablet: 3,
        desktop: 4,
      }}
    />
  )
}
```

## Dark Mode Setup

Wrap your app with the ThemeProvider:

```tsx
import { ThemeProvider, ThemeToggle } from '@/components/ui'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <header>
            <ThemeToggle />
          </header>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## Accessibility Features

- **Keyboard Navigation**: Tab to navigate, Enter/Space to open lightbox
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Visible focus indicators and logical tab order
- **Color Contrast**: WCAG 2.1 compliant contrast ratios
- **Responsive Text**: Text scales appropriately on all devices

## Performance Optimizations

- **Lazy Loading**: Images load only when needed
- **Image Optimization**: Next.js automatic optimization
- **Skeleton Loading**: Smooth loading experience
- **Responsive Images**: Multiple sizes for different devices
- **Priority Loading**: First 4 images load with priority
- **Code Splitting**: Components load only when needed

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Chrome Mobile, Samsung Internet
- **Accessibility**: NVDA, JAWS, VoiceOver screen readers

## File Structure

```
src/components/gallery/
├── PhotoGallery.tsx     # Main gallery component
├── PhotoItem.tsx        # Individual photo component
├── Lightbox.tsx         # Modal lightbox component
├── types.ts            # TypeScript interfaces
├── index.ts            # Component exports
└── README.md           # This documentation

src/components/ui/
├── SkeletonLoader.tsx  # Loading skeleton component
├── ThemeProvider.tsx   # Dark mode provider
└── index.ts           # UI component exports

src/lib/
└── payload.ts         # PayloadCMS integration utilities
```

## Demo

Visit `/gallery` to see the photo gallery component in action with sample images and full functionality demonstration.