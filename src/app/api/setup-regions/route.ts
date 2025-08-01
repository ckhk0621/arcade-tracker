import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextRequest, NextResponse } from 'next/server'

// Region mapping based on Hong Kong geography
const regionMappings = {
  'hong-kong-island': [
    'central', 'admiralty', 'wan chai', 'causeway bay', 'tin hau', 'fortress hill', 'north point', 'quarry bay', 'tai koo', 'sai wan ho', 'shau kei wan', 'chai wan',
    '中環', '金鐘', '灣仔', '銅鑼灣', '天后', '炮台山', '北角', '鰂魚涌', '太古', '西灣河', '筲箕灣', '柴灣',
    '太古城', '小西灣', '利舞臺', '金百利', '波斯富街'
  ],
  'kowloon': [
    'tsim sha tsui', 'jordan', 'yau ma tei', 'mong kok', 'prince edward', 'shek kip mei', 'tai kok tsui', 'olympic', 'lai chi kok', 'cheung sha wan', 'sham shui po',
    'ho man tin', 'hung hom', 'to kwa wan', 'ma tau wai', 'kai tak', 'kowloon bay', 'ngau tau kok', 'kwun tong', 'lam tin', 'yau tong',
    'diamond hill', 'choi hung', 'kowloon tong', 'lok fu', 'wong tai sin', 'tai hom', 'san po kong',
    '尖沙咀', '佐敦', '油麻地', '旺角', '太子', '石硤尾', '大角咀', '奧運', '荔枝角', '長沙灣', '深水埗',
    '何文田', '紅磡', '土瓜灣', '馬頭圍', '啟德', '九龍灣', '牛頭角', '觀塘', '藍田', '油塘',
    '鑽石山', '彩虹', '九龍塘', '樂富', '黃大仙', '大磡', '新蒲崗',
    '黃埔', '海運', 'moko', 'olympian city'
  ],
  'new-territories': [
    'sha tin', 'tai po', 'fanling', 'sheung shui', 'tai wo', 'fo tan', 'university', 'racecourse', 'shek mun',
    'ma on shan', 'wu kai sha', 'hang hau', 'tseung kwan o', 'po lam', 'tiu keng leng',
    'tsuen wan', 'kwai chung', 'tsing yi', 'ma wan', 'tuen mun', 'yuen long', 'tin shui wai', 'kam tin',
    'tai po market', 'tai po kau', 'plover cove', 'lok ma chau', 'man kam to',
    '沙田', '大埔', '粉嶺', '上水', '大窩', '火炭', '大學', '馬場', '石門',
    '馬鞍山', '烏溪沙', '坑口', '將軍澳', '寶琳', '調景嶺',
    '荃灣', '葵涌', '青衣', '馬灣', '屯門', '元朗', '天水圍', '錦田',
    '大埔墟', '大埔滘', '船灣', '落馬洲', '文錦渡',
    '新都城', '東港城', '廣場', 'popcorn'
  ]
}

