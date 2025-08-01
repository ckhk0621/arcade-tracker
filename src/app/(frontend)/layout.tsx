import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Arcade Tracker - Find and track arcade locations with photo galleries.',
  title: 'Arcade Tracker',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="h-full antialiased">
        {children}
      </body>
    </html>
  )
}
