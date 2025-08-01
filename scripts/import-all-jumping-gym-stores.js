#!/usr/bin/env node

/**
 * Complete JumpinGym Store Import Script
 * Clears existing stores and imports all 29 stores with proper region assignments
 */

import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { getPayloadHMR } from '@payloadcms/next/utilities'

// Load environment variables manually
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read .env file and set environment variables
const envPath = path.resolve(__dirname, '../.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  const envLines = envContent.split('\n')
  
  for (const line of envLines) {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, value] = line.split('=')
      if (key && value) {
        process.env[key.trim()] = value.trim()
      }
    }
  }
  
  console.log('Environment loaded:')
  console.log('  DATABASE_URI:', process.env.DATABASE_URI ? 'Set' : 'Missing')
  console.log('  PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET ? 'Set' : 'Missing')
}

// Region mapping based on Hong Kong geography
const REGION_MAPPING = {
  // Hong Kong Island (6 stores)
  '太古': 'hong-kong-island',
  '北角': 'hong-kong-island', 
  '小西灣': 'hong-kong-island',
  '銅鑼灣': 'hong-kong-island',
  '黃竹坑': 'hong-kong-island', // The Southside is in Hong Kong Island
  
  // Kowloon (11 stores)
  '黃埔': 'kowloon',
  '尖沙咀': 'kowloon',
  '旺角': 'kowloon',
  '長沙灣': 'kowloon', // West Kowloon Centre
  '觀塘': 'kowloon',
  '九龍灣': 'kowloon',
  
  // New Territories (12 stores)
  '將軍澳': 'new-territories',
  '荃灣': 'new-territories',
  '屯門': 'new-territories',
  '沙田': 'new-territories',
  '元朗': 'new-territories',
  '大埔': 'new-territories',
  '上水': 'new-territories',
  '粉嶺': 'new-territories',
  '東涌': 'new-territories'
}

function getRegionForStore(store) {
  const city = store.city
  const region = REGION_MAPPING[city]
  
  if (!region) {
    console.warn(`⚠️  No region mapping found for city: ${city}`)
    // Try to determine from address
    if (store.address.includes('香港') || store.address.includes('銅鑼灣') || store.address.includes('中環') || store.address.includes('太古')) {
      return 'hong-kong-island'
    } else if (store.address.includes('九龍') || store.address.includes('尖沙咀') || store.address.includes('旺角')) {
      return 'kowloon'
    } else {
      return 'new-territories'
    }
  }
  
  return region
}

async function clearExistingStores(payload) {
  console.log('🗑️  Clearing existing stores...')
  
  try {
    // Get all existing stores
    const existingStores = await payload.find({
      collection: 'stores',
      limit: 1000
    })
    
    console.log(`Found ${existingStores.docs.length} existing stores`)
    
    // Delete each store
    for (const store of existingStores.docs) {
      await payload.delete({
        collection: 'stores',
        id: store.id
      })
      console.log(`   Deleted: ${store.name}`)
    }
    
    console.log('✅ All existing stores cleared')
  } catch (error) {
    console.error('❌ Error clearing existing stores:', error)
    throw error
  }
}

async function importStores(payload) {
  console.log('📦 Loading store data...')
  
  // Load the complete store data
  const dataPath = path.resolve(__dirname, '../data/jumping-gym-payload.json')
  const storeData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  
  console.log(`Found ${storeData.length} stores to import`)
  
  const regionCounts = {
    'hong-kong-island': 0,
    'kowloon': 0,
    'new-territories': 0
  }
  
  console.log('\n🏪 Importing stores...')
  
  for (const store of storeData) {
    try {
      // Assign region
      const region = getRegionForStore(store)
      store.region = region
      regionCounts[region]++
      
      // Create the store
      const createdStore = await payload.create({
        collection: 'stores',
        data: store
      })
      
      console.log(`   ✅ ${store.name} (${store.city}) → ${region}`)
    } catch (error) {
      console.error(`   ❌ Failed to import ${store.name}:`, error)
    }
  }
  
  console.log('\n📊 Import Summary:')
  console.log(`   Hong Kong Island: ${regionCounts['hong-kong-island']} stores`)
  console.log(`   Kowloon: ${regionCounts['kowloon']} stores`)
  console.log(`   New Territories: ${regionCounts['new-territories']} stores`)
  console.log(`   Total: ${Object.values(regionCounts).reduce((a, b) => a + b, 0)} stores`)
  
  return regionCounts
}

async function verifyImport(payload) {
  console.log('\n🔍 Verifying import...')
  
  try {
    const allStores = await payload.find({
      collection: 'stores',
      limit: 1000
    })
    
    const regionCounts = allStores.docs.reduce((counts, store) => {
      counts[store.region] = (counts[store.region] || 0) + 1
      return counts
    }, {})
    
    console.log('✅ Verification Results:')
    console.log(`   Total stores in database: ${allStores.docs.length}`)
    console.log(`   Hong Kong Island: ${regionCounts['hong-kong-island'] || 0} stores`)
    console.log(`   Kowloon: ${regionCounts['kowloon'] || 0} stores`)
    console.log(`   New Territories: ${regionCounts['new-territories'] || 0} stores`)
    
    // Expected counts
    const expectedCounts = {
      'hong-kong-island': 6,
      'kowloon': 11,
      'new-territories': 12
    }
    
    let allCorrect = true
    for (const [region, expected] of Object.entries(expectedCounts)) {
      const actual = regionCounts[region] || 0
      if (actual !== expected) {
        console.log(`   ⚠️  ${region}: Expected ${expected}, got ${actual}`)
        allCorrect = false
      }
    }
    
    if (allCorrect && allStores.docs.length === 29) {
      console.log('🎉 Import verification PASSED! All 29 stores imported correctly.')
    } else {
      console.log('❌ Import verification FAILED! Counts do not match expected values.')
    }
    
    return allStores.docs.length === 29 && allCorrect
  } catch (error) {
    console.error('❌ Error during verification:', error)
    return false
  }
}

async function run() {
  try {
    console.log('🚀 Starting complete JumpinGym store import...')
    
    // Get Payload instance
    const configPromise = getPayloadHMR({
      config: path.resolve(__dirname, '../src/payload.config.ts'),
    })
    
    const payload = await configPromise
    
    console.log('✅ Payload initialized')
    
    // Step 1: Clear existing stores
    await clearExistingStores(payload)
    
    // Step 2: Import all stores with regions
    await importStores(payload)
    
    // Step 3: Verify the import
    const success = await verifyImport(payload)
    
    if (success) {
      console.log('\n🎉 SUCCESS: All 29 JumpinGym stores imported successfully!')
      console.log('   Expected distribution:')
      console.log('   - Hong Kong Island: 6 stores')
      console.log('   - Kowloon: 11 stores')
      console.log('   - New Territories: 12 stores')
    } else {
      console.log('\n❌ FAILURE: Import completed with errors or incorrect counts.')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

// Run the import
run()