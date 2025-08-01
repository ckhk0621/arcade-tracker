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
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('='); // Handle values with = in them
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  }
}

async function importCompleteJumpingGymData() {
  const configPromise = import(path.resolve(__dirname, '../src/payload.config.ts'));
  
  const payload = await getPayloadHMR({
    config: configPromise,
  });
  
  try {
    console.log('Loading complete Jumping Gym store data...');
    
    // Read the generated payload data file
    const dataPath = path.join(__dirname, '../data/jumping-gym-payload.json');
    const storeData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    console.log(`Found ${storeData.length} stores to import`);
    
    // Get all existing JumpinGym stores first
    const { docs: existingStores } = await payload.find({
      collection: 'stores',
      where: {
        or: [
          {
            'contact.website': {
              contains: 'jumpingym.com'
            }
          },
          {
            name: {
              contains: 'Jumping Gym'
            }
          },
          {
            tags: {
              some: {
                tag: {
                  equals: 'trampoline'
                }
              }
            }
          }
        ]
      },
      limit: 1000
    });
    
    console.log(`Found ${existingStores.length} existing JumpinGym stores`);
    console.log('Existing stores:', existingStores.map(s => s.name));
    
    // Clear existing JumpinGym stores first
    if (existingStores.length > 0) {
      console.log(`Deleting ${existingStores.length} existing JumpinGym stores...`);
      for (const store of existingStores) {
        await payload.delete({
          collection: 'stores',
          id: store.id
        });
      }
      console.log('Existing stores deleted.');
    }
    
    let importedCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Import all the new stores
    for (const storeInfo of storeData) {
      try {
        console.log(`Creating store: ${storeInfo.name}`);
        
        const newStore = await payload.create({
          collection: 'stores',
          data: storeInfo
        });
        
        importedCount++;
        console.log(`✅ Created: ${storeInfo.name} (ID: ${newStore.id})`);
        
      } catch (error) {
        errorCount++;
        const errorMsg = `❌ Error creating ${storeInfo.name}: ${error.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully imported: ${importedCount} stores`);
    console.log(`❌ Errors: ${errorCount} stores`);
    console.log(`📊 Total processed: ${storeData.length} stores`);
    
    // Display regional breakdown
    const regionBreakdown = storeData.reduce((acc, store) => {
      const region = extractRegionFromData(store);
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nSTORES BY REGION:');
    Object.entries(regionBreakdown).forEach(([region, count]) => {
      console.log(`  ${region}: ${count} stores`);
    });
    
    if (errors.length > 0) {
      console.log('\nERRORS:');
      errors.forEach(error => console.log(`  ${error}`));
    }
    
    console.log('\n✨ Import completed!');
    
  } catch (error) {
    console.error('❌ Fatal error during import:', error);
    throw error;
  }
}

function extractRegionFromData(store) {
  // Extract region from city or use coordinates to determine region
  const city = store.city.toLowerCase();
  
  // Hong Kong Island cities
  if (['太古', '北角', '小西灣', '銅鑼灣'].some(hkCity => city.includes(hkCity.toLowerCase()))) {
    return 'Hong Kong Island';
  }
  
  // Kowloon cities  
  if (['黃埔', '尖沙咀', '旺角', '觀塘', '九龍灣'].some(klnCity => city.includes(klnCity.toLowerCase()))) {
    return 'Kowloon';
  }
  
  // New Territories cities
  if (['將軍澳', '荃灣', '屯門', '沙田', '元朗', '大埔', '上水', '粉嶺', '東涌'].some(ntCity => city.includes(ntCity.toLowerCase()))) {
    return 'New Territories';
  }
  
  return 'Unknown';
}

async function main() {
  try {
    console.log('🚀 Starting complete Jumping Gym store import...');
    await importCompleteJumpingGymData();
    console.log('🎉 Import completed successfully!');
  } catch (error) {
    console.error('💥 Error in main function:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { importCompleteJumpingGymData };