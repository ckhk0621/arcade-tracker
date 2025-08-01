import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import StoreLocatorWrapper from './StoreLocatorWrapper'
import './styles.css'

async function getStores() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  
  try {
    const stores = await payload.find({
      collection: 'stores',
      limit: 1000,
      where: {
        status: {
          equals: 'active'
        }
      },
      sort: '-popularity'
    })
    
    return stores.docs
  } catch (error) {
    console.error('Error fetching stores:', error)
    return []
  }
}

export default async function HomePage() {
  const stores = await getStores()

  return (
    <div className="h-screen">
      <StoreLocatorWrapper initialStores={stores} />
    </div>
  )
}
