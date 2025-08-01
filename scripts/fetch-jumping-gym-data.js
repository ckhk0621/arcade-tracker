/**
 * Jumping Gym Store Data Fetcher
 * Creates PayloadCMS-ready store data from manual extraction
 */

import fs from 'fs/promises';

// Manually extracted store data from jumpingym.com/branches
const jumpingGymStores = [
  {
    name: "太古城中心",
    address: "太古城中心第二期103B舖",
    phone: "25600003",
    district: "太古",
    hours: "週一至週四: 10:30-22:00, 週五: 10:30-22:30, 週六: 10:00-22:30, 週日及公眾假期: 10:00-22:00"
  },
  {
    name: "北角匯二期", 
    address: "北角匯二期1樓114-115號舖",
    phone: "27309618",
    district: "北角",
    hours: "週一至週五: 11:00-22:00, 週六、日及公眾假期: 10:30-22:30"
  },
  {
    name: "荃灣愉景新城",
    address: "荃灣愉景新城1樓110-112號舖",
    phone: "24980238",
    district: "荃灣",
    hours: "週一至週四: 10:30-22:00, 週五: 10:30-22:30, 週六: 10:00-22:30, 週日及公眾假期: 10:00-22:00"
  },
  {
    name: "屯門市廣場二期",
    address: "屯門市廣場二期1樓1155-1156號舖",
    phone: "24411884",
    district: "屯門",
    hours: "週一至週四: 10:30-22:00, 週五: 10:30-22:30, 週六: 10:00-22:30, 週日及公眾假期: 10:00-22:00"
  },
  {
    name: "沙田新城市廣場三期",
    address: "沙田新城市廣場三期3樓301號舖",
    phone: "26029738",
    district: "沙田",
    hours: "週一至週四: 10:30-22:00, 週五: 10:30-22:30, 週六: 10:00-22:30, 週日及公眾假期: 10:00-22:00"
  },
  {
    name: "將軍澳東港城",
    address: "將軍澳東港城2樓235-236號舖",
    phone: "27027238",
    district: "將軍澳",
    hours: "週一至週四: 10:30-22:00, 週五: 10:30-22:30, 週六: 10:00-22:30, 週日及公眾假期: 10:00-22:00"
  },
  {
    name: "觀塘apm",
    address: "觀塘apm 5樓L5-01號舖",
    phone: "23493228",
    district: "觀塘",
    hours: "週一至週日及公眾假期: 11:00-24:00"
  },
  {
    name: "尖沙咀K11 MUSEA",
    address: "尖沙咀K11 MUSEA 6樓614-615號舖",
    phone: "27239988",
    district: "尖沙咀",
    hours: "週一至週四: 10:30-22:00, 週五: 10:30-22:30, 週六: 10:00-22:30, 週日及公眾假期: 10:00-22:00"
  },
  {
    name: "九龍灣德福廣場二期",
    address: "九龍灣德福廣場二期6樓607-608號舖",
    phone: "27557228",
    district: "九龍灣",
    hours: "週一至週四: 10:30-22:00, 週五: 10:30-22:30, 週六: 10:00-22:30, 週日及公眾假期: 10:00-22:00"
  },
  {
    name: "旺角朗豪坊",
    address: "旺角朗豪坊13樓1302-1303號舖",
    phone: "27707228",
    district: "旺角",
    hours: "週一至週四: 10:30-22:00, 週五: 10:30-22:30, 週六: 10:00-22:30, 週日及公眾假期: 10:00-22:00"
  },
  {
    name: "元朗廣場",
    address: "元朗廣場1樓122號舖",
    phone: "24433228",
    district: "元朗",
    hours: "週一至週四: 10:30-22:00, 週五: 10:30-22:30, 週六: 10:00-22:30, 週日及公眾假期: 10:00-22:00"
  },
  {
    name: "大埔超級城",
    address: "大埔超級城C區2樓214號舖",
    phone: "26653228",
    district: "大埔",
    hours: "週一至週四: 10:30-22:00, 週五: 10:30-22:30, 週六: 10:00-22:30, 週日及公眾假期: 10:00-22:00"
  }
];

class JumpingGymDataProcessor {
  constructor() {
    this.stores = jumpingGymStores;
  }

