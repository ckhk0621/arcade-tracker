import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Helper function to parse time format from scraped data
function parseHours(hoursText) {
  const hourMap = {
    'Monday': 'monday',
    'Tuesday': 'tuesday', 
    'Wednesday': 'wednesday',
    'Thursday': 'thursday',
    'Friday': 'friday',
    'Saturday': 'saturday',
    'Sunday': 'sunday'
  };
  
  const hours = {};
  
  // Default hours structure if parsing fails
  const defaultHours = {
    monday: '11:00-22:00',
    tuesday: '11:00-22:00',
    wednesday: '11:00-22:00',
    thursday: '11:00-22:00', 
    friday: '11:00-22:00',
    saturday: '10:30-22:00',
    sunday: '10:30-22:00'
  };
  
  return defaultHours;
}

// Helper function to extract city from address
function extractCity(address) {
  // Map of common Hong Kong location names to proper cities
  const cityMap = {
    '太古城': '太古',
    '太古': '太古',
    '北角': '北角',
    '小西灣': '小西灣',
    '銅鑼灣': '銅鑼灣',
    '黃埔': '黃埔',
    '尖沙咀': '尖沙咀',
    '旺角': '旺角',
    '觀塘': '觀塘',
    '九龍灣': '九龍灣',
    '將軍澳': '將軍澳',
    '荃灣': '荃灣',
    '屯門': '屯門',
    '沙田': '沙田',
    '元朗': '元朗',
    '大埔': '大埔',
    '上水': '上水',
    '粉嶺': '粉嶺',
    '東涌': '東涌'
  };
  
  // Try to find a match in the address
  for (const [key, city] of Object.entries(cityMap)) {
    if (address.includes(key)) {
      return city;
    }
  }
  
  return 'Hong Kong'; // fallback
}

// Helper function to get coordinates (simplified for demo - in production use geocoding API)
function getCoordinates(address) {
  // Sample coordinates for Hong Kong locations
  const locationMap = {
    '太古城': [114.2193, 22.2855],
    '北角': [114.2008, 22.2908],
    '小西灣': [114.2641, 22.2643],
    '銅鑼灣': [114.1846, 22.2793],
    '黃埔': [114.1885, 22.3059],
    '尖沙咀': [114.1722, 22.2976],
    '旺角': [114.1694, 22.3193],
    '觀塘': [114.2259, 22.312],
    '九龍灣': [114.2112, 22.3236],
    '將軍澳': [114.263, 22.3046],
    '荃灣': [114.1185, 22.3751],
    '屯門': [113.9739, 22.3952],
    '沙田': [114.1877, 22.3817],
    '元朗': [114.0348, 22.4453],
    '大埔': [114.1779, 22.4505],
    '上水': [114.1274, 22.5015],
    '粉嶺': [114.1396, 22.4926],
    '東涌': [113.9428, 22.2889]
  };
  
  for (const [location, coords] of Object.entries(locationMap)) {
    if (address.includes(location)) {
      return coords;
    }
  }
  
  return [114.1694, 22.3193]; // Default to central Hong Kong
}

