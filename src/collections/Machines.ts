import type { CollectionConfig } from 'payload'

export const Machines: CollectionConfig = {
  slug: 'machines',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'difficulty', 'store', 'status', 'popularity'],
    listSearchableFields: ['name', 'manufacturer', 'tags.tag'],
    group: 'Content',
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
        // Calculate popularity score based on views and photos
        if (data.analytics) {
          const { views = 0, photoCount = 0, averageRating = 0 } = data.analytics
          data.popularity = Math.round((views * 0.3) + (photoCount * 5) + (averageRating * 10))
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
        description: 'Name of the arcade machine or game',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      index: true,
      options: [
        {
          label: 'Arcade Cabinet',
          value: 'cabinet',
        },
        {
          label: 'Pinball Machine',
          value: 'pinball',
        },
        {
          label: 'Redemption Game',
          value: 'redemption',
        },
        {
          label: 'Skill Game',
          value: 'skill',
        },
        {
          label: 'Rhythm Game',
          value: 'rhythm',
        },
        {
          label: 'Shooting Game',
          value: 'shooting',
        },
        {
          label: 'Racing Game',
          value: 'racing',
        },
        {
          label: 'Prize Machine',
          value: 'prize',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
      admin: {
        description: 'Category of arcade machine',
      },
    },
    {
      name: 'store',
      type: 'relationship',
      relationTo: 'stores',
      required: true,
      index: true,
      admin: {
        description: 'Store location where this machine is found',
      },
    },
    {
      name: 'difficulty',
      type: 'select',
      required: false,
      defaultValue: 'medium',
      index: true,
      options: [
        {
          label: 'Beginner',
          value: 'beginner',
        },
        {
          label: 'Easy',
          value: 'easy',
        },
        {
          label: 'Medium',
          value: 'medium',
        },
        {
          label: 'Hard',
          value: 'hard',
        },
        {
          label: 'Expert',
          value: 'expert',
        },
      ],
      admin: {
        description: 'Difficulty level of the machine/game',
      },
    },
    {
      name: 'manufacturer',
      type: 'text',
      required: false,
      index: true,
      admin: {
        description: 'Manufacturer of the machine (e.g., Stern, Raw Thrills)',
      },
    },
    {
      name: 'year',
      type: 'number',
      required: false,
      min: 1970,
      max: new Date().getFullYear() + 1,
      index: true,
      admin: {
        description: 'Year the machine was manufactured',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'operational',
      index: true,
      options: [
        {
          label: 'Operational',
          value: 'operational',
        },
        {
          label: 'Out of Order',
          value: 'broken',
        },
        {
          label: 'Under Maintenance',
          value: 'maintenance',
        },
        {
          label: 'Removed',
          value: 'removed',
        },
      ],
      admin: {
        description: 'Current operational status',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
      admin: {
        description: 'Description of the machine and gameplay',
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
      ],
      admin: {
        description: 'Official images of the machine',
      },
    },
    {
      name: 'pricing',
      type: 'group',
      fields: [
        {
          name: 'costPerPlay',
          type: 'number',
          required: false,
          min: 0,
          admin: {
            description: 'Cost per play in cents (e.g., 50 = $0.50)',
          },
        },
        {
          name: 'acceptsTokens',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether machine accepts arcade tokens',
          },
        },
        {
          name: 'acceptsCards',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether machine accepts arcade cards/tap to play',
          },
        },
      ],
      admin: {
        description: 'Pricing and payment information',
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
            description: 'Number of times machine details were viewed',
          },
        },
        {
          name: 'photoCount',
          type: 'number',
          defaultValue: 0,
          min: 0,
          index: true,
          admin: {
            description: 'Number of photos uploaded for this machine',
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
        description: 'Tags for categorizing and searching machines',
      },
    },
    {
      name: 'specifications',
      type: 'group',
      fields: [
        {
          name: 'players',
          type: 'select',
          options: [
            { label: 'Single Player', value: '1' },
            { label: '2 Players', value: '2' },
            { label: '4 Players', value: '4' },
            { label: '6+ Players', value: '6+' },
          ],
          admin: {
            description: 'Maximum number of simultaneous players',
          },
        },
        {
          name: 'dimensions',
          type: 'group',
          fields: [
            {
              name: 'width',
              type: 'number',
              admin: {
                description: 'Width in inches',
              },
            },
            {
              name: 'depth',
              type: 'number',
              admin: {
                description: 'Depth in inches',
              },
            },
            {
              name: 'height',
              type: 'number',
              admin: {
                description: 'Height in inches',
              },
            },
          ],
        },
      ],
      admin: {
        description: 'Technical specifications',
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