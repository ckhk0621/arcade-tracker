import path from 'path';
import { updateStoreRegions } from './update-store-regions.js';
import { updateExistingStores } from './import-jumping-gym-stores.js';

async function setupRegionalStores() {
  console.log('🚀 Starting regional store setup...\n');
  
  try {
    // Step 1: Update existing records with region information
    console.log('📍 Step 1: Updating existing stores with region information...');
    await updateStoreRegions();
    
    console.log('\n⏳ Waiting 2 seconds before next step...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 2: Import Jumping Gym stores with regional data
    console.log('🏪 Step 2: Importing/updating Jumping Gym stores...');
    await updateExistingStores();
    
    console.log('\n✅ Regional store setup completed successfully!');
    console.log('\nSummary of changes:');
    console.log('- Added "region" field to Stores collection');
    console.log('- Updated existing stores with region information where possible');
    console.log('- Imported/updated Jumping Gym stores with detailed regional data');
    console.log('- All stores now support filtering by region: hong-kong-island, kowloon, new-territories');
    
  } catch (error) {
    console.error('❌ Error during regional store setup:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  setupRegionalStores();
}

export { setupRegionalStores };