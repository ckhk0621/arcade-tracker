import React from 'react'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/ui/ThemeProvider'

export const metadata = {
  description: '冒險樂園搜尋器 - 尋找及追蹤冒險樂園位置，並提供照片集。',
  title: '冒險樂園搜尋器',
  manifest: '/manifest.json',
  keywords: ['遊戲機', '電動', '娛樂', '遊戲', '位置', '搜尋器'],
  authors: [{ name: '冒險樂園搜尋器' }],
  creator: '冒險樂園搜尋器',
  publisher: '冒險樂園搜尋器',
  robots: 'index, follow',
  openGraph: {
    title: '冒險樂園搜尋器',
    description: '尋找及追蹤冒險樂園位置，並提供照片集。',
    type: 'website',
    locale: 'zh_HK',
  },
  twitter: {
    card: 'summary_large_image',
    title: '冒險樂園搜尋器',
    description: '尋找及追蹤冒險樂園位置，並提供照片集。',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '冒險樂園搜尋器',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="zh-HK" className="h-full" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#3B82F6" suppressHydrationWarning />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="冒險樂園搜尋器" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="h-full antialiased">
        <ThemeProvider defaultTheme="system" storageKey="arcade-tracker-theme">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
