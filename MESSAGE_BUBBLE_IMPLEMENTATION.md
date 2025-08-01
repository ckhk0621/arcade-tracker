# Message Bubble Implementation

## Overview
Added interactive message bubbles that appear near map pins when users click on stores in the store list. The bubbles display store information in Traditional Chinese and auto-dismiss after 5 seconds.

## Files Modified/Created

### New Files Created:
1. `/src/components/map/MessageBubble.tsx` - Main message bubble component
2. `/MESSAGE_BUBBLE_IMPLEMENTATION.md` - This documentation file

### Files Modified:
1. `/src/components/map/MapView.tsx` - Added bubble positioning logic and integration
2. `/src/components/MobileStoreLocator.tsx` - Added bubble state management
3. `/src/components/map/index.ts` - Exported MessageBubble component
4. `/src/app/(frontend)/globals.css` - Added bubble animations and responsive styles

## Features Implemented

### 1. Message Bubble Component (`MessageBubble.tsx`)
- **Position Calculation**: Dynamic positioning relative to map pins
- **Responsive Design**: Adapts to mobile and desktop layouts
- **Auto-dismiss**: Closes after 5 seconds or on outside click
- **Traditional Chinese Content**: All text in Traditional Chinese
- **Smooth Animations**: Fade-in/fade-out with scale effects

### 2. Bubble Content (Dummy Data)
- Store name in Traditional Chinese
- Operating hours: "營業時間: 10:00 - 22:00"
- Rating display with stars: "評分: 4.5/5 ⭐⭐⭐⭐⭐"
- Distance calculation: Shows actual distance from user location
- Description: "熱門的蹦床公園，適合全家大小一起玩樂"
- Action button: "查看詳細" (View Details)

### 3. Visual Design
- Uses shadcn/ui styling for consistency
- Backdrop blur and shadow effects
- Arrow pointing to the pin (hidden on mobile)
- Responsive sizing for different screen sizes
- Smooth transitions and animations

### 4. Technical Implementation

#### State Management
- `showMessageBubble`: Controls bubble visibility
- `bubblePosition`: Tracks bubble screen coordinates
- Separate handling for list clicks vs map clicks

#### Position Calculation
- Real-time coordinate conversion from map coordinates to screen pixels
- Dynamic repositioning on map zoom/pan events
- Edge detection to keep bubble within viewport

#### Event Handling
- Map event listeners for position updates (zoom, move, resize)
- Outside click detection for auto-close
- Touch-friendly interactions on mobile

#### Responsive Behavior
- **Desktop**: Fixed positioning near pin with arrow
- **Mobile**: Full-width layout at top of screen, no arrow
- **Animation**: CSS transitions with hardware acceleration

## Usage

### Triggering the Bubble
1. User clicks on a store in the store list (left panel)
2. Map flies to the store location
3. Message bubble appears near the corresponding pin
4. Bubble auto-closes after 5 seconds or when user clicks elsewhere

### Integration Points
- **StoreList**: Passes `fromList: true` to `onStoreSelect` when store clicked
- **MobileStoreLocator**: Manages bubble state and passes props to MapView
- **MapView**: Handles positioning calculations and renders the bubble

## Mobile Optimizations
- Full-width bubble layout on screens ≤640px
- Touch-friendly close interactions
- No arrow pointer on mobile (cleaner design)
- Optimized positioning to avoid keyboard interference

## Performance Considerations
- Uses `useCallback` for position calculations
- Hardware-accelerated CSS animations
- Efficient event listener management
- Debounced position updates during map interactions

## Future Enhancements
1. **Real Data Integration**: Replace dummy data with actual store details
2. **Action Handling**: Implement "查看詳細" button functionality
3. **Animation Variants**: Add different entrance/exit animations
4. **Accessibility**: Enhanced keyboard navigation and screen reader support
5. **Customization**: Theme-based styling options

## Testing
- Build process completes successfully
- TypeScript compilation passes
- Responsive design tested for mobile and desktop layouts
- Cross-browser compatibility considerations included