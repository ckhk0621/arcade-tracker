# Database Schema Architecture for Arcade Tracker

## Overview

This document outlines the efficient database schema design for real-time photo tracking in the arcade tracker application, optimized for MongoDB with PayloadCMS.

## Core Collections

### 1. Photos Collection (`/src/collections/Photos.ts`)

**Purpose**: Track user-uploaded photos with geolocation, verification workflow, and real-time updates.

**Key Features**:
- Geospatial indexing for location-based queries
- Verification workflow with moderation status
- Points system integration
- Real-time update tracking
- Comprehensive metadata for analytics

**Critical Indexes** (defined via field-level `index: true`):
- `uploadedBy` - User photo history queries
- `store` - Recent photos at store location
- `verificationStatus` - Moderation queue management
- `location` (`2dsphere`) - Geographic proximity searches
- `metadata.likes` - Popular photos ranking
- `lastModified` - Real-time update subscriptions

**Common Query Patterns**:
```javascript
// Recent photos at a store
db.photos.find({ store: storeId, verificationStatus: 'verified' })
  .sort({ createdAt: -1 }).limit(20)

// Photos within geographic area (5km radius)
db.photos.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [lng, lat] },
      $maxDistance: 5000
    }
  },
  verificationStatus: 'verified'
})

// User's photo history
db.photos.find({ uploadedBy: userId }).sort({ createdAt: -1 })
```

### 2. Users Collection (`/src/collections/Users.ts`)

**Purpose**: Enhanced user profiles with gamification, activity tracking, and real-time features.

**Key Features**:
- Level system based on points (100 points = 1 level)
- Activity tracking with streaks
- Comprehensive statistics for engagement
- Badge/achievement system
- Real-time activity monitoring

**Critical Indexes**:
- `points` - Leaderboard queries
- `level` - Level-based filtering
- `activity.lastActive` - Online status tracking
- `displayName` - User search
- `statistics.photosUploaded` - Contributor rankings

### 3. Stores Collection (`/src/collections/Stores.ts`)

**Purpose**: Comprehensive store/location data with popularity metrics and business information.

**Key Features**:
- Enhanced geolocation with 2dsphere indexing
- Structured opening hours by day
- Comprehensive amenities and contact info
- Analytics and popularity scoring
- Real-time trending calculations

**Critical Indexes**:
- `location` (`2dsphere`) - Geographic searches
- `city`, `state` - Location-based filtering
- `category` - Type-based queries
- `popularity` - Trending stores
- `status` - Active locations only

### 4. Machines Collection (`/src/collections/Machines.ts`)

**Purpose**: Arcade machine tracking with difficulty levels, popularity metrics, and operational status.

**Key Features**:
- Machine categorization (cabinet, pinball, redemption, etc.)
- Difficulty rating system
- Popularity scoring based on views, photos, ratings
- Operational status tracking
- Pricing and payment method information

**Critical Indexes**:
- `store` - Machines at specific location
- `type` - Category-based searches
- `difficulty` - Skill-level filtering
- `popularity` - Trending machines
- `status` - Operational machines only

### 5. Comments Collection (`/src/collections/Comments.ts`)

**Purpose**: User-generated content with ratings, moderation workflow, and threaded replies.

**Key Features**:
- Polymorphic relationships (photos, machines, stores)
- Rating system (1-5 stars)
- Moderation workflow with status tracking
- Threaded replies support
- Like/report functionality

**Critical Indexes**:
- `targetType`, `photo/machine/store` - Content-specific comments
- `author` - User's comment history
- `moderationStatus` - Moderation queue
- `parentComment` - Reply threading
- `likes` - Popular comments

## Real-time Query Optimization

### Geographic Queries
```javascript
// Find photos near user location (optimized with 2dsphere index)
{
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [longitude, latitude] },
      $maxDistance: 1000 // meters
    }
  },
  verificationStatus: "verified"
}
```

### Trending/Popular Content
```javascript
// Trending stores (popularity score + recent activity)
db.stores.find({ status: "active" })
  .sort({ popularity: -1, "analytics.photoCount": -1 })
  .limit(10)

// Popular photos at store
db.photos.find({ 
  store: storeId, 
  verificationStatus: "verified" 
}).sort({ "metadata.likes": -1, createdAt: -1 })
```

### Real-time Updates
```javascript
// Recent activity feed (all collections have lastModified)
db.photos.find({ lastModified: { $gte: lastFetchTime } })
db.comments.find({ lastModified: { $gte: lastFetchTime } })
db.machines.find({ lastModified: { $gte: lastFetchTime } })
```

## MongoDB Performance Strategies

### 1. Index Strategy

**Single Field Indexes**: Applied to frequently queried fields
- `userId`, `storeId`, `status`, `verificationStatus`
- `createdAt`, `lastModified` for temporal queries
- `popularity`, `points`, `level` for ranking

**Compound Indexes**: Optimized for complex queries
- PayloadCMS automatically creates compound indexes based on common query patterns
- Geospatial + filter combinations (`location` + `verificationStatus`)
- Temporal + entity combinations (`store` + `createdAt`)

**Geospatial Indexes**: 
- `2dsphere` on all location fields for proximity searches
- Supports complex geographic queries and aggregations

### 2. Query Optimization Patterns

**Pagination**: 
- Use `skip()` and `limit()` with proper indexing
- Consider cursor-based pagination for large datasets

**Aggregation**: 
- Use aggregation pipelines for complex analytics
- Leverage `$match` early in pipeline to reduce dataset size
- Use `$lookup` for relational queries between collections

**Text Search**: 
- PayloadCMS provides built-in full-text search capabilities
- Consider external search solutions (Elasticsearch) for advanced features

### 3. Caching Strategy

**Application Level**:
- Cache frequently accessed store information
- Cache user session data and permissions
- Cache popular/trending content lists

**Database Level**:
- MongoDB's WiredTiger cache automatically handles hot data
- Consider read replicas for scaling read operations

### 4. Data Consistency

**Soft Deletes**: 
- Use status fields instead of hard deletes
- Maintain data integrity for analytics

**Audit Trails**: 
- Track all modifications with timestamps
- Enable real-time sync and conflict resolution

**Referential Integrity**: 
- PayloadCMS handles relationship validation
- Use hooks to maintain denormalized data consistency

## Real-time Features Implementation

### WebSocket Integration
- Real-time photo upload notifications
- Live comment feeds
- User activity status updates
- Store popularity changes

### Change Streams
- MongoDB Change Streams for real-time data sync
- Filter relevant changes per user/location
- Efficient delta updates to minimize bandwidth

### Push Notifications
- New photos at favorite stores
- Comment replies and mentions
- Achievement/badge notifications
- Store status changes

## Monitoring and Analytics

### Performance Metrics
- Query response times by collection
- Index utilization statistics
- Real-time connection counts
- Photo upload/verification rates

### Business Metrics
- User engagement and retention
- Photo submission rates per store
- Popular stores and machines
- Geographic usage patterns

## Migration and Scaling Considerations

### Horizontal Scaling
- Shard by geographic region (`location` field)
- Consider user-based sharding for large user bases
- Separate read replicas for analytics queries

### Data Archival
- Archive old photos and comments
- Maintain aggregated historical data
- Implement data retention policies

### Backup Strategy
- Regular automated backups
- Point-in-time recovery capability
- Geographic backup distribution

This schema design provides a solid foundation for real-time photo tracking with optimal query performance, geographic capabilities, and scalability for the arcade tracker application.