/**
 * Jumping Gym Store Location Scraper
 * Scrapes all store locations from jumpingym.com/branches
 */

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';

class JumpingGymScraper {
  constructor() {
    this.baseUrl = 'https://www.jumpingym.com';
    this.branchesUrl = 'https://www.jumpingym.com/branches';
    this.stores = [];
  }

  async scrapeStores() {
    try {
      console.log('Fetching branches page...');
      const response = await fetch(this.branchesUrl);
      const html = await response.text();
      const $ = cheerio.load(html);

      // Find all branch sections
      const branches = $('.branch-item, .location-item, .store-item, [class*="branch"], [class*="location"]').length > 0 
        ? $('.branch-item, .location-item, .store-item, [class*="branch"], [class*="location"]')
        : $('div').filter((i, el) => {
            const text = $(el).text();
            return text.includes('電話') || text.includes('時間') || text.includes('地址');
          });

      console.log(`Found ${branches.length} potential branch elements`);

      // If we can't find structured elements, try to parse the text content
      if (branches.length === 0) {
        return this.parseTextContent($);
      }

      branches.each((index, element) => {
        const $branch = $(element);
        const store = this.extractStoreData($branch, $);
        if (store.name) {
          this.stores.push(store);
        }
      });

      return this.stores;
    } catch (error) {
      console.error('Error scraping stores:', error);
      throw error;
    }
  }

  parseTextContent($) {
    // Fallback method to parse unstructured content
    const bodyText = $('body').text();
    const lines = bodyText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentStore = null;
    const stores = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect store name (usually contains Chinese characters and might be a heading)
      if (this.isStoreName(line)) {
        if (currentStore && currentStore.name) {
          stores.push(currentStore);
        }
        currentStore = {
          name: line,
          address: '',
          phone: '',
          operatingHours: {},
          district: '',
          features: []
        };
      }
      
      // Extract phone numbers
      if (line.match(/^\d{8}$/) && currentStore) {
        currentStore.phone = line;
      }
      
      // Extract addresses (contains 號 or 舖 or specific location indicators)
      if ((line.includes('號') || line.includes('舖') || line.includes('樓') || line.includes('廣場') || line.includes('中心')) && currentStore) {
        currentStore.address = line;
      }
      
      // Extract operating hours
      if (line.includes(':') && line.match(/\d{2,4}-\d{2,4}/) && currentStore) {
        this.parseOperatingHours(line, currentStore);
      }
    }
    
    if (currentStore && currentStore.name) {
      stores.push(currentStore);
    }
    
