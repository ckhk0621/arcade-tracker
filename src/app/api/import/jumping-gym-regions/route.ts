import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@/payload.config'

/**
 * POST /api/import/jumping-gym-regions
 * Import JumpinGym store locations by region into PayloadCMS
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

    // Comprehensive store data from scraped JumpinGym regional pages
    const storesByRegion = {
      'hong-kong-island': [
        {
          name: 'JumpinGym Taikoo City Centre',
          address: 'Taikoo City Centre, Phase 2, Shop 103B',
          city: 'Hong Kong',
          state: 'Hong Kong Island',
          region: 'hong-kong-island',
          country: 'HK',
          description: 'JumpinGym trampoline park featuring Trampoline Maze and Party Venue facilities',
          category: 'entertainment',
          status: 'active',
          contact: {
            phone: '2560 0003',
            website: 'https://www.jumpingym.com'
          },
          openingHours: {
            monday: '10:30-22:00',
            tuesday: '10:30-22:00',
            wednesday: '10:30-22:00',
            thursday: '10:30-22:00',
            friday: '10:30-22:30',
            saturday: '10:00-22:30',
            sunday: '10:00-22:00',
            specialHours: 'Public Holidays: 10:00-22:00'
          },
          amenities: [
            { amenity: 'parties' },
            { amenity: 'groups' }
          ],
          tags: [
            { tag: 'trampoline' },
            { tag: 'family' },
            { tag: 'party-venue' }
          ]
        },
        {
          name: 'JumpinGym North Point H.N.',
          address: 'North Point H.N. Phase 2, 1/F, Shop 114-115',
          city: 'Hong Kong',
          state: 'Hong Kong Island',
          region: 'hong-kong-island',
          country: 'HK',
          description: 'JumpinGym trampoline park in North Point',
          category: 'entertainment',
          status: 'active',
          contact: {
            phone: '2730 9618',
            website: 'https://www.jumpingym.com'
          },
          openingHours: {
            monday: '11:00-22:00',
            tuesday: '11:00-22:00',
            wednesday: '11:00-22:00',
            thursday: '11:00-22:00',
            friday: '11:00-22:00',
            saturday: '10:30-22:30',
            sunday: '10:30-22:30',
            specialHours: 'Public Holidays: 10:30-22:30'
          },
          tags: [
            { tag: 'trampoline' },
            { tag: 'family' }
          ]
        },
        {
          name: 'JumpinGym Siu Sai Wan Blue Wave Plaza',
          address: 'Siu Sai Wan Blue Wave Plaza, 1/F, Shop 101B',
          city: 'Hong Kong',
          state: 'Hong Kong Island',
          region: 'hong-kong-island',
          country: 'HK',
          description: 'JumpinGym trampoline park in Siu Sai Wan',
          category: 'entertainment',
          status: 'active',
          contact: {
            phone: '2264 1433',
            website: 'https://www.jumpingym.com'
          },
          openingHours: {
            monday: '11:00-22:00',
            tuesday: '11:00-22:00',
            wednesday: '11:00-22:00',
            thursday: '11:00-22:00',
            friday: '11:00-22:00',
            saturday: '10:00-22:00',
            sunday: '10:00-22:00',
            specialHours: 'Public Holidays: 10:00-22:00'
          },
          tags: [
            { tag: 'trampoline' },
            { tag: 'family' }
          ]
        },
        {
          name: 'JumpinGym Causeway Bay Lee Theatre',
          address: '99 Percival Street, Lee Theatre 4/F, Causeway Bay',
          city: 'Hong Kong',
          state: 'Hong Kong Island',
          region: 'hong-kong-island',
          country: 'HK',
          description: 'JumpinGym trampoline park in Causeway Bay Lee Theatre',
          category: 'entertainment',
          status: 'active',
          contact: {
            phone: '2642 6166',
            website: 'https://www.jumpingym.com'
          },
          openingHours: {
            monday: '11:00-22:00',
            tuesday: '11:00-22:00',
            wednesday: '11:00-22:00',
            thursday: '11:00-22:00',
            friday: '11:00-22:00',
            saturday: '10:30-22:00',
            sunday: '10:30-22:00',
            specialHours: 'Public Holidays: 10:30-22:00'
          },
          tags: [
            { tag: 'trampoline' },
            { tag: 'family' }
          ]
        },
        {
          name: 'JumpinGym Causeway Bay Goldmark',
          address: '1 George Street, Goldmark Basement 1/F and 2/F, Causeway Bay',
          city: 'Hong Kong',
          state: 'Hong Kong Island',
          region: 'hong-kong-island',
          country: 'HK',
          description: 'JumpinGym trampoline park in Causeway Bay Goldmark',
          category: 'entertainment',
          status: 'active',
          contact: {
            website: 'https://www.jumpingym.com'
          },
          openingHours: {
            monday: '12:00-23:00',
            tuesday: '12:00-23:00',
            wednesday: '12:00-23:00',
            thursday: '12:00-23:00',
            friday: '12:00-23:30',
            saturday: '11:30-23:30',
            sunday: '11:30-23:00'
          },
          tags: [
            { tag: 'trampoline' },
            { tag: 'family' }
          ]
        }
      ],
      'kowloon': [
        {
          name: 'JumpinGym Whampoa Garden',
          address: 'Basement, Phase 11 Whampoa Garden',
          city: 'Hong Kong',
          state: 'Kowloon',
          region: 'kowloon',
          country: 'HK',
          description: 'JumpinGym trampoline park featuring Trampoline Maze and Party Venue facilities',
          category: 'entertainment',
          status: 'active',
          contact: {
            phone: '2362 3855',
            website: 'https://www.jumpingym.com'
          },
          openingHours: {
            monday: '11:00-22:00',
            tuesday: '11:00-22:00',
            wednesday: '11:00-22:00',
            thursday: '11:00-22:00',
            friday: '11:00-22:30',
            saturday: '10:00-22:30',
            sunday: '10:00-22:00',
            specialHours: 'Public Holidays: 10:00-22:30'
          },
          amenities: [
            { amenity: 'parties' },
            { amenity: 'groups' }
          ],
          tags: [
            { tag: 'trampoline' },
            { tag: 'family' },
            { tag: 'party-venue' }
          ]
        },
        {
          name: 'JumpinGym Tsim Sha Tsui Maritime Square',
          address: 'Ground Floor, OT G11, Maritime Square, Tsim Sha Tsui',
          city: 'Hong Kong',
          state: 'Kowloon',
          region: 'kowloon',
          country: 'HK',
          description: 'JumpinGym trampoline park in Tsim Sha Tsui',
          category: 'entertainment',
          status: 'active',
          contact: {
            phone: '2377 9551',
            website: 'https://www.jumpingym.com'
          },
          openingHours: {
            monday: '10:00-22:00',
            tuesday: '10:00-22:00',
            wednesday: '10:00-22:00',
            thursday: '10:00-22:00',
            friday: '10:00-22:30',
            saturday: '10:00-22:30',
            sunday: '10:00-22:00',
            specialHours: 'Public Holidays: 10:00-22:00'
          },
          tags: [
            { tag: 'trampoline' },
            { tag: 'family' }
          ]
        }
      ],
      'new-territories': [
        {
          name: 'JumpinGym Tseung Kwan O New Town Phase 2',
          address: '1st Floor, Shop 1046-47, Tseung Kwan O New Town Phase 2',
          city: 'Hong Kong',
          state: 'New Territories',
          region: 'new-territories',
          country: 'HK',
          description: 'JumpinGym trampoline park in Tseung Kwan O',
          category: 'entertainment',
          status: 'active',
          contact: {
            phone: '2519 3266',
            website: 'https://www.jumpingym.com'
          },
          openingHours: {
            monday: '11:00-22:00',
            tuesday: '11:00-22:00',
            wednesday: '11:00-22:00',
            thursday: '11:00-22:00',
            friday: '11:00-22:00',
            saturday: '10:30-22:00',
            sunday: '10:30-22:00',
            specialHours: 'Holidays: 10:30-22:00'
          },
          tags: [
            { tag: 'trampoline' },
            { tag: 'family' }
          ]
        },
        {
          name: 'JumpinGym Tseung Kwan O Plaza',
          address: '1st Floor, Shop 1-082 to 084, Tseung Kwan O Plaza',
          city: 'Hong Kong',
          state: 'New Territories',
          region: 'new-territories',
          country: 'HK',
          description: 'JumpinGym trampoline park in Tseung Kwan O Plaza',
          category: 'entertainment',
          status: 'active',
          contact: {
            phone: '2407 2611',
            website: 'https://www.jumpingym.com'
          },
          openingHours: {
            monday: '11:00-22:00',
            tuesday: '11:00-22:00',
            wednesday: '11:00-22:00',
            thursday: '11:00-22:00',
            friday: '10:00-22:00',
            saturday: '10:00-22:00',
            sunday: '10:00-22:00',
            specialHours: 'Holidays: 10:00-22:00'
          },
          tags: [
            { tag: 'trampoline' },
            { tag: 'family' }
          ]
        },
        {
          name: 'JumpinGym East Point City',
          address: '2nd Floor, Shops 237A & 237B, East Point City',
          city: 'Hong Kong',
          state: 'New Territories',
          region: 'new-territories',
          country: 'HK',
          description: 'JumpinGym trampoline park in East Point City',
          category: 'entertainment',
          status: 'active',
          contact: {
            phone: '2387 9170',
            website: 'https://www.jumpingym.com'
          },
          openingHours: {
            monday: '11:00-22:00',
            tuesday: '11:00-22:00',
            wednesday: '11:00-22:00',
            thursday: '11:00-22:00',
            friday: '10:00-22:00',
            saturday: '10:00-22:00',
            sunday: '10:00-22:00',
            specialHours: 'Holidays: 10:00-22:00'
          },
          tags: [
            { tag: 'trampoline' },
            { tag: 'family' }
          ]
        }
      ]
    }

    // Flatten all stores into a single array
    const allStores = [
      ...storesByRegion['hong-kong-island'],
      ...storesByRegion['kowloon'],
      ...storesByRegion['new-territories']
    ]

    const results = {
      imported: 0,
      updated: 0,
      errors: 0,
      details: [] as any[],
      byRegion: {
        'hong-kong-island': { imported: 0, updated: 0, errors: 0 },
        'kowloon': { imported: 0, updated: 0, errors: 0 },
        'new-territories': { imported: 0, updated: 0, errors: 0 }
      }
    }

    // Process each store
    for (const storeInfo of allStores) {
      try {
        // Check if store already exists (by name and region)
        const existingStores = await payload.find({
          collection: 'stores',
          where: {
            and: [
              {
                name: {
                  contains: storeInfo.name.replace('JumpinGym ', '')
                }
              },
              {
                region: {
                  equals: storeInfo.region
                }
              }
            ]
          },
          limit: 1
        })

        const regionKey = storeInfo.region as keyof typeof results.byRegion

        if (existingStores.docs.length > 0) {
          // Update existing store with region and other details
          const existingStore = existingStores.docs[0]
          await payload.update({
            collection: 'stores',
            id: existingStore.id,
            data: {
              ...storeInfo,
              // Preserve existing analytics and user-generated content
              analytics: existingStore.analytics || {
                views: 0,
                photoCount: 0,
                checkIns: 0,
                averageRating: 0,
                totalRatings: 0,
                machineCount: 0
              },
              images: existingStore.images || [],
              popularity: existingStore.popularity || 0
            }
          })
          
          results.updated++
          results.byRegion[regionKey].updated++
          results.details.push({
            action: 'updated',
            name: storeInfo.name,
            region: storeInfo.region,
            id: existingStore.id
          })
        } else {
          // Create new store
          const newStore = await payload.create({
            collection: 'stores',
            data: {
              ...storeInfo,
              analytics: {
                views: 0,
                photoCount: 0,
                checkIns: 0,
                averageRating: 0,
                totalRatings: 0,
                machineCount: 0
              },
              popularity: 0
            }
          })
          
          results.imported++
          results.byRegion[regionKey].imported++
          results.details.push({
            action: 'created',
            name: storeInfo.name,
            region: storeInfo.region,
            id: newStore.id
          })
        }
      } catch (error) {
        console.error(`Error processing store ${storeInfo.name}:`, error)
        results.errors++
        const regionKey = storeInfo.region as keyof typeof results.byRegion
        results.byRegion[regionKey].errors++
        results.details.push({
          action: 'error',
          name: storeInfo.name,
          region: storeInfo.region,
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
 * GET /api/import/jumping-gym-regions
 * Get import status and preview regional data
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayloadHMR({
      config: configPromise,
    })

    // Count existing stores by region
    const regionStats = {
      'hong-kong-island': 0,
      'kowloon': 0,
      'new-territories': 0,
      'total': 0
    }

    for (const region of ['hong-kong-island', 'kowloon', 'new-territories']) {
      const stores = await payload.find({
        collection: 'stores',
        where: {
          region: {
            equals: region
          }
        },
        limit: 1
      })
      regionStats[region as keyof typeof regionStats] = stores.totalDocs
      regionStats.total += stores.totalDocs
    }

    // Count JumpinGym stores specifically
    const jumpinGymStores = await payload.find({
      collection: 'stores',
      where: {
        or: [
          {
            name: {
              contains: 'JumpinGym'
            }
          },
          {
            'contact.website': {
              contains: 'jumpingym.com'
            }
          }
        ]
      },
      limit: 100
    })

    return NextResponse.json({
      regionStats,
      existingJumpinGymStores: jumpinGymStores.totalDocs,
      storesReady: {
        'hong-kong-island': 5,
        'kowloon': 2,
        'new-territories': 3,
        'total': 10
      },
      preview: {
        'hong-kong-island': ['JumpinGym Taikoo City Centre', 'JumpinGym North Point H.N.', 'JumpinGym Siu Sai Wan Blue Wave Plaza'],
        'kowloon': ['JumpinGym Whampoa Garden', 'JumpinGym Tsim Sha Tsui Maritime Square'],
        'new-territories': ['JumpinGym Tseung Kwan O New Town Phase 2', 'JumpinGym Tseung Kwan O Plaza', 'JumpinGym East Point City']
      }
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