import React from 'react'
import { PhotoGallery } from '@/components/gallery'
import { ThemeProvider, ThemeToggle } from '@/components/ui/ThemeProvider'
import { getStores as _getStores, convertStoreImagesToPhotoItems as _convertStoreImagesToPhotoItems } from '@/lib/payload'
import { PhotoItem } from '@/components/gallery/types'

// Mock data for demonstration - replace with real data from PayloadCMS
const mockPhotos: PhotoItem[] = [
  {
    id: '1',
    image: {
      id: '1',
      url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop',
      alt: 'Classic arcade machine with colorful lights',
      width: 800,
      height: 600,
      thumbnailURL: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=225&fit=crop',
      filename: 'arcade-1.jpg',
      mimeType: 'image/jpeg',
      filesize: 156000,
      focalX: 50,
      focalY: 50,
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    alt: 'Classic arcade machine with colorful lights',
    caption: 'Vintage arcade machine in pristine condition',
  },
  {
    id: '2',
    image: {
      id: '2',
      url: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=800&h=600&fit=crop',
      alt: 'Retro gaming setup with multiple screens',
      width: 800,
      height: 600,
      thumbnailURL: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=300&h=225&fit=crop',
      filename: 'gaming-setup.jpg',
      mimeType: 'image/jpeg',
      filesize: 187000,
      focalX: 50,
      focalY: 50,
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    alt: 'Retro gaming setup with multiple screens',
    caption: 'Multi-screen retro gaming experience',
  },
  {
    id: '3',
    image: {
      id: '3',
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop',
      alt: 'Neon-lit arcade interior',
      width: 800,
      height: 600,
      thumbnailURL: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=225&fit=crop',
      filename: 'neon-arcade.jpg',
      mimeType: 'image/jpeg',
      filesize: 234000,
      focalX: 50,
      focalY: 50,
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    alt: 'Neon-lit arcade interior',
    caption: 'Atmospheric neon lighting creates the perfect gaming mood',
  },
  {
    id: '4',
    image: {
      id: '4',
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      alt: 'Fighting game tournament setup',
      width: 800,
      height: 600,
      thumbnailURL: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=225&fit=crop',
      filename: 'tournament.jpg',
      mimeType: 'image/jpeg',
      filesize: 198000,
      focalX: 50,
      focalY: 50,
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    alt: 'Fighting game tournament setup',
    caption: 'Professional tournament setup for competitive gaming',
  },
  {
    id: '5',
    image: {
      id: '5',
      url: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=600&fit=crop',
      alt: 'Classic pinball machines in a row',
      width: 800,
      height: 600,
      thumbnailURL: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=300&h=225&fit=crop',
      filename: 'pinball.jpg',
      mimeType: 'image/jpeg',
      filesize: 176000,
      focalX: 50,
      focalY: 50,
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    alt: 'Classic pinball machines in a row',
    caption: 'Collection of vintage pinball machines',
  },
  {
    id: '6',
    image: {
      id: '6',
      url: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=800&h=600&fit=crop',
      alt: 'Pac-Man arcade cabinet',
      width: 800,
      height: 600,
      thumbnailURL: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=300&h=225&fit=crop',
      filename: 'pacman.jpg',
      mimeType: 'image/jpeg',
      filesize: 145000,
      focalX: 50,
      focalY: 50,
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    alt: 'Pac-Man arcade cabinet',
    caption: 'The iconic Pac-Man arcade game',
  },
]

const mockStore = {
  id: 'demo-store',
  name: 'Retro Gaming Palace',
  description: 'The ultimate destination for classic arcade gaming experiences',
  address: '123 Gaming Street, Arcade City',
  location: [-122.4194, 37.7749] as [number, number],
  category: 'arcade' as const,
  images: [],
  openingHours: {
    monday: '10:00-22:00',
    tuesday: '10:00-22:00',
    wednesday: '10:00-22:00',
    thursday: '10:00-22:00',
    friday: '10:00-24:00',
    saturday: '10:00-24:00',
    sunday: '12:00-20:00',
  },
  updatedAt: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
}

export default async function GalleryPage() {
  // In a real application, you would fetch data from PayloadCMS:
  // const stores = await getStores()
  // const photos = stores.length > 0 ? convertStoreImagesToPhotoItems(stores[0]) : []

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Arcade Tracker
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Photo Gallery Demo
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Gallery Section */}
          <section className="mb-12">
            <PhotoGallery
              photos={mockPhotos}
              store={mockStore}
              columns={{
                mobile: 1,
                tablet: 2,
                desktop: 3,
              }}
              lazyLoading={true}
            />
          </section>

          {/* Feature Overview */}
          <section className="mt-16 bg-gray-50 dark:bg-gray-800 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
              Gallery Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Next.js Image Optimization
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Lazy loading, responsive images, and automatic optimization for better performance
                </p>
              </div>

              <div className="text-center">
                <div className="bg-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Mobile-First Design
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Responsive grid layout with touch gestures and mobile-optimized interactions
                </p>
              </div>

              <div className="text-center">
                <div className="bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Lightbox Modal
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Full-screen image viewing with keyboard navigation and touch gestures
                </p>
              </div>

              <div className="text-center">
                <div className="bg-neutral/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-neutral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Accessibility First
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  WCAG 2.1 compliant with ARIA labels, keyboard navigation, and screen reader support
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Dark Mode Support
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  System-aware dark mode with smooth transitions and proper contrast ratios
                </p>
              </div>

              <div className="text-center">
                <div className="bg-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Performance Optimized
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Skeleton loading states, lazy loading, and optimized rendering for fast load times
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>&copy; 2024 Arcade Tracker. Responsive Photo Gallery Demo.</p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}