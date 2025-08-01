# Jumping Gym Store Import Guide

This guide explains how to import Jumping Gym store locations into your PayloadCMS arcade tracker.

## What This Does

The import system:
1. **Scrapes** store location data from jumpingym.com/branches
2. **Processes** the data into PayloadCMS-compatible format
3. **Geocodes** addresses with Hong Kong coordinates
4. **Imports** stores into your PayloadCMS database
5. **Updates** existing stores or creates new ones

## Quick Start

### 1. Process the Data
```bash
pnpm run import:jumping-gym:process
```

### 2. Check Status
```bash
pnpm run import:jumping-gym:status
```

### 3. Import to PayloadCMS
You'll need an admin token from PayloadCMS:

```bash
# Option 1: Using token directly
pnpm run import:jumping-gym -- complete YOUR_TOKEN_HERE

# Option 2: Set environment variable
export PAYLOAD_TOKEN="your_token_here"
pnpm run import:jumping-gym
```

## Getting Your Token

1. Start your PayloadCMS server: `pnpm dev`
2. Go to http://localhost:4400/admin
3. Login as admin
4. Use browser dev tools to find your JWT token in localStorage or cookies
5. Or use the PayloadCMS login API to get a token

## Manual Steps

### Process Data Only
```bash
node scripts/import-jumping-gym.js process
```

### Validate Coordinates
```bash
node scripts/import-jumping-gym.js validate
```

### Check Import Status
```bash
node scripts/import-jumping-gym.js status
```

### Import to Database
```bash
node scripts/import-jumping-gym.js import YOUR_TOKEN
```

### Complete Process
```bash
node scripts/import-jumping-gym.js complete YOUR_TOKEN
```

## What Gets Imported

Each Jumping Gym location includes:
- **Name**: Store name in Chinese
- **Address**: Full Hong Kong address
- **Location**: GPS coordinates for map display
- **Contact**: Phone number and website
- **Hours**: Operating hours for each day
- **Category**: Set to "family" (family fun center)
- **Amenities**: Parking, parties, groups, restrooms, wifi
- **Tags**: trampoline, kids, family, indoor, exercise, birthday-parties, group-activities

## Files Created

- `data/jumping-gym-raw.json` - Original scraped data
- `data/jumping-gym-payload.json` - PayloadCMS-formatted data

## API Endpoints

- `GET /api/import/jumping-gym` - Check import status
- `POST /api/import/jumping-gym` - Import stores (requires admin token)

## Store Locations Included

The import includes 12 Jumping Gym locations across Hong Kong:

1. **太古城中心** - Tai Koo Shing
2. **北角匯二期** - North Point
3. **荃灣愉景新城** - Tsuen Wan
4. **屯門市廣場二期** - Tuen Mun
5. **沙田新城市廣場三期** - Sha Tin
6. **將軍澳東港城** - Tseung Kwan O
7. **觀塘apm** - Kwun Tong (24-hour location)
8. **尖沙咀K11 MUSEA** - Tsim Sha Tsui
9. **九龍灣德福廣場二期** - Kowloon Bay
10. **旺角朗豪坊** - Mong Kok
11. **元朗廣場** - Yuen Long
12. **大埔超級城** - Tai Po

## Troubleshooting

### "Authentication required" error
- Make sure you're using a valid admin token
- Check that your PayloadCMS server is running
- Verify the token hasn't expired

### "Store data file not found" error
- Run the process step first: `pnpm run import:jumping-gym:process`
- Check that `data/` directory exists

### Coordinates not showing on map
- Verify the frontend map component is configured for Hong Kong
- Check that the location field is properly set up in the Stores collection
- Ensure the map is centered on Hong Kong coordinates

## Next Steps

After importing:
1. Check the PayloadCMS admin panel to see your new stores
2. Visit the frontend map to see locations displayed
3. Test the store locator functionality
4. Add photos or additional details to the stores
5. Consider setting up regular data updates

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify your PayloadCMS configuration
3. Test the API endpoints directly
4. Check that all dependencies are installed