// Complete store data based on official JumpinGym website pages
const jumpingGymCompleteData = {
  'hong-kong-island': [
    {
      name: '太古城中心',
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
      },
      features: ['彈跳迷宮', '派對']
    },
    {
      name: '北角匯二期',
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
      },
      features: []
    },
    {
      name: '小西灣藍灣廣場',
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
      },
      features: []
    },
    {
      name: '銅鑼灣利舞臺',
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
      },
      features: []
    },
    {
      name: '銅鑼灣金百利',
      address: '銅鑼灣記利佐治街1號金百利地庫1樓 及 2樓',
      phone: '35681956',
      hours: {
        monday: '12:00-23:00',
        tuesday: '12:00-23:00',
        wednesday: '12:00-23:00',
        thursday: '12:00-23:00',
        friday: '12:00-23:30',
        saturday: '11:30-23:30',
        sunday: '11:30-23:00'
      },
      features: []
    },
    {
      name: '黃竹坑The Southside',
      address: '黃竹坑The Southside G14-G15號舖',
      phone: '35681987',
      hours: {
        monday: '11:00-22:00',
        tuesday: '11:00-22:00',
        wednesday: '11:00-22:00',
        thursday: '11:00-22:00',
        friday: '11:00-22:00',
        saturday: '10:30-22:00',
        sunday: '10:30-22:00'
      },
      features: []
    }
  ],
  'kowloon': [
    {
      name: '黃埔花園',
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
      },
      features: ['彈跳迷宮', '派對']
    },
    {
      name: '尖沙咀海運大厦',
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
      },
      features: []
    },
    {
      name: '旺角Start Centre',
      address: '旺角先達廣場地庫B01A號舖',
      phone: '23657633',
      hours: {
        monday: '11:00-22:00',
        tuesday: '11:00-22:00',
        wednesday: '11:00-22:00',
        thursday: '11:00-22:00',
        friday: '11:00-22:00',
        saturday: '10:30-22:00',
        sunday: '10:30-22:00'
      },
      features: []
    },
    {
      name: '旺角新世紀廣場',
      address: '旺角新世紀廣場地庫A22號舖',
      phone: '23900300',
      hours: {
        monday: '11:00-22:00',
        tuesday: '11:00-22:00',
        wednesday: '11:00-22:00',
        thursday: '11:00-22:00',
        friday: '11:00-22:00',
        saturday: '10:30-22:00',
        sunday: '10:30-22:00'
      },
      features: []
    },
    {
      name: '旺角T.O.P',
      address: '旺角彌敦道794-802號T.O.P購物城12樓',
      phone: '25520608',
      hours: {
        monday: '11:00-22:00',
        tuesday: '11:00-22:00',
        wednesday: '11:00-22:00',
        thursday: '11:00-22:00',
        friday: '11:00-22:00',
        saturday: '10:30-22:00',
        sunday: '10:30-22:00'
      },
      features: []
    },
    {
      name: '長沙灣西九龍中心',
      address: '長沙灣西九龍中心4樓4016-4017號舖',
      phone: '27292388',
      hours: {
        monday: '11:00-22:00',
        tuesday: '11:00-22:00',
        wednesday: '11:00-22:00',
        thursday: '11:00-22:00',
        friday: '11:00-22:00',
        saturday: '10:30-22:00',
        sunday: '10:30-22:00'
      },
      features: []
    },
    {
      name: '觀塘apm',
      address: '觀塘apm 5樓L5-01號舖',
      phone: '23493228',
      hours: {
        monday: '11:00-24:00',
        tuesday: '11:00-24:00',
        wednesday: '11:00-24:00',
        thursday: '11:00-24:00',
        friday: '11:00-24:00',
        saturday: '11:00-24:00',
        sunday: '11:00-24:00'
      },
      features: []
    },
    {
      name: '觀塘港貿中心',
      address: '觀塘成業街6號港貿中心2樓205-206號舖',
      phone: '27962388',
      hours: {
        monday: '11:00-22:00',
        tuesday: '11:00-22:00',
        wednesday: '11:00-22:00',
        thursday: '11:00-22:00',
        friday: '11:00-22:00',
        saturday: '10:30-22:00',
        sunday: '10:30-22:00'
      },
      features: []
    },
    {
      name: '尖沙咀K11 MUSEA',
      address: '尖沙咀K11 MUSEA 6樓614-615號舖',
      phone: '27239988',
      hours: {
        monday: '10:30-22:00',
        tuesday: '10:30-22:00',
        wednesday: '10:30-22:00',
        thursday: '10:30-22:00',
        friday: '10:30-22:30',
        saturday: '10:00-22:30',
        sunday: '10:00-22:00'
      },
      features: []
    },
    {
      name: '九龍灣德福廣場二期',
      address: '九龍灣德福廣場二期6樓607-608號舖',
      phone: '27557228',
      hours: {
        monday: '10:30-22:00',
        tuesday: '10:30-22:00',
        wednesday: '10:30-22:00',
        thursday: '10:30-22:00',
        friday: '10:30-22:30',
        saturday: '10:00-22:30',
        sunday: '10:00-22:00'
      },
      features: []
    },
    {
      name: '旺角朗豪坊',
      address: '旺角朗豪坊13樓1302-1303號舖',
      phone: '27707228',
      hours: {
        monday: '10:30-22:00',
        tuesday: '10:30-22:00',
        wednesday: '10:30-22:00',
        thursday: '10:30-22:00',
        friday: '10:30-22:30',
        saturday: '10:00-22:30',
        sunday: '10:00-22:00'
      },
      features: []
    }
  ],
  'new-territories': [
    {
      name: '將軍澳新都城2期',
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
      },
      features: []
    },
    {
      name: '將軍澳廣場',
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
      },
      features: []
    },
    {
      name: '將軍澳東港城',
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
      },
      features: []
    },
    {
      name: '將軍澳翩滙坊',
      address: '將軍澳翩滙坊地庫Shop1&2',
      phone: '28241338',
      hours: {
        monday: '11:00-22:00',
        tuesday: '11:00-22:00',
        wednesday: '11:00-22:00',
        thursday: '11:00-22:00',
        friday: '11:00-22:00',
        saturday: '10:00-22:00',
        sunday: '10:00-22:00'
      },
      features: ['彈跳迷宮']
    },
    {
      name: '荃灣愉景新城',
      address: '荃灣愉景新城1樓110-112號舖',
      phone: '24980238',
      hours: {
        monday: '10:30-22:00',
        tuesday: '10:30-22:00',
        wednesday: '10:30-22:00',
        thursday: '10:30-22:00',
        friday: '10:30-22:30',
        saturday: '10:00-22:30',
        sunday: '10:00-22:00'
      },
      features: []
    },
    {
      name: '屯門市廣場二期',
      address: '屯門市廣場二期1樓1155-1156號舖',
      phone: '24411884',
      hours: {
        monday: '10:30-22:00',
        tuesday: '10:30-22:00',
        wednesday: '10:30-22:00',
        thursday: '10:30-22:00',
        friday: '10:30-22:30',
        saturday: '10:00-22:30',
        sunday: '10:00-22:00'
      },
      features: []
    },
    {
      name: '沙田新城市廣場三期',
      address: '沙田新城市廣場三期3樓301號舖',
      phone: '26029738',
      hours: {
        monday: '10:30-22:00',
        tuesday: '10:30-22:00',
        wednesday: '10:30-22:00',
        thursday: '10:30-22:00',
        friday: '10:30-22:30',
        saturday: '10:00-22:30',
        sunday: '10:00-22:00'
      },
      features: []
    },
    {
      name: '元朗廣場',
      address: '元朗廣場1樓122號舖',
      phone: '24433228',
      hours: {
        monday: '10:30-22:00',
        tuesday: '10:30-22:00',
        wednesday: '10:30-22:00',
        thursday: '10:30-22:00',
        friday: '10:30-22:30',
        saturday: '10:00-22:30',
        sunday: '10:00-22:00'
      },
      features: []
    },
    {
      name: '大埔超級城',
      address: '大埔超級城C區2樓214號舖',
      phone: '26653228',
      hours: {
        monday: '10:30-22:00',
        tuesday: '10:30-22:00',
        wednesday: '10:30-22:00',
        thursday: '10:30-22:00',
        friday: '10:30-22:30',
        saturday: '10:00-22:30',
        sunday: '10:00-22:00'
      },
      features: []
    },
    {
      name: '上水廣場',
      address: '上水廣場2樓218-220號舖',
      phone: '26724338',
      hours: {
        monday: '11:00-22:00',
        tuesday: '11:00-22:00',
        wednesday: '11:00-22:00',
        thursday: '11:00-22:00',
        friday: '11:00-22:00',
        saturday: '10:30-22:00',
        sunday: '10:30-22:00'
      },
      features: []
    },
    {
      name: '粉嶺名都',
      address: '粉嶺名都1樓130A-B號舖',
      phone: '26831898',
      hours: {
        monday: '11:00-22:00',
        tuesday: '11:00-22:00',
        wednesday: '11:00-22:00',
        thursday: '11:00-22:00',
        friday: '11:00-22:00',
        saturday: '10:30-22:00',
        sunday: '10:30-22:00'
      },
      features: []
    },
    {
      name: '東涌東薈城',
      address: '東涌東薈城名店倉2樓247號舖',
      phone: '21095188',
      hours: {
        monday: '11:00-22:00',
        tuesday: '11:00-22:00',
        wednesday: '11:00-22:00',
        thursday: '11:00-22:00',
        friday: '11:00-22:00',
        saturday: '10:30-22:00',
        sunday: '10:30-22:00'
      },
      features: []
    }
  ]
};

