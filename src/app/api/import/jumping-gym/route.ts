import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@/payload.config'
import fs from 'fs/promises'
import path from 'path'

/**
 * POST /api/import/jumping-gym
 * Import Jumping Gym store locations into PayloadCMS
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayloadHMR({
      config: configPromise,
    })

    // Check if user is authenticated and is admin
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token') || req.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify admin access
    try {
      const user = await (payload as any).verifyToken(token)
      if (!user || user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Read the processed data file
    const dataPath = path.join(process.cwd(), 'data', 'jumping-gym-payload.json')
    
    let storeData: any[]
    try {
      const fileContent = await fs.readFile(dataPath, 'utf8')
      storeData = JSON.parse(fileContent)
    } catch (error) {
      return NextResponse.json(
        { error: 'Store data file not found. Please run the data processor first.' },
        { status: 404 }
      )
    }

    const results = {
      imported: 0,
      updated: 0,
      errors: 0,
      details: [] as any[]
    }

    // Process each store
    for (const storeInfo of storeData) {
      try {
        // Check if store already exists (by name and address)
        const existingStores = await payload.find({
          collection: 'stores',
          where: {
            and: [
              {
                name: {
                  equals: storeInfo.name
                }
              },
              {
                address: {
                  equals: storeInfo.address
                }
              }
            ]
          },
          limit: 1
        })

        if (existingStores.docs.length > 0) {
          // Update existing store
          const existingStore = existingStores.docs[0]
          await payload.update({
            collection: 'stores',
            id: existingStore.id,
            data: {
              ...storeInfo,
              // Preserve existing analytics and user-generated content
              analytics: existingStore.analytics || storeInfo.analytics,
              images: existingStore.images || [],
              popularity: existingStore.popularity || 0
            }
          })
          
          results.updated++
          results.details.push({
            action: 'updated',
            name: storeInfo.name,
            id: existingStore.id
          })
        } else {
          // Create new store
          const newStore = await payload.create({
            collection: 'stores',
            data: storeInfo
          })
          
          results.imported++
          results.details.push({
            action: 'created',
            name: storeInfo.name,
            id: newStore.id
          })
        }
      } catch (error) {
        console.error(`Error processing store ${storeInfo.name}:`, error)
        results.errors++
        results.details.push({
          action: 'error',
          name: storeInfo.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${results.imported} imported, ${results.updated} updated, ${results.errors} errors`,
      results
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { 
        error: 'Import failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/import/jumping-gym
 * Get import status and preview data
 */
export async function GET(req: NextRequest) {
  try {
    // Read the processed data file
    const dataPath = path.join(process.cwd(), 'data', 'jumping-gym-payload.json')
    
    let storeData: any[]
    let fileExists = false
    
    try {
      const fileContent = await fs.readFile(dataPath, 'utf8')
      storeData = JSON.parse(fileContent)
      fileExists = true
    } catch (error) {
      storeData = []
    }

    const payload = await getPayloadHMR({
      config: configPromise,
    })

    // Count existing Jumping Gym stores
    const existingStores = await payload.find({
      collection: 'stores',
      where: {
        or: [
          {
            'contact.website': {
              contains: 'jumpingym.com'
            }
          },
          {
            tags: {
              contains: '{"tag":"trampoline"}'
            }
          }
        ]
      },
      limit: 100
    })

    return NextResponse.json({
      dataFileExists: fileExists,
      storesInFile: storeData.length,
      existingJumpingGymStores: existingStores.totalDocs,
      preview: storeData.slice(0, 3), // First 3 stores as preview
      existingStoreNames: existingStores.docs.map(store => store.name)
    })

  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get import status', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}