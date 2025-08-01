import type { CollectionConfig } from 'payload'

export const Stores: CollectionConfig = {
  slug: 'stores',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'region', 'city', 'state', 'popularity', 'status'],
    listSearchableFields: ['name', 'address', 'city', 'region'],
    group: 'Locations',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Calculate popularity score based on views, photos, and check-ins
        if (data.analytics) {
          const { views = 0, photoCount = 0, checkIns = 0, averageRating = 0 } = data.analytics
          data.popularity = Math.round((views * 0.2) + (photoCount * 3) + (checkIns * 2) + (averageRating * 8))
        }
        
        // Set last modified for real-time updates
        data.lastModified = new Date()
        
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Name of the arcade or entertainment venue',
      },
    },
    {
      name: 'address',
      type: 'text',
      required: false,
      admin: {
        description: 'Street address',
      },
    },
    {
      name: 'city',
      type: 'text',
      required: false,
      index: true,
      admin: {
        description: 'City',
      },
    },
    {
      name: 'state',
      type: 'text',
      required: false,
      index: true,
      admin: {
        description: 'State or province',
      },
    },
    {
      name: 'region',
      type: 'select',
      required: false,
      index: true,
      options: [
        {
          label: '香港島',
          value: 'hong-kong-island',
        },
        {
          label: '九龍',
          value: 'kowloon',
        },
        {
          label: '新界',
          value: 'new-territories',
        },
      ],
      admin: {
        description: 'Region within Hong Kong for filtering locations',
      },
    },
    {
      name: 'postalCode',
      type: 'text',
      required: false,
      admin: {
        description: 'ZIP or postal code',
      },
    },
    {
      name: 'country',
      type: 'text',
      required: false,
      defaultValue: 'US',
      admin: {
        description: 'Country code (default: US)',
      },
    },
    {
      name: 'location',
      type: 'point',
      required: false,
      index: true,
      admin: {
        description: 'GPS coordinates for geolocation queries',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
      admin: {
        description: 'Description of the venue and its offerings',
      },
    },
    {
      name: 'images',
      type: 'array',
      required: false,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          required: false,
        },
        {
          name: 'isPrimary',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
      admin: {
        description: 'Store images and photos',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: false,
      index: true,
      options: [
        {
          label: 'Arcade',
          value: 'arcade',
        },
        {
          label: 'Restaurant with Arcade',
          value: 'restaurant',
        },
        {
          label: 'Entertainment Center',
          value: 'entertainment',
        },
        {
          label: 'Bowling Alley',
          value: 'bowling',
        },
        {
          label: '詳細',
          value: 'family',
        },
        {
          label: 'Bar/Barcade',
          value: 'bar',
        },
        {
          label: 'Mall Arcade',
          value: 'mall',
        },
      ],
      admin: {
        description: 'Type of venue',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      index: true,
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Temporarily Closed',
          value: 'temp_closed',
        },
        {
          label: 'Permanently Closed',
          value: 'closed',
        },
        {
          label: 'Coming Soon',
          value: 'coming_soon',
        },
      ],
      admin: {
        description: 'Current operational status',
      },
    },
    {
      name: 'contact',
      type: 'group',
      fields: [
        {
          name: 'phone',
          type: 'text',
          admin: {
            description: 'Phone number',
          },
        },
        {
          name: 'email',
          type: 'email',
          admin: {
            description: 'Contact email',
          },
        },
        {
          name: 'website',
          type: 'text',
          admin: {
            description: 'Website URL',
          },
        },
        {
          name: 'socialMedia',
          type: 'group',
          fields: [
            {
              name: 'facebook',
              type: 'text',
            },
            {
              name: 'instagram',
              type: 'text',
            },
            {
              name: 'twitter',
              type: 'text',
            },
          ],
        },
      ],
      admin: {
        description: 'Contact information',
      },
    },
    {
      name: 'openingHours',
      type: 'group',
      fields: [
        {
          name: 'monday',
          type: 'text',
          admin: {
            description: 'e.g., "9:00-22:00" or "Closed"',
          },
        },
        {
          name: 'tuesday',
          type: 'text',
          admin: {
            description: 'e.g., "9:00-22:00" or "Closed"',
          },
        },
        {
          name: 'wednesday',
          type: 'text',
          admin: {
            description: 'e.g., "9:00-22:00" or "Closed"',
          },
        },
        {
          name: 'thursday',
          type: 'text',
          admin: {
            description: 'e.g., "9:00-22:00" or "Closed"',
          },
        },
        {
          name: 'friday',
          type: 'text',
          admin: {
            description: 'e.g., "9:00-24:00" or "Closed"',
          },
        },
        {
          name: 'saturday',
          type: 'text',
          admin: {
            description: 'e.g., "9:00-24:00" or "Closed"',
          },
        },
        {
          name: 'sunday',
          type: 'text',
          admin: {
            description: 'e.g., "12:00-20:00" or "Closed"',
          },
        },
        {
          name: 'specialHours',
          type: 'textarea',
          admin: {
            description: 'Holiday hours or special notes',
          },
        },
      ],
      admin: {
        description: 'Operating hours by day of week',
      },
    },
    {
      name: 'amenities',
      type: 'array',
      fields: [
        {
          name: 'amenity',
          type: 'select',
          options: [
            { label: 'Food & Drinks', value: 'food' },
            { label: 'Parking', value: 'parking' },
            { label: 'WiFi', value: 'wifi' },
            { label: 'Birthday Parties', value: 'parties' },
            { label: 'Tournaments', value: 'tournaments' },
            { label: 'Redemption Center', value: 'redemption' },
            { label: 'ATM', value: 'atm' },
            { label: 'Restrooms', value: 'restrooms' },
            { label: 'Wheelchair Accessible', value: 'accessible' },
            { label: 'Group Events', value: 'groups' },
          ],
          required: true,
        },
      ],
      admin: {
        description: 'Available amenities and services',
      },
    },
    {
      name: 'pricing',
      type: 'group',
      fields: [
        {
          name: 'acceptsCash',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'acceptsCards',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'hasTokens',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Uses physical tokens',
          },
        },
        {
          name: 'hasPlayCards',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Uses rechargeable play cards',
          },
        },
        {
          name: 'priceRange',
          type: 'select',
          options: [
            { label: '$ (Budget-friendly)', value: 'budget' },
            { label: '$$ (Moderate)', value: 'moderate' },
            { label: '$$$ (Higher-end)', value: 'premium' },
          ],
        },
      ],
      admin: {
        description: 'Payment methods and pricing info',
      },
    },
    {
      name: 'analytics',
      type: 'group',
      fields: [
        {
          name: 'views',
          type: 'number',
          defaultValue: 0,
          min: 0,
          index: true,
          admin: {
            description: 'Number of times store page was viewed',
          },
        },
        {
          name: 'photoCount',
          type: 'number',
          defaultValue: 0,
          min: 0,
          index: true,
          admin: {
            description: 'Number of photos uploaded at this store',
          },
        },
        {
          name: 'checkIns',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Number of user check-ins',
          },
        },
        {
          name: 'averageRating',
          type: 'number',
          defaultValue: 0,
          min: 0,
          max: 5,
          admin: {
            description: 'Average user rating (0-5 stars)',
          },
        },
        {
          name: 'totalRatings',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Total number of ratings received',
          },
        },
        {
          name: 'machineCount',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            description: 'Number of machines at this location',
          },
        },
      ],
      admin: {
        description: 'Analytics and engagement metrics',
      },
    },
    {
      name: 'popularity',
      type: 'number',
      defaultValue: 0,
      min: 0,
      index: true,
      admin: {
        description: 'Calculated popularity score (auto-generated)',
        readOnly: true,
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description: 'Mark as featured store',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Tags for categorizing and searching stores',
      },
    },
    {
      name: 'lastModified',
      type: 'date',
      required: false,
      index: true,
      admin: {
        description: 'Last modification timestamp for real-time updates',
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}