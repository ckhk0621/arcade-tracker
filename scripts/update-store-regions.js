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
        process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, ''); // Remove quotes
      }
    }
  }
}

console.log('Environment loaded:');
console.log('DATABASE_URI:', process.env.DATABASE_URI ? 'Set' : 'Not set');
console.log('PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET ? 'Set' : 'Not set');

// Region mapping based on Hong Kong geography
const regionMappings = {
  'hong-kong-island': [
    // Central & Western District
    'central', 'admiralty', 'wan chai', 'causeway bay', 'tin hau', 'fortress hill', 'north point', 'quarry bay', 'tai koo', 'sai wan ho', 'shau kei wan', 'chai wan',
    // Chinese areas
    '中環', '金鐘', '灣仔', '銅鑼灣', '天后', '炮台山', '北角', '鰂魚涌', '太古', '西灣河', '筲箕灣', '柴灣',
    '太古城', '小西灣', '利舞臺', '金百利', '波斯富街'
  ],
  'kowloon': [
    // Kowloon areas
    'tsim sha tsui', 'jordan', 'yau ma tei', 'mong kok', 'prince edward', 'shek kip mei', 'tai kok tsui', 'olympic', 'lai chi kok', 'cheung sha wan', 'sham shui po',
    'ho man tin', 'hung hom', 'to kwa wan', 'ma tau wai', 'kai tak', 'kowloon bay', 'ngau tau kok', 'kwun tong', 'lam tin', 'yau tong',
    'diamond hill', 'choi hung', 'kowloon tong', 'lok fu', 'wong tai sin', 'tai hom', 'san po kong',
    // Chinese areas
    '尖沙咀', '佐敦', '油麻地', '旺角', '太子', '石硤尾', '大角咀', '奧運', '荔枝角', '長沙灣', '深水埗',
    '何文田', '紅磡', '土瓜灣', '馬頭圍', '啟德', '九龍灣', '牛頭角', '觀塘', '藍田', '油塘',
    '鑽石山', '彩虹', '九龍塘', '樂富', '黃大仙', '大磡', '新蒲崗',
    '黃埔', '海運', 'moko', 'olympian city'
  ],
  'new-territories': [
    // New Territories areas
    'sha tin', 'tai po', 'fanling', 'sheung shui', 'tai wo', 'fo tan', 'university', 'racecourse', 'shek mun',
    'ma on shan', 'wu kai sha', 'hang hau', 'tseung kwan o', 'po lam', 'tiu keng leng',
    'tsuen wan', 'kwai chung', 'tsing yi', 'ma wan', 'tuen mun', 'yuen long', 'tin shui wai', 'kam tin',
    'tai po market', 'tai po kau', 'plover cove', 'lok ma chau', 'man kam to',
    // Chinese areas
    '沙田', '大埔', '粉嶺', '上水', '大窩', '火炭', '大學', '馬場', '石門',
    '馬鞍山', '烏溪沙', '坑口', '將軍澳', '寶琳', '調景嶺',
    '荃灣', '葵涌', '青衣', '馬灣', '屯門', '元朗', '天水圍', '錦田',
    '大埔墟', '大埔滘', '船灣', '落馬洲', '文錦渡',
    '新都城', '東港城', '廣場', 'popcorn'
  ]
};

function determineRegionFromAddress(address) {
  if (!address) return null;
  
  const addressLower = address.toLowerCase();
  
  // Check each region
  for (const [region, keywords] of Object.entries(regionMappings)) {
    for (const keyword of keywords) {
      if (addressLower.includes(keyword.toLowerCase())) {
        return region;
      }
    }
  }
  
  return null; // Unable to determine region
}

async function updateStoreRegions() {
  const configPromise = getPayloadHMR({
    config: path.resolve(__dirname, '../src/payload.config.ts'),
  });
  
  const payload = await configPromise;
  
  try {
    console.log('Fetching all stores...');
    
    // Get all stores
    const { docs: stores } = await payload.find({
      collection: 'stores',
      limit: 1000,
    });
    
    console.log(`Found ${stores.length} stores to process`);
    
    let updatedCount = 0;
    let unableToMapCount = 0;
    const regionCounts = {
      'hong-kong-island': 0,
      'kowloon': 0,
      'new-territories': 0
    };
    
    for (const store of stores) {
      const currentRegion = store.region;
      
      // If region is already set and not null, skip unless it's obviously wrong
      if (currentRegion && currentRegion !== '') {
        console.log(`Store "${store.name}" already has region: ${currentRegion}`);
        regionCounts[currentRegion] = (regionCounts[currentRegion] || 0) + 1;
        continue;
      }
      
      // Determine region from address or name
      const addressText = `${store.name || ''} ${store.address || ''}`;
      const detectedRegion = determineRegionFromAddress(addressText);
      
      if (detectedRegion) {
        console.log(`Updating "${store.name}" → ${detectedRegion}`);
        
        await payload.update({
          collection: 'stores',
          id: store.id,
          data: {
            region: detectedRegion,
          },
        });
        
        updatedCount++;
        regionCounts[detectedRegion]++;
      } else {
        console.log(`Unable to determine region for: "${store.name}" - "${store.address}"`);
        unableToMapCount++;
      }
    }
    
    console.log(`\nUpdate completed:`);
    console.log(`- Updated ${updatedCount} stores with region information`);
    console.log(`- Unable to map ${unableToMapCount} stores`);
    
    console.log('\nFinal regional distribution:');
    Object.entries(regionCounts).forEach(([region, count]) => {
      console.log(`- ${region}: ${count} stores`);
    });
    
    if (unableToMapCount > 0) {
      console.log('\nStores that could not be mapped might need manual review.');
    }
    
  } catch (error) {
    console.error('Error during region update:', error);
  }
}

async function main() {
  try {
    console.log('Starting store region updates...');
    await updateStoreRegions();
    console.log('Region updates completed!');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { updateStoreRegions, determineRegionFromAddress };