function getAllJumpingGymStores() {
  const allStores = [];
  
  for (const [region, stores] of Object.entries(jumpingGymCompleteData)) {
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
  return stores.map(store => {
    const city = extractCity(store.address);
    const coordinates = getCoordinates(store.address);
    
    return {
      name: store.name,
      address: store.address,
      city: city,
      state: 'Hong Kong',
      country: 'HK',
      location: {
        type: 'Point',
        coordinates: coordinates
      },
      contact: {
        phone: store.phone,
        website: 'https://www.jumpingym.com',
        socialMedia: {
          facebook: 'jumpingym',
          instagram: 'jumpingym'
        }
      },
      openingHours: {
        ...store.hours,
        specialHours: 'Holiday hours may vary. Please call ahead to confirm.'
      },
      category: 'family',
      status: 'active',
      description: 'Indoor trampoline park offering fun activities for all ages. Features jumping areas, foam pits, dodgeball courts and more.',
      amenities: [
        { amenity: 'parking' },
        { amenity: 'parties' },
        { amenity: 'groups' },
        { amenity: 'restrooms' },
        { amenity: 'wifi' }
      ],
      pricing: {
        acceptsCash: true,
        acceptsCards: true,
        hasPlayCards: false,
        hasTokens: false,
        priceRange: 'moderate'
      },
      tags: [
        { tag: 'trampoline' },
        { tag: 'kids' },
        { tag: 'family' },
        { tag: 'indoor' },
        { tag: 'exercise' },
        { tag: 'birthday-parties' },
        { tag: 'group-activities' }
      ],
      analytics: {
        views: 0,
        photoCount: 0,
        checkIns: 0,
        averageRating: 0,
        totalRatings: 0,
        machineCount: 0
      },
      popularity: 0,
      featured: false
    };
  });
}

async function main() {
  try {
    console.log('Processing complete JumpinGym store data...');
    
    const stores = getAllJumpingGymStores();
    console.log(`Total stores: ${stores.length}`);
    
    // Transform for PayloadCMS
    const payloadData = transformForPayload(stores);
    
    // Save raw data
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    
    const rawOutputFile = path.join(dataDir, 'jumping-gym-raw.json');
    fs.writeFileSync(rawOutputFile, JSON.stringify(stores, null, 2));
    
    const payloadFile = path.join(dataDir, 'jumping-gym-payload.json');
    fs.writeFileSync(payloadFile, JSON.stringify(payloadData, null, 2));
    
    console.log(`Raw data saved to ${rawOutputFile}`);
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
    
    console.log('Complete Store Data Summary:', summary);
    
    return {
      rawData: stores,
      payloadData: payloadData,
      summary: summary
    };
    
  } catch (error) {
    console.error('Error in main function:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { getAllJumpingGymStores, transformForPayload, main };