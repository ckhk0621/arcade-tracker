import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { getPayloadHMR } from '@payloadcms/next/utilities';

// Load environment variables manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file and set environment variables
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  }
}

// Load complete store data from the generated file
let jumpingGymStores;
try {
  const dataPath = path.join(__dirname, '../data/jumping-gym-payload.json');
  const storeData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  jumpingGymStores = storeData;
  console.log(`Loaded ${jumpingGymStores.length} stores from data file`);
} catch (error) {
  console.error('Failed to load store data:', error);
  // Fallback to empty array
  jumpingGymStores = [];
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
];

async function updateExistingStores() {
  const configPromise = getPayloadHMR({
    config: path.resolve(__dirname, '../src/payload.config.ts'),
  });
  
  const payload = await configPromise;
  
  try {
    console.log('Fetching existing stores...');
    
    // Get all existing stores
    const { docs: existingStores } = await payload.find({
      collection: 'stores',
      limit: 1000,
    });
    
    console.log(`Found ${existingStores.length} existing stores`);
    
    let updatedCount = 0;
    let createdCount = 0;
    
    for (const jumpingGymStore of jumpingGymStores) {
      // Try to find existing store by name or address
      const existingStore = existingStores.find(store => 
        store.name === jumpingGymStore.name || 
        (store.address && jumpingGymStore.address && 
         store.address.includes(jumpingGymStore.address.slice(0, 10)))
      );
      
      if (existingStore) {
        // Update existing store with region information
        console.log(`Updating existing store: ${existingStore.name}`);
        
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
        });
        
        updatedCount++;
      } else {
        // Create new store
        console.log(`Creating new store: ${jumpingGymStore.name}`);
        
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
        });
        
        createdCount++;
      }
    }
    
    console.log(`Import completed:`);
    console.log(`- Updated ${updatedCount} existing stores`);
    console.log(`- Created ${createdCount} new stores`);
    
    // Display regional summary
    const regionSummary = jumpingGymStores.reduce((acc, store) => {
      acc[store.region] = (acc[store.region] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nStores by region:');
    Object.entries(regionSummary).forEach(([region, count]) => {
      console.log(`- ${region}: ${count} stores`);
    });
    
  } catch (error) {
    console.error('Error during import:', error);
  }
}

async function main() {
  try {
    console.log('Starting Jumping Gym store import...');
    await updateExistingStores();
    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { updateExistingStores, jumpingGymStores };