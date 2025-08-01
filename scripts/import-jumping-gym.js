/**
 * Jumping Gym Import Management Script
 * Handles the complete process of fetching and importing store data
 */

import { JumpingGymDataProcessor } from './fetch-jumping-gym-data.js';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

class JumpingGymImporter {
  constructor(apiBaseUrl = 'http://localhost:3000') {
    this.apiBaseUrl = apiBaseUrl;
    this.processor = new JumpingGymDataProcessor();
  }

  async processData() {
    console.log('🔄 Processing Jumping Gym store data...');
    try {
      await this.processor.saveData();
      console.log('✅ Data processing completed');
      return true;
    } catch (error) {
      console.error('❌ Data processing failed:', error);
      return false;
    }
  }

  async checkImportStatus() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/import/jumping-gym`);
      const data = await response.json();
      
      console.log('\n📊 Import Status:');
      console.log(`- Data file exists: ${data.dataFileExists ? '✅' : '❌'}`);
      console.log(`- Stores in file: ${data.storesInFile}`);
      console.log(`- Existing Jumping Gym stores: ${data.existingJumpingGymStores}`);
      
      if (data.existingStoreNames.length > 0) {
        console.log('\n📍 Existing stores:');
        data.existingStoreNames.forEach(name => console.log(`  - ${name}`));
      }
      
      if (data.preview && data.preview.length > 0) {
        console.log('\n🔍 Preview of new data:');
        data.preview.forEach((store, index) => {
          console.log(`  ${index + 1}. ${store.name} - ${store.address}`);
        });
      }
      
      return data;
    } catch (error) {
      console.error('❌ Failed to check import status:', error);
      return null;
    }
  }

  async importToPayload(token) {
    if (!token) {
      console.error('❌ Authentication token required');
      console.log('💡 Get your token from PayloadCMS admin panel or login API');
      return false;
    }

    console.log('🚀 Starting import to PayloadCMS...');
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/import/jumping-gym`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Import completed successfully!');
        console.log(`📈 Results: ${result.message}`);
        
        if (result.results.details.length > 0) {
          console.log('\n📋 Detailed results:');
          result.results.details.forEach(detail => {
            const icon = detail.action === 'created' ? '➕' : 
                        detail.action === 'updated' ? '🔄' : '❌';
            console.log(`  ${icon} ${detail.action.toUpperCase()}: ${detail.name}`);
            if (detail.error) {
              console.log(`     Error: ${detail.error}`);
            }
          });
        }
        
        return true;
      } else {
        console.error('❌ Import failed:', result.error);
        if (result.details) {
          console.error('Details:', result.details);
        }
        return false;
      }
    } catch (error) {
      console.error('❌ Import request failed:', error);
      return false;
    }
  }

  async validateGeocoding() {
    console.log('🗺️  Validating geocoding...');
    
    try {
      const dataPath = path.join(process.cwd(), 'data', 'jumping-gym-payload.json');
      const fileContent = await fs.readFile(dataPath, 'utf8');
      const storeData = JSON.parse(fileContent);
      
      const validation = {
        total: storeData.length,
        withCoordinates: 0,
        validCoordinates: 0,
        issues: []
      };
      
      storeData.forEach((store, index) => {
        if (store.location && store.location.coordinates) {
          validation.withCoordinates++;
          
          const [lng, lat] = store.location.coordinates;
          // Check if coordinates are within Hong Kong bounds (GeoJSON: [longitude, latitude])
          if (lat >= 22.1 && lat <= 22.6 && lng >= 113.8 && lng <= 114.5) {
            validation.validCoordinates++;
          } else {
            validation.issues.push({
              store: store.name,
              coordinates: [lng, lat],
              issue: 'Coordinates outside Hong Kong bounds'
            });
          }
        } else {
          validation.issues.push({
            store: store.name,
            issue: 'Missing coordinates'
          });
        }
      });
      
      console.log(`📍 Geocoding validation:`);
      console.log(`  - Total stores: ${validation.total}`);
      console.log(`  - With coordinates: ${validation.withCoordinates}`);
      console.log(`  - Valid coordinates: ${validation.validCoordinates}`);
      
      if (validation.issues.length > 0) {
        console.log(`\n⚠️  Issues found:`);
        validation.issues.forEach(issue => {
          console.log(`  - ${issue.store}: ${issue.issue}`);
          if (issue.coordinates) {
            console.log(`    Coordinates: [${issue.coordinates.join(', ')}]`);
          }
        });
      }
      
      return validation;
    } catch (error) {
      console.error('❌ Geocoding validation failed:', error);
      return null;
    }
  }

  async runComplete(token) {
    console.log('🎯 Starting complete Jumping Gym import process...\n');
    
    // Step 1: Process data
    const processSuccess = await this.processData();
    if (!processSuccess) {
      console.log('❌ Process failed at data processing step');
      return false;
    }
    
    // Step 2: Validate geocoding
    await this.validateGeocoding();
    
    // Step 3: Check current status
    await this.checkImportStatus();
    
    // Step 4: Import to PayloadCMS
    if (token) {
      const importSuccess = await this.importToPayload(token);
      if (importSuccess) {
        console.log('\n🎉 Complete process finished successfully!');
        console.log('💡 Your stores should now be visible in the PayloadCMS admin panel');
        console.log('💡 Check the frontend map to see the new locations');
        return true;
      }
    } else {
      console.log('\n⏸️  Data processing completed, but import skipped (no token provided)');
      console.log('💡 To complete the import, run: node scripts/import-jumping-gym.js [your-token]');
      return false;
    }
    
    return false;
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const token = args[1] || process.env.PAYLOAD_TOKEN;
  
  const importer = new JumpingGymImporter();
  
  switch (command) {
    case 'process':
      await importer.processData();
      break;
      
    case 'status':
      await importer.checkImportStatus();
      break;
      
    case 'validate':
      await importer.validateGeocoding();
      break;
      
    case 'import':
      if (!token) {
        console.error('❌ Token required for import');
        console.log('Usage: node scripts/import-jumping-gym.js import [your-token]');
        process.exit(1);
      }
      await importer.importToPayload(token);
      break;
      
    case 'complete':
    default:
      await importer.runComplete(token);
      break;
  }
}

// Export for programmatic use
export { JumpingGymImporter };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}