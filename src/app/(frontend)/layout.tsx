import React from 'react'
import './styles.css'
import 'leaflet/dist/leaflet.css'

export const metadata = {
  description: 'Arcade Tracker - Find and track arcade locations with photo galleries.',
  title: 'Arcade Tracker',
  manifest: '/manifest.json',
  keywords: ['arcade', 'games', 'entertainment', 'gaming', 'locations', 'finder'],
  authors: [{ name: 'Arcade Tracker' }],
  creator: 'Arcade Tracker',
  publisher: 'Arcade Tracker',
  robots: 'index, follow',
  openGraph: {
    title: 'Arcade Tracker',
    description: 'Find and track arcade locations with photo galleries.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arcade Tracker',
    description: 'Find and track arcade locations with photo galleries.',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Arcade Tracker',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="theme-color" content="#3B82F6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Arcade Tracker" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="h-full antialiased">
        {children}
      </body>
    </html>
  )
}
