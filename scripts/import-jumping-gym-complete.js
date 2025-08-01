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
  process.exit(1);
}

async function updateExistingStores() {
  const configPromise = getPayloadHMR({
    config: path.resolve(__dirname, '../src/payload.config.ts'),
  });
  
  const payload = await configPromise;
  
  try {
    console.log('Fetching existing JumpinGym stores...');
    
    // Get all existing JumpinGym stores
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
      limit: 1000,
    });
    
    console.log(`Found ${existingStores.length} existing JumpinGym stores`);
    
    // Delete all existing JumpinGym stores first to start fresh
    if (existingStores.length > 0) {
      console.log(`Deleting ${existingStores.length} existing JumpinGym stores...`);
      for (const store of existingStores) {
        await payload.delete({
          collection: 'stores',
          id: store.id
        });
      }
      console.log('✅ Existing stores deleted.');
    }
    
    let createdCount = 0;
    let errorCount = 0;
    
    // Create all new stores
    for (const jumpingGymStore of jumpingGymStores) {
      try {
        console.log(`Creating store: ${jumpingGymStore.name}`);
        
        const newStore = await payload.create({
          collection: 'stores',
          data: jumpingGymStore,
        });
        
        createdCount++;
        console.log(`✅ Created: ${jumpingGymStore.name} (ID: ${newStore.id})`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error creating ${jumpingGymStore.name}:`, error.message);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully created: ${createdCount} stores`);
    console.log(`❌ Errors: ${errorCount} stores`);
    console.log(`📊 Total processed: ${jumpingGymStores.length} stores`);
    
    // Display regional summary
    const regionSummary = jumpingGymStores.reduce((acc, store) => {
      const region = extractRegionFromCity(store.city);
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nSTORES BY REGION:');
    Object.entries(regionSummary).forEach(([region, count]) => {
      console.log(`  ${region}: ${count} stores`);
    });
    
  } catch (error) {
    console.error('Error during import:', error);
  }
}

function extractRegionFromCity(city) {
  // Hong Kong Island cities
  if (['太古', '北角', '小西灣', '銅鑼灣'].some(hkCity => city.includes(hkCity))) {
    return 'Hong Kong Island';
  }
  
  // Kowloon cities  
  if (['黃埔', '尖沙咀', '旺角', '觀塘', '九龍灣'].some(klnCity => city.includes(klnCity))) {
    return 'Kowloon';
  }
  
  // New Territories cities
  if (['將軍澳', '荃灣', '屯門', '沙田', '元朗', '大埔', '上水', '粉嶺', '東涌'].some(ntCity => city.includes(ntCity))) {
    return 'New Territories';
  }
  
  return 'Other';
}

async function main() {
  try {
    console.log('🚀 Starting complete Jumping Gym store import...');
    await updateExistingStores();
    console.log('🎉 Import completed successfully!');
  } catch (error) {
    console.error('💥 Error in main function:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { updateExistingStores, jumpingGymStores };