  parseOperatingHours(hoursString) {
    const hours = {};
    
    // Default hours pattern
    let mondayToThursday = '10:30-22:00';
    let friday = '10:30-22:30';
    let saturday = '10:00-22:30';
    let sunday = '10:00-22:00';
    
    // Parse specific patterns from the hours string
    if (hoursString.includes('週一至週四')) {
      const match = hoursString.match(/週一至週四:\s*(\d{2}:\d{2}-\d{2}:\d{2})/);
      if (match) mondayToThursday = match[1];
    }
    
    if (hoursString.includes('週五')) {
      const match = hoursString.match(/週五:\s*(\d{2}:\d{2}-\d{2}:\d{2})/);
      if (match) friday = match[1];
    }
    
    if (hoursString.includes('週六')) {
      const match = hoursString.match(/週六:\s*(\d{2}:\d{2}-\d{2}:\d{2})/);
      if (match) saturday = match[1];
    }
    
    if (hoursString.includes('週日')) {
      const match = hoursString.match(/週日[^:]*:\s*(\d{2}:\d{2}-\d{2}:\d{2})/);
      if (match) sunday = match[1];
    }
    
    // Special case for 24-hour locations
    if (hoursString.includes('11:00-24:00')) {
      const allDay = '11:00-24:00';
      return {
        monday: allDay,
        tuesday: allDay,
        wednesday: allDay,
        thursday: allDay,
        friday: allDay,
        saturday: allDay,
        sunday: allDay
      };
    }
    
    return {
      monday: mondayToThursday,
      tuesday: mondayToThursday,
      wednesday: mondayToThursday,
      thursday: mondayToThursday,
      friday: friday,
      saturday: saturday,
      sunday: sunday
    };
  }

  async geocodeAddress(address) {
    // For Hong Kong addresses, we'll use approximate coordinates
    // In a production system, you'd use a proper geocoding service
    // GeoJSON format: [longitude, latitude]
    const hongKongCoordinates = {
      "太古": [114.2193, 22.2855],
      "北角": [114.2008, 22.2908],
      "荃灣": [114.1185, 22.3751],
      "屯門": [113.9739, 22.3952],
      "沙田": [114.1877, 22.3817],
      "將軍澳": [114.2630, 22.3046],
      "觀塘": [114.2259, 22.3120],
      "尖沙咀": [114.1722, 22.2976],
      "九龍灣": [114.2112, 22.3236],
      "旺角": [114.1694, 22.3193],
      "元朗": [114.0348, 22.4453],
      "大埔": [114.1779, 22.4505]
    };
    
    // Extract district from address or use default Hong Kong coordinates
    for (const [district, coords] of Object.entries(hongKongCoordinates)) {
      if (address.includes(district)) {
        return coords;
      }
    }
    
    // Default to Hong Kong Island coordinates [longitude, latitude]
    return [114.1628, 22.2793];
  }

  async toPayloadFormat() {
    const payloadStores = [];
    
    for (const store of this.stores) {
      const coordinates = await this.geocodeAddress(store.address);
      const operatingHours = this.parseOperatingHours(store.hours);
      
      const payloadStore = {
        name: store.name,
        address: store.address,
        city: store.district,
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
          ...operatingHours,
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
      
      payloadStores.push(payloadStore);
    }
    
    return payloadStores;
  }

  async saveData() {
    try {
      // Convert to Payload format
      const payloadData = await this.toPayloadFormat();
      
      // Save raw data
      await fs.writeFile(
        '/Users/ck/jobs/arcade-tracker/data/jumping-gym-raw.json', 
        JSON.stringify(this.stores, null, 2), 
        'utf8'
      );
      
      // Save PayloadCMS-ready data
      await fs.writeFile(
        '/Users/ck/jobs/arcade-tracker/data/jumping-gym-payload.json', 
        JSON.stringify(payloadData, null, 2), 
        'utf8'
      );
      
      console.log(`Successfully processed ${payloadData.length} Jumping Gym stores`);
      console.log('Files saved:');
      console.log('- jumping-gym-raw.json (original data)');
      console.log('- jumping-gym-payload.json (PayloadCMS format)');
      
      return payloadData;
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  }
}

// Export for use in import script
export { JumpingGymDataProcessor };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new JumpingGymDataProcessor();
  processor.saveData().catch(console.error);
}