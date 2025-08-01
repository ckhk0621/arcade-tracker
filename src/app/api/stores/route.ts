import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

import config from '@/payload.config'

// Type for the region mapping keys
type RegionMappingKey = keyof typeof REGION_MAPPING

// Region mapping with proper typing
const REGION_MAPPING = {
  '太古': 'hong-kong-island',
  '北角': 'hong-kong-island', 
  '小西灣': 'hong-kong-island',
  '銅鑼灣': 'hong-kong-island',
  '黃竹坑': 'hong-kong-island',
  '黃埔': 'kowloon',
  '尖沙咀': 'kowloon',
  '旺角': 'kowloon',
  '長沙灣': 'kowloon',
  '觀塘': 'kowloon',
  '九龍灣': 'kowloon',
  '將軍澳': 'new-territories',
  '荃灣': 'new-territories',
  '屯門': 'new-territories',
  '沙田': 'new-territories',
  '元朗': 'new-territories',
  '大埔': 'new-territories',
  '上水': 'new-territories',
  '粉嶺': 'new-territories',
  '東涌': 'new-territories'
} as const

// Type for imported store data from JSON
interface ImportedStoreData {
  name: string
  city?: string | null
  region?: string
  status?: 'active' | 'temp_closed' | 'closed' | 'coming_soon'
  [key: string]: any // Allow other properties from JSON
}

// Type guard to check if a string is a valid region mapping key
function isValidRegionKey(key: string): key is RegionMappingKey {
  return key in REGION_MAPPING
}

export async function GET(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '1000')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
    // Build where clause
    const where: Record<string, any> = {
      status: {
        equals: 'active'
      }
    }
    
    if (category && category !== 'all') {
      where.category = {
        equals: category
      }
    }
    
    if (search) {
      where.or = [
        {
          name: {
            contains: search
          }
        },
        {
          address: {
            contains: search
          }
        },
        {
          city: {
            contains: search
          }
        }
      ]
    }
    
    const stores = await payload.find({
      collection: 'stores',
      limit,
      where,
      sort: '-popularity'
    })
    
    return NextResponse.json(stores)
  } catch (error) {
    console.error('Error fetching stores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, secret } = await request.json()
    
    // Verify secret for admin operations
    if (secret !== process.env.PAYLOAD_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    
    if (action === 'import-jumping-gym') {
      // Import the complete JumpinGym dataset
      const fs = await import('fs')
      const path = await import('path')
      
      // Load the complete store data
      const dataPath = path.resolve(process.cwd(), 'data/jumping-gym-payload.json')
      const storeData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
      
      console.log(`Found ${storeData.length} stores to import`)
      
      const regionCounts: Record<'hong-kong-island' | 'kowloon' | 'new-territories', number> = {
        'hong-kong-island': 0,
        'kowloon': 0,
        'new-territories': 0
      }
      
      const results = []
      
      for (const store of storeData as ImportedStoreData[]) {
        try {
          // Assign region with proper type checking
          let region: 'hong-kong-island' | 'kowloon' | 'new-territories' = 'new-territories'
          
          if (store.city && typeof store.city === 'string' && isValidRegionKey(store.city)) {
            region = REGION_MAPPING[store.city]
          }
          
          store.region = region
          regionCounts[region]++
          
          // Set default status if not provided
          if (!store.status) {
            store.status = 'active'
          }
          
          // Create the store with proper typing
          const storeData = {
            ...store,
            status: store.status as 'active' | 'temp_closed' | 'closed' | 'coming_soon',
            region: region as 'hong-kong-island' | 'kowloon' | 'new-territories'
          }
          
          const createdStore = await payload.create({
            collection: 'stores',
            data: storeData
          })
          
          results.push({
            status: 'success',
            name: store.name,
            city: store.city,
            region: region
          })
          
          console.log(`Imported: ${store.name} (${store.city}) → ${region}`)
        } catch (error) {
          console.error(`Failed to import ${store.name}:`, error)
          results.push({
            status: 'error',
            name: store.name,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
      
      return NextResponse.json({
        message: 'Import completed',
        imported: results.filter(r => r.status === 'success').length,
        errors: results.filter(r => r.status === 'error').length,
        regionCounts,
        results
      })
    }
    
    if (action === 'fix-regions') {
      // Fix specific region assignments
      const fixes: Array<{
        name: string
        correctRegion: 'hong-kong-island' | 'kowloon' | 'new-territories'
      }> = [
        {
          name: '黃竹坑The Southside',
          correctRegion: 'hong-kong-island'
        },
        {
          name: '長沙灣西九龍中心', 
          correctRegion: 'kowloon'
        }
      ]
      
      const fixResults = []
      
      for (const fix of fixes) {
        try {
          // Find the store
          const stores = await payload.find({
            collection: 'stores',
            where: {
              name: {
                equals: fix.name
              }
            }
          })
          
          if (stores.docs.length > 0) {
            const store = stores.docs[0]
            
            // Update the region
            await payload.update({
              collection: 'stores',
              id: store.id,
              data: {
                region: fix.correctRegion
              }
            })
            
            fixResults.push({
              status: 'success',
              name: fix.name,
              oldRegion: store.region,
              newRegion: fix.correctRegion
            })
            
            console.log(`Fixed region for ${fix.name}: ${store.region} → ${fix.correctRegion}`)
          } else {
            fixResults.push({
              status: 'not_found',
              name: fix.name
            })
          }
        } catch (error) {
          console.error(`Failed to fix region for ${fix.name}:`, error)
          fixResults.push({
            status: 'error',
            name: fix.name,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
      
      return NextResponse.json({
        message: 'Region fixes completed',
        results: fixResults
      })
    }
    
    if (action === 'clear-all') {
      // Clear all existing stores
      const existingStores = await payload.find({
        collection: 'stores',
        limit: 1000
      })
      
      const deleteResults = []
      
      for (const store of existingStores.docs) {
        try {
          await payload.delete({
            collection: 'stores',
            id: store.id
          })
          
          deleteResults.push({
            status: 'deleted',
            name: store.name,
            id: store.id
          })
          
          console.log(`Deleted: ${store.name}`)
        } catch (error) {
          console.error(`Failed to delete store ${store.name}:`, error)
          deleteResults.push({
            status: 'error',
            name: store.name,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
      
      return NextResponse.json({
        message: 'Clear completed',
        deleted: deleteResults.filter(r => r.status === 'deleted').length,
        errors: deleteResults.filter(r => r.status === 'error').length,
        results: deleteResults
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Error in POST operation:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}