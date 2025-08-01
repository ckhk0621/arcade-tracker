import type { CollectionConfig } from 'payload'

export const Photos: CollectionConfig = {
  slug: 'photos',
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'uploadedBy', 'store', 'verificationStatus', 'pointsAwarded', 'createdAt'],
    listSearchableFields: ['alt', 'tags.tag'],
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Set verification status to pending for new photos
        if (operation === 'create' && !data.verificationStatus) {
          data.verificationStatus = 'pending'
        }
        
        // Set timestamp for real-time tracking
        data.lastModified = new Date()
        
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Award points when photo is verified
        if (operation === 'update' && doc.verificationStatus === 'verified' && doc.uploadedBy) {
          const pointsToAward = doc.pointsAwarded || 10
          
          try {
            // Fetch current user to get current points
            const currentUser = await req.payload.findByID({
              collection: 'users',
              id: doc.uploadedBy
            })
            
            const currentPoints = currentUser.points || 0
            
            await req.payload.update({
              collection: 'users',
              id: doc.uploadedBy,
              data: {
                points: currentPoints + pointsToAward
              }
            })
          } catch (error) {
            req.payload.logger.error('Failed to award points:', error)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Description of the photo for accessibility and search',
      },
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        description: 'User who uploaded this photo',
      },
    },
    {
      name: 'store',
      type: 'relationship',
      relationTo: 'stores',
      required: true,
      index: true,
      admin: {
        description: 'Store where this photo was taken',
      },
    },
    {
      name: 'machine',
      type: 'relationship',
      relationTo: 'machines',
      required: false,
      index: true,
      admin: {
        description: 'Specific machine featured in the photo (optional)',
      },
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'The uploaded photo file',
      },
    },
    {
      name: 'location',
      type: 'point',
      required: false,
      index: true,
      admin: {
        description: 'GPS coordinates where the photo was taken',
      },
    },
    {
      name: 'verificationStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        {
          label: 'Pending Review',
          value: 'pending',
        },
        {
          label: 'Verified',
          value: 'verified',
        },
        {
          label: 'Rejected',
          value: 'rejected',
        },
        {
          label: 'Flagged',
          value: 'flagged',
        },
      ],
      admin: {
        description: 'Moderation status of the photo',
      },
    },
    {
      name: 'pointsAwarded',
      type: 'number',
      required: false,
      defaultValue: 10,
      min: 0,
      max: 100,
      admin: {
        description: 'Points awarded for this photo (default: 10)',
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
        description: 'Tags for categorizing and searching photos',
      },
    },
    {
      name: 'metadata',
      type: 'group',
      fields: [
        {
          name: 'likes',
          type: 'number',
          defaultValue: 0,
          min: 0,
          index: true,
          admin: {
            description: 'Number of likes received',
          },
        },
        {
          name: 'views',
          type: 'number',
          defaultValue: 0,
          min: 0,
          index: true,
          admin: {
            description: 'Number of times photo was viewed',
          },
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          index: true,
          admin: {
            description: 'Mark as featured photo',
          },
        },
        {
          name: 'deviceInfo',
          type: 'group',
          fields: [
            {
              name: 'userAgent',
              type: 'text',
              admin: {
                description: 'Device/browser information',
              },
            },
            {
              name: 'resolution',
              type: 'text',
              admin: {
                description: 'Photo resolution (e.g., 1920x1080)',
              },
            },
          ],
        },
      ],
      admin: {
        description: 'Additional metadata for analytics and features',
      },
    },
    {
      name: 'moderationNotes',
      type: 'textarea',
      required: false,
      access: {
        read: ({ req: { user } }) => user?.role === 'admin',
        update: ({ req: { user } }) => user?.role === 'admin',
      },
      admin: {
        description: 'Internal moderation notes (admin only)',
        condition: (_, { user }) => user?.role === 'admin',
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