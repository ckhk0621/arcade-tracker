# Map Components

Mobile-focused map components for the Arcade Tracker application.

## Components

### MapView
Interactive OpenStreetMap component with:
- Custom markers for different arcade categories
- User location tracking with GPS
- Mobile-optimized controls (zoom, center location)
- Store popups with detailed information
- Touch-friendly interactions

### StoreList
Searchable and filterable list component with:
- Search by name, address, or city
- Category filtering
- Distance-based sorting (when location available)
- Pull-to-refresh functionality
- Mobile-optimized layout

### MobileStoreLocator
Main container component that orchestrates:
- Map and list view modes (map, list, split)
- Bottom sheet pattern for mobile
- Location services integration
- Store data management and refresh
- PWA-ready design

## Features

### Mobile-First Design
- Touch-optimized interactions
- Responsive layout (mobile, tablet, desktop)
- Bottom sheet pattern for list overlay
- Swipeable view modes

### Location Services
- GPS location tracking
- Distance calculations and sorting
- Current location marker with animation
- Location permission handling

### Store Integration
- PayloadCMS store data integration
- Real-time store refresh
- Category-based filtering and color coding
- Store details with images, ratings, and contact info

### PWA Capabilities
- App-like experience
- Offline-ready architecture
- Installable on mobile devices
- Native app feel with proper metadata

## Usage

```tsx
import { MobileStoreLocator } from '@/components'

function App() {
  return (
    <MobileStoreLocator 
      initialStores={stores}
      onRefresh={refreshStoresFunction}
    />
  )
}
```

## Dependencies

- `leaflet` - OpenStreetMap rendering
- `react-leaflet` - React integration for Leaflet
- `lucide-react` - Icons
- Tailwind CSS for styling