    return stores;
  }

  isStoreName(line) {
    // Check if line looks like a store name
    return line.match(/[\u4e00-\u9fff]/) && // Contains Chinese characters
           line.length > 2 && 
           line.length < 50 &&
           !line.includes(':') &&
           !line.match(/\d{8}/) && // Not a phone number
           !line.includes('時間') &&
           !line.includes('電話');
  }

  extractStoreData($element, $) {
    const store = {
      name: '',
      address: '',
      phone: '',
      operatingHours: {},
      district: '',
      features: []
    };

    // Extract name
    const nameElement = $element.find('h1, h2, h3, .name, .title, [class*="name"], [class*="title"]').first();
    if (nameElement.length) {
      store.name = nameElement.text().trim();
    } else {
      // Fallback to first text node
      const firstText = $element.contents().filter(function() {
        return this.nodeType === 3 && $(this).text().trim().length > 0;
      }).first().text().trim();
      if (firstText && this.isStoreName(firstText)) {
        store.name = firstText;
      }
    }

    // Extract address
    const addressElement = $element.find('[class*="address"], [class*="location"]').first();
    if (addressElement.length) {
      store.address = addressElement.text().trim();
    } else {
      // Look for text containing address indicators
      const addressText = $element.text().match(/[^\n]*[號舖樓廣場中心][^\n]*/);
      if (addressText) {
        store.address = addressText[0].trim();
      }
    }

    // Extract phone
    const phoneElement = $element.find('[class*="phone"], [class*="tel"]').first();
    if (phoneElement.length) {
      store.phone = phoneElement.text().trim().replace(/\D/g, '');
    } else {
      const phoneMatch = $element.text().match(/\d{8}/);
      if (phoneMatch) {
        store.phone = phoneMatch[0];
      }
    }

    // Extract operating hours
    this.extractOperatingHours($element, store);

    return store;
  }

  extractOperatingHours($element, store) {
    const text = $element.text();
    const lines = text.split('\n').map(line => line.trim());
    
    for (const line of lines) {
      this.parseOperatingHours(line, store);
    }
  }

  parseOperatingHours(line, store) {
    // Parse different hour formats
    const patterns = [
      /週一至週四[：:]\s*(\d{2}):(\d{2})-(\d{2}):(\d{2})/,
      /週五[：:]\s*(\d{2}):(\d{2})-(\d{2}):(\d{2})/,
      /週六[：:]\s*(\d{2}):(\d{2})-(\d{2}):(\d{2})/,
      /週日[：:]\s*(\d{2}):(\d{2})-(\d{2}):(\d{2})/,
      /星期一至四[：:]\s*(\d{2}):(\d{2})-(\d{2}):(\d{2})/,
      /(\d{2}):(\d{2})-(\d{2}):(\d{2})/
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const [, startHour, startMin, endHour, endMin] = match;
        const timeRange = `${startHour}:${startMin}-${endHour}:${endMin}`;
        
        if (line.includes('週一至週四') || line.includes('星期一至四')) {
          store.operatingHours.mondayToThursday = timeRange;
        } else if (line.includes('週五')) {
          store.operatingHours.friday = timeRange;
        } else if (line.includes('週六')) {
          store.operatingHours.saturday = timeRange;
        } else if (line.includes('週日')) {
          store.operatingHours.sunday = timeRange;
        } else {
          // Default assumption for unspecified hours
          store.operatingHours.general = timeRange;
        }
        break;
      }
    }
  }

  async saveToFile(filename = 'jumping-gym-stores.json') {
    try {
      await fs.writeFile(filename, JSON.stringify(this.stores, null, 2), 'utf8');
      console.log(`Saved ${this.stores.length} stores to ${filename}`);
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  }

  // Convert to PayloadCMS format
  toPayloadFormat() {
    return this.stores.map(store => ({
      name: store.name,
      address: store.address,
      city: this.extractCity(store.address),
      state: 'Hong Kong',
      country: 'HK',
      contact: {
        phone: store.phone,
        website: 'https://www.jumpingym.com'
      },
      openingHours: this.convertOperatingHours(store.operatingHours),
      category: 'family', // Jumping Gym is a family fun center
      status: 'active',
      description: 'Indoor trampoline park and family entertainment center',
      amenities: [
        { amenity: 'parking' },
        { amenity: 'parties' },
        { amenity: 'groups' },
        { amenity: 'restrooms' }
      ],
      pricing: {
        acceptsCash: true,
        acceptsCards: true,
        hasPlayCards: true,
        priceRange: 'moderate'
      },
      tags: [
        { tag: 'trampoline' },
        { tag: 'kids' },
        { tag: 'family' },
        { tag: 'indoor' },
        { tag: 'exercise' }
      ]
    }));
  }

  extractCity(address) {
    // Extract district/area from Hong Kong address
    const districts = [
      '中環', '金鐘', '尖沙咀', '旺角', '銅鑼灣', '灣仔', '北角', '太古',
      '荃灣', '沙田', '屯門', '元朗', '大埔', '粉嶺', '上水', '將軍澳',
      '觀塘', '九龍灣', '黃大仙', '深水埗', '長沙灣', '油麻地', '佐敦'
    ];
    
    for (const district of districts) {
      if (address.includes(district)) {
        return district;
      }
    }
    
    return 'Hong Kong';
  }

  convertOperatingHours(hours) {
    const converted = {};
    
    if (hours.mondayToThursday) {
      const [start, end] = hours.mondayToThursday.split('-');
      converted.monday = `${start}-${end}`;
      converted.tuesday = `${start}-${end}`;
      converted.wednesday = `${start}-${end}`;
      converted.thursday = `${start}-${end}`;
    }
    
    if (hours.friday) {
      converted.friday = hours.friday;
    }
    
    if (hours.saturday) {
      converted.saturday = hours.saturday;
    }
    
    if (hours.sunday) {
      converted.sunday = hours.sunday;
    }
    
    if (hours.general && !Object.keys(converted).length) {
      // Apply general hours to all days if no specific hours found
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      days.forEach(day => {
        converted[day] = hours.general;
      });
    }
    
    return converted;
  }
}

// Main execution
async function main() {
  const scraper = new JumpingGymScraper();
  
  try {
    console.log('Starting Jumping Gym scraper...');
    const stores = await scraper.scrapeStores();
    console.log(`Successfully scraped ${stores.length} stores`);
    
    // Save raw data
    await scraper.saveToFile('./data/jumping-gym-raw.json');
    
    // Convert to Payload format and save
    const payloadData = scraper.toPayloadFormat();
    await fs.writeFile('./data/jumping-gym-payload.json', JSON.stringify(payloadData, null, 2), 'utf8');
    console.log(`Converted data saved to jumping-gym-payload.json`);
    
    return payloadData;
  } catch (error) {
    console.error('Scraping failed:', error);
    process.exit(1);
  }
}

// Export for use in other scripts
export { JumpingGymScraper };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}