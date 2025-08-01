import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@/payload.config'

/**
 * POST /api/stores/update-regions
 * Update existing stores with region information based on location patterns
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

    // Regional mapping patterns based on common Hong Kong location names (English and Chinese)
    const regionPatterns = {
      'hong-kong-island': [
        // English names
        'Central', 'Admiralty', 'Wan Chai', 'Causeway Bay', 'Tin Hau', 'Fortress Hill',
        'North Point', 'Quarry Bay', 'Tai Koo', 'Sai Wan Ho', 'Shau Kei Wan', 'Chai Wan',
        'Mid-Levels', 'The Peak', 'Sheung Wan', 'Sai Ying Pun', 'Kennedy Town',
        'Aberdeen', 'Wong Chuk Hang', 'Ap Lei Chau', 'Stanley', 'Repulse Bay',
        'Pokfulam', 'Cyberport', 'Taikoo', 'Island East', 'Siu Sai Wan',
        // Chinese names
        '中環', '金鐘', '灣仔', '銅鑼灣', '天后', '炮台山', '北角', '鰂魚涌', '太古', '西灣河', '筲箕灣', '柴灣',
        '太古城', '小西灣', '利舞臺', '金百利', '波斯富街', '北角匯', '太古城中心'
      ],
      'kowloon': [
        // English names
        'Tsim Sha Tsui', 'Jordan', 'Yau Ma Tei', 'Mong Kok', 'Prince Edward',
        'Shek Kip Mei', 'Cheung Sha Wan', 'Sham Shui Po', 'Lai Chi Kok',
        'Hung Hom', 'Ho Man Tin', 'Kowloon Tong', 'Wong Tai Sin', 'Diamond Hill', 
        'Choi Hung', 'Kowloon Bay', 'Ngau Tau Kok', 'Kwun Tong', 'Lam Tin', 'Yau Tong', 
        'Lei Yue Mun', 'Whampoa', 'Olympic', 'Tai Kok Tsui',
        // Chinese names
        '尖沙咀', '佐敦', '油麻地', '旺角', '太子', '石硤尾', '大角咀', '奧運', '荔枝角', '長沙灣', '深水埗',
        '何文田', '紅磡', '土瓜灣', '馬頭圍', '啟德', '九龍灣', '牛頭角', '觀塘', '藍田', '油塘',
        '鑽石山', '彩虹', '九龍塘', '樂富', '黃大仙', '大磡', '新蒲崗',
        '黃埔', '海運', 'moko', 'olympian city', '朗豪坊', '德福廣場', 'K11 MUSEA', 'apm'
      ],
      'new-territories': [
        // English names
        'Sha Tin', 'Tai Wai', 'Ma On Shan', 'Fo Tan', 'University',
        'Tai Po', 'Fan Ling', 'Sheung Shui', 'Lo Wu', 'Lok Ma Chau',
        'Yuen Long', 'Tin Shui Wai', 'Tuen Mun', 'Tsing Yi', 'Ma Wan',
        'Tseung Kwan O', 'Sai Kung', 'Clear Water Bay', 'Hang Hau',
        'East Point City', 'PopCorn', 'LOHAS Park', 'Tiu Keng Leng', 'Tsuen Wan',
        // Chinese names
        '沙田', '大埔', '粉嶺', '上水', '大窩', '火炭', '大學', '馬場', '石門',
        '馬鞍山', '烏溪沙', '坑口', '將軍澳', '寶琳', '調景嶺',
        '荃灣', '葵涌', '青衣', '馬灣', '屯門', '元朗', '天水圍', '錦田',
        '大埔墟', '大埔滘', '船灣', '落馬洲', '文錦渡',
        '新都城', '東港城', '廣場', 'popcorn', '超級城', '新城市廣場', '市廣場', '愉景新城'
      ]
    }

    // Get all stores without region information
    const storesWithoutRegion = await payload.find({
      collection: 'stores',
      where: {
        or: [
          {
            region: {
              exists: false
            }
          },
          {
            region: {
              equals: null
            }
          },
          {
            region: {
              equals: ''
            }
          }
        ]
      },
      limit: 200
    })

    const results = {
      updated: 0,
      noMatch: 0,
      errors: 0,
      details: [] as any[],
      byRegion: {
        'hong-kong-island': 0,
        'kowloon': 0,
        'new-territories': 0
      }
    }

    // Process each store to determine region
    for (const store of storesWithoutRegion.docs) {
      try {
        let detectedRegion: string | null = null
        const searchText = `${store.name} ${store.address} ${store.city} ${store.state}`.toLowerCase()

        // Check against each region's patterns
        for (const [region, patterns] of Object.entries(regionPatterns)) {
          for (const pattern of patterns) {
            if (searchText.includes(pattern.toLowerCase())) {
              detectedRegion = region
              break
            }
          }
          if (detectedRegion) break
        }

        // Additional specific checks for ambiguous cases
        if (!detectedRegion) {
          // Check if it's likely Hong Kong Island based on MTR stations or landmarks
          if (searchText.includes('island') || searchText.includes('hk island')) {
            detectedRegion = 'hong-kong-island'
          }
          // Check for New Territories indicators
          else if (searchText.includes('new town') || searchText.includes('nt') || 
                   searchText.includes('new territories')) {
            detectedRegion = 'new-territories'
          }
          // Default to Kowloon for unmatched Hong Kong locations
          else if (searchText.includes('hong kong') || searchText.includes('hk')) {
            // Could be any region, leave as no match for manual review
          }
        }

        if (detectedRegion) {
          // Update the store with detected region
          await payload.update({
            collection: 'stores',
            id: store.id,
            data: {
              region: detectedRegion as 'hong-kong-island' | 'kowloon' | 'new-territories',
              country: 'HK', // Ensure Hong Kong country code
              state: detectedRegion === 'hong-kong-island' ? 'Hong Kong Island' :
                     detectedRegion === 'kowloon' ? 'Kowloon' : 'New Territories'
            }
          })

          results.updated++
          results.byRegion[detectedRegion as keyof typeof results.byRegion]++
          results.details.push({
            action: 'updated',
            name: store.name,
            address: store.address,
            detectedRegion,
            id: store.id
          })
        } else {
          results.noMatch++
          results.details.push({
            action: 'no_match',
            name: store.name,
            address: store.address,
            searchText: searchText.substring(0, 100), // Truncate for readability
            id: store.id
          })
        }

      } catch (error) {
        console.error(`Error processing store ${store.name}:`, error)
        results.errors++
        results.details.push({
          action: 'error',
          name: store.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          id: store.id
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Region update completed: ${results.updated} updated, ${results.noMatch} no match, ${results.errors} errors`,
      results,
      totalProcessed: storesWithoutRegion.totalDocs
    })

  } catch (error) {
    console.error('Region update error:', error)
    return NextResponse.json(
      { 
        error: 'Region update failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/stores/update-regions
 * Preview stores that need region updates
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayloadHMR({
      config: configPromise,
    })

    // Get stores without region information
    const storesWithoutRegion = await payload.find({
      collection: 'stores',
      where: {
        or: [
          {
            region: {
              exists: false
            }
          },
          {
            region: {
              equals: null
            }
          },
          {
            region: {
              equals: ''
            }
          }
        ]
      },
      limit: 10
    })

    // Get region distribution for existing stores
    const regionStats = {
      'hong-kong-island': 0,
      'kowloon': 0,
      'new-territories': 0,
      'no-region': storesWithoutRegion.totalDocs
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
    }

    return NextResponse.json({
      storesNeedingRegionUpdate: storesWithoutRegion.totalDocs,
      regionStats,
      preview: storesWithoutRegion.docs.map(store => ({
        id: store.id,
        name: store.name,
        address: store.address,
        city: store.city,
        state: store.state,
        currentRegion: store.region
      }))
    })

  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get region update preview', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}