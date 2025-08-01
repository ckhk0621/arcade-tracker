import fetch from 'node-fetch';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

// Manual store data based on research - more reliable than scraping
const jumpingGymStoreData = {
  'hong-kong-island': [
    {
      name: 'Jumping Gym - Taikoo City Centre',
      address: '太古城中心第二期103B舖',
      phone: '25600003',
      hours: {
        monday: '10:30-22:00',
        tuesday: '10:30-22:00', 
        wednesday: '10:30-22:00',
        thursday: '10:30-22:00',
        friday: '10:30-22:30',
        saturday: '10:00-22:30',
        sunday: '10:00-22:00'
      }
    },
    {
      name: 'Jumping Gym - North Point H.N.',
      address: '北角匯二期1樓114-115號舖',
      phone: '27309618',
      hours: {
        monday: '11:00-22:00',
        tuesday: '11:00-22:00',
        wednesday: '11:00-22:00', 
        thursday: '11:00-22:00',
        friday: '11:00-22:00',
        saturday: '10:30-22:30',
        sunday: '10:30-22:30'
      }
    },
    {
      name: 'Jumping Gym - Sai Wan Bay Plaza',
      address: '小西灣藍灣廣場一樓101B號',
      phone: '22641433',
      hours: {
        monday: '11:00-22:00',
        tuesday: '11:00-22:00',
        wednesday: '11:00-22:00',
        thursday: '11:00-22:00', 
        friday: '11:00-22:00',
        saturday: '10:00-22:00',
        sunday: '10:00-22:00'
      }
    },
    {
      name: 'Jumping Gym - Causeway Bay Lee Theatre',
      address: '銅鑼灣波斯富街99號利舞臺4樓',
      phone: '26426166',
      hours: {
        monday: '11:00-22:00',
        tuesday: '11:00-22:00',
        wednesday: '11:00-22:00',
        thursday: '11:00-22:00',
        friday: '11:00-22:00',
        saturday: '10:30-22:00',
        sunday: '10:30-22:00'
      }
    },
    {
      name: 'Jumping Gym - Causeway Bay Kimberley',
      address: '銅鑼灣記利佐治街1號金百利地庫1樓 及 2樓',
      phone: '',
      hours: {
        monday: '12:00-23:00',
        tuesday: '12:00-23:00',
        wednesday: '12:00-23:00',
        thursday: '12:00-23:00',
        friday: '12:00-23:30',
        saturday: '11:30-23:30',
        sunday: '11:30-23:00'
      }
    }
  ],
  'kowloon': [
    {
      name: 'Jumping Gym - Whampoa Garden',
      address: '黃埔花園十一期聚寶坊地庫',
      phone: '23623855',
      hours: {
        monday: '11:00-22:00',
        tuesday: '11:00-22:00',
        wednesday: '11:00-22:00',
        thursday: '11:00-22:00',
        friday: '11:00-22:30',
        saturday: '10:00-22:30',
        sunday: '10:00-22:00'
      }
    },
    {
      name: 'Jumping Gym - Tsim Sha Tsui Maritime Square',
      address: '尖沙咀海運大厦地下OT G11號舖',
      phone: '23779551',
      hours: {
        monday: '10:00-22:00',
        tuesday: '10:00-22:00',
        wednesday: '10:00-22:00',
        thursday: '10:00-22:00',
        friday: '10:00-22:30',
        saturday: '10:00-22:30',
        sunday: '10:00-22:00'
      }
    }
  ],
  'new-territories': [
    {
      name: 'Jumping Gym - Tseung Kwan O New Town Plaza',
      address: '將軍澳新都城2期1樓,1046-47號舖',
      phone: '25193266',
      hours: {
        monday: '11:00-22:00',
        tuesday: '11:00-22:00',
        wednesday: '11:00-22:00',
        thursday: '11:00-22:00',
        friday: '11:00-22:00',
        saturday: '10:30-22:00',
        sunday: '10:30-22:00'
      }
    },
    {
      name: 'Jumping Gym - Tseung Kwan O Plaza',
      address: '將軍澳廣場1樓1-082至084 號舖',
      phone: '24072611',
      hours: {
        monday: '11:00-22:00',
        tuesday: '11:00-22:00',
        wednesday: '11:00-22:00',
        thursday: '11:00-22:00',
        friday: '11:00-22:00',
        saturday: '10:00-22:00',
        sunday: '10:00-22:00'
      }
    },
    {
      name: 'Jumping Gym - Tseung Kwan O PopCorn',
      address: '將軍澳東港城2樓237A & 237B',
      phone: '23879170',
      hours: {
        monday: '11:00-22:00',
        tuesday: '11:00-22:00',
        wednesday: '11:00-22:00',
        thursday: '11:00-22:00',
        friday: '11:00-22:00',
        saturday: '10:00-22:00',
        sunday: '10:00-22:00'
      }
    }
  ]
};

function getAllJumpingGymStores() {
  const allStores = [];
  
  for (const [region, stores] of Object.entries(jumpingGymStoreData)) {
    for (const store of stores) {
      allStores.push({
        ...store,
        region
      });
    }
  }
  
  return allStores;
}

// Transform store data for PayloadCMS
function transformForPayload(stores) {
  return stores.map(store => ({
    name: store.name,
    address: store.address,
    region: store.region,
    city: 'Hong Kong',
    state: 'Hong Kong SAR',
    country: 'HK',
    category: 'family', // Jumping gym is family entertainment
    status: 'active',
    contact: {
      phone: store.phone,
      website: 'https://www.jumpingym.com'
    },
    openingHours: store.hours,
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
    analytics: {
      views: 0,
      photoCount: 0,
      checkIns: 0,
      averageRating: 0,
      totalRatings: 0,
      machineCount: 0
    },
    tags: [
      { tag: 'jumping-gym' },
      { tag: 'trampoline' },
      { tag: 'family-friendly' }
    ]
  }));
}

async function main() {
  try {
    console.log('Getting Jumping Gym store data...');
    
    const stores = getAllJumpingGymStores();
    console.log(`Total stores: ${stores.length}`);
    
    // Transform for PayloadCMS
    const payloadData = transformForPayload(stores);
    
    // Save data
    const outputFile = path.join(__dirname, 'jumping-gym-stores-data.json');
    fs.writeFileSync(outputFile, JSON.stringify(stores, null, 2));
    
    const payloadFile = path.join(__dirname, 'jumping-gym-payload-data.json');
    fs.writeFileSync(payloadFile, JSON.stringify(payloadData, null, 2));
    
    console.log(`Raw data saved to ${outputFile}`);
    console.log(`PayloadCMS data saved to ${payloadFile}`);
    
    // Create summary
    const summary = {
      totalStores: stores.length,
      byRegion: {
        'hong-kong-island': stores.filter(s => s.region === 'hong-kong-island').length,
        'kowloon': stores.filter(s => s.region === 'kowloon').length,
        'new-territories': stores.filter(s => s.region === 'new-territories').length
      },
      processedAt: new Date().toISOString()
    };
    
    console.log('Store Data Summary:', summary);
    
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { getAllJumpingGymStores, transformForPayload };