// Jumping Gym stores data
const jumpingGymStores = [
  // Hong Kong Island
  {
    name: 'Jumping Gym - Taikoo City Centre',
    address: '太古城中心第二期103B舖',
    region: 'hong-kong-island',
    city: 'Hong Kong',
    state: 'Hong Kong SAR',
    country: 'HK',
    category: 'family',
    status: 'active',
    contact: {
      phone: '25600003',
      website: 'https://www.jumpingym.com'
    },
    openingHours: {
      monday: '10:30-22:00',
      tuesday: '10:30-22:00',
      wednesday: '10:30-22:00',
      thursday: '10:30-22:00',
      friday: '10:30-22:30',
      saturday: '10:00-22:30',
      sunday: '10:00-22:00'
    },
    amenities: [
      { amenity: 'parties' },
      { amenity: 'groups' }
    ],
    pricing: {
      acceptsCash: true,
      acceptsCards: true,
      hasPlayCards: true,
      priceRange: 'moderate'
    },
    tags: [
      { tag: 'jumping-gym' },
      { tag: 'trampoline' },
      { tag: 'family-friendly' }
    ]
  },
  {
    name: 'Jumping Gym - North Point H.N.',
    address: '北角匯二期1樓114-115號舖',
    region: 'hong-kong-island',
    city: 'Hong Kong',
    state: 'Hong Kong SAR',
    country: 'HK',
    category: 'family',
    status: 'active',
    contact: {
      phone: '27309618',
      website: 'https://www.jumpingym.com'
    },
    openingHours: {
      monday: '11:00-22:00',
      tuesday: '11:00-22:00',
      wednesday: '11:00-22:00',
      thursday: '11:00-22:00',
      friday: '11:00-22:00',
      saturday: '10:30-22:30',
      sunday: '10:30-22:30'
    },
    amenities: [
      { amenity: 'parties' },
      { amenity: 'groups' }
    ],
    pricing: {
      acceptsCash: true,
      acceptsCards: true,
      hasPlayCards: true,
      priceRange: 'moderate'
    },
    tags: [
      { tag: 'jumping-gym' },
      { tag: 'trampoline' },
      { tag: 'family-friendly' }
    ]
  },
  {
    name: 'Jumping Gym - Sai Wan Bay Plaza',
    address: '小西灣藍灣廣場一樓101B號',
    region: 'hong-kong-island',
    city: 'Hong Kong',
    state: 'Hong Kong SAR',
    country: 'HK',
    category: 'family',
    status: 'active',
    contact: {
      phone: '22641433',
      website: 'https://www.jumpingym.com'
    },
    openingHours: {
      monday: '11:00-22:00',
      tuesday: '11:00-22:00',
      wednesday: '11:00-22:00',
      thursday: '11:00-22:00',
      friday: '11:00-22:00',
      saturday: '10:00-22:00',
      sunday: '10:00-22:00'
    },
    amenities: [
      { amenity: 'parties' },
      { amenity: 'groups' }
    ],
    pricing: {
      acceptsCash: true,
      acceptsCards: true,
      hasPlayCards: true,
      priceRange: 'moderate'
    },
    tags: [
      { tag: 'jumping-gym' },
      { tag: 'trampoline' },
      { tag: 'family-friendly' }
    ]
  },
  {
    name: 'Jumping Gym - Causeway Bay Lee Theatre',
    address: '銅鑼灣波斯富街99號利舞臺4樓',
    region: 'hong-kong-island',
    city: 'Hong Kong',
    state: 'Hong Kong SAR',
    country: 'HK',
    category: 'family',
    status: 'active',
    contact: {
      phone: '26426166',
      website: 'https://www.jumpingym.com'
    },
    openingHours: {
      monday: '11:00-22:00',
      tuesday: '11:00-22:00',
      wednesday: '11:00-22:00',
      thursday: '11:00-22:00',
      friday: '11:00-22:00',
      saturday: '10:30-22:00',
      sunday: '10:30-22:00'
    },
    amenities: [
      { amenity: 'parties' },
      { amenity: 'groups' }
    ],
    pricing: {
      acceptsCash: true,
      acceptsCards: true,
      hasPlayCards: true,
      priceRange: 'moderate'
    },
    tags: [
      { tag: 'jumping-gym' },
      { tag: 'trampoline' },
      { tag: 'family-friendly' }
    ]
  },
  {
    name: 'Jumping Gym - Causeway Bay Kimberley',
    address: '銅鑼灣記利佐治街1號金百利地庫1樓 及 2樓',
    region: 'hong-kong-island',
    city: 'Hong Kong',
    state: 'Hong Kong SAR',
    country: 'HK',
    category: 'family',
    status: 'active',
    contact: {
      phone: '',
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
    amenities: [
      { amenity: 'parties' },
      { amenity: 'groups' }
    ],
    pricing: {
      acceptsCash: true,
      acceptsCards: true,
      hasPlayCards: true,
      priceRange: 'moderate'
    },
    tags: [
      { tag: 'jumping-gym' },
      { tag: 'trampoline' },
      { tag: 'family-friendly' }
    ]
  },
  // Kowloon
  {
    name: 'Jumping Gym - Whampoa Garden',
    address: '黃埔花園十一期聚寶坊地庫',
    region: 'kowloon',
    city: 'Hong Kong',
    state: 'Hong Kong SAR',
    country: 'HK',
    category: 'family',
    status: 'active',
    contact: {
      phone: '23623855',
      website: 'https://www.jumpingym.com'
    },
    openingHours: {
      monday: '11:00-22:00',
      tuesday: '11:00-22:00',
      wednesday: '11:00-22:00',
      thursday: '11:00-22:00',
      friday: '11:00-22:30',
      saturday: '10:00-22:30',
      sunday: '10:00-22:00'
    },
    amenities: [
      { amenity: 'parties' },
      { amenity: 'groups' }
    ],
    pricing: {
      acceptsCash: true,
      acceptsCards: true,
      hasPlayCards: true,
      priceRange: 'moderate'
    },
    tags: [
      { tag: 'jumping-gym' },
      { tag: 'trampoline' },
      { tag: 'family-friendly' }
    ]
  },
  {
    name: 'Jumping Gym - Tsim Sha Tsui Maritime Square',
    address: '尖沙咀海運大厦地下OT G11號舖',
    region: 'kowloon',
    city: 'Hong Kong',
    state: 'Hong Kong SAR',
    country: 'HK',
    category: 'family',
    status: 'active',
    contact: {
      phone: '23779551',
      website: 'https://www.jumpingym.com'
    },
    openingHours: {
      monday: '10:00-22:00',
      tuesday: '10:00-22:00',
      wednesday: '10:00-22:00',
      thursday: '10:00-22:00',
      friday: '10:00-22:30',
      saturday: '10:00-22:30',
      sunday: '10:00-22:00'
    },
    amenities: [
      { amenity: 'parties' },
      { amenity: 'groups' }
    ],
    pricing: {
      acceptsCash: true,
      acceptsCards: true,
      hasPlayCards: true,
      priceRange: 'moderate'
    },
    tags: [
      { tag: 'jumping-gym' },
      { tag: 'trampoline' },
      { tag: 'family-friendly' }
    ]
  },
  // New Territories
  {
    name: 'Jumping Gym - Tseung Kwan O New Town Plaza',
    address: '將軍澳新都城2期1樓,1046-47號舖',
    region: 'new-territories',
    city: 'Hong Kong',
    state: 'Hong Kong SAR',
    country: 'HK',
    category: 'family',
    status: 'active',
    contact: {
      phone: '25193266',
      website: 'https://www.jumpingym.com'
    },
    openingHours: {
      monday: '11:00-22:00',
      tuesday: '11:00-22:00',
      wednesday: '11:00-22:00',
      thursday: '11:00-22:00',
      friday: '11:00-22:00',
      saturday: '10:30-22:00',
      sunday: '10:30-22:00'
    },
    amenities: [
      { amenity: 'parties' },
      { amenity: 'groups' }
    ],
    pricing: {
      acceptsCash: true,
      acceptsCards: true,
      hasPlayCards: true,
      priceRange: 'moderate'
    },
    tags: [
      { tag: 'jumping-gym' },
      { tag: 'trampoline' },
      { tag: 'family-friendly' }
    ]
  },
  {
    name: 'Jumping Gym - Tseung Kwan O Plaza',
    address: '將軍澳廣場1樓1-082至084 號舖',
    region: 'new-territories',
    city: 'Hong Kong',
    state: 'Hong Kong SAR',
    country: 'HK',
    category: 'family',
    status: 'active',
    contact: {
      phone: '24072611',
      website: 'https://www.jumpingym.com'
    },
    openingHours: {
      monday: '11:00-22:00',
      tuesday: '11:00-22:00',
      wednesday: '11:00-22:00',
      thursday: '11:00-22:00',
      friday: '11:00-22:00',
      saturday: '10:00-22:00',
      sunday: '10:00-22:00'
    },
    amenities: [
      { amenity: 'parties' },
      { amenity: 'groups' }
    ],
    pricing: {
      acceptsCash: true,
      acceptsCards: true,
      hasPlayCards: true,
      priceRange: 'moderate'
    },
    tags: [
      { tag: 'jumping-gym' },
      { tag: 'trampoline' },
      { tag: 'family-friendly' }
    ]
  },
  {
    name: 'Jumping Gym - Tseung Kwan O PopCorn',
    address: '將軍澳東港城2樓237A & 237B',
    region: 'new-territories',
    city: 'Hong Kong',
    state: 'Hong Kong SAR',
    country: 'HK',
    category: 'family',
    status: 'active',
    contact: {
      phone: '23879170',
      website: 'https://www.jumpingym.com'
    },
    openingHours: {
      monday: '11:00-22:00',
      tuesday: '11:00-22:00',
      wednesday: '11:00-22:00',
      thursday: '11:00-22:00',
      friday: '11:00-22:00',
      saturday: '10:00-22:00',
      sunday: '10:00-22:00'
    },
    amenities: [
      { amenity: 'parties' },
      { amenity: 'groups' }
    ],
    pricing: {
      acceptsCash: true,
      acceptsCards: true,
      hasPlayCards: true,
      priceRange: 'moderate'
    },
    tags: [
      { tag: 'jumping-gym' },
      { tag: 'trampoline' },
      { tag: 'family-friendly' }
    ]
  }
]

function determineRegionFromAddress(address: string) {
  if (!address) return null
  
  const addressLower = address.toLowerCase()
  
  // Check each region
  for (const [region, keywords] of Object.entries(regionMappings)) {
    for (const keyword of keywords) {
      if (addressLower.includes(keyword.toLowerCase())) {
        return region
      }
    }
  }
  
  return null // Unable to determine region
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Step 1: Update existing stores with region information
    console.log('Fetching existing stores...')
    
    const { docs: existingStores } = await payload.find({
      collection: 'stores',
      limit: 1000,
    })
    
    console.log(`Found ${existingStores.length} existing stores`)
    
    let updatedCount = 0
    let unableToMapCount = 0
    const regionCounts: Record<string, number> = {
      'hong-kong-island': 0,
      'kowloon': 0,
      'new-territories': 0
    }
    
    // Update existing stores with region information
    for (const store of existingStores) {
      const currentRegion = store.region
      
      // If region is already set, skip unless it's obviously wrong
      if (currentRegion && currentRegion !== '') {
        console.log(`Store "${store.name}" already has region: ${currentRegion}`)
        regionCounts[currentRegion] = (regionCounts[currentRegion] || 0) + 1
        continue
      }
      
      // Determine region from address or name
      const addressText = `${store.name || ''} ${store.address || ''}`
      const detectedRegion = determineRegionFromAddress(addressText)
      
      if (detectedRegion) {
        console.log(`Updating "${store.name}" → ${detectedRegion}`)
        
        await payload.update({
          collection: 'stores',
          id: store.id,
          data: {
            region: detectedRegion,
          },
        })
        
        updatedCount++
        regionCounts[detectedRegion]++
      } else {
        console.log(`Unable to determine region for: "${store.name}" - "${store.address}"`)
        unableToMapCount++
      }
    }
    
    // Step 2: Import Jumping Gym stores
    console.log('Importing Jumping Gym stores...')
    
    let jumpingGymUpdatedCount = 0
    let jumpingGymCreatedCount = 0
    
    for (const jumpingGymStore of jumpingGymStores) {
      // Try to find existing store by name or address
      const existingStore = existingStores.find(store => 
        store.name === jumpingGymStore.name || 
        (store.address && jumpingGymStore.address && 
         store.address.includes(jumpingGymStore.address.slice(0, 10)))
      )
      
      if (existingStore) {
        // Update existing store with region information
        console.log(`Updating existing store: ${existingStore.name}`)
        
        await payload.update({
          collection: 'stores',
          id: existingStore.id,
          data: {
            ...jumpingGymStore,
            // Preserve existing analytics data
            analytics: existingStore.analytics || jumpingGymStore.analytics || {},
            // Preserve existing images
            images: existingStore.images || [],
          },
        })
        
        jumpingGymUpdatedCount++
      } else {
        // Create new store
        console.log(`Creating new store: ${jumpingGymStore.name}`)
        
        await payload.create({
          collection: 'stores',
          data: {
            ...jumpingGymStore,
            analytics: {
              views: 0,
              photoCount: 0,
              checkIns: 0,
              averageRating: 0,
              totalRatings: 0,
              machineCount: 0
            }
          },
        })
        
        jumpingGymCreatedCount++
      }
    }
    
    // Display regional summary
    const jumpingGymRegionSummary = jumpingGymStores.reduce((acc, store) => {
      acc[store.region] = (acc[store.region] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const results = {
      success: true,
      regionUpdate: {
        updated: updatedCount,
        unableToMap: unableToMapCount,
        regionCounts
      },
      jumpingGymImport: {
        updated: jumpingGymUpdatedCount,
        created: jumpingGymCreatedCount,
        regionSummary: jumpingGymRegionSummary
      }
    }
    
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('Error during regional store setup:', error)
    return NextResponse.json(
      { error: 'Failed to setup regional stores', details: error.message },
      { status: 500 }
    )